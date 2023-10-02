"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compose = exports.identity = exports.LeafNode = exports.BranchNode = exports.Node = void 0;
const hash_1 = require("./hash");
const ERR_INVALID_TREE = "Invalid tree";
class Node {
    constructor() {
        // this is to save an extra variable to check if a node has a root or not
        this.h0 = null;
        this.h1 = 0;
        this.h2 = 0;
        this.h3 = 0;
        this.h4 = 0;
        this.h5 = 0;
        this.h6 = 0;
        this.h7 = 0;
    }
    applyHash(root) {
        this.h0 = root.h0;
        this.h1 = root.h1;
        this.h2 = root.h2;
        this.h3 = root.h3;
        this.h4 = root.h4;
        this.h5 = root.h5;
        this.h6 = root.h6;
        this.h7 = root.h7;
    }
}
exports.Node = Node;
class BranchNode extends Node {
    constructor(_left, _right) {
        super();
        this._left = _left;
        this._right = _right;
        if (!_left || !_right)
            throw new Error(ERR_INVALID_TREE);
    }
    get rootHashObject() {
        if (this.h0 === null) {
            super.applyHash(hash_1.hashTwoObjects(this.left.rootHashObject, this.right.rootHashObject));
        }
        return this;
    }
    get root() {
        return hash_1.hashObjectToUint8Array(this.rootHashObject);
    }
    isLeaf() {
        return false;
    }
    get left() {
        return this._left;
    }
    get right() {
        return this._right;
    }
    rebindLeft(left) {
        return new BranchNode(left, this.right);
    }
    rebindRight(right) {
        return new BranchNode(this.left, right);
    }
}
exports.BranchNode = BranchNode;
class LeafNode extends Node {
    constructor(_root) {
        super();
        if (hash_1.isHashObject(_root)) {
            this.applyHash(_root);
        }
        else {
            if (_root.length !== 32)
                throw new Error(ERR_INVALID_TREE);
            this.applyHash(hash_1.uint8ArrayToHashObject(_root));
        }
    }
    get rootHashObject() {
        return this;
    }
    get root() {
        return hash_1.hashObjectToUint8Array(this);
    }
    isLeaf() {
        return true;
    }
    get left() {
        throw Error("LeafNode has no left node");
    }
    get right() {
        throw Error("LeafNode has no right node");
    }
    rebindLeft() {
        throw Error("LeafNode has no left node");
    }
    rebindRight() {
        throw Error("LeafNode has no right node");
    }
}
exports.LeafNode = LeafNode;
function identity(n) {
    return n;
}
exports.identity = identity;
function compose(inner, outer) {
    return function (n) {
        return outer(inner(n));
    };
}
exports.compose = compose;
