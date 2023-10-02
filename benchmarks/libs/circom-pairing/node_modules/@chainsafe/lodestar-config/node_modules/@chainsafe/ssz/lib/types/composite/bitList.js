"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BitListType = exports.isBitListType = exports.BITLIST_TYPE = void 0;
const list_1 = require("./list");
const basic_1 = require("../basic");
const type_1 = require("../type");
const byteArray_1 = require("../../util/byteArray");
const constants_1 = require("../../util/constants");
exports.BITLIST_TYPE = Symbol.for("ssz/BitListType");
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isBitListType(type) {
    return type_1.isTypeOf(type, exports.BITLIST_TYPE);
}
exports.isBitListType = isBitListType;
class BitListType extends list_1.BasicListType {
    constructor(options) {
        super({ elementType: basic_1.booleanType, ...options });
        this._typeSymbols.add(exports.BITLIST_TYPE);
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
    struct_getLength(value) {
        return value.length;
    }
    struct_getByteLength(value) {
        return Math.ceil(value.length / 8);
    }
    struct_getSerializedLength(value) {
        if (value.length % 8 === 0) {
            return this.struct_getByteLength(value) + 1;
        }
        else {
            return this.struct_getByteLength(value);
        }
    }
    getMaxSerializedLength() {
        return Math.ceil((this.limit + 1) / 8);
    }
    getMinSerializedLength() {
        return 1;
    }
    struct_getChunkCount(value) {
        return Math.ceil(this.struct_getLength(value) / 256);
    }
    struct_deserializeFromBytes(data, start, end) {
        this.bytes_validate(data, start, end);
        const value = [];
        const toBool = (c) => (c === "1" ? true : false);
        for (let i = start; i < end - 1; i++) {
            let bitstring = data[i].toString(2);
            bitstring = "0".repeat(8 - bitstring.length) + bitstring;
            value.push(...Array.prototype.map.call(bitstring, toBool).reverse());
        }
        const lastByte = data[end - 1];
        if (lastByte === 0) {
            throw new Error("Invalid deserialized bitlist, padding bit required");
        }
        if (lastByte === 1) {
            return value;
        }
        const lastBits = Array.prototype.map.call(lastByte.toString(2), toBool).reverse();
        const last1 = lastBits.lastIndexOf(true);
        value.push(...lastBits.slice(0, last1));
        if (value.length > this.limit) {
            throw new Error("Invalid deserialized bitlist, length greater than limit");
        }
        return value;
    }
    struct_serializeToBytes(value, output, offset) {
        const byteLength = this.struct_getByteLength(value);
        for (let i = 0; i < byteLength; i++) {
            output[offset + i] = this.struct_getByte(value, i);
        }
        const newOffset = offset + byteLength;
        if (value.length % 8 === 0) {
            output[newOffset] = 1;
            return newOffset + 1;
        }
        else {
            output[newOffset - 1] |= 1 << value.length % 8;
            return newOffset;
        }
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
        return this.struct_deserializeFromBytes(bytes, 0, bytes.length);
    }
    struct_convertToJson(value) {
        return byteArray_1.toHexString(this.serialize(value));
    }
    tree_getByteLength(target) {
        return Math.ceil(this.tree_getLength(target) / 8);
    }
    tree_getSerializedLength(target) {
        const bitLength = this.tree_getLength(target);
        if (bitLength % 8 === 0) {
            return this.tree_getByteLength(target) + 1;
        }
        else {
            return this.tree_getByteLength(target);
        }
    }
    tree_deserializeFromBytes(data, start, end) {
        const lastByte = data[end - 1];
        if (lastByte === 0) {
            throw new Error("Invalid deserialized bitlist, padding bit required");
        }
        if (lastByte === 1) {
            const target = super.tree_deserializeFromBytes(data, start, end - 1);
            const length = (end - start - 1) * 8;
            this.tree_setLength(target, length);
            return target;
        }
        // the last byte is > 1, so a padding bit will exist in the last byte and need to be removed
        const target = super.tree_deserializeFromBytes(data, start, end);
        const lastGindexBitString = this.getGindexBitStringAtChunkIndex(Math.ceil((end - start) / 32) - 1);
        // copy chunk into new memory
        const lastChunk = new Uint8Array(32);
        lastChunk.set(target.getRoot(lastGindexBitString));
        const lastChunkByte = ((end - start) % 32) - 1;
        // mask lastChunkByte
        const lastByteBitLength = lastByte.toString(2).length - 1;
        const length = (end - start - 1) * 8 + lastByteBitLength;
        const mask = 0xff >> (8 - lastByteBitLength);
        lastChunk[lastChunkByte] &= mask;
        target.setRoot(lastGindexBitString, lastChunk);
        this.tree_setLength(target, length);
        return target;
    }
    tree_serializeToBytes(target, output, offset) {
        const sizeNoPadding = this.tree_getByteLength(target);
        const fullChunkCount = Math.floor(sizeNoPadding / 32);
        const remainder = sizeNoPadding % 32;
        let i = 0;
        if (fullChunkCount > 0) {
            const nodes = target.getNodesAtDepth(this.getChunkDepth(), 0, fullChunkCount);
            for (; i < nodes.length; i++) {
                output.set(nodes[i].root, offset + i * 32);
            }
        }
        if (remainder) {
            output.set(this.tree_getRootAtChunkIndex(target, fullChunkCount).slice(0, remainder), offset + i * 32);
        }
        const bitLength = this.tree_getLength(target);
        const size = this.tree_getSerializedLength(target);
        const newOffset = offset + size;
        // set padding bit
        output[newOffset - 1] |= 1 << bitLength % 8;
        return newOffset;
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
    tree_setValueAtIndex(target, property, value, expand = false) {
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
        target.setRoot(chunkGindexBitString, chunk, expand);
        return true;
    }
    getMaxChunkCount() {
        return Math.ceil(this.limit / 256);
    }
}
exports.BitListType = BitListType;
//# sourceMappingURL=bitList.js.map