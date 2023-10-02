"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readonlyValuesListOfLeafNodeStruct = exports.BranchNodeStruct = exports.ContainerLeafNodeStructType = exports.isContainerLeafNodeStructType = exports.CONTAINER_LEAF_NODE_STRUCT_TYPE = void 0;
const persistent_merkle_tree_1 = require("@chainsafe/persistent-merkle-tree");
const treeValue_1 = require("../../backings/tree/treeValue");
const container_1 = require("./container");
const type_1 = require("../type");
exports.CONTAINER_LEAF_NODE_STRUCT_TYPE = Symbol.for("ssz/ContainerLeafNodeStructType");
function isContainerLeafNodeStructType(type) {
    return type_1.isTypeOf(type, exports.CONTAINER_LEAF_NODE_STRUCT_TYPE);
}
exports.isContainerLeafNodeStructType = isContainerLeafNodeStructType;
/**
 * Container that when represented as a Tree its children's data is represented as a struct, not a tree.
 *
 * This approach is usefull for memory efficiency of data that is not modified often, for example the validators
 * registry in Ethereum consensus `state.validators`. The tradeoff is that getting the hash, are proofs is more
 * expensive because the tree has to be recreated every time.
 */
class ContainerLeafNodeStructType extends container_1.ContainerType {
    constructor(options) {
        super(options);
        this._typeSymbols.add(exports.CONTAINER_LEAF_NODE_STRUCT_TYPE);
    }
    /** Method to allow the Node to merkelize the struct */
    toFullTree(value) {
        return super.struct_convertToTree(value);
    }
    /** Overrides to return BranchNodeStruct instead of regular Tree */
    createTreeBacked(tree) {
        const value = new treeValue_1.ContainerLeafNodeStructTreeValue(this, tree);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return new Proxy(value, treeValue_1.TreeProxyHandler);
    }
    // struct_defaultValue   -> these comments acknowledge that this functions do not need to be overwritten
    // struct_getSerializedLength
    // getMaxSerializedLength
    // getMinSerializedLength
    // struct_assertValidValue
    // struct_equals
    // struct_clone
    // struct_deserializeFromBytes
    // struct_serializeToBytes
    // struct_getRootAtChunkIndex
    // struct_convertFromJson
    // struct_convertToJson
    struct_convertToTree(value) {
        const node = new BranchNodeStruct(this, value);
        return new persistent_merkle_tree_1.Tree(node);
    }
    // struct_convertToTree
    // struct_getPropertyNames
    // bytes_getVariableOffsets
    tree_defaultNode() {
        return new BranchNodeStruct(this, this.struct_defaultValue());
    }
    tree_convertToStruct(target) {
        return target.rootNode.value;
    }
    // tree_getSerializedLength
    tree_deserializeFromBytes(data, start, end) {
        const value = this.struct_deserializeFromBytes(data, start, end);
        const node = new BranchNodeStruct(this, value);
        return new persistent_merkle_tree_1.Tree(node);
    }
    tree_serializeToBytes(target, output, offset) {
        const { value } = target.rootNode;
        return this.struct_serializeToBytes(value, output, offset);
    }
    // getPropertyGindex
    // getPropertyType
    // tree_getPropertyNames
    tree_getProperty(target, property) {
        return target.rootNode.value[property];
    }
    tree_setProperty(target, property, value) {
        const { value: prevNodeValue } = target.rootNode;
        // TODO: Should this check for valid field name? Benchmark the cost
        const newNodeValue = { ...prevNodeValue, [property]: value };
        target.rootNode = new BranchNodeStruct(this, newNodeValue);
        return true;
    }
    tree_deleteProperty(target, prop) {
        const chunkIndex = Object.keys(this.fields).findIndex((fieldName) => fieldName === prop);
        if (chunkIndex === -1) {
            throw new Error("Invalid container field name");
        }
        const fieldType = this.fields[prop];
        return this.tree_setProperty(target, prop, fieldType.struct_defaultValue());
    }
    *tree_iterateValues(target) {
        yield* Object.values(target.rootNode.value);
    }
    *tree_readonlyIterateValues(target) {
        yield* this.tree_iterateValues(target);
    }
    tree_getValues(target) {
        return Array.from(Object.values(target.rootNode.value));
    }
    tree_readonlyGetValues(target) {
        return this.tree_getValues(target);
    }
}
exports.ContainerLeafNodeStructType = ContainerLeafNodeStructType;
/**
 * BranchNode whose children's data is represented as a struct, not a tree.
 *
 * This approach is usefull for memory efficiency of data that is not modified often, for example the validators
 * registry in Ethereum consensus `state.validators`. The tradeoff is that getting the hash, are proofs is more
 * expensive because the tree has to be recreated every time.
 */
class BranchNodeStruct extends persistent_merkle_tree_1.Node {
    constructor(type, value) {
        super();
        this.type = type;
        this.value = value;
    }
    get rootHashObject() {
        if (this.h0 === null) {
            const tree = this.type.toFullTree(this.value);
            super.applyHash(tree.rootNode.rootHashObject);
        }
        return this;
    }
    get root() {
        return persistent_merkle_tree_1.hashObjectToUint8Array(this.rootHashObject);
    }
    isLeaf() {
        return false;
    }
    get left() {
        const tree = this.type.toFullTree(this.value);
        return tree.rootNode.left;
    }
    get right() {
        const tree = this.type.toFullTree(this.value);
        return tree.rootNode.right;
    }
    rebindLeft(left) {
        return new persistent_merkle_tree_1.BranchNode(left, this.right);
    }
    rebindRight(right) {
        return new persistent_merkle_tree_1.BranchNode(this.left, right);
    }
}
exports.BranchNodeStruct = BranchNodeStruct;
/**
 * Custom readonlyValues to return non-tree backed values, but the raw struct inside BranchNodeStruct nodes.
 *
 * This function allows very efficient reads and iteration over the entire validators registry in Lodestar.
 */
function readonlyValuesListOfLeafNodeStruct(objArr) {
    const treeValue = objArr;
    const { tree, type } = treeValue;
    const nodes = tree.getNodesAtDepth(type.getChunkDepth(), 0, type.tree_getChunkCount(tree));
    const values = [];
    for (let i = 0, len = nodes.length; i < len; i++) {
        const value = nodes[i].value;
        if (value === undefined) {
            throw Error("node is not a BranchNodeStruct");
        }
        values.push(value);
    }
    return values;
}
exports.readonlyValuesListOfLeafNodeStruct = readonlyValuesListOfLeafNodeStruct;
//# sourceMappingURL=containerLeafNodeStruct.js.map