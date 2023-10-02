import { Json } from "../interface";
export interface IJsonOptions {
    case: "snake" | "constant" | "camel" | "param" | "header" | "pascal" | "dot" | "notransform";
    casingMap?: Record<string, string>;
}
/**
 * Check if `type` is an instance of `typeSymbol` type
 *
 * Used by various isFooType functions
 */
export declare function isTypeOf(type: Type<unknown>, typeSymbol: symbol): boolean;
/**
 * A Type is either a BasicType of a CompositeType
 */
export declare abstract class Type<T> {
    /**
     * Symbols used to track the identity of a type
     *
     * Used by various isFooType functions
     */
    _typeSymbols: Set<symbol>;
    constructor();
    abstract struct_assertValidValue(value: unknown): asserts value is T;
    abstract struct_defaultValue(): T;
    abstract struct_clone(value: T): T;
    abstract struct_equals(value1: T, value2: T): boolean;
    abstract struct_getSerializedLength(value?: T): number;
    abstract struct_deserializeFromBytes(data: Uint8Array, start: number, end?: number): T;
    abstract struct_serializeToBytes(value: T, output: Uint8Array, offset: number): number;
    abstract struct_hashTreeRoot(value: T): Uint8Array;
    abstract struct_convertFromJson(data: Json, options?: IJsonOptions): T;
    abstract struct_convertToJson(value: T, options?: IJsonOptions): Json;
    /**
     * Valid value assertion
     */
    assertValidValue(value: unknown): asserts value is T;
    /**
     * Default constructor
     */
    defaultValue(): T;
    /**
     * Clone / copy
     */
    clone(value: T): T;
    /**
     * Equality
     */
    equals(value1: T, value2: T): boolean;
    /**
     * Check if type has a variable number of elements (or subelements)
     *
     * For basic types, this is always false
     */
    abstract hasVariableSerializedLength(): boolean;
    /**
     * if hasVariableSerializedLength() === true, returns null. Otherwise returns a length value
     */
    abstract getFixedSerializedLength(): null | number;
    /**
     * Maximal serialized byte length
     */
    abstract getMaxSerializedLength(): number;
    /**
     * Minimal serialized byte length
     */
    abstract getMinSerializedLength(): number;
    /**
     * Serialized byte length
     */
    size(value?: T): number;
    /**
     * Low-level deserialization
     */
    fromBytes(data: Uint8Array, start: number, end?: number): T;
    /**
     * Deserialization
     */
    deserialize(data: Uint8Array): T;
    /**
     * Low-level serialization
     *
     * Serializes to a pre-allocated Uint8Array
     */
    toBytes(value: T, output: Uint8Array, offset: number): number;
    /**
     * Serialization
     */
    serialize(value: T): Uint8Array;
    /**
     * Merkleization
     */
    hashTreeRoot(value: T): Uint8Array;
    /**
     * Convert from JSON-serializable object
     */
    fromJson(data: Json, options?: IJsonOptions): T;
    /**
     * Convert to JSON-serializable object
     */
    toJson(value: T, options?: IJsonOptions): Json;
}
//# sourceMappingURL=type.d.ts.map