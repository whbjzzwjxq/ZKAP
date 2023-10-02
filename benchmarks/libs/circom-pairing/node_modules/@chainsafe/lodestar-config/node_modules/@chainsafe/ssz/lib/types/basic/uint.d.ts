import { HashObject } from "@chainsafe/as-sha256";
import { Json } from "../../interface";
import { Type } from "../type";
import { BasicType } from "./abstract";
export interface IUintOptions {
    byteLength: number;
    infinityWhenBig?: boolean;
}
export declare const UINT_TYPE: unique symbol;
export declare function isUintType<T>(type: Type<unknown>): type is UintType<T>;
export declare abstract class UintType<T> extends BasicType<T> {
    byteLength: number;
    infinityWhenBig: boolean;
    constructor(options: IUintOptions);
    struct_getSerializedLength(): number;
    /**
     * Validate the exact byte length
     */
    bytes_validate_length(data: Uint8Array, start: number, end: number): void;
}
export declare const NUMBER_UINT_TYPE: unique symbol;
export declare const NUMBER_64_UINT_TYPE: unique symbol;
export declare function isNumberUintType(type: Type<unknown>): type is NumberUintType;
export declare function isNumber64UintType(type: Type<unknown>): type is Number64UintType;
export declare class NumberUintType extends UintType<number> {
    _maxBigInt?: BigInt;
    constructor(options: IUintOptions);
    struct_assertValidValue(value: unknown): asserts value is number;
    struct_defaultValue(): number;
    struct_getMaxBigInt(): BigInt;
    struct_serializeToBytes(value: number, output: Uint8Array, offset: number): number;
    struct_deserializeFromBytes(data: Uint8Array, start: number, end?: number): number;
    struct_convertFromJson(data: Json): number;
    struct_convertToJson(value: number): Json;
}
/**
 * For 64 bit number, we want to operator on HashObject
 * over bytes to improve performance.
 */
export declare class Number64UintType extends NumberUintType {
    constructor();
    /**
     * TODO: move this logic all the way to persistent-merkle-tree?
     * That's save us 1 time to traverse the tree in the applyDelta scenario
     */
    struct_deserializeFromHashObject(data: HashObject, byteOffset: number): number;
    struct_serializeToHashObject(value: number, output: HashObject, byteOffset: number): number;
}
export declare const BIGINT_UINT_TYPE: unique symbol;
export declare function isBigIntUintType(type: Type<unknown>): type is BigIntUintType;
export declare class BigIntUintType extends UintType<bigint> {
    constructor(options: IUintOptions);
    struct_assertValidValue(value: unknown): asserts value is bigint;
    struct_defaultValue(): bigint;
    struct_serializeToBytes(value: bigint, output: Uint8Array, offset: number): number;
    struct_deserializeFromBytes(data: Uint8Array, start: number, end?: number): bigint;
    struct_convertFromJson(data: Json): bigint;
    struct_convertToJson(value: bigint): Json;
}
//# sourceMappingURL=uint.d.ts.map