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

def detect_files(args):
    pass


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


def _main():
    args = parser.parse_args()
    detect_files(args)


if __name__ == "__main__":
    _main()
