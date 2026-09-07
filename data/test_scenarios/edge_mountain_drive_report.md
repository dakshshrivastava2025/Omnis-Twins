# Scenario Report: Mountain / Uphill Drive

**Type:** Edge Case  
**Generated:** 2026-09-07 23:52:49  
**CSV:** `d:\VIT\hackathon\Code2Create\github\data\test_scenarios\edge_mountain_drive.csv`  
**Duration:** 7200 s (2 hours) at 1 Hz  

---

## Inference Result

| Field | Value |
|-------|-------|
| Status | **HEALTHY** |
| Criticality | NONE |
| Peak MSE Score | 0.0075 |
| Threshold | 0.0613 |
| MSE / Threshold ratio | 0.12x |
| First breach at | Never |
| Sustained breach from | Never (or brief only) |

## Actual live_telemetry.json Output

This is the real output the system produced — passed to the 3D UI:

```json
{
  "time_s": 7199.0,
  "status": "HEALTHY",
  "title": "SYSTEM NORMAL",
  "criticality": "NONE",
  "mse_score": 0.007508569862693548,
  "threshold": 0.061308339238166795
}
```

## 3D UI Action

- **No component highlight** — system displays green / nominal state.
- **Status:** HEALTHY

## MSE Statistics

```
  Peak MSE Score          : 0.0215
  Avg MSE (full drive)    : 0.0092
  Avg MSE (first 60 min)  : 0.0097
  Avg MSE (after 60 min)  : 0.0087
  Threshold               : 0.0613
  % of drive above thresh : 0.0%
```

## Data Generation Log

```
============================================================
EDGE CASE: Mountain / Sustained Uphill Drive
============================================================
  Saved 7200 rows -> d:\VIT\hackathon\Code2Create\github\data\test_scenarios\edge_mountain_drive.csv
  Report  -> d:\VIT\hackathon\Code2Create\github\data\test_scenarios\edge_mountain_drive_report.md
  Avg engine load : 79.3%  (vs ~42% normal)
  Avg RPM         : 2794    (vs ~1800 normal)
  Avg coolant temp: 108.0 C
  Max coolant temp: 118.0 C
  Avg speed       : 54.3 kph
  -> All sensors correlated — expect LOW MSE
============================================================
```
