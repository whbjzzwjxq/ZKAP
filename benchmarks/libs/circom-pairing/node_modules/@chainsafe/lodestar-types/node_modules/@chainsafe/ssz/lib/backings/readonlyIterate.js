"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readonlyEntries = exports.readonlyValues = void 0;
const tree_1 = require("./tree");
function readonlyValues(obj) {
    if (tree_1.isTreeBacked(obj) && obj.readonlyValues) {
        return obj.readonlyValues();
    }
    else {
        return Object.values(obj);
    }
}
exports.readonlyValues = readonlyValues;
function readonlyEntries(obj) {
    if (tree_1.isTreeBacked(obj) && obj.readonlyEntries) {
        return obj.readonlyEntries();
    }
    else {
        return Object.entries(obj);
    }
}
exports.readonlyEntries = readonlyEntries;
//# sourceMappingURL=readonlyIterate.js.map