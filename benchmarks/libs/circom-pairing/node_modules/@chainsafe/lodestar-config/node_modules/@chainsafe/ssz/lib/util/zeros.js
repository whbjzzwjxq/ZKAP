"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zeroHashes = void 0;
/** @module ssz */
const constants_1 = require("./constants");
const hash_1 = require("./hash");
// create array of "zero hashes", successively hashed zero chunks
exports.zeroHashes = [Buffer.alloc(constants_1.BYTES_PER_CHUNK)];
for (let i = 0; i < 52; i++) {
    const h = hash_1.hash(exports.zeroHashes[i], exports.zeroHashes[i]);
    exports.zeroHashes.push(Buffer.from(h.buffer, h.byteOffset, h.byteLength));
}
//# sourceMappingURL=zeros.js.map