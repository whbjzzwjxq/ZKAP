import * as altair from "../altair/types";
import { Root, Bytes32, Number64, ExecutionAddress, Uint256 } from "../primitive/types";
export declare type Transaction = Uint8Array;
declare type ExecutionPayloadFields = {
    parentHash: Root;
    feeRecipient: ExecutionAddress;
    stateRoot: Bytes32;
    receiptsRoot: Bytes32;
    logsBloom: Uint8Array;
    random: Bytes32;
    blockNumber: number;
    gasLimit: Number64;
    gasUsed: Number64;
    timestamp: Number64;
    extraData: Uint8Array;
    baseFeePerGas: Uint256;
    blockHash: Bytes32;
};
export declare type ExecutionPayload = ExecutionPayloadFields & {
    transactions: Transaction[];
};
export declare type ExecutionPayloadHeader = ExecutionPayloadFields & {
    transactionsRoot: Root;
};
export interface BeaconBlockBody extends altair.BeaconBlockBody {
    executionPayload: ExecutionPayload;
}
export interface BeaconBlock extends altair.BeaconBlock {
    body: BeaconBlockBody;
}
export interface SignedBeaconBlock extends altair.SignedBeaconBlock {
    message: BeaconBlock;
}
export interface BeaconState extends altair.BeaconState {
    latestExecutionPayloadHeader: ExecutionPayloadHeader;
}
export declare type PowBlock = {
    blockHash: Root;
    parentHash: Root;
    totalDifficulty: bigint;
};
export {};
//# sourceMappingURL=types.d.ts.map