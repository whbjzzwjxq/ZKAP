"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.allForks = exports.bellatrix = exports.altair = exports.phase0 = void 0;
__exportStar(require("./primitive/types"), exports);
var phase0_1 = require("./phase0");
Object.defineProperty(exports, "phase0", { enumerable: true, get: function () { return phase0_1.ts; } });
var altair_1 = require("./altair");
Object.defineProperty(exports, "altair", { enumerable: true, get: function () { return altair_1.ts; } });
var bellatrix_1 = require("./bellatrix");
Object.defineProperty(exports, "bellatrix", { enumerable: true, get: function () { return bellatrix_1.ts; } });
var allForks_1 = require("./allForks");
Object.defineProperty(exports, "allForks", { enumerable: true, get: function () { return allForks_1.ts; } });
//# sourceMappingURL=types.js.map