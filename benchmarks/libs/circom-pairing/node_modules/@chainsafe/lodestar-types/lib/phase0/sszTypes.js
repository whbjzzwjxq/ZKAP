"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Genesis = exports.BeaconBlocksByRootRequest = exports.BeaconBlocksByRangeRequest = exports.Metadata = exports.Ping = exports.Goodbye = exports.Status = exports.SignedAggregateAndProof = exports.AggregateAndProof = exports.CommitteeAssignment = exports.BeaconState = exports.EpochAttestations = exports.SignedBeaconBlock = exports.BeaconBlock = exports.BeaconBlockBody = exports.SignedVoluntaryExit = exports.VoluntaryExit = exports.ProposerSlashing = exports.Deposit = exports.AttesterSlashing = exports.Attestation = exports.SigningData = exports.PendingAttestation = exports.IndexedAttestation = exports.AttestationData = exports.JustificationBits = exports.Slashings = exports.RandaoMixes = exports.Balances = exports.Validators = exports.Validator = exports.HistoricalBatch = exports.HistoricalStateRoots = exports.HistoricalBlockRoots = exports.ENRForkID = exports.ForkData = exports.Fork = exports.Eth1DataOrdered = exports.Eth1DataVotes = exports.Eth1Data = exports.DepositEvent = exports.DepositDataRootList = exports.DepositData = exports.DepositMessage = exports.CommitteeIndices = exports.CommitteeBits = exports.Checkpoint = exports.SignedBeaconBlockHeader = exports.BeaconBlockHeader = exports.AttestationSubnets = void 0;
const ssz_1 = require("@chainsafe/ssz");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const primitive_1 = require("../primitive");
const lazyVar_1 = require("../utils/lazyVar");
const { Boolean, Bytes32, Number64, Uint64, Slot, Epoch, CommitteeIndex, ValidatorIndex, Gwei, Root, Version, ForkDigest, BLSPubkey, BLSSignature, Domain, } = primitive_1.ssz;
// So the expandedRoots can be referenced, and break the circular dependency
const typesRef = new lazyVar_1.LazyVariable();
// Misc types
// ==========
exports.AttestationSubnets = new ssz_1.BitVectorType({
    length: lodestar_params_1.ATTESTATION_SUBNET_COUNT,
});
exports.BeaconBlockHeader = new ssz_1.ContainerType({
    fields: {
        slot: Slot,
        proposerIndex: ValidatorIndex,
        parentRoot: Root,
        stateRoot: Root,
        bodyRoot: Root,
    },
    casingMap: {
        slot: "slot",
        proposerIndex: "proposer_index",
        parentRoot: "parent_root",
        stateRoot: "state_root",
        bodyRoot: "body_root",
    },
});
exports.SignedBeaconBlockHeader = new ssz_1.ContainerType({
    fields: {
        message: exports.BeaconBlockHeader,
        signature: BLSSignature,
    },
    expectedCase: "notransform",
});
exports.Checkpoint = new ssz_1.ContainerType({
    fields: {
        epoch: Epoch,
        root: Root,
    },
    expectedCase: "notransform",
});
exports.CommitteeBits = new ssz_1.BitListType({
    limit: lodestar_params_1.MAX_VALIDATORS_PER_COMMITTEE,
});
exports.CommitteeIndices = new ssz_1.ListType({
    elementType: ValidatorIndex,
    limit: lodestar_params_1.MAX_VALIDATORS_PER_COMMITTEE,
});
exports.DepositMessage = new ssz_1.ContainerType({
    fields: {
        pubkey: BLSPubkey,
        withdrawalCredentials: Bytes32,
        amount: Number64,
    },
    casingMap: {
        pubkey: "pubkey",
        withdrawalCredentials: "withdrawal_credentials",
        amount: "amount",
    },
});
exports.DepositData = new ssz_1.ContainerType({
    fields: {
        // Fields order is strickly preserved
        ...exports.DepositMessage.fields,
        signature: BLSSignature,
    },
    casingMap: {
        ...exports.DepositMessage.casingMap,
        signature: "signature",
    },
});
exports.DepositDataRootList = new ssz_1.ListType({
    elementType: new ssz_1.RootType({ expandedType: exports.DepositData }),
    limit: 2 ** lodestar_params_1.DEPOSIT_CONTRACT_TREE_DEPTH,
});
exports.DepositEvent = new ssz_1.ContainerType({
    fields: {
        depositData: exports.DepositData,
        blockNumber: Number64,
        index: Number64,
    },
    // Custom type, not in the consensus specs
    casingMap: {
        depositData: "deposit_data",
        blockNumber: "block_number",
        index: "index",
    },
});
exports.Eth1Data = new ssz_1.ContainerType({
    fields: {
        depositRoot: Root,
        depositCount: Number64,
        blockHash: Bytes32,
    },
    casingMap: {
        depositRoot: "deposit_root",
        depositCount: "deposit_count",
        blockHash: "block_hash",
    },
});
exports.Eth1DataVotes = new ssz_1.ListType({
    elementType: exports.Eth1Data,
    limit: lodestar_params_1.EPOCHS_PER_ETH1_VOTING_PERIOD * lodestar_params_1.SLOTS_PER_EPOCH,
});
exports.Eth1DataOrdered = new ssz_1.ContainerType({
    fields: {
        // Fields order is strickly preserved
        ...exports.Eth1Data.fields,
        blockNumber: Number64,
    },
    // Custom type, not in the consensus specs
    casingMap: {
        ...exports.Eth1Data.casingMap,
        blockNumber: "block_number",
    },
});
exports.Fork = new ssz_1.ContainerType({
    fields: {
        previousVersion: Version,
        currentVersion: Version,
        epoch: Epoch,
    },
    casingMap: {
        previousVersion: "previous_version",
        currentVersion: "current_version",
        epoch: "epoch",
    },
});
exports.ForkData = new ssz_1.ContainerType({
    fields: {
        currentVersion: Version,
        genesisValidatorsRoot: Root,
    },
    casingMap: {
        currentVersion: "current_version",
        genesisValidatorsRoot: "genesis_validators_root",
    },
});
exports.ENRForkID = new ssz_1.ContainerType({
    fields: {
        forkDigest: ForkDigest,
        nextForkVersion: Version,
        nextForkEpoch: Epoch,
    },
    casingMap: {
        forkDigest: "fork_digest",
        nextForkVersion: "next_fork_version",
        nextForkEpoch: "next_fork_epoch",
    },
});
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
    casingMap: {
        blockRoots: "block_roots",
        stateRoots: "state_roots",
    },
});
exports.Validator = new ssz_1.ContainerLeafNodeStructType({
    fields: {
        pubkey: BLSPubkey,
        withdrawalCredentials: Bytes32,
        effectiveBalance: Number64,
        slashed: Boolean,
        activationEligibilityEpoch: Epoch,
        activationEpoch: Epoch,
        exitEpoch: Epoch,
        withdrawableEpoch: Epoch,
    },
    casingMap: {
        pubkey: "pubkey",
        withdrawalCredentials: "withdrawal_credentials",
        effectiveBalance: "effective_balance",
        slashed: "slashed",
        activationEligibilityEpoch: "activation_eligibility_epoch",
        activationEpoch: "activation_epoch",
        exitEpoch: "exit_epoch",
        withdrawableEpoch: "withdrawable_epoch",
    },
});
// Export as stand-alone for direct tree optimizations
exports.Validators = new ssz_1.ListType({ elementType: exports.Validator, limit: lodestar_params_1.VALIDATOR_REGISTRY_LIMIT });
exports.Balances = new ssz_1.ListType({ elementType: Number64, limit: lodestar_params_1.VALIDATOR_REGISTRY_LIMIT });
exports.RandaoMixes = new ssz_1.VectorType({ elementType: Bytes32, length: lodestar_params_1.EPOCHS_PER_HISTORICAL_VECTOR });
exports.Slashings = new ssz_1.VectorType({ elementType: Gwei, length: lodestar_params_1.EPOCHS_PER_SLASHINGS_VECTOR });
exports.JustificationBits = new ssz_1.BitVectorType({ length: lodestar_params_1.JUSTIFICATION_BITS_LENGTH });
// Misc dependants
exports.AttestationData = new ssz_1.ContainerType({
    fields: {
        slot: Slot,
        index: CommitteeIndex,
        beaconBlockRoot: Root,
        source: exports.Checkpoint,
        target: exports.Checkpoint,
    },
    casingMap: {
        slot: "slot",
        index: "index",
        beaconBlockRoot: "beacon_block_root",
        source: "source",
        target: "target",
    },
});
exports.IndexedAttestation = new ssz_1.ContainerType({
    fields: {
        attestingIndices: exports.CommitteeIndices,
        data: exports.AttestationData,
        signature: BLSSignature,
    },
    casingMap: {
        attestingIndices: "attesting_indices",
        data: "data",
        signature: "signature",
    },
});
exports.PendingAttestation = new ssz_1.ContainerType({
    fields: {
        aggregationBits: exports.CommitteeBits,
        data: exports.AttestationData,
        inclusionDelay: Slot,
        proposerIndex: ValidatorIndex,
    },
    casingMap: {
        aggregationBits: "aggregation_bits",
        data: "data",
        inclusionDelay: "inclusion_delay",
        proposerIndex: "proposer_index",
    },
});
exports.SigningData = new ssz_1.ContainerType({
    fields: {
        objectRoot: Root,
        domain: Domain,
    },
    casingMap: {
        objectRoot: "object_root",
        domain: "domain",
    },
});
// Operations types
// ================
exports.Attestation = new ssz_1.ContainerType({
    fields: {
        aggregationBits: exports.CommitteeBits,
        data: exports.AttestationData,
        signature: BLSSignature,
    },
    casingMap: {
        aggregationBits: "aggregation_bits",
        data: "data",
        signature: "signature",
    },
});
exports.AttesterSlashing = new ssz_1.ContainerType({
    fields: {
        attestation1: exports.IndexedAttestation,
        attestation2: exports.IndexedAttestation,
    },
    // Declaration time casingMap for toJson/fromJson for container <=> json data
    casingMap: {
        attestation1: "attestation_1",
        attestation2: "attestation_2",
    },
});
exports.Deposit = new ssz_1.ContainerType({
    fields: {
        proof: new ssz_1.VectorType({ elementType: Bytes32, length: lodestar_params_1.DEPOSIT_CONTRACT_TREE_DEPTH + 1 }),
        data: exports.DepositData,
    },
    expectedCase: "notransform",
});
exports.ProposerSlashing = new ssz_1.ContainerType({
    fields: {
        signedHeader1: exports.SignedBeaconBlockHeader,
        signedHeader2: exports.SignedBeaconBlockHeader,
    },
    // Declaration time casingMap for toJson/fromJson for container <=> json data
    casingMap: {
        signedHeader1: "signed_header_1",
        signedHeader2: "signed_header_2",
    },
});
exports.VoluntaryExit = new ssz_1.ContainerType({
    fields: {
        epoch: Epoch,
        validatorIndex: ValidatorIndex,
    },
    casingMap: {
        epoch: "epoch",
        validatorIndex: "validator_index",
    },
});
exports.SignedVoluntaryExit = new ssz_1.ContainerType({
    fields: {
        message: exports.VoluntaryExit,
        signature: BLSSignature,
    },
    expectedCase: "notransform",
});
// Block types
// ===========
exports.BeaconBlockBody = new ssz_1.ContainerType({
    fields: {
        randaoReveal: BLSSignature,
        eth1Data: exports.Eth1Data,
        graffiti: Bytes32,
        proposerSlashings: new ssz_1.ListType({ elementType: exports.ProposerSlashing, limit: lodestar_params_1.MAX_PROPOSER_SLASHINGS }),
        attesterSlashings: new ssz_1.ListType({ elementType: exports.AttesterSlashing, limit: lodestar_params_1.MAX_ATTESTER_SLASHINGS }),
        attestations: new ssz_1.ListType({ elementType: exports.Attestation, limit: lodestar_params_1.MAX_ATTESTATIONS }),
        deposits: new ssz_1.ListType({ elementType: exports.Deposit, limit: lodestar_params_1.MAX_DEPOSITS }),
        voluntaryExits: new ssz_1.ListType({ elementType: exports.SignedVoluntaryExit, limit: lodestar_params_1.MAX_VOLUNTARY_EXITS }),
    },
    casingMap: {
        randaoReveal: "randao_reveal",
        eth1Data: "eth1_data",
        graffiti: "graffiti",
        proposerSlashings: "proposer_slashings",
        attesterSlashings: "attester_slashings",
        attestations: "attestations",
        deposits: "deposits",
        voluntaryExits: "voluntary_exits",
    },
});
exports.BeaconBlock = new ssz_1.ContainerType({
    fields: {
        slot: Slot,
        proposerIndex: ValidatorIndex,
        parentRoot: new ssz_1.RootType({ expandedType: () => typesRef.get().BeaconBlock }),
        stateRoot: new ssz_1.RootType({ expandedType: () => typesRef.get().BeaconState }),
        body: exports.BeaconBlockBody,
    },
    casingMap: {
        slot: "slot",
        proposerIndex: "proposer_index",
        parentRoot: "parent_root",
        stateRoot: "state_root",
        body: "body",
    },
});
exports.SignedBeaconBlock = new ssz_1.ContainerType({
    fields: {
        message: exports.BeaconBlock,
        signature: BLSSignature,
    },
    expectedCase: "notransform",
});
// State types
// ===========
exports.EpochAttestations = new ssz_1.ListType({
    elementType: exports.PendingAttestation,
    limit: lodestar_params_1.MAX_ATTESTATIONS * lodestar_params_1.SLOTS_PER_EPOCH,
});
exports.BeaconState = new ssz_1.ContainerType({
    fields: {
        // Misc
        genesisTime: Number64,
        genesisValidatorsRoot: Root,
        slot: Slot,
        fork: exports.Fork,
        // History
        latestBlockHeader: exports.BeaconBlockHeader,
        blockRoots: exports.HistoricalBlockRoots,
        stateRoots: exports.HistoricalStateRoots,
        historicalRoots: new ssz_1.ListType({
            elementType: new ssz_1.RootType({ expandedType: exports.HistoricalBatch }),
            limit: lodestar_params_1.HISTORICAL_ROOTS_LIMIT,
        }),
        // Eth1
        eth1Data: exports.Eth1Data,
        eth1DataVotes: exports.Eth1DataVotes,
        eth1DepositIndex: Number64,
        // Registry
        validators: exports.Validators,
        balances: exports.Balances,
        randaoMixes: exports.RandaoMixes,
        // Slashings
        slashings: exports.Slashings,
        // Attestations
        previousEpochAttestations: exports.EpochAttestations,
        currentEpochAttestations: exports.EpochAttestations,
        // Finality
        justificationBits: exports.JustificationBits,
        previousJustifiedCheckpoint: exports.Checkpoint,
        currentJustifiedCheckpoint: exports.Checkpoint,
        finalizedCheckpoint: exports.Checkpoint,
    },
    casingMap: {
        genesisTime: "genesis_time",
        genesisValidatorsRoot: "genesis_validators_root",
        slot: "slot",
        fork: "fork",
        latestBlockHeader: "latest_block_header",
        blockRoots: "block_roots",
        stateRoots: "state_roots",
        historicalRoots: "historical_roots",
        eth1Data: "eth1_data",
        eth1DataVotes: "eth1_data_votes",
        eth1DepositIndex: "eth1_deposit_index",
        validators: "validators",
        balances: "balances",
        randaoMixes: "randao_mixes",
        slashings: "slashings",
        previousEpochAttestations: "previous_epoch_attestations",
        currentEpochAttestations: "current_epoch_attestations",
        justificationBits: "justification_bits",
        previousJustifiedCheckpoint: "previous_justified_checkpoint",
        currentJustifiedCheckpoint: "current_justified_checkpoint",
        finalizedCheckpoint: "finalized_checkpoint",
    },
});
// Validator types
// ===============
exports.CommitteeAssignment = new ssz_1.ContainerType({
    fields: {
        validators: exports.CommitteeIndices,
        committeeIndex: CommitteeIndex,
        slot: Slot,
    },
    // Custom type, not in the consensus specs
    casingMap: {
        validators: "validators",
        committeeIndex: "committee_index",
        slot: "slot",
    },
});
exports.AggregateAndProof = new ssz_1.ContainerType({
    fields: {
        aggregatorIndex: ValidatorIndex,
        aggregate: exports.Attestation,
        selectionProof: BLSSignature,
    },
    casingMap: {
        aggregatorIndex: "aggregator_index",
        aggregate: "aggregate",
        selectionProof: "selection_proof",
    },
});
exports.SignedAggregateAndProof = new ssz_1.ContainerType({
    fields: {
        message: exports.AggregateAndProof,
        signature: BLSSignature,
    },
    expectedCase: "notransform",
});
// ReqResp types
// =============
exports.Status = new ssz_1.ContainerType({
    fields: {
        forkDigest: ForkDigest,
        finalizedRoot: Root,
        finalizedEpoch: Epoch,
        headRoot: Root,
        headSlot: Slot,
    },
    casingMap: {
        forkDigest: "fork_digest",
        finalizedRoot: "finalized_root",
        finalizedEpoch: "finalized_epoch",
        headRoot: "head_root",
        headSlot: "head_slot",
    },
});
exports.Goodbye = Uint64;
exports.Ping = Uint64;
exports.Metadata = new ssz_1.ContainerType({
    fields: {
        seqNumber: Uint64,
        attnets: exports.AttestationSubnets,
    },
    casingMap: {
        seqNumber: "seq_number",
        attnets: "attnets",
    },
});
exports.BeaconBlocksByRangeRequest = new ssz_1.ContainerType({
    fields: {
        startSlot: Slot,
        count: Number64,
        step: Number64,
    },
    casingMap: {
        startSlot: "start_slot",
        count: "count",
        step: "step",
    },
});
exports.BeaconBlocksByRootRequest = new ssz_1.ListType({ elementType: Root, limit: lodestar_params_1.MAX_REQUEST_BLOCKS });
// Api types
// =========
exports.Genesis = new ssz_1.ContainerType({
    fields: {
        genesisValidatorsRoot: Root,
        genesisTime: Uint64,
        genesisForkVersion: Version,
    },
    // From beacon-apis
    casingMap: {
        genesisValidatorsRoot: "genesis_validators_root",
        genesisTime: "genesis_time",
        genesisForkVersion: "genesis_fork_version",
    },
});
// MUST set typesRef here, otherwise expandedType() calls will throw
typesRef.set({ BeaconBlock: exports.BeaconBlock, BeaconState: exports.BeaconState });
//# sourceMappingURL=sszTypes.js.map