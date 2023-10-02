"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionAddress = exports.ParticipationFlags = exports.Domain = exports.BLSSignature = exports.BLSPubkey = exports.ForkDigest = exports.DomainType = exports.Version = exports.Root = exports.Gwei = exports.ValidatorIndex = exports.SubCommitteeIndex = exports.CommitteeIndex = exports.Epoch = exports.Slot = exports.Uint256 = exports.Uint128 = exports.Uint64 = exports.Number64 = exports.Uint32 = exports.Uint16 = exports.Uint8 = exports.Bytes96 = exports.Bytes48 = exports.Bytes32 = exports.Bytes20 = exports.Bytes8 = exports.Bytes4 = exports.Boolean = void 0;
const ssz_1 = require("@chainsafe/ssz");
exports.Boolean = ssz_1.booleanType;
exports.Bytes4 = new ssz_1.ByteVectorType({ length: 4 });
exports.Bytes8 = new ssz_1.ByteVectorType({ length: 8 });
exports.Bytes20 = new ssz_1.ByteVectorType({ length: 20 });
exports.Bytes32 = new ssz_1.ByteVectorType({ length: 32 });
exports.Bytes48 = new ssz_1.ByteVectorType({ length: 48 });
exports.Bytes96 = new ssz_1.ByteVectorType({ length: 96 });
exports.Uint8 = ssz_1.byteType;
exports.Uint16 = new ssz_1.NumberUintType({ byteLength: 2 });
exports.Uint32 = ssz_1.number32Type;
exports.Number64 = new ssz_1.Number64UintType();
exports.Uint64 = new ssz_1.BigIntUintType({ byteLength: 8 });
exports.Uint128 = new ssz_1.BigIntUintType({ byteLength: 16 });
exports.Uint256 = new ssz_1.BigIntUintType({ byteLength: 32 });
// Custom types, defined for type hinting and readability
exports.Slot = exports.Number64;
exports.Epoch = exports.Number64;
exports.CommitteeIndex = exports.Number64;
exports.SubCommitteeIndex = exports.Number64;
exports.ValidatorIndex = exports.Number64;
exports.Gwei = exports.Uint64;
exports.Root = new ssz_1.RootType({
    expandedType: () => {
        throw new Error("Generic Root type has no expanded type");
    },
});
exports.Version = exports.Bytes4;
exports.DomainType = exports.Bytes4;
exports.ForkDigest = exports.Bytes4;
exports.BLSPubkey = exports.Bytes48;
exports.BLSSignature = exports.Bytes96;
exports.Domain = exports.Bytes32;
exports.ParticipationFlags = exports.Uint8;
exports.ExecutionAddress = exports.Bytes20;
//# sourceMappingURL=sszTypes.js.map