import { BitVector, Json } from "../../interface";
import { BasicVectorType } from "./vector";
import { Type } from "../type";
import { Tree } from "@chainsafe/persistent-merkle-tree";
export interface IBitVectorOptions {
    length: number;
}
export declare const BITVECTOR_TYPE: unique symbol;
export declare function isBitVectorType<T extends BitVector = BitVector>(type: Type<unknown>): type is BitVectorType;
export declare class BitVectorType extends BasicVectorType<BitVector> {
    constructor(options: IBitVectorOptions);
    struct_getLength(value: BitVector): number;
    struct_getByteLength(value: BitVector): number;
    struct_getSerializedLength(value: BitVector): number;
    getFixedSerializedLength(): null | number;
    getMaxSerializedLength(): number;
    getMinSerializedLength(): number;
    struct_getChunkCount(value: BitVector): number;
    struct_getByte(value: BitVector, index: number): number;
    struct_deserializeFromBytes(data: Uint8Array, start: number, end: number): BitVector;
    struct_serializeToBytes(value: BitVector, output: Uint8Array, offset: number): number;
    struct_getRootAtChunkIndex(value: BitVector, chunkIndex: number): Uint8Array;
    struct_convertFromJson(data: Json): BitVector;
    struct_convertToJson(value: BitVector): Json;
    tree_getByteLength(target: Tree): number;
    tree_getSerializedLength(target: Tree): number;
    tree_deserializeFromBytes(data: Uint8Array, start: number, end: number): Tree;
    getBitOffset(index: number): number;
    getChunkOffset(index: number): number;
    getChunkIndex(index: number): number;
    tree_getChunkCount(target: Tree): number;
    tree_iterateValues(target: Tree): IterableIterator<Tree | unknown>;
    tree_getValues(target: Tree): (Tree | unknown)[];
    tree_getValueAtIndex(target: Tree, index: number): boolean;
    tree_setProperty(target: Tree, property: number, value: boolean): boolean;
    getMaxChunkCount(): number;
}
//# sourceMappingURL=bitVector.d.ts.map