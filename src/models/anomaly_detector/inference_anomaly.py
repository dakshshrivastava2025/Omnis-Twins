import os
import torch
import torch.nn as nn
import pandas as pd
import numpy as np
import joblib
import json
from torch.utils.data import Dataset, DataLoader

from autoencoder import DynamicSensorAutoencoder

class InferenceDataset(Dataset):
    def __init__(self, data_tensor, seq_len):
        self.data = data_tensor
        self.seq_len = seq_len
        
    def __len__(self):
        return len(self.data) - self.seq_len
        
    def __getitem__(self, idx):
        return self.data[idx : idx + self.seq_len]

# Mapping sensors to components for the 3D Model
COMPONENT_MAP = {
    # Old Sensors
    'Engine_RPM': 'Engine Block / Transmission',
    'Acoustic_dB': 'Engine Block / Belts',
    'Vibration_g': 'Engine Mounts / Bearings',
    'Engine_Temp_C': 'Radiator / Cooling System',
    'Coolant_Pressure_PSI': 'Radiator / Coolant Lines',
    'Alternator_Voltage_V': 'Alternator / Electrical System',
    
    # ChatGPT Sensors
    'rpm': 'Engine Block / Transmission',
    'speed_kph': 'Wheels / Transmission',
    'throttle_pos': 'Throttle Body',
    'engine_load': 'Engine Block',
    'coolant_temp_C': 'Radiator / Cooling System',
    'coolant_pressure_PSI': 'Radiator / Coolant Lines',
    'intake_air_temp_C': 'Air Intake System'
}

def run_inference(csv_path: str = None) -> dict:
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    
    anomaly_data_path = csv_path or r"d:\VIT\hackathon\Code2Create\github\data\calibration\anomaly_drive.csv"
    model_dir = r"d:\VIT\hackathon\Code2Create\github\models\anomaly_detector"
    
    config = joblib.load(os.path.join(model_dir, "model_config.joblib"))
    scaler = joblib.load(os.path.join(model_dir, "scaler.joblib"))

    # Load the calibration-computed threshold.
    # This MUST come from healthy calibration data — never from the live drive.
    threshold_path = os.path.join(model_dir, "threshold.joblib")
    if not os.path.exists(threshold_path):
        raise FileNotFoundError(
            f"threshold.joblib not found at {threshold_path}. "
            "Run train_calibration.py first to compute and save the threshold."
        )
    THRESHOLD = joblib.load(threshold_path)
    print(f"Loaded calibration threshold: {THRESHOLD:.4f}")

    seq_len = config['sequence_length']
    num_sensors = config['num_sensors']
    sensor_cols = config['sensor_cols']
    
    model = DynamicSensorAutoencoder(num_sensors=num_sensors, sequence_length=seq_len).to(device)
    model.load_state_dict(torch.load(os.path.join(model_dir, "autoencoder.pth")))
    model.eval()
    
    print(f"Loading Live Drive Data: {anomaly_data_path}")
    df = pd.read_csv(anomaly_data_path)
    time_s = df['Time_s'].values[seq_len:] 
    
    data = df[sensor_cols].values
    data_scaled = scaler.transform(data)
    
    tensor_data = torch.FloatTensor(data_scaled)
    dataset = InferenceDataset(tensor_data, seq_len)
    dataloader = DataLoader(dataset, batch_size=1, shuffle=False) 
    
    mse_scores = []
    feature_errors = []
    
    print("Running Anomaly Detection with Root Cause Analysis...")
    with torch.no_grad():
        for batch in dataloader:
            batch = batch.to(device)
            reconstructed = model(batch)
            
            # Overall Error
            mse = nn.MSELoss()(reconstructed, batch).item()
            mse_scores.append(mse)
            
            # Feature-wise Error (to find the root cause)
            # batch shape: [1, seq_len, num_sensors]
            error_per_sensor = torch.mean((reconstructed - batch)**2, dim=(0, 1)).cpu().numpy()
            feature_errors.append(error_per_sensor)
            
    mse_arr = np.array(mse_scores)

    # ── Sustained breach detection ─────────────────────────────────────────────
    # A real fault produces SUSTAINED elevation above threshold (minutes).
    # Normal driving events (hard acceleration bursts, gear changes) produce
    # brief spikes that immediately recover. We require >= 60 consecutive seconds
    # above threshold before declaring an anomaly.
    SUSTAINED_MIN_S = 60

    # Find the longest sustained breach window and its peak
    best_start_idx  = None
    best_peak_idx   = None
    best_peak_mse   = 0.0
    run_start       = None
    run_peak_idx    = None
    run_peak_mse    = 0.0

    for i, (mse_val, t_val) in enumerate(zip(mse_arr, time_s)):
        if mse_val > THRESHOLD:
            if run_start is None:
                run_start    = i
                run_peak_idx = i
                run_peak_mse = mse_val
            elif mse_val > run_peak_mse:
                run_peak_idx = i
                run_peak_mse = mse_val
        else:
            if run_start is not None:
                duration = time_s[i - 1] - time_s[run_start]
                if duration >= SUSTAINED_MIN_S and run_peak_mse > best_peak_mse:
                    best_start_idx = run_start
                    best_peak_idx  = run_peak_idx
                    best_peak_mse  = run_peak_mse
            run_start = None
            run_peak_idx = None
            run_peak_mse = 0.0

    # Check if still in a breach at end of drive
    if run_start is not None:
        duration = time_s[-1] - time_s[run_start]
        if duration >= SUSTAINED_MIN_S and run_peak_mse > best_peak_mse:
            best_start_idx = run_start
            best_peak_idx  = run_peak_idx
            best_peak_mse  = run_peak_mse

    is_anomaly = best_peak_idx is not None

    if is_anomaly:
        worst_features    = feature_errors[best_peak_idx]
        worst_sensor_idx  = np.argmax(worst_features)
        worst_sensor_name = sensor_cols[worst_sensor_idx]
        failing_component = COMPONENT_MAP.get(worst_sensor_name, "Unknown Component")

        ratio = best_peak_mse / THRESHOLD
        if ratio > 3.0:
            criticality = "CRITICAL"
            title       = "CRITICAL COMPONENT FAILURE DETECTED"
        elif ratio > 1.5:
            criticality = "HIGH"
            title       = "MAJOR ANOMALY DETECTED"
        else:
            criticality = "WARNING"
            title       = "SYSTEM DEGRADATION DETECTED"

        telemetry = {
            "time_s":             float(time_s[best_start_idx]),
            "status":             "ANOMALY",
            "title":              title,
            "criticality":        criticality,
            "mse_score":          float(best_peak_mse),
            "threshold":          float(THRESHOLD),
            "root_cause_sensor":  worst_sensor_name,
            "failing_component":  failing_component,
            "description":        f"Autoencoder detected sustained deviation in {worst_sensor_name}. Highlight the {failing_component}."
        }
    else:
        # Report the peak MSE seen, even in healthy case, for diagnostics
        max_error_idx = int(np.argmax(mse_arr))
        telemetry = {
            "time_s":     float(time_s[-1]),
            "status":     "HEALTHY",
            "title":      "SYSTEM NORMAL",
            "criticality":"NONE",
            "mse_score":  float(mse_arr[max_error_idx]),
            "threshold":  float(THRESHOLD)
        }

        
    out_json = os.path.join(model_dir, "live_telemetry.json")
    with open(out_json, "w") as f:
        json.dump(telemetry, f, indent=4)
        
    print(f"\nGenerated JSON output for the 3D UI at: {out_json}")
    print(json.dumps(telemetry, indent=2))
        
    out_df = pd.DataFrame({
        'Time_s': time_s,
        'MSE_Score': mse_scores,
        'Threshold': [THRESHOLD] * len(time_s)
    })
    out_csv = os.path.join(model_dir, "inference_results.csv")
    out_df.to_csv(out_csv, index=False)
    print(f"Results saved to {out_csv} for plotting.")

    return telemetry, out_df

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--csv", type=str, default=None, help="Path to scenario CSV file")
    args = parser.parse_args()
    run_inference(csv_path=args.csv)
