import { IChainConfig } from "./chainConfig";
import { mainnetChainConfig } from "./chainConfig/networks/mainnet";
import { pyrmontChainConfig } from "./chainConfig/networks/pyrmont";
import { praterChainConfig } from "./chainConfig/networks/prater";
export { mainnetChainConfig, pyrmontChainConfig, praterChainConfig };
export declare type NetworkName = "mainnet" | "pyrmont" | "prater";
export declare const networksChainConfig: Record<NetworkName, IChainConfig>;
//# sourceMappingURL=networks.d.ts.map