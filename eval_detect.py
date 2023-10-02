import argparse
import json
import os
from os import path
from typing import Dict

from utils.utils import *

parser = argparse.ArgumentParser()
parser.add_argument(
    "-i",
    "--input",
    help="Input path or circuit.",
    required=True,
)
parser.add_argument(
    "-o",
    "--output",
    help="Output path, must be a directory, default is current directory.",
    default="",
)
parser.add_argument(
    "-p",
    "--printinfo",
    help="Print the CDG of given circuit.",
    action="store_true",
)
parser.add_argument(
    "-g",
    "--graphviz",
    help="Print the generated graph in dot format.",
    action="store_true",
)
parser.add_argument(
    "-r",
    "--refresh",
    help="Ignore current result.",
    action="store_true",
)
parser.add_argument(
    "--timeout",
    help="Timeout for detecting.",
    type=int,
    default=1200,
)
parser.add_argument(
    "-a",
    "--arraysize",
    help="The max size of array defined in the input circuit.",
    default=256,
    type=int,
)


def detect(args):
    input_path: str = args.input
    output_dir: str = args.output
    if not path.isdir(output_dir):
        raise ValueError(f"Output path must be a directory, current is: {output_dir}")
    if path.isdir(input_path):
        project_name = path.basename(input_path)
        if project_name == "":
            project_name = "default_project"
        circom_paths = [
            path.join(input_path, f)
            for f in os.listdir(input_path)
            if f.endswith(".circom")
        ]
    else:
        project_name = path.basename(input_path).removesuffix(".circom")
        circom_paths = [input_path]
    log_paths = []
    for circom_path in circom_paths:
        circom_filename = path.basename(circom_path)
        (
            output_subdir,
            llfile_path,
            log_path,
            printinfo_path,
            graphviz_path,
            graphviz_pic_path,
        ) = gen_result_path(project_name, circom_filename, output_dir)
        # Compilation
        if not path.exists(llfile_path) or args.refresh:
            compile_circom(circom_path, output_subdir, args.arraysize)
        # Evaluation
        if args.graphviz:
            if not path.exists(graphviz_pic_path) or args.refresh:
                _, result = detect_llfile(llfile_path, "PrintGraphviz")
                with open(graphviz_path, "wb") as f:
                    f.write(result)
                cmds = [
                    "sfdp",
                    "-x",
                    "-Goverlap=scale",
                    "-Tpng",
                    graphviz_path,
                    f"1> {graphviz_pic_path}",
                ]
                execute(cmds)
        elif args.printinfo:
            if not path.exists(printinfo_path) or args.refresh:
                exec_detection(printinfo_path, llfile_path, "PrintGraphInfo")
        else:
            if not path.exists(log_path) or args.refresh:
                exec_detection(log_path, llfile_path, "All", args.timeout)
            log_paths.append(log_path)
    if not args.graphviz and not args.printinfo:
        summary_bugs(output_dir, project_name, log_paths)


def summary_bugs(output_dir: str, project_name: str, log_paths: List[str]):
    results = {}
    circuit_names = set()
    output_path = path.join(output_dir, project_name, ".json")
    for log_path in log_paths:
        if not log_path.endswith(".all.json"):
            continue
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
    with open(output_path, "w") as f:
        json.dump(results, f)


def _main():
    args = parser.parse_args()
    detect(args)


if __name__ == "__main__":
    _main()
