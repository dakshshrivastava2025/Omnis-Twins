# Scenario Report: Aggressive Highway Drive

**Type:** Edge Case  
**Generated:** 2026-09-08 00:06:13  
**CSV:** `d:\VIT\hackathon\Code2Create\github\data\test_scenarios\edge_aggressive_highway.csv`  
**Duration:** 7200 s (2 hours) at 1 Hz  

---

## Inference Result

| Field | Value |
|-------|-------|
| Status | **HEALTHY** |
| Criticality | NONE |
| Peak MSE Score | 0.1478 |
| Threshold | 0.0748 |
| MSE / Threshold ratio | 1.98x |
| First breach at | 174 s (2.9 min) |
| Sustained breach from | Never (or brief only) |

## Actual live_telemetry.json Output

This is the real output the system produced — passed to the 3D UI:

```json
{
  "time_s": 7199.0,
  "status": "HEALTHY",
  "title": "SYSTEM NORMAL",
  "criticality": "NONE",
  "mse_score": 0.14783595502376556,
  "threshold": 0.07481302946805951
}
```

## 3D UI Action

- **Status: HEALTHY** ✅
- **No component highlight** — system displays green / nominal state.

## MSE Statistics

```
  Peak MSE Score          : 0.1478
  Avg MSE (full drive)    : 0.0540
  Avg MSE (first 60 min)  : 0.0539
  Avg MSE (after 60 min)  : 0.0541
  Threshold               : 0.0748
  % of drive above thresh : 5.5%
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
