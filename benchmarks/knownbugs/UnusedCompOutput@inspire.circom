pragma circom 2.0.0;

template Inc() {
    signal input in;
    signal output out;
    out <== in + 1;
}

template UnusedCompOutput() {
    signal input in1;
    signal input in2;
    signal output out;
    out === in2 * in2;
    component inc = Inc();
    inc.in <== in1;
}

component main = UnusedCompOutput();
