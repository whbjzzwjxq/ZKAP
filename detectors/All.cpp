#include "ProtocolFlowGraph.hpp"

namespace {
struct All : public ModulePass {
    static char ID;

    All() : ModulePass(ID) {}

    bool runOnModule(Module &M) override {
        auto graphs = initDetectedGraphs(M, true, false);
        auto results = json::Object();
        auto main_comp = extractMainComp(&M);
        // initTimer();
        for (auto g : graphs) {
            // if (main_comp != "" && g->getName() != main_comp) {
            //     continue;
            // }
            auto g_result = json::Object();
            // g_result["info"] = g->collector->format();
            // g_result["graph"] = g->format();
            auto report = json::Object();
            report["uco"] = g->detectUnconstrainedOutput();
            report["usci"] = g->detectUnconstrainedCompInput();
            report["dcd"] = g->detectDataflowConstraintDis();
            report["usco"] = g->detectUnusedCompOutput();
            report["ucs"] = g->detectUnusedSignal();
            report["dbz"] = g->detectDivideByZeroUnsafe();
            report["ndd"] = g->detectNondeterministicDataflow();
            report["tm"] = g->detectTypeMismatch();
            report["ir"] = g->detectInconsistentRewrite();
            // report["nc"] = g->detectNonuniformConstraint();
            // report["qc"] = g->detectUnconstrainedSignalWithoutQC();
            g_result["reports"] = obj2value(report);
            results[g->getName()] = obj2value(g_result);
        }
        // results["time"] = checkTimer();
        json::OStream J(errs());
        J.value(obj2value(results));
        errs() << "\n";
        return false;
    };
};
}  // namespace

char All::ID = 0;
static RegisterPass<All> X(
    "All",
    "Detect whether every component is checked or not.",
    false, false);
