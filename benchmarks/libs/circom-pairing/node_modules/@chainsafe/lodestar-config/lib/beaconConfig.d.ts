import { Root } from "@chainsafe/lodestar-types";
import { IChainConfig } from "./chainConfig";
import { IForkConfig } from "./forkConfig";
import { ICachedGenesis } from "./genesisConfig/types";
/**
 * Chain run-time configuration with additional fork schedule helpers
 */
export declare type IChainForkConfig = IChainConfig & IForkConfig;
export declare type IBeaconConfig = IChainForkConfig & ICachedGenesis;
/**
 * Create an `IBeaconConfig`, filling in missing values with preset defaults
 */
export declare function createIChainForkConfig(chainConfig: Partial<IChainConfig>): IChainForkConfig;
export declare function createIBeaconConfig(chainConfig: Partial<IChainConfig>, genesisValidatorsRoot: Root): IBeaconConfig;
//# sourceMappingURL=beaconConfig.d.ts.map