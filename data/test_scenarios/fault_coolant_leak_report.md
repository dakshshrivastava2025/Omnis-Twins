# Scenario Report: Coolant System Leak

**Type:** Fault  
**Generated:** 2026-09-07 23:58:54  
**CSV:** `d:\VIT\hackathon\Code2Create\github\data\test_scenarios\fault_coolant_leak.csv`  
**Duration:** 7200 s (2 hours) at 1 Hz  

---

## Inference Result

| Field | Value |
|-------|-------|
| Status | **ANOMALY** |
| Criticality | CRITICAL |
| Peak MSE Score | 1.5237 |
| Threshold | 0.0618 |
| MSE / Threshold ratio | 24.65x |
| First breach at | 50 s (0.8 min) |
| Sustained breach from | 50 s (0.8 min) |
| Root cause sensor | `coolant_pressure_PSI` |
| Failing component | Radiator / Coolant Lines |

## Actual live_telemetry.json Output

This is the real output the system produced — passed to the 3D UI:

```json
{
  "time_s": 6925.0,
  "status": "ANOMALY",
  "title": "CRITICAL COMPONENT FAILURE DETECTED",
  "criticality": "CRITICAL",
  "mse_score": 1.5236787796020508,
  "threshold": 0.06180388405919074,
  "root_cause_sensor": "coolant_pressure_PSI",
  "failing_component": "Radiator / Coolant Lines",
  "description": "Autoencoder detected deviation in coolant_pressure_PSI. Highlight the Radiator / Coolant Lines."
}
```

## 3D UI Action

- **Status: ANOMALY detected**
- **Highlight component:** Radiator / Coolant Lines
- **Alert color:** 🔴 Red (CRITICAL)
- **Description for tooltip/TTS:** _Autoencoder detected deviation in coolant_pressure_PSI. Highlight the Radiator / Coolant Lines._

## MSE Statistics

```
  Peak MSE Score          : 1.5237
  Avg MSE (full drive)    : 0.4763
  Avg MSE (first 60 min)  : 0.1418
  Avg MSE (after 60 min)  : 0.8064
  Threshold               : 0.0618
  % of drive above thresh : 97.5%
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
