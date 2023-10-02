import { HashObject } from "@chainsafe/as-sha256";
import { Type } from "../type";
export declare const BASIC_TYPE: unique symbol;
export declare function isBasicType(type: Type<unknown>): type is BasicType<unknown>;
/**
 * A BasicType is a terminal type, which has no flexibility in its representation.
 *
 * It is serialized as, at maximum, 32 bytes and merkleized as, at maximum, a single chunk
 */
export declare abstract class BasicType<T> extends Type<T> {
    constructor();
    struct_clone(value: T): T;
    struct_equals(value1: T, value2: T): boolean;
    /**
     * Check if type has a variable number of elements (or subelements)
     *
     * For basic types, this is always false
     */
    hasVariableSerializedLength(): boolean;
    getFixedSerializedLength(): number;
    getMaxSerializedLength(): number;
    getMinSerializedLength(): number;
    bytes_validate(data: Uint8Array, offset: number): void;
    abstract struct_deserializeFromBytes(data: Uint8Array, offset: number): T;
    struct_deserializeFromHashObject?(data: HashObject, byteOffset: number): T;
    struct_serializeToHashObject?(value: T, output: HashObject, byteOffset: number): number;
    struct_hashTreeRoot(value: T): Uint8Array;
}
//# sourceMappingURL=abstract.d.ts.map