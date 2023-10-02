import { ForkName } from "@chainsafe/lodestar-params";
import { AllForksSSZTypes } from "./types";
/**
 * Index the ssz types that differ by fork
 * A record of AllForksSSZTypes indexed by fork
 */
export declare const allForks: {
    [K in ForkName]: AllForksSSZTypes;
};
//# sourceMappingURL=sszTypes.d.ts.map