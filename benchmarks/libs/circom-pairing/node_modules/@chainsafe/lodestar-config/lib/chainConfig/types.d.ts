import { PresetName } from "@chainsafe/lodestar-params";
/**
 * Run-time chain configuration
 */
export declare type IChainConfig = {
    PRESET_BASE: PresetName;
    TERMINAL_TOTAL_DIFFICULTY: bigint;
    TERMINAL_BLOCK_HASH: Uint8Array;
    TERMINAL_BLOCK_HASH_ACTIVATION_EPOCH: number;
    MIN_GENESIS_ACTIVE_VALIDATOR_COUNT: number;
    MIN_GENESIS_TIME: number;
    GENESIS_FORK_VERSION: Uint8Array;
    GENESIS_DELAY: number;
    ALTAIR_FORK_VERSION: Uint8Array;
    ALTAIR_FORK_EPOCH: number;
    BELLATRIX_FORK_VERSION: Uint8Array;
    BELLATRIX_FORK_EPOCH: number;
    SHARDING_FORK_VERSION: Uint8Array;
    SHARDING_FORK_EPOCH: number;
    SECONDS_PER_SLOT: number;
    SECONDS_PER_ETH1_BLOCK: number;
    MIN_VALIDATOR_WITHDRAWABILITY_DELAY: number;
    SHARD_COMMITTEE_PERIOD: number;
    ETH1_FOLLOW_DISTANCE: number;
    INACTIVITY_SCORE_BIAS: number;
    INACTIVITY_SCORE_RECOVERY_RATE: number;
    EJECTION_BALANCE: number;
    MIN_PER_EPOCH_CHURN_LIMIT: number;
    CHURN_LIMIT_QUOTIENT: number;
    PROPOSER_SCORE_BOOST: number;
    DEPOSIT_CHAIN_ID: number;
    DEPOSIT_NETWORK_ID: number;
    DEPOSIT_CONTRACT_ADDRESS: Uint8Array;
};
export declare const chainConfigTypes: SpecTypes<IChainConfig>;
/** Allows values in a Spec file */
export declare type SpecValue = number | bigint | Uint8Array | string;
/** Type value name of each spec field. Numbers are ignored since they are the most common */
export declare type SpecValueType<V extends SpecValue> = V extends number ? "number" : V extends bigint ? "bigint" : V extends Uint8Array ? "bytes" : V extends string ? "string" : never;
/** All possible type names for a SpecValue */
export declare type SpecValueTypeName = SpecValueType<SpecValue>;
export declare type SpecTypes<Spec extends Record<string, SpecValue>> = {
    [K in keyof Spec]: SpecValueType<Spec[K]>;
};
//# sourceMappingURL=types.d.ts.map