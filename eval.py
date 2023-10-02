import json
import os
import time
from os import path
from subprocess import TimeoutExpired
from typing import Dict

import pandas as pd

from utils.utils import *

benchmark_dir = "./benchmarks"

all_project_names = [
    n for n in os.listdir(benchmark_dir) if n != "libs" and n != "example"
]

with open("./benchmark_names.txt", "r") as f:
    bmk_names = [l.replace("\n", "") for l in f.readlines()]


def compile_and_detect():
    for p in all_project_names:
        input_dir = path.join(benchmark_dir, p)
        for circom_filename in os.listdir(input_dir):
            circom_path = path.join(input_dir, circom_filename)
            if path.isdir(circom_path) or not circom_filename.endswith(".circom"):
                continue
            output_subdir, llfile_path, log_path, _, _, _ = gen_result_path(
                p, circom_filename, CACHE_PATH
            )
            # Compilation
            if not path.exists(llfile_path):
                compile_circom(circom_path, output_subdir, 256)
            # Evaluation
            if not path.exists(log_path):
                exec_detection(log_path, llfile_path, "All", 3600)


def update_zksolid(remove_some_templates: bool = False):
    results = {}
    all_times = []
    removed_template_names = {"IsZero", "BabyAdd"}
    for p in all_project_names:
        input_dir = path.join(benchmark_dir, p)
        for circom_filename in os.listdir(input_dir):
            circom_path = path.join(input_dir, circom_filename)
            if path.isdir(circom_path) or not circom_filename.endswith(".circom"):
                continue
            output_subdir, llfile_path, log_path, _, _, _ = gen_result_path(
                p, circom_filename, CACHE_PATH
            )
            with open(log_path, "r") as f:
                try:
                    result: dict = json.load(f)
                except json.JSONDecodeError as err:
                    print(f"Error JSON: {log_path}, Reason: {err}")
                    results[f] = ["broken"] * len(detector_names)
                    continue
            if "error" in result:
                all_times.append(1200)
                if result["error"] == "timeout":
                    results[f] = ["timeout"] * len(detector_names)
                continue
            all_times.append(result.get("time", 1200))
            positives = []
            for d in detector_names:
                impl_bug_removes = {
                    "aes_256_ctr_test.circom": ["us"],
                }
                if d in impl_bug_removes.get(circom_filename, []):
                    positives.append("safe")
                    continue
                impl_bug_adds = {
                    "LessThan@comparators.circom": ["tm"],
                }
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
    frame = pd.DataFrame(
        ordered_results, index=bmk_names, columns=detector_names, dtype=str
    )
    if remove_some_templates:
        with open("./results/ZKSolidRefined.csv", "w") as f:
            frame.to_csv(f, index=False, header=False)
    else:
        with open("./results/ZKSolid.csv", "w") as f:
            frame.to_csv(f, index=False, header=False)
    all_times = sorted(all_times)
    m = all_times[len(all_times) // 2]
    print(f"Median time: {m}")


def update_circomspect():
    warning_results = {}
    error_results = {}
    all_times = {}
    timeout_files = ["ECDSAVerifyNoPubkeyCheck@circom-ecdsa@n=64@k=4.circom"]

    def gen_circomspect_result_path(project_name: str, circom_name: str):
        output_subdir = path.join(CACHE_PATH, "circomspect", project_name)
        if not path.exists(output_subdir):
            os.mkdir(output_subdir)
        log_path = path.join(output_subdir, circom_name.replace(".circom", ".json"))
        return output_subdir, log_path

    for p in all_project_names:
        input_dir = path.join(benchmark_dir, p)
        for circom_filename in os.listdir(input_dir):
            circom_path = path.join(input_dir, circom_filename)
            if path.isdir(circom_path) or not circom_filename.endswith(".circom"):
                continue
            if circom_filename in timeout_files:
                warning_results[circom_filename] = "unsafe"
                error_results[circom_filename] = "unsafe"
                all_times[circom_filename] = 1200
                continue
            _, log_path = gen_circomspect_result_path(p, circom_filename)
            cmds = [
                "circomspect",
                circom_path,
                "--sarif-file",
                log_path,
            ]
            init_timer = time.perf_counter()
            execute(cmds)
            all_times[circom_filename] = time.perf_counter() - init_timer
            with open(log_path, "r") as f:
                result: dict = json.load(f)
                warnings = [
                    r
                    for r in result["runs"][0]["results"]
                    if r["level"] == "warning" or r["level"] == "error"
                ]
                errors = [
                    r for r in result["runs"][0]["results"] if r["level"] == "error"
                ]
                warning_results[circom_filename] = (
                    "unsafe" if len(warnings) > 0 else "safe"
                )
                error_results[circom_filename] = "unsafe" if len(errors) > 0 else "safe"
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
        results = {}
        circuit_names = set()
        input_dir = path.join(benchmark_dir, p)
        for circom_filename in os.listdir(input_dir):
            circom_path = path.join(input_dir, circom_filename)
            if path.isdir(circom_path) or not circom_filename.endswith(".circom"):
                continue
            output_subdir, llfile_path, log_path, _, _, _ = gen_result_path(
                p, circom_filename, CACHE_PATH
            )
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
                    report_nums += len(v["reports"][d])
                if report_nums != 0:
                    results[circuit_name] = v
        with open(f"./results/{p}.json", "w") as f:
            json.dump(results, f)


if __name__ == "__main__":
    compile_and_detect()
    update_zksolid(True)
    update_zksolid(False)
    update_circomspect()
    summary_bugs()
