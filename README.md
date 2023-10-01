# ZKAP
A serial of static analysis detectors of ZK bugs.

## Installation

### LLVM Installation
**NOTICE** Use `Ninja` as the build tool default, so you need to install one before building LLVM.
If you don't have, please follow the offcial guide from LLVM at: https://github.com/llvm/llvm-project/tree/release/13.x .

**NOTICE** The building command used by us is different from the standard one.

**NOTICE** The path/to/llvm-project should be an abstract path, such as /User/You/app/llvm-project.

**NOTICE** DLLVM_TARGETS_TO_BUILD depends on your architecture.

```bash
git clone --depth 1 --branch release/13.x git@github.com:llvm/llvm-project.git
cd ./llvm-project
cmake -S llvm -B build -G Ninja \
-DLLVM_TARGETS_TO_BUILD="{X86||ARM||RISCV}" \
-DCMAKE_BUILD_TYPE=Release \
-DLLVM_PARALLEL_LINK_JOBS=1 \
-DLLVM_OPTIMIZED_TABLEGEN=ON \
-DCMAKE_EXPORT_COMPILE_COMMANDS=ON
cmake --build build/
export LLVM_PATH=path/to/llvm-project/build
export PATH=$PATH:$LLVM_PATH/bin
```

### Build
**NOTICE** Make sure LLVM is installed.

```bash
cd $LLVM_PATH
ln -s path/to/ZKSolid/detectors ./llvm/lib/Transforms/Detectors
echo "add_subdirectory(Detectors)" >> ./llvm/lib/Transforms/CMakeLists.txt
cmake --build build/
```

## Usage
Linux: .so || Mac: .dylib
```bash
opt -f -load -enable-new-pm=0 $LLVM_PATH/build/lib/Detectors{.so||.dylib} --UnderConstraints input.ssa.ll 1> /dev/null 2> output.uc.log
opt -f -load -enable-new-pm=0 $LLVM_PATH/build/lib/Detectors{.so||.dylib} --OutputSignalUser input.ssa.ll 1> /dev/null 2> output.osu.log
```

Or use the script:

```bash
python ./detect.py --help
python ./detect.py -uc --input ./auditing
python ./detect.py -osu --input ./auditing
```

## Debug
LLVM Pass is hard to debug because it is a dynamic lib. Thus, you could use them to print information runtimely:
```c++
std::string foo = "";
std::cerr << foo;

llvm::Value v;
v.print(errs());
```
