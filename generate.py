import argparse
from subprocess import call, TimeoutExpired
import os
from os import path

from typing import List

parser = argparse.ArgumentParser()
parser.add_argument("-i",
                    "--input",
                    help="Input path, default is the whole benchmark.",
                    default="")
parser.add_argument(
    "-r",
    "--refresh",
    help="Generate IR ignoring whether the past IR exists or not",
    action="store_true")
parser.add_argument("-a",
                    "--arraysize",
                    help="The static size of array",
                    default=256,
                    type=int)

all_project_names = [
    n for n in os.listdir("./benchmarks/") if n != "libs" and n != "example"
]


def execute(cmds: List[str]):
    cmd = " ".join(cmds)
    print(cmd)
    try:
        call(cmd, timeout=1200, shell=True)
    except TimeoutExpired as err:
        print(err)
    except Exception as e:
        print(e)


def _main():
    args = parser.parse_args()
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
        output_dir = path.join("./.cache", p)
        input_dir = path.join("./benchmarks", p)
        if not path.exists(output_dir):
            os.mkdir(output_dir)
        if files is None:
            input_files = os.listdir(input_dir)
        else:
            input_files = files
        for f in input_files:
            circom_path = path.join(input_dir, f)
            if path.isdir(circom_path):
                continue
            target_path = path.join(output_dir, f.replace(".circom", ".ll"))
            if path.exists(target_path) and not args.refresh:
                continue
            cmds = [
                "circom2llvm",
                "--input",
                circom_path,
                "--output",
                output_dir,
                "--instantiation",
                "--arraysize",
                str(args.arraysize),
            ]
            execute(cmds)


if __name__ == "__main__":
    _main()
