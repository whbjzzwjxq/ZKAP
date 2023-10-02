"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zeroNode = void 0;
const node_1 = require("./node");
const zeroes = [new node_1.LeafNode(new Uint8Array(32))];
function zeroNode(depth) {
    if (depth >= zeroes.length) {
        for (let i = zeroes.length; i <= depth; i++) {
            zeroes[i] = new node_1.BranchNode(zeroes[i - 1], zeroes[i - 1]);
        }
    }
    return zeroes[depth];
}
exports.zeroNode = zeroNode;
