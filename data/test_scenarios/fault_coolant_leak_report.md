# Scenario Report: Coolant System Leak

**Type:** Fault  
**Generated:** 2026-09-08 00:05:46  
**CSV:** `d:\VIT\hackathon\Code2Create\github\data\test_scenarios\fault_coolant_leak.csv`  
**Duration:** 7200 s (2 hours) at 1 Hz  

---

## Inference Result

| Field | Value |
|-------|-------|
| Status | **ANOMALY** |
| Criticality | CRITICAL |
| Peak MSE Score | 1.8327 |
| Threshold | 0.0748 |
| MSE / Threshold ratio | 24.50x |
| First breach at | 50 s (0.8 min) |
| Sustained breach from | 50 s (0.8 min) |
| Root cause sensor | `intake_air_temp_C` |
| Failing component | Air Intake System |

## Actual live_telemetry.json Output

This is the real output the system produced — passed to the 3D UI:

```json
{
  "time_s": 2957.0,
  "status": "ANOMALY",
  "title": "CRITICAL COMPONENT FAILURE DETECTED",
  "criticality": "CRITICAL",
  "mse_score": 1.8326759338378906,
  "threshold": 0.07481302946805951,
  "root_cause_sensor": "intake_air_temp_C",
  "failing_component": "Air Intake System",
  "description": "Autoencoder detected sustained deviation in intake_air_temp_C. Highlight the Air Intake System."
}
```

## 3D UI Action

- **Status: ANOMALY detected**
- **Highlight component:** Air Intake System
- **Alert color:** 🔴 Red (CRITICAL)
- **Description for tooltip/TTS:** _Autoencoder detected sustained deviation in intake_air_temp_C. Highlight the Air Intake System._

## MSE Statistics

```
  Peak MSE Score          : 1.8327
  Avg MSE (full drive)    : 0.6442
  Avg MSE (first 60 min)  : 0.1525
  Avg MSE (after 60 min)  : 1.1294
  Threshold               : 0.0748
  % of drive above thresh : 91.8%
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
