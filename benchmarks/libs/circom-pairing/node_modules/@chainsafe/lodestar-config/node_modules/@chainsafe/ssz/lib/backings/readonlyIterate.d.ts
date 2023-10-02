import { CompositeValue } from "../interface";
import { ValueOf } from "./tree";
export declare function readonlyValues<T extends CompositeValue>(obj: T): Iterable<ValueOf<T>>;
export declare function readonlyEntries<T extends CompositeValue>(obj: T): Iterable<[keyof T, ValueOf<T>]>;
//# sourceMappingURL=readonlyIterate.d.ts.map