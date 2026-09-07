# Scenario Report: Coolant System Leak

**Type:** Fault  
**Generated:** 2026-09-07 23:52:29  
**CSV:** `d:\VIT\hackathon\Code2Create\github\data\test_scenarios\fault_coolant_leak.csv`  
**Duration:** 7200 s (2 hours) at 1 Hz  

---

## Inference Result

| Field | Value |
|-------|-------|
| Status | **ANOMALY** |
| Criticality | CRITICAL |
| Peak MSE Score | 1.5287 |
| Threshold | 0.0613 |
| MSE / Threshold ratio | 24.93x |
| First breach at | 50 s (0.8 min) |
| Sustained breach from | 50 s (0.8 min) |
| Root cause sensor | `coolant_temp_C` |
| Failing component | Radiator / Cooling System |

## Actual live_telemetry.json Output

This is the real output the system produced — passed to the 3D UI:

```json
{
  "time_s": 6934.0,
  "status": "ANOMALY",
  "title": "CRITICAL COMPONENT FAILURE DETECTED",
  "criticality": "CRITICAL",
  "mse_score": 1.5286661386489868,
  "threshold": 0.061308339238166795,
  "root_cause_sensor": "coolant_temp_C",
  "failing_component": "Radiator / Cooling System",
  "description": "Autoencoder detected deviation in coolant_temp_C. Highlight the Radiator / Cooling System."
}
```

## 3D UI Action

- **Highlight component:** Radiator / Cooling System
- **Alert color:** Red (CRITICAL)
- **Description for tooltip/TTS:** _Autoencoder detected deviation in coolant_temp_C. Highlight the Radiator / Cooling System._

## MSE Statistics

```
  Peak MSE Score          : 1.5287
  Avg MSE (full drive)    : 0.4671
  Avg MSE (first 60 min)  : 0.1090
  Avg MSE (after 60 min)  : 0.8205
  Threshold               : 0.0613
  % of drive above thresh : 94.6%
```

## Data Generation Log

```
============================================================
SCENARIO: Coolant System Leak
============================================================
  Saved 7200 rows -> d:\VIT\hackathon\Code2Create\github\data\test_scenarios\fault_coolant_leak.csv
  Report  -> d:\VIT\hackathon\Code2Create\github\data\test_scenarios\fault_coolant_leak_report.md
  Healthy temp  (final): 117.7 C
  Faulty  temp  (final): 133.3 C
  Healthy press (final): 16.59 PSI
  Faulty  press (final): 13.07 PSI
  Leak severity (final): 0.932
============================================================
```
