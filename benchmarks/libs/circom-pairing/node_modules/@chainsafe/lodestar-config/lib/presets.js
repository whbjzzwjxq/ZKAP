"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.minimal = exports.mainnet = exports.minimalChainConfig = exports.mainnetChainConfig = void 0;
const beaconConfig_1 = require("./beaconConfig");
const mainnet_1 = require("./chainConfig/presets/mainnet");
Object.defineProperty(exports, "mainnetChainConfig", { enumerable: true, get: function () { return mainnet_1.chainConfig; } });
const minimal_1 = require("./chainConfig/presets/minimal");
Object.defineProperty(exports, "minimalChainConfig", { enumerable: true, get: function () { return minimal_1.chainConfig; } });
// for testing purpose only
exports.mainnet = (0, beaconConfig_1.createIChainForkConfig)(mainnet_1.chainConfig);
exports.minimal = (0, beaconConfig_1.createIChainForkConfig)(minimal_1.chainConfig);
//# sourceMappingURL=presets.js.map