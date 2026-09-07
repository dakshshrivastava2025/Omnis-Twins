# Scenario Report: Mountain / Uphill Drive

**Type:** Edge Case  
**Generated:** 2026-09-07 23:59:15  
**CSV:** `d:\VIT\hackathon\Code2Create\github\data\test_scenarios\edge_mountain_drive.csv`  
**Duration:** 7200 s (2 hours) at 1 Hz  

---

## Inference Result

| Field | Value |
|-------|-------|
| Status | **HEALTHY** |
| Criticality | NONE |
| Peak MSE Score | 0.0064 |
| Threshold | 0.0618 |
| MSE / Threshold ratio | 0.10x |
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
  "mse_score": 0.006378350779414177,
  "threshold": 0.06180388405919074
}
```

## 3D UI Action

- **Status: HEALTHY** ✅
- **No component highlight** — system displays green / nominal state.

## MSE Statistics

```
  Peak MSE Score          : 0.0228
  Avg MSE (full drive)    : 0.0091
  Avg MSE (first 60 min)  : 0.0096
  Avg MSE (after 60 min)  : 0.0085
  Threshold               : 0.0618
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
