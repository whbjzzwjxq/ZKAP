"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoneType = exports.isNoneType = exports.NONE_TYPE = void 0;
const type_1 = require("../type");
const abstract_1 = require("./abstract");
exports.NONE_TYPE = Symbol.for("ssz/NoneType");
function isNoneType(type) {
    return type_1.isTypeOf(type, exports.NONE_TYPE);
}
exports.isNoneType = isNoneType;
class NoneType extends abstract_1.BasicType {
    constructor() {
        super();
        this._typeSymbols.add(exports.NONE_TYPE);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    struct_deserializeFromBytes(data, offset) {
        return null;
    }
    struct_assertValidValue(value) {
        if (value !== null) {
            throw new Error("None value must be null");
        }
    }
    struct_defaultValue() {
        return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    struct_getSerializedLength(value) {
        return 0;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    struct_serializeToBytes(value, output, offset) {
        return 0;
    }
    struct_convertFromJson(data) {
        this.assertValidValue(data);
        return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    struct_convertToJson(value, options) {
        return null;
    }
}
exports.NoneType = NoneType;
//# sourceMappingURL=none.js.map