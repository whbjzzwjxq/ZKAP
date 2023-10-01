#include "ProtocolFlowGraph.hpp"

namespace {
struct UnusedCompOutput : public ModulePass {
    static char ID;

    UnusedCompOutput() : ModulePass(ID) {}

    bool runOnModule(Module& M) override {
        auto graphs = initDetectedGraphs(M, true, false);
        auto results = json::Object();
        for (auto g : graphs) {
            auto g_result = json::Object();
            g_result["info"] = g->collector->format();
            g_result["graph"] = g->format();
            auto report = json::Object();
            report["usco"] = g->detectUnusedCompOutput();
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

char UnusedCompOutput::ID = 0;
static RegisterPass<UnusedCompOutput> X(
    "UnusedCompOutput",
    "Detect whether every output signal of any component is used or not.",
    false, false);
