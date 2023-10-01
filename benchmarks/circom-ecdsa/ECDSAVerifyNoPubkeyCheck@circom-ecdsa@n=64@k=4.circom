pragma circom 2.0.0;
 
include "../libs/circom-ecdsa/circuits/ecdsa.circom";

component main = ECDSAVerifyNoPubkeyCheck(64, 4);
