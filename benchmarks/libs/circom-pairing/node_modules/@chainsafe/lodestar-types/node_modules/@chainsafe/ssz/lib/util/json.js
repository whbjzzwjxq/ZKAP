"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toExpectedCase = void 0;
const case_1 = __importDefault(require("case"));
function toExpectedCase(value, expectedCase = "camel", customCasingMap) {
    if (expectedCase === "notransform")
        return value;
    if (customCasingMap && customCasingMap[value])
        return customCasingMap[value];
    switch (expectedCase) {
        case "param":
            return case_1.default.kebab(value);
        case "dot":
            return case_1.default.lower(value, ".", true);
        default:
            return case_1.default[expectedCase](value);
    }
}
exports.toExpectedCase = toExpectedCase;
//# sourceMappingURL=json.js.map