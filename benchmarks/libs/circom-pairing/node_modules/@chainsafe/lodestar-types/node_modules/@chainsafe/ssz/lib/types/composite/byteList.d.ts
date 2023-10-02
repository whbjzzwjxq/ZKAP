import { ByteList, Json } from "../../interface";
import { BasicListType } from "./list";
import { Type } from "../type";
import { Tree } from "@chainsafe/persistent-merkle-tree";
export interface IByteListOptions {
    limit: number;
}
export declare const BYTELIST_TYPE: unique symbol;
export declare function isByteListType<T extends ByteList = ByteList>(type: Type<unknown>): type is ByteListType;
export declare class ByteListType extends BasicListType<ByteList> {
    constructor(options: IByteListOptions);
    struct_deserializeFromBytes(data: Uint8Array, start: number, end: number): ByteList;
    struct_serializeToBytes(value: ByteList, output: Uint8Array, offset: number): number;
    struct_convertFromJson(data: Json): ByteList;
    struct_convertToJson(value: ByteList): Json;
    tree_convertToStruct(target: Tree): ByteList;
}
//# sourceMappingURL=byteList.d.ts.map