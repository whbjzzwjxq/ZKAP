#include "ProtocolFlowGraph.hpp"

namespace {
struct UnconstrainedCompInput : public ModulePass {
    static char ID;

    UnconstrainedCompInput() : ModulePass(ID) {}

    bool runOnModule(Module& M) override {
        auto graphs = initDetectedGraphs(M, true, false);
        auto results = json::Object();
        for (auto g : graphs) {
            auto g_result = json::Object();
            g_result["info"] = g->collector->format();
            g_result["graph"] = g->format();
            auto report = json::Object();
            report["usci"] = g->detectUnconstrainedCompInput();
            g_result["reports"] = obj2value(report);
            results[g->getName()] = obj2value(g_result);
        }
        json::OStream J(errs());
        J.value(obj2value(results));
        errs() << "\n";
        return false;
    };
};
}  // namespace

char UnconstrainedCompInput::ID = 0;
static RegisterPass<UnconstrainedCompInput> X(
    "UnconstrainedCompInput",
    "Detect whether every input signal of any component is constrained in the "
    "circuit",
    false, false);
