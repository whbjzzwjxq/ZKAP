import { PresetName } from "./presetName";
export { PresetName };
/**
 * The preset name currently exported by this library
 *
 * The `LODESTAR_PRESET` environment variable is used to select the active preset
 * If `LODESTAR_PRESET` is not set, the default is `mainnet`.
 *
 * The active preset can be manually overridden with `setActivePreset`
 */
export declare let userSelectedPreset: PresetName | null;
/**
 * Override the active preset
 *
 * WARNING: Lodestar libraries rely on preset values being _constant_, so the active preset must be set _before_ loading any other lodestar libraries.
 *
 * Only call this function if you _really_ know what you are doing.
 */
export declare function setActivePreset(presetName: PresetName): void;
//# sourceMappingURL=setPreset.d.ts.map