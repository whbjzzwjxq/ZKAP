"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContainerType = exports.isContainerType = exports.CONTAINER_TYPE = void 0;
const abstract_1 = require("./abstract");
const type_1 = require("../type");
const persistent_merkle_tree_1 = require("@chainsafe/persistent-merkle-tree");
const errorPath_1 = require("../../util/errorPath");
const json_1 = require("../../util/json");
const basic_1 = require("../../util/basic");
const hash_1 = require("../../util/hash");
const treeValue_1 = require("../../backings/tree/treeValue");
exports.CONTAINER_TYPE = Symbol.for("ssz/ContainerType");
function isContainerType(type) {
    return type_1.isTypeOf(type, exports.CONTAINER_TYPE);
}
exports.isContainerType = isContainerType;
class ContainerType extends abstract_1.CompositeType {
    constructor(options) {
        super();
        this.fields = { ...options.fields };
        this.casingMap = options.casingMap;
        this.expectedCase = options.expectedCase;
        this._typeSymbols.add(exports.CONTAINER_TYPE);
        this.fieldInfos = new Map();
        let chunkIndex = 0;
        for (const [fieldName, fieldType] of Object.entries(this.fields)) {
            this.fieldInfos.set(fieldName, {
                isBasic: !abstract_1.isCompositeType(fieldType),
                gIndexBitString: this.getGindexBitStringAtChunkIndex(chunkIndex),
                gIndex: this.getGindexAtChunkIndex(chunkIndex),
            });
            chunkIndex++;
        }
    }
    struct_defaultValue() {
        const obj = {};
        for (const [fieldName, fieldType] of Object.entries(this.fields)) {
            obj[fieldName] = fieldType.struct_defaultValue();
        }
        return obj;
    }
    struct_getSerializedLength(value) {
        let s = 0;
        for (const [fieldName, fieldType] of Object.entries(this.fields)) {
            const fixedLen = fieldType.getFixedSerializedLength();
            if (fixedLen === null) {
                s += fieldType.struct_getSerializedLength(value[fieldName]) + 4;
            }
            else {
                s += fixedLen;
            }
        }
        return s;
    }
    getMaxSerializedLength() {
        let maxSize = 0;
        for (const fieldType of Object.values(this.fields)) {
            const fieldFixedLen = fieldType.getFixedSerializedLength();
            if (fieldFixedLen === null) {
                // +4 for the offset
                maxSize += 4 + fieldType.getMaxSerializedLength();
            }
            else {
                maxSize += fieldFixedLen;
            }
        }
        return maxSize;
    }
    getMinSerializedLength() {
        let maxSize = 0;
        for (const fieldType of Object.values(this.fields)) {
            const fieldFixedLen = fieldType.getFixedSerializedLength();
            if (fieldFixedLen === null) {
                // +4 for the offset
                maxSize += 4 + fieldType.getMinSerializedLength();
            }
            else {
                maxSize += fieldFixedLen;
            }
        }
        return maxSize;
    }
    struct_assertValidValue(value) {
        for (const [fieldName, fieldType] of Object.entries(this.fields)) {
            try {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                fieldType.struct_assertValidValue(value[fieldName]);
            }
            catch (e) {
                throw new Error(`Invalid field ${fieldName}: ${e.message}`);
            }
        }
    }
    struct_equals(value1, value2) {
        this.struct_assertValidValue(value1);
        this.struct_assertValidValue(value2);
        return Object.entries(this.fields).every(([fieldName, fieldType]) => {
            return fieldType.struct_equals(value1[fieldName], value2[fieldName]);
        });
    }
    struct_clone(value) {
        const newValue = {};
        for (const [fieldName, fieldType] of Object.entries(this.fields)) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            newValue[fieldName] = fieldType.struct_clone(value[fieldName]);
        }
        return newValue;
    }
    struct_deserializeFromBytes(data, start, end) {
        this.bytes_validate(data, start, end);
        let currentIndex = start;
        let nextIndex = currentIndex;
        const value = {};
        // Since variable-sized values can be interspersed with fixed-sized values, we precalculate
        // the offset indices so we can more easily deserialize the fields in once pass first we get the fixed sizes
        // Note: `fixedSizes[i] = null` if that field has variable length
        const fixedSizes = Object.values(this.fields).map((fieldType) => fieldType.getFixedSerializedLength());
        // with the fixed sizes, we can read the offsets, and store for our single pass
        const offsets = [];
        const fixedSection = new DataView(data.buffer, data.byteOffset);
        const fixedEnd = fixedSizes.reduce((index, size) => {
            if (size === null) {
                offsets.push(start + fixedSection.getUint32(index, true));
                return index + 4;
            }
            else {
                return index + size;
            }
        }, start);
        offsets.push(end);
        if (fixedEnd !== offsets[0]) {
            throw new Error("Not all variable bytes consumed");
        }
        let offsetIndex = 0;
        for (const [i, [fieldName, fieldType]] of Object.entries(this.fields).entries()) {
            try {
                const fieldSize = fixedSizes[i];
                if (fieldSize === null) {
                    // variable-sized field
                    if (offsets[offsetIndex] > end) {
                        throw new Error("Offset out of bounds");
                    }
                    if (offsets[offsetIndex] > offsets[offsetIndex + 1]) {
                        throw new Error("Offsets must be increasing");
                    }
                    value[fieldName] = fieldType.struct_deserializeFromBytes(data, offsets[offsetIndex], offsets[offsetIndex + 1]);
                    offsetIndex++;
                    currentIndex += 4;
                }
                else {
                    // fixed-sized field
                    nextIndex = currentIndex + fieldSize;
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    value[fieldName] = fieldType.struct_deserializeFromBytes(data, currentIndex, nextIndex);
                    currentIndex = nextIndex;
                }
            }
            catch (e) {
                throw new errorPath_1.SszErrorPath(e, fieldName);
            }
        }
        if (offsets.length > 1) {
            if (offsetIndex !== offsets.length - 1) {
                throw new Error("Not all variable bytes consumed");
            }
            if (currentIndex !== offsets[0]) {
                throw new Error("Not all fixed bytes consumed");
            }
        }
        else {
            if (currentIndex !== end) {
                throw new Error("Not all fixed bytes consumed");
            }
        }
        return value;
    }
    struct_serializeToBytes(value, output, offset) {
        let variableIndex = offset;
        for (const fieldType of Object.values(this.fields)) {
            const fixedLen = fieldType.getFixedSerializedLength();
            variableIndex += fixedLen === null ? 4 : fixedLen;
        }
        const fixedSection = new DataView(output.buffer, output.byteOffset + offset);
        let fixedIndex = offset;
        for (const [fieldName, fieldType] of Object.entries(this.fields)) {
            if (fieldType.hasVariableSerializedLength()) {
                // write offset
                fixedSection.setUint32(fixedIndex - offset, variableIndex - offset, true);
                fixedIndex += 4;
                // write serialized element to variable section
                variableIndex = fieldType.toBytes(value[fieldName], output, variableIndex);
            }
            else {
                fixedIndex = fieldType.toBytes(value[fieldName], output, fixedIndex);
            }
        }
        return variableIndex;
    }
    struct_getRootAtChunkIndex(value, index) {
        const fieldName = Object.keys(this.fields)[index];
        const fieldType = this.fields[fieldName];
        return fieldType.struct_hashTreeRoot(value[fieldName]);
    }
    struct_convertFromJson(data, options) {
        if (typeof data !== "object") {
            throw new Error("Invalid JSON container: expected Object");
        }
        const value = {};
        const expectedCase = this.expectedCase || (options && options.case);
        const customCasingMap = this.casingMap || (options && options.casingMap);
        for (const [fieldName, fieldType] of Object.entries(this.fields)) {
            const expectedFieldName = json_1.toExpectedCase(fieldName, expectedCase, customCasingMap);
            if (data[expectedFieldName] === undefined) {
                throw new Error(`Invalid JSON container field: expected field ${expectedFieldName} is undefined`);
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            value[fieldName] = fieldType.fromJson(data[expectedFieldName], options);
        }
        return value;
    }
    struct_convertToJson(value, options) {
        const data = {};
        const expectedCase = this.expectedCase || (options && options.case);
        const customCasingMap = this.casingMap || (options && options.casingMap);
        for (const [fieldName, fieldType] of Object.entries(this.fields)) {
            data[json_1.toExpectedCase(fieldName, expectedCase, customCasingMap)] = fieldType.toJson(value[fieldName], options);
        }
        return data;
    }
    struct_convertToTree(value) {
        if (treeValue_1.isTreeBacked(value))
            return value.tree.clone();
        return new persistent_merkle_tree_1.Tree(persistent_merkle_tree_1.subtreeFillToContents(Object.entries(this.fields).map(([fieldName, fieldType]) => {
            if (!abstract_1.isCompositeType(fieldType)) {
                return basic_1.basicTypeToLeafNode(fieldType, value[fieldName]);
            }
            else {
                return fieldType.struct_convertToTree(value[fieldName]).rootNode;
            }
        }), this.getChunkDepth()));
    }
    struct_getPropertyNames() {
        return Object.keys(this.fields);
    }
    bytes_getVariableOffsets(target) {
        const types = Object.values(this.fields);
        const offsets = [];
        // variable-sized values can be interspersed with fixed-sized values
        // variable-sized value indices are serialized as offsets, indices deeper in the byte array
        let currentIndex = 0;
        let nextIndex = 0;
        const fixedSection = new DataView(target.buffer, target.byteOffset);
        const fixedOffsets = [];
        const variableOffsets = [];
        let variableIndex = 0;
        for (const [i, fieldType] of types.entries()) {
            const fixedLen = fieldType.getFixedSerializedLength();
            if (fixedLen === null) {
                const offset = fixedSection.getUint32(currentIndex, true);
                if (offset > target.length) {
                    throw new Error("Offset out of bounds");
                }
                variableOffsets.push(offset);
                currentIndex = nextIndex = currentIndex + 4;
                variableIndex++;
            }
            else {
                nextIndex = currentIndex + fixedLen;
                fixedOffsets[i] = [currentIndex, nextIndex];
                currentIndex = nextIndex;
            }
        }
        variableOffsets.push(target.length);
        variableIndex = 0;
        for (const [i, fieldType] of types.entries()) {
            if (fieldType.hasVariableSerializedLength()) {
                if (variableOffsets[variableIndex] > variableOffsets[variableIndex + 1]) {
                    throw new Error("Offsets must be increasing");
                }
                offsets.push([variableOffsets[variableIndex], variableOffsets[variableIndex + 1]]);
                variableIndex++;
            }
            else {
                offsets.push(fixedOffsets[i]);
            }
        }
        return offsets;
    }
    tree_defaultNode() {
        if (!this._defaultNode) {
            this._defaultNode = persistent_merkle_tree_1.subtreeFillToContents(Object.values(this.fields).map((fieldType) => {
                if (!abstract_1.isCompositeType(fieldType)) {
                    return persistent_merkle_tree_1.zeroNode(0);
                }
                else {
                    return fieldType.tree_defaultNode();
                }
            }), this.getChunkDepth());
        }
        return this._defaultNode;
    }
    tree_convertToStruct(target) {
        const value = {};
        for (const [fieldName, fieldType] of Object.entries(this.fields)) {
            const fieldInfo = this.fieldInfos.get(fieldName);
            if (fieldInfo.isBasic) {
                const chunk = target.getRoot(fieldInfo.gIndexBitString);
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                value[fieldName] = fieldType.struct_deserializeFromBytes(chunk, 0);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const compositeType = fieldType;
                const subtree = target.getSubtree(fieldInfo.gIndexBitString);
                value[fieldName] = compositeType.tree_convertToStruct(subtree);
            }
        }
        return value;
    }
    tree_getSerializedLength(target) {
        let s = 0;
        for (const [fieldName, fieldType] of Object.entries(this.fields)) {
            const fixedLen = fieldType.getFixedSerializedLength();
            if (fixedLen === null) {
                s +=
                    fieldType.tree_getSerializedLength(target.getSubtree(this.fieldInfos.get(fieldName).gIndexBitString)) + 4;
            }
            else {
                s += fixedLen;
            }
        }
        return s;
    }
    tree_deserializeFromBytes(data, start, end) {
        const target = this.tree_defaultValue();
        const offsets = this.bytes_getVariableOffsets(new Uint8Array(data.buffer, data.byteOffset + start, end - start));
        for (const [i, [fieldName, fieldType]] of Object.entries(this.fields).entries()) {
            const [currentOffset, nextOffset] = offsets[i];
            const { isBasic, gIndex: gindex } = this.fieldInfos.get(fieldName);
            if (isBasic) {
                // view of the chunk, shared buffer from `data`
                const dataChunk = new Uint8Array(data.buffer, data.byteOffset + start + currentOffset, nextOffset - currentOffset);
                const chunk = new Uint8Array(32);
                // copy chunk into new memory
                chunk.set(dataChunk);
                target.setRoot(gindex, chunk);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const compositeType = fieldType;
                target.setSubtree(gindex, compositeType.tree_deserializeFromBytes(data, start + currentOffset, start + nextOffset));
            }
        }
        return target;
    }
    tree_serializeToBytes(target, output, offset) {
        let variableIndex = offset;
        for (const fieldType of Object.values(this.fields)) {
            const fixedLen = fieldType.getFixedSerializedLength();
            variableIndex += fixedLen === null ? 4 : fixedLen;
        }
        const fixedSection = new DataView(output.buffer, output.byteOffset + offset);
        let fixedIndex = offset;
        const fieldTypes = Object.values(this.fields);
        const nodes = target.getNodesAtDepth(this.getChunkDepth(), 0, fieldTypes.length);
        for (let i = 0; i < fieldTypes.length; i++) {
            const fieldType = fieldTypes[i];
            const node = nodes[i];
            if (!abstract_1.isCompositeType(fieldType)) {
                const s = fieldType.struct_getSerializedLength();
                output.set(node.root.slice(0, s), fixedIndex);
                fixedIndex += s;
            }
            else if (fieldType.hasVariableSerializedLength()) {
                // write offset
                fixedSection.setUint32(fixedIndex - offset, variableIndex - offset, true);
                fixedIndex += 4;
                // write serialized element to variable section
                variableIndex = fieldType.tree_serializeToBytes(new persistent_merkle_tree_1.Tree(node), output, variableIndex);
            }
            else {
                fixedIndex = fieldType.tree_serializeToBytes(new persistent_merkle_tree_1.Tree(node), output, fixedIndex);
            }
        }
        return variableIndex;
    }
    getPropertyGindex(prop) {
        const fieldInfo = this.fieldInfos.get(prop);
        if (!fieldInfo) {
            throw new Error(`Invalid container field name: ${String(prop)}`);
        }
        return fieldInfo.gIndex;
    }
    getPropertyType(prop) {
        const type = this.fields[prop];
        if (!type) {
            throw new Error(`Invalid container field name: ${String(prop)}`);
        }
        return type;
    }
    tree_getPropertyNames() {
        return Object.keys(this.fields);
    }
    tree_getProperty(target, prop) {
        const fieldType = this.fields[prop];
        const fieldInfo = this.fieldInfos.get(prop);
        if (!fieldInfo) {
            return undefined;
        }
        if (fieldInfo.isBasic) {
            // Number64Uint wants to work on HashObject to improve performance
            if (fieldType.struct_deserializeFromHashObject) {
                const hashObject = target.getHashObject(fieldInfo.gIndexBitString);
                return fieldType.struct_deserializeFromHashObject(hashObject, 0);
            }
            const chunk = target.getRoot(fieldInfo.gIndexBitString);
            return fieldType.struct_deserializeFromBytes(chunk, 0);
        }
        else {
            return target.getSubtree(fieldInfo.gIndexBitString);
        }
    }
    tree_setProperty(target, property, value) {
        const fieldType = this.fields[property];
        const fieldInfo = this.fieldInfos.get(property);
        if (!fieldInfo) {
            throw new Error("Invalid container field name");
        }
        if (fieldInfo.isBasic) {
            // Number64Uint wants to work on HashObject to improve performance
            if (fieldType.struct_serializeToHashObject) {
                const hashObject = hash_1.newHashObject();
                fieldType.struct_serializeToHashObject(value, hashObject, 0);
                target.setHashObject(fieldInfo.gIndexBitString, hashObject);
                return true;
            }
            const chunk = new Uint8Array(32);
            fieldType.struct_serializeToBytes(value, chunk, 0);
            target.setRoot(fieldInfo.gIndexBitString, chunk);
            return true;
        }
        else {
            target.setSubtree(fieldInfo.gIndexBitString, value);
            return true;
        }
    }
    tree_deleteProperty(target, prop) {
        const fieldInfo = this.fieldInfos.get(prop);
        if (!fieldInfo) {
            throw new Error("Invalid container field name");
        }
        const fieldType = this.fields[prop];
        if (fieldInfo.isBasic) {
            return this.tree_setProperty(target, prop, fieldType.struct_defaultValue());
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const compositeType = fieldType;
            return this.tree_setProperty(target, prop, compositeType.tree_defaultValue());
        }
    }
    *tree_iterateValues(target) {
        const gindexIterator = persistent_merkle_tree_1.iterateAtDepth(this.getChunkDepth(), BigInt(0), BigInt(this.getMaxChunkCount()))[Symbol.iterator]();
        for (const propType of Object.values(this.fields)) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const { value, done } = gindexIterator.next();
            if (done) {
                return;
            }
            else {
                if (!abstract_1.isCompositeType(propType)) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    yield propType.struct_deserializeFromBytes(value.root, 0);
                }
                else {
                    yield target.getSubtree(value);
                }
            }
        }
    }
    *tree_readonlyIterateValues(target) {
        const fieldTypes = Object.values(this.fields);
        const nodes = target.getNodesAtDepth(this.getChunkDepth(), 0, fieldTypes.length);
        for (let i = 0; i < fieldTypes.length; i++) {
            const fieldType = fieldTypes[i];
            const node = nodes[i];
            if (!abstract_1.isCompositeType(fieldType)) {
                yield fieldType.struct_deserializeFromBytes(node.root, 0);
            }
            else {
                yield new persistent_merkle_tree_1.Tree(node);
            }
        }
    }
    tree_getValues(target) {
        const fieldTypes = Object.values(this.fields);
        const gindices = persistent_merkle_tree_1.getGindicesAtDepth(this.getChunkDepth(), 0, fieldTypes.length);
        const values = [];
        for (let i = 0; i < fieldTypes.length; i++) {
            const fieldType = fieldTypes[i];
            if (!abstract_1.isCompositeType(fieldType)) {
                values.push(fieldType.struct_deserializeFromBytes(target.getRoot(gindices[i]), 0));
            }
            else {
                values.push(target.getSubtree(gindices[i]));
            }
        }
        return values;
    }
    tree_readonlyGetValues(target) {
        const fieldTypes = Object.values(this.fields);
        const nodes = target.getNodesAtDepth(this.getChunkDepth(), 0, fieldTypes.length);
        const values = [];
        for (let i = 0; i < fieldTypes.length; i++) {
            const fieldType = fieldTypes[i];
            const node = nodes[i];
            if (!abstract_1.isCompositeType(fieldType)) {
                values.push(fieldType.struct_deserializeFromBytes(node.root, 0));
            }
            else {
                values.push(new persistent_merkle_tree_1.Tree(node));
            }
        }
        return values;
    }
    hasVariableSerializedLength() {
        return Object.values(this.fields).some((fieldType) => fieldType.hasVariableSerializedLength());
    }
    getFixedSerializedLength() {
        let fixedLen = 0;
        for (const fieldType of Object.values(this.fields)) {
            const fieldFixedLen = fieldType.getFixedSerializedLength();
            if (fieldFixedLen === null) {
                return null;
            }
            else {
                fixedLen += fieldFixedLen;
            }
        }
        return fixedLen;
    }
    getMaxChunkCount() {
        return Object.keys(this.fields).length;
    }
    tree_getLeafGindices(target, root = BigInt(1)) {
        const gindices = [];
        for (const [fieldName, fieldType] of Object.entries(this.fields)) {
            const { isBasic, gIndex: fieldGindex, gIndexBitString: gindexbitstring } = this.fieldInfos.get(fieldName);
            const extendedFieldGindex = persistent_merkle_tree_1.concatGindices([root, fieldGindex]);
            if (isBasic) {
                gindices.push(extendedFieldGindex);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const compositeType = fieldType;
                if (fieldType.hasVariableSerializedLength()) {
                    if (!target) {
                        throw new Error("variable type requires tree argument to get leaves");
                    }
                    gindices.push(...compositeType.tree_getLeafGindices(target.getSubtree(gindexbitstring), extendedFieldGindex));
                }
                else {
                    gindices.push(...compositeType.tree_getLeafGindices(undefined, extendedFieldGindex));
                }
            }
        }
        return gindices;
    }
}
exports.ContainerType = ContainerType;
//# sourceMappingURL=container.js.map