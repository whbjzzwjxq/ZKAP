"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deserializeSpecValue = exports.serializeSpecValue = exports.chainConfigFromJson = exports.chainConfigToJson = void 0;
const ssz_1 = require("@chainsafe/ssz");
const types_1 = require("./types");
const MAX_UINT64_JSON = "18446744073709551615";
function chainConfigToJson(config) {
    const json = {};
    for (const key of Object.keys(config)) {
        json[key] = serializeSpecValue(config[key], types_1.chainConfigTypes[key]);
    }
    return json;
}
exports.chainConfigToJson = chainConfigToJson;
function chainConfigFromJson(json) {
    const config = {};
    for (const key of Object.keys(json)) {
        config[key] = deserializeSpecValue(json[key], types_1.chainConfigTypes[key]);
    }
    return config;
}
exports.chainConfigFromJson = chainConfigFromJson;
function serializeSpecValue(value, typeName) {
    switch (typeName) {
        case "number":
            if (typeof value !== "number") {
                throw Error(`Invalid value ${value} expected number`);
            }
            if (value === Infinity) {
                return MAX_UINT64_JSON;
            }
            return value.toString(10);
        case "bigint":
            if (typeof value !== "bigint") {
                throw Error(`Invalid value ${value} expected bigint`);
            }
            return value.toString(10);
        case "bytes":
            if (!(value instanceof Uint8Array)) {
                throw Error(`Invalid value ${value} expected Uint8Array`);
            }
            return (0, ssz_1.toHexString)(value);
        case "string":
            if (typeof value !== "string") {
                throw Error(`Invalid value ${value} expected string`);
            }
            return value;
    }
}
exports.serializeSpecValue = serializeSpecValue;
function deserializeSpecValue(valueStr, typeName) {
    if (typeof valueStr !== "string") {
        throw Error(`Invalid value ${valueStr} expected string`);
    }
    switch (typeName) {
        case "number":
            if (valueStr === MAX_UINT64_JSON) {
                return Infinity;
            }
            return parseInt(valueStr, 10);
        case "bigint":
            return BigInt(valueStr);
        case "bytes":
            return (0, ssz_1.fromHexString)(valueStr);
        case "string":
            return valueStr;
    }
}
exports.deserializeSpecValue = deserializeSpecValue;
//# sourceMappingURL=json.js.map