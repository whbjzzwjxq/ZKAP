"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainnetChainConfig = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const ssz_1 = require("@chainsafe/ssz");
const mainnet_1 = require("../presets/mainnet");
/* eslint-disable max-len */
exports.mainnetChainConfig = {
    ...mainnet_1.chainConfig,
    DEPOSIT_CONTRACT_ADDRESS: (0, ssz_1.fromHexString)("0x00000000219ab540356cBB839Cbe05303d7705Fa"),
    DEPOSIT_CHAIN_ID: 1,
    DEPOSIT_NETWORK_ID: 1,
    MIN_GENESIS_TIME: 1606824000,
    GENESIS_DELAY: 604800,
    // MUST NOT use `GENESIS_FORK_VERSION` here so for `minimal` networks the preset value of 0x00000001 take prevalence
    // GENESIS_FORK_VERSION: "0x00000000",
};
//# sourceMappingURL=mainnet.js.map