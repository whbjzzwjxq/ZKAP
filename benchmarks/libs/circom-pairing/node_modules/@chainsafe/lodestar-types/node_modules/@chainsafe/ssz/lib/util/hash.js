"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.newHashObject = exports.cloneHashObject = exports.hash = void 0;
/** @module ssz */
const as_sha256_1 = __importDefault(require("@chainsafe/as-sha256"));
/**
 * Hash used for hashTreeRoot
 */
function hash(...inputs) {
    return as_sha256_1.default.digest(Buffer.concat(inputs));
}
exports.hash = hash;
/**
 * A temporary HashObject is needed in a lot of places, this HashObject is then
 * applied to persistent-merkle-tree, it'll make a copy so it's safe to mutate it after that.
 * It means that we could use a shared HashObject instead of having to always allocate
 * a new one to save memory. This temporary HashObject is always allocated by cloneHashObject()
 * or newHashObject() below.
 **/
const sharedHashObject = {
    h0: 0,
    h1: 0,
    h2: 0,
    h3: 0,
    h4: 0,
    h5: 0,
    h6: 0,
    h7: 0,
};
/**
 * Clone a hash object using sharedHashObject, after doing this we usually
 * apply HashObject to the Tree which make a copy there so it's safe to mutate
 * this HashObject after that.
 **/
function cloneHashObject(hashObject) {
    sharedHashObject.h0 = hashObject.h0;
    sharedHashObject.h1 = hashObject.h1;
    sharedHashObject.h2 = hashObject.h2;
    sharedHashObject.h3 = hashObject.h3;
    sharedHashObject.h4 = hashObject.h4;
    sharedHashObject.h5 = hashObject.h5;
    sharedHashObject.h6 = hashObject.h6;
    sharedHashObject.h7 = hashObject.h7;
    return sharedHashObject;
}
exports.cloneHashObject = cloneHashObject;
/**
 * Reset and return sharedHashObject, after doing this we usually
 * apply HashObject to the Tree which make a copy there so it's safe to mutate
 * this HashObject after that.
 **/
function newHashObject() {
    sharedHashObject.h0 = 0;
    sharedHashObject.h1 = 0;
    sharedHashObject.h2 = 0;
    sharedHashObject.h3 = 0;
    sharedHashObject.h4 = 0;
    sharedHashObject.h5 = 0;
    sharedHashObject.h6 = 0;
    sharedHashObject.h7 = 0;
    return sharedHashObject;
}
exports.newHashObject = newHashObject;
//# sourceMappingURL=hash.js.map