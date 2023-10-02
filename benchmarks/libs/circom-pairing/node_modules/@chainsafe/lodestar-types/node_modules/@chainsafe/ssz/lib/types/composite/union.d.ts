import { Gindex, Node, Tree } from "@chainsafe/persistent-merkle-tree";
import { Json, Union } from "../../interface";
import { IJsonOptions, Type } from "../type";
import { CompositeType } from "./abstract";
export interface IUnionOptions {
    types: Type<any>[];
}
/**
 * SSZ Union includes the selector (index of type) in the tree
 * This selector is always in the same index in the tree
 * ```
 *   1
 *  / \
 * 2   3 // <-here
 * ```
 */
export declare const SELECTOR_GINDEX: bigint;
/**
 * The value gindex in the tree.
 * ```
 *           1
 *          / \
 * here -> 2   3
 * ```
 */
export declare const VALUE_GINDEX: bigint;
export declare const UNION_TYPE: unique symbol;
export declare function isUnionType<T extends Union<unknown>>(type: Type<unknown>): type is UnionType<T>;
export declare class UnionType<T extends Union<unknown>> extends CompositeType<T> {
    types: Type<any>[];
    constructor(options: IUnionOptions);
    struct_assertValidValue(wrappedValue: unknown): asserts wrappedValue is T;
    struct_equals(value1: T, value2: T): boolean;
    struct_defaultValue(): T;
    tree_defaultNode(): Node;
    struct_clone(wrappedValue: T): T;
    struct_convertToJson(wrappedValue: T, options?: IJsonOptions): Json;
    struct_convertFromJson(json: Json, options?: IJsonOptions): T;
    struct_convertToTree(wrappedValue: T): Tree;
    tree_convertToStruct(target: Tree): T;
    struct_serializeToBytes(wrappedValue: T, output: Uint8Array, offset: number): number;
    tree_serializeToBytes(target: Tree, output: Uint8Array, offset: number): number;
    struct_deserializeFromBytes(data: Uint8Array, start: number, end: number): T;
    tree_deserializeFromBytes(data: Uint8Array, start: number, end: number): Tree;
    getMinSerializedLength(): number;
    getMaxSerializedLength(): number;
    struct_getSerializedLength(wrappedValue: T): number;
    tree_getSerializedLength(target: Tree): number;
    hasVariableSerializedLength(): boolean;
    getFixedSerializedLength(): null | number;
    bytes_getVariableOffsets(target: Uint8Array): [number, number][];
    getMaxChunkCount(): number;
    /** This is just to compliant to the parent, we're not likely to use it. */
    struct_getRootAtChunkIndex(wrappedValue: T, index: number): Uint8Array;
    struct_getPropertyNames(): (string | number)[];
    tree_getPropertyNames(): (string | number)[];
    getPropertyGindex(property: PropertyKey): Gindex;
    getPropertyType(property: PropertyKey): Type<unknown>;
    /** Union can only extract type from a Tree */
    getPropertyTypeFromTree(target: Tree, property: PropertyKey): Type<unknown>;
    tree_getProperty(target: Tree, property: PropertyKey): unknown;
    tree_setProperty(target: Tree, property: PropertyKey, value: unknown): boolean;
    tree_deleteProperty(tree: Tree, property: PropertyKey): boolean;
    tree_iterateValues(tree: Tree): IterableIterator<unknown>;
    tree_readonlyIterateValues(tree: Tree): IterableIterator<unknown>;
    tree_getValues(tree: Tree): unknown[];
    tree_readonlyGetValues(tree: Tree): unknown[];
    tree_getLeafGindices(target: Tree, root?: Gindex): Gindex[];
    private getType;
}
//# sourceMappingURL=union.d.ts.map