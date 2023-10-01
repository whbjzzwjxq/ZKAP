pragma circom 2.0.0;

template DivZero() {
    signal input a;
    signal input b;
    signal output out;
    out <-- a / b;
    b * out === a;
}

component main = DivZero();
