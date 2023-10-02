import { HashObject } from "@chainsafe/as-sha256";
export declare abstract class Node implements HashObject {
    h0: number;
    h1: number;
    h2: number;
    h3: number;
    h4: number;
    h5: number;
    h6: number;
    h7: number;
    abstract root: Uint8Array;
    abstract rootHashObject: HashObject;
    abstract left: Node;
    abstract right: Node;
    applyHash(root: HashObject): void;
    abstract isLeaf(): boolean;
    abstract rebindLeft(left: Node): Node;
    abstract rebindRight(right: Node): Node;
}
export declare class BranchNode extends Node {
    private _left;
    private _right;
    constructor(_left: Node, _right: Node);
    get rootHashObject(): HashObject;
    get root(): Uint8Array;
    isLeaf(): boolean;
    get left(): Node;
    get right(): Node;
    rebindLeft(left: Node): Node;
    rebindRight(right: Node): Node;
}
export declare class LeafNode extends Node {
    constructor(_root: Uint8Array | HashObject);
    get rootHashObject(): HashObject;
    get root(): Uint8Array;
    isLeaf(): boolean;
    get left(): Node;
    get right(): Node;
    rebindLeft(): Node;
    rebindRight(): Node;
}
export declare type Link = (n: Node) => Node;
export declare function identity(n: Node): Node;
export declare function compose(inner: Link, outer: Link): Link;
