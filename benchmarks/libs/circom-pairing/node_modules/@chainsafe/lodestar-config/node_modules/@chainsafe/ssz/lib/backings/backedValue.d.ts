import { CompositeValue } from "../interface";
import { ITreeBacked } from "./tree";
export declare type Path = (string | number)[];
/**
 * A BackedValue is a value that is backed by a non-structural type
 *
 * It is implemented as an ES6 Proxy object that provides
 * - convenient access to the structural properties corresponding to its type
 * - additional methods for backing-specific implementations of ssz operations
 */
export declare type BackedValue<T extends CompositeValue> = ITreeBacked<T> & T;
export declare function isBackedValue<T extends CompositeValue>(value: unknown): value is BackedValue<T>;
//# sourceMappingURL=backedValue.d.ts.map