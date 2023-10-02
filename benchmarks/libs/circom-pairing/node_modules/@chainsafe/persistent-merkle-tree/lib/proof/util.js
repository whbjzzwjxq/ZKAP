"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeMultiProofBitstrings = exports.filterParentBitstrings = exports.sortInOrderBitstrings = exports.computeProofBitstrings = exports.computeProofGindices = void 0;
const gindex_1 = require("../gindex");
// Not currently in use, but simpler implementation useful for testing
/**
 * Compute both the path and branch indices
 *
 * Path indices are parent indices upwards toward the root
 * Branch indices are witnesses required for a merkle proof
 */
function computeProofGindices(gindex) {
    const path = new Set();
    const branch = new Set();
    let g = gindex;
    while (g > 1) {
        path.add(g);
        branch.add(gindex_1.gindexSibling(g));
        g = gindex_1.gindexParent(g);
    }
    return { path, branch };
}
exports.computeProofGindices = computeProofGindices;
/**
 * Compute both the path and branch indices
 *
 * Path indices are parent indices upwards toward the root
 * Branch indices are witnesses required for a merkle proof
 */
function computeProofBitstrings(gindex) {
    const path = new Set();
    const branch = new Set();
    let g = gindex;
    while (g.length > 1) {
        path.add(g);
        const lastBit = g[g.length - 1];
        const parent = g.substring(0, g.length - 1);
        branch.add(parent + (Number(lastBit) ^ 1));
        g = parent;
    }
    return { path, branch };
}
exports.computeProofBitstrings = computeProofBitstrings;
/**
 * Sort generalized indices in-order
 * @param bitLength maximum bit length of generalized indices to sort
 */
function sortInOrderBitstrings(gindices, bitLength) {
    if (!gindices.length) {
        return [];
    }
    return gindices
        .map((g) => g.padEnd(bitLength))
        .sort()
        .map((g) => g.trim());
}
exports.sortInOrderBitstrings = sortInOrderBitstrings;
/**
 * Filter out parent generalized indices
 */
function filterParentBitstrings(gindices) {
    const sortedBitstrings = gindices.sort((a, b) => a.length - b.length);
    const filtered = [];
    outer: for (let i = 0; i < sortedBitstrings.length; i++) {
        const bsA = sortedBitstrings[i];
        for (let j = i + 1; j < sortedBitstrings.length; j++) {
            const bsB = sortedBitstrings[j];
            if (bsB.startsWith(bsA)) {
                continue outer;
            }
        }
        filtered.push(bsA);
    }
    return filtered;
}
exports.filterParentBitstrings = filterParentBitstrings;
/**
 * Return the set of generalized indices required for a multiproof
 * This includes all leaves and any necessary witnesses
 * @param gindices leaves to include in proof
 * @returns all generalized indices required for a multiproof (leaves and witnesses), deduplicated and sorted in-order according to the tree
 */
function computeMultiProofBitstrings(gindices) {
    // Initialize the proof indices with the leaves
    const proof = new Set(filterParentBitstrings(gindices));
    const paths = new Set();
    const branches = new Set();
    // Collect all path indices and all branch indices
    let maxBitLength = 1;
    for (const gindex of proof) {
        if (gindex.length > maxBitLength)
            maxBitLength = gindex.length;
        const { path, branch } = computeProofBitstrings(gindex);
        path.forEach((g) => paths.add(g));
        branch.forEach((g) => branches.add(g));
    }
    // Remove all branches that are included in the paths
    paths.forEach((g) => branches.delete(g));
    // Add all remaining branches to the leaves
    branches.forEach((g) => proof.add(g));
    return sortInOrderBitstrings(Array.from(proof), maxBitLength);
}
exports.computeMultiProofBitstrings = computeMultiProofBitstrings;
