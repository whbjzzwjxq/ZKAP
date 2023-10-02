import { Json } from "../../interface";
import { Type } from "../type";
import { BasicType } from "./abstract";
export declare const BOOLEAN_TYPE: unique symbol;
export declare function isBooleanType(type: Type<unknown>): type is BooleanType;
export declare class BooleanType extends BasicType<boolean> {
    constructor();
    struct_getSerializedLength(): number;
    struct_assertValidValue(value: unknown): asserts value is boolean;
    struct_defaultValue(): boolean;
    struct_serializeToBytes(value: boolean, output: Uint8Array, offset: number): number;
    struct_deserializeFromBytes(data: Uint8Array, offset: number): boolean;
    struct_convertFromJson(data: Json): boolean;
    struct_convertToJson(value: boolean): Json;
}
//# sourceMappingURL=boolean.d.ts.map