"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringType = void 0;
const ssz_1 = require("@chainsafe/ssz");
/* eslint-disable @typescript-eslint/naming-convention */
class StringType extends ssz_1.BasicType {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    struct_getSerializedLength(data) {
        throw new Error("unsupported ssz operation");
    }
    struct_convertToJson(value) {
        return value;
    }
    struct_convertFromJson(data) {
        return data;
    }
    struct_assertValidValue(data) {
        throw new Error("unsupported ssz operation");
    }
    serialize() {
        throw new Error("unsupported ssz type for serialization");
    }
    struct_serializeToBytes() {
        throw new Error("unsupported ssz type for serialization");
    }
    struct_deserializeFromBytes() {
        throw new Error("unsupported ssz operation");
    }
    struct_defaultValue() {
        return "something";
    }
}
exports.StringType = StringType;
//# sourceMappingURL=StringType.js.map