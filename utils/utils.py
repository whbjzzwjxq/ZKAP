import json
import os
import platform
import time
from os import path
from subprocess import DEVNULL, PIPE, Popen, TimeoutExpired
from typing import List

LLVM_PATH = os.environ.get("LLVM_PATH")
if LLVM_PATH is None:
    raise FileNotFoundError("ENV Variable LLVM_PATH is not provided!")

OPT_PATH = path.join(LLVM_PATH, "bin/opt")
if not path.exists(OPT_PATH):
    raise FileNotFoundError(f"Cannot find opt at: {OPT_PATH}")

LIB_SUFFIX = ".so" if platform.system() == "Linux" else ".dylib"

PASSLIB_PATH = path.join(LLVM_PATH, f"lib/detectors{LIB_SUFFIX}")
if not path.exists(PASSLIB_PATH):
    raise FileNotFoundError(f"Cannot find lib at: {PASSLIB_PATH}")

DETECTING_PREFIX = "Detecting: "
CACHE_PATH = "./.cache"
if not path.exists(CACHE_PATH):
    os.mkdir(CACHE_PATH)

detector_names = [
    "uco",
    "usci",
    "dcd",
    "tm",
    "us",
    "usco",
    "am",
    "ndd",
    "dbz",
]


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


def compile_circom(circom_path: str, output_dir: str, arraysize: int = 256):
    cmds = [
        "circom2llvm",
        "--input",
        circom_path,
        "--output",
        output_dir,
        "--instantiation",
        "--arraysize",
        str(arraysize),
    ]
    return execute(cmds)


def detect_llfile(llfile_path: str, detector_name: str, timeout: int):
    cmds = [
        OPT_PATH,
        "-f",
        "-enable-new-pm=0",
        f"--load {PASSLIB_PATH}",
        f"--{detector_name}",
        llfile_path,
    ]
    return execute(cmds, timeout=timeout, stdout=DEVNULL, stderr=PIPE)


def exec_detection(log_path: str, llfile_path: str, detector_name: str, timeout: int):
    try:
        init_timer = time.perf_counter()
        _, result_json = detect_llfile(llfile_path, detector_name, timeout)
        timecost = time.perf_counter() - init_timer
        result = json.loads(result_json)
        result["time"] = timecost
    except TimeoutExpired:
        result = {"error": "timeout"}
    except Exception as err:
        result = {"error": "broken", "reason": str(err)}
    with open(log_path, "w") as f:
        json.dump(result, f, indent=4)
    return result


def gen_result_path(project_name: str, circom_name: str, output_dir: str):
    output_subdir = path.join(output_dir, project_name)
    if not path.exists(output_subdir):
        os.mkdir(output_subdir)
    llfile_path = path.join(output_subdir, circom_name.replace(".circom", ".ll"))
    log_path = path.join(output_subdir, circom_name.replace(".circom", ".all.json"))
    printinfo_path = path.join(
        output_subdir, circom_name.replace(".circom", ".info.json")
    )
    graphviz_path = path.join(output_subdir, circom_name.replace(".circom", ".dot"))
    graphviz_pic_path = path.join(output_subdir, circom_name.replace(".circom", ".png"))
    return (
        output_subdir,
        llfile_path,
        log_path,
        printinfo_path,
        graphviz_path,
        graphviz_pic_path,
    )
