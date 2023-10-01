#include "ProtocolFlowGraph.hpp"

namespace {
struct MissingAssumptionCheck : public ModulePass {
    static char ID;

    MissingAssumptionCheck() : ModulePass(ID) {}

    bool runOnModule(Module &M) override {
        auto graphs = initDetectedGraphs(M, true, false);
        auto results = json::Object();
        for (auto g : graphs) {
            auto g_result = json::Object();
            g_result["info"] = g->collector->format();
            g_result["graph"] = g->format();
            auto report = json::Object();
            report["mac"] = g->detectTypeMismatch();
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

char MissingAssumptionCheck::ID = 0;
static RegisterPass<MissingAssumptionCheck> X(
    "MissingAssumptionCheck",
    "Detect whether every component is checked or not.",
    false, false);
