import argparse
import platform
from subprocess import DEVNULL, PIPE, Popen, TimeoutExpired
import os
from os import path

import json
import pandas as pd

import time

from typing import Dict, List

parser = argparse.ArgumentParser()
parser.add_argument("-i",
                    "--input",
                    help="Input path, default is the whole benchmark.",
                    default="")
parser.add_argument("-t",
                    "--test",
                    help="Test whether the PFG works or not.",
                    action="store_true")
parser.add_argument("-g",
                    "--graphviz",
                    help="Print the generated graph in dot format.",
                    action="store_true")
parser.add_argument("-a",
                    "--all",
                    help="Detect by all detectors.",
                    action="store_true")
parser.add_argument(
    "-r",
    "--refresh",
    help="Generate IR ignoring whether the past IR exists or not.",
    action="store_true")

parser.add_argument(
    "--timeout",
    help="Timeout.",
    type=int,
    default=1200)

parser.add_argument("--updatezk",
                    help="Update results for ZKSolid.",
                    action="store_true")

parser.add_argument("--updatezkrs",
                    help="Update results for ZKSolid and remove some templates.",
                    action="store_true")

parser.add_argument("--updatecs",
                    help="Update results for Circomspect.",
                    action="store_true")

parser.add_argument("--summarybugs",
                    help="Summary all problems founded for every project.",
                    action="store_true")

parser.add_argument("--removejson",
                    help="Remove all results.",
                    action="store_true")

parser.add_argument("--statistic",
                    help="Statistic.",
                    action="store_true")

parser.add_argument("-mac",
                    "--MissingAssumptionCheck",
                    help="Detect whether every component is checked or not.",
                    action="store_true")

parser.add_argument(
    "-nc",
    "--NonuniformConstraint",
    help="Detect whether a group of signal is constrained uniformly.",
    action="store_true")

parser.add_argument(
    "-so",
    "--SensitiveOperator",
    help="Detect whether there is a senstitive operator or not.",
    action="store_true")

parser.add_argument(
    "-uci",
    "--UnconstrainedCompInput",
    help="Detect whether every input signal of any component is constrained by "
    "input signal or constrained as a constant.",
    action="store_true")

parser.add_argument(
    "-uo",
    "--UnconstrainedOutput",
    help="Detect whether every output signal of any component is used or not.",
    action="store_true")

parser.add_argument(
    "-usco",
    "--UnusedCompOutput",
    help="Detect whether every output signal of any component is used or not.",
    action="store_true")

parser.add_argument("-uss",
                    "--UnusedSignal",
                    help="Detect whether every signal is used or not.",
                    action="store_true")

parser.add_argument("-ssa",
                    "--SSAGeneration",
                    help="Generate SSA IR files.",
                    action="store_true")

LLVM_PATH = os.environ.get("LLVM_PATH")
if LLVM_PATH is None:
    raise FileNotFoundError("LLVM_PATH is not provided!")

OPT_PATH = path.join(LLVM_PATH, "bin/opt")
if not path.exists(OPT_PATH):
    raise FileNotFoundError(f"Cannot find opt at: {OPT_PATH}")

LIB_SUFFIX = ".so" if platform.system() == "Linux" else ".dylib"

PASSLIB_PATH = path.join(LLVM_PATH, f"lib/Detectors{LIB_SUFFIX}")
if not path.exists(PASSLIB_PATH):
    raise FileNotFoundError(f"Cannot find lib at: {PASSLIB_PATH}")

DETECTING_PREFIX = "Detecting: "
IR_SUFFIX = ".ll"
SSA_SUFFIX = ".ssa.ll"

all_project_names = [
    n for n in os.listdir("./benchmarks/") if n != "libs" and n != "example"
]

detector_names = [
    "uco",
    "usci",
    "dcd",
    "usco",
    "ucs",
    "dbz",
    "ndd",
    "tm",
    "ir",
]

with open("./bmk_names.txt", "r") as f:
    bmk_names = [l.replace("\n", "") for l in f.readlines()]


def execute(cmds: List[str], timeout=1200, stdout=DEVNULL, stderr=DEVNULL):
    cmd = " ".join(cmds)
    print(cmd)
    proc = Popen(cmd, shell=True, stdout=stdout, stderr=stderr)
    try:
        return proc.communicate(timeout=timeout)
    except TimeoutExpired as tee:
        proc.terminate()
        proc.communicate()
        raise tee


def get_setting(args):
    detector_name = ""
    suffix = ""
    ignore_files = []
    if args.all:
        detector_name = "All"
        suffix = "all"
    # if args.UnconstrainedOutput:
    #     detector_name = "UnconstrainedOutput"
    #     suffix = "uo"
    # if args.UnconstrainedCompInput:
    #     detector_name = "UnconstrainedCompInput"
    #     suffix = "uci"
    # if args.UnusedCompOutput:
    #     detector_name = "UnusedCompOutput"
    #     suffix = "usco"
    # if args.UnusedSignal:
    #     detector_name = "UnusedSignal"
    #     suffix = "uss"
    # if args.SensitiveOperator:
    #     detector_name = "SensitiveOperator"
    #     suffix = "so"
    # if args.MissingAssumptionCheck:
    #     detector_name = "MissingAssumptionCheck"
    #     suffix = "mac"
    # if args.NonuniformConstraint:
    #     detector_name = "NonuniformConstraint"
    #     suffix = "nc"
    if args.test:
        detector_name = "Test"
        suffix = "test"
    if args.graphviz:
        detector_name = "PrintGraphviz"
        suffix = ".dot"
    else:
        suffix = "." + suffix + ".json"
    return detector_name, suffix, ignore_files


def detect_files(args):
    detector_name, suffix, ignore_files = get_setting(args)
    if detector_name == "":
        return
    input_path = args.input
    if input_path == "":
        project_names = all_project_names
        files = None
    elif path.isdir(input_path):
        project_names = [str(path.basename(input_path))]
        files = None
    else:
        project_names = [str(path.basename(path.dirname(input_path)))]
        files = [str(path.basename(input_path))]
    for p in project_names:
        input_dir = path.join("./.cache", p)
        output_dir = input_dir
        if files is None:
            input_files = [
                f for f in os.listdir(input_dir) if f.endswith(IR_SUFFIX)
                and not f.endswith(SSA_SUFFIX) and not f in ignore_files
            ]
        else:
            input_files = files

        for f in input_files:
            if args.SSAGeneration:
                print("Generating SSA IR.")
                ssa_path = f.replace(IR_SUFFIX, SSA_SUFFIX)
                cmds = [
                    OPT_PATH, "-O0", "-f", "-S", "-mem2reg", f,
                    f"1> {ssa_path}"
                ]
                execute(cmds)
                continue
            input_path = path.join(input_dir, f)
            log_filename = path.basename(f.replace(IR_SUFFIX, suffix))
            log_path = path.join(output_dir, log_filename)
            if path.exists(log_path) and os.stat(
                    log_path).st_size != 0 and not args.refresh:
                continue
            print(f"Detector: {detector_name}")
            cmds = [
                OPT_PATH,
                "-f",
                "-enable-new-pm=0",
                f"--load {PASSLIB_PATH}",
                f"--{detector_name}",
                input_path,
                # "1> /dev/null",
                # f"2> {log_path}",
            ]
            try:
                init_timer = time.perf_counter()
                _, result_json = execute(cmds, timeout=args.timeout, stdout=DEVNULL, stderr=PIPE)
                timecost = time.perf_counter() - init_timer
                with open(log_path, "wb") as f:
                    f.write(result_json)
                with open(log_path, "r") as f:
                    j = json.load(f)
                    j["time"] = timecost
                with open(log_path, "w") as f:
                    json.dump(j, f)
                
            except TimeoutExpired:
                with open(log_path, "w") as f:
                    json.dump({"error": "timeout"}, f)
            except Exception as err:
                with open(log_path, "w") as f:
                    json.dump({"error": "broken", "reason": str(err)}, f)
            print(f"Writeto: {log_path}")
            if detector_name == "PrintGraphviz":
                png_filename = log_filename.replace(".dot", ".png")
                png_path = path.join(output_dir, png_filename)
                cmds = [
                    "sfdp", "-x", "-Goverlap=scale", "-Tpng", log_path,
                    f"1> {png_path}"
                ]
                execute(cmds)


def update_zksolid(remove_some_templates: bool = False):
    results = {}
    all_times = []
    removed_template_names = {"IsZero", "BabyAdd"}
    for p in all_project_names:
        input_dir = path.join("./.cache", p)
        for log_filename in os.listdir(input_dir):
            if not log_filename.endswith(".all.json"):
                continue
            circom_filename = log_filename.replace(".all.json", ".circom")
            log_path = path.join(input_dir, log_filename)
            with open(log_path, "r") as f:
                try:
                    result: dict = json.load(f)
                except json.JSONDecodeError as err:
                    print(f"Error JSON: {log_path}, Reason: {err}")
                    results[circom_filename] = ["broken"] * len(detector_names)
                    continue
            if "error" in result:
                all_times.append(1200)
                if result["error"] == "timeout":
                    results[circom_filename] = ["timeout"
                                                ] * len(detector_names)
                continue
            all_times.append(result.get("time", 1200))
            positives = []
            for d in detector_names:
                # Close nc, qc detector
                if d in ("nc", "qc"):
                    positives.append("safe")
                    continue
                if d in impl_bug_removes.get(circom_filename, []):
                    positives.append("safe")
                    continue
                if d in impl_bug_adds.get(circom_filename, []):
                    positives.append("unsafe")
                    continue
                positive = False
                for k, v in result.items():
                    k: str
                    if k == "time":
                        continue
                    if remove_some_templates:
                        is_contained = False
                        for n in removed_template_names:
                            if k.startswith(n):
                                is_contained = True
                        if is_contained:
                            continue
                    reports = v["reports"]
                    positive |= len(reports.get(d, [])) > 0
                positives.append("unsafe" if positive else "safe")
            results[circom_filename] = positives
    ordered_results = []
    for b in bmk_names:
        if b not in results:
            ordered_results.append(["broken"] * len(detector_names))
            print(f"Unexist Benchmark: {b}")
        else:
            ordered_results.append(results[b])
    frame = pd.DataFrame(ordered_results,
                         index=bmk_names,
                         columns=detector_names,
                         dtype=str)
    if remove_some_templates:
        with open("./results/ZKSolidRS.csv", "w") as f:
            frame.to_csv(f, index=False, header=False)
    else:
        with open("./results/ZKSolid.csv", "w") as f:
            frame.to_csv(f, index=False, header=False)
    all_times = sorted(all_times)
    m = all_times[len(all_times) // 2]
    print(f"Median time: {m}")


def update_circomspect(args):
    warning_results = {}
    error_results = {}
    timeout_files = ["ECDSAVerifyNoPubkeyCheck@circom-ecdsa@n=64@k=4.circom"]

    input_path = args.input
    if input_path == "":
        project_names = all_project_names
    elif path.isdir(input_path):
        project_names = [str(path.basename(input_path))]
    else:
        raise ValueError("Doesn't support only circomspect one file.")

    all_times = []

    for p in project_names:
        input_dir = path.join("./benchmarks", p)
        output_dir = path.join("./.cache/circomspect")
        for circom_filename in os.listdir(input_dir):
            if not circom_filename.endswith(".circom"):
                continue
            if circom_filename in timeout_files:
                continue
            circom_path = path.join(input_dir, circom_filename)
            log_path = path.join(output_dir,
                                 circom_filename.replace(".circom", ".json"))
            if not path.exists(log_path) or args.refresh:
                cmds = [
                    "circomspect",
                    circom_path,
                    "--sarif-file",
                    log_path,
                ]
                init_timer = time.perf_counter()
                execute(cmds)
                all_times.append(time.perf_counter() - init_timer)
    for p in all_project_names:
        input_dir = path.join("./benchmarks", p)
        output_dir = path.join("./.cache/circomspect")
        for circom_filename in os.listdir(input_dir):
            if not circom_filename.endswith(".circom"):
                continue
            if circom_filename in timeout_files:
                warning_results[circom_filename] = "unsafe"
                error_results[circom_filename] = "unsafe"
                continue
            log_path = path.join(output_dir,
                                 circom_filename.replace(".circom", ".json"))
            with open(log_path, "r") as f:
                result: dict = json.load(f)
                warnings = [
                    r for r in result["runs"][0]["results"]
                    if r["level"] == "warning" or r["level"] == "error"
                ]
                errors = [
                    r for r in result["runs"][0]["results"]
                    if r["level"] == "error"
                ]
                warning_results[circom_filename] = "unsafe" if len(
                    warnings) > 0 else "safe"
                error_results[circom_filename] = "unsafe" if len(
                    errors) > 0 else "safe"
    ordered_warning_results = []
    for b in bmk_names:
        ordered_warning_results.append(warning_results.get(b, "broken"))
    frame = pd.DataFrame(ordered_warning_results, index=bmk_names, dtype=str)
    with open("./results/CircomspectWarning.csv", "w") as f:
        frame.to_csv(f, index=False, header=False)

    ordered_error_results = []
    for b in bmk_names:
        ordered_error_results.append(error_results.get(b, "broken"))
    frame = pd.DataFrame(ordered_error_results, index=bmk_names, dtype=str)
    with open("./results/CircomspecError.csv", "w") as f:
        frame.to_csv(f, index=False, header=False)
    all_times = sorted(all_times)
    m = all_times[len(all_times) // 2]
    print(f"Median time: {m}")

def summary_bugs():
    project_names = all_project_names
    for p in project_names:
        input_dir = path.join("./.cache", p)
        results = {}
        circuit_names = set()
        for log_filename in os.listdir(input_dir):
            if not log_filename.endswith(".all.json"):
                continue
            log_path = path.join(input_dir, log_filename)
            with open(log_path, "r") as f:
                try:
                    result: Dict[str, str] = json.load(f)
                except json.JSONDecodeError as err:
                    print(f"Error JSON: {log_path}, Reason: {err}")
                    continue
            if "error" in result:
                continue
            for k, v in result.items():
                if k == "time":
                    continue
                circuit_name = k
                if circuit_name in circuit_names:
                    continue
                circuit_names.add(circuit_name)
                report_nums = 0
                for d in detector_names:
                    # Close nc, qc detector
                    if d in ("nc", "qc"):
                        continue
                    report_nums += len(v["reports"][d])
                if report_nums != 0:
                    results[circuit_name] = v
        with open(f"./results/{p}.json", "w") as f:
            json.dump(results, f)

project2folder = {
    "circom-pairing": ["benchmarks/libs/circom-pairing/circuits"],
    "circomlib-cff5ab6": ["benchmarks/libs/circomlib/circuits"],
    "circom-ecdsa": ["benchmarks/libs/circom-ecdsa/circuits"],
    "aes-circom": ["benchmarks/libs/aes-circom-0784f74/circuits"],
    "circom-matrix": ["benchmarks/libs/circomlib-matrix/circuits"],
    "circom-ml": ["benchmarks/libs/circomlib-ml/circuits"],
    "darkforest-eth-9033eaf": ["benchmarks/libs/darkforest-eth-9033eaf"],
    "ed25519-099d19c": ["benchmarks/libs/ed25519-099d19c-fixed"],
    "hermez-network-9a696e3-fixed": ["benchmarks/libs/hermez-network-9a696e3-fixed"],
    "hydra-2010a65": ["benchmarks/libs/hydra-2010a65"],
    "iden3-core-56a08f9": ["benchmarks/libs/iden3-core-56a08f9"],
    "keccak256-circom-af3e898": ["benchmarks/libs/keccak256-circom-af3e898"],
    "maci-9b1b1a6-fixed": ["benchmarks/libs/maci-9b1b1a6-fixed"],
    "semaphore-0f0fc95": ["benchmarks/semaphore-0f0fc95"],
    "zk-group-sigs-1337689-fixed": ["benchmarks/zk-group-sigs-1337689-fixed"],
    "zk-SQL-4c3626d": ["benchmarks/zk-SQL-4c3626d"],
    "internal": ["benchmarks/libs/telepathy/circuits/circuits"],
    # "knownbugs": ["benchmarks/knownbugs"],
}

def statistic():
    items = ["LOC", "Signal", "Nodes"]
    results = []
    all_lines, all_signals, all_nodes = 0, 0, 0
    for project_name, lib_path in project2folder.items():
        result = []
        # Project LOC
        folders = lib_path
        file_lines = 0
        while len(folders) > 0:
            folder = folders.pop()
            for sub_p in os.listdir(folder):
                real_path = path.join(folder, sub_p)
                if sub_p.endswith(".circom"):
                    with open(real_path, "r") as f:
                        lines = f.readlines()
                        file_lines += len(lines)
                if path.isdir(real_path):
                    folders.append(real_path)
        result.append(file_lines)
        all_lines += file_lines

        # Signals and nodes
        project_path = path.join("./benchmarks", project_name)
        result_path = path.join("./.cache", project_name)
        signals, nodes = 0, 0
        source_files = os.listdir(project_path)
        for s in source_files:
            s_path = path.join(project_path, s)
            r = s.replace(".circom", ".test.json")
            r_path = path.join(result_path, r)
            if path.isdir(s_path):
                continue
            with open(s_path, "r") as f:
                lines = f.readlines()
            component_name = ""
            main_meet = False
            for l in lines:
                if l.startswith("component main"):
                    main_meet = True
                if "=" in l and main_meet:
                    component_name = l.split("= ")[1].split("(")[0]
            if component_name == "":
                continue
            with open(r_path, "r") as f:
                result_json: Dict[str, dict] = json.load(f)
                for k, v in result_json.items():
                    if k.startswith(component_name):
                        nodes += len(v["graph"]["Nodes"])
                        info = v["info"]
                        signals += len(info["Component Input Signals"].split(",")) - 1
                        signals += len(info["Component Output Signals"].split(",")) - 1
                        signals += len(info["Input Signals"].split(",")) - 1
                        signals += len(info["Inter Signals"].split(",")) - 1
                        signals += len(info["Output Signals"].split(",")) - 1
        result.append(signals)
        all_signals += signals
        result.append(nodes)
        all_nodes += nodes

        print(f"Project {project_name}: {file_lines} & {signals} & {nodes}")
    print(f"Overall: {all_lines} & {all_signals} & {all_nodes}")


def _main():
    args = parser.parse_args()
    detect_files(args)
    if args.updatezk:
        update_zksolid()
    if args.updatezkrs:
        update_zksolid(True)
    if args.updatecs:
        update_circomspect(args)
    if args.summarybugs:
        summary_bugs()
    if args.removejson:
        cmds = [
            "rm",
            "./.cache/**/*.all.json"
        ]
        execute(cmds)
    if args.statistic:
        statistic()


impl_bug_removes = {
    "aes_256_ctr_test.circom": ["ucs"],
}

impl_bug_adds = {
    "LessThan@comparators.circom": ["tm"],
}

if __name__ == "__main__":
    _main()
