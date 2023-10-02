"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnionTreeValue = exports.ContainerLeafNodeStructTreeValue = exports.ContainerTreeValue = exports.CompositeListTreeValue = exports.BasicListTreeValue = exports.CompositeArrayTreeValue = exports.BasicArrayTreeValue = exports.TreeValue = exports.TreeProxyHandler = exports.proxyWrapTreeValue = exports.getTreeValueClass = exports.createTreeBacked = exports.isTreeBacked = void 0;
const types_1 = require("../../types");
const byteArray_1 = require("../../util/byteArray");
const tree_1 = require("../../util/tree");
function isTreeBacked(value) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return value && value.type && value.tree && tree_1.isTree(value.tree);
}
exports.isTreeBacked = isTreeBacked;
/**
 * Return an ES6 Proxy-wrapped tree value (ergonomic getter/setter/iteration)
 */
function createTreeBacked(type, tree) {
    const TreeValueClass = getTreeValueClass(type);
    return proxyWrapTreeValue(new TreeValueClass(type, tree));
}
exports.createTreeBacked = createTreeBacked;
function getTreeValueClass(type) {
    if (types_1.isListType(type)) {
        if (types_1.isBasicType(type.elementType)) {
            return BasicListTreeValue;
        }
        else {
            return CompositeListTreeValue;
        }
    }
    else if (types_1.isVectorType(type)) {
        if (types_1.isBasicType(type.elementType)) {
            return BasicArrayTreeValue;
        }
        else {
            return CompositeArrayTreeValue;
        }
    }
    else if (types_1.isContainerType(type)) {
        if (types_1.isContainerLeafNodeStructType(type)) {
            return ContainerLeafNodeStructTreeValue;
        }
        else {
            return ContainerTreeValue;
        }
    }
    else if (types_1.isUnionType(type)) {
        return UnionTreeValue;
    }
    throw Error("No TreeValueClass for type");
}
exports.getTreeValueClass = getTreeValueClass;
/**
 * Wrap a TreeValue in a Proxy that adds ergonomic getter/setter
 */
function proxyWrapTreeValue(value) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new Proxy(value, exports.TreeProxyHandler);
}
exports.proxyWrapTreeValue = proxyWrapTreeValue;
/**
 * Proxy handler that adds ergonomic get/set and exposes TreeValue methods
 */
exports.TreeProxyHandler = {
    get(target, property) {
        if (property in target) {
            return target[property];
        }
        else {
            return target.getProperty(property);
        }
    },
    set(target, property, value) {
        return target.setProperty(property, value);
    },
    ownKeys(target) {
        return target.getPropertyNames();
    },
    getOwnPropertyDescriptor(target, property) {
        if (target.type.getPropertyType(property)) {
            return {
                configurable: true,
                enumerable: true,
                writable: true,
            };
        }
        else {
            return undefined;
        }
    },
};
/**
 * Convenience wrapper around a type and tree
 */
class TreeValue {
    constructor(type, tree) {
        this.type = type;
        this.tree = tree;
    }
    clone() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const TreeValueClass = Object.getPrototypeOf(this).constructor;
        return proxyWrapTreeValue(new TreeValueClass(this.type, this.tree.clone()));
    }
    valueOf() {
        return this.type.tree_convertToStruct(this.tree);
    }
    equals(other) {
        if (isTreeBacked(other)) {
            return byteArray_1.byteArrayEquals(this.hashTreeRoot(), other.hashTreeRoot());
        }
        else {
            return this.type.struct_equals(this, other);
        }
    }
    size() {
        return this.type.tree_getSerializedLength(this.tree);
    }
    toStruct() {
        return this.type.tree_convertToStruct(this.tree);
    }
    toBytes(output, offset) {
        return this.type.tree_serializeToBytes(this.tree, output, offset);
    }
    serialize() {
        const output = new Uint8Array(this.type.tree_getSerializedLength(this.tree));
        this.toBytes(output, 0);
        return output;
    }
    hashTreeRoot() {
        return this.tree.root;
    }
    createProof(paths) {
        return this.type.tree_createProof(this.tree, paths);
    }
    getPropertyNames() {
        return this.type.tree_getPropertyNames(this.tree);
    }
    [Symbol.iterator]() {
        return this.values();
    }
}
exports.TreeValue = TreeValue;
class BasicArrayTreeValue extends TreeValue {
    constructor(type, tree) {
        super(type, tree);
        this.type = type;
    }
    getProperty(property) {
        return this.type.tree_getProperty(this.tree, property);
    }
    setProperty(property, value) {
        return this.type.tree_setProperty(this.tree, property, value);
    }
    *keys() {
        const propNames = this.getPropertyNames();
        // pop off "length"
        propNames.pop();
        yield* propNames.map(String);
    }
    values() {
        return this.type.tree_iterateValues(this.tree);
    }
    *entries() {
        const keys = this.getPropertyNames();
        let i = 0;
        for (const value of this.values()) {
            yield [String(keys[i]), value];
            i++;
        }
    }
    readonlyValues() {
        return this.type.tree_readonlyIterateValues(this.tree);
    }
    *readonlyEntries() {
        const keys = this.getPropertyNames();
        let i = 0;
        for (const value of this.readonlyValues()) {
            yield [String(keys[i]), value];
            i++;
        }
    }
    keysArray() {
        const propNames = this.getPropertyNames();
        // pop off "length"
        propNames.pop();
        return propNames.map(String);
    }
    valuesArray() {
        return this.type.tree_getValues(this.tree);
    }
    entriesArray() {
        const keys = this.getPropertyNames();
        const values = this.valuesArray();
        const entries = [];
        for (let i = 0; i < values.length; i++) {
            entries.push([String(keys[i]), values[i]]);
        }
        return entries;
    }
    readonlyValuesArray() {
        return this.type.tree_readonlyGetValues(this.tree);
    }
    readonlyEntriesArray() {
        const keys = this.getPropertyNames();
        const values = this.readonlyValuesArray();
        const entries = [];
        for (let i = 0; i < values.length; i++) {
            entries.push([String(keys[i]), values[i]]);
        }
        return entries;
    }
}
exports.BasicArrayTreeValue = BasicArrayTreeValue;
class CompositeArrayTreeValue extends TreeValue {
    constructor(type, tree) {
        super(type, tree);
        this.type = type;
    }
    getProperty(property) {
        if (property === "length") {
            return this.type.tree_getProperty(this.tree, property);
        }
        return createTreeBacked(this.type.elementType, this.type.tree_getProperty(this.tree, property));
    }
    setProperty(property, value) {
        return this.type.tree_setProperty(this.tree, property, isTreeBacked(value) ? value.tree : this.type.elementType.struct_convertToTree(value));
    }
    *keys() {
        const propNames = this.getPropertyNames();
        // pop off "length"
        propNames.pop();
        yield* propNames.map(String);
    }
    *values() {
        for (const tree of this.type.tree_iterateValues(this.tree)) {
            yield createTreeBacked(this.type.elementType, tree);
        }
    }
    *entries() {
        const keys = this.getPropertyNames();
        let i = 0;
        for (const value of this.values()) {
            yield [String(keys[i]), value];
            i++;
        }
    }
    *readonlyValues() {
        for (const tree of this.type.tree_readonlyIterateValues(this.tree)) {
            yield createTreeBacked(this.type.elementType, tree);
        }
    }
    *readonlyEntries() {
        const keys = this.getPropertyNames();
        let i = 0;
        for (const value of this.readonlyValues()) {
            yield [String(keys[i]), value];
            i++;
        }
    }
    keysArray() {
        const propNames = this.getPropertyNames();
        // pop off "length"
        propNames.pop();
        return propNames.map(String);
    }
    valuesArray() {
        const values = [];
        const rawValues = this.type.tree_getValues(this.tree);
        for (let i = 0; i < rawValues.length; i++) {
            values.push(createTreeBacked(this.type.elementType, rawValues[i]));
        }
        return values;
    }
    entriesArray() {
        const keys = this.getPropertyNames();
        const values = this.valuesArray();
        const entries = [];
        for (let i = 0; i < values.length; i++) {
            entries.push([String(keys[i]), values[i]]);
        }
        return entries;
    }
    readonlyValuesArray() {
        const values = [];
        const rawValues = this.type.tree_readonlyGetValues(this.tree);
        for (let i = 0; i < rawValues.length; i++) {
            values.push(createTreeBacked(this.type.elementType, rawValues[i]));
        }
        return values;
    }
    readonlyEntriesArray() {
        const keys = this.getPropertyNames();
        const values = this.valuesArray();
        const entries = [];
        for (let i = 0; i < values.length; i++) {
            entries.push([String(keys[i]), values[i]]);
        }
        return entries;
    }
}
exports.CompositeArrayTreeValue = CompositeArrayTreeValue;
class BasicListTreeValue extends BasicArrayTreeValue {
    constructor(type, tree) {
        super(type, tree);
        this.type = type;
    }
    push(...values) {
        return this.type.tree_push(this.tree, ...values);
    }
    pop() {
        return this.type.tree_pop(this.tree);
    }
}
exports.BasicListTreeValue = BasicListTreeValue;
class CompositeListTreeValue extends CompositeArrayTreeValue {
    constructor(type, tree) {
        super(type, tree);
        this.type = type;
    }
    push(...values) {
        const convertedValues = values.map((value) => isTreeBacked(value) ? value.tree : this.type.elementType.struct_convertToTree(value));
        return this.type.tree_push(this.tree, ...convertedValues);
    }
    pop() {
        return this.type.tree_pop(this.tree);
    }
}
exports.CompositeListTreeValue = CompositeListTreeValue;
class ContainerTreeValue extends TreeValue {
    constructor(type, tree) {
        super(type, tree);
        this.type = type;
    }
    getProperty(property) {
        if (!this.type.fields[property]) {
            return undefined;
        }
        const propType = this.type.getPropertyType(property);
        const propValue = this.type.tree_getProperty(this.tree, property);
        if (!this.type.fieldInfos.get(property).isBasic) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return createTreeBacked(propType, propValue);
        }
        else {
            return propValue;
        }
    }
    setProperty(property, value) {
        if (!this.type.fieldInfos.get(property).isBasic) {
            if (isTreeBacked(value)) {
                return this.type.tree_setProperty(this.tree, property, value.tree);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const propType = this.type.getPropertyType(property);
                return this.type.tree_setProperty(this.tree, property, propType.struct_convertToTree(value));
            }
        }
        else {
            return this.type.tree_setProperty(this.tree, property, value);
        }
    }
    *keys() {
        yield* this.getPropertyNames();
    }
    *values() {
        for (const [_key, value] of this.entries()) {
            yield value;
        }
    }
    *entries() {
        const keys = this.getPropertyNames();
        let i = 0;
        for (const value of this.type.tree_iterateValues(this.tree)) {
            const propName = keys[i];
            const propType = this.type.getPropertyType(propName);
            if (types_1.isCompositeType(propType)) {
                yield [propName, createTreeBacked(propType, value)];
            }
            else {
                yield [propName, value];
            }
            i++;
        }
    }
    *readonlyValues() {
        for (const [_key, value] of this.readonlyEntries()) {
            yield value;
        }
    }
    *readonlyEntries() {
        const keys = this.getPropertyNames();
        let i = 0;
        for (const value of this.type.tree_readonlyIterateValues(this.tree)) {
            const propName = keys[i];
            const propType = this.type.getPropertyType(propName);
            if (types_1.isCompositeType(propType)) {
                yield [propName, createTreeBacked(propType, value)];
            }
            else {
                yield [propName, value];
            }
            i++;
        }
    }
    keysArray() {
        return this.getPropertyNames();
    }
    valuesArray() {
        const values = [];
        const entries = this.entriesArray();
        for (let i = 0; i < entries.length; i++) {
            values.push(entries[i][1]);
        }
        return values;
    }
    entriesArray() {
        const keys = this.keysArray();
        const values = this.valuesArray();
        const entries = [];
        for (let i = 0; i < values.length; i++) {
            const key = keys[i];
            const value = values[i];
            const fieldType = this.type.getPropertyType(key);
            if (types_1.isCompositeType(fieldType)) {
                entries.push([key, createTreeBacked(fieldType, value)]);
            }
            else {
                entries.push([key, value]);
            }
        }
        return entries;
    }
    readonlyValuesArray() {
        const values = [];
        const entries = this.readonlyEntriesArray();
        for (let i = 0; i < entries.length; i++) {
            values.push(entries[i][1]);
        }
        return values;
    }
    readonlyEntriesArray() {
        const keys = this.keysArray();
        const values = this.readonlyValuesArray();
        const entries = [];
        for (let i = 0; i < values.length; i++) {
            const key = keys[i];
            const value = values[i];
            const fieldType = this.type.getPropertyType(key);
            if (types_1.isCompositeType(fieldType)) {
                entries.push([key, createTreeBacked(fieldType, value)]);
            }
            else {
                entries.push([key, value]);
            }
        }
        return entries;
    }
}
exports.ContainerTreeValue = ContainerTreeValue;
/**
 * Custom TreeValue to be used in `ContainerLeafNodeStructType`.
 *
 * It skips extra work done in `ContainerTreeValue` since all data is represented as struct and should be returned
 * as struct, not as TreeBacked.
 */
class ContainerLeafNodeStructTreeValue extends TreeValue {
    constructor(type, tree) {
        super(type, tree);
        this.type = type;
    }
    getProperty(property) {
        return this.type.tree_getProperty(this.tree, property);
    }
    setProperty(property, value) {
        return this.type.tree_setProperty(this.tree, property, value);
    }
    *keys() {
        yield* this.getPropertyNames();
    }
    *values() {
        for (const [_key, value] of this.entries()) {
            yield value;
        }
    }
    *entries() {
        const keys = this.getPropertyNames();
        let i = 0;
        for (const value of this.type.tree_iterateValues(this.tree)) {
            const propName = keys[i];
            yield [propName, value];
            i++;
        }
    }
    *readonlyValues() {
        yield* this.values();
    }
    *readonlyEntries() {
        yield* this.entries();
    }
    keysArray() {
        return this.getPropertyNames();
    }
    valuesArray() {
        return this.type.tree_getValues(this.tree);
    }
    entriesArray() {
        const keys = this.getPropertyNames();
        const values = this.type.tree_getValues(this.tree);
        return keys.map((key, i) => [key, values[i]]);
    }
    readonlyValuesArray() {
        return this.valuesArray();
    }
    readonlyEntriesArray() {
        return this.entriesArray();
    }
}
exports.ContainerLeafNodeStructTreeValue = ContainerLeafNodeStructTreeValue;
class UnionTreeValue extends TreeValue {
    constructor(type, tree) {
        super(type, tree);
        this.type = type;
    }
    getProperty(property) {
        if (property !== "selector" && property !== "value") {
            throw new Error(`property ${property} does not exist in Union type`);
        }
        const propType = this.type.getPropertyTypeFromTree(this.tree, property);
        const propValue = this.type.tree_getProperty(this.tree, property);
        if (types_1.isCompositeType(propType)) {
            return createTreeBacked(propType, propValue);
        }
        else {
            return propValue;
        }
    }
    setProperty(property, value) {
        if (property !== "value") {
            throw new Error(`Unsupport setting property ${property} for Union`);
        }
        return this.type.tree_setProperty(this.tree, property, value);
    }
    *keys() {
        yield* this.getPropertyNames();
    }
    *values() {
        for (const [_key, value] of this.entries()) {
            yield value;
        }
    }
    entries() {
        throw new Error("Method not implemented for Union type");
    }
    readonlyValues() {
        throw new Error("Method not implemented for Union type");
    }
    readonlyEntries() {
        throw new Error("Method not implemented for Union type");
    }
    keysArray() {
        throw new Error("Method not implemented for Union type");
    }
    valuesArray() {
        throw new Error("Method not implemented for Union type");
    }
    entriesArray() {
        throw new Error("Method not implemented for Union type");
    }
    readonlyValuesArray() {
        throw new Error("Method not implemented for Union type");
    }
    readonlyEntriesArray() {
        throw new Error("Method not implemented for Union type");
    }
}
exports.UnionTreeValue = UnionTreeValue;
//# sourceMappingURL=treeValue.js.map