"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.booleanType = exports.number32Type = exports.byteType = void 0;
const uint_1 = require("./uint");
const boolean_1 = require("./boolean");
exports.byteType = new uint_1.NumberUintType({ byteLength: 1 });
exports.number32Type = new uint_1.NumberUintType({ byteLength: 4 });
exports.booleanType = new boolean_1.BooleanType();
//# sourceMappingURL=wellKnown.js.map