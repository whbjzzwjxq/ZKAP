"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BeaconState = exports.HistoricalBatch = exports.HistoricalStateRoots = exports.HistoricalBlockRoots = exports.PowBlock = exports.SignedBeaconBlock = exports.BeaconBlock = exports.BeaconBlockBody = exports.ExecutionPayloadHeader = exports.ExecutionPayload = exports.Transactions = exports.Transaction = void 0;
const ssz_1 = require("@chainsafe/ssz");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const primitive_1 = require("../primitive");
const phase0_1 = require("../phase0");
const altair_1 = require("../altair");
const lazyVar_1 = require("../utils/lazyVar");
const sszTypes_1 = require("../primitive/sszTypes");
const { Bytes20, Bytes32, Number64, Slot, ValidatorIndex, Root, BLSSignature, Uint8 } = primitive_1.ssz;
// So the expandedRoots can be referenced, and break the circular dependency
const typesRef = new lazyVar_1.LazyVariable();
/**
 * ByteList[MAX_BYTES_PER_TRANSACTION]
 *
 * Spec v1.0.1
 */
exports.Transaction = new ssz_1.ListType({ elementType: ssz_1.byteType, limit: lodestar_params_1.MAX_BYTES_PER_TRANSACTION });
exports.Transactions = new ssz_1.ListType({
    elementType: exports.Transaction,
    limit: lodestar_params_1.MAX_TRANSACTIONS_PER_PAYLOAD,
});
const executionPayloadFields = {
    parentHash: Root,
    feeRecipient: Bytes20,
    stateRoot: Bytes32,
    receiptsRoot: Bytes32,
    logsBloom: new ssz_1.ByteVectorType({ length: lodestar_params_1.BYTES_PER_LOGS_BLOOM }),
    random: Bytes32,
    blockNumber: Number64,
    gasLimit: Number64,
    gasUsed: Number64,
    timestamp: Number64,
    // TODO: if there is perf issue, consider making ByteListType
    extraData: new ssz_1.ListType({ limit: lodestar_params_1.MAX_EXTRA_DATA_BYTES, elementType: Uint8 }),
    baseFeePerGas: sszTypes_1.Uint256,
    // Extra payload fields
    blockHash: Root,
};
const executionPayloadCasingMap = {
    parentHash: "parent_hash",
    feeRecipient: "fee_recipient",
    stateRoot: "state_root",
    receiptsRoot: "receipts_root",
    logsBloom: "logs_bloom",
    random: "random",
    blockNumber: "block_number",
    gasLimit: "gas_limit",
    gasUsed: "gas_used",
    timestamp: "timestamp",
    extraData: "extra_data",
    baseFeePerGas: "base_fee_per_gas",
    blockHash: "block_hash",
};
/**
 * ```python
 * class ExecutionPayload(Container):
 *     # Execution block header fields
 *     parent_hash: Hash32
 *     coinbase: Bytes20  # 'beneficiary' in the yellow paper
 *     state_root: Bytes32
 *     receipt_root: Bytes32  # 'receipts root' in the yellow paper
 *     logs_bloom: ByteVector[BYTES_PER_LOGS_BLOOM]
 *     random: Bytes32  # 'difficulty' in the yellow paper
 *     block_number: uint64  # 'number' in the yellow paper
 *     gas_limit: uint64
 *     gas_used: uint64
 *     timestamp: uint64
 *     extra_data: ByteList[MAX_EXTRA_DATA_BYTES]
 *     base_fee_per_gas: Bytes32  # base fee introduced in EIP-1559, little-endian serialized
 *     # Extra payload fields
 *     block_hash: Hash32  # Hash of execution block
 *     transactions: List[Transaction, MAX_TRANSACTIONS_PER_PAYLOAD]
 * ```
 *
 * Spec v1.0.1
 */
exports.ExecutionPayload = new ssz_1.ContainerType({
    fields: {
        ...executionPayloadFields,
        transactions: exports.Transactions,
    },
    casingMap: {
        ...executionPayloadCasingMap,
        transactions: "transactions",
    },
});
/**
 * ```python
 * class ExecutionPayload(Container):
 *     ...
 *     transactions_root: Root
 * ```
 *
 * Spec v1.0.1
 */
exports.ExecutionPayloadHeader = new ssz_1.ContainerType({
    fields: {
        ...executionPayloadFields,
        transactionsRoot: Root,
    },
    casingMap: {
        ...executionPayloadCasingMap,
        transactionsRoot: "transactions_root",
    },
});
exports.BeaconBlockBody = new ssz_1.ContainerType({
    fields: {
        ...altair_1.ssz.BeaconBlockBody.fields,
        executionPayload: exports.ExecutionPayload,
    },
    casingMap: {
        ...altair_1.ssz.BeaconBlockBody.casingMap,
        executionPayload: "execution_payload",
    },
});
exports.BeaconBlock = new ssz_1.ContainerType({
    fields: {
        slot: Slot,
        proposerIndex: ValidatorIndex,
        // Reclare expandedType() with altair block and altair state
        parentRoot: new ssz_1.RootType({ expandedType: () => typesRef.get().BeaconBlock }),
        stateRoot: new ssz_1.RootType({ expandedType: () => typesRef.get().BeaconState }),
        body: exports.BeaconBlockBody,
    },
    casingMap: altair_1.ssz.BeaconBlock.casingMap,
});
exports.SignedBeaconBlock = new ssz_1.ContainerType({
    fields: {
        message: exports.BeaconBlock,
        signature: BLSSignature,
    },
    expectedCase: "notransform",
});
exports.PowBlock = new ssz_1.ContainerType({
    fields: {
        blockHash: Root,
        parentHash: Root,
        totalDifficulty: sszTypes_1.Uint256,
    },
    casingMap: {
        blockHash: "block_hash",
        parentHash: "parent_hash",
        totalDifficulty: "total_difficulty",
    },
});
// Re-declare with the new expanded type
exports.HistoricalBlockRoots = new ssz_1.VectorType({
    elementType: new ssz_1.RootType({ expandedType: () => typesRef.get().BeaconBlock }),
    length: lodestar_params_1.SLOTS_PER_HISTORICAL_ROOT,
});
exports.HistoricalStateRoots = new ssz_1.VectorType({
    elementType: new ssz_1.RootType({ expandedType: () => typesRef.get().BeaconState }),
    length: lodestar_params_1.SLOTS_PER_HISTORICAL_ROOT,
});
exports.HistoricalBatch = new ssz_1.ContainerType({
    fields: {
        blockRoots: exports.HistoricalBlockRoots,
        stateRoots: exports.HistoricalStateRoots,
    },
    casingMap: phase0_1.ssz.HistoricalBatch.casingMap,
});
// we don't reuse phase0.BeaconState fields since we need to replace some keys
// and we cannot keep order doing that
exports.BeaconState = new ssz_1.ContainerType({
    fields: {
        genesisTime: Number64,
        genesisValidatorsRoot: Root,
        slot: primitive_1.ssz.Slot,
        fork: phase0_1.ssz.Fork,
        // History
        latestBlockHeader: phase0_1.ssz.BeaconBlockHeader,
        blockRoots: exports.HistoricalBlockRoots,
        stateRoots: exports.HistoricalStateRoots,
        historicalRoots: new ssz_1.ListType({
            elementType: new ssz_1.RootType({ expandedType: exports.HistoricalBatch }),
            limit: lodestar_params_1.HISTORICAL_ROOTS_LIMIT,
        }),
        // Eth1
        eth1Data: phase0_1.ssz.Eth1Data,
        eth1DataVotes: phase0_1.ssz.Eth1DataVotes,
        eth1DepositIndex: Number64,
        // Registry
        validators: phase0_1.ssz.Validators,
        balances: phase0_1.ssz.Balances,
        randaoMixes: phase0_1.ssz.RandaoMixes,
        // Slashings
        slashings: phase0_1.ssz.Slashings,
        // Participation
        previousEpochParticipation: altair_1.ssz.EpochParticipation,
        currentEpochParticipation: altair_1.ssz.EpochParticipation,
        // Finality
        justificationBits: phase0_1.ssz.JustificationBits,
        previousJustifiedCheckpoint: phase0_1.ssz.Checkpoint,
        currentJustifiedCheckpoint: phase0_1.ssz.Checkpoint,
        finalizedCheckpoint: phase0_1.ssz.Checkpoint,
        // Inactivity
        inactivityScores: altair_1.ssz.InactivityScores,
        // Sync
        currentSyncCommittee: altair_1.ssz.SyncCommittee,
        nextSyncCommittee: altair_1.ssz.SyncCommittee,
        // Execution
        latestExecutionPayloadHeader: exports.ExecutionPayloadHeader, // [New in Bellatrix]
    },
    casingMap: {
        ...altair_1.ssz.BeaconState.casingMap,
        latestExecutionPayloadHeader: "latest_execution_payload_header",
    },
});
// MUST set typesRef here, otherwise expandedType() calls will throw
typesRef.set({ BeaconBlock: exports.BeaconBlock, BeaconState: exports.BeaconState });
//# sourceMappingURL=sszTypes.js.map