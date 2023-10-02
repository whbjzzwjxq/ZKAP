"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mixInLength = exports.merkleize = exports.hash = void 0;
const hash_1 = require("./hash");
const merkleize_1 = require("./merkleize");
function hash(...inputs) {
    return Uint8Array.from(hash_1.hash(...inputs.map(Buffer.from)));
}
exports.hash = hash;
function merkleize(chunks, padTo) {
    return merkleize_1.merkleize(Array.from(chunks).map(Buffer.from), padTo);
}
exports.merkleize = merkleize;
function mixInLength(root, length) {
    const lengthBuf = Buffer.alloc(32);
    lengthBuf.writeUIntLE(length, 0, 6);
    return hash(root, lengthBuf);
}
exports.mixInLength = mixInLength;
//# sourceMappingURL=compat.js.map