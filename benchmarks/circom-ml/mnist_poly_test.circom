pragma circom 2.0.3;

include "../libs/circomlib-ml/circuits/Conv2D.circom";
include "../libs/circomlib-ml/circuits/Dense.circom";
include "../libs/circomlib-ml/circuits/ArgMax.circom";
include "../libs/circomlib-ml/circuits/Poly.circom";

template mnist_poly() {
    var a = 8;
    var b = 6;
    var b2 = b * b;
    var c = 2;
    signal input in[a][a][1];
    signal input conv2d_weights[3][3][1][1];
    signal input conv2d_bias[1];
    signal input dense_weights[b2][c];
    signal input dense_bias[c];
    signal output out;

    component conv2d = Conv2D(a,a,1,1,3,1);
    component poly[b2];
    component dense = Dense(b2,c);
    component argmax = ArgMax(c);

    for (var i=0; i<a; i++) {
        for (var j=0; j<a; j++) {
            conv2d.in[i][j][0] <== in[i][j][0];
        }
    }

    for (var i=0; i<3; i++) {
        for (var j=0; j<3; j++) {
            conv2d.weights[i][j][0][0] <== conv2d_weights[i][j][0][0];
        }
    }

    conv2d.bias[0] <== conv2d_bias[0];

    var idx = 0;

    for (var i=0; i<b; i++) {
        for (var j=0; j<b; j++) {
            poly[idx] = Poly(c**2);
            poly[idx].in <== conv2d.out[i][j][0];
            dense.in[idx] <== poly[idx].out;
            for (var k=0; k<c; k++) {
                dense.weights[idx][k] <== dense_weights[idx][k];
            }
            idx++;
        }
    }

    for (var i=0; i<c; i++) {
        dense.bias[i] <== dense_bias[i];
    }

    for (var i=0; i<c; i++) {
        log(dense.out[i]);
        argmax.in[i] <== dense.out[i];
    }

    out <== argmax.out;
}

component main = mnist_poly();