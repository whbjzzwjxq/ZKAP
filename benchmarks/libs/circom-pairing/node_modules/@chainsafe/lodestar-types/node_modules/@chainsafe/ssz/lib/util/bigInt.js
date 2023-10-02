"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bigIntPow = void 0;
function bigIntPow(base, exponent) {
    if (exponent < 0) {
        throw new RangeError("Exponent must be positive");
    }
    let out = BigInt(1);
    for (; exponent > 0; exponent--) {
        out *= base;
    }
    return out;
}
exports.bigIntPow = bigIntPow;
//# sourceMappingURL=bigInt.js.map