"use strict";
/**
 * SSZ is a type system that defines:
 * - efficient serialization / deserialization
 * - stable merkleization
 * - default constructor
 *
 * Along with these standardized operations, we provide:
 * - equality
 * - valid value assertion
 * - copy / clone
 * - serialized byte length (for serialization)
 * - chunk count (for merkleization)
 *
 * This library operates on values of several kinds of 'backings', or underlying representations of data.
 * Each backing has runtime tradeoffs for the above operations that arise from the nature of the underlying
 * representation. Effort has been made to minimize the differences between backings for the core API, which
 * includes the above operations, property getter/setters, and iteration (value iteration for vectors/lists
 * and enumerable key iteration for containers).
 *
 * We support the following backings, which correspond to the core operations of serialization and merkleization:
 *
 * - Structural - This backing has a native javascript type representation.
 *     Containers are constructed as js Objects, vectors and lists as Arrays (or TypedArrays)
 *     Within operations, property access is performed using js getter notation, with gets
 *     corresponding to the structure of the value's type. Because structural non-constructor operations do not
 *     assume the underlying representation of values, all backings can be operated on in this context.
 *
 * - Tree - This backing has an immutable merkle tree representation.
 *     The data is always represented as a tree, and within operations, the tree
 *     structure is harnessed as much as possible. Property getters return subtrees except for basic types,
 *     when the native value corresponding th that type is returned.
 *     Values backed by a tree are wrapped in an ES6 Proxy object to provide a convenient, 'structural' interface
 *     for property getters/setters.
 *
 * - ByteArray - This backing has a byte array representation.
 *     The data is always represented as a Uint8Array, and within operations,
 *     the serialized structure is harnessed as much as possible.
 *     Property getters return sub-arrays except for basic types, when the native value
 *     corresponding to that type is returned.
 *     Values backed by an array are wrapped in an ES6 Proxy object to provide a convenient, 'structural' interface
 *     for property getters/setters.
 */
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
__exportStar(require("./basic"), exports);
__exportStar(require("./composite"), exports);
__exportStar(require("./type"), exports);
//# sourceMappingURL=index.js.map