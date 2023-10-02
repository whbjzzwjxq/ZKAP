import { IChainConfig, SpecValue, SpecValueTypeName } from "./types";
export declare function chainConfigToJson(config: IChainConfig): Record<string, string>;
export declare function chainConfigFromJson(json: Record<string, unknown>): IChainConfig;
export declare function serializeSpecValue(value: SpecValue, typeName: SpecValueTypeName): string;
export declare function deserializeSpecValue(valueStr: unknown, typeName: SpecValueTypeName): SpecValue;
//# sourceMappingURL=json.d.ts.map