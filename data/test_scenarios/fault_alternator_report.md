# Scenario Report: Alternator Diode Failure

**Type:** Fault  
**Generated:** 2026-09-07 23:52:38  
**CSV:** `d:\VIT\hackathon\Code2Create\github\data\test_scenarios\fault_alternator.csv`  
**Duration:** 7200 s (2 hours) at 1 Hz  

---

## Inference Result

| Field | Value |
|-------|-------|
| Status | **ANOMALY** |
| Criticality | CRITICAL |
| Peak MSE Score | 0.6334 |
| Threshold | 0.0613 |
| MSE / Threshold ratio | 10.33x |
| First breach at | 50 s (0.8 min) |
| Sustained breach from | 50 s (0.8 min) |
| Root cause sensor | `intake_air_temp_C` |
| Failing component | Air Intake System |

## Actual live_telemetry.json Output

This is the real output the system produced — passed to the 3D UI:

```json
{
  "time_s": 4966.0,
  "status": "ANOMALY",
  "title": "CRITICAL COMPONENT FAILURE DETECTED",
  "criticality": "CRITICAL",
  "mse_score": 0.6333703398704529,
  "threshold": 0.061308339238166795,
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
  Peak MSE Score          : 0.6334
  Avg MSE (full drive)    : 0.1999
  Avg MSE (first 60 min)  : 0.1031
  Avg MSE (after 60 min)  : 0.2954
  Threshold               : 0.0613
  % of drive above thresh : 92.9%
```

## Data Generation Log

```
============================================================
SCENARIO: Alternator Diode Failure
============================================================
  Saved 7200 rows -> d:\VIT\hackathon\Code2Create\github\data\test_scenarios\fault_alternator.csv
  Report  -> d:\VIT\hackathon\Code2Create\github\data\test_scenarios\fault_alternator_report.md
  Healthy load  (final avg): 42.1%
  Faulty  load  (final avg): 51.9%
  Healthy temp  (final):     119.7 C
  Faulty  temp  (final):     123.0 C
  Alt drag severity (final): 0.730
============================================================
```
