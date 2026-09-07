# Scenario Report: Aggressive Highway Drive

**Type:** Edge Case  
**Generated:** 2026-09-07 23:52:55  
**CSV:** `d:\VIT\hackathon\Code2Create\github\data\test_scenarios\edge_aggressive_highway.csv`  
**Duration:** 7200 s (2 hours) at 1 Hz  

---

## Inference Result

| Field | Value |
|-------|-------|
| Status | **ANOMALY** |
| Criticality | HIGH |
| Peak MSE Score | 0.1270 |
| Threshold | 0.0613 |
| MSE / Threshold ratio | 2.07x |
| First breach at | 170 s (2.8 min) |
| Sustained breach from | Never (or brief only) |

## Actual live_telemetry.json Output

This is the real output the system produced — passed to the 3D UI:

```json
{
  "time_s": 970.0,
  "status": "ANOMALY",
  "title": "MAJOR ANOMALY DETECTED",
  "criticality": "HIGH",
  "mse_score": 0.12704519927501678,
  "threshold": 0.061308339238166795,
  "root_cause_sensor": "rpm",
  "failing_component": "Engine Block / Transmission",
  "description": "Autoencoder detected deviation in rpm. Highlight the Engine Block / Transmission."
}
```

## 3D UI Action

- **No component highlight** — system displays green / nominal state.
- **Status:** ANOMALY

## MSE Statistics

```
  Peak MSE Score          : 0.1270
  Avg MSE (full drive)    : 0.0530
  Avg MSE (first 60 min)  : 0.0530
  Avg MSE (after 60 min)  : 0.0529
  Threshold               : 0.0613
  % of drive above thresh : 20.7%
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
