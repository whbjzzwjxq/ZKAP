import { Json, List } from "../../interface";
import { IArrayOptions, BasicArrayType, CompositeArrayType } from "./array";
import { IJsonOptions, Type } from "../type";
import { Gindex, Node, Tree } from "@chainsafe/persistent-merkle-tree";
/**
 * SSZ Lists (variable-length arrays) include the length of the list in the tree
 * This length is always in the same index in the tree
 * ```
 *   1
 *  / \
 * 2   3 // <-here
 * ```
 */
export declare const LENGTH_GINDEX: bigint;
export interface IListOptions extends IArrayOptions {
    limit: number;
}
export declare type ListType<T extends List<any> = List<any>> = BasicListType<T> | CompositeListType<T>;
declare type ListTypeConstructor = {
    new <T extends List<any>>(options: IListOptions): ListType<T>;
};
export declare const LIST_TYPE: unique symbol;
export declare function isListType<T extends List<any> = List<any>>(type: Type<unknown>): type is ListType<T>;
export declare const ListType: ListTypeConstructor;
export declare class BasicListType<T extends List<unknown> = List<unknown>> extends BasicArrayType<T> {
    limit: number;
    constructor(options: IListOptions);
    struct_defaultValue(): T;
    struct_getLength(value: T): number;
    getMaxLength(): number;
    getMinLength(): number;
    bytes_validate(data: Uint8Array, start: number, end: number): void;
    struct_deserializeFromBytes(data: Uint8Array, start: number, end: number): T;
    struct_getChunkCount(value: T): number;
    struct_hashTreeRoot(value: T): Uint8Array;
    struct_convertFromJson(data: Json, options?: IJsonOptions): T;
    struct_convertToTree(value: T): Tree;
    tree_defaultNode(): Node;
    tree_defaultValue(): Tree;
    tree_getLength(target: Tree): number;
    tree_setLength(target: Tree, length: number): void;
    tree_deserializeFromBytes(data: Uint8Array, start: number, end: number): Tree;
    tree_getChunkCount(target: Tree): number;
    getChunkDepth(): number;
    tree_setProperty(target: Tree, property: number, value: T[number]): boolean;
    tree_deleteProperty(target: Tree, property: number): boolean;
    tree_pushSingle(target: Tree, value: T[number]): number;
    tree_push(target: Tree, ...values: T[number][]): number;
    tree_pop(target: Tree): T[number];
    hasVariableSerializedLength(): boolean;
    getFixedSerializedLength(): null | number;
    getMaxChunkCount(): number;
    tree_getLeafGindices(target?: Tree, root?: Gindex): Gindex[];
}
/**
 * An optimization for Number64 using HashObject and new method to work with deltas.
 */
export declare class Number64ListType<T extends List<number> = List<number>> extends BasicListType<T> {
    constructor(options: IListOptions);
    /** @override */
    tree_getValueAtIndex(target: Tree, index: number): number;
    /** @override */
    tree_setValueAtIndex(target: Tree, index: number, value: number, expand?: boolean): boolean;
    /**
     * delta > 0 increments the underlying value, delta < 0 decrements the underlying value
     * returns the new value
     **/
    tree_applyDeltaAtIndex(target: Tree, index: number, delta: number): number;
    /**
     * The same to tree_applyUint64Delta but we do it in batch.
     * returns the new value
     **/
    tree_applyDeltaInBatch(target: Tree, deltaByIndex: Map<number, number>): number[];
    /**
     * delta > 0 means an increasement, delta < 0 means a decreasement
     * returns the new tree and new values
     **/
    tree_newTreeFromDeltas(target: Tree, deltas: number[]): [Tree, number[]];
}
export declare class CompositeListType<T extends List<unknown> = List<unknown>> extends CompositeArrayType<T> {
    limit: number;
    constructor(options: IListOptions);
    hasVariableSerializedLength(): boolean;
    getFixedSerializedLength(): null | number;
    getMaxChunkCount(): number;
    struct_defaultValue(): T;
    struct_getLength(value: T): number;
    getMaxLength(): number;
    getMinLength(): number;
    struct_deserializeFromBytes(data: Uint8Array, start: number, end: number): T;
    struct_getChunkCount(value: T): number;
    struct_hashTreeRoot(value: T): Uint8Array;
    struct_convertFromJson(data: Json, options?: IJsonOptions): T;
    tree_defaultNode(): Node;
    tree_defaultValue(): Tree;
    struct_convertToTree(value: T): Tree;
    tree_getLength(target: Tree): number;
    tree_setLength(target: Tree, length: number): void;
    tree_deserializeFromBytes(data: Uint8Array, start: number, end: number): Tree;
    tree_getChunkCount(target: Tree): number;
    getChunkDepth(): number;
    tree_setProperty(target: Tree, property: number, value: Tree): boolean;
    tree_deleteProperty(target: Tree, property: number): boolean;
    tree_pushSingle(target: Tree, value: Tree): number;
    tree_push(target: Tree, ...values: Tree[]): number;
    tree_pop(target: Tree): T[number];
    tree_getLeafGindices(target?: Tree, root?: Gindex): Gindex[];
}
export {};
//# sourceMappingURL=list.d.ts.map