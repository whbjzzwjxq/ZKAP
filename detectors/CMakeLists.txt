add_llvm_library(detectors MODULE
    utils_arrayshapes.cpp
    utils_basicinfo.cpp
    utils.cpp
    ProtocolFlowGraph.cpp
    All.cpp
    PrintGraphInfo.cpp
    PrintGraphviz.cpp
    PLUGIN_TOOL
    opt
)
