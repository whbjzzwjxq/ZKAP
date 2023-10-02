import { ContainerType, List, ListType, Vector, VectorType } from "@chainsafe/ssz";
import { ts as phase0 } from "../phase0";
import * as bellatrix from "./types";
/**
 * ByteList[MAX_BYTES_PER_TRANSACTION]
 *
 * Spec v1.0.1
 */
export declare const Transaction: ListType<List<any>>;
export declare const Transactions: ListType<List<Uint8Array>>;
/**
 * ```python
 * class ExecutionPayload(Container):
 *     # Execution block header fields
 *     parent_hash: Hash32
 *     coinbase: Bytes20  # 'beneficiary' in the yellow paper
 *     state_root: Bytes32
 *     receipt_root: Bytes32  # 'receipts root' in the yellow paper
 *     logs_bloom: ByteVector[BYTES_PER_LOGS_BLOOM]
 *     random: Bytes32  # 'difficulty' in the yellow paper
 *     block_number: uint64  # 'number' in the yellow paper
 *     gas_limit: uint64
 *     gas_used: uint64
 *     timestamp: uint64
 *     extra_data: ByteList[MAX_EXTRA_DATA_BYTES]
 *     base_fee_per_gas: Bytes32  # base fee introduced in EIP-1559, little-endian serialized
 *     # Extra payload fields
 *     block_hash: Hash32  # Hash of execution block
 *     transactions: List[Transaction, MAX_TRANSACTIONS_PER_PAYLOAD]
 * ```
 *
 * Spec v1.0.1
 */
export declare const ExecutionPayload: ContainerType<bellatrix.ExecutionPayload>;
/**
 * ```python
 * class ExecutionPayload(Container):
 *     ...
 *     transactions_root: Root
 * ```
 *
 * Spec v1.0.1
 */
export declare const ExecutionPayloadHeader: ContainerType<bellatrix.ExecutionPayloadHeader>;
export declare const BeaconBlockBody: ContainerType<bellatrix.BeaconBlockBody>;
export declare const BeaconBlock: ContainerType<bellatrix.BeaconBlock>;
export declare const SignedBeaconBlock: ContainerType<bellatrix.SignedBeaconBlock>;
export declare const PowBlock: ContainerType<bellatrix.PowBlock>;
export declare const HistoricalBlockRoots: VectorType<Vector<import("@chainsafe/ssz").ByteVector>>;
export declare const HistoricalStateRoots: VectorType<Vector<import("@chainsafe/ssz").ByteVector>>;
export declare const HistoricalBatch: ContainerType<phase0.HistoricalBatch>;
export declare const BeaconState: ContainerType<bellatrix.BeaconState>;
//# sourceMappingURL=sszTypes.d.ts.map