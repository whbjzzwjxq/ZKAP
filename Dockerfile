ARG UBUNTU_NAME=jammy
ARG UBUNTU_VERSION=22.04
FROM ubuntu:$UBUNTU_VERSION as dev
# See the documentation for supported versions.
# https://docs.docker.com/engine/reference/builder/#understand-how-arg-and-from-interact
ENV DEBIAN_FRONTEND=noninteractive

RUN mkdir /zkap
WORKDIR /zkap

# Install basic packages
RUN apt-get update && \
    apt-get --yes install --no-install-recommends \
    # General-needed
    build-essential cmake g++ gcc git gnupg gzip make ninja-build python-is-python3 python3 python3-pip ssh uuid-dev vim wget

# Install LLVM
RUN git clone --depth 1 --branch release/13.x https://github.com/llvm/llvm-project.git
WORKDIR /zkap/llvm-project
RUN cmake -S llvm -B build -G Ninja \
-DLLVM_TARGETS_TO_BUILD="X86" \
# If you have the out-of-memory problem (<16Gb Memory), add this option.
# -DLLVM_PARALLEL_LINK_JOBS=1 \
-DCMAKE_BUILD_TYPE=DEBUG
RUN cmake --build build/
ENV LLVM_PATH=/zkap/llvm-project/build
ENV PATH=${PATH}:${LLVM_PATH}/bin

# Install Detectors
COPY ./detectors /zkap/detectors
RUN ln -s /zkap/detectors llvm/lib/Transforms/detectors
RUN echo "add_subdirectory(detectors)" >> llvm/lib/Transforms/CMakeLists.txt
RUN cmake --build build/

# Install Rust & Circom2llvm
WORKDIR /zkap
RUN apt-get update && \
    apt-get --yes install --no-install-recommends \
    # Required by rust
    curl libffi-dev
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- --default-toolchain 1.71.1 -y
ENV CARGO_PATH=/root/.cargo/bin
ENV PATH=${PATH}:${CARGO_PATH}
COPY ./circom2llvm /zkap/circom2llvm
RUN cargo install --path ./circom2llvm/circom2llvm/
RUN cargo install circomspect --version=0.7.2

# Install python requirements

# Copy files
COPY ./benchmarks /zkap/benchmarks
COPY ./benchmark_names.txt /zkap/benchmark_names.txt

