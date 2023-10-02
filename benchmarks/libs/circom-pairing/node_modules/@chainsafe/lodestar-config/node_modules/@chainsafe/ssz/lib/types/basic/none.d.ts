import { Json } from "../../interface";
import { IJsonOptions, Type } from "../type";
import { BasicType } from "./abstract";
export declare const NONE_TYPE: unique symbol;
export declare function isNoneType(type: Type<unknown>): type is NoneType;
export declare class NoneType extends BasicType<null> {
    constructor();
    struct_deserializeFromBytes(data: Uint8Array, offset: number): null;
    struct_assertValidValue(value: unknown): asserts value is null;
    struct_defaultValue(): null;
    struct_getSerializedLength(value?: null): number;
    struct_serializeToBytes(value: null, output: Uint8Array, offset: number): number;
    struct_convertFromJson(data: Json): null;
    struct_convertToJson(value: null, options?: IJsonOptions): Json;
}
//# sourceMappingURL=none.d.ts.map