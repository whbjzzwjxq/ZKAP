pragma circom 2.0.2;

include "../libs/circom-ecdsa/circuits/bigint.circom";

component main {public [a, b]} = BigLessThan(2, 3);
