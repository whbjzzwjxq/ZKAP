import { Gindex, GindexBitstring } from "./gindex";
import { Node } from "./node";
import { HashObject } from "@chainsafe/as-sha256";
import { Proof, ProofInput } from "./proof";
export declare type Hook = (v: Tree) => void;
export declare type HashObjectFn = (hashObject: HashObject) => HashObject;
export declare class Tree {
    private _node;
    private hook?;
    constructor(node: Node, hook?: Hook);
    static createFromProof(proof: Proof): Tree;
    get rootNode(): Node;
    set rootNode(n: Node);
    get root(): Uint8Array;
    getNode(index: Gindex | GindexBitstring): Node;
    setNode(gindex: Gindex | GindexBitstring, n: Node, expand?: boolean): void;
    getRoot(index: Gindex | GindexBitstring): Uint8Array;
    getHashObject(index: Gindex | GindexBitstring): HashObject;
    setRoot(index: Gindex | GindexBitstring, root: Uint8Array, expand?: boolean): void;
    setHashObject(index: Gindex | GindexBitstring, hashObject: HashObject, expand?: boolean): void;
    /**
     * Traverse from root node to node, get hash object, then apply the function to get new node
     * and set the new node. This is a convenient method to avoid traversing the tree 2 times to
     * get and set.
     */
    setHashObjectFn(gindex: Gindex | GindexBitstring, hashObjectFn: HashObjectFn, expand?: boolean): void;
    getSubtree(index: Gindex | GindexBitstring): Tree;
    setSubtree(index: Gindex | GindexBitstring, v: Tree, expand?: boolean): void;
    clone(): Tree;
    getSingleProof(index: Gindex): Uint8Array[];
    /**
     * Fast read-only iteration
     * In-order traversal of nodes at `depth`
     * starting from the `startIndex`-indexed node
     * iterating through `count` nodes
     */
    iterateNodesAtDepth(depth: number, startIndex: number, count: number): IterableIterator<Node>;
    /**
     * Fast read-only iteration
     * In-order traversal of nodes at `depth`
     * starting from the `startIndex`-indexed node
     * iterating through `count` nodes
     */
    getNodesAtDepth(depth: number, startIndex: number, count: number): Node[];
    getProof(input: ProofInput): Proof;
    /**
     * Traverse the tree from root node, ignore the last bit to get all parent nodes
     * of the specified bitstring.
     */
    private getParentNodes;
    /**
     * Build a new tree structure from bitstring, parentNodes and a new node.
     * Note: keep the same Tree, just mutate the root node.
     */
    private rebindNodeToRoot;
}
