# Omnis-Twins — Anomaly Detection System: Test Scenario Report

**Generated:** 2026-09-07  
**Branch:** `feature/model-development`  
**Model:** Unsupervised LSTM Autoencoder  
**Training data:** `data/calibration/baseline_drive.csv` (7200 samples, 2h normal drive at 1 Hz)

---

## 1. System Overview

The anomaly detector is an **unsupervised autoencoder** trained exclusively on normal (healthy) vehicle telemetry. It learns the statistical correlations between sensors during healthy operation. When presented with live data, it tries to reconstruct the sensor readings. A high reconstruction error (MSE) means the sensor pattern is one the model has never seen during normal operation — i.e., a fault.

```
Live Sensor Feed (CSV / OBD-II stream)
         │
         ▼
   [ Scaler (normalize) ]
         │
         ▼
   [ LSTM Autoencoder ]
         │
     Reconstruct
         │
         ▼
   [ MSE per timestep ]
         │
    Compare to threshold
         │
    ┌────┴────┐
    │ ANOMALY │  → live_telemetry.json  → 3D UI / Alert System
    └─────────┘
```

---

## 2. Downstream JSON Output Contract

Every inference run writes `models/anomaly_detector/live_telemetry.json`.
This is what the **3D UI / alert system / dashboard** must consume.

### Schema

```json
{
  "time_s": 7133.0,
  "status": "ANOMALY",
  "title": "CRITICAL COMPONENT FAILURE DETECTED",
  "criticality": "CRITICAL",
  "mse_score": 1.2483,
  "threshold": 0.0586,
  "root_cause_sensor": "coolant_pressure_PSI",
  "failing_component": "Radiator / Coolant Lines",
  "description": "Autoencoder detected deviation in coolant_pressure_PSI. Highlight the Radiator / Coolant Lines."
}
```

### Field Reference

| Field | Type | Description |
|-------|------|-------------|
| `time_s` | float | Timestamp (seconds from drive start) when max anomaly was detected |
| `status` | string | `"ANOMALY"` or `"HEALTHY"` |
| `title` | string | Human-readable alert title for UI display |
| `criticality` | string | `"CRITICAL"` (>2× threshold), `"HIGH"` (>1.5×), `"WARNING"` (>1×), `"NONE"` |
| `mse_score` | float | Peak reconstruction error score |
| `threshold` | float | Dynamic threshold (95th percentile of calibration MSE) |
| `root_cause_sensor` | string | Sensor with highest individual reconstruction error |
| `failing_component` | string | Vehicle component mapped from root cause sensor |
| `description` | string | Natural language description for UI tooltip / speech |

### Status: HEALTHY example

```json
{
  "time_s": 7200.0,
  "status": "HEALTHY",
  "title": "SYSTEM NORMAL",
  "criticality": "NONE",
  "mse_score": 0.031,
  "threshold": 0.0586
}
```

---

## 3. Sensor → Component Mapping

Used by the 3D UI to **highlight the failing component** on the vehicle model.

| Sensor | Vehicle Component (3D Highlight Target) |
|--------|----------------------------------------|
| `rpm` | Engine Block / Transmission |
| `speed_kph` | Wheels / Transmission |
| `throttle_pos` | Throttle Body |
| `engine_load` | Engine Block |
| `coolant_temp_C` | Radiator / Cooling System |
| `coolant_pressure_PSI` | Radiator / Coolant Lines |
| `intake_air_temp_C` | Air Intake System |

---

## 4. Sensor Specifications

All sensors are **OBD-II standard** (available in all cars >= 1996) except coolant pressure which requires a simple attachment.

| Sensor | OBD-II PID | Unit | Healthy Range | Notes |
|--------|-----------|------|---------------|-------|
| `rpm` | `010C` | RPM | 600 – 3500 | Standard OBD-II |
| `speed_kph` | `010D` | kph | 0 – 150 | Standard OBD-II |
| `throttle_pos` | `0111` | % | 0 – 100 | Standard OBD-II |
| `engine_load` | `0104` | % | 15 – 75 | Standard OBD-II |
| `coolant_temp_C` | `0105` | °C | 75 – 115 | Standard OBD-II |
| `intake_air_temp_C` | `010F` | °C | 10 – 50 | Standard OBD-II |
| `coolant_pressure_PSI` | N/A | PSI | 10 – 17 | ~$20 pressure transducer on coolant line |

> **Planned addition:** `acoustic_dB` — RMS amplitude from a microphone, 1 sample/sec.
> Requires FFT preprocessing before feeding to autoencoder. Especially useful for belt slip (audible squeal).
> Will require retraining on updated calibration data including this column.

---

## 5. Test Scenario Results

### Summary

| # | Scenario | Type | Result | Peak Severity |
|---|----------|------|--------|---------------|
| 1 | Coolant System Leak | Fault | ✅ Generated | Leak severity: 0.932 |
| 2 | Oil Pump Degradation | Fault | ✅ Generated | Oil starvation: 0.900 |
| 3 | Alternator Diode Failure | Fault | ✅ Generated | Alt drag: 0.730 |
| 4 | Serpentine Belt Slip | Fault | ✅ Generated | Belt slip: 0.775 |
| 5 | Mountain / Uphill Drive | Edge Case | ✅ Generated | Correlated — expect LOW MSE |
| 6 | Aggressive Highway Drive | Edge Case | ✅ Generated | Correlated — expect LOW MSE |

---

### Fault 1 — Coolant System Leak

**Broken correlation:** Coolant temperature RISES while pressure FALLS (anti-correlated with healthy behavior).  
**Fault start:** 60 minutes. Clear breach expected ~30 min later.

```
Healthy temp  (final): 117.7 C
Faulty  temp  (final): 133.3 C    (+15.6 C above healthy)
Healthy press (final): 16.59 PSI
Faulty  press (final): 13.07 PSI  (-3.52 PSI below healthy)
Leak severity (final): 0.932
```

---

### Fault 2 — Oil Pump Degradation

**Broken correlation:** Coolant temperature rises faster than engine_load/RPM would predict (extra friction heat source).  
**Fault start:** 60 minutes. Steady MSE climb expected from ~70 min.

```
Healthy temp  (final): 118.5 C
Faulty  temp  (final): 119.6 C    (subtle but consistent excess)
Oil starvation (final): 0.900
```

---

### Fault 3 — Alternator Diode Failure

**Broken correlation:** engine_load rises WITHOUT corresponding throttle or speed increase (parasitic alternator drag).  
**Fault start:** 60 minutes. MSE rise expected ~75 min.

```
Healthy load  (final avg): 42.1%
Faulty  load  (final avg): 51.9%  (+9.8% unexplained load increase)
Healthy temp  (final):     119.7 C
Faulty  temp  (final):     123.0 C
Alt drag severity (final): 0.730
```

---

### Fault 4 — Serpentine Belt Slip

**Broken correlations:** Coolant temp rises faster than RPM implies (water pump slips). Coolant pressure shows erratic dips. Throttle/load tick up without speed gain.  
**Fault start:** 60 minutes. Erratic MSE spikes expected from ~65 min.

```
Healthy temp  (final):      120.0 C
Faulty  temp  (final):      132.7 C    (+12.7 C)
Belt slip severity (final): 0.775
```

---

### Edge Case 1 — Mountain / Uphill Drive

**Why it should NOT trigger:** All sensors rise together in a physically consistent way (high throttle → high load → high RPM → elevated temp → elevated pressure). Correlations are intact.

```
Avg engine load : 79.3%   (vs ~42% on flat road)
Avg RPM         : 2794    (vs ~1800 normal)
Avg coolant temp: 108.0 C
Max coolant temp: 118.0 C
Avg speed       : 54.3 kph
-> All sensors correlated — expect LOW MSE
```

---

### Edge Case 2 — Aggressive Highway Drive

**Why it should NOT trigger:** Hard acceleration bursts cause ALL sensors to spike simultaneously then recover together. No broken correlations — just elevated but consistent values.

```
Avg speed       : 133.1 kph  (normal ~65)
Max speed       : 200.0 kph
Avg RPM         : 3280
Max RPM         : 5539
Avg coolant temp: 115.5 C
Max coolant temp: 120.0 C
Burst events    : 16
-> All sensors burst and recover together — expect LOW sustained MSE
```

---

## 6. File Structure

```
data/
  calibration/
    baseline_drive.csv          <- Autoencoder training data (healthy 2h drive)
    anomaly_drive.csv           <- Default fault demo (coolant leak)
  test_scenarios/
    fault_coolant_leak.csv      <- Fault: temp up + pressure down
    fault_oil_pressure.csv      <- Fault: friction heat breaks temp/load correlation
    fault_alternator.csv        <- Fault: load up without throttle/speed up
    fault_belt_slip.csv         <- Fault: erratic pressure + temp rises faster than RPM
    edge_mountain_drive.csv     <- Edge: high load, all sensors correlated (no fault)
    edge_aggressive_highway.csv <- Edge: high speed bursts, all correlated (no fault)
    scenario_report.md          <- This file

models/
  anomaly_detector/
    autoencoder.pth             <- Trained model weights
    scaler.joblib               <- Input normalizer (fit on calibration data)
    model_config.joblib         <- Sequence length, num_sensors, sensor_cols
    live_telemetry.json         <- OUTPUT consumed by 3D UI / downstream systems
    inference_results.csv       <- Full timestep-by-timestep MSE scores (for plotting)

src/
  preprocessing/
    chatgpt_code.py             <- Main synthetic data generator
  models/anomaly_detector/
    autoencoder.py              <- Model architecture
    train_calibration.py        <- Training script
    inference_anomaly.py        <- Inference + writes live_telemetry.json
  test_scenarios/
    scenario_utils.py           <- Shared helpers
    fault_coolant_leak.py
    fault_oil_pressure.py
    fault_alternator.py
    fault_belt_slip.py
    edge_mountain_drive.py
    edge_aggressive_highway.py
    run_all_scenarios.py        <- Runs all 6 and regenerates this report
  utils/
    plot_anomalies.py           <- Plots MSE over time
```

---

## 7. Pipeline — How to Run End to End

```powershell
# Step 1: Generate calibration + default fault data
python src/preprocessing/chatgpt_code.py

# Step 2: Train autoencoder on healthy baseline
python src/models/anomaly_detector/train_calibration.py

# Step 3: Run inference (edit anomaly_data_path in inference_anomaly.py for different scenarios)
python src/models/anomaly_detector/inference_anomaly.py

# Step 4: Plot MSE over time
python src/utils/plot_anomalies.py

# Step 5: Generate all test scenario CSVs + regenerate this report
python src/test_scenarios/run_all_scenarios.py
```

---

## 8. What the Rest of the System Needs to Know

### 3D UI Team
- Read `models/anomaly_detector/live_telemetry.json` after each inference run
- Use `failing_component` to determine which 3D model part to highlight
- Use `criticality` for alert color: `CRITICAL` = red, `HIGH` = orange, `WARNING` = yellow
- Use `description` for tooltip / TTS speech output

### Dashboard / Frontend Team
- Full timestep MSE data is in `models/anomaly_detector/inference_results.csv`
- Columns: `Time_s`, `MSE_Score`, `Threshold`
- Plot as a live-updating chart during a drive simulation

### Future Sensor Expansion
- To add sensors: update `chatgpt_code.py` schema → retrain → update `COMPONENT_MAP` in `inference_anomaly.py`
- **Planned next:** `acoustic_dB` (microphone RMS level) for belt/bearing fault detection