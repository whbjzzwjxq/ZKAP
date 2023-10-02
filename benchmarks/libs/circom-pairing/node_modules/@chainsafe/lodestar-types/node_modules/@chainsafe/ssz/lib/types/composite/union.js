"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnionType = exports.isUnionType = exports.UNION_TYPE = exports.VALUE_GINDEX = exports.SELECTOR_GINDEX = void 0;
const persistent_merkle_tree_1 = require("@chainsafe/persistent-merkle-tree");
const backings_1 = require("../../backings");
const basic_1 = require("../../util/basic");
const none_1 = require("../basic/none");
const wellKnown_1 = require("../basic/wellKnown");
const type_1 = require("../type");
const abstract_1 = require("./abstract");
/**
 * SSZ Union includes the selector (index of type) in the tree
 * This selector is always in the same index in the tree
 * ```
 *   1
 *  / \
 * 2   3 // <-here
 * ```
 */
exports.SELECTOR_GINDEX = BigInt(3);
/**
 * The value gindex in the tree.
 * ```
 *           1
 *          / \
 * here -> 2   3
 * ```
 */
exports.VALUE_GINDEX = BigInt(2);
exports.UNION_TYPE = Symbol.for("ssz/UnionType");
function isUnionType(type) {
    return type_1.isTypeOf(type, exports.UNION_TYPE);
}
exports.isUnionType = isUnionType;
class UnionType extends abstract_1.CompositeType {
    constructor(options) {
        super();
        this.types = [...options.types];
        this._typeSymbols.add(exports.UNION_TYPE);
    }
    struct_assertValidValue(wrappedValue) {
        const { selector, value } = wrappedValue;
        if (!(selector >= 0)) {
            throw new Error("Invalid selector " + selector);
        }
        if (value === null) {
            // May have None as first type option
            if (selector !== 0) {
                throw new Error(`Invalid selector ${selector} for null value`);
            }
            if (!none_1.isNoneType(this.types[selector])) {
                throw new Error("None value of Union type must have None as first type option");
            }
        }
        else {
            try {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                this.types[selector].struct_assertValidValue(value);
            }
            catch (e) {
                throw new Error(`Invalid value ${value} for selector ${selector}`);
            }
        }
    }
    struct_equals(value1, value2) {
        this.struct_assertValidValue(value1);
        this.struct_assertValidValue(value2);
        if (value1.selector !== value2.selector) {
            return false;
        }
        return this.types[value1.selector].struct_equals(value1.value, value2.value);
    }
    struct_defaultValue() {
        return { selector: 0, value: this.types[0].defaultValue() };
    }
    tree_defaultNode() {
        if (!this._defaultNode) {
            const defaultType = this.types[0];
            const defaultValueNode = abstract_1.isCompositeType(defaultType) ? defaultType.tree_defaultNode() : persistent_merkle_tree_1.zeroNode(0);
            // mix_in_selector
            this._defaultNode = new persistent_merkle_tree_1.BranchNode(defaultValueNode, persistent_merkle_tree_1.zeroNode(0));
        }
        return this._defaultNode;
    }
    struct_clone(wrappedValue) {
        const { selector, value } = wrappedValue;
        return {
            selector,
            value: this.types[selector].struct_clone(value),
        };
    }
    struct_convertToJson(wrappedValue, options) {
        const { selector, value } = wrappedValue;
        return {
            selector,
            value: this.types[selector].struct_convertToJson(value, options),
        };
    }
    struct_convertFromJson(json, options) {
        const { selector, value } = json;
        if (selector === null || (selector !== null && !(selector >= 0))) {
            throw new Error("Invalid JSON Union: invalid selector" + selector);
        }
        return {
            selector,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            value: this.types[selector].struct_convertFromJson(value, options),
        };
    }
    struct_convertToTree(wrappedValue) {
        if (backings_1.isTreeBacked(wrappedValue))
            return wrappedValue.tree.clone();
        const { selector, value } = wrappedValue;
        const type = this.types[selector];
        const valueNode = abstract_1.isCompositeType(type)
            ? type.struct_convertToTree(value).rootNode
            : basic_1.basicTypeToLeafNode(type, value);
        // mix_in_selector
        const selectorNode = basic_1.basicTypeToLeafNode(wellKnown_1.number32Type, selector);
        return new persistent_merkle_tree_1.Tree(new persistent_merkle_tree_1.BranchNode(valueNode, selectorNode));
    }
    tree_convertToStruct(target) {
        const selector = wellKnown_1.number32Type.struct_deserializeFromBytes(target.getRoot(exports.SELECTOR_GINDEX), 0);
        const type = this.types[selector];
        let value;
        if (abstract_1.isCompositeType(type)) {
            value = type.tree_convertToStruct(target.getSubtree(exports.VALUE_GINDEX));
        }
        else {
            value = type.struct_deserializeFromBytes(target.getRoot(exports.VALUE_GINDEX), 0);
        }
        return {
            selector,
            value,
        };
    }
    struct_serializeToBytes(wrappedValue, output, offset) {
        const { selector, value } = wrappedValue;
        const index = wellKnown_1.byteType.struct_serializeToBytes(selector, output, offset);
        return this.types[selector].struct_serializeToBytes(value, output, index);
    }
    tree_serializeToBytes(target, output, offset) {
        const selectorRoot = target.getRoot(exports.SELECTOR_GINDEX);
        // selector takes 1 byte
        output.set(selectorRoot.slice(0, 1), offset);
        const selector = wellKnown_1.number32Type.struct_deserializeFromBytes(selectorRoot, 0);
        const type = this.types[selector];
        if (abstract_1.isCompositeType(type)) {
            return type.tree_serializeToBytes(target.getSubtree(exports.VALUE_GINDEX), output, offset + 1);
        }
        else {
            const valueRoot = target.getRoot(exports.VALUE_GINDEX);
            const s = type.struct_getSerializedLength();
            output.set(valueRoot.slice(0, s), offset + 1);
            // 1 byte for selector, s bytes for value
            return offset + 1 + s;
        }
    }
    struct_deserializeFromBytes(data, start, end) {
        this.bytes_validate(data, start, end);
        // 1st byte is for selector
        const selector = wellKnown_1.byteType.fromBytes(data, start);
        const type = this.types[selector];
        // remainning bytes are for value
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const value = type.struct_deserializeFromBytes(data, start + 1, end);
        return { selector, value };
    }
    tree_deserializeFromBytes(data, start, end) {
        this.bytes_validate(data, start, end);
        // 1st byte is for selector
        const selector = wellKnown_1.byteType.fromBytes(data, start);
        const type = this.types[selector];
        // remainning bytes are for value
        let valueNode;
        if (abstract_1.isCompositeType(type)) {
            valueNode = type.tree_deserializeFromBytes(data, start + 1, end).rootNode;
        }
        else {
            const chunk = new Uint8Array(32);
            chunk.set(data.slice(start + 1, end));
            valueNode = new persistent_merkle_tree_1.LeafNode(chunk);
        }
        const selectorNode = basic_1.basicTypeToLeafNode(wellKnown_1.number32Type, selector);
        return new persistent_merkle_tree_1.Tree(new persistent_merkle_tree_1.BranchNode(valueNode, selectorNode));
    }
    getMinSerializedLength() {
        return 1 + Math.min(...this.types.map((type) => type.getMinSerializedLength()));
    }
    getMaxSerializedLength() {
        return 1 + Math.max(...this.types.map((type) => type.getMaxSerializedLength()));
    }
    struct_getSerializedLength(wrappedValue) {
        const { selector, value } = wrappedValue;
        return 1 + this.types[selector].struct_getSerializedLength(value);
    }
    tree_getSerializedLength(target) {
        const type = this.getType(target);
        if (abstract_1.isCompositeType(type)) {
            return 1 + type.tree_getSerializedLength(target.getSubtree(exports.VALUE_GINDEX));
        }
        else {
            return 1 + type.struct_getSerializedLength();
        }
    }
    hasVariableSerializedLength() {
        // Is always considered a variable-length type, even if all type options have an equal fixed-length.
        return true;
    }
    getFixedSerializedLength() {
        return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    bytes_getVariableOffsets(target) {
        // this method is only needed for Vectors, containers, lists
        throw new Error("Not applicable for Union");
    }
    getMaxChunkCount() {
        // 1 for value, 1 for selector
        return 2;
    }
    /** This is just to compliant to the parent, we're not likely to use it. */
    struct_getRootAtChunkIndex(wrappedValue, index) {
        if (index !== 0 && index !== 1) {
            throw new Error(`Invalid index ${index} for Union type`);
        }
        const { selector, value } = wrappedValue;
        if (index === 1)
            return basic_1.basicTypeToLeafNode(wellKnown_1.number32Type, selector).root;
        return this.types[selector].struct_hashTreeRoot(value);
    }
    struct_getPropertyNames() {
        return ["value", "selector"];
    }
    tree_getPropertyNames() {
        return ["value", "selector"];
    }
    getPropertyGindex(property) {
        switch (property) {
            case "value":
                return exports.VALUE_GINDEX;
            case "selector":
                return exports.SELECTOR_GINDEX;
            default:
                throw new Error(`Invalid property ${String(property)} for Union type`);
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getPropertyType(property) {
        // a Union has multiple types
        throw new Error("Not applicable for Union type");
    }
    /** Union can only extract type from a Tree */
    getPropertyTypeFromTree(target, property) {
        switch (property) {
            case "value":
                return this.getType(target);
            case "selector":
                return wellKnown_1.byteType;
            default:
                throw new Error(`Invalid property ${String(property)} for Union type`);
        }
    }
    tree_getProperty(target, property) {
        switch (property) {
            case "value":
                return target.getSubtree(exports.VALUE_GINDEX);
            case "selector":
                return wellKnown_1.number32Type.struct_deserializeFromBytes(target.getRoot(exports.SELECTOR_GINDEX), 0);
            default:
                throw new Error(`Invalid property ${String(property)} for Union type`);
        }
    }
    tree_setProperty(target, property, value) {
        if (property !== "value") {
            throw new Error(`Invalid property ${String(property)} to set for Union type`);
        }
        const type = this.getType(target);
        if (abstract_1.isCompositeType(type)) {
            target.setSubtree(exports.VALUE_GINDEX, type.struct_convertToTree(value));
        }
        else {
            const chunk = new Uint8Array(32);
            type.struct_serializeToBytes(value, chunk, 0);
            target.setRoot(exports.VALUE_GINDEX, chunk);
        }
        return true;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    tree_deleteProperty(tree, property) {
        throw new Error("Method not implemented for Union type");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    tree_iterateValues(tree) {
        throw new Error("Method not implemented for Union type");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    tree_readonlyIterateValues(tree) {
        throw new Error("Method not implemented for Union type");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    tree_getValues(tree) {
        throw new Error("Method not implemented for Union type");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    tree_readonlyGetValues(tree) {
        throw new Error("Method not implemented for Union type");
    }
    tree_getLeafGindices(target, root = BigInt(1)) {
        const gindices = [persistent_merkle_tree_1.concatGindices([root, exports.SELECTOR_GINDEX])];
        const type = this.getType(target);
        const extendedFieldGindex = persistent_merkle_tree_1.concatGindices([root, exports.VALUE_GINDEX]);
        if (abstract_1.isCompositeType(type)) {
            gindices.push(...type.tree_getLeafGindices(target.getSubtree(exports.VALUE_GINDEX), extendedFieldGindex));
        }
        else {
            gindices.push(extendedFieldGindex);
        }
        return gindices;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getType(target) {
        const selectorRoot = target.getRoot(exports.SELECTOR_GINDEX);
        const selector = wellKnown_1.number32Type.struct_deserializeFromBytes(selectorRoot, 0);
        return this.types[selector];
    }
}
exports.UnionType = UnionType;
//# sourceMappingURL=union.js.map