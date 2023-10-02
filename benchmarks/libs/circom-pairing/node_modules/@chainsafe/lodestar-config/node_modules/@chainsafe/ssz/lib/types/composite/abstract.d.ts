import { CompositeValue, Json } from "../../interface";
import { BackedValue, Path, TreeBacked } from "../../backings";
import { IJsonOptions, Type } from "../type";
import { Gindex, GindexBitstring, Node, Proof, Tree } from "@chainsafe/persistent-merkle-tree";
export declare const COMPOSITE_TYPE: unique symbol;
export declare function isCompositeType(type: Type<unknown>): type is CompositeType<CompositeValue>;
/**
 * A CompositeType is a type containing other types, and is flexible in its representation.
 *
 */
export declare abstract class CompositeType<T extends CompositeValue> extends Type<T> {
    _chunkDepth?: number;
    _defaultNode?: Node;
    constructor();
    abstract struct_assertValidValue(value: unknown): asserts value is T;
    abstract struct_equals(struct1: T, struct2: T): boolean;
    tree_equals(tree1: Tree, tree2: Tree): boolean;
    bytes_equals(bytes1: Uint8Array, bytes2: Uint8Array): boolean;
    abstract struct_defaultValue(): T;
    abstract tree_defaultNode(): Node;
    tree_defaultValue(): Tree;
    abstract struct_clone(value: T): T;
    tree_clone(value: Tree): Tree;
    bytes_clone(value: Uint8Array, start?: number, end?: number): Uint8Array;
    abstract struct_convertToJson(struct: T, options?: IJsonOptions): Json;
    abstract struct_convertFromJson(json: Json, options?: IJsonOptions): T;
    abstract struct_convertToTree(struct: T): Tree;
    abstract tree_convertToStruct(tree: Tree): T;
    abstract struct_serializeToBytes(struct: T, output: Uint8Array, offset: number): number;
    abstract tree_serializeToBytes(tree: Tree, output: Uint8Array, offset: number): number;
    struct_serialize(struct: T, data: Uint8Array): number;
    tree_serialize(tree: Tree, data: Uint8Array): number;
    bytes_validate(data: Uint8Array, start: number, end: number, emptyOk?: boolean): void;
    abstract struct_deserializeFromBytes(data: Uint8Array, start: number, end: number): T;
    abstract tree_deserializeFromBytes(data: Uint8Array, start: number, end: number): Tree;
    struct_deserialize(data: Uint8Array): T;
    tree_deserialize(data: Uint8Array): Tree;
    abstract getMinSerializedLength(): number;
    abstract getMaxSerializedLength(): number;
    abstract struct_getSerializedLength(struct: T): number;
    abstract tree_getSerializedLength(tree: Tree): number;
    abstract hasVariableSerializedLength(): boolean;
    abstract bytes_getVariableOffsets(target: Uint8Array): [number, number][];
    abstract getMaxChunkCount(): number;
    struct_getChunkCount(struct: T): number;
    tree_getChunkCount(target: Tree): number;
    abstract struct_getRootAtChunkIndex(struct: T, chunkIx: number): Uint8Array;
    struct_yieldChunkRoots(struct: T): Iterable<Uint8Array>;
    getChunkDepth(): number;
    getGindexAtChunkIndex(index: number): Gindex;
    getGindexBitStringAtChunkIndex(index: number): GindexBitstring;
    tree_getSubtreeAtChunkIndex(target: Tree, index: number): Tree;
    tree_setSubtreeAtChunkIndex(target: Tree, index: number, value: Tree, expand?: boolean): void;
    tree_getRootAtChunkIndex(target: Tree, index: number): Uint8Array;
    tree_setRootAtChunkIndex(target: Tree, index: number, value: Uint8Array, expand?: boolean): void;
    abstract struct_getPropertyNames(struct: T): (string | number)[];
    abstract tree_getPropertyNames(tree: Tree): (string | number)[];
    abstract getPropertyGindex(property: PropertyKey): Gindex;
    abstract getPropertyType(property: PropertyKey): Type<unknown> | undefined;
    abstract tree_getProperty(tree: Tree, property: PropertyKey): Tree | unknown;
    abstract tree_setProperty(tree: Tree, property: PropertyKey, value: Tree | unknown): boolean;
    abstract tree_deleteProperty(tree: Tree, property: PropertyKey): boolean;
    abstract tree_iterateValues(tree: Tree): IterableIterator<Tree | unknown>;
    abstract tree_readonlyIterateValues(tree: Tree): IterableIterator<Tree | unknown>;
    abstract tree_getValues(tree: Tree): (Tree | unknown)[];
    abstract tree_readonlyGetValues(tree: Tree): (Tree | unknown)[];
    /**
     * Navigate to a subtype & gindex using a path
     */
    getPathInfo(path: Path): {
        gindex: Gindex;
        type: Type<unknown>;
    };
    getPathGindex(path: Path): Gindex;
    /**
     * Get leaf gindices
     *
     * Note: This is a recursively called method.
     * Subtypes recursively call this method until basic types / leaf data is hit.
     *
     * @param target Used for variable-length types.
     * @param root Used to anchor the returned gindices to a non-root gindex.
     * This is used to augment leaf gindices in recursively-called subtypes relative to the type.
     * @returns The gindices corresponding to leaf data.
     */
    abstract tree_getLeafGindices(target?: Tree, root?: Gindex): Gindex[];
    tree_createProof(target: Tree, paths: Path[]): Proof;
    tree_createFromProof(root: Uint8Array, proof: Proof): Tree;
    tree_createFromProofUnsafe(proof: Proof): Tree;
    struct_hashTreeRoot(struct: T): Uint8Array;
    tree_hashTreeRoot(tree: Tree): Uint8Array;
    /**
     * Valid value assertion
     */
    assertValidValue(value: unknown): asserts value is T;
    /**
     * Equality
     */
    equals(value1: BackedValue<T> | T, value2: BackedValue<T> | T): boolean;
    /**
     * Default constructor
     */
    defaultValue(): T;
    /**
     * Clone / copy
     */
    clone(value: T): T;
    /**
     * Serialized byte length
     */
    size(value: T): number;
    /**
     * Maximal serialized byte length
     */
    maxSize(): number;
    /**
     * Minimal serialized byte length
     */
    minSize(): number;
    /**
     * Low-level deserialization
     */
    fromBytes(data: Uint8Array, start: number, end: number): T;
    /**
     * Deserialization
     */
    deserialize(data: Uint8Array): T;
    /**
     * Low-level serialization
     *
     * Serializes to a pre-allocated Uint8Array
     */
    toBytes(value: T, output: Uint8Array, offset: number): number;
    /**
     * Serialization
     */
    serialize(value: T): Uint8Array;
    /**
     * Merkleization
     */
    hashTreeRoot(value: T): Uint8Array;
    /**
     * Convert from a JSON-serializable object
     */
    fromJson(data: Json, options?: IJsonOptions): T;
    /**
     * Convert to a JSON-serializable object
     */
    toJson(value: T, options?: IJsonOptions): Json;
    createTreeBacked(tree: Tree): TreeBacked<T>;
    createTreeBackedFromStruct(value: T): TreeBacked<T>;
    createTreeBackedFromBytes(data: Uint8Array): TreeBacked<T>;
    createTreeBackedFromJson(data: Json, options?: IJsonOptions): TreeBacked<T>;
    createTreeBackedFromProof(root: Uint8Array, proof: Proof): TreeBacked<T>;
    createTreeBackedFromProofUnsafe(proof: Proof): TreeBacked<T>;
    defaultTreeBacked(): TreeBacked<T>;
}
//# sourceMappingURL=abstract.d.ts.map