/** @module ssz */
import { HashObject } from "@chainsafe/as-sha256";
/**
 * Hash used for hashTreeRoot
 */
export declare function hash(...inputs: Uint8Array[]): Uint8Array;
/**
 * Clone a hash object using sharedHashObject, after doing this we usually
 * apply HashObject to the Tree which make a copy there so it's safe to mutate
 * this HashObject after that.
 **/
export declare function cloneHashObject(hashObject: HashObject): HashObject;
/**
 * Reset and return sharedHashObject, after doing this we usually
 * apply HashObject to the Tree which make a copy there so it's safe to mutate
 * this HashObject after that.
 **/
export declare function newHashObject(): HashObject;
//# sourceMappingURL=hash.d.ts.map