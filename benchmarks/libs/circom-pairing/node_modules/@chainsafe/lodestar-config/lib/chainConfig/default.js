"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultChainConfig = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const mainnet_1 = require("./presets/mainnet");
const minimal_1 = require("./presets/minimal");
let defaultChainConfig;
exports.defaultChainConfig = defaultChainConfig;
switch (lodestar_params_1.ACTIVE_PRESET) {
    case lodestar_params_1.PresetName.minimal:
        exports.defaultChainConfig = defaultChainConfig = minimal_1.chainConfig;
        break;
    case lodestar_params_1.PresetName.mainnet:
    default:
        exports.defaultChainConfig = defaultChainConfig = mainnet_1.chainConfig;
        break;
}
//# sourceMappingURL=default.js.map