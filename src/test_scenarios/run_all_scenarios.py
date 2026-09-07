"""
run_all_scenarios.py
--------------------
Runs all test scenario generators and writes a summary report to
data/test_scenarios/scenario_report.md
"""

import sys
import os
import io
import datetime

# Ensure the test_scenarios folder is on the path
sys.path.insert(0, os.path.dirname(__file__))

REPO_ROOT = r"d:\VIT\hackathon\Code2Create\github"
REPORT_PATH = os.path.join(REPO_ROOT, "data", "test_scenarios", "scenario_report.md")

SCENARIOS = [
    ("fault_coolant_leak",      "Fault",     "Coolant System Leak"),
    ("fault_oil_pressure",      "Fault",     "Oil Pump Degradation"),
    ("fault_alternator",        "Fault",     "Alternator Diode Failure"),
    ("fault_belt_slip",         "Fault",     "Serpentine Belt Slip"),
    ("edge_mountain_drive",     "Edge Case", "Mountain / Uphill Drive"),
    ("edge_aggressive_highway", "Edge Case", "Aggressive Highway Drive"),
]


def run_scenario(module_name: str) -> str:
    """Run a scenario script and capture its stdout output."""
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
        return f"  ERROR: {e}"
    finally:
        sys.stdout = old_stdout

    return buf.getvalue()


def build_report(results: list) -> str:
    ts = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    lines = [
        "# Test Scenario Run Report",
        "",
        f"**Generated:** {ts}  ",
        f"**Autoencoder trained on:** `data/calibration/baseline_drive.csv`  ",
        f"**Schema:** `rpm, speed_kph, throttle_pos, engine_load, coolant_temp_C, coolant_pressure_PSI, intake_air_temp_C`",
        "",
        "---",
        "",
        "## Summary",
        "",
        "| # | Scenario | Type | Expected MSE | Output File |",
        "|---|----------|------|-------------|-------------|",
    ]

    expected = {
        "fault_coolant_leak":      ("HIGH — threshold breach ~30 min after fault",   "fault_coolant_leak.csv"),
        "fault_oil_pressure":      ("HIGH — steady climb from ~70 min",               "fault_oil_pressure.csv"),
        "fault_alternator":        ("HIGH — rise from ~75 min",                        "fault_alternator.csv"),
        "fault_belt_slip":         ("HIGH — erratic spikes from ~65 min",              "fault_belt_slip.csv"),
        "edge_mountain_drive":     ("LOW — stays below threshold",                     "edge_mountain_drive.csv"),
        "edge_aggressive_highway": ("LOW — brief spikes only, no sustained breach",    "edge_aggressive_highway.csv"),
    }

    for i, (name, stype, label) in enumerate(SCENARIOS, 1):
        exp_mse, fname = expected[name]
        lines.append(f"| {i} | {label} | {stype} | {exp_mse} | `{fname}` |")

    lines += ["", "---", ""]

    for (name, stype, label), (output, success) in zip(SCENARIOS, results):
        icon = "✅" if success else "❌"
        lines += [
            f"## {icon} {label} (`{name}`)",
            "",
            f"**Type:** {stype}  ",
            "",
            "```",
            output.strip(),
            "```",
            "",
            "---",
            "",
        ]

    lines += [
        "## Sensor Coverage",
        "",
        "| Sensor | Source | Fault Relevance |",
        "|--------|--------|-----------------|",
        "| `rpm` | OBD-II standard (PID 010C) | Load/temp correlation anchor |",
        "| `speed_kph` | OBD-II standard (PID 010D) | Throttle/load/RPM cross-check |",
        "| `throttle_pos` | OBD-II standard (PID 0111) | Load/speed decorrelation detector |",
        "| `engine_load` | OBD-II standard (PID 0104) | Primary fault signal for oil/alternator |",
        "| `coolant_temp_C` | OBD-II standard (PID 0105) | Primary fault signal for coolant/belt |",
        "| `intake_air_temp_C` | OBD-II standard (PID 010F) | Ambient baseline reference |",
        "| `coolant_pressure_PSI` | Easily attachable (~$20 transducer) | Pressure/temp decorrelation |",
        "",
        "> **Note on microphones:** Acoustic sensors (for belt squeal, bearing noise) are not yet",
        "> included. They require FFT preprocessing to extract a scalar `acoustic_dB` feature before",
        "> feeding to the autoencoder. Planned for next iteration.",
    ]

    return "\n".join(lines)


if __name__ == "__main__":
    print("=" * 60)
    print("RUNNING ALL TEST SCENARIOS")
    print("=" * 60)
    print()

    results = []
    for name, stype, label in SCENARIOS:
        print(f"-> {label} ({stype}) ...")
        output = run_scenario(name)
        success = "ERROR" not in output
        results.append((output, success))
        status = "OK" if success else "FAILED"
        print(f"   [{status}]")
        print()

    report = build_report(results)

    os.makedirs(os.path.join(REPO_ROOT, "data", "test_scenarios"), exist_ok=True)
    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        f.write(report)

    print("=" * 60)
    print(f"Report saved to: {REPORT_PATH}")
    print("=" * 60)
