"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ByteListType = exports.isByteListType = exports.BYTELIST_TYPE = void 0;
const list_1 = require("./list");
const basic_1 = require("../basic");
const type_1 = require("../type");
const byteArray_1 = require("../../util/byteArray");
const constants_1 = require("../../util/constants");
exports.BYTELIST_TYPE = Symbol.for("ssz/ByteListType");
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isByteListType(type) {
    return type_1.isTypeOf(type, exports.BYTELIST_TYPE);
}
exports.isByteListType = isByteListType;
class ByteListType extends list_1.BasicListType {
    constructor(options) {
        super({ elementType: basic_1.byteType, ...options });
        this._typeSymbols.add(exports.BYTELIST_TYPE);
    }
    struct_deserializeFromBytes(data, start, end) {
        this.bytes_validate(data, start, end);
        const length = end - start;
        const value = new Array(end - start);
        for (let i = 0; i < length; i++) {
            value[i] = data[start + i];
        }
        return value;
    }
    struct_serializeToBytes(value, output, offset) {
        const length = value.length;
        output.set(value, offset);
        return offset + length;
    }
    struct_convertFromJson(data) {
        const bytes = byteArray_1.fromHexString(data);
        return this.struct_deserializeFromBytes(bytes, 0, bytes.length);
    }
    struct_convertToJson(value) {
        return byteArray_1.toHexString(this.serialize(value));
    }
    tree_convertToStruct(target) {
        const length = this.tree_getLength(target);
        const value = new Array(length);
        const chunks = target.getNodesAtDepth(this.getChunkDepth(), 0, this.getMaxChunkCount());
        let chunkIx = 0;
        let i;
        for (i = 0; i < length - constants_1.BYTES_PER_CHUNK; i += constants_1.BYTES_PER_CHUNK) {
            for (let j = 0; j < constants_1.BYTES_PER_CHUNK; j++) {
                value[i + j] = chunks[chunkIx].root[j];
            }
            chunkIx++;
        }
        for (let j = 0; j < length - i; j++) {
            value[i + j] = chunks[chunkIx].root[j];
        }
        return value; // value;
    }
}
exports.ByteListType = ByteListType;
//# sourceMappingURL=byteList.js.map