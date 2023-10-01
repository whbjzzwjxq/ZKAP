pragma circom 2.0.0;

template SingleAssignment1() {
    signal input a;
    signal input b;
    signal output out;
    out <-- a - b;
    a + b === out;
}

component main = SingleAssignment1();
