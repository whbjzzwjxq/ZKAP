import { ByteVector, Json } from "../../interface";
import { BasicVectorType } from "./vector";
import { Type } from "../type";
import { Tree } from "@chainsafe/persistent-merkle-tree";
export interface IByteVectorOptions {
    length: number;
}
export declare const BYTEVECTOR_TYPE: unique symbol;
export declare function isByteVectorType<T extends ByteVector = ByteVector>(type: Type<unknown>): type is ByteVectorType;
export declare class ByteVectorType extends BasicVectorType<ByteVector> {
    constructor(options: IByteVectorOptions);
    struct_defaultValue(): ByteVector;
    struct_deserializeFromBytes(data: Uint8Array, start: number, end: number): ByteVector;
    struct_serializeToBytes(value: ByteVector, output: Uint8Array, offset: number): number;
    struct_convertFromJson(data: Json): ByteVector;
    struct_convertToJson(value: ByteVector): Json;
    tree_convertToStruct(target: Tree): ByteVector;
}
//# sourceMappingURL=byteVector.d.ts.map