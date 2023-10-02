import { Gindex, GindexBitstring } from "../gindex";
/**
 * Compute both the path and branch indices
 *
 * Path indices are parent indices upwards toward the root
 * Branch indices are witnesses required for a merkle proof
 */
export declare function computeProofGindices(gindex: Gindex): {
    path: Set<Gindex>;
    branch: Set<Gindex>;
};
/**
 * Compute both the path and branch indices
 *
 * Path indices are parent indices upwards toward the root
 * Branch indices are witnesses required for a merkle proof
 */
export declare function computeProofBitstrings(gindex: GindexBitstring): {
    path: Set<GindexBitstring>;
    branch: Set<GindexBitstring>;
};
/**
 * Sort generalized indices in-order
 * @param bitLength maximum bit length of generalized indices to sort
 */
export declare function sortInOrderBitstrings(gindices: GindexBitstring[], bitLength: number): GindexBitstring[];
/**
 * Filter out parent generalized indices
 */
export declare function filterParentBitstrings(gindices: GindexBitstring[]): GindexBitstring[];
/**
 * Return the set of generalized indices required for a multiproof
 * This includes all leaves and any necessary witnesses
 * @param gindices leaves to include in proof
 * @returns all generalized indices required for a multiproof (leaves and witnesses), deduplicated and sorted in-order according to the tree
 */
export declare function computeMultiProofBitstrings(gindices: GindexBitstring[]): GindexBitstring[];
