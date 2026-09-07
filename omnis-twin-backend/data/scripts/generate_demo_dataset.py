"""
Omnis-Twin GUI-Aligned Demo Dataset Generator
=============================================
Generates telemetry CSV with extreme anomaly spikes to guarantee detection
for all 8 Frontend GUI components.
"""

import os
import csv
import random
from datetime import datetime, timedelta, timezone

random.seed(42)

FAILURES = {
    "heat_dissipation_failure": {
        "sensor_source": "SENSOR_THERMAL_BLOCK",
        "sensor_name":   "Coolant Loop Temperature Sensor",
        "component":     "Thermal Cooling Loop",
        "anomaly": dict(rpm=1200, torque_nm=45.5, air_temp_c=28.5, proc_temp_c=110.0,
                        tool_wear_min=55, frequency_hz=1190.0, decibels=95.0),
        "normal":  dict(rpm=1520, torque_nm=42.0, air_temp_c=25.5, proc_temp_c=35.8,
                        tool_wear_min=50, frequency_hz=308.0, decibels=63.0),
    },
    "bearing_rumble": {
        "sensor_source": "SENSOR_VIBRATION_BEARING",
        "sensor_name":   "Suspension Accelerometer",
        "component":     "Rear Left Suspension",
        "anomaly": dict(rpm=1790, torque_nm=39.5, air_temp_c=25.5, proc_temp_c=36.2,
                        tool_wear_min=85, frequency_hz=5000.0, decibels=105.5),
        "normal":  dict(rpm=1800, torque_nm=38.0, air_temp_c=25.0, proc_temp_c=35.0,
                        tool_wear_min=80, frequency_hz=362.0, decibels=62.0),
    },
    "overstrain_failure": {
        "sensor_source": "SENSOR_TORQUE_TRANSDUCER",
        "sensor_name":   "Drivetrain Torque Sensor",
        "component":     "Transmission / Drivetrain",
        "anomaly": dict(rpm=1650, torque_nm=180.0, air_temp_c=26.0, proc_temp_c=37.0,
                        tool_wear_min=130, frequency_hz=2700.0, decibels=98.0),
        "normal":  dict(rpm=1600, torque_nm=44.0, air_temp_c=25.5, proc_temp_c=35.5,
                        tool_wear_min=120, frequency_hz=320.0, decibels=64.0),
    },
    "belt_squeal": {
        "sensor_source": "SENSOR_ACOUSTIC_MIC",
        "sensor_name":   "Acoustic Engine Sensor",
        "component":     "Engine / Front Motor",
        "anomaly": dict(rpm=2200, torque_nm=37.5, air_temp_c=25.0, proc_temp_c=35.8,
                        tool_wear_min=35, frequency_hz=4500.0, decibels=100.0),
        "normal":  dict(rpm=2100, torque_nm=36.0, air_temp_c=24.5, proc_temp_c=34.5,
                        tool_wear_min=30, frequency_hz=422.0, decibels=65.0),
    },
    "tool_wear_failure": {
        "sensor_source": "SENSOR_WEAR_DISPLACEMENT",
        "sensor_name":   "Brake Pad Displacement Sensor",
        "component":     "Front Left Brake",
        "anomaly": dict(rpm=1380, torque_nm=52.0, air_temp_c=27.5, proc_temp_c=38.5,
                        tool_wear_min=300, frequency_hz=3800.0, decibels=94.0),
        "normal":  dict(rpm=1400, torque_nm=48.0, air_temp_c=27.0, proc_temp_c=37.0,
                        tool_wear_min=190, frequency_hz=282.0, decibels=61.0),
    },
    "power_failure": {
        "sensor_source": "SENSOR_POWER_INVERTER",
        "sensor_name":   "HV Battery Monitor",
        "component":     "HV Battery Pack",
        "anomaly": dict(rpm=2400, torque_nm=5.0, air_temp_c=25.2, proc_temp_c=98.0,
                        tool_wear_min=65, frequency_hz=1800.0, decibels=91.5),
        "normal":  dict(rpm=2300, torque_nm=40.0, air_temp_c=25.0, proc_temp_c=35.0,
                        tool_wear_min=60, frequency_hz=462.0, decibels=67.0),
    },
    "steering_response_failure": {
        "sensor_source": "SENSOR_POWER_STEERING",
        "sensor_name":   "EPS Torque & Current Transducer",
        "component":     "Electric Power Steering",
        "anomaly": dict(rpm=1550, torque_nm=120.0, air_temp_c=25.0, proc_temp_c=36.0,
                        tool_wear_min=40, frequency_hz=3500.0, decibels=96.0),
        "normal":  dict(rpm=1500, torque_nm=35.0, air_temp_c=25.0, proc_temp_c=35.0,
                        tool_wear_min=35, frequency_hz=310.0, decibels=62.0),
    },
    "tire_pressure_loss": {
        "sensor_source": "SENSOR_TIRE_PRESSURE",
        "sensor_name":   "TPMS & Wheel Speed Sensor",
        "component":     "Front Left Wheel & Tire",
        "anomaly": dict(rpm=1850, torque_nm=95.0, air_temp_c=26.5, proc_temp_c=37.0,
                        tool_wear_min=110, frequency_hz=4200.0, decibels=99.0),
        "normal":  dict(rpm=1800, torque_nm=40.0, air_temp_c=25.0, proc_temp_c=35.0,
                        tool_wear_min=100, frequency_hz=340.0, decibels=63.0),
    },
}

NORMAL_SENSOR = {
    "sensor_source": "SENSOR_TELEMETRY_BUS",
    "sensor_name":   "Standard Vehicle Telemetry Bus",
    "component":     "All Systems Nominal",
}

def jitter(val, pct=0.03):
    return round(val * (1.0 + random.uniform(-pct, pct)), 2)

def build_normal_frame(idx, start_time):
    base_rpm    = random.choice([1400, 1520, 1650, 1800, 2100, 2300])
    base_torque = random.uniform(36.0, 52.0)
    base_air    = random.uniform(24.5, 27.5)
    base_proc   = base_air + random.uniform(9.5, 11.0)
    base_wear   = random.randint(20, 195)
    base_freq   = round((base_rpm / 60.0) * 12.0 + random.uniform(-20, 20), 1)
    base_db     = round(52.0 + (base_rpm / 350.0) + (base_torque * 0.12) + random.uniform(-1.5, 1.5), 1)

    return {
        "timestamp":       (start_time + timedelta(seconds=idx)).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "frame_id":        idx + 1,
        "product_id":      f"UNIT-{idx+1:04d}",
        "variant":         "M",
        "sensor_source":   NORMAL_SENSOR["sensor_source"],
        "sensor_name":     NORMAL_SENSOR["sensor_name"],
        "component":       NORMAL_SENSOR["component"],
        "rpm":             jitter(base_rpm, 0.02),
        "torque_nm":       jitter(base_torque, 0.03),
        "air_temp_c":      jitter(base_air, 0.02),
        "process_temp_c":  jitter(base_proc, 0.02),
        "temp_diff_c":     round(base_proc - base_air, 2),
        "tool_wear_min":  base_wear,
        "frequency_hz":    jitter(base_freq, 0.05),
        "decibels":        jitter(base_db, 0.02),
        "is_anomaly":      0,
        "failure_type":    "normal",
    }

def build_anomaly_frame(idx, fault_key, severity_t, start_time):
    info = FAILURES[fault_key]
    n, a = info["normal"], info["anomaly"]

    def lerp(nv, av): return round(nv + (av - nv) * severity_t + random.uniform(-0.1, 0.1), 2)

    rpm          = lerp(n["rpm"], a["rpm"])
    torque_nm    = lerp(n["torque_nm"], a["torque_nm"])
    air_temp_c   = lerp(n["air_temp_c"], a["air_temp_c"])
    proc_temp_c  = lerp(n["proc_temp_c"], a["proc_temp_c"])
    tool_wear    = int(lerp(n["tool_wear_min"], a["tool_wear_min"]))
    frequency_hz = lerp(n["frequency_hz"], a["frequency_hz"])
    decibels     = lerp(n["decibels"], a["decibels"])

    return {
        "timestamp":       (start_time + timedelta(seconds=idx)).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "frame_id":        idx + 1,
        "product_id":      f"UNIT-{idx+1:04d}",
        "variant":         "M",
        "sensor_source":   info["sensor_source"],
        "sensor_name":     info["sensor_name"],
        "component":       info["component"],
        "rpm":             rpm,
        "torque_nm":       torque_nm,
        "air_temp_c":      air_temp_c,
        "process_temp_c":  proc_temp_c,
        "temp_diff_c":     round(proc_temp_c - air_temp_c, 2),
        "tool_wear_min":  tool_wear,
        "frequency_hz":    frequency_hz,
        "decibels":        decibels,
        "is_anomaly":      1,
        "failure_type":    fault_key,
    }

def generate_schedule(total_frames=240):
    fault_keys = list(FAILURES.keys())
    schedule = {}
    cursor = 10
    
    # Generate 3-frame anomaly bursts for each fault type
    for fault in fault_keys:
        for offset in range(3):
            schedule[cursor + offset] = (fault, 1.0)
        cursor += 25
        
    return schedule

def generate(output_path, total_frames=240):
    start_time = datetime(2026, 9, 7, 8, 0, 0, tzinfo=timezone.utc)
    schedule = generate_schedule(total_frames)

    rows = []
    for i in range(total_frames):
        if i in schedule:
            fkey, sev = schedule[i]
            rows.append(build_anomaly_frame(i, fkey, sev, start_time))
        else:
            rows.append(build_normal_frame(i, start_time))

    fieldnames = [
        "timestamp", "frame_id", "product_id", "variant",
        "sensor_source", "sensor_name", "component",
        "rpm", "torque_nm", "air_temp_c", "process_temp_c", "temp_diff_c",
        "tool_wear_min", "frequency_hz", "decibels", "is_anomaly", "failure_type",
    ]

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Generated GUI-aligned demo dataset at: {output_path}")

if __name__ == "__main__":
    base = os.path.dirname(os.path.abspath(__file__))
    out = os.path.abspath(os.path.join(base, "..", "processed", "demo_telemetry.csv"))
    generate(out)