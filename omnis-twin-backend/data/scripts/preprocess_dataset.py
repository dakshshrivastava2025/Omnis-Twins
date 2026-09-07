"""
Automotive Telemetry Preprocessing Pipeline for Omnis-Twin.
Converts raw UCI AI4I 2020 predictive maintenance data into standardized 
automotive digital twin telemetry (RPM, torque, temperatures, acoustic frequencies, dB, and failure states).
"""

import os
import sys
import csv
import math
from datetime import datetime, timedelta, timezone

def resolve_paths():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    # Check if inside omnis-twin-backend/data/scripts
    data_dir = os.path.abspath(os.path.join(base_dir, ".."))
    raw_path = os.path.join(data_dir, "raw", "ai4i2020.csv")
    processed_dir = os.path.join(data_dir, "processed")
    processed_path = os.path.join(processed_dir, "automotive_telemetry.csv")

    # If raw_path doesn't exist relative to script, check fallback
    if not os.path.exists(raw_path):
        alt_raw = os.path.abspath(os.path.join(base_dir, "../../../omnis-twin-backend/data/raw/ai4i2020.csv"))
        if os.path.exists(alt_raw):
            raw_path = alt_raw
            processed_dir = os.path.dirname(alt_raw).replace("raw", "processed")
            processed_path = os.path.join(processed_dir, "automotive_telemetry.csv")

    return raw_path, processed_dir, processed_path

def preprocess(raw_path, processed_path):
    if not os.path.exists(raw_path):
        raise FileNotFoundError(f"Raw dataset not found at: {raw_path}")

    os.makedirs(os.path.dirname(processed_path), exist_ok=True)

    print(f"[Preprocessing] Reading raw dataset: {raw_path}")

    start_time = datetime(2026, 9, 7, 12, 0, 0, tzinfo=timezone.utc)
    processed_rows = []

    with open(raw_path, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        
        for index, row in enumerate(reader):
            # Parse core numerical fields
            udi = int(row.get("UDI", index + 1))
            product_id = row.get("Product ID", f"M-{udi}")
            variant = row.get("Type", "M")
            
            air_temp_k = float(row.get("Air temperature [K]", 298.0))
            proc_temp_k = float(row.get("Process temperature [K]", 308.0))
            rpm = float(row.get("Rotational speed [rpm]", 1500.0))
            torque = float(row.get("Torque [Nm]", 40.0))
            tool_wear = float(row.get("Tool wear [min]", 0.0))
            
            machine_failure = int(row.get("Machine failure", 0))
            twf = int(row.get("TWF", 0))  # Tool Wear Failure
            hdf = int(row.get("HDF", 0))  # Heat Dissipation Failure
            pwf = int(row.get("PWF", 0))  # Power Failure
            osf = int(row.get("OSF", 0))  # Overstrain Failure
            rnf = int(row.get("RNF", 0))  # Random Failure

            # Derived temperatures in Celsius
            air_temp_c = round(air_temp_k - 273.15, 2)
            proc_temp_c = round(proc_temp_k - 273.15, 2)
            temp_diff_c = round(proc_temp_c - air_temp_c, 2)

            # Failure taxonomy mapping
            if hdf == 1:
                failure_type = "heat_dissipation_failure"
            elif osf == 1:
                failure_type = "overstrain_failure"
            elif twf == 1:
                failure_type = "tool_wear_failure"
            elif pwf == 1:
                failure_type = "power_failure"
            elif rnf == 1:
                failure_type = "random_failure"
            elif machine_failure == 1:
                failure_type = "belt_squeal"
            else:
                failure_type = "normal"

            is_anomaly = 1 if (machine_failure == 1 or failure_type != "normal") else 0

            # Acoustic telemetry synthesis consistent with Omnis-Twin specifications:
            # Baseline frequency (motor harmonics ~ order 10-12 of RPM / 60)
            base_order = 12.0
            fundamental_freq = (rpm / 60.0) * base_order
            
            # Baseline decibel calculation (engine idle/rev noise scaled by load & speed)
            base_db = 52.0 + (rpm / 350.0) + (torque * 0.12)

            # Modulate acoustic signals during anomaly conditions
            if is_anomaly:
                if failure_type == "belt_squeal":
                    # Characteristic high pitch squeal > 2400 Hz and high dB > 72 dB
                    frequency_hz = round(max(2450.0, fundamental_freq * 3.5 + 1500.0), 1)
                    decibels = round(max(73.5, base_db + 16.0), 1)
                elif failure_type == "heat_dissipation_failure":
                    # Thermal stress friction & fan noise elevation
                    frequency_hz = round(fundamental_freq + 850.0, 1)
                    decibels = round(base_db + 11.5, 1)
                elif failure_type == "overstrain_failure":
                    # Severe mechanical stress: high vibration harmonics and loud groan
                    frequency_hz = round(max(2500.0, fundamental_freq * 2.8), 1)
                    decibels = round(max(75.0, base_db + 14.0), 1)
                elif failure_type == "tool_wear_failure":
                    # High frequency chatter from worn contact surfaces
                    frequency_hz = round(max(2420.0, fundamental_freq * 3.0), 1)
                    decibels = round(base_db + 13.0, 1)
                elif failure_type == "power_failure":
                    # Unstable power fluctuation noise
                    frequency_hz = round(fundamental_freq * 1.5 + 400.0, 1)
                    decibels = round(base_db + 9.0, 1)
                else:
                    frequency_hz = round(fundamental_freq * 1.8 + 500.0, 1)
                    decibels = round(base_db + 8.0, 1)
            else:
                # Normal operational jitter
                jitter_f = (math.sin(index * 0.5) * 15.0)
                jitter_db = (math.cos(index * 0.3) * 1.2)
                frequency_hz = round(max(100.0, fundamental_freq + jitter_f), 1)
                decibels = round(max(48.0, min(71.0, base_db + jitter_db)), 1)

            # Sensor source mapping based on physical anomaly mechanism
            if failure_type == "heat_dissipation_failure":
                sensor_source = "SENSOR_THERMAL_BLOCK"
                sensor_name = "Thermal Gradient & Coolant Thermistor"
            elif failure_type == "belt_squeal":
                sensor_source = "SENSOR_ACOUSTIC_MIC"
                sensor_name = "Accessory Drive Acoustic Microphone"
            elif failure_type == "overstrain_failure":
                sensor_source = "SENSOR_TORQUE_TRANSDUCER"
                sensor_name = "Drivetrain Mechanical Torque Strain Gauge"
            elif failure_type == "tool_wear_failure":
                sensor_source = "SENSOR_WEAR_DISPLACEMENT"
                sensor_name = "Contact Interface Linear Displacement Sensor"
            elif failure_type == "power_failure":
                sensor_source = "SENSOR_POWER_INVERTER"
                sensor_name = "Inverter DC Bus Current & Voltage Monitor"
            elif failure_type == "random_failure":
                sensor_source = "SENSOR_VIBRATION_BEARING"
                sensor_name = "High-Frequency Vibration Accelerometer"
            else:
                sensor_source = "SENSOR_TELEMETRY_BUS"
                sensor_name = "Standard Multi-Sensor Telemetry Array"

            timestamp = (start_time + timedelta(seconds=index)).strftime("%Y-%m-%dT%H:%M:%SZ")

            processed_rows.append({
                "timestamp": timestamp,
                "frame_id": udi,
                "product_id": product_id,
                "variant": variant,
                "sensor_source": sensor_source,
                "sensor_name": sensor_name,
                "rpm": round(rpm, 1),
                "torque_nm": round(torque, 2),
                "air_temp_c": air_temp_c,
                "process_temp_c": proc_temp_c,
                "temp_diff_c": temp_diff_c,
                "tool_wear_min": int(tool_wear),
                "frequency_hz": frequency_hz,
                "decibels": decibels,
                "is_anomaly": is_anomaly,
                "failure_type": failure_type
            })

    # Write processed CSV
    fieldnames = [
        "timestamp", "frame_id", "product_id", "variant",
        "sensor_source", "sensor_name",
        "rpm", "torque_nm", "air_temp_c", "process_temp_c", "temp_diff_c",
        "tool_wear_min", "frequency_hz", "decibels", "is_anomaly", "failure_type"
    ]

    with open(processed_path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(processed_rows)

    anomaly_count = sum(1 for r in processed_rows if r["is_anomaly"] == 1)
    print(f"[Preprocessing] Success! Wrote {len(processed_rows)} rows to {processed_path}")
    print(f"[Preprocessing] Total Anomaly Frames: {anomaly_count} ({(anomaly_count/len(processed_rows))*100:.2f}%)")

if __name__ == "__main__":
    raw, out_dir, out_file = resolve_paths()
    preprocess(raw, out_file)
