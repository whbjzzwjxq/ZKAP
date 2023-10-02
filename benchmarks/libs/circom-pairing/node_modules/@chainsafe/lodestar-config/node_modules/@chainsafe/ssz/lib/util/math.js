"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.previousPowerOf2 = exports.nextPowerOf2 = exports.bitLength = void 0;
/** @ignore */
function bitLength(n) {
    const bitstring = n.toString(2);
    if (bitstring === "0") {
        return 0;
    }
    return bitstring.length;
}
exports.bitLength = bitLength;
/** @ignore */
function nextPowerOf2(n) {
    return n <= 0 ? 1 : Math.pow(2, bitLength(n - 1));
}
exports.nextPowerOf2 = nextPowerOf2;
/** @ignore */
function previousPowerOf2(n) {
    return n === 0 ? 1 : Math.pow(2, bitLength(n) - 1);
}
exports.previousPowerOf2 = previousPowerOf2;
//# sourceMappingURL=math.js.map