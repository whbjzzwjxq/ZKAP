"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChainConfig = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const ssz_1 = require("@chainsafe/ssz");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const ByteVector20 = new ssz_1.ByteVectorType({
    length: 20,
});
exports.ChainConfig = new ssz_1.ContainerType({
    fields: {
        PRESET_BASE: new lodestar_types_1.StringType(),
        // Transition
        TERMINAL_TOTAL_DIFFICULTY: lodestar_types_1.ssz.Uint256,
        TERMINAL_BLOCK_HASH: lodestar_types_1.ssz.Root,
        TERMINAL_BLOCK_HASH_ACTIVATION_EPOCH: lodestar_types_1.ssz.Number64,
        // Genesis
        MIN_GENESIS_ACTIVE_VALIDATOR_COUNT: lodestar_types_1.ssz.Number64,
        MIN_GENESIS_TIME: lodestar_types_1.ssz.Number64,
        GENESIS_FORK_VERSION: lodestar_types_1.ssz.Version,
        GENESIS_DELAY: lodestar_types_1.ssz.Number64,
        // Forking
        // Altair
        ALTAIR_FORK_VERSION: lodestar_types_1.ssz.Version,
        ALTAIR_FORK_EPOCH: lodestar_types_1.ssz.Number64,
        // Bellatrix
        BELLATRIX_FORK_VERSION: lodestar_types_1.ssz.Version,
        BELLATRIX_FORK_EPOCH: lodestar_types_1.ssz.Number64,
        // Sharding
        SHARDING_FORK_VERSION: lodestar_types_1.ssz.Version,
        SHARDING_FORK_EPOCH: lodestar_types_1.ssz.Number64,
        // Time parameters
        SECONDS_PER_SLOT: lodestar_types_1.ssz.Number64,
        SECONDS_PER_ETH1_BLOCK: lodestar_types_1.ssz.Number64,
        MIN_VALIDATOR_WITHDRAWABILITY_DELAY: lodestar_types_1.ssz.Number64,
        SHARD_COMMITTEE_PERIOD: lodestar_types_1.ssz.Number64,
        ETH1_FOLLOW_DISTANCE: lodestar_types_1.ssz.Number64,
        // Validator cycle
        INACTIVITY_SCORE_BIAS: lodestar_types_1.ssz.Number64,
        INACTIVITY_SCORE_RECOVERY_RATE: lodestar_types_1.ssz.Number64,
        EJECTION_BALANCE: lodestar_types_1.ssz.Number64,
        MIN_PER_EPOCH_CHURN_LIMIT: lodestar_types_1.ssz.Number64,
        CHURN_LIMIT_QUOTIENT: lodestar_types_1.ssz.Number64,
        PROPOSER_SCORE_BOOST: lodestar_types_1.ssz.Number64,
        // Deposit contract
        DEPOSIT_CHAIN_ID: lodestar_types_1.ssz.Number64,
        DEPOSIT_NETWORK_ID: lodestar_types_1.ssz.Number64,
        DEPOSIT_CONTRACT_ADDRESS: ByteVector20,
    },
    // Expected and container fields are the same here
    expectedCase: "notransform",
});
//# sourceMappingURL=sszTypes.js.map