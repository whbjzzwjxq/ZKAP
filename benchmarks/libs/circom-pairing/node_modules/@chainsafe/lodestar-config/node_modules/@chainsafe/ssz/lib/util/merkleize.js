"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mixInLength = exports.merkleize = void 0;
/** @module ssz */
const hash_1 = require("./hash");
const math_1 = require("./math");
const zeros_1 = require("./zeros");
/** @ignore */
function merkleize(chunks, padFor = 0) {
    const layerCount = math_1.bitLength(math_1.nextPowerOf2(padFor || chunks.length) - 1);
    if (chunks.length == 0) {
        return zeros_1.zeroHashes[layerCount];
    }
    // Instead of pushing on all padding zero chunks at the leaf level
    // we push on zero hash chunks at the highest possible level to avoid over-hashing
    let layer = 0;
    while (layer < layerCount) {
        // if the chunks.length is odd
        // we need to push on the zero-hash of that level to merkleize that level
        if (chunks.length % 2 == 1) {
            chunks.push(zeros_1.zeroHashes[layer]);
        }
        for (let i = 0; i < chunks.length; i += 2) {
            const h = hash_1.hash(chunks[i], chunks[i + 1]);
            chunks[i / 2] = Buffer.from(h.buffer, h.byteOffset, h.byteLength);
        }
        chunks.splice(chunks.length / 2, chunks.length / 2);
        layer++;
    }
    return chunks[0];
}
exports.merkleize = merkleize;
/** @ignore */
function mixInLength(root, length) {
    const lengthBuf = Buffer.alloc(32);
    lengthBuf.writeUIntLE(length, 0, 6);
    const h = hash_1.hash(root, lengthBuf);
    return Buffer.from(h.buffer, h.byteOffset, h.byteLength);
}
exports.mixInLength = mixInLength;
//# sourceMappingURL=merkleize.js.map