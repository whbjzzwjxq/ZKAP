pragma circom 2.0.0;

include "../libs/circomlib/circuits/comparators.circom";

template RangeProof(bits, max) {
    signal input in; 

    component lowerBound = LessThan(bits);
    component upperBound = LessThan(bits);

    lowerBound.in[0] <== max + in; 
    lowerBound.in[1] <== 0;
    lowerBound.out === 0;

    upperBound.in[0] <== 2 * max;
    upperBound.in[1] <== max + in; 
    upperBound.out === 0;
}

component main = RangeProof(2, 65535);
