import { CompositeValue, List, ObjectLike } from "../../interface";
import { Node, Tree } from "@chainsafe/persistent-merkle-tree";
import { TreeBacked } from "../../backings";
import { HashObject } from "@chainsafe/as-sha256";
import { ContainerType, IContainerOptions } from "./container";
import { Type } from "../type";
export declare const CONTAINER_LEAF_NODE_STRUCT_TYPE: unique symbol;
export declare function isContainerLeafNodeStructType<T extends ObjectLike = ObjectLike>(type: Type<unknown>): type is ContainerLeafNodeStructType<T>;
/**
 * Container that when represented as a Tree its children's data is represented as a struct, not a tree.
 *
 * This approach is usefull for memory efficiency of data that is not modified often, for example the validators
 * registry in Ethereum consensus `state.validators`. The tradeoff is that getting the hash, are proofs is more
 * expensive because the tree has to be recreated every time.
 */
export declare class ContainerLeafNodeStructType<T extends ObjectLike = ObjectLike> extends ContainerType<T> {
    constructor(options: IContainerOptions);
    /** Method to allow the Node to merkelize the struct */
    toFullTree(value: T): Tree;
    /** Overrides to return BranchNodeStruct instead of regular Tree */
    createTreeBacked(tree: Tree): TreeBacked<T>;
    struct_convertToTree(value: T): Tree;
    tree_defaultNode(): Node;
    tree_convertToStruct(target: Tree): T;
    tree_deserializeFromBytes(data: Uint8Array, start: number, end: number): Tree;
    tree_serializeToBytes(target: Tree, output: Uint8Array, offset: number): number;
    tree_getProperty(target: Tree, property: PropertyKey): Tree | unknown;
    tree_setProperty(target: Tree, property: PropertyKey, value: Tree | unknown): boolean;
    tree_deleteProperty(target: Tree, prop: PropertyKey): boolean;
    tree_iterateValues(target: Tree): IterableIterator<Tree | unknown>;
    tree_readonlyIterateValues(target: Tree): IterableIterator<Tree | unknown>;
    tree_getValues(target: Tree): (Tree | unknown)[];
    tree_readonlyGetValues(target: Tree): (Tree | unknown)[];
}
/**
 * BranchNode whose children's data is represented as a struct, not a tree.
 *
 * This approach is usefull for memory efficiency of data that is not modified often, for example the validators
 * registry in Ethereum consensus `state.validators`. The tradeoff is that getting the hash, are proofs is more
 * expensive because the tree has to be recreated every time.
 */
export declare class BranchNodeStruct<T> extends Node {
    readonly type: ContainerLeafNodeStructType<T>;
    readonly value: T;
    constructor(type: ContainerLeafNodeStructType<T>, value: T);
    get rootHashObject(): HashObject;
    get root(): Uint8Array;
    isLeaf(): boolean;
    get left(): Node;
    get right(): Node;
    rebindLeft(left: Node): Node;
    rebindRight(right: Node): Node;
}
/**
 * Custom readonlyValues to return non-tree backed values, but the raw struct inside BranchNodeStruct nodes.
 *
 * This function allows very efficient reads and iteration over the entire validators registry in Lodestar.
 */
export declare function readonlyValuesListOfLeafNodeStruct<T extends CompositeValue>(objArr: List<T>): T[];
//# sourceMappingURL=containerLeafNodeStruct.d.ts.map