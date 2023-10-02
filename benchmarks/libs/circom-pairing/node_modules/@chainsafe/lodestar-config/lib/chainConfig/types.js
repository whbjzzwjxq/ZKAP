"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chainConfigTypes = void 0;
exports.chainConfigTypes = {
    PRESET_BASE: "string",
    // Transition
    TERMINAL_TOTAL_DIFFICULTY: "bigint",
    TERMINAL_BLOCK_HASH: "bytes",
    TERMINAL_BLOCK_HASH_ACTIVATION_EPOCH: "number",
    // Genesis
    MIN_GENESIS_ACTIVE_VALIDATOR_COUNT: "number",
    MIN_GENESIS_TIME: "number",
    GENESIS_FORK_VERSION: "bytes",
    GENESIS_DELAY: "number",
    // Forking
    // Altair
    ALTAIR_FORK_VERSION: "bytes",
    ALTAIR_FORK_EPOCH: "number",
    // Bellatrix
    BELLATRIX_FORK_VERSION: "bytes",
    BELLATRIX_FORK_EPOCH: "number",
    // Sharding
    SHARDING_FORK_VERSION: "bytes",
    SHARDING_FORK_EPOCH: "number",
    // Time parameters
    SECONDS_PER_SLOT: "number",
    SECONDS_PER_ETH1_BLOCK: "number",
    MIN_VALIDATOR_WITHDRAWABILITY_DELAY: "number",
    SHARD_COMMITTEE_PERIOD: "number",
    ETH1_FOLLOW_DISTANCE: "number",
    // Validator cycle
    INACTIVITY_SCORE_BIAS: "number",
    INACTIVITY_SCORE_RECOVERY_RATE: "number",
    EJECTION_BALANCE: "number",
    MIN_PER_EPOCH_CHURN_LIMIT: "number",
    CHURN_LIMIT_QUOTIENT: "number",
    // Proposer boost
    PROPOSER_SCORE_BOOST: "number",
    // Deposit contract
    DEPOSIT_CHAIN_ID: "number",
    DEPOSIT_NETWORK_ID: "number",
    DEPOSIT_CONTRACT_ADDRESS: "bytes",
};
//# sourceMappingURL=types.js.map