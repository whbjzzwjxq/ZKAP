declare type JsonPathItem = string | number;
/**
 * Tracks the JSON path location of nested errors
 */
export declare class SszErrorPath extends Error {
    jsonPath: JsonPathItem[];
    rawMessage: string;
    constructor(e: Error | SszErrorPath, keyOrIndex: JsonPathItem);
}
/**
 * Render an array of JSON path items
 * @param jsonPath ["a", 2, "n", "m"]
 * @returns "a[2].n.m"
 */
export declare function renderJsonPath(jsonPath: JsonPathItem[]): string;
export {};
//# sourceMappingURL=errorPath.d.ts.map