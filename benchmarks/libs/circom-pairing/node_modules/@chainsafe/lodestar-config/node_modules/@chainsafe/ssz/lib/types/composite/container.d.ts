import { Json, ObjectLike } from "../../interface";
import { CompositeType } from "./abstract";
import { IJsonOptions, Type } from "../type";
import { Gindex, GindexBitstring, Node, Tree } from "@chainsafe/persistent-merkle-tree";
export interface IContainerOptions {
    fields: Record<string, Type<any>>;
    casingMap?: Record<string, string>;
    expectedCase?: IJsonOptions["case"];
}
export declare const CONTAINER_TYPE: unique symbol;
export declare function isContainerType<T extends ObjectLike = ObjectLike>(type: Type<unknown>): type is ContainerType<T>;
declare type FieldInfo = {
    isBasic: boolean;
    gIndexBitString: GindexBitstring;
    gIndex: bigint;
};
export declare class ContainerType<T extends ObjectLike = ObjectLike> extends CompositeType<T> {
    fields: Record<string, Type<any>>;
    casingMap?: Record<string, string>;
    expectedCase?: IJsonOptions["case"];
    /**
     * This caches FieldInfo by field name so that we don't have to query this same data in a lot of apis.
     * This helps speed up 30% with a simple test of increasing state.slot from 0 to 1_000_000 as shown in the
     * performance test of uint.test.ts.
     **/
    fieldInfos: Map<string, FieldInfo>;
    constructor(options: IContainerOptions);
    struct_defaultValue(): T;
    struct_getSerializedLength(value: T): number;
    getMaxSerializedLength(): number;
    getMinSerializedLength(): number;
    struct_assertValidValue(value: unknown): asserts value is T;
    struct_equals(value1: T, value2: T): boolean;
    struct_clone(value: T): T;
    struct_deserializeFromBytes(data: Uint8Array, start: number, end: number): T;
    struct_serializeToBytes(value: T, output: Uint8Array, offset: number): number;
    struct_getRootAtChunkIndex(value: T, index: number): Uint8Array;
    struct_convertFromJson(data: Json, options?: IJsonOptions): T;
    struct_convertToJson(value: T, options?: IJsonOptions): Json;
    struct_convertToTree(value: T): Tree;
    struct_getPropertyNames(): string[];
    bytes_getVariableOffsets(target: Uint8Array): [number, number][];
    tree_defaultNode(): Node;
    tree_convertToStruct(target: Tree): T;
    tree_getSerializedLength(target: Tree): number;
    tree_deserializeFromBytes(data: Uint8Array, start: number, end: number): Tree;
    tree_serializeToBytes(target: Tree, output: Uint8Array, offset: number): number;
    getPropertyGindex(prop: PropertyKey): Gindex;
    getPropertyType(prop: PropertyKey): Type<unknown>;
    tree_getPropertyNames(): (string | number)[];
    tree_getProperty(target: Tree, prop: PropertyKey): Tree | unknown;
    tree_setProperty(target: Tree, property: PropertyKey, value: Tree | unknown): boolean;
    tree_deleteProperty(target: Tree, prop: PropertyKey): boolean;
    tree_iterateValues(target: Tree): IterableIterator<Tree | unknown>;
    tree_readonlyIterateValues(target: Tree): IterableIterator<Tree | unknown>;
    tree_getValues(target: Tree): (Tree | unknown)[];
    tree_readonlyGetValues(target: Tree): (Tree | unknown)[];
    hasVariableSerializedLength(): boolean;
    getFixedSerializedLength(): null | number;
    getMaxChunkCount(): number;
    tree_getLeafGindices(target?: Tree, root?: Gindex): Gindex[];
}
export {};
//# sourceMappingURL=container.d.ts.map