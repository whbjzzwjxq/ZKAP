"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deserializeProof = exports.serializeProof = exports.createNodeFromProof = exports.createProof = exports.ProofTypeSerialized = exports.ProofType = void 0;
const single_1 = require("./single");
const treeOffset_1 = require("./treeOffset");
var ProofType;
(function (ProofType) {
    ProofType["single"] = "single";
    ProofType["treeOffset"] = "treeOffset";
})(ProofType = exports.ProofType || (exports.ProofType = {}));
/**
 * Serialized proofs are prepended with a single byte, denoting their type
 */
exports.ProofTypeSerialized = [
    ProofType.single,
    ProofType.treeOffset, // 1
];
function createProof(rootNode, input) {
    switch (input.type) {
        case ProofType.single: {
            const [leaf, witnesses] = single_1.createSingleProof(rootNode, input.gindex);
            return {
                type: ProofType.single,
                gindex: input.gindex,
                leaf,
                witnesses,
            };
        }
        case ProofType.treeOffset: {
            const [offsets, leaves] = treeOffset_1.createTreeOffsetProof(rootNode, input.gindices);
            return {
                type: ProofType.treeOffset,
                offsets,
                leaves,
            };
        }
        default:
            throw new Error("Invalid proof type");
    }
}
exports.createProof = createProof;
function createNodeFromProof(proof) {
    switch (proof.type) {
        case ProofType.single:
            return single_1.createNodeFromSingleProof(proof.gindex, proof.leaf, proof.witnesses);
        case ProofType.treeOffset:
            return treeOffset_1.createNodeFromTreeOffsetProof(proof.offsets, proof.leaves);
        default:
            throw new Error("Invalid proof type");
    }
}
exports.createNodeFromProof = createNodeFromProof;
function serializeProof(proof) {
    switch (proof.type) {
        case ProofType.single:
            throw new Error("Not implemented");
        case ProofType.treeOffset: {
            const output = new Uint8Array(1 + treeOffset_1.computeTreeOffsetProofSerializedLength(proof.offsets, proof.leaves));
            output[0] = exports.ProofTypeSerialized.indexOf(ProofType.treeOffset);
            treeOffset_1.serializeTreeOffsetProof(output, 1, proof.offsets, proof.leaves);
            return output;
        }
        default:
            throw new Error("Invalid proof type");
    }
}
exports.serializeProof = serializeProof;
function deserializeProof(data) {
    const proofType = exports.ProofTypeSerialized[data[0]];
    if (!proofType) {
        throw new Error("Invalid proof type");
    }
    switch (proofType) {
        case ProofType.single:
            throw new Error("Not implemented");
        case ProofType.treeOffset: {
            const [offsets, leaves] = treeOffset_1.deserializeTreeOffsetProof(data, 1);
            return {
                type: ProofType.treeOffset,
                offsets,
                leaves,
            };
        }
        default:
            throw new Error("Invalid proof type");
    }
}
exports.deserializeProof = deserializeProof;
