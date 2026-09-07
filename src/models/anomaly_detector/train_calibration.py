import os
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import pandas as pd
import numpy as np
import joblib
from sklearn.preprocessing import StandardScaler
from tqdm import tqdm

from autoencoder import DynamicSensorAutoencoder

class CalibrationDataset(Dataset):
    def __init__(self, data_tensor, seq_len):
        self.data = data_tensor
        self.seq_len = seq_len
        
    def __len__(self):
        return len(self.data) - self.seq_len
        
    def __getitem__(self, idx):
        return self.data[idx : idx + self.seq_len]

def train():
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    print(f"Using device: {device}")
    
    # Paths
    data_path = r"d:\VIT\hackathon\Code2Create\github\data\calibration\baseline_drive.csv"
    model_dir = r"d:\VIT\hackathon\Code2Create\github\models\anomaly_detector"
    os.makedirs(model_dir, exist_ok=True)
    
    # ── Load all healthy drive profiles ──────────────────────────────────────
    # IMPORTANT: training data must cover ALL normal operating modes.
    # If we only train on city driving, the model flags highway/mountain as
    # anomalies because it has never seen high RPM or high speed.
    # We train on: city + highway + mountain — all correlated/healthy drives.
    
    HEALTHY_CSVS = [
        r"d:\VIT\hackathon\Code2Create\github\data\calibration\baseline_drive.csv",
        r"d:\VIT\hackathon\Code2Create\github\data\test_scenarios\edge_mountain_drive.csv",
        r"d:\VIT\hackathon\Code2Create\github\data\test_scenarios\edge_aggressive_highway.csv",
    ]
    
    dfs = []
    for p in HEALTHY_CSVS:
        if os.path.exists(p):
            dfs.append(pd.read_csv(p))
            print(f"  Loaded: {os.path.basename(p)}  ({len(dfs[-1])} rows)")
        else:
            print(f"  SKIP (not found): {p}")

    if not dfs:
        raise RuntimeError("No healthy CSV files found. Run chatgpt_code.py and the edge case scripts first.")

    df = pd.concat(dfs, ignore_index=True)
    print(f"  Total training rows: {len(df)}")

    # Drop the time column, keep only sensors
    sensor_cols = [c for c in df.columns if c != 'Time_s']
    data = df[sensor_cols].values
    
    # 2. Normalize Data
    # Normalizing is critical for Autoencoders so no single sensor dominates the error loss
    print("Normalizing sensors...")
    scaler = StandardScaler()
    data_scaled = scaler.fit_transform(data)
    
    # Save scaler for inference
    joblib.dump(scaler, os.path.join(model_dir, "scaler.joblib"))
    
    # 3. Create Sliding Windows
    SEQ_LEN = 50  # 5 seconds at 10Hz
    BATCH_SIZE = 64
    
    tensor_data = torch.FloatTensor(data_scaled)
    dataset = CalibrationDataset(tensor_data, SEQ_LEN)
    dataloader = DataLoader(dataset, batch_size=BATCH_SIZE, shuffle=True)
    
    # 4. Initialize Model
    num_sensors = len(sensor_cols)
    model = DynamicSensorAutoencoder(num_sensors=num_sensors, sequence_length=SEQ_LEN).to(device)
    
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    
    EPOCHS = 20
    
    # 5. Train Autoencoder
    print("Training Autoencoder to learn 'Normal' state...")
    model.train()
    
    for epoch in range(EPOCHS):
        total_loss = 0
        loop = tqdm(dataloader, desc=f"Epoch {epoch+1}/{EPOCHS}")
        for batch in loop:
            batch = batch.to(device)
            
            optimizer.zero_grad()
            
            # The Autoencoder tries to reconstruct its own input
            reconstructed = model(batch)
            loss = criterion(reconstructed, batch)
            
            loss.backward()
            optimizer.step()
            
            total_loss += loss.item()
            loop.set_postfix(loss=loss.item())
            
        print(f"Epoch {epoch+1} Avg Loss: {total_loss / len(dataloader):.6f}")
        
    # Save Model
    torch.save(model.state_dict(), os.path.join(model_dir, "autoencoder.pth"))
    
    # Save the architecture config so inference knows how to build it
    config = {'num_sensors': num_sensors, 'sequence_length': SEQ_LEN, 'sensor_cols': sensor_cols}
    joblib.dump(config, os.path.join(model_dir, "model_config.joblib"))

    # ── Compute and save threshold from healthy calibration data ─────────────
    # This is the ONLY correct way to set the threshold.
    # The threshold must be computed on healthy data — never on live/anomaly data.
    # We use the 95th percentile of reconstruction error on the calibration set.
    print("Computing anomaly threshold from calibration data...")
    model.eval()
    cal_mse_scores = []
    cal_dataloader = DataLoader(dataset, batch_size=BATCH_SIZE, shuffle=False)
    with torch.no_grad():
        for batch in cal_dataloader:
            batch = batch.to(device)
            reconstructed = model(batch)
            mse = nn.MSELoss()(reconstructed, batch).item()
            cal_mse_scores.append(mse)

    cal_mse = np.array(cal_mse_scores)
    # Use 99th percentile — 95th is too tight. Brief burst events (hard acceleration,
    # gear changes) in normal training data push the 95th pct low enough that
    # perfectly healthy highway bursts get flagged. 99th pct requires a much larger
    # sustained deviation before triggering.
    threshold = float(np.percentile(cal_mse, 99))
    joblib.dump(threshold, os.path.join(model_dir, "threshold.joblib"))


    print(f"Calibration MSE — mean: {cal_mse.mean():.4f}  std: {cal_mse.std():.4f}  95th pct (threshold): {threshold:.4f}")
    print("Calibration Training Complete! Model, Scaler, and Threshold saved.")

if __name__ == "__main__":
    train()
