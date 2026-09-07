import os
import numpy as np
import pandas as pd
from scipy.ndimage import gaussian_filter1d

def generate_driving_data(duration_seconds=7200, sample_rate=10, is_anomaly=False):
    """
    Generates synthetic multivariate time-series data mimicking a 2-hour car drive.
    duration_seconds: 7200s (2 hours)
    sample_rate: 10 Hz
    Total samples: 72,000
    """
    num_samples = duration_seconds * sample_rate
    t = np.linspace(0, duration_seconds, num_samples)
    
    # --- 1. Speed Profile (City -> Highway -> Traffic -> Suburbs) ---
    speed = np.zeros(num_samples)
    
    # City (0-1000s): Stop and go
    speed[:10000] = np.abs(np.sin(2*np.pi*t[:10000]/60) * 35) + np.random.normal(0, 2, 10000)
    # Highway (1000s-4000s): Fast cruising
    speed[10000:40000] = 70 + np.sin(2*np.pi*t[10000:40000]/300) * 10 + np.random.normal(0, 1, 30000)
    # Traffic (4000s-5000s): Stop and go, very slow
    speed[40000:50000] = np.abs(np.sin(2*np.pi*t[40000:50000]/30) * 15) + np.random.normal(0, 1, 10000)
    # Suburbs (5000s-7200s): Medium speeds
    speed[50000:] = 45 + np.sin(2*np.pi*t[50000:]/120) * 15 + np.random.normal(0, 2, 22000)
    
    speed = gaussian_filter1d(speed, sigma=20) # Smooth out the speed curve
    speed = np.clip(speed, 0, 100)
    
    # --- 2. Incline Profile (Hills) ---
    incline = np.zeros(num_samples)
    # Big hill at 6000s (suburbs)
    incline[60000:65000] = np.sin(np.linspace(0, np.pi, 5000)) * 10 # 10 degree incline
    
    # --- 3. Engine RPM ---
    # RPM is tied to speed, but idle is 800. Incline adds massive load.
    rpm = 800 + (speed * 30) + (incline * 150)
    rpm = rpm % 3500 # Simulate gear shifts
    rpm = np.where(speed < 5, 800, rpm + 1000) # Base running RPM
    rpm = rpm + np.random.normal(0, 50, num_samples)
    rpm = gaussian_filter1d(rpm, sigma=10)
    
    # --- 4. Acoustic dB ---
    # Base engine noise + tire noise + braking squeals
    acceleration = np.gradient(speed)
    braking = np.where(acceleration < -0.1, 1, 0)
    
    acoustic = 55 + (rpm / 100) + (speed / 5)
    acoustic += braking * 10 # Brake squeal
    acoustic += np.random.normal(0, 2, num_samples)
    
    # --- 5. Vibration ---
    vibration = 0.01 + (rpm / 15000) + (speed / 1000)
    vibration += np.random.normal(0, 0.005, num_samples)
    
    # --- 6. Engine Temp ---
    # Climbs to 90, traffic and hills push it to 95-100
    temp = 90 - 50 * np.exp(-t / 300) 
    # Add heat from traffic (low speed, high time) and hills
    temp[40000:50000] += np.linspace(0, 8, 10000) # Traffic heat soak
    temp += incline * 0.5
    temp += np.random.normal(0, 0.5, num_samples)
    
    # --- 7. Coolant & Alternator ---
    coolant_pressure = np.full(num_samples, 15.0) + np.random.normal(0, 0.2, num_samples)
    alternator_voltage = np.full(num_samples, 14.2) + np.random.normal(0, 0.1, num_samples)
    
    # --- INJECT SPUTTERING ANOMALY ---
    if is_anomaly:
        # Anomaly starts exactly at 1 hour (3600 seconds)
        anomaly_start = 3600 * sample_rate
        time_rem = num_samples - anomaly_start
        
        # Sputtering coolant leak: We will use a random walk (Brownian motion) for chaotic drops
        random_walk = np.cumsum(np.random.normal(0, 0.05, time_rem))
        # Add intermittent sharp drops (air bubbles in the line)
        sharp_drops = np.where(np.random.random(time_rem) > 0.98, np.random.uniform(0, 5, time_rem), 0)
        downward_trend = np.linspace(0, 8, time_rem) # Base total pressure drop
        
        coolant_pressure[anomaly_start:] -= (downward_trend + random_walk + sharp_drops)
        coolant_pressure = np.clip(coolant_pressure, 0, 20)
        
        # Temp spikes aggressively in response, but with heavy, chaotic noise, not a sine wave
        temp_trend = 0.002 * (np.linspace(0, time_rem, time_rem) ** 1.05)
        temp_noise = np.cumsum(np.random.normal(0, 0.2, time_rem)) # Temperature wanders chaotically
        temp[anomaly_start:] += (temp_trend + temp_noise)
        
        # Engine starts misfiring (Vibration spikes violently and randomly)
        # 5% chance of a massive misfire at any given tenth of a second
        misfire = np.where(np.random.random(time_rem) > 0.95, np.random.uniform(0.1, 0.5, time_rem), 0)
        vibration[anomaly_start:] += misfire

    df = pd.DataFrame({
        'Time_s': t,
        'Vehicle_Speed_mph': speed,
        'Engine_RPM': rpm,
        'Acoustic_dB': acoustic,
        'Vibration_g': vibration,
        'Engine_Temp_C': temp,
        'Coolant_Pressure_PSI': coolant_pressure,
        'Alternator_Voltage_V': alternator_voltage
    })
    
    return df

def main():
    output_dir = r"d:\VIT\hackathon\Code2Create\github\data\calibration"
    os.makedirs(output_dir, exist_ok=True)
    
    print("Generating 2-Hour Baseline (Healthy) Calibration Drive...")
    baseline_df = generate_driving_data(is_anomaly=False)
    baseline_df.to_csv(os.path.join(output_dir, "baseline_drive.csv"), index=False)
    
    print("Generating 2-Hour Live Monitoring 'Sputtering' Anomaly Drive...")
    anomaly_df = generate_driving_data(is_anomaly=True)
    anomaly_df.to_csv(os.path.join(output_dir, "anomaly_drive.csv"), index=False)
    
    print(f"Data successfully generated in {output_dir}")

if __name__ == "__main__":
    main()
