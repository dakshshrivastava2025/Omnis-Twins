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
    
    # 1. Load Data
    print("Loading Baseline Calibration Data...")
    df = pd.read_csv(data_path)
    
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
    
    print("Calibration Training Complete! Model and Scaler saved.")

if __name__ == "__main__":
    train()
