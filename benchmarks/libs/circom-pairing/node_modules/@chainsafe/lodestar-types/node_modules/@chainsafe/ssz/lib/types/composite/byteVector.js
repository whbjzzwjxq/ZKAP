"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ByteVectorType = exports.isByteVectorType = exports.BYTEVECTOR_TYPE = void 0;
const vector_1 = require("./vector");
const basic_1 = require("../basic");
const type_1 = require("../type");
const byteArray_1 = require("../../util/byteArray");
exports.BYTEVECTOR_TYPE = Symbol.for("ssz/ByteVectorType");
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isByteVectorType(type) {
    return type_1.isTypeOf(type, exports.BYTEVECTOR_TYPE);
}
exports.isByteVectorType = isByteVectorType;
class ByteVectorType extends vector_1.BasicVectorType {
    constructor(options) {
        super({ elementType: basic_1.byteType, ...options });
        this._typeSymbols.add(exports.BYTEVECTOR_TYPE);
    }
    struct_defaultValue() {
        return new Uint8Array(this.length);
    }
    struct_deserializeFromBytes(data, start, end) {
        this.bytes_validate(data, start, end);
        const length = end - start;
        if (length !== this.length) {
            throw new Error(`Invalid deserialized vector length: expected ${this.length}, actual: ${length}`);
        }
        const value = new Uint8Array(length);
        value.set(data.slice(start, end));
        return value;
    }
    struct_serializeToBytes(value, output, offset) {
        output.set(value, offset);
        return offset + this.length;
    }
    struct_convertFromJson(data) {
        const value = byteArray_1.fromHexString(data);
        if (value.length !== this.length) {
            throw new Error(`Invalid JSON vector length: expected ${this.length}, actual: ${value.length}`);
        }
        return value;
    }
    struct_convertToJson(value) {
        return byteArray_1.toHexString(value);
    }
    tree_convertToStruct(target) {
        const value = new Uint8Array(this.length);
        const chunks = target.getNodesAtDepth(this.getChunkDepth(), 0, this.getMaxChunkCount());
        let chunkIx = 0;
        if (this.length % 32 === 0) {
            for (let i = 0; i < this.length; i += 32) {
                value.set(chunks[chunkIx].root, i);
                chunkIx++;
            }
        }
        else {
            let i;
            for (i = 0; i < this.length - 32; i += 32) {
                value.set(chunks[chunkIx].root, i);
                chunkIx++;
            }
            value.set(chunks[chunkIx].root.subarray(0, this.length - i), i);
        }
        return value;
    }
}
exports.ByteVectorType = ByteVectorType;
//# sourceMappingURL=byteVector.js.map