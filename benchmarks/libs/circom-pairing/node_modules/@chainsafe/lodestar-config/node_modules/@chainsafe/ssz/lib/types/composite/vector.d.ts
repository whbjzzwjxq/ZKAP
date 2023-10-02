import { Json, Vector } from "../../interface";
import { IArrayOptions, BasicArrayType, CompositeArrayType } from "./array";
import { Type } from "../type";
import { Node, Tree } from "@chainsafe/persistent-merkle-tree";
export interface IVectorOptions extends IArrayOptions {
    length: number;
}
export declare const VECTOR_TYPE: unique symbol;
export declare function isVectorType<T extends Vector<any> = Vector<any>>(type: Type<unknown>): type is VectorType<T>;
export declare type VectorType<T extends Vector<any> = Vector<any>> = BasicVectorType<T> | CompositeVectorType<T>;
declare type VectorTypeConstructor = {
    new <T extends Vector<any>>(options: IVectorOptions): VectorType<T>;
};
export declare const VectorType: VectorTypeConstructor;
export declare class BasicVectorType<T extends Vector<unknown> = Vector<unknown>> extends BasicArrayType<T> {
    length: number;
    constructor(options: IVectorOptions);
    struct_defaultValue(): T;
    struct_getLength(value?: T): number;
    getMaxLength(): number;
    getMinLength(): number;
    bytes_validate(data: Uint8Array, start: number, end: number): void;
    struct_deserializeFromBytes(data: Uint8Array, start: number, end: number): T;
    struct_assertValidValue(value: unknown): asserts value is T;
    struct_convertFromJson(data: Json): T;
    tree_defaultNode(): Node;
    tree_defaultValue(): Tree;
    tree_getLength(target: Tree): number;
    tree_deserializeFromBytes(data: Uint8Array, start: number, end: number): Tree;
    tree_setProperty(target: Tree, property: number, value: T[number]): boolean;
    hasVariableSerializedLength(): boolean;
    getFixedSerializedLength(): null | number;
    getMaxChunkCount(): number;
}
export declare class CompositeVectorType<T extends Vector<unknown> = Vector<unknown>> extends CompositeArrayType<T> {
    length: number;
    constructor(options: IVectorOptions);
    struct_defaultValue(): T;
    struct_getLength(value: T): number;
    getMaxLength(): number;
    getMinLength(): number;
    struct_deserializeFromBytes(data: Uint8Array, start: number, end: number): T;
    struct_assertValidValue(value: unknown): asserts value is T;
    struct_convertFromJson(data: Json): T;
    tree_defaultNode(): Node;
    tree_defaultValue(): Tree;
    tree_getLength(target: Tree): number;
    tree_deserializeFromBytes(data: Uint8Array, start: number, end: number): Tree;
    setProperty(target: Tree, property: number, value: Tree): boolean;
    hasVariableSerializedLength(): boolean;
    getFixedSerializedLength(): null | number;
    getMaxChunkCount(): number;
}
export {};
//# sourceMappingURL=vector.d.ts.map