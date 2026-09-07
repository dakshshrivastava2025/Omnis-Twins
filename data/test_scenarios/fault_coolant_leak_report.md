# Scenario Report: Coolant System Leak

**Type:** Fault  
**Generated:** 2026-09-07 23:46:23  
**CSV:** `d:\VIT\hackathon\Code2Create\github\data\test_scenarios\fault_coolant_leak.csv`  
**Duration:** 7200 s (2 hours) at 1 Hz  

---

## Inference Result

| Field | Value |
|-------|-------|
| Status | **ANOMALY** |
| Criticality | CRITICAL |
| Peak MSE Score | 5.7520 |
| Threshold | 0.0327 |
| MSE / Threshold ratio | 175.70x |
| First breach at | 50 s (0.8 min) |
| Sustained breach from | 50 s (0.8 min) |
| Root cause sensor | `coolant_pressure_PSI` |
| Failing component | Radiator / Coolant Lines |

## Actual live_telemetry.json Output

This is the real output the system produced — passed to the 3D UI:

```json
{
  "time_s": 7161.0,
  "status": "ANOMALY",
  "title": "CRITICAL COMPONENT FAILURE DETECTED",
  "criticality": "CRITICAL",
  "mse_score": 5.752018451690674,
  "threshold": 0.03273742515593767,
  "root_cause_sensor": "coolant_pressure_PSI",
  "failing_component": "Radiator / Coolant Lines",
  "description": "Autoencoder detected deviation in coolant_pressure_PSI. Highlight the Radiator / Coolant Lines."
}
```

## 3D UI Action

- **Highlight component:** Radiator / Coolant Lines
- **Alert color:** Red (CRITICAL)
- **Description for tooltip/TTS:** _Autoencoder detected deviation in coolant_pressure_PSI. Highlight the Radiator / Coolant Lines._

## MSE Statistics

```
  Peak MSE Score          : 5.7520
  Avg MSE (full drive)    : 2.3749
  Avg MSE (first 60 min)  : 1.5691
  Avg MSE (after 60 min)  : 3.1698
  Threshold               : 0.0327
  % of drive above thresh : 100.0%
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
