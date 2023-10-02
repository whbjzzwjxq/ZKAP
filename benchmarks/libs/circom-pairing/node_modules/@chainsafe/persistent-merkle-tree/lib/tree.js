"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tree = void 0;
const gindex_1 = require("./gindex");
const node_1 = require("./node");
const proof_1 = require("./proof");
const single_1 = require("./proof/single");
const zeroNode_1 = require("./zeroNode");
const ERR_INVALID_TREE = "Invalid tree operation";
const ERR_PARAM_LT_ZERO = "Param must be >= 0";
const ERR_COUNT_GT_DEPTH = "Count extends beyond depth limit";
class Tree {
    constructor(node, hook) {
        this._node = node;
        if (hook) {
            if (typeof WeakRef === "undefined") {
                this.hook = hook;
            }
            else {
                this.hook = new WeakRef(hook);
            }
        }
    }
    static createFromProof(proof) {
        return new Tree(proof_1.createNodeFromProof(proof));
    }
    get rootNode() {
        return this._node;
    }
    set rootNode(n) {
        this._node = n;
        if (this.hook) {
            // WeakRef should not change status during a program's execution
            // So, use WeakRef feature detection to assume the type of this.hook
            // to minimize the memory footprint of Tree
            if (typeof WeakRef === "undefined") {
                this.hook(this);
            }
            else {
                const hookVar = this.hook.deref();
                if (hookVar) {
                    hookVar(this);
                }
                else {
                    // Hook has been garbage collected, no need to keep the hookRef
                    this.hook = undefined;
                }
            }
        }
    }
    get root() {
        return this.rootNode.root;
    }
    getNode(index) {
        let node = this.rootNode;
        const bitstring = gindex_1.convertGindexToBitstring(index);
        for (let i = 1; i < bitstring.length; i++) {
            if (bitstring[i] === "1") {
                if (node.isLeaf())
                    throw new Error(ERR_INVALID_TREE);
                node = node.right;
            }
            else {
                if (node.isLeaf())
                    throw new Error(ERR_INVALID_TREE);
                node = node.left;
            }
        }
        return node;
    }
    setNode(gindex, n, expand = false) {
        // Pre-compute entire bitstring instead of using an iterator (25% faster)
        let bitstring;
        if (typeof gindex === "string") {
            bitstring = gindex;
        }
        else {
            if (gindex < 1) {
                throw new Error("Invalid gindex < 1");
            }
            bitstring = gindex.toString(2);
        }
        const parentNodes = this.getParentNodes(bitstring, expand);
        this.rebindNodeToRoot(bitstring, parentNodes, n);
    }
    getRoot(index) {
        return this.getNode(index).root;
    }
    getHashObject(index) {
        return this.getNode(index);
    }
    setRoot(index, root, expand = false) {
        this.setNode(index, new node_1.LeafNode(root), expand);
    }
    setHashObject(index, hashObject, expand = false) {
        this.setNode(index, new node_1.LeafNode(hashObject), expand);
    }
    /**
     * Traverse from root node to node, get hash object, then apply the function to get new node
     * and set the new node. This is a convenient method to avoid traversing the tree 2 times to
     * get and set.
     */
    setHashObjectFn(gindex, hashObjectFn, expand = false) {
        // Pre-compute entire bitstring instead of using an iterator (25% faster)
        let bitstring;
        if (typeof gindex === "string") {
            bitstring = gindex;
        }
        else {
            if (gindex < 1) {
                throw new Error("Invalid gindex < 1");
            }
            bitstring = gindex.toString(2);
        }
        const parentNodes = this.getParentNodes(bitstring, expand);
        const lastParentNode = parentNodes[parentNodes.length - 1];
        const lastBit = bitstring[bitstring.length - 1];
        const oldNode = lastBit === "1" ? lastParentNode.right : lastParentNode.left;
        const newNode = new node_1.LeafNode(hashObjectFn(oldNode));
        this.rebindNodeToRoot(bitstring, parentNodes, newNode);
    }
    getSubtree(index) {
        return new Tree(this.getNode(index), (v) => this.setNode(index, v.rootNode));
    }
    setSubtree(index, v, expand = false) {
        this.setNode(index, v.rootNode, expand);
    }
    clone() {
        return new Tree(this.rootNode);
    }
    getSingleProof(index) {
        return single_1.createSingleProof(this.rootNode, index)[1];
    }
    /**
     * Fast read-only iteration
     * In-order traversal of nodes at `depth`
     * starting from the `startIndex`-indexed node
     * iterating through `count` nodes
     */
    *iterateNodesAtDepth(depth, startIndex, count) {
        // Strategy:
        // First nagivate to the starting Gindex node,
        // At each level record the tuple (current node, the navigation direction) in a list (Left=0, Right=1)
        // Once we reach the starting Gindex node, the list will be length == depth
        // Begin emitting nodes: Outer loop:
        //   Yield the current node
        //   Inner loop
        //     pop off the end of the list
        //     If its (N, Left) (we've nav'd the left subtree, but not the right subtree)
        //       push (N, Right) and set set node as the n.right
        //       push (N, Left) and set node as n.left until list length == depth
        //   Inner loop until the list length == depth
        // Outer loop until the list is empty or the yield count == count
        if (startIndex < 0 || count < 0 || depth < 0) {
            throw new Error(ERR_PARAM_LT_ZERO);
        }
        if (BigInt(1) << BigInt(depth) < startIndex + count) {
            throw new Error(ERR_COUNT_GT_DEPTH);
        }
        if (count === 0) {
            return;
        }
        if (depth === 0) {
            yield this.rootNode;
            return;
        }
        let node = this.rootNode;
        let currCount = 0;
        const startGindex = gindex_1.toGindexBitstring(depth, startIndex);
        const nav = [];
        for (let i = 1; i < startGindex.length; i++) {
            const bit = Number(startGindex[i]);
            nav.push([node, bit]);
            if (bit) {
                if (node.isLeaf())
                    throw new Error(ERR_INVALID_TREE);
                node = node.right;
            }
            else {
                if (node.isLeaf())
                    throw new Error(ERR_INVALID_TREE);
                node = node.left;
            }
        }
        while (nav.length && currCount < count) {
            yield node;
            currCount++;
            if (currCount === count) {
                return;
            }
            do {
                const [parentNode, direction] = nav.pop();
                // if direction was left
                if (!direction) {
                    // now navigate right
                    nav.push([parentNode, 1]);
                    if (parentNode.isLeaf())
                        throw new Error(ERR_INVALID_TREE);
                    node = parentNode.right;
                    // and then left as far as possible
                    while (nav.length !== depth) {
                        nav.push([node, 0]);
                        if (node.isLeaf())
                            throw new Error(ERR_INVALID_TREE);
                        node = node.left;
                    }
                }
            } while (nav.length && nav.length !== depth);
        }
    }
    /**
     * Fast read-only iteration
     * In-order traversal of nodes at `depth`
     * starting from the `startIndex`-indexed node
     * iterating through `count` nodes
     */
    getNodesAtDepth(depth, startIndex, count) {
        // Strategy:
        // First nagivate to the starting Gindex node,
        // At each level record the tuple (current node, the navigation direction) in a list (Left=0, Right=1)
        // Once we reach the starting Gindex node, the list will be length == depth
        // Begin emitting nodes: Outer loop:
        //   Yield the current node
        //   Inner loop
        //     pop off the end of the list
        //     If its (N, Left) (we've nav'd the left subtree, but not the right subtree)
        //       push (N, Right) and set set node as the n.right
        //       push (N, Left) and set node as n.left until list length == depth
        //   Inner loop until the list length == depth
        // Outer loop until the list is empty or the yield count == count
        if (startIndex < 0 || count < 0 || depth < 0) {
            throw new Error(ERR_PARAM_LT_ZERO);
        }
        if (BigInt(1) << BigInt(depth) < startIndex + count) {
            throw new Error(ERR_COUNT_GT_DEPTH);
        }
        if (count === 0) {
            return [];
        }
        if (depth === 0) {
            return [this.rootNode];
        }
        const nodes = [];
        let node = this.rootNode;
        let currCount = 0;
        const startGindex = gindex_1.toGindexBitstring(depth, startIndex);
        const nav = [];
        for (let i = 1; i < startGindex.length; i++) {
            const bit = Number(startGindex[i]);
            nav.push([node, bit]);
            if (bit) {
                if (node.isLeaf())
                    throw new Error(ERR_INVALID_TREE);
                node = node.right;
            }
            else {
                if (node.isLeaf())
                    throw new Error(ERR_INVALID_TREE);
                node = node.left;
            }
        }
        while (nav.length && currCount < count) {
            nodes.push(node);
            currCount++;
            if (currCount === count) {
                break;
            }
            do {
                const [parentNode, direction] = nav.pop();
                // if direction was left
                if (!direction) {
                    // now navigate right
                    nav.push([parentNode, 1]);
                    if (parentNode.isLeaf())
                        throw new Error(ERR_INVALID_TREE);
                    node = parentNode.right;
                    // and then left as far as possible
                    while (nav.length !== depth) {
                        nav.push([node, 0]);
                        if (node.isLeaf())
                            throw new Error(ERR_INVALID_TREE);
                        node = node.left;
                    }
                }
            } while (nav.length && nav.length !== depth);
        }
        return nodes;
    }
    getProof(input) {
        return proof_1.createProof(this.rootNode, input);
    }
    /**
     * Traverse the tree from root node, ignore the last bit to get all parent nodes
     * of the specified bitstring.
     */
    getParentNodes(bitstring, expand = false) {
        let node = this.rootNode;
        // Keep a list of all parent nodes of node at gindex `index`. Then walk the list
        // backwards to rebind them "recursively" with the new nodes without using functions
        const parentNodes = [this.rootNode];
        // Ignore the first bit, left right directions are at bits [1,..]
        // Ignore the last bit, no need to push the target node to the parentNodes array
        for (let i = 1; i < bitstring.length - 1; i++) {
            if (node.isLeaf()) {
                if (!expand) {
                    throw new Error(ERR_INVALID_TREE);
                }
                else {
                    node = zeroNode_1.zeroNode(bitstring.length - i);
                }
            }
            // Compare to string directly to prevent unnecessary type conversions
            if (bitstring[i] === "1") {
                node = node.right;
            }
            else {
                node = node.left;
            }
            parentNodes.push(node);
        }
        return parentNodes;
    }
    /**
     * Build a new tree structure from bitstring, parentNodes and a new node.
     * Note: keep the same Tree, just mutate the root node.
     */
    rebindNodeToRoot(bitstring, parentNodes, newNode) {
        let node = newNode;
        // Ignore the first bit, left right directions are at bits [1,..]
        // Iterate the list backwards including the last bit, but offset the parentNodes array
        // by one since the first bit in bitstring was ignored in the previous loop
        for (let i = bitstring.length - 1; i >= 1; i--) {
            if (bitstring[i] === "1") {
                node = parentNodes[i - 1].rebindRight(node);
            }
            else {
                node = parentNodes[i - 1].rebindLeft(node);
            }
        }
        this.rootNode = node;
    }
}
exports.Tree = Tree;
