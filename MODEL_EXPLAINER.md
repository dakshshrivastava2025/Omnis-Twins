# Omnis-Twins — ML System Explainer
### For Final Review Prep

---

## The Big Idea in One Sentence

> We train a neural network **only on healthy driving data**. At runtime, if the car's sensors produce a pattern the model has never seen during normal operation, it fails to reconstruct it — and that failure (measured as MSE) is the anomaly signal.

---

## 1. What Type of Model Is This?

**Unsupervised Autoencoder** — a fully-connected autoencoder applied to sliding windows of multivariate time-series sensor data.

**Unsupervised** means:
- We never label data as "fault" or "normal"
- There are no fault examples in training at all
- The model figures out what "normal" looks like on its own

This is powerful because:
- You do not need a database of every possible fault type
- It can catch faults it was never shown
- It works on any car using the same OBD-II sensors

---

## 2. Architecture — autoencoder.py

```
Input: (batch_size, 50 timesteps, 7 sensors)
         |  flatten
     350 numbers
         |
  Linear(350 to 128) + ReLU
         |
  Linear(128 to 64)  + ReLU
         |
  Linear(64 to 16)   <-- BOTTLENECK (the compressed representation)
         |
  Linear(16 to 64)   + ReLU
         |
  Linear(64 to 128)  + ReLU
         |
  Linear(128 to 350)
         |  reshape
Output: (batch_size, 50 timesteps, 7 sensors)
```

### Key variables in autoencoder.py

| Variable | What it is |
|----------|-----------|
| num_sensors | Number of input sensors (7 in our case) |
| sequence_length | How many timesteps per window (50 = 50 seconds at 1 Hz) |
| input_dim | num_sensors x sequence_length = 350 (the flattened input size) |
| encoder | The compression half: 350 to 16 numbers |
| decoder | The reconstruction half: 16 to 350 numbers |
| encoded | The bottleneck vector (16 numbers): compressed "fingerprint" of the 50-second window |
| decoded | Reconstructed output: model's best guess at what the input was |
| x_flat | Input reshaped from (batch, 50, 7) to (batch, 350) for the linear layers |

### Why the bottleneck?
16 numbers must summarize 350 numbers. The model is **forced to learn structure** — the correlations between sensors — because there is not enough room to memorize. If RPM + speed + throttle + load always move together, the model encodes that relationship in 16 numbers and can reconstruct it. If they decouple (fault), the encoding breaks and reconstruction fails.

---

## 3. Training — train_calibration.py

### What happens

1. **Load healthy data** — 3 x 7200 rows = 21,600 rows covering:
   - baseline_drive.csv: normal city driving (~65 kph, ~1800 RPM)
   - edge_mountain_drive.csv: high load, moderate speed (uphill)
   - edge_aggressive_highway.csv: high speed, high RPM, burst throttle

2. **Normalize (StandardScaler)** — each sensor scaled to mean=0, std=1. Prevents RPM (0-5000) from dominating over pressure (10-17) in the loss function.

3. **Sliding windows** — 21,600 rows sliced into overlapping 50-timestep windows. Each window is one training sample.

4. **Train** — 20 epochs. Model tries to reconstruct each window from its 16-number bottleneck. Loss = MSE between input and reconstruction.

5. **Compute threshold** — after training, run model over all training windows, record MSE for each. Take the 99th percentile. Save as threshold.joblib.

### Why 99th percentile (not 95th)?
- 95th percentile means 5% of normal training windows exceed it. In a 2-hour drive that is 6 minutes of false alarms.
- 99th percentile: only 1% of normal windows exceed it. Brief spikes (hard acceleration) are in that 1% and get ignored.

### Key variables in train_calibration.py

| Variable | What it is |
|----------|-----------|
| SEQ_LEN = 50 | Window size: model sees 50 seconds at a time |
| BATCH_SIZE = 64 | Number of windows processed per gradient step |
| EPOCHS = 20 | Full passes over the training data |
| scaler | StandardScaler fit on training data: saved to scaler.joblib |
| criterion | nn.MSELoss() — the loss function |
| optimizer | Adam with lr=0.001 — adaptive gradient descent |
| cal_mse_scores | List of reconstruction MSE for every training window |
| threshold | 99th percentile of cal_mse_scores — saved to threshold.joblib |

### Saved artifacts after training
```
models/anomaly_detector/
  autoencoder.pth      <- model weights
  scaler.joblib        <- normalization parameters (mean, std per sensor)
  model_config.joblib  <- sensor column names + SEQ_LEN + num_sensors
  threshold.joblib     <- the anomaly threshold (single float, 99th pct)
```

---

## 4. Inference — inference_anomaly.py

### What happens at runtime

1. Load the 4 saved artifacts above
2. Load the scenario CSV (the drive to analyze)
3. Normalize using the SAVED scaler (not refit — same scale as training)
4. Slide the window across the entire drive, running the model on each 50-second chunk
5. Compute MSE at each timestep: how badly did the model fail to reconstruct?
6. Sustained breach detection: check if MSE stays above threshold for 60+ consecutive seconds
7. Root cause analysis: if anomaly found, find which sensor had the highest per-sensor reconstruction error
8. Write live_telemetry.json for the 3D UI

### The sustained breach logic

```
Normal acceleration burst:    MSE spikes for 10-30 seconds then drops -> IGNORED
Coolant leak after 60 min:    MSE elevated continuously for 30+ min -> ANOMALY FLAGGED
```

Brief spikes = driving events. Sustained elevation = something is structurally wrong.

### Key variables in inference_anomaly.py

| Variable | What it is |
|----------|-----------|
| THRESHOLD | Loaded from threshold.joblib: the 99th percentile from calibration |
| SUSTAINED_MIN_S = 60 | Must stay above threshold for 60 continuous seconds |
| mse_scores | Per-timestep reconstruction MSE across the full drive |
| feature_errors | Per-sensor MSE at each timestep (7 values per step) |
| mse_arr | Numpy array of mse_scores |
| best_start_idx | Timestep where the sustained breach started |
| best_peak_idx | Timestep of the highest MSE within the breach |
| best_peak_mse | Peak MSE value during the breach |
| worst_sensor_idx | Index of the sensor with highest reconstruction error |
| worst_sensor_name | Name of that sensor, e.g. coolant_pressure_PSI |
| failing_component | Vehicle part from COMPONENT_MAP |
| criticality | CRITICAL (>3x threshold) / HIGH (>1.5x) / WARNING (>1x) |
| is_anomaly | True if any sustained breach >= 60s was found |

### COMPONENT_MAP

| Sensor | 3D UI Highlight Target |
|--------|----------------------|
| rpm | Engine Block / Transmission |
| speed_kph | Wheels / Transmission |
| throttle_pos | Throttle Body |
| engine_load | Engine Block |
| coolant_temp_C | Radiator / Cooling System |
| coolant_pressure_PSI | Radiator / Coolant Lines |
| intake_air_temp_C | Air Intake System |

---

## 5. The 7 Sensors

| Sensor | OBD-II PID | What it measures | Healthy range |
|--------|-----------|-----------------|---------------|
| rpm | 010C | Engine crankshaft rotations per minute | 600-3500 |
| speed_kph | 010D | Vehicle speed from wheel sensors | 0-150 kph |
| throttle_pos | 0111 | How far the throttle plate is open | 0-100% |
| engine_load | 0104 | How hard the engine is working vs max capacity | 15-75% |
| coolant_temp_C | 0105 | Temperature of coolant fluid in engine | 75-115 C |
| intake_air_temp_C | 010F | Temperature of air entering the engine | 10-50 C |
| coolant_pressure_PSI | N/A | Coolant system pressure (added ~$20 transducer) | 10-17 PSI |

---

## 6. How Each Fault Is Detected

The autoencoder detects **broken correlations**, not individual sensor thresholds.

### Coolant System Leak
- Fluid leaks out -> pressure drops -> less coolant -> engine overheats
- Broken: coolant_temp_C RISES while coolant_pressure_PSI FALLS simultaneously
- In healthy driving these always move together (both driven by engine load)
- "High temp + low pressure" is unreconstrucible -> high MSE

### Oil Pump Degradation
- Pump wears -> less lubrication -> metal friction -> extra heat
- Broken: coolant_temp_C rises faster than engine_load + rpm would predict
- Model learned "temp = f(load, rpm)". Friction adds load-independent heat -> MSE rises

### Alternator Failure
- Failing alternator draws extra mechanical torque (parasitic drag)
- Broken: engine_load rises WITHOUT corresponding throttle_pos or speed_kph increase
- Model sees "high load, normal throttle, normal speed" — never seen this -> MSE rises

### Serpentine Belt Slip
- Belt slips -> water pump underspeeds -> less coolant flow -> temp rises
- Three broken correlations simultaneously:
  1. coolant_temp rises faster than rpm implies
  2. coolant_pressure shows random dips (pump loses prime)
  3. throttle/load tick up without speed gain (power lost to slip)

### Edge Case: Mountain Driving (should NOT trigger)
- All sensors elevated but TOGETHER: high throttle + high load + high RPM + elevated temp + elevated pressure
- Model learned this pattern during training
- Correlations intact -> low MSE -> HEALTHY

### Edge Case: Aggressive Highway (should NOT trigger)
- Hard acceleration: all sensors spike simultaneously then recover together
- Brief MSE spikes during bursts do not sustain 60 seconds -> HEALTHY

---

## 7. Full Pipeline (run order matters)

```
Step 1: python src/preprocessing/chatgpt_code.py
        Generates: data/calibration/baseline_drive.csv
                   data/calibration/anomaly_drive.csv

Step 2: python src/test_scenarios/edge_mountain_drive.py
        python src/test_scenarios/edge_aggressive_highway.py
        Generates: edge case CSVs needed for training

Step 3: python src/models/anomaly_detector/train_calibration.py
        Reads:     baseline + mountain + highway CSVs
        Saves:     autoencoder.pth, scaler.joblib,
                   model_config.joblib, threshold.joblib

Step 4: python src/test_scenarios/run_all_scenarios.py
        Generates: all 6 fault/edge CSVs
        Runs:      inference on each
        Saves:     _report.md for each, live_telemetry.json

Step 5: python src/utils/plot_anomalies.py
        Plots MSE over time for visual verification
```

---

## 8. Review Q&A

**Q: Why unsupervised? Why not just set thresholds on each sensor?**
Per-sensor thresholds miss subtle faults. Coolant pressure at 12 PSI is within range — but if temperature is simultaneously 130 C, that combination is physically impossible in a healthy system. The autoencoder detects broken relationships, not just broken values.

**Q: Why 50-second windows?**
Short enough to catch faults quickly. Long enough to see multi-sensor correlations develop. At 1 Hz, 50 timesteps give enough context to assess where things are heading.

**Q: Why 60-second sustained breach?**
Real faults are progressive — they get worse over minutes. Normal events (hard acceleration, gear shifts) resolve in seconds. The 60-second gate filters transient events while catching real degradation.

**Q: Why the 99th percentile threshold?**
95th percentile means 5% of normal samples exceed it — 6 minutes of false alarms per 2-hour drive. 99th percentile: even extreme-but-healthy events barely exceed it briefly.

**Q: Why StandardScaler?**
RPM ranges 0-5000. Coolant pressure ranges 10-17. Without normalization, RPM dominates the loss function. After scaling to mean=0 std=1, every sensor contributes equally to reconstruction error.

**Q: What does the bottleneck (16 numbers) actually represent?**
A compressed driving fingerprint. The model learns to pack all information needed to reconstruct 350 numbers into just 16. It implicitly encodes things like "accelerating on highway" or "going uphill" as patterns in those 16 values.
