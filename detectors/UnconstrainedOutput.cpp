#include "ProtocolFlowGraph.hpp"

namespace {
struct UnconstrainedOutput : public ModulePass {
    static char ID;

    UnconstrainedOutput() : ModulePass(ID) {}

    bool runOnModule(Module& M) override {
        auto graphs = initDetectedGraphs(M, true, false);
        auto results = json::Object();
        for (auto g : graphs) {
            auto g_result = json::Object();
            g_result["info"] = g->collector->format();
            g_result["graph"] = g->format();
            auto report = json::Object();
            report["uco"] = g->detectUnconstrainedOutput();
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

char UnconstrainedOutput::ID = 0;
static RegisterPass<UnconstrainedOutput> X(
    "UnconstrainedOutput",
    "Detect whether every output signal is constrained by an input "
    "signal or constrained as a constant.",
    false, false);
