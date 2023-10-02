import { BitList, List, Vector, BitVector } from "@chainsafe/ssz";
import { BLSPubkey, BLSSignature, Epoch, Root, Number64, Slot, ValidatorIndex, Version, CommitteeIndex, Bytes32, Domain, ForkDigest, Gwei, Uint64 } from "../primitive/types";
export declare type AttestationSubnets = BitVector;
export interface BeaconBlockHeader {
    slot: Slot;
    proposerIndex: ValidatorIndex;
    parentRoot: Root;
    stateRoot: Root;
    bodyRoot: Root;
}
export interface SignedBeaconBlockHeader {
    message: BeaconBlockHeader;
    signature: BLSSignature;
}
export interface Checkpoint {
    epoch: Epoch;
    root: Root;
}
export interface DepositMessage {
    pubkey: BLSPubkey;
    withdrawalCredentials: Bytes32;
    amount: Number64;
}
export interface DepositData {
    pubkey: BLSPubkey;
    withdrawalCredentials: Bytes32;
    amount: Number64;
    signature: BLSSignature;
}
export interface DepositEvent {
    depositData: DepositData;
    blockNumber: Number64;
    index: Number64;
}
export interface Eth1Data {
    depositRoot: Root;
    depositCount: Number64;
    blockHash: Bytes32;
}
export interface Eth1DataOrdered {
    blockNumber: Number64;
    depositRoot: Root;
    depositCount: Number64;
    blockHash: Bytes32;
}
export interface Fork {
    previousVersion: Version;
    currentVersion: Version;
    epoch: Epoch;
}
export interface ForkData {
    currentVersion: Version;
    genesisValidatorsRoot: Root;
}
export interface ENRForkID {
    forkDigest: ForkDigest;
    nextForkVersion: Version;
    nextForkEpoch: Epoch;
}
export interface HistoricalBatch {
    blockRoots: Vector<Root>;
    stateRoots: Vector<Root>;
}
export interface Validator {
    pubkey: BLSPubkey;
    withdrawalCredentials: Bytes32;
    effectiveBalance: Number64;
    slashed: boolean;
    activationEligibilityEpoch: Epoch;
    activationEpoch: Epoch;
    exitEpoch: Epoch;
    withdrawableEpoch: Epoch;
}
export interface AttestationData {
    slot: Slot;
    index: CommitteeIndex;
    beaconBlockRoot: Root;
    source: Checkpoint;
    target: Checkpoint;
}
export interface IndexedAttestation {
    attestingIndices: List<ValidatorIndex>;
    data: AttestationData;
    signature: BLSSignature;
}
export interface PendingAttestation {
    aggregationBits: BitList;
    data: AttestationData;
    inclusionDelay: Slot;
    proposerIndex: ValidatorIndex;
}
export interface SigningData {
    objectRoot: Root;
    domain: Domain;
}
export interface Eth1Block {
    blockHash: Bytes32;
    blockNumber: Number64;
    timestamp: Number64;
}
export interface Attestation {
    aggregationBits: BitList;
    data: AttestationData;
    signature: BLSSignature;
}
export interface AttesterSlashing {
    attestation1: IndexedAttestation;
    attestation2: IndexedAttestation;
}
export interface Deposit {
    proof: Vector<Bytes32>;
    data: DepositData;
}
export interface ProposerSlashing {
    signedHeader1: SignedBeaconBlockHeader;
    signedHeader2: SignedBeaconBlockHeader;
}
export interface VoluntaryExit {
    epoch: Epoch;
    validatorIndex: ValidatorIndex;
}
export interface SignedVoluntaryExit {
    message: VoluntaryExit;
    signature: BLSSignature;
}
export interface BeaconBlockBody {
    randaoReveal: BLSSignature;
    eth1Data: Eth1Data;
    graffiti: Bytes32;
    proposerSlashings: List<ProposerSlashing>;
    attesterSlashings: List<AttesterSlashing>;
    attestations: List<Attestation>;
    deposits: List<Deposit>;
    voluntaryExits: List<SignedVoluntaryExit>;
}
export interface BeaconBlock {
    slot: Slot;
    proposerIndex: ValidatorIndex;
    parentRoot: Root;
    stateRoot: Root;
    body: BeaconBlockBody;
}
export interface SignedBeaconBlock {
    message: BeaconBlock;
    signature: BLSSignature;
}
export interface BeaconState {
    genesisTime: Number64;
    genesisValidatorsRoot: Root;
    slot: Slot;
    fork: Fork;
    latestBlockHeader: BeaconBlockHeader;
    blockRoots: Vector<Root>;
    stateRoots: Vector<Root>;
    historicalRoots: List<Root>;
    eth1Data: Eth1Data;
    eth1DataVotes: List<Eth1Data>;
    eth1DepositIndex: Number64;
    validators: List<Validator>;
    balances: List<Number64>;
    randaoMixes: Vector<Bytes32>;
    slashings: Vector<Gwei>;
    previousEpochAttestations: List<PendingAttestation>;
    currentEpochAttestations: List<PendingAttestation>;
    justificationBits: BitVector;
    previousJustifiedCheckpoint: Checkpoint;
    currentJustifiedCheckpoint: Checkpoint;
    finalizedCheckpoint: Checkpoint;
}
export interface CommitteeAssignment {
    validators: List<ValidatorIndex>;
    committeeIndex: CommitteeIndex;
    slot: Slot;
}
export interface AggregateAndProof {
    aggregatorIndex: ValidatorIndex;
    aggregate: Attestation;
    selectionProof: BLSSignature;
}
export interface SignedAggregateAndProof {
    message: AggregateAndProof;
    signature: BLSSignature;
}
export interface Status {
    forkDigest: ForkDigest;
    finalizedRoot: Root;
    finalizedEpoch: Epoch;
    headRoot: Root;
    headSlot: Slot;
}
export declare type Goodbye = Uint64;
export declare type Ping = Uint64;
export interface Metadata {
    seqNumber: Uint64;
    attnets: AttestationSubnets;
}
export interface BeaconBlocksByRangeRequest {
    startSlot: Slot;
    count: Number64;
    step: Number64;
}
export declare type BeaconBlocksByRootRequest = List<Root>;
export interface Genesis {
    genesisTime: Uint64;
    genesisValidatorsRoot: Root;
    genesisForkVersion: Version;
}
//# sourceMappingURL=types.d.ts.map