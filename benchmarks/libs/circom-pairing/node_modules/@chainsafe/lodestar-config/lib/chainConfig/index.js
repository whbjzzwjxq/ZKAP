"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIChainConfig = exports.chainConfigFromJson = exports.chainConfigToJson = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const default_1 = require("./default");
var json_1 = require("./json");
Object.defineProperty(exports, "chainConfigToJson", { enumerable: true, get: function () { return json_1.chainConfigToJson; } });
Object.defineProperty(exports, "chainConfigFromJson", { enumerable: true, get: function () { return json_1.chainConfigFromJson; } });
__exportStar(require("./types"), exports);
__exportStar(require("./default"), exports);
/**
 * Create an `IChainConfig`, filling in missing values with preset defaults
 */
function createIChainConfig(input) {
    const config = {
        // Set the config first with default preset values
        ...default_1.defaultChainConfig,
        // Override with input
        ...input,
    };
    // Assert that the preset matches the active preset
    if (config.PRESET_BASE !== lodestar_params_1.ACTIVE_PRESET) {
        throw new Error(`Can only create a config for the active preset: ACTIVE_PRESET=${lodestar_params_1.ACTIVE_PRESET} PRESET_BASE=${config.PRESET_BASE}`);
    }
    return config;
}
exports.createIChainConfig = createIChainConfig;
//# sourceMappingURL=index.js.map