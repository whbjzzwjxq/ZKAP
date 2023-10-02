"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTree = void 0;
function isTree(value) {
    return Boolean(value.rootNode && value.rootNode.isLeaf);
}
exports.isTree = isTree;
//# sourceMappingURL=tree.js.map