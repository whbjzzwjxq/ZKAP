#include "ProtocolFlowGraph.hpp"

namespace {
struct UnusedSignal : public ModulePass {
    static char ID;

    UnusedSignal() : ModulePass(ID) {}

    bool runOnModule(Module &M) override {
        auto graphs = initDetectedGraphs(M, true, false);
        auto results = json::Object();
        for (auto g : graphs) {
            auto g_result = json::Object();
            g_result["info"] = g->collector->format();
            g_result["graph"] = g->format();
            auto report = json::Object();
            report["ucs"] = g->detectUnusedSignal();
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

char UnusedSignal::ID = 0;
static RegisterPass<UnusedSignal> X(
    "UnusedSignal",
    "Detect whether every signal is used or not.",
    false, false);
