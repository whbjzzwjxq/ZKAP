"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderJsonPath = exports.SszErrorPath = void 0;
/**
 * Tracks the JSON path location of nested errors
 */
class SszErrorPath extends Error {
    constructor(e, keyOrIndex) {
        const prevJsonPath = e instanceof SszErrorPath ? e.jsonPath : [];
        const jsonPath = [keyOrIndex, ...prevJsonPath];
        const rawMessage = e instanceof SszErrorPath ? e.rawMessage : e.message;
        super(`${renderJsonPath(jsonPath)}: ${rawMessage}`);
        this.jsonPath = jsonPath;
        this.rawMessage = rawMessage;
    }
}
exports.SszErrorPath = SszErrorPath;
/**
 * Render an array of JSON path items
 * @param jsonPath ["a", 2, "n", "m"]
 * @returns "a[2].n.m"
 */
function renderJsonPath(jsonPath) {
    let path = "";
    for (const item of jsonPath) {
        switch (typeof item) {
            case "number":
                path += `[${item}]`;
                break;
            case "string":
            default:
                path += path.length > 0 ? `.${item}` : item;
                break;
        }
    }
    return path;
}
exports.renderJsonPath = renderJsonPath;
//# sourceMappingURL=errorPath.js.map