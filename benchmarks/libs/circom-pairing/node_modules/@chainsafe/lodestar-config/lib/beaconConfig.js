"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIBeaconConfig = exports.createIChainForkConfig = void 0;
const chainConfig_1 = require("./chainConfig");
const forkConfig_1 = require("./forkConfig");
const genesisConfig_1 = require("./genesisConfig");
/**
 * Create an `IBeaconConfig`, filling in missing values with preset defaults
 */
function createIChainForkConfig(chainConfig) {
    const fullChainConfig = (0, chainConfig_1.createIChainConfig)(chainConfig);
    return {
        ...fullChainConfig,
        ...(0, forkConfig_1.createIForkConfig)(fullChainConfig),
    };
}
exports.createIChainForkConfig = createIChainForkConfig;
function createIBeaconConfig(chainConfig, genesisValidatorsRoot) {
    const chainForkConfig = createIChainForkConfig(chainConfig);
    return {
        ...chainForkConfig,
        ...(0, genesisConfig_1.createICachedGenesis)(chainForkConfig, genesisValidatorsRoot),
    };
}
exports.createIBeaconConfig = createIBeaconConfig;
//# sourceMappingURL=beaconConfig.js.map