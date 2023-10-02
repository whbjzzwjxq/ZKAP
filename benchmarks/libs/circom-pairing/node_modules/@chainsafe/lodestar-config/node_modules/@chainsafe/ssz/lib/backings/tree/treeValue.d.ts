import { Proof, Tree } from "@chainsafe/persistent-merkle-tree";
import { ArrayLike, CompositeValue, List, Union } from "../../interface";
import { BasicArrayType, BasicListType, CompositeArrayType, CompositeListType, CompositeType, ContainerType, UnionType } from "../../types";
import { Path } from "../backedValue";
import { ITreeBacked, TreeBacked, ValueOf } from "./interface";
declare type TreeValueConstructor<T extends CompositeValue> = {
    new (type: CompositeType<T>, tree: Tree): TreeValue<T>;
};
export declare function isTreeBacked<T extends CompositeValue>(value: unknown): value is ITreeBacked<T>;
/**
 * Return an ES6 Proxy-wrapped tree value (ergonomic getter/setter/iteration)
 */
export declare function createTreeBacked<T extends CompositeValue>(type: CompositeType<T>, tree: Tree): TreeBacked<T>;
export declare function getTreeValueClass<T extends CompositeValue>(type: CompositeType<T>): TreeValueConstructor<T>;
/**
 * Wrap a TreeValue in a Proxy that adds ergonomic getter/setter
 */
export declare function proxyWrapTreeValue<T extends CompositeValue>(value: TreeValue<T>): TreeBacked<T>;
/**
 * Proxy handler that adds ergonomic get/set and exposes TreeValue methods
 */
export declare const TreeProxyHandler: ProxyHandler<TreeValue<CompositeValue>>;
/**
 * Convenience wrapper around a type and tree
 */
export declare abstract class TreeValue<T extends CompositeValue> implements ITreeBacked<T> {
    type: CompositeType<T>;
    tree: Tree;
    constructor(type: CompositeType<T>, tree: Tree);
    clone(): TreeBacked<T>;
    valueOf(): T;
    equals(other: T): boolean;
    size(): number;
    toStruct(): T;
    toBytes(output: Uint8Array, offset: number): number;
    serialize(): Uint8Array;
    hashTreeRoot(): Uint8Array;
    createProof(paths: Path[]): Proof;
    getPropertyNames(): (string | number)[];
    [Symbol.iterator](): IterableIterator<ValueOf<T>>;
    abstract getProperty<P extends keyof T>(property: P): ValueOf<T, P>;
    abstract setProperty<P extends keyof T>(property: P, value: ValueOf<T, P>): boolean;
    abstract keys(): IterableIterator<string>;
    abstract values(): IterableIterator<ValueOf<T>>;
    abstract entries(): IterableIterator<[string, ValueOf<T>]>;
    abstract readonlyValues(): IterableIterator<ValueOf<T>>;
    abstract readonlyEntries(): IterableIterator<[string, ValueOf<T>]>;
    abstract keysArray(): string[];
    abstract valuesArray(): ValueOf<T>[];
    abstract entriesArray(): [string, ValueOf<T>][];
    abstract readonlyValuesArray(): ValueOf<T>[];
    abstract readonlyEntriesArray(): [string, ValueOf<T>][];
}
export declare class BasicArrayTreeValue<T extends ArrayLike<unknown>> extends TreeValue<T> {
    type: BasicArrayType<T>;
    constructor(type: BasicArrayType<T>, tree: Tree);
    getProperty<P extends keyof T>(property: P): ValueOf<T, P>;
    setProperty<P extends keyof T>(property: P, value: ValueOf<T, P>): boolean;
    keys(): IterableIterator<string>;
    values(): IterableIterator<ValueOf<T>>;
    entries(): IterableIterator<[string, ValueOf<T>]>;
    readonlyValues(): IterableIterator<ValueOf<T>>;
    readonlyEntries(): IterableIterator<[string, ValueOf<T>]>;
    keysArray(): string[];
    valuesArray(): ValueOf<T>[];
    entriesArray(): [string, ValueOf<T>][];
    readonlyValuesArray(): ValueOf<T>[];
    readonlyEntriesArray(): [string, ValueOf<T>][];
}
export declare class CompositeArrayTreeValue<T extends ArrayLike<unknown>> extends TreeValue<T> {
    type: CompositeArrayType<T>;
    constructor(type: CompositeArrayType<T>, tree: Tree);
    getProperty<P extends keyof T>(property: P): ValueOf<T, P>;
    setProperty<P extends keyof T>(property: P, value: ValueOf<T, P>): boolean;
    keys(): IterableIterator<string>;
    values(): IterableIterator<ValueOf<T>>;
    entries(): IterableIterator<[string, ValueOf<T>]>;
    readonlyValues(): IterableIterator<ValueOf<T>>;
    readonlyEntries(): IterableIterator<[string, ValueOf<T>]>;
    keysArray(): string[];
    valuesArray(): ValueOf<T>[];
    entriesArray(): [string, ValueOf<T>][];
    readonlyValuesArray(): ValueOf<T>[];
    readonlyEntriesArray(): [string, ValueOf<T>][];
}
export declare class BasicListTreeValue<T extends List<unknown>> extends BasicArrayTreeValue<T> {
    type: BasicListType<T>;
    constructor(type: BasicListType<T>, tree: Tree);
    push(...values: ValueOf<T>[]): number;
    pop(): ValueOf<T>;
}
export declare class CompositeListTreeValue<T extends List<unknown>> extends CompositeArrayTreeValue<T> {
    type: CompositeListType<T>;
    constructor(type: CompositeListType<T>, tree: Tree);
    push(...values: ValueOf<T>[]): number;
    pop(): ValueOf<T>;
}
export declare class ContainerTreeValue<T extends CompositeValue> extends TreeValue<T> {
    type: ContainerType<T>;
    constructor(type: ContainerType<T>, tree: Tree);
    getProperty<P extends keyof T>(property: P): ValueOf<T, P>;
    setProperty<P extends keyof T>(property: P, value: ValueOf<T, P>): boolean;
    keys(): IterableIterator<string>;
    values(): IterableIterator<ValueOf<T>>;
    entries(): IterableIterator<[string, ValueOf<T>]>;
    readonlyValues(): IterableIterator<ValueOf<T>>;
    readonlyEntries(): IterableIterator<[string, ValueOf<T>]>;
    keysArray(): string[];
    valuesArray(): ValueOf<T>[];
    entriesArray(): [string, ValueOf<T>][];
    readonlyValuesArray(): ValueOf<T>[];
    readonlyEntriesArray(): [string, ValueOf<T>][];
}
/**
 * Custom TreeValue to be used in `ContainerLeafNodeStructType`.
 *
 * It skips extra work done in `ContainerTreeValue` since all data is represented as struct and should be returned
 * as struct, not as TreeBacked.
 */
export declare class ContainerLeafNodeStructTreeValue<T extends CompositeValue> extends TreeValue<T> {
    type: ContainerType<T>;
    constructor(type: ContainerType<T>, tree: Tree);
    getProperty<P extends keyof T>(property: P): ValueOf<T, P>;
    setProperty<P extends keyof T>(property: P, value: ValueOf<T, P>): boolean;
    keys(): IterableIterator<string>;
    values(): IterableIterator<ValueOf<T>>;
    entries(): IterableIterator<[string, ValueOf<T>]>;
    readonlyValues(): IterableIterator<ValueOf<T>>;
    readonlyEntries(): IterableIterator<[string, ValueOf<T>]>;
    keysArray(): string[];
    valuesArray(): ValueOf<T>[];
    entriesArray(): [string, ValueOf<T>][];
    readonlyValuesArray(): ValueOf<T>[];
    readonlyEntriesArray(): [string, ValueOf<T>][];
}
export declare class UnionTreeValue<T extends Union<unknown>> extends TreeValue<T> {
    type: UnionType<T>;
    constructor(type: UnionType<T>, tree: Tree);
    getProperty<P extends keyof T>(property: P): ValueOf<T, P>;
    setProperty<P extends keyof T>(property: P, value: ValueOf<T, P>): boolean;
    keys(): IterableIterator<string>;
    values(): IterableIterator<ValueOf<T>>;
    entries(): IterableIterator<[string, ValueOf<T, keyof T>]>;
    readonlyValues(): IterableIterator<ValueOf<T, keyof T>>;
    readonlyEntries(): IterableIterator<[string, ValueOf<T, keyof T>]>;
    keysArray(): string[];
    valuesArray(): ValueOf<T>[];
    entriesArray(): [string, ValueOf<T>][];
    readonlyValuesArray(): ValueOf<T>[];
    readonlyEntriesArray(): [string, ValueOf<T>][];
}
export {};
//# sourceMappingURL=treeValue.d.ts.map