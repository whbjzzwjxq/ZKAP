"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pyrmontChainConfig = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const ssz_1 = require("@chainsafe/ssz");
const mainnet_1 = require("../presets/mainnet");
/* eslint-disable max-len */
exports.pyrmontChainConfig = {
    ...mainnet_1.chainConfig,
    DEPOSIT_CONTRACT_ADDRESS: (0, ssz_1.fromHexString)("0x8c5fecdC472E27Bc447696F431E425D02dd46a8c"),
    // Ethereum Goerli testnet
    DEPOSIT_CHAIN_ID: 5,
    DEPOSIT_NETWORK_ID: 5,
    MIN_GENESIS_TIME: 1605700800,
    GENESIS_DELAY: 432000,
    GENESIS_FORK_VERSION: (0, ssz_1.fromHexString)("0x00002009"),
    // Altair
    ALTAIR_FORK_VERSION: (0, ssz_1.fromHexString)("0x01002009"),
    ALTAIR_FORK_EPOCH: 61650,
    // Validator cycle
    INACTIVITY_SCORE_BIAS: 4,
    INACTIVITY_SCORE_RECOVERY_RATE: 16,
    EJECTION_BALANCE: 16000000000,
    MIN_PER_EPOCH_CHURN_LIMIT: 4,
    CHURN_LIMIT_QUOTIENT: 65536,
};
//# sourceMappingURL=pyrmont.js.map