"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompositeType = exports.isCompositeType = exports.COMPOSITE_TYPE = void 0;
const backings_1 = require("../../backings");
const type_1 = require("../type");
const persistent_merkle_tree_1 = require("@chainsafe/persistent-merkle-tree");
const compat_1 = require("../../util/compat");
const byteArray_1 = require("../../util/byteArray");
exports.COMPOSITE_TYPE = Symbol.for("ssz/CompositeType");
function isCompositeType(type) {
    return type_1.isTypeOf(type, exports.COMPOSITE_TYPE);
}
exports.isCompositeType = isCompositeType;
/**
 * A CompositeType is a type containing other types, and is flexible in its representation.
 *
 */
class CompositeType extends type_1.Type {
    constructor() {
        super();
        this._typeSymbols.add(exports.COMPOSITE_TYPE);
    }
    tree_equals(tree1, tree2) {
        return byteArray_1.byteArrayEquals(tree1.root, tree2.root);
    }
    bytes_equals(bytes1, bytes2) {
        return byteArray_1.byteArrayEquals(bytes1, bytes2);
    }
    tree_defaultValue() {
        return new persistent_merkle_tree_1.Tree(this.tree_defaultNode());
    }
    tree_clone(value) {
        return value.clone();
    }
    bytes_clone(value, start = 0, end = value.length) {
        const bytes = new Uint8Array(end - start);
        value.subarray(start, end).set(bytes);
        return bytes;
    }
    struct_serialize(struct, data) {
        const output = new Uint8Array(this.struct_getSerializedLength(struct));
        return this.struct_serializeToBytes(struct, output, 0);
    }
    tree_serialize(tree, data) {
        const output = new Uint8Array(this.tree_getSerializedLength(tree));
        return this.tree_serializeToBytes(tree, output, 0);
    }
    bytes_validate(data, start, end, emptyOk) {
        if (!data) {
            throw new Error("Data is null or undefined");
        }
        if (data.length === 0 && !emptyOk) {
            throw new Error("Data is empty");
        }
        if (start < 0) {
            throw new Error(`Start param is negative: ${start}`);
        }
        if (start > data.length) {
            throw new Error(`Start param: ${start} is greater than length: ${data.length}`);
        }
        if (end < 0) {
            throw new Error(`End param is negative: ${end}`);
        }
        if (end > data.length) {
            throw new Error(`End param: ${end} is greater than length: ${data.length}`);
        }
        const length = end - start;
        const fixedLen = this.getFixedSerializedLength();
        if (fixedLen !== null && length !== fixedLen) {
            throw new Error(`Incorrect data length ${length}, expect ${fixedLen}`);
        }
        if (end - start < this.getMinSerializedLength()) {
            throw new Error(`Data length ${length} is too small, expect at least ${this.getMinSerializedLength()}`);
        }
    }
    struct_deserialize(data) {
        return this.struct_deserializeFromBytes(data, 0, data.length);
    }
    tree_deserialize(data) {
        return this.tree_deserializeFromBytes(data, 0, data.length);
    }
    struct_getChunkCount(struct) {
        return this.getMaxChunkCount();
    }
    tree_getChunkCount(target) {
        return this.getMaxChunkCount();
    }
    *struct_yieldChunkRoots(struct) {
        const chunkCount = this.struct_getChunkCount(struct);
        for (let i = 0; i < chunkCount; i++) {
            yield this.struct_getRootAtChunkIndex(struct, i);
        }
    }
    getChunkDepth() {
        if (!this._chunkDepth) {
            this._chunkDepth = persistent_merkle_tree_1.countToDepth(BigInt(this.getMaxChunkCount()));
        }
        return this._chunkDepth;
    }
    getGindexAtChunkIndex(index) {
        return persistent_merkle_tree_1.toGindex(this.getChunkDepth(), BigInt(index));
    }
    getGindexBitStringAtChunkIndex(index) {
        return persistent_merkle_tree_1.toGindexBitstring(this.getChunkDepth(), index);
    }
    tree_getSubtreeAtChunkIndex(target, index) {
        return target.getSubtree(this.getGindexBitStringAtChunkIndex(index));
    }
    tree_setSubtreeAtChunkIndex(target, index, value, expand = false) {
        target.setSubtree(this.getGindexBitStringAtChunkIndex(index), value, expand);
    }
    tree_getRootAtChunkIndex(target, index) {
        return target.getRoot(this.getGindexBitStringAtChunkIndex(index));
    }
    tree_setRootAtChunkIndex(target, index, value, expand = false) {
        target.setRoot(this.getGindexBitStringAtChunkIndex(index), value, expand);
    }
    /**
     * Navigate to a subtype & gindex using a path
     */
    getPathInfo(path) {
        const gindices = [];
        let type = this;
        for (const prop of path) {
            if (!isCompositeType(type)) {
                throw new Error("Invalid path: cannot navigate beyond a basic type");
            }
            gindices.push(type.getPropertyGindex(prop));
            type = type.getPropertyType(prop);
        }
        return {
            type,
            gindex: persistent_merkle_tree_1.concatGindices(gindices),
        };
    }
    getPathGindex(path) {
        return this.getPathInfo(path).gindex;
    }
    tree_createProof(target, paths) {
        const gindices = paths
            .map((path) => {
            const { type, gindex } = this.getPathInfo(path);
            if (!isCompositeType(type)) {
                return gindex;
            }
            else {
                // if the path subtype is composite, include the gindices of all the leaves
                return type.tree_getLeafGindices(type.hasVariableSerializedLength() ? target.getSubtree(gindex) : undefined, gindex);
            }
        })
            .flat(1);
        return target.getProof({
            type: persistent_merkle_tree_1.ProofType.treeOffset,
            gindices,
        });
    }
    tree_createFromProof(root, proof) {
        const tree = persistent_merkle_tree_1.Tree.createFromProof(proof);
        if (!byteArray_1.byteArrayEquals(tree.root, root)) {
            throw new Error("Proof does not match trusted root");
        }
        return tree;
    }
    tree_createFromProofUnsafe(proof) {
        return persistent_merkle_tree_1.Tree.createFromProof(proof);
    }
    struct_hashTreeRoot(struct) {
        return compat_1.merkleize(this.struct_yieldChunkRoots(struct), this.getMaxChunkCount());
    }
    tree_hashTreeRoot(tree) {
        return tree.root;
    }
    // convenience
    /**
     * Valid value assertion
     */
    assertValidValue(value) {
        this.struct_assertValidValue(value);
    }
    /**
     * Equality
     */
    equals(value1, value2) {
        if (backings_1.isBackedValue(value1) && backings_1.isBackedValue(value2)) {
            return value1.equals(value2);
        }
        else {
            return this.struct_equals(value1, value2);
        }
    }
    /**
     * Default constructor
     */
    defaultValue() {
        return this.struct_defaultValue();
    }
    /**
     * Clone / copy
     */
    clone(value) {
        if (backings_1.isBackedValue(value)) {
            return value.clone();
        }
        else {
            return this.struct_clone(value);
        }
    }
    // Serialization / Deserialization
    /**
     * Serialized byte length
     */
    size(value) {
        if (backings_1.isBackedValue(value)) {
            return value.size();
        }
        else {
            return this.struct_getSerializedLength(value);
        }
    }
    /**
     * Maximal serialized byte length
     */
    maxSize() {
        return this.getMaxSerializedLength();
    }
    /**
     * Minimal serialized byte length
     */
    minSize() {
        return this.getMinSerializedLength();
    }
    /**
     * Low-level deserialization
     */
    fromBytes(data, start, end) {
        return this.struct_deserializeFromBytes(data, start, end);
    }
    /**
     * Deserialization
     */
    deserialize(data) {
        return this.fromBytes(data, 0, data.length);
    }
    /**
     * Low-level serialization
     *
     * Serializes to a pre-allocated Uint8Array
     */
    toBytes(value, output, offset) {
        if (backings_1.isBackedValue(value)) {
            return value.toBytes(output, offset);
        }
        else {
            return this.struct_serializeToBytes(value, output, offset);
        }
    }
    /**
     * Serialization
     */
    serialize(value) {
        if (backings_1.isBackedValue(value)) {
            return value.serialize();
        }
        else {
            const output = new Uint8Array(this.size(value));
            this.toBytes(value, output, 0);
            return output;
        }
    }
    // Merkleization
    /**
     * Merkleization
     */
    hashTreeRoot(value) {
        if (backings_1.isBackedValue(value)) {
            return value.hashTreeRoot();
        }
        else {
            return this.struct_hashTreeRoot(value);
        }
    }
    /**
     * Convert from a JSON-serializable object
     */
    fromJson(data, options) {
        return this.struct_convertFromJson(data, options);
    }
    /**
     * Convert to a JSON-serializable object
     */
    toJson(value, options) {
        return this.struct_convertToJson(value, options);
    }
    createTreeBacked(tree) {
        return backings_1.createTreeBacked(this, tree);
    }
    createTreeBackedFromStruct(value) {
        return this.createTreeBacked(this.struct_convertToTree(value));
    }
    createTreeBackedFromBytes(data) {
        return this.createTreeBacked(this.tree_deserialize(data));
    }
    createTreeBackedFromJson(data, options) {
        return this.createTreeBackedFromStruct(this.struct_convertFromJson(data, options));
    }
    createTreeBackedFromProof(root, proof) {
        return this.createTreeBacked(this.tree_createFromProof(root, proof));
    }
    createTreeBackedFromProofUnsafe(proof) {
        return this.createTreeBacked(this.tree_createFromProofUnsafe(proof));
    }
    defaultTreeBacked() {
        return backings_1.createTreeBacked(this, this.tree_defaultValue());
    }
}
exports.CompositeType = CompositeType;
//# sourceMappingURL=abstract.js.map