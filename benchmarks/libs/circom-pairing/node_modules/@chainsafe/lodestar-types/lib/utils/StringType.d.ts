import { BasicType } from "@chainsafe/ssz";
export declare class StringType<T extends string = string> extends BasicType<T> {
    struct_getSerializedLength(data?: string): number;
    struct_convertToJson(value: T): string;
    struct_convertFromJson(data: string): T;
    struct_assertValidValue(data: unknown): data is T;
    serialize(): Uint8Array;
    struct_serializeToBytes(): number;
    struct_deserializeFromBytes(): T;
    struct_defaultValue(): T;
}
//# sourceMappingURL=StringType.d.ts.map