# Scenario Report: Aggressive Highway Drive

**Type:** Edge Case  
**Generated:** 2026-09-07 23:59:21  
**CSV:** `d:\VIT\hackathon\Code2Create\github\data\test_scenarios\edge_aggressive_highway.csv`  
**Duration:** 7200 s (2 hours) at 1 Hz  

---

## Inference Result

| Field | Value |
|-------|-------|
| Status | **ANOMALY** |
| Criticality | HIGH |
| Peak MSE Score | 0.1356 |
| Threshold | 0.0618 |
| MSE / Threshold ratio | 2.19x |
| First breach at | 156 s (2.6 min) |
| Sustained breach from | Never (or brief only) |

## Actual live_telemetry.json Output

This is the real output the system produced — passed to the 3D UI:

```json
{
  "time_s": 1366.0,
  "status": "ANOMALY",
  "title": "MAJOR ANOMALY DETECTED",
  "criticality": "HIGH",
  "mse_score": 0.13564610481262207,
  "threshold": 0.06180388405919074,
  "root_cause_sensor": "rpm",
  "failing_component": "Engine Block / Transmission",
  "description": "Autoencoder detected deviation in rpm. Highlight the Engine Block / Transmission."
}
```

## 3D UI Action

- **Status: ANOMALY detected**
- **Highlight component:** Engine Block / Transmission
- **Alert color:** 🟠 Orange (HIGH)
- **Description for tooltip/TTS:** _Autoencoder detected deviation in rpm. Highlight the Engine Block / Transmission._

> ⚠️ **FALSE POSITIVE** — This is an edge case that should NOT be flagged.
> The model detected a pattern it hasn't learned as 'normal'.
> Fix: retrain with more diverse healthy data covering this operating mode.

## MSE Statistics

```
  Peak MSE Score          : 0.1356
  Avg MSE (full drive)    : 0.0535
  Avg MSE (first 60 min)  : 0.0537
  Avg MSE (after 60 min)  : 0.0533
  Threshold               : 0.0618
  % of drive above thresh : 22.2%
```

## Data Generation Log

```
============================================================
EDGE CASE: Aggressive Highway Driving
============================================================
  Saved 7200 rows -> d:\VIT\hackathon\Code2Create\github\data\test_scenarios\edge_aggressive_highway.csv
  Report  -> d:\VIT\hackathon\Code2Create\github\data\test_scenarios\edge_aggressive_highway_report.md
  Avg speed       : 133.1 kph  (normal ~65)
  Max speed       : 200.0 kph
  Avg RPM         : 3280
  Max RPM         : 5539
  Avg coolant temp: 115.5 C
  Max coolant temp: 120.0 C
  Burst events    : 16
  -> All sensors burst and recover together — expect LOW sustained MSE
============================================================
```
