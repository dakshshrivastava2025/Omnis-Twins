# Scenario Report: Oil Pump Degradation

**Type:** Fault  
**Generated:** 2026-09-07 23:46:27  
**CSV:** `d:\VIT\hackathon\Code2Create\github\data\test_scenarios\fault_oil_pressure.csv`  
**Duration:** 7200 s (2 hours) at 1 Hz  

---

## Inference Result

| Field | Value |
|-------|-------|
| Status | **ANOMALY** |
| Criticality | CRITICAL |
| Peak MSE Score | 3.9930 |
| Threshold | 0.0327 |
| MSE / Threshold ratio | 121.97x |
| First breach at | 50 s (0.8 min) |
| Sustained breach from | 50 s (0.8 min) |
| Root cause sensor | `intake_air_temp_C` |
| Failing component | Air Intake System |

## Actual live_telemetry.json Output

This is the real output the system produced — passed to the 3D UI:

```json
{
  "time_s": 3790.0,
  "status": "ANOMALY",
  "title": "CRITICAL COMPONENT FAILURE DETECTED",
  "criticality": "CRITICAL",
  "mse_score": 3.992987632751465,
  "threshold": 0.03273742515593767,
  "root_cause_sensor": "intake_air_temp_C",
  "failing_component": "Air Intake System",
  "description": "Autoencoder detected deviation in intake_air_temp_C. Highlight the Air Intake System."
}
```

## 3D UI Action

- **Highlight component:** Air Intake System
- **Alert color:** Red (CRITICAL)
- **Description for tooltip/TTS:** _Autoencoder detected deviation in intake_air_temp_C. Highlight the Air Intake System._

## MSE Statistics

```
  Peak MSE Score          : 3.9930
  Avg MSE (full drive)    : 1.4563
  Avg MSE (first 60 min)  : 1.4217
  Avg MSE (after 60 min)  : 1.4904
  Threshold               : 0.0327
  % of drive above thresh : 100.0%
```

## Data Generation Log

```
============================================================
SCENARIO: Oil Pump Degradation
============================================================
  Saved 7200 rows -> d:\VIT\hackathon\Code2Create\github\data\test_scenarios\fault_oil_pressure.csv
  Report  -> d:\VIT\hackathon\Code2Create\github\data\test_scenarios\fault_oil_pressure_report.md
  Healthy temp  (final): 118.5 C
  Faulty  temp  (final): 119.6 C
  Oil starvation (final): 0.900
============================================================
```
