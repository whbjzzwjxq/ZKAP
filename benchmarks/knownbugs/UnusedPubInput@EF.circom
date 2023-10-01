pragma circom 2.0.0;

template UnusedPubInput() {
    signal input inOne;
    signal input inTwo;
    signal input inThr;
    signal output out;
    out <== inOne + inTwo;
}

component main {public [inThr]} = UnusedPubInput();
