pragma circom 2.0.0;

template UnconstrainedOutput() {
    signal input in;
    signal output out;
    in === 1;
    out <-- in;
}

component main = UnconstrainedOutput();
