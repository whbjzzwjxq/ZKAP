"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompositeListType = exports.Number64ListType = exports.BasicListType = exports.ListType = exports.isListType = exports.LIST_TYPE = exports.LENGTH_GINDEX = void 0;
const array_1 = require("./array");
const basic_1 = require("../basic");
const type_1 = require("../type");
const compat_1 = require("../../util/compat");
const hash_1 = require("../../util/hash");
const persistent_merkle_tree_1 = require("@chainsafe/persistent-merkle-tree");
const treeValue_1 = require("../../backings/tree/treeValue");
/**
 * SSZ Lists (variable-length arrays) include the length of the list in the tree
 * This length is always in the same index in the tree
 * ```
 *   1
 *  / \
 * 2   3 // <-here
 * ```
 */
exports.LENGTH_GINDEX = BigInt(3);
exports.LIST_TYPE = Symbol.for("ssz/ListType");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isListType(type) {
    return type_1.isTypeOf(type, exports.LIST_TYPE);
}
exports.isListType = isListType;
// Trick typescript into treating ListType as a constructor
exports.ListType = 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ListType(options) {
    if (basic_1.isNumber64UintType(options.elementType)) {
        return new Number64ListType(options);
    }
    else if (basic_1.isBasicType(options.elementType)) {
        return new BasicListType(options);
    }
    else {
        return new CompositeListType(options);
    }
};
class BasicListType extends array_1.BasicArrayType {
    constructor(options) {
        super(options);
        this.limit = options.limit;
        this._typeSymbols.add(exports.LIST_TYPE);
    }
    struct_defaultValue() {
        return [];
    }
    struct_getLength(value) {
        return value.length;
    }
    getMaxLength() {
        return this.limit;
    }
    getMinLength() {
        return 0;
    }
    bytes_validate(data, start, end) {
        super.bytes_validate(data, start, end, true);
        const length = end - start;
        if (length > this.getMaxSerializedLength()) {
            throw new Error(`Deserialized list length of ${length} is greater than limit ${this.getMaxSerializedLength()}`);
        }
        // make sure we can consume all of the data, or the generic spec test ComplexTestStruct_offset_7_plus_one failed
        if (length % this.elementType.getFixedSerializedLength() !== 0) {
            throw new Error(`Cannot consume ${length} bytes, element length ${this.elementType.getFixedSerializedLength()}`);
        }
    }
    struct_deserializeFromBytes(data, start, end) {
        this.bytes_validate(data, start, end);
        return super.struct_deserializeFromBytes(data, start, end, true);
    }
    struct_getChunkCount(value) {
        return Math.ceil((value.length * this.elementType.struct_getSerializedLength()) / 32);
    }
    struct_hashTreeRoot(value) {
        return compat_1.mixInLength(super.struct_hashTreeRoot(value), value.length);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    struct_convertFromJson(data, options) {
        if (!Array.isArray(data)) {
            throw new Error("Invalid JSON list: expected an Array");
        }
        const maxLength = this.limit;
        if (data.length > maxLength) {
            throw new Error(`Invalid JSON list: length ${data.length} greater than limit ${maxLength}`);
        }
        return super.struct_convertFromJson(data);
    }
    struct_convertToTree(value) {
        if (treeValue_1.isTreeBacked(value))
            return value.tree.clone();
        const tree = super.struct_convertToTree(value);
        this.tree_setLength(tree, value.length);
        return tree;
    }
    tree_defaultNode() {
        if (!this._defaultNode) {
            this._defaultNode = new persistent_merkle_tree_1.BranchNode(persistent_merkle_tree_1.zeroNode(super.getChunkDepth()), persistent_merkle_tree_1.zeroNode(0));
        }
        return this._defaultNode;
    }
    tree_defaultValue() {
        return new persistent_merkle_tree_1.Tree(this.tree_defaultNode());
    }
    tree_getLength(target) {
        return basic_1.number32Type.struct_deserializeFromBytes(target.getRoot(exports.LENGTH_GINDEX), 0);
    }
    tree_setLength(target, length) {
        const chunk = new Uint8Array(32);
        basic_1.number32Type.toBytes(length, chunk, 0);
        target.setRoot(exports.LENGTH_GINDEX, chunk);
    }
    tree_deserializeFromBytes(data, start, end) {
        const length = (end - start) / this.elementType.struct_getSerializedLength();
        if (!Number.isSafeInteger(length)) {
            throw new Error("Deserialized list byte length must be divisible by element size");
        }
        if (length > this.limit) {
            throw new Error("Deserialized list length greater than limit");
        }
        const value = super.tree_deserializeFromBytes(data, start, end);
        this.tree_setLength(value, length);
        return value;
    }
    tree_getChunkCount(target) {
        return Math.ceil((this.tree_getLength(target) * this.elementType.struct_getSerializedLength()) / 32);
    }
    getChunkDepth() {
        return super.getChunkDepth() + 1;
    }
    tree_setProperty(target, property, value) {
        const length = this.tree_getLength(target);
        if (property > length) {
            throw new Error("Invalid length index");
        }
        else if (property == length) {
            this.tree_pushSingle(target, value);
            return true;
        }
        else {
            return this.tree_setValueAtIndex(target, property, value);
        }
    }
    tree_deleteProperty(target, property) {
        const length = this.tree_getLength(target);
        if (property > length) {
            throw new Error("Invalid length index");
        }
        else if (property == length) {
            this.tree_pop(target);
            return true;
        }
        else {
            return super.tree_deleteProperty(target, property);
        }
    }
    tree_pushSingle(target, value) {
        const length = this.tree_getLength(target);
        const expand = this.getChunkIndex(length) != this.getChunkIndex(length + 1);
        this.tree_setValueAtIndex(target, length, value, expand);
        this.tree_setLength(target, length + 1);
        return length + 1;
    }
    tree_push(target, ...values) {
        let newLength;
        for (const value of values)
            newLength = this.tree_pushSingle(target, value);
        return newLength || this.tree_getLength(target);
    }
    tree_pop(target) {
        const length = this.tree_getLength(target);
        const value = this.tree_getProperty(target, length - 1);
        super.tree_deleteProperty(target, length - 1);
        this.tree_setLength(target, length - 1);
        return value;
    }
    hasVariableSerializedLength() {
        return true;
    }
    getFixedSerializedLength() {
        return null;
    }
    getMaxChunkCount() {
        return Math.ceil((this.limit * this.elementType.size()) / 32);
    }
    tree_getLeafGindices(target, root = BigInt(1)) {
        if (!target) {
            throw new Error("variable type requires tree argument to get leaves");
        }
        const gindices = super.tree_getLeafGindices(target, root);
        // include the length chunk
        gindices.push(persistent_merkle_tree_1.concatGindices([root, exports.LENGTH_GINDEX]));
        return gindices;
    }
}
exports.BasicListType = BasicListType;
/** For Number64UintType, it takes 64 / 8 = 8 bytes per item, each chunk has 32 bytes = 4 items */
const NUMBER64_LIST_NUM_ITEMS_PER_CHUNK = 4;
/**
 * An optimization for Number64 using HashObject and new method to work with deltas.
 */
class Number64ListType extends BasicListType {
    constructor(options) {
        super(options);
    }
    /** @override */
    tree_getValueAtIndex(target, index) {
        const chunkGindex = this.getGindexAtChunkIndex(this.getChunkIndex(index));
        const hashObject = target.getHashObject(chunkGindex);
        // 4 items per chunk
        const offsetInChunk = (index % 4) * 8;
        return this.elementType.struct_deserializeFromHashObject(hashObject, offsetInChunk);
    }
    /** @override */
    tree_setValueAtIndex(target, index, value, expand = false) {
        const chunkGindex = this.getGindexAtChunkIndex(this.getChunkIndex(index));
        const hashObject = hash_1.cloneHashObject(target.getHashObject(chunkGindex));
        // 4 items per chunk
        const offsetInChunk = (index % 4) * 8;
        this.elementType.struct_serializeToHashObject(value, hashObject, offsetInChunk);
        target.setHashObject(chunkGindex, hashObject, expand);
        return true;
    }
    /**
     * delta > 0 increments the underlying value, delta < 0 decrements the underlying value
     * returns the new value
     **/
    tree_applyDeltaAtIndex(target, index, delta) {
        const chunkGindex = this.getGindexAtChunkIndex(this.getChunkIndex(index));
        // 4 items per chunk
        const offsetInChunk = (index % 4) * 8;
        let value = 0;
        const hashObjectFn = (hashObject) => {
            const newHashObject = hash_1.cloneHashObject(hashObject);
            value = this.elementType.struct_deserializeFromHashObject(newHashObject, offsetInChunk);
            value += delta;
            if (value < 0)
                value = 0;
            this.elementType.struct_serializeToHashObject(value, newHashObject, offsetInChunk);
            return newHashObject;
        };
        // it's 1.8x faster to use setHashObjectFn instead of getHashObject and setHashObject
        target.setHashObjectFn(chunkGindex, hashObjectFn);
        return value;
    }
    /**
     * The same to tree_applyUint64Delta but we do it in batch.
     * returns the new value
     **/
    tree_applyDeltaInBatch(target, deltaByIndex) {
        // work on the new tree to avoid the hook
        const newTree = target.clone();
        const newValues = [];
        for (const [index, delta] of deltaByIndex.entries()) {
            this.tree_applyDeltaAtIndex(newTree, index, delta);
        }
        // update target, the hook should run 1 time only
        target.rootNode = newTree.rootNode;
        return newValues;
    }
    /**
     * delta > 0 means an increasement, delta < 0 means a decreasement
     * returns the new tree and new values
     **/
    tree_newTreeFromDeltas(target, deltas) {
        if (deltas.length !== this.tree_getLength(target)) {
            throw new Error(`Expect delta length ${this.tree_getLength(target)}, actual ${deltas.length}`);
        }
        const chunkDepth = this.getChunkDepth();
        const length = deltas.length;
        let nodeIdx = 0;
        const newLeafNodes = [];
        const newValues = [];
        const chunkCount = Math.ceil(length / NUMBER64_LIST_NUM_ITEMS_PER_CHUNK);
        const currentNodes = target.getNodesAtDepth(chunkDepth, 0, chunkCount);
        for (let i = 0; i < currentNodes.length; i++) {
            const node = currentNodes[i];
            const hashObject = hash_1.cloneHashObject(node);
            for (let offset = 0; offset < NUMBER64_LIST_NUM_ITEMS_PER_CHUNK; offset++) {
                const index = nodeIdx * NUMBER64_LIST_NUM_ITEMS_PER_CHUNK + offset;
                if (index >= length)
                    break;
                let value = this.elementType.struct_deserializeFromHashObject(hashObject, offset * 8) + deltas[index];
                if (value < 0)
                    value = 0;
                newValues.push(value);
                // mutate hashObject at offset
                this.elementType.struct_serializeToHashObject(value, hashObject, offset * 8);
            }
            newLeafNodes.push(new persistent_merkle_tree_1.LeafNode(hashObject));
            nodeIdx++;
        }
        const newRootNode = persistent_merkle_tree_1.subtreeFillToContents(newLeafNodes, chunkDepth);
        return [new persistent_merkle_tree_1.Tree(newRootNode), newValues];
    }
}
exports.Number64ListType = Number64ListType;
class CompositeListType extends array_1.CompositeArrayType {
    constructor(options) {
        super(options);
        this.limit = options.limit;
        this._typeSymbols.add(exports.LIST_TYPE);
    }
    hasVariableSerializedLength() {
        return true;
    }
    getFixedSerializedLength() {
        return null;
    }
    getMaxChunkCount() {
        return this.limit;
    }
    struct_defaultValue() {
        return [];
    }
    struct_getLength(value) {
        return value.length;
    }
    getMaxLength() {
        return this.limit;
    }
    getMinLength() {
        return 0;
    }
    struct_deserializeFromBytes(data, start, end) {
        this.bytes_validate(data, start, end, true);
        const value = super.struct_deserializeFromBytes(data, start, end, true);
        if (value.length > this.limit) {
            throw new Error(`Deserialized list length greater than limit: ${value.length} ${this.limit}`);
        }
        return value;
    }
    struct_getChunkCount(value) {
        return value.length;
    }
    struct_hashTreeRoot(value) {
        return compat_1.mixInLength(super.struct_hashTreeRoot(value), value.length);
    }
    struct_convertFromJson(data, options) {
        if (!Array.isArray(data)) {
            throw new Error("Invalid JSON list: expected an Array");
        }
        const maxLength = this.limit;
        if (data.length > maxLength) {
            throw new Error(`Invalid JSON list: length ${data.length} greater than limit ${maxLength}`);
        }
        return super.struct_convertFromJson(data, options);
    }
    tree_defaultNode() {
        if (!this._defaultNode) {
            this._defaultNode = new persistent_merkle_tree_1.BranchNode(persistent_merkle_tree_1.zeroNode(super.getChunkDepth()), persistent_merkle_tree_1.zeroNode(0));
        }
        return this._defaultNode;
    }
    tree_defaultValue() {
        return new persistent_merkle_tree_1.Tree(this.tree_defaultNode());
    }
    struct_convertToTree(value) {
        if (treeValue_1.isTreeBacked(value))
            return value.tree.clone();
        const tree = super.struct_convertToTree(value);
        this.tree_setLength(tree, value.length);
        return tree;
    }
    tree_getLength(target) {
        return basic_1.number32Type.struct_deserializeFromBytes(target.getRoot(exports.LENGTH_GINDEX), 0);
    }
    tree_setLength(target, length) {
        const chunk = new Uint8Array(32);
        basic_1.number32Type.struct_serializeToBytes(length, chunk, 0);
        target.setRoot(exports.LENGTH_GINDEX, chunk);
    }
    tree_deserializeFromBytes(data, start, end) {
        const target = this.tree_defaultValue();
        const fixedLen = this.elementType.getFixedSerializedLength();
        if (fixedLen === null) {
            const offsets = this.bytes_getVariableOffsets(new Uint8Array(data.buffer, data.byteOffset + start, end - start));
            if (offsets.length > this.limit) {
                throw new Error("Deserialized list length greater than limit");
            }
            for (let i = 0; i < offsets.length; i++) {
                const [currentOffset, nextOffset] = offsets[i];
                this.tree_setSubtreeAtChunkIndex(target, i, this.elementType.tree_deserializeFromBytes(data, start + currentOffset, start + nextOffset));
            }
            this.tree_setLength(target, offsets.length);
        }
        else {
            const elementSize = fixedLen;
            const length = (end - start) / elementSize;
            if (!Number.isSafeInteger(length)) {
                throw new Error("Deserialized list byte length must be divisible by element size");
            }
            if (length > this.limit) {
                throw new Error("Deserialized list length greater than limit");
            }
            for (let i = 0; i < length; i++) {
                this.tree_setSubtreeAtChunkIndex(target, i, this.elementType.tree_deserializeFromBytes(data, start + i * elementSize, start + (i + 1) * elementSize), true // expand tree as needed
                );
            }
            this.tree_setLength(target, length);
        }
        return target;
    }
    tree_getChunkCount(target) {
        return this.tree_getLength(target);
    }
    getChunkDepth() {
        return super.getChunkDepth() + 1;
    }
    tree_setProperty(target, property, value) {
        const length = this.tree_getLength(target);
        if (property > length) {
            throw new Error("Invalid length index");
        }
        else if (property == length) {
            this.tree_pushSingle(target, value);
        }
        else {
            this.tree_setSubtreeAtChunkIndex(target, property, value);
        }
        return true;
    }
    tree_deleteProperty(target, property) {
        const length = this.tree_getLength(target);
        if (property > length) {
            throw new Error("Invalid length index");
        }
        else if (property == length) {
            this.tree_pop(target);
            return true;
        }
        else {
            return super.tree_deleteProperty(target, property);
        }
    }
    tree_pushSingle(target, value) {
        const length = this.tree_getLength(target);
        this.tree_setSubtreeAtChunkIndex(target, length, value, true);
        this.tree_setLength(target, length + 1);
        return length + 1;
    }
    tree_push(target, ...values) {
        let newLength;
        for (const value of values)
            newLength = this.tree_pushSingle(target, value);
        return newLength || this.tree_getLength(target);
    }
    tree_pop(target) {
        const length = this.tree_getLength(target);
        const value = this.tree_getProperty(target, length - 1);
        this.tree_setSubtreeAtChunkIndex(target, length - 1, new persistent_merkle_tree_1.Tree(persistent_merkle_tree_1.zeroNode(0)));
        this.tree_setLength(target, length - 1);
        return value;
    }
    tree_getLeafGindices(target, root = BigInt(1)) {
        if (!target) {
            throw new Error("variable type requires tree argument to get leaves");
        }
        const gindices = super.tree_getLeafGindices(target, root);
        // include the length chunk
        gindices.push(persistent_merkle_tree_1.concatGindices([root, exports.LENGTH_GINDEX]));
        return gindices;
    }
}
exports.CompositeListType = CompositeListType;
//# sourceMappingURL=list.js.map