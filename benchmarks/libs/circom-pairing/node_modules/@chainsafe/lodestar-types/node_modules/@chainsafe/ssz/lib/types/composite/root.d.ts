import { ByteVectorType } from "./byteVector";
import { CompositeType } from "./abstract";
import { Type } from "../type";
import { ByteVector, CompositeValue } from "../../interface";
import { BackedValue } from "../../backings";
/**
 * Allow for lazily evaulated expandedType thunk
 */
export interface IRootOptions<T extends CompositeValue> {
    expandedType: CompositeType<T> | (() => CompositeType<T>);
}
export declare const ROOT_TYPE: unique symbol;
export declare function isRootType<T extends CompositeValue = CompositeValue>(type: Type<unknown>): type is RootType<T>;
export declare class RootType<T extends CompositeValue> extends ByteVectorType {
    _expandedType: CompositeType<T> | (() => CompositeType<T>);
    constructor(options: IRootOptions<T>);
    get expandedType(): CompositeType<T>;
    struct_equals(value1: ByteVector, value2: ByteVector): boolean;
    equals(value1: BackedValue<ByteVector> | ByteVector, value2: BackedValue<ByteVector> | ByteVector): boolean;
}
//# sourceMappingURL=root.d.ts.map