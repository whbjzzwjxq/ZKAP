pragma circom 2.0.8;

include "../circomlib/circuits/mimc.circom";
include "../circomlib/circuits/escalarmulany.circom";


template Decrypt(N) {
  // Where N is the length of the
  // decrypted message
  signal input message[N+1];
  signal input private_key;
  signal output out[N];

  component hasher[N];

  // iv is message[0]
  for(var i=0; i<N; i++) {
    hasher[i] = MiMC7(91);
    hasher[i].xin <== private_key;
    hasher[i].k <== message[0] + i;
    out[i] <== message[i+1] - hasher[i].out;
  }
}
