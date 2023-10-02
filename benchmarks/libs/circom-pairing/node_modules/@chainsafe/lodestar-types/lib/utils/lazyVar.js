"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LazyVariable = void 0;
class LazyVariable {
    constructor() {
        this.var = { set: false };
    }
    get() {
        if (!this.var.set)
            throw Error("variable not set");
        return this.var.value;
    }
    set(value) {
        this.var = { set: true, value };
    }
}
exports.LazyVariable = LazyVariable;
//# sourceMappingURL=lazyVar.js.map