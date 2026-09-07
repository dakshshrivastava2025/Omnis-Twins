# Scenario Report: Mountain / Uphill Drive

**Type:** Edge Case  
**Generated:** 2026-09-07 23:46:44  
**CSV:** `d:\VIT\hackathon\Code2Create\github\data\test_scenarios\edge_mountain_drive.csv`  
**Duration:** 7200 s (2 hours) at 1 Hz  

---

## Inference Result

| Field | Value |
|-------|-------|
| Status | **ANOMALY** |
| Criticality | CRITICAL |
| Peak MSE Score | 4.8806 |
| Threshold | 0.0327 |
| MSE / Threshold ratio | 149.08x |
| First breach at | 50 s (0.8 min) |
| Sustained breach from | 50 s (0.8 min) |

## Actual live_telemetry.json Output

This is the real output the system produced — passed to the 3D UI:

```json
{
  "time_s": 1147.0,
  "status": "ANOMALY",
  "title": "CRITICAL COMPONENT FAILURE DETECTED",
  "criticality": "CRITICAL",
  "mse_score": 4.880600452423096,
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
  Peak MSE Score          : 4.8806
  Avg MSE (full drive)    : 2.9432
  Avg MSE (first 60 min)  : 2.9110
  Avg MSE (after 60 min)  : 2.9749
  Threshold               : 0.0327
  % of drive above thresh : 100.0%
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
