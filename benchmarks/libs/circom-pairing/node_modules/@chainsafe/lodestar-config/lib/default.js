"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.chainConfig = void 0;
const beaconConfig_1 = require("./beaconConfig");
const chainConfig_1 = require("./chainConfig");
exports.chainConfig = chainConfig_1.defaultChainConfig;
// for testing purpose only
exports.config = (0, beaconConfig_1.createIChainForkConfig)(chainConfig_1.defaultChainConfig);
//# sourceMappingURL=default.js.map