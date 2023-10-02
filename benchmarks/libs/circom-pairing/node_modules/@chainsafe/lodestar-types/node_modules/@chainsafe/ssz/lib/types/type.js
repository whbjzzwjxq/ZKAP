"use strict";
/* eslint-disable @typescript-eslint/member-ordering */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Type = exports.isTypeOf = void 0;
/**
 * Check if `type` is an instance of `typeSymbol` type
 *
 * Used by various isFooType functions
 */
function isTypeOf(type, typeSymbol) {
    return type._typeSymbols.has(typeSymbol);
}
exports.isTypeOf = isTypeOf;
/**
 * A Type is either a BasicType of a CompositeType
 */
class Type {
    constructor() {
        this._typeSymbols = new Set();
    }
    /**
     * Valid value assertion
     */
    assertValidValue(value) {
        return this.struct_assertValidValue(value);
    }
    /**
     * Default constructor
     */
    defaultValue() {
        return this.struct_defaultValue();
    }
    /**
     * Clone / copy
     */
    clone(value) {
        return this.struct_clone(value);
    }
    /**
     * Equality
     */
    equals(value1, value2) {
        return this.struct_equals(value1, value2);
    }
    /**
     * Serialized byte length
     */
    size(value) {
        return this.struct_getSerializedLength(value);
    }
    /**
     * Low-level deserialization
     */
    fromBytes(data, start, end) {
        return this.struct_deserializeFromBytes(data, start, end);
    }
    /**
     * Deserialization
     */
    deserialize(data) {
        return this.fromBytes(data, 0, data.length);
    }
    /**
     * Low-level serialization
     *
     * Serializes to a pre-allocated Uint8Array
     */
    toBytes(value, output, offset) {
        return this.struct_serializeToBytes(value, output, offset);
    }
    /**
     * Serialization
     */
    serialize(value) {
        const output = new Uint8Array(this.size(value));
        this.toBytes(value, output, 0);
        return output;
    }
    /**
     * Merkleization
     */
    hashTreeRoot(value) {
        return this.struct_hashTreeRoot(value);
    }
    /**
     * Convert from JSON-serializable object
     */
    fromJson(data, options) {
        return this.struct_convertFromJson(data, options);
    }
    /**
     * Convert to JSON-serializable object
     */
    toJson(value, options) {
        return this.struct_convertToJson(value, options);
    }
}
exports.Type = Type;
//# sourceMappingURL=type.js.map