"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.presetToJson = void 0;
/**
 * Render BeaconPreset to JSON strings
 * - Numbers: Render as a quoted decimal string
 */
function presetToJson(preset) {
    const json = {};
    for (const key of Object.keys(preset)) {
        json[key] = serializePresetValue(preset[key]);
    }
    return json;
}
exports.presetToJson = presetToJson;
/**
 * Type Wrapper to ensure that all values of BeaconPreset are number.
 * If there are more types, expand this function with a type switch
 */
function serializePresetValue(value) {
    return value.toString(10);
}
//# sourceMappingURL=json.js.map