"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.basicTypeToLeafNode = void 0;
const persistent_merkle_tree_1 = require("@chainsafe/persistent-merkle-tree");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function basicTypeToLeafNode(type, value) {
    const chunk = new Uint8Array(32);
    type.toBytes(value, chunk, 0);
    return new persistent_merkle_tree_1.LeafNode(chunk);
}
exports.basicTypeToLeafNode = basicTypeToLeafNode;
//# sourceMappingURL=basic.js.map