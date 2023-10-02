import { BitList, Json } from "../../interface";
import { BasicListType } from "./list";
import { Type } from "../type";
import { Tree } from "@chainsafe/persistent-merkle-tree";
export interface IBitListOptions {
    limit: number;
}
export declare const BITLIST_TYPE: unique symbol;
export declare function isBitListType<T extends BitList = BitList>(type: Type<unknown>): type is BitListType;
export declare class BitListType extends BasicListType<BitList> {
    constructor(options: IBitListOptions);
    struct_getByte(value: BitList, index: number): number;
    struct_getLength(value: BitList): number;
    struct_getByteLength(value: BitList): number;
    struct_getSerializedLength(value: BitList): number;
    getMaxSerializedLength(): number;
    getMinSerializedLength(): number;
    struct_getChunkCount(value: BitList): number;
    struct_deserializeFromBytes(data: Uint8Array, start: number, end: number): BitList;
    struct_serializeToBytes(value: BitList, output: Uint8Array, offset: number): number;
    struct_getRootAtChunkIndex(value: BitList, chunkIndex: number): Uint8Array;
    struct_convertFromJson(data: Json): BitList;
    struct_convertToJson(value: BitList): Json;
    tree_getByteLength(target: Tree): number;
    tree_getSerializedLength(target: Tree): number;
    tree_deserializeFromBytes(data: Uint8Array, start: number, end: number): Tree;
    tree_serializeToBytes(target: Tree, output: Uint8Array, offset: number): number;
    getBitOffset(index: number): number;
    getChunkOffset(index: number): number;
    getChunkIndex(index: number): number;
    tree_getChunkCount(target: Tree): number;
    tree_iterateValues(target: Tree): IterableIterator<Tree | unknown>;
    tree_getValues(target: Tree): (Tree | unknown)[];
    tree_getValueAtIndex(target: Tree, index: number): boolean;
    tree_setValueAtIndex(target: Tree, property: number, value: boolean, expand?: boolean): boolean;
    getMaxChunkCount(): number;
}
//# sourceMappingURL=bitList.d.ts.map