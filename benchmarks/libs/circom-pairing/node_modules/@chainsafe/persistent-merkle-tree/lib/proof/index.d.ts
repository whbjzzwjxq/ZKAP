import { Gindex } from "../gindex";
import { Node } from "../node";
export declare enum ProofType {
    single = "single",
    treeOffset = "treeOffset"
}
/**
 * Serialized proofs are prepended with a single byte, denoting their type
 */
export declare const ProofTypeSerialized: ProofType[];
export interface SingleProof {
    type: ProofType.single;
    gindex: Gindex;
    leaf: Uint8Array;
    witnesses: Uint8Array[];
}
export interface TreeOffsetProof {
    type: ProofType.treeOffset;
    offsets: number[];
    leaves: Uint8Array[];
}
export declare type Proof = SingleProof | TreeOffsetProof;
export interface SingleProofInput {
    type: ProofType.single;
    gindex: Gindex;
}
export interface TreeOffsetProofInput {
    type: ProofType.treeOffset;
    gindices: Gindex[];
}
export declare type ProofInput = SingleProofInput | TreeOffsetProofInput;
export declare function createProof(rootNode: Node, input: ProofInput): Proof;
export declare function createNodeFromProof(proof: Proof): Node;
export declare function serializeProof(proof: Proof): Uint8Array;
export declare function deserializeProof(data: Uint8Array): Proof;
