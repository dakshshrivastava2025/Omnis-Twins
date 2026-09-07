# Scenario Report: Serpentine Belt Slip

**Type:** Fault  
**Generated:** 2026-09-07 23:59:09  
**CSV:** `d:\VIT\hackathon\Code2Create\github\data\test_scenarios\fault_belt_slip.csv`  
**Duration:** 7200 s (2 hours) at 1 Hz  

---

## Inference Result

| Field | Value |
|-------|-------|
| Status | **ANOMALY** |
| Criticality | CRITICAL |
| Peak MSE Score | 0.5321 |
| Threshold | 0.0618 |
| MSE / Threshold ratio | 8.61x |
| First breach at | 50 s (0.8 min) |
| Sustained breach from | 50 s (0.8 min) |
| Root cause sensor | `intake_air_temp_C` |
| Failing component | Air Intake System |

## Actual live_telemetry.json Output

This is the real output the system produced — passed to the 3D UI:

```json
{
  "time_s": 4673.0,
  "status": "ANOMALY",
  "title": "CRITICAL COMPONENT FAILURE DETECTED",
  "criticality": "CRITICAL",
  "mse_score": 0.5321371555328369,
  "threshold": 0.06180388405919074,
  "root_cause_sensor": "intake_air_temp_C",
  "failing_component": "Air Intake System",
  "description": "Autoencoder detected deviation in intake_air_temp_C. Highlight the Air Intake System."
}
```

## 3D UI Action

- **Status: ANOMALY detected**
- **Highlight component:** Air Intake System
- **Alert color:** 🔴 Red (CRITICAL)
- **Description for tooltip/TTS:** _Autoencoder detected deviation in intake_air_temp_C. Highlight the Air Intake System._

## MSE Statistics

```
  Peak MSE Score          : 0.5321
  Avg MSE (full drive)    : 0.2239
  Avg MSE (first 60 min)  : 0.1541
  Avg MSE (after 60 min)  : 0.2928
  Threshold               : 0.0618
  % of drive above thresh : 98.9%
```

## Data Generation Log

```
============================================================
SCENARIO: Serpentine Belt Slip / Wear
============================================================
  Saved 7200 rows -> d:\VIT\hackathon\Code2Create\github\data\test_scenarios\fault_belt_slip.csv
  Report  -> d:\VIT\hackathon\Code2Create\github\data\test_scenarios\fault_belt_slip_report.md
  Healthy temp  (final):     120.0 C
  Faulty  temp  (final):     132.7 C
  Belt slip severity (final): 0.775
============================================================
```
