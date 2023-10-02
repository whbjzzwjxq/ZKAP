"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subtreeFillToContents = exports.subtreeFillToLength = exports.subtreeFillToDepth = void 0;
const node_1 = require("./node");
const zeroNode_1 = require("./zeroNode");
const ERR_NAVIGATION = "Navigation error";
const ERR_TOO_MANY_NODES = "Too many nodes";
// subtree filling
function subtreeFillToDepth(bottom, depth) {
    let node = bottom;
    while (depth > 0) {
        node = new node_1.BranchNode(node, node);
        depth--;
    }
    return node;
}
exports.subtreeFillToDepth = subtreeFillToDepth;
function subtreeFillToLength(bottom, depth, length) {
    const maxLength = 1 << depth;
    if (length > maxLength)
        throw new Error(ERR_TOO_MANY_NODES);
    if (length === maxLength)
        return subtreeFillToDepth(bottom, depth);
    if (depth === 0) {
        if (length === 1)
            return bottom;
        else
            throw new Error(ERR_NAVIGATION);
    }
    if (depth === 1) {
        return new node_1.BranchNode(bottom, length > 1 ? bottom : zeroNode_1.zeroNode(0));
    }
    const pivot = maxLength >> 1;
    if (length <= pivot) {
        return new node_1.BranchNode(subtreeFillToLength(bottom, depth - 1, length), zeroNode_1.zeroNode(depth - 1));
    }
    else {
        return new node_1.BranchNode(subtreeFillToDepth(bottom, depth - 1), subtreeFillToLength(bottom, depth - 1, length - pivot));
    }
}
exports.subtreeFillToLength = subtreeFillToLength;
function subtreeFillToContents(nodes, depth) {
    const maxLength = 2 ** depth;
    if (nodes.length > maxLength)
        throw new Error(ERR_TOO_MANY_NODES);
    if (depth === 0) {
        if (!nodes.length)
            return zeroNode_1.zeroNode(0);
        return nodes[0];
    }
    if (depth === 1) {
        if (!nodes.length)
            return zeroNode_1.zeroNode(1);
        return new node_1.BranchNode(nodes[0], nodes[1] || zeroNode_1.zeroNode(0));
    }
    const pivot = Math.floor(maxLength / 2);
    if (nodes.length <= pivot) {
        return new node_1.BranchNode(subtreeFillToContents(nodes, depth - 1), zeroNode_1.zeroNode(depth - 1));
    }
    else {
        return new node_1.BranchNode(subtreeFillToContents(nodes.slice(0, Number(pivot)), depth - 1), subtreeFillToContents(nodes.slice(Number(pivot)), depth - 1));
    }
}
exports.subtreeFillToContents = subtreeFillToContents;
