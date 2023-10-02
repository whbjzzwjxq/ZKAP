"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasicType = exports.isBasicType = exports.BASIC_TYPE = void 0;
const type_1 = require("../type");
exports.BASIC_TYPE = Symbol.for("ssz/BasicType");
function isBasicType(type) {
    return type_1.isTypeOf(type, exports.BASIC_TYPE);
}
exports.isBasicType = isBasicType;
/**
 * A BasicType is a terminal type, which has no flexibility in its representation.
 *
 * It is serialized as, at maximum, 32 bytes and merkleized as, at maximum, a single chunk
 */
class BasicType extends type_1.Type {
    constructor() {
        super();
        this._typeSymbols.add(exports.BASIC_TYPE);
    }
    struct_clone(value) {
        return value;
    }
    struct_equals(value1, value2) {
        this.assertValidValue(value1);
        this.assertValidValue(value2);
        return value1 === value2;
    }
    /**
     * Check if type has a variable number of elements (or subelements)
     *
     * For basic types, this is always false
     */
    hasVariableSerializedLength() {
        return false;
    }
    getFixedSerializedLength() {
        return this.struct_getSerializedLength();
    }
    getMaxSerializedLength() {
        return this.struct_getSerializedLength();
    }
    getMinSerializedLength() {
        return this.struct_getSerializedLength();
    }
    bytes_validate(data, offset) {
        if (!data) {
            throw new Error("Data is null or undefined");
        }
        if (data.length === 0) {
            throw new Error("Data is empty");
        }
        const length = data.length - offset;
        if (length < this.struct_getSerializedLength()) {
            throw new Error(`Data length of ${length} is too small, expect ${this.struct_getSerializedLength()}`);
        }
        // accept data length > this.size()
    }
    struct_hashTreeRoot(value) {
        const output = new Uint8Array(32);
        this.struct_serializeToBytes(value, output, 0);
        return output;
    }
}
exports.BasicType = BasicType;
//# sourceMappingURL=abstract.js.map