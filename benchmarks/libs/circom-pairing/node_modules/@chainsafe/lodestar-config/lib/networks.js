"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.networksChainConfig = exports.praterChainConfig = exports.pyrmontChainConfig = exports.mainnetChainConfig = void 0;
const mainnet_1 = require("./chainConfig/networks/mainnet");
Object.defineProperty(exports, "mainnetChainConfig", { enumerable: true, get: function () { return mainnet_1.mainnetChainConfig; } });
const pyrmont_1 = require("./chainConfig/networks/pyrmont");
Object.defineProperty(exports, "pyrmontChainConfig", { enumerable: true, get: function () { return pyrmont_1.pyrmontChainConfig; } });
const prater_1 = require("./chainConfig/networks/prater");
Object.defineProperty(exports, "praterChainConfig", { enumerable: true, get: function () { return prater_1.praterChainConfig; } });
exports.networksChainConfig = {
    mainnet: mainnet_1.mainnetChainConfig,
    pyrmont: pyrmont_1.pyrmontChainConfig,
    prater: prater_1.praterChainConfig,
};
//# sourceMappingURL=networks.js.map