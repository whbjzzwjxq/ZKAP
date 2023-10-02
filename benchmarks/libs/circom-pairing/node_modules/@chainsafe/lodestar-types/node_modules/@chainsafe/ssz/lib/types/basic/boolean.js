"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BooleanType = exports.isBooleanType = exports.BOOLEAN_TYPE = void 0;
const type_1 = require("../type");
const abstract_1 = require("./abstract");
exports.BOOLEAN_TYPE = Symbol.for("ssz/BooleanType");
function isBooleanType(type) {
    return type_1.isTypeOf(type, exports.BOOLEAN_TYPE);
}
exports.isBooleanType = isBooleanType;
class BooleanType extends abstract_1.BasicType {
    constructor() {
        super();
        this._typeSymbols.add(exports.BOOLEAN_TYPE);
    }
    struct_getSerializedLength() {
        return 1;
    }
    struct_assertValidValue(value) {
        if (value !== true && value !== false) {
            throw new Error("Boolean value must be true or false");
        }
    }
    struct_defaultValue() {
        return false;
    }
    struct_serializeToBytes(value, output, offset) {
        output[offset] = value ? 1 : 0;
        return offset + 1;
    }
    struct_deserializeFromBytes(data, offset) {
        this.bytes_validate(data, offset);
        if (data[offset] === 1) {
            return true;
        }
        else if (data[offset] === 0) {
            return false;
        }
        else {
            throw new Error("Invalid boolean value");
        }
    }
    struct_convertFromJson(data) {
        this.struct_assertValidValue(data);
        return data;
    }
    struct_convertToJson(value) {
        return value;
    }
}
exports.BooleanType = BooleanType;
//# sourceMappingURL=boolean.js.map