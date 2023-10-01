add_llvm_library(Detectors MODULE

    All.cpp
    MissingAssumptionCheck.cpp
    NonuniformConstraint.cpp
    UnconstrainedOutput.cpp
    UnconstrainedCompInput.cpp
    UnusedCompOutput.cpp
    UnusedSignal.cpp

    Test.cpp
    PrintGraphviz.cpp
    
    ProtocolFlowGraph.cpp
    utils_arrayshapes.cpp
    utils_basicinfo.cpp
    utils.cpp
    PLUGIN_TOOL
    opt
)
