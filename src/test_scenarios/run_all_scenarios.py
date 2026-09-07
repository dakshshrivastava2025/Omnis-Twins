"""
run_all_scenarios.py
--------------------
Runs all test scenario generators, then runs inference on each one,
and generates a report from the ACTUAL inference output (not hardcoded guesses).

Each scenario produces:
  data/test_scenarios/<name>.csv              <- sensor data
  data/test_scenarios/<name>_report.md        <- report from real inference results
"""

import sys
import os
import io
import json
import datetime
import importlib.util
import pandas as pd

REPO_ROOT   = r"d:\VIT\hackathon\Code2Create\github"
SCENARIOS_DIR = os.path.join(REPO_ROOT, "data", "test_scenarios")
MODEL_DIR   = os.path.join(REPO_ROOT, "models", "anomaly_detector")

# Add inference module to path
sys.path.insert(0, os.path.join(REPO_ROOT, "src", "models", "anomaly_detector"))
sys.path.insert(0, os.path.dirname(__file__))

SCENARIOS = [
    ("fault_coolant_leak",      "Fault",     "Coolant System Leak"),
    ("fault_oil_pressure",      "Fault",     "Oil Pump Degradation"),
    ("fault_alternator",        "Fault",     "Alternator Diode Failure"),
    ("fault_belt_slip",         "Fault",     "Serpentine Belt Slip"),
    ("edge_mountain_drive",     "Edge Case", "Mountain / Uphill Drive"),
    ("edge_aggressive_highway", "Edge Case", "Aggressive Highway Drive"),
]


def run_scenario(module_name: str) -> str:
    """Run a scenario script and capture its stdout."""
    import importlib.util

    buf = io.StringIO()
    old_stdout = sys.stdout
    sys.stdout = buf

    try:
        script_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), f"{module_name}.py")
        spec   = importlib.util.spec_from_file_location(module_name, script_path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
    except Exception as e:
        sys.stdout = old_stdout
        return f"ERROR: {e}"
    finally:
        sys.stdout = old_stdout

    return buf.getvalue()


def run_inference_on(csv_path: str):
    """Run the autoencoder inference on a specific scenario CSV."""
    from inference_anomaly import run_inference

    buf = io.StringIO()
    old_stdout = sys.stdout
    sys.stdout = buf

    try:
        telemetry, results_df = run_inference(csv_path=csv_path)
    except Exception as e:
        sys.stdout = old_stdout
        return None, None, f"ERROR: {e}"
    finally:
        sys.stdout = old_stdout

    return telemetry, results_df, buf.getvalue()


def find_first_detection(results_df: pd.DataFrame) -> float | None:
    """Return the first timestamp (seconds) where MSE crossed the threshold."""
    breach = results_df[results_df["MSE_Score"] > results_df["Threshold"]]
    if breach.empty:
        return None
    return float(breach["Time_s"].iloc[0])


def find_sustained_breach(results_df: pd.DataFrame, min_duration_s: int = 60) -> float | None:
    """
    Return the timestamp of the first SUSTAINED breach lasting >= min_duration_s seconds.
    A brief single spike doesn't count — we want the point where it stays anomalous.
    """
    threshold = results_df["Threshold"].iloc[0]
    in_breach = False
    breach_start = None

    for _, row in results_df.iterrows():
        if row["MSE_Score"] > threshold:
            if not in_breach:
                in_breach = True
                breach_start = row["Time_s"]
        else:
            if in_breach:
                duration = row["Time_s"] - breach_start
                if duration >= min_duration_s:
                    return float(breach_start)
            in_breach = False
            breach_start = None

    # Still in breach at end of drive
    if in_breach and breach_start is not None:
        duration = results_df["Time_s"].iloc[-1] - breach_start
        if duration >= min_duration_s:
            return float(breach_start)

    return None


def generate_report(name: str, scenario_type: str, title: str,
                    gen_output: str, telemetry: dict,
                    results_df: pd.DataFrame, infer_output: str):
    """Generate a markdown report from ACTUAL inference results."""

    ts = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    csv_path = os.path.join(SCENARIOS_DIR, f"{name}.csv")
    report_path = os.path.join(SCENARIOS_DIR, f"{name}_report.md")

    is_fault = scenario_type == "Fault"
    status = telemetry.get("status", "UNKNOWN") if telemetry else "ERROR"
    mse = telemetry.get("mse_score", 0.0) if telemetry else 0.0
    threshold = telemetry.get("threshold", 0.0) if telemetry else 0.0
    criticality = telemetry.get("criticality", "NONE") if telemetry else "N/A"
    root_sensor = telemetry.get("root_cause_sensor", "N/A") if telemetry else "N/A"
    failing_comp = telemetry.get("failing_component", "N/A") if telemetry else "N/A"
    description_str = telemetry.get("description", "") if telemetry else ""

    first_breach_s = find_first_detection(results_df) if results_df is not None else None
    sustained_s    = find_sustained_breach(results_df) if results_df is not None else None

    lines = [
        f"# Scenario Report: {title}",
        "",
        f"**Type:** {scenario_type}  ",
        f"**Generated:** {ts}  ",
        f"**CSV:** `{csv_path}`  ",
        f"**Duration:** 7200 s (2 hours) at 1 Hz  ",
        "",
        "---",
        "",
        "## Inference Result",
        "",
        f"| Field | Value |",
        f"|-------|-------|",
        f"| Status | **{status}** |",
        f"| Criticality | {criticality} |",
        f"| Peak MSE Score | {mse:.4f} |",
        f"| Threshold | {threshold:.4f} |",
        f"| MSE / Threshold ratio | {(mse / threshold):.2f}x |" if threshold > 0 else "| MSE / Threshold ratio | N/A |",
    ]

    if results_df is not None:
        lines += [
            f"| First breach at | {f'{first_breach_s:.0f} s ({first_breach_s/60:.1f} min)' if first_breach_s else 'Never'} |",
            f"| Sustained breach from | {f'{sustained_s:.0f} s ({sustained_s/60:.1f} min)' if sustained_s else 'Never (or brief only)'} |",
        ]

    if is_fault and status == "ANOMALY":
        lines += [
            f"| Root cause sensor | `{root_sensor}` |",
            f"| Failing component | {failing_comp} |",
        ]

    lines += [""]

    # Actual JSON output
    lines += [
        "## Actual live_telemetry.json Output",
        "",
        "This is the real output the system produced — passed to the 3D UI:",
        "",
        "```json",
        json.dumps(telemetry, indent=2) if telemetry else '{ "error": "inference failed" }',
        "```",
        "",
    ]

    if is_fault:
        lines += [
            "## 3D UI Action",
            "",
            f"- **Highlight component:** {failing_comp}",
            f"- **Alert color:** {'Red (CRITICAL)' if criticality == 'CRITICAL' else 'Orange (HIGH)' if criticality == 'HIGH' else 'Yellow (WARNING)'}",
            f"- **Description for tooltip/TTS:** _{description_str}_",
            "",
        ]
    else:
        lines += [
            "## 3D UI Action",
            "",
            "- **No component highlight** — system displays green / nominal state.",
            f"- **Status:** {status}",
            "",
        ]

    # MSE stats
    if results_df is not None:
        lines += [
            "## MSE Statistics",
            "",
            "```",
            f"  Peak MSE Score          : {results_df['MSE_Score'].max():.4f}",
            f"  Avg MSE (full drive)    : {results_df['MSE_Score'].mean():.4f}",
            f"  Avg MSE (first 60 min)  : {results_df[results_df['Time_s'] <= 3600]['MSE_Score'].mean():.4f}",
            f"  Avg MSE (after 60 min)  : {results_df[results_df['Time_s'] > 3600]['MSE_Score'].mean():.4f}",
            f"  Threshold               : {results_df['Threshold'].iloc[0]:.4f}",
            f"  % of drive above thresh : {100 * (results_df['MSE_Score'] > results_df['Threshold']).mean():.1f}%",
            "```",
            "",
        ]

    # Data generation output
    lines += [
        "## Data Generation Log",
        "",
        "```",
        gen_output.strip(),
        "```",
        "",
    ]

    report = "\n".join(lines)
    os.makedirs(SCENARIOS_DIR, exist_ok=True)
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(report)
    print(f"   Report  -> {report_path}")
    return report_path


if __name__ == "__main__":
    print("=" * 60)
    print("RUNNING ALL TEST SCENARIOS + INFERENCE")
    print("=" * 60)
    print()

    for name, stype, label in SCENARIOS:
        print(f"[1/2] Generating data: {label} ...")
        gen_output = run_scenario(name)
        if "ERROR" in gen_output:
            print(f"   FAILED: {gen_output}")
            continue
        print(f"   OK")

        csv_path = os.path.join(SCENARIOS_DIR, f"{name}.csv")
        print(f"[2/2] Running inference on: {csv_path} ...")
        telemetry, results_df, infer_output = run_inference_on(csv_path)
        if telemetry is None:
            print(f"   INFERENCE FAILED: {infer_output}")
            continue
        print(f"   Status: {telemetry.get('status')}  |  MSE: {telemetry.get('mse_score', 0):.4f}  |  Threshold: {telemetry.get('threshold', 0):.4f}")

        generate_report(name, stype, label, gen_output, telemetry, results_df, infer_output)
        print()

    print("=" * 60)
    print("Done. Check data/test_scenarios/ for CSVs and _report.md files.")
    print("=" * 60)
