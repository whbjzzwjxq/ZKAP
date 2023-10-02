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
exports.createIForkConfig = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
__exportStar(require("./types"), exports);
function createIForkConfig(config) {
    const phase0 = { name: lodestar_params_1.ForkName.phase0, epoch: lodestar_params_1.GENESIS_EPOCH, version: config.GENESIS_FORK_VERSION };
    const altair = { name: lodestar_params_1.ForkName.altair, epoch: config.ALTAIR_FORK_EPOCH, version: config.ALTAIR_FORK_VERSION };
    const bellatrix = {
        name: lodestar_params_1.ForkName.bellatrix,
        epoch: config.BELLATRIX_FORK_EPOCH,
        version: config.BELLATRIX_FORK_VERSION,
    };
    /** Forks in order order of occurence, `phase0` first */
    // Note: Downstream code relies on proper ordering.
    const forks = { phase0, altair, bellatrix };
    // Prevents allocating an array on every getForkInfo() call
    const forksAscendingEpochOrder = Object.values(forks);
    const forksDescendingEpochOrder = Object.values(forks).reverse();
    return {
        forks,
        forksAscendingEpochOrder,
        forksDescendingEpochOrder,
        // Fork convenience methods
        getForkInfo(slot) {
            const epoch = Math.floor(slot / lodestar_params_1.SLOTS_PER_EPOCH);
            // NOTE: forks must be sorted by descending epoch, latest fork first
            for (const fork of forksDescendingEpochOrder) {
                if (epoch >= fork.epoch)
                    return fork;
            }
            return phase0;
        },
        getForkName(slot) {
            return this.getForkInfo(slot).name;
        },
        getForkVersion(slot) {
            return this.getForkInfo(slot).version;
        },
        getForkTypes(slot) {
            return lodestar_types_1.ssz.allForks[this.getForkName(slot)];
        },
    };
}
exports.createIForkConfig = createIForkConfig;
//# sourceMappingURL=index.js.map