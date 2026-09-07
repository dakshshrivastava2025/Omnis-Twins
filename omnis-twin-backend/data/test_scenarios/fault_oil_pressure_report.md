# Scenario Report: Oil Pump Degradation

**Type:** Fault  
**Generated:** 2026-09-07 23:58:58  
**CSV:** `d:\VIT\hackathon\Code2Create\github\data\test_scenarios\fault_oil_pressure.csv`  
**Duration:** 7200 s (2 hours) at 1 Hz  

---

## Inference Result

| Field | Value |
|-------|-------|
| Status | **ANOMALY** |
| Criticality | CRITICAL |
| Peak MSE Score | 0.5455 |
| Threshold | 0.0618 |
| MSE / Threshold ratio | 8.83x |
| First breach at | 50 s (0.8 min) |
| Sustained breach from | 50 s (0.8 min) |
| Root cause sensor | `rpm` |
| Failing component | Engine Block / Transmission |

## Actual live_telemetry.json Output

This is the real output the system produced — passed to the 3D UI:

```json
{
  "time_s": 351.0,
  "status": "ANOMALY",
  "title": "CRITICAL COMPONENT FAILURE DETECTED",
  "criticality": "CRITICAL",
  "mse_score": 0.5455164909362793,
  "threshold": 0.06180388405919074,
  "root_cause_sensor": "rpm",
  "failing_component": "Engine Block / Transmission",
  "description": "Autoencoder detected deviation in rpm. Highlight the Engine Block / Transmission."
}
```

## 3D UI Action

- **Status: ANOMALY detected**
- **Highlight component:** Engine Block / Transmission
- **Alert color:** 🔴 Red (CRITICAL)
- **Description for tooltip/TTS:** _Autoencoder detected deviation in rpm. Highlight the Engine Block / Transmission._

## MSE Statistics

```
  Peak MSE Score          : 0.5455
  Avg MSE (full drive)    : 0.2107
  Avg MSE (first 60 min)  : 0.1444
  Avg MSE (after 60 min)  : 0.2762
  Threshold               : 0.0618
  % of drive above thresh : 97.0%
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
