import { IChainConfig } from "./types";
export { chainConfigToJson, chainConfigFromJson } from "./json";
export * from "./types";
export * from "./default";
/**
 * Create an `IChainConfig`, filling in missing values with preset defaults
 */
export declare function createIChainConfig(input: Partial<IChainConfig>): IChainConfig;
//# sourceMappingURL=index.d.ts.map