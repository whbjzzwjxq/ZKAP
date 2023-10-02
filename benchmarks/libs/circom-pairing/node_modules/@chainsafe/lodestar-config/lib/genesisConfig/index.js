"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createICachedGenesis = void 0;
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const ssz_1 = require("@chainsafe/ssz");
function createICachedGenesis(chainForkConfig, genesisValidatorsRoot) {
    const domainCache = new Map();
    const forkDigestByForkName = new Map();
    const forkDigestHexByForkName = new Map();
    /** Map of ForkDigest in hex format without prefix: `0011aabb` */
    const forkNameByForkDigest = new Map();
    for (const fork of Object.values(chainForkConfig.forks)) {
        const forkDigest = computeForkDigest(fork.version, genesisValidatorsRoot);
        const forkDigestHex = toHexStringNoPrefix(forkDigest);
        forkNameByForkDigest.set(forkDigestHex, fork.name);
        forkDigestByForkName.set(fork.name, forkDigest);
        forkDigestHexByForkName.set(fork.name, forkDigestHex);
    }
    return {
        getDomain(domainType, slot) {
            const forkInfo = chainForkConfig.getForkInfo(slot);
            let domainByType = domainCache.get(forkInfo.name);
            if (!domainByType) {
                domainByType = new Map();
                domainCache.set(forkInfo.name, domainByType);
            }
            let domain = domainByType.get(domainType);
            if (!domain) {
                domain = computeDomain(domainType, forkInfo.version, genesisValidatorsRoot);
                domainByType.set(domainType, domain);
            }
            return domain;
        },
        forkDigest2ForkName(forkDigest) {
            const forkDigestHex = toHexStringNoPrefix(forkDigest);
            const forkName = forkNameByForkDigest.get(forkDigestHex);
            if (!forkName) {
                throw Error(`Unknwon forkDigest ${forkDigestHex}`);
            }
            return forkName;
        },
        forkDigest2ForkNameOption(forkDigest) {
            const forkDigestHex = toHexStringNoPrefix(forkDigest);
            const forkName = forkNameByForkDigest.get(forkDigestHex);
            if (!forkName) {
                return null;
            }
            return forkName;
        },
        forkName2ForkDigest(forkName) {
            const forkDigest = forkDigestByForkName.get(forkName);
            if (!forkDigest) {
                throw Error(`No precomputed forkDigest for ${forkName}`);
            }
            return forkDigest;
        },
        forkName2ForkDigestHex(forkName) {
            const forkDigestHex = forkDigestHexByForkName.get(forkName);
            if (!forkDigestHex) {
                throw Error(`No precomputed forkDigest for ${forkName}`);
            }
            return toHexStringNoPrefix(forkDigestHex);
        },
    };
}
exports.createICachedGenesis = createICachedGenesis;
function computeDomain(domainType, forkVersion, genesisValidatorRoot) {
    const forkDataRoot = computeForkDataRoot(forkVersion, genesisValidatorRoot);
    const domain = new Uint8Array(32);
    domain.set(domainType, 0);
    domain.set(forkDataRoot.slice(0, 28), 4);
    return domain;
}
function computeForkDataRoot(currentVersion, genesisValidatorsRoot) {
    const forkData = {
        currentVersion,
        genesisValidatorsRoot,
    };
    return lodestar_types_1.ssz.phase0.ForkData.hashTreeRoot(forkData);
}
function toHexStringNoPrefix(hex) {
    return strip0xPrefix(typeof hex === "string" ? hex : (0, ssz_1.toHexString)(hex));
}
function strip0xPrefix(hex) {
    return hex.startsWith("0x") ? hex.slice(2) : hex;
}
function computeForkDigest(currentVersion, genesisValidatorsRoot) {
    return computeForkDataRoot(currentVersion, genesisValidatorsRoot).slice(0, 4);
}
//# sourceMappingURL=index.js.map