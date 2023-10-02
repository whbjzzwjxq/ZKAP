"use strict";
/* eslint-disable @typescript-eslint/member-ordering */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompositeArrayType = exports.BasicArrayType = void 0;
const abstract_1 = require("./abstract");
const errorPath_1 = require("../../util/errorPath");
const persistent_merkle_tree_1 = require("@chainsafe/persistent-merkle-tree");
const treeValue_1 = require("../../backings/tree/treeValue");
class BasicArrayType extends abstract_1.CompositeType {
    constructor(options) {
        super();
        this.elementType = options.elementType;
    }
    struct_getSerializedLength(value) {
        return this.elementType.struct_getSerializedLength() * this.struct_getLength(value);
    }
    getMaxSerializedLength() {
        return this.getMaxLength() * this.elementType.getMaxSerializedLength();
    }
    getMinSerializedLength() {
        return this.getMinLength() * this.elementType.getMinSerializedLength();
    }
    struct_assertValidValue(value) {
        for (let i = 0; i < this.struct_getLength(value); i++) {
            try {
                this.elementType.struct_assertValidValue(value[i]);
            }
            catch (e) {
                throw new Error(`Invalid element ${i}: ${e.message}`);
            }
        }
    }
    struct_equals(value1, value2) {
        if (this.struct_getLength(value1) !== this.struct_getLength(value2)) {
            return false;
        }
        for (let i = 0; i < this.struct_getLength(value1); i++) {
            if (!this.elementType.struct_equals(value1[i], value2[i])) {
                return false;
            }
        }
        return true;
    }
    struct_clone(value) {
        const newValue = this.struct_defaultValue();
        for (let i = 0; i < this.struct_getLength(value); i++) {
            newValue[i] = this.elementType.struct_clone(value[i]);
        }
        return newValue;
    }
    struct_deserializeFromBytes(data, start, end, emptyOk) {
        this.bytes_validate(data, start, end, emptyOk);
        const elementSize = this.elementType.struct_getSerializedLength();
        return Array.from({ length: (end - start) / elementSize }, (_, i) => this.elementType.struct_deserializeFromBytes(data, start + i * elementSize));
    }
    struct_serializeToBytes(value, output, offset) {
        const length = this.struct_getLength(value);
        let index = offset;
        for (let i = 0; i < length; i++) {
            index = this.elementType.struct_serializeToBytes(value[i], output, index);
        }
        return index;
    }
    struct_getRootAtChunkIndex(value, index) {
        const output = new Uint8Array(32);
        const itemSize = this.elementType.struct_getSerializedLength();
        const itemsInChunk = Math.floor(32 / itemSize);
        const firstIndex = index * itemsInChunk;
        // not inclusive
        const lastIndex = Math.min(this.struct_getLength(value), firstIndex + itemsInChunk);
        // i = array index, grows by 1
        // j = data offset, grows by itemSize
        for (let i = firstIndex, j = 0; i < lastIndex; i++, j += itemSize) {
            this.elementType.struct_serializeToBytes(value[i], output, j);
        }
        return output;
    }
    struct_getPropertyNames(value) {
        const length = this.struct_getLength(value);
        return Array.from({ length }, (_, i) => i).concat(["length"]);
    }
    struct_convertFromJson(data) {
        return Array.from({ length: data.length }, (_, i) => this.elementType.fromJson(data[i]));
    }
    struct_convertToJson(value) {
        return Array.from({ length: this.struct_getLength(value) }, (_, i) => this.elementType.struct_convertToJson(value[i]));
    }
    struct_convertToTree(value) {
        if (treeValue_1.isTreeBacked(value))
            return value.tree.clone();
        const contents = [];
        for (const chunk of this.struct_yieldChunkRoots(value)) {
            contents.push(new persistent_merkle_tree_1.LeafNode(chunk));
        }
        return new persistent_merkle_tree_1.Tree(persistent_merkle_tree_1.subtreeFillToContents(contents, this.getChunkDepth()));
    }
    tree_convertToStruct(target) {
        const value = this.struct_defaultValue();
        const length = this.tree_getLength(target);
        for (let i = 0; i < length; i++) {
            value[i] = this.tree_getValueAtIndex(target, i);
        }
        return value;
    }
    tree_getSerializedLength(target) {
        return this.elementType.struct_getSerializedLength() * this.tree_getLength(target);
    }
    tree_deserializeFromBytes(data, start, end) {
        const target = this.tree_defaultValue();
        const byteLength = end - start;
        const chunkCount = Math.ceil(byteLength / 32);
        for (let i = 0; i < chunkCount; i++) {
            // view of the chunk, shared buffer from `data`
            const dataChunk = new Uint8Array(data.buffer, data.byteOffset + start + i * 32, Math.min(32, byteLength - i * 32));
            // copy chunk into new memory
            const chunk = new Uint8Array(32);
            chunk.set(dataChunk);
            this.tree_setRootAtChunkIndex(target, i, chunk, true // expand tree as needed
            );
        }
        return target;
    }
    tree_serializeToBytes(target, output, offset) {
        const size = this.tree_getSerializedLength(target);
        const fullChunkCount = Math.floor(size / 32);
        const remainder = size % 32;
        let i = 0;
        if (fullChunkCount > 0) {
            const nodes = target.getNodesAtDepth(this.getChunkDepth(), 0, fullChunkCount);
            for (; i < nodes.length; i++) {
                output.set(nodes[i].root, offset + i * 32);
            }
        }
        if (remainder) {
            output.set(this.tree_getRootAtChunkIndex(target, fullChunkCount).slice(0, remainder), offset + i * 32);
        }
        return offset + size;
    }
    getPropertyGindex(prop) {
        return this.getGindexAtChunkIndex(this.getChunkIndex(prop));
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getPropertyType(prop) {
        return this.elementType;
    }
    *tree_iterateValues(target) {
        const length = this.tree_getLength(target);
        if (length === 0) {
            return;
        }
        const elementSize = this.elementType.struct_getSerializedLength();
        if (32 % elementSize !== 0) {
            throw new Error("cannot handle a non-chunk-alignable elementType");
        }
        let left = length;
        const nodes = target.getNodesAtDepth(this.getChunkDepth(), 0, this.tree_getChunkCount(target));
        for (let i = 0; i < nodes.length; i++) {
            const chunk = nodes[i].root;
            for (let offset = 0; offset < 32; offset += elementSize) {
                yield this.elementType.struct_deserializeFromBytes(chunk, offset);
                left--;
                if (left === 0) {
                    return;
                }
            }
        }
    }
    *tree_readonlyIterateValues(target) {
        yield* this.tree_iterateValues(target);
    }
    tree_getValues(target) {
        const length = this.tree_getLength(target);
        if (length === 0) {
            return [];
        }
        const elementSize = this.elementType.struct_getSerializedLength();
        if (32 % elementSize !== 0) {
            throw new Error("cannot handle a non-chunk-alignable elementType");
        }
        let left = length;
        const values = [];
        const nodes = target.getNodesAtDepth(this.getChunkDepth(), 0, this.tree_getChunkCount(target));
        out: for (let i = 0; i < nodes.length; i++) {
            const chunk = nodes[i].root;
            for (let offset = 0; offset < 32; offset += elementSize) {
                values.push(this.elementType.struct_deserializeFromBytes(chunk, offset));
                left--;
                if (left === 0) {
                    break out;
                }
            }
        }
        return values;
    }
    tree_readonlyGetValues(target) {
        return this.tree_getValues(target);
    }
    getChunkOffset(index) {
        const elementSize = this.elementType.struct_getSerializedLength();
        return (index % Math.ceil(32 / elementSize)) * elementSize;
    }
    getChunkIndex(index) {
        return Math.floor(index / Math.ceil(32 / this.elementType.struct_getSerializedLength()));
    }
    tree_getValueAtIndex(target, index) {
        const chunk = this.tree_getRootAtChunkIndex(target, this.getChunkIndex(index));
        return this.elementType.struct_deserializeFromBytes(chunk, this.getChunkOffset(index));
    }
    tree_setValueAtIndex(target, index, value, expand = false) {
        const chunkGindexBitString = this.getGindexBitStringAtChunkIndex(this.getChunkIndex(index));
        // copy data from old chunk, use new memory to set a new chunk
        const chunk = new Uint8Array(32);
        chunk.set(target.getRoot(chunkGindexBitString));
        this.elementType.struct_serializeToBytes(value, chunk, this.getChunkOffset(index));
        target.setRoot(chunkGindexBitString, chunk, expand);
        return true;
    }
    tree_getProperty(target, property) {
        const length = this.tree_getLength(target);
        if (property === "length") {
            return length;
        }
        const index = Number(property);
        if (Number.isNaN(index) || index >= length) {
            return undefined;
        }
        return this.tree_getValueAtIndex(target, index);
    }
    tree_setProperty(target, property, value, expand = false) {
        return this.tree_setValueAtIndex(target, property, value, expand);
    }
    tree_deleteProperty(target, property) {
        return this.tree_setProperty(target, property, this.elementType.struct_defaultValue());
    }
    tree_getPropertyNames(target) {
        return Array.from({ length: this.tree_getLength(target) }, (_, i) => String(i)).concat("length");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    bytes_getVariableOffsets(target) {
        return [];
    }
    tree_getLeafGindices(target, root = BigInt(1)) {
        const chunkCount = this.tree_getChunkCount(target);
        const startIndex = persistent_merkle_tree_1.concatGindices([root, persistent_merkle_tree_1.toGindex(this.getChunkDepth(), BigInt(0))]);
        const gindices = [];
        for (let i = 0, gindex = startIndex; i < chunkCount; i++, gindex++) {
            gindices.push(gindex);
        }
        return gindices;
    }
}
exports.BasicArrayType = BasicArrayType;
class CompositeArrayType extends abstract_1.CompositeType {
    constructor(options) {
        super();
        this.elementType = options.elementType;
    }
    struct_getSerializedLength(value) {
        const fixedLen = this.elementType.getFixedSerializedLength();
        if (fixedLen === null) {
            let s = 0;
            for (let i = 0; i < this.struct_getLength(value); i++) {
                s += this.elementType.struct_getSerializedLength(value[i]) + 4;
            }
            return s;
        }
        else {
            return fixedLen * this.struct_getLength(value);
        }
    }
    getMaxSerializedLength() {
        const elementFixedLen = this.elementType.getFixedSerializedLength();
        if (elementFixedLen === null) {
            return this.getMaxLength() * 4 + this.getMaxLength() * this.elementType.getMaxSerializedLength();
        }
        else {
            return this.getMaxLength() * elementFixedLen;
        }
    }
    getMinSerializedLength() {
        const elementFixedLen = this.elementType.getFixedSerializedLength();
        if (elementFixedLen === null) {
            return this.getMinLength() * 4 + this.getMinLength() * this.elementType.getMinSerializedLength();
        }
        else {
            return this.getMinLength() * elementFixedLen;
        }
    }
    struct_assertValidValue(value) {
        for (let i = 0; i < this.struct_getLength(value); i++) {
            try {
                this.elementType.struct_assertValidValue(value[i]);
            }
            catch (e) {
                throw new Error(`Invalid element ${i}: ${e.message}`);
            }
        }
    }
    struct_equals(value1, value2) {
        if (this.struct_getLength(value1) !== this.struct_getLength(value2)) {
            return false;
        }
        for (let i = 0; i < this.struct_getLength(value1); i++) {
            if (!this.elementType.struct_equals(value1[i], value2[i])) {
                return false;
            }
        }
        return true;
    }
    struct_clone(value) {
        const newValue = this.struct_defaultValue();
        for (let i = 0; i < this.struct_getLength(value); i++) {
            newValue[i] = this.elementType.struct_clone(value[i]);
        }
        return newValue;
    }
    struct_deserializeFromBytes(data, start, end, emptyOk) {
        this.bytes_validate(data, start, end, emptyOk);
        if (start === end) {
            return [];
        }
        const fixedLen = this.elementType.getFixedSerializedLength();
        if (fixedLen === null) {
            const value = [];
            // all elements variable-sized
            // indices contain offsets
            let currentIndex = start;
            let nextIndex;
            // data exists between offsets
            const fixedSection = new DataView(data.buffer, data.byteOffset);
            const firstOffset = start + fixedSection.getUint32(start, true);
            let currentOffset = firstOffset;
            let nextOffset;
            while (currentIndex < firstOffset) {
                if (currentOffset > end) {
                    throw new Error("Offset out of bounds");
                }
                nextIndex = currentIndex + 4;
                nextOffset = nextIndex === firstOffset ? end : start + fixedSection.getUint32(nextIndex, true);
                if (currentOffset > nextOffset) {
                    throw new Error("Offsets must be increasing");
                }
                try {
                    value.push(this.elementType.struct_deserializeFromBytes(data, currentOffset, nextOffset));
                }
                catch (e) {
                    throw new errorPath_1.SszErrorPath(e, value.length);
                }
                currentIndex = nextIndex;
                currentOffset = nextOffset;
            }
            if (firstOffset !== currentIndex) {
                throw new Error("First offset skips variable data");
            }
            return value;
        }
        else {
            const elementSize = fixedLen;
            return Array.from({ length: (end - start) / elementSize }, (_, i) => this.elementType.struct_deserializeFromBytes(data, start + i * elementSize, start + (i + 1) * elementSize));
        }
    }
    struct_serializeToBytes(value, output, offset) {
        const length = this.struct_getLength(value);
        if (this.elementType.hasVariableSerializedLength()) {
            let variableIndex = offset + length * 4;
            const fixedSection = new DataView(output.buffer, output.byteOffset + offset);
            for (let i = 0; i < length; i++) {
                // write offset
                fixedSection.setUint32(i * 4, variableIndex - offset, true);
                // write serialized element to variable section
                variableIndex = this.elementType.struct_serializeToBytes(value[i], output, variableIndex);
            }
            return variableIndex;
        }
        else {
            let index = offset;
            for (let i = 0; i < length; i++) {
                index = this.elementType.struct_serializeToBytes(value[i], output, index);
            }
            return index;
        }
    }
    struct_getRootAtChunkIndex(value, index) {
        return this.elementType.hashTreeRoot(value[index]);
    }
    struct_getPropertyNames(value) {
        const length = this.struct_getLength(value);
        return Array.from({ length }, (_, i) => i).concat(["length"]);
    }
    struct_convertFromJson(data, options) {
        return Array.from({ length: data.length }, (_, i) => this.elementType.struct_convertFromJson(data[i], options));
    }
    struct_convertToJson(value, options) {
        return Array.from({ length: this.struct_getLength(value) }, (_, i) => this.elementType.struct_convertToJson(value[i], options));
    }
    struct_convertToTree(value) {
        if (treeValue_1.isTreeBacked(value))
            return value.tree.clone();
        const contents = [];
        for (const element of value) {
            contents.push(this.elementType.struct_convertToTree(element).rootNode);
        }
        return new persistent_merkle_tree_1.Tree(persistent_merkle_tree_1.subtreeFillToContents(contents, this.getChunkDepth()));
    }
    tree_convertToStruct(target) {
        const value = this.struct_defaultValue();
        const length = this.tree_getLength(target);
        for (let i = 0; i < length; i++) {
            value[i] = this.elementType.tree_convertToStruct(this.tree_getSubtreeAtChunkIndex(target, i));
        }
        return value;
    }
    tree_getSerializedLength(target) {
        const fixedLen = this.elementType.getFixedSerializedLength();
        if (fixedLen === null) {
            let s = 0;
            for (let i = 0; i < this.tree_getLength(target); i++) {
                s += this.elementType.tree_getSerializedLength(this.tree_getSubtreeAtChunkIndex(target, i)) + 4;
            }
            return s;
        }
        else {
            return fixedLen * this.tree_getLength(target);
        }
    }
    tree_serializeToBytes(target, output, offset) {
        const length = this.tree_getLength(target);
        const nodes = target.getNodesAtDepth(this.getChunkDepth(), 0, length);
        if (this.elementType.hasVariableSerializedLength()) {
            let variableIndex = offset + length * 4;
            const fixedSection = new DataView(output.buffer, output.byteOffset + offset, length * 4);
            for (let i = 0; i < nodes.length; i++) {
                // write offset
                fixedSection.setUint32(i * 4, variableIndex - offset, true);
                // write serialized element to variable section
                variableIndex = this.elementType.tree_serializeToBytes(new persistent_merkle_tree_1.Tree(nodes[i]), output, variableIndex);
            }
            return variableIndex;
        }
        else {
            let index = offset;
            for (let i = 0; i < nodes.length; i++) {
                index = this.elementType.tree_serializeToBytes(new persistent_merkle_tree_1.Tree(nodes[i]), output, index);
            }
            return index;
        }
    }
    getPropertyGindex(prop) {
        return this.getGindexAtChunkIndex(prop);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getPropertyType(prop) {
        return this.elementType;
    }
    tree_getProperty(target, property) {
        const length = this.tree_getLength(target);
        if (property === "length") {
            return length;
        }
        const index = Number(property);
        if (Number.isNaN(index)) {
            return undefined;
        }
        if (index >= length) {
            return undefined;
        }
        return this.tree_getSubtreeAtChunkIndex(target, index);
    }
    tree_setProperty(target, property, value, expand = false) {
        this.tree_setSubtreeAtChunkIndex(target, property, value, expand);
        return true;
    }
    tree_deleteProperty(target, property) {
        return this.tree_setProperty(target, property, this.elementType.tree_defaultValue());
    }
    tree_getPropertyNames(target) {
        return Array.from({ length: this.tree_getLength(target) }, (_, i) => i).concat(["length"]);
    }
    *tree_iterateValues(target) {
        for (const gindex of persistent_merkle_tree_1.iterateAtDepth(this.getChunkDepth(), BigInt(0), BigInt(this.tree_getLength(target)))) {
            yield target.getSubtree(gindex);
        }
    }
    *tree_readonlyIterateValues(target) {
        const nodes = target.getNodesAtDepth(this.getChunkDepth(), 0, this.tree_getLength(target));
        for (let i = 0; i < nodes.length; i++) {
            yield new persistent_merkle_tree_1.Tree(nodes[i]);
        }
    }
    tree_getValues(target) {
        const values = [];
        const gindices = persistent_merkle_tree_1.getGindicesAtDepth(this.getChunkDepth(), 0, this.tree_getLength(target));
        for (let i = 0; i < gindices.length; i++) {
            values.push(target.getSubtree(gindices[i]));
        }
        return values;
    }
    tree_readonlyGetValues(target) {
        const values = [];
        const nodes = target.getNodesAtDepth(this.getChunkDepth(), 0, this.tree_getLength(target));
        for (let i = 0; i < nodes.length; i++) {
            values.push(new persistent_merkle_tree_1.Tree(nodes[i]));
        }
        return values;
    }
    bytes_getVariableOffsets(target) {
        if (this.elementType.hasVariableSerializedLength()) {
            if (target.length === 0) {
                return [];
            }
            const offsets = [];
            // all elements are variable-sized
            // indices contain offsets, which are indices deeper in the byte array
            const fixedSection = new DataView(target.buffer, target.byteOffset);
            const firstOffset = fixedSection.getUint32(0, true);
            let currentOffset = firstOffset;
            let nextOffset;
            let currentIndex = 0;
            let nextIndex = 0;
            while (currentIndex < firstOffset) {
                if (currentOffset > target.length) {
                    throw new Error("Offset out of bounds");
                }
                nextIndex = currentIndex + 4;
                nextOffset = nextIndex === firstOffset ? target.length : fixedSection.getUint32(nextIndex, true);
                if (currentOffset > nextOffset) {
                    throw new Error("Offsets must be increasing");
                }
                offsets.push([currentOffset, nextOffset]);
                currentIndex = nextIndex;
                currentOffset = nextOffset;
            }
            if (firstOffset !== currentIndex) {
                throw new Error("First offset skips variable data");
            }
            return offsets;
        }
        else {
            return [];
        }
    }
    tree_getLeafGindices(target, root = BigInt(1)) {
        // Underlying elements exist one per chunk
        // Iterate through chunk gindices, recursively fetching leaf gindices from each chunk
        const chunkCount = this.tree_getChunkCount(target);
        const gindices = [];
        const startIndex = persistent_merkle_tree_1.toGindex(this.getChunkDepth(), BigInt(0));
        const extendedStartIndex = persistent_merkle_tree_1.concatGindices([root, startIndex]);
        if (this.elementType.hasVariableSerializedLength()) {
            if (!target) {
                throw new Error("variable type requires tree argument to get leaves");
            }
            // variable-length elements must pass the underlying subtrees to determine the length
            for (let i = 0, gindex = startIndex, extendedGindex = extendedStartIndex; i < chunkCount; i++, gindex++, extendedGindex++) {
                gindices.push(...this.elementType.tree_getLeafGindices(target.getSubtree(gindex), extendedGindex));
            }
        }
        else {
            for (let i = 0, gindex = extendedStartIndex; i < chunkCount; i++, gindex++) {
                gindices.push(...this.elementType.tree_getLeafGindices(undefined, gindex));
            }
        }
        return gindices;
    }
}
exports.CompositeArrayType = CompositeArrayType;
//# sourceMappingURL=array.js.map