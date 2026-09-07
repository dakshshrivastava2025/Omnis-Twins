# Scenario Report: Coolant System Leak

**Type:** Fault  
**Generated:** 2026-09-07 23:28:07  
**CSV:** `d:\VIT\hackathon\Code2Create\github\data\test_scenarios\fault_coolant_leak.csv`  
**Duration:** 7200 s (2 hours) at 1 Hz  
**Fault starts at:** 60 min (3600 s)  

---

## Description

A crack in the coolant hose causes progressive fluid loss. Cooling capacity drops as coolant level falls, causing the engine to overheat. The leak severity grows over 4 phases from 60 to 120 minutes.

## Broken Correlation (What the Autoencoder Catches)

In healthy driving, coolant_temp_C and coolant_pressure_PSI rise and fall TOGETHER (both driven by RPM and engine load). During a leak, temperature RISES while pressure FALLS — a physically anti-correlated pattern the autoencoder cannot reconstruct.

## Sensor Deviations

| Sensor | Direction | Physical Reason |
|--------|-----------|-----------------|
| `coolant_temp_C` | RISES above healthy | Reduced coolant volume = less heat absorption |
| `coolant_pressure_PSI` | FALLS below healthy | Fluid loss reduces system pressure |

## Run Statistics

```
  Healthy temp (final)           117.7 C
  Faulty  temp (final)           133.3 C
  Healthy pressure (final)       16.59 PSI
  Faulty  pressure (final)       13.07 PSI
  Leak severity (final)          0.932
```

## Expected Autoencoder Behavior

**Expected MSE:** HIGH — threshold breach expected ~30 min after fault start  

## Expected Downstream JSON Output

This is the approximate `live_telemetry.json` the system will produce:

```json
{
  "status": "ANOMALY",
  "title": "COMPONENT FAILURE DETECTED",
  "criticality": "CRITICAL",
  "root_cause_sensor": "coolant_pressure_PSI",
  "failing_component": "Radiator / Coolant Lines",
  "description": "Autoencoder detected deviation in coolant_pressure_PSI. Highlight the Radiator / Coolant Lines."
}
```

### 3D UI Action
Highlight: **Radiator / Coolant Lines**
