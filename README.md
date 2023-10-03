# ZKAP
A serial of static analysis detectors of ZK bugs.

## Installation From Docker
This docker file is built on Ubuntu 20.04, X86_64 platform.
It requires a free disk of around 100 GB and free memory of around 32 GB.
If your machine doesn't have those resources, you could modify line 23 of the Dockerfile to use only one parallel for LLVM linking.
```bash
docker build -t zkap:latest .
docker run -it zkap
```

## Usage
### To reproduce the evaluation of ZKAP paper:
```bash
python ./eval.py
```
Because of new bugs introduced by LLVM and Circom updates, a few benchmarks (around 10) are broken, we will fix them later.

### To test on your own circuits:
```bash
python ./eval_detect.py --help
python ./eval_detect.py -i ./project -o ./output
```

## Dataset
[Google Sheet](https://docs.google.com/spreadsheets/d/1hiEodPGrp4DlI0ULgmqxRv6j71kdi-fkb8tXaP5B59w/edit?usp=sharing)

## Citation
This paper is accepted by USENIX Security '24
[Pre-print version](https://eprint.iacr.org/2023/190)
TODO
