"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BitVectorType = exports.isBitVectorType = exports.BITVECTOR_TYPE = void 0;
const vector_1 = require("./vector");
const basic_1 = require("../basic");
const type_1 = require("../type");
const byteArray_1 = require("../../util/byteArray");
const constants_1 = require("../../util/constants");
exports.BITVECTOR_TYPE = Symbol.for("ssz/BitVectorType");
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isBitVectorType(type) {
    return type_1.isTypeOf(type, exports.BITVECTOR_TYPE);
}
exports.isBitVectorType = isBitVectorType;
class BitVectorType extends vector_1.BasicVectorType {
    constructor(options) {
        super({ elementType: basic_1.booleanType, ...options });
        this._typeSymbols.add(exports.BITVECTOR_TYPE);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    struct_getLength(value) {
        return this.length;
    }
    // Override all length methods to understand .length as bits not bytes
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    struct_getByteLength(value) {
        return Math.ceil(this.length / 8);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    struct_getSerializedLength(value) {
        return Math.ceil(this.length / 8);
    }
    getFixedSerializedLength() {
        return Math.ceil(this.length / 8);
    }
    getMaxSerializedLength() {
        return Math.ceil(this.length / 8);
    }
    getMinSerializedLength() {
        return Math.ceil(this.length / 8);
    }
    struct_getChunkCount(value) {
        return Math.ceil(this.struct_getLength(value) / 256);
    }
    struct_getByte(value, index) {
        const firstBitIndex = index * 8;
        const lastBitIndex = Math.min(firstBitIndex + 7, value.length - 1);
        let bitstring = "0b";
        for (let i = lastBitIndex; i >= firstBitIndex; i--) {
            bitstring += value[i] ? "1" : "0";
        }
        return Number(bitstring);
    }
    struct_deserializeFromBytes(data, start, end) {
        this.bytes_validate(data, start, end);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (end - start !== this.size(null)) {
            throw new Error("Invalid bitvector: length not equal to vector length");
        }
        const value = [];
        for (let i = start; i < end - 1; i++) {
            value.push(...byteArray_1.getByteBits(data, i));
        }
        const lastBitLength = this.length % 8;
        if (!lastBitLength) {
            // vector takes up the whole byte, no need for checks
            value.push(...byteArray_1.getByteBits(data, end - 1));
        }
        else {
            const lastBits = byteArray_1.getByteBits(data, end - 1);
            if (lastBits.slice(lastBitLength).some((b) => b)) {
                throw new Error("Invalid bitvector: nonzero bits past length");
            }
            value.push(...lastBits.slice(0, lastBitLength));
        }
        return value;
    }
    struct_serializeToBytes(value, output, offset) {
        const byteLength = this.struct_getByteLength(value);
        for (let i = 0; i < byteLength; i++) {
            output[offset + i] = this.struct_getByte(value, i);
        }
        return offset + byteLength;
    }
    struct_getRootAtChunkIndex(value, chunkIndex) {
        const output = new Uint8Array(constants_1.BYTES_PER_CHUNK);
        const byteLength = Math.min(constants_1.BYTES_PER_CHUNK, this.struct_getByteLength(value) - chunkIndex);
        const byteOffset = chunkIndex * constants_1.BYTES_PER_CHUNK;
        for (let i = 0; i < byteLength; i++) {
            output[i] = this.struct_getByte(value, i + byteOffset);
        }
        return output;
    }
    struct_convertFromJson(data) {
        const bytes = byteArray_1.fromHexString(data);
        return this.fromBytes(bytes, 0, bytes.length);
    }
    struct_convertToJson(value) {
        return byteArray_1.toHexString(this.serialize(value));
    }
    tree_getByteLength(target) {
        return Math.ceil(this.tree_getLength(target) / 8);
    }
    tree_getSerializedLength(target) {
        return this.tree_getByteLength(target);
    }
    tree_deserializeFromBytes(data, start, end) {
        // mask last byte to ensure it doesn't go over length
        const lastByte = data[end - 1];
        // If the data len fits full bytes this check must be skipped.
        // Otherwise we must ensure that the extra bits are set to zero.
        const lastByteBitLen = this.length % 8;
        if (lastByteBitLen > 0) {
            const mask = (0xff << lastByteBitLen) & 0xff;
            if ((lastByte & mask) > 0) {
                throw new Error("Invalid deserialized bitvector length");
            }
        }
        return super.tree_deserializeFromBytes(data, start, end);
    }
    getBitOffset(index) {
        return index % 8;
    }
    getChunkOffset(index) {
        return Math.floor((index % 256) / 8);
    }
    getChunkIndex(index) {
        return Math.floor(index / 256);
    }
    tree_getChunkCount(target) {
        return Math.ceil(this.tree_getLength(target) / 256);
    }
    *tree_iterateValues(target) {
        const length = this.tree_getLength(target);
        const chunkCount = this.tree_getChunkCount(target);
        const nodes = target.getNodesAtDepth(this.getChunkDepth(), 0, chunkCount);
        let i = 0;
        for (let nodeIx = 0; nodeIx < nodes.length; nodeIx++) {
            const chunk = nodes[nodeIx].root;
            for (let j = 0; j < 256 && i < length; i++, j++) {
                const byte = chunk[this.getChunkOffset(i)];
                yield !!(byte & (1 << this.getBitOffset(i)));
            }
        }
    }
    tree_getValues(target) {
        const length = this.tree_getLength(target);
        const chunkCount = this.tree_getChunkCount(target);
        const nodes = target.getNodesAtDepth(this.getChunkDepth(), 0, chunkCount);
        let i = 0;
        const values = [];
        for (let nodeIx = 0; nodeIx < nodes.length; nodeIx++) {
            const chunk = nodes[nodeIx].root;
            for (let j = 0; j < 256 && i < length; i++, j++) {
                const byte = chunk[this.getChunkOffset(i)];
                values.push(!!(byte & (1 << this.getBitOffset(i))));
            }
        }
        return values;
    }
    tree_getValueAtIndex(target, index) {
        const chunk = this.tree_getRootAtChunkIndex(target, this.getChunkIndex(index));
        const byte = chunk[this.getChunkOffset(index)];
        return !!(byte & (1 << this.getBitOffset(index)));
    }
    tree_setProperty(target, property, value) {
        const chunkGindexBitString = this.getGindexBitStringAtChunkIndex(this.getChunkIndex(property));
        const chunk = new Uint8Array(32);
        chunk.set(target.getRoot(chunkGindexBitString));
        const byteOffset = this.getChunkOffset(property);
        if (value) {
            chunk[byteOffset] |= 1 << this.getBitOffset(property);
        }
        else {
            chunk[byteOffset] &= 0xff ^ (1 << this.getBitOffset(property));
        }
        target.setRoot(chunkGindexBitString, chunk);
        return true;
    }
    getMaxChunkCount() {
        return Math.ceil(this.length / 256);
    }
}
exports.BitVectorType = BitVectorType;
//# sourceMappingURL=bitVector.js.map