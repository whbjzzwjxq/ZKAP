"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BigIntUintType = exports.isBigIntUintType = exports.BIGINT_UINT_TYPE = exports.Number64UintType = exports.NumberUintType = exports.isNumber64UintType = exports.isNumberUintType = exports.NUMBER_64_UINT_TYPE = exports.NUMBER_UINT_TYPE = exports.UintType = exports.isUintType = exports.UINT_TYPE = void 0;
const bigInt_1 = require("../../util/bigInt");
const type_1 = require("../type");
const abstract_1 = require("./abstract");
exports.UINT_TYPE = Symbol.for("ssz/UintType");
function isUintType(type) {
    return type_1.isTypeOf(type, exports.UINT_TYPE);
}
exports.isUintType = isUintType;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
class UintType extends abstract_1.BasicType {
    constructor(options) {
        super();
        this.byteLength = options.byteLength;
        this.infinityWhenBig = options.infinityWhenBig === true ? true : this.byteLength > 6;
        this._typeSymbols.add(exports.UINT_TYPE);
    }
    struct_getSerializedLength() {
        return this.byteLength;
    }
    /**
     * Validate the exact byte length
     */
    bytes_validate_length(data, start, end) {
        this.bytes_validate(data, start);
        if (end !== undefined) {
            const length = end - start;
            if (length > this.struct_getSerializedLength()) {
                throw new Error(`Data length of ${length} is too big, expect ${this.struct_getSerializedLength()}`);
            }
        }
    }
}
exports.UintType = UintType;
exports.NUMBER_UINT_TYPE = Symbol.for("ssz/NumberUintType");
exports.NUMBER_64_UINT_TYPE = Symbol.for("ssz/Number64UintType");
const BIGINT_4_BYTES = BigInt(32);
function isNumberUintType(type) {
    return type_1.isTypeOf(type, exports.NUMBER_UINT_TYPE);
}
exports.isNumberUintType = isNumberUintType;
function isNumber64UintType(type) {
    return type_1.isTypeOf(type, exports.NUMBER_64_UINT_TYPE);
}
exports.isNumber64UintType = isNumber64UintType;
class NumberUintType extends UintType {
    constructor(options) {
        super(options);
        this._typeSymbols.add(exports.NUMBER_UINT_TYPE);
    }
    struct_assertValidValue(value) {
        if (value !== Infinity &&
            (!Number.isSafeInteger(value) ||
                value > bigInt_1.bigIntPow(BigInt(2), BigInt(8) * BigInt(this.byteLength)))) {
            throw new Error("Uint value is not a number");
        }
        if (value < 0) {
            throw new Error("Uint value must be gte 0");
        }
    }
    struct_defaultValue() {
        return 0;
    }
    struct_getMaxBigInt() {
        if (this._maxBigInt === undefined) {
            this._maxBigInt = bigInt_1.bigIntPow(BigInt(2), BigInt(this.byteLength * 8)) - BigInt(1);
        }
        return this._maxBigInt;
    }
    struct_serializeToBytes(value, output, offset) {
        if (this.byteLength > 6 && value === Infinity) {
            for (let i = offset; i < offset + this.byteLength; i++) {
                output[i] = 0xff;
            }
        }
        else {
            let v = value;
            const MAX_BYTE = 0xff;
            for (let i = 0; i < this.byteLength; i++) {
                output[offset + i] = v & MAX_BYTE;
                v = Math.floor(v / 256);
            }
        }
        return offset + this.byteLength;
    }
    struct_deserializeFromBytes(data, start, end) {
        // if this is a standalone deserialization, we want to validate more strictly
        if (end !== undefined) {
            this.bytes_validate_length(data, start, end);
        }
        else {
            this.bytes_validate(data, start);
        }
        let isInfinity = true;
        let output = 0;
        for (let i = 0; i < this.byteLength; i++) {
            output += data[start + i] * 2 ** (8 * i);
            if (data[start + i] !== 0xff) {
                isInfinity = false;
            }
        }
        if (this.infinityWhenBig && isInfinity) {
            return Infinity;
        }
        return Number(output);
    }
    struct_convertFromJson(data) {
        let n;
        const bigN = BigInt(data);
        if (this.infinityWhenBig && bigN === this.struct_getMaxBigInt()) {
            n = Infinity;
        }
        else if (bigN < Number.MAX_SAFE_INTEGER) {
            n = Number(bigN);
        }
        else {
            throw new Error("Uint value unsafe");
        }
        this.assertValidValue(n);
        return n;
    }
    struct_convertToJson(value) {
        if (this.byteLength > 4) {
            if (value === Infinity) {
                return this.struct_getMaxBigInt().toString();
            }
            return String(value);
        }
        return value;
    }
}
exports.NumberUintType = NumberUintType;
const TWO_POWER_32 = 2 ** 32;
/**
 * For 64 bit number, we want to operator on HashObject
 * over bytes to improve performance.
 */
class Number64UintType extends NumberUintType {
    constructor() {
        super({ byteLength: 8 });
        this._typeSymbols.add(exports.NUMBER_64_UINT_TYPE);
    }
    /**
     * TODO: move this logic all the way to persistent-merkle-tree?
     * That's save us 1 time to traverse the tree in the applyDelta scenario
     */
    struct_deserializeFromHashObject(data, byteOffset) {
        const numberOffset = Math.floor(byteOffset / 8);
        // a chunk contains 4 items
        if (numberOffset < 0 || numberOffset > 3) {
            throw new Error(`Invalid numberOffset ${numberOffset}`);
        }
        let low32Number = 0;
        let high32Number = 0;
        switch (numberOffset) {
            case 0:
                low32Number = data.h0 & 0xffffffff;
                high32Number = data.h1 & 0xffffffff;
                break;
            case 1:
                low32Number = data.h2 & 0xffffffff;
                high32Number = data.h3 & 0xffffffff;
                break;
            case 2:
                low32Number = data.h4 & 0xffffffff;
                high32Number = data.h5 & 0xffffffff;
                break;
            case 3:
                low32Number = data.h6 & 0xffffffff;
                high32Number = data.h7 & 0xffffffff;
                break;
            default:
                throw new Error(`Invalid offset ${numberOffset}`);
        }
        if (low32Number < 0)
            low32Number = low32Number >>> 0;
        if (high32Number === 0) {
            return low32Number;
        }
        else if (high32Number < 0) {
            high32Number = high32Number >>> 0;
        }
        if (low32Number === 0xffffffff && high32Number === 0xffffffff) {
            return Infinity;
        }
        return high32Number * TWO_POWER_32 + low32Number;
    }
    struct_serializeToHashObject(value, output, byteOffset) {
        const numberOffset = Math.floor(byteOffset / 8);
        let low32Number;
        let high32Number;
        if (value !== Infinity) {
            low32Number = value & 0xffffffff;
            high32Number = Math.floor(value / TWO_POWER_32) & 0xffffffff;
        }
        else {
            low32Number = 0xffffffff;
            high32Number = 0xffffffff;
        }
        switch (numberOffset) {
            case 0:
                output.h0 = low32Number;
                output.h1 = high32Number;
                break;
            case 1:
                output.h2 = low32Number;
                output.h3 = high32Number;
                break;
            case 2:
                output.h4 = low32Number;
                output.h5 = high32Number;
                break;
            case 3:
                output.h6 = low32Number;
                output.h7 = high32Number;
                break;
            default:
                throw new Error(`Invalid offset ${numberOffset}`);
        }
        return numberOffset + 1;
    }
}
exports.Number64UintType = Number64UintType;
exports.BIGINT_UINT_TYPE = Symbol.for("ssz/BigIntUintType");
function isBigIntUintType(type) {
    return type_1.isTypeOf(type, exports.BIGINT_UINT_TYPE);
}
exports.isBigIntUintType = isBigIntUintType;
class BigIntUintType extends UintType {
    constructor(options) {
        super(options);
        this._typeSymbols.add(exports.BIGINT_UINT_TYPE);
    }
    struct_assertValidValue(value) {
        if (typeof value !== "bigint") {
            throw new Error("Uint value is not a bigint");
        }
        if (value < 0) {
            throw new Error("Uint value must be gte 0");
        }
    }
    struct_defaultValue() {
        return BigInt(0);
    }
    struct_serializeToBytes(value, output, offset) {
        // Motivation
        // BigInt bit shifting and BigInt allocation is slower compared to number
        // For every 4 bytes, we extract value to groupedBytes
        // and do bit shifting on the number
        let v = value;
        let groupedBytes = Number(BigInt.asUintN(32, v));
        for (let i = 0; i < this.byteLength; i++) {
            output[offset + i] = Number(groupedBytes & 0xff);
            if ((i + 1) % 4 !== 0) {
                groupedBytes >>= 8;
            }
            else {
                v >>= BIGINT_4_BYTES;
                groupedBytes = Number(BigInt.asUintN(32, v));
            }
        }
        return offset + this.byteLength;
    }
    struct_deserializeFromBytes(data, start, end) {
        if (end !== undefined) {
            this.bytes_validate_length(data, start, end);
        }
        else {
            this.bytes_validate(data, start);
        }
        // Motivation:
        //   Creating BigInts and bitshifting is more expensive than
        // number bitshifting.
        // Implementation:
        //   Iterate throuth the bytearray, bitshifting the data into a 'groupOutput' number, byte by byte
        // After each 4 bytes, bitshift the groupOutput into the bigint output and clear the groupOutput out
        // After iterating through the bytearray,
        // There may be additional data in the groupOutput if the bytearray if the bytearray isn't divisible by 4
        let output = BigInt(0);
        let groupIndex = 0, groupOutput = 0;
        for (let i = 0; i < this.byteLength; i++) {
            groupOutput += data[start + i] << (8 * (i % 4));
            if ((i + 1) % 4 === 0) {
                // Left shift returns a signed integer and the output may have become negative
                // In that case, the output needs to be converted to unsigned integer
                if (groupOutput < 0) {
                    groupOutput >>>= 0;
                }
                // Optimization to set the output the first time, forgoing BigInt addition
                if (groupIndex === 0) {
                    output = BigInt(groupOutput);
                }
                else {
                    output += BigInt(groupOutput) << BigInt(32 * groupIndex);
                }
                groupIndex++;
                groupOutput = 0;
            }
        }
        // if this.byteLength isn't a multiple of 4, there will be additional data
        if (groupOutput) {
            output += BigInt(groupOutput >>> 0) << BigInt(32 * groupIndex);
        }
        return output;
    }
    struct_convertFromJson(data) {
        const value = BigInt(data);
        this.assertValidValue(value);
        return value;
    }
    struct_convertToJson(value) {
        if (this.byteLength > 4) {
            return value.toString();
        }
        else {
            return Number(value);
        }
    }
}
exports.BigIntUintType = BigIntUintType;
//# sourceMappingURL=uint.js.map