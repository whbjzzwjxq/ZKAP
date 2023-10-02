"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allForks = void 0;
const phase0_1 = require("../phase0");
const altair_1 = require("../altair");
const bellatrix_1 = require("../bellatrix");
/**
 * Index the ssz types that differ by fork
 * A record of AllForksSSZTypes indexed by fork
 */
exports.allForks = {
    phase0: {
        BeaconBlockBody: phase0_1.ssz.BeaconBlockBody,
        BeaconBlock: phase0_1.ssz.BeaconBlock,
        SignedBeaconBlock: phase0_1.ssz.SignedBeaconBlock,
        BeaconState: phase0_1.ssz.BeaconState,
        Metadata: phase0_1.ssz.Metadata,
    },
    altair: {
        BeaconBlockBody: altair_1.ssz.BeaconBlockBody,
        BeaconBlock: altair_1.ssz.BeaconBlock,
        SignedBeaconBlock: altair_1.ssz.SignedBeaconBlock,
        BeaconState: altair_1.ssz.BeaconState,
        Metadata: altair_1.ssz.Metadata,
    },
    bellatrix: {
        BeaconBlockBody: bellatrix_1.ssz.BeaconBlockBody,
        BeaconBlock: bellatrix_1.ssz.BeaconBlock,
        SignedBeaconBlock: bellatrix_1.ssz.SignedBeaconBlock,
        BeaconState: bellatrix_1.ssz.BeaconState,
        Metadata: altair_1.ssz.Metadata,
    },
};
//# sourceMappingURL=sszTypes.js.map