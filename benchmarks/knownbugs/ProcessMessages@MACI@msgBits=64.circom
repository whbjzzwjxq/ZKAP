// Github https://github.com/privacy-scaling-explorations/maci
// Commit f05233eaa12a0c3c3cfe7ae0410cc38eb549b5bb
// Fix 545d9ff6483dbfe24ba3c10db1f0cdcc8c6de007
pragma circom 2.0.0;

include "../libs/circomlib/circuits/bitify.circom";

template ProcessMessages(msgBits) {
    signal input msg;
    signal input secretKey;
    signal output msgHash;

    component msgChecker = Num2Bits(msgBits);
    msgChecker.in <== msg;

    component hash = HashMsg(msgBits);
    hash.in <-- msg;
    hash.secretKey <== secretKey;
    msgHash <== hash.out;
}

template HashMsg(msgBits) {
    signal input in;
    signal input secretKey;
    signal output out;

    out <== in * 9223372036854775783 + secretKey;
}

component main = ProcessMessages(64);
