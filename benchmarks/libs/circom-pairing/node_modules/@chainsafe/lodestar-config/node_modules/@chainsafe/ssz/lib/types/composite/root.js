"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RootType = exports.isRootType = exports.ROOT_TYPE = void 0;
const byteVector_1 = require("./byteVector");
const type_1 = require("../type");
const backings_1 = require("../../backings");
const byteArray_1 = require("../../util/byteArray");
exports.ROOT_TYPE = Symbol.for("ssz/RootType");
function isRootType(type) {
    return type_1.isTypeOf(type, exports.ROOT_TYPE);
}
exports.isRootType = isRootType;
function convertRootToUint8Array(value) {
    if (value instanceof Uint8Array) {
        return value;
    }
    else if (backings_1.isTreeBacked(value)) {
        return value.tree.root;
    }
    else if (Array.isArray(value)) {
        return new Uint8Array(value);
    }
    else {
        throw new Error("Unable to convert root to Uint8Array: not Uint8Array, tree-backed, or Array");
    }
}
class RootType extends byteVector_1.ByteVectorType {
    constructor(options) {
        super({ length: 32 });
        this._expandedType = options.expandedType;
        this._typeSymbols.add(exports.ROOT_TYPE);
    }
    get expandedType() {
        if (typeof this._expandedType === "function") {
            this._expandedType = this._expandedType();
        }
        return this._expandedType;
    }
    struct_equals(value1, value2) {
        return byteArray_1.byteArrayEquals(convertRootToUint8Array(value1), convertRootToUint8Array(value2));
    }
    equals(value1, value2) {
        return this.struct_equals(value1, value2);
    }
}
exports.RootType = RootType;
//# sourceMappingURL=root.js.map