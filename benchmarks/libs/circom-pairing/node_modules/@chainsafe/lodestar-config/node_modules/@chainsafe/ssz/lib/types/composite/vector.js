"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompositeVectorType = exports.BasicVectorType = exports.VectorType = exports.isVectorType = exports.VECTOR_TYPE = void 0;
const array_1 = require("./array");
const basic_1 = require("../basic");
const type_1 = require("../type");
const persistent_merkle_tree_1 = require("@chainsafe/persistent-merkle-tree");
exports.VECTOR_TYPE = Symbol.for("ssz/VectorType");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isVectorType(type) {
    return type_1.isTypeOf(type, exports.VECTOR_TYPE);
}
exports.isVectorType = isVectorType;
// Trick typescript into treating VectorType as a constructor
exports.VectorType = 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function VectorType(options) {
    if (basic_1.isBasicType(options.elementType)) {
        return new BasicVectorType(options);
    }
    else {
        return new CompositeVectorType(options);
    }
};
class BasicVectorType extends array_1.BasicArrayType {
    constructor(options) {
        super(options);
        this.length = options.length;
        this._typeSymbols.add(exports.VECTOR_TYPE);
    }
    struct_defaultValue() {
        return Array.from({ length: this.length }, () => {
            return this.elementType.struct_defaultValue();
        });
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    struct_getLength(value) {
        return this.length;
    }
    getMaxLength() {
        return this.length;
    }
    getMinLength() {
        return this.length;
    }
    bytes_validate(data, start, end) {
        super.bytes_validate(data, start, end);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (end - start !== this.size(null)) {
            throw new Error("Incorrect deserialized vector length");
        }
    }
    struct_deserializeFromBytes(data, start, end) {
        this.bytes_validate(data, start, end);
        return super.struct_deserializeFromBytes(data, start, end);
    }
    struct_assertValidValue(value) {
        const actualLength = value.length;
        const expectedLength = this.struct_getLength(value);
        if (actualLength !== expectedLength) {
            throw new Error(`Invalid vector length: expected ${expectedLength}, actual ${actualLength}`);
        }
        super.struct_assertValidValue(value);
    }
    struct_convertFromJson(data) {
        if (!Array.isArray(data)) {
            throw new Error("Invalid JSON vector: expected an Array");
        }
        const expectedLength = this.length;
        if (data.length !== expectedLength) {
            throw new Error(`Invalid JSON vector length: expected ${expectedLength}, actual ${data.length}`);
        }
        return super.struct_convertFromJson(data);
    }
    tree_defaultNode() {
        if (!this._defaultNode) {
            this._defaultNode = persistent_merkle_tree_1.subtreeFillToLength(persistent_merkle_tree_1.zeroNode(0), this.getChunkDepth(), this.getMaxChunkCount());
        }
        return this._defaultNode;
    }
    tree_defaultValue() {
        return new persistent_merkle_tree_1.Tree(this.tree_defaultNode());
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    tree_getLength(target) {
        return this.length;
    }
    tree_deserializeFromBytes(data, start, end) {
        const fixedLen = this.getFixedSerializedLength();
        if (end - start !== fixedLen) {
            throw new Error("Incorrect deserialized vector length");
        }
        return super.tree_deserializeFromBytes(data, start, end);
    }
    tree_setProperty(target, property, value) {
        if (property >= this.tree_getLength(target)) {
            throw new Error("Invalid array index");
        }
        return super.tree_setProperty(target, property, value, false);
    }
    hasVariableSerializedLength() {
        return false;
    }
    getFixedSerializedLength() {
        return this.length * this.elementType.size();
    }
    getMaxChunkCount() {
        return Math.ceil((this.length * this.elementType.size()) / 32);
    }
}
exports.BasicVectorType = BasicVectorType;
class CompositeVectorType extends array_1.CompositeArrayType {
    constructor(options) {
        super(options);
        this.length = options.length;
        this._typeSymbols.add(exports.VECTOR_TYPE);
    }
    struct_defaultValue() {
        return Array.from({ length: this.length }, () => {
            return this.elementType.struct_defaultValue();
        });
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    struct_getLength(value) {
        return this.length;
    }
    getMaxLength() {
        return this.length;
    }
    getMinLength() {
        return this.length;
    }
    struct_deserializeFromBytes(data, start, end) {
        this.bytes_validate(data, start, end);
        const value = super.struct_deserializeFromBytes(data, start, end);
        if (value.length !== this.length) {
            throw new Error("Incorrect deserialized vector length");
        }
        return value;
    }
    struct_assertValidValue(value) {
        const actualLength = value.length;
        const expectedLength = this.struct_getLength(value);
        if (actualLength !== expectedLength) {
            throw new Error(`Invalid vector length: expected ${expectedLength}, actual ${actualLength}`);
        }
        super.struct_assertValidValue(value);
    }
    struct_convertFromJson(data) {
        if (!Array.isArray(data)) {
            throw new Error("Invalid JSON vector: expected an Array");
        }
        const expectedLength = this.length;
        if (data.length !== expectedLength) {
            throw new Error(`Invalid JSON vector length: expected ${expectedLength}, actual ${data.length}`);
        }
        return super.struct_convertFromJson(data);
    }
    tree_defaultNode() {
        if (!this._defaultNode) {
            this._defaultNode = persistent_merkle_tree_1.subtreeFillToLength(this.elementType.tree_defaultNode(), this.getChunkDepth(), this.length);
        }
        return this._defaultNode;
    }
    tree_defaultValue() {
        return new persistent_merkle_tree_1.Tree(this.tree_defaultNode());
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    tree_getLength(target) {
        return this.length;
    }
    tree_deserializeFromBytes(data, start, end) {
        const target = this.tree_defaultValue();
        const fixedLen = this.elementType.getFixedSerializedLength();
        if (fixedLen === null) {
            const offsets = this.bytes_getVariableOffsets(new Uint8Array(data.buffer, data.byteOffset + start, end - start));
            if (offsets.length !== this.length) {
                throw new Error("Incorrect deserialized vector length");
            }
            for (let i = 0; i < offsets.length; i++) {
                const [currentOffset, nextOffset] = offsets[i];
                this.tree_setSubtreeAtChunkIndex(target, i, this.elementType.tree_deserializeFromBytes(data, start + currentOffset, start + nextOffset));
            }
        }
        else {
            const elementSize = fixedLen;
            const length = (end - start) / elementSize;
            if (length !== this.length) {
                throw new Error("Incorrect deserialized vector length");
            }
            for (let i = 0; i < length; i++) {
                this.tree_setSubtreeAtChunkIndex(target, i, this.elementType.tree_deserializeFromBytes(data, start + i * elementSize, start + (i + 1) * elementSize));
            }
        }
        return target;
    }
    setProperty(target, property, value) {
        if (property >= this.tree_getLength(target)) {
            throw new Error("Invalid array index");
        }
        return super.tree_setProperty(target, property, value, false);
    }
    hasVariableSerializedLength() {
        return this.elementType.hasVariableSerializedLength();
    }
    getFixedSerializedLength() {
        const elementFixedLen = this.elementType.getFixedSerializedLength();
        if (elementFixedLen === null) {
            return null;
        }
        else {
            return this.length * elementFixedLen;
        }
    }
    getMaxChunkCount() {
        return this.length;
    }
}
exports.CompositeVectorType = CompositeVectorType;
//# sourceMappingURL=vector.js.map