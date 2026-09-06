import os
import glob
import pandas as pd
import numpy as np
from scipy.signal import butter, filtfilt
import warnings

warnings.filterwarnings('ignore')

def simulate_cabin_damping(df, columns):
    """
    Simulates in-cabin conditions by:
    1. Reducing the amplitude (chassis damping)
    2. Adding random Gaussian noise (road/cabin interference)
    3. Applying a light low-pass filter to simulate structural damping
    """
    simulated_df = df.copy()
    
    # 1. Amplitude reduction (vibrations in cabin are much weaker than on the motor itself)
    damping_factor = 0.15 
    
    # 2. Noise addition
    # Assuming baseline noise in a cabin is roughly 0.01g
    noise_std = 0.01 
    
    # 3. Filter design: Low-pass filter
    # Sampling rate is 100 Hz (from dataset description), Nyquist is 50 Hz.
    # We apply a cutoff at 45 Hz to smooth out very high-frequency harshness, 
    # but keep the 30-50Hz engine fundamental frequencies.
    fs = 100.0
    cutoff = 45.0
    nyq = 0.5 * fs
    normal_cutoff = cutoff / nyq
    b, a = butter(4, normal_cutoff, btype='low', analog=False)
    
    for col in columns:
        if col in simulated_df.columns:
            # Scale down
            signal = simulated_df[col] * damping_factor
            
            # Apply low-pass filter
            # Pad to handle edge artifacts
            padlen = min(len(signal) - 1, 150)
            if len(signal) > 15:
                signal = filtfilt(b, a, signal, padlen=padlen)
            
            # Add noise
            noise = np.random.normal(0, noise_std, size=len(signal))
            simulated_df[col] = signal + noise
            
    return simulated_df

def main():
    # Paths
    base_dir = r"d:\VIT\hackathon\Code2Create\github\data\sensor\A smartphone-based vibration dataset for induction"
    output_dir = r"d:\VIT\hackathon\Code2Create\github\data\sensor\cabin_simulated"
    
    # Create output dir if not exists
    os.makedirs(output_dir, exist_ok=True)
    
    # Classes
    classes = ['H', 'B1', 'B2', 'B3', 'V', 'R']
    
    # The columns in the CSV are separated by ';'
    # Target columns to modify: gX, gY, gZ, gUserX, gUserY, gUserZ
    target_columns = ['gX', 'gY', 'gZ', 'gUserX', 'gUserY', 'gUserZ']
    
    total_files = 0
    
    for cls in classes:
        cls_dir = os.path.join(base_dir, cls)
        out_cls_dir = os.path.join(output_dir, cls)
        
        if not os.path.exists(cls_dir):
            print(f"Warning: Directory {cls_dir} not found. Skipping.")
            continue
            
        os.makedirs(out_cls_dir, exist_ok=True)
        
        csv_files = glob.glob(os.path.join(cls_dir, "*.csv"))
        for csv_file in csv_files:
            file_name = os.path.basename(csv_file)
            out_file = os.path.join(out_cls_dir, file_name)
            
            print(f"Processing {cls}/{file_name}...")
            
            # Read CSV
            df = pd.read_csv(csv_file, sep=';')
            
            # Ensure columns don't have leading/trailing spaces
            df.columns = [c.strip() for c in df.columns]
            
            # Apply transformation
            simulated_df = simulate_cabin_damping(df, target_columns)
            
            # Save to new location
            simulated_df.to_csv(out_file, sep=';', index=False)
            total_files += 1
            
    print(f"\nDone! Processed {total_files} CSV files.")
    print(f"Simulated data saved to: {output_dir}")

if __name__ == "__main__":
    main()
