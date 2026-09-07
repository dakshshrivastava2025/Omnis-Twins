# Scenario Report: Aggressive Highway Drive

**Type:** Edge Case  
**Generated:** 2026-09-07 23:46:49  
**CSV:** `d:\VIT\hackathon\Code2Create\github\data\test_scenarios\edge_aggressive_highway.csv`  
**Duration:** 7200 s (2 hours) at 1 Hz  

---

## Inference Result

| Field | Value |
|-------|-------|
| Status | **ANOMALY** |
| Criticality | CRITICAL |
| Peak MSE Score | 6.0577 |
| Threshold | 0.0327 |
| MSE / Threshold ratio | 185.04x |
| First breach at | 50 s (0.8 min) |
| Sustained breach from | 50 s (0.8 min) |

## Actual live_telemetry.json Output

This is the real output the system produced — passed to the 3D UI:

```json
{
  "time_s": 229.0,
  "status": "ANOMALY",
  "title": "CRITICAL COMPONENT FAILURE DETECTED",
  "criticality": "CRITICAL",
  "mse_score": 6.057708263397217,
  "threshold": 0.03273742515593767,
  "root_cause_sensor": "throttle_pos",
  "failing_component": "Throttle Body",
  "description": "Autoencoder detected deviation in throttle_pos. Highlight the Throttle Body."
}
```

## 3D UI Action

- **No component highlight** — system displays green / nominal state.
- **Status:** ANOMALY

## MSE Statistics

```
  Peak MSE Score          : 6.0577
  Avg MSE (full drive)    : 2.7913
  Avg MSE (first 60 min)  : 2.7374
  Avg MSE (after 60 min)  : 2.8444
  Threshold               : 0.0327
  % of drive above thresh : 100.0%
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
