pragma circom 2.0.0;

include "../libs/circom-pairing/circuits/bigint.circom";

component main = LongToShortNoEndCarry(32, 3);
