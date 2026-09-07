# Scenario Report: Alternator Diode Failure

**Type:** Fault  
**Generated:** 2026-09-07 23:28:08  
**CSV:** `d:\VIT\hackathon\Code2Create\github\data\test_scenarios\fault_alternator.csv`  
**Duration:** 7200 s (2 hours) at 1 Hz  
**Fault starts at:** 60 min (3600 s)  

---

## Description

Alternator diode failure causes the alternator to draw extra mechanical torque from the engine to compensate, acting as a parasitic drag load. This raises engine_load without the driver increasing throttle or gaining speed.

## Broken Correlation (What the Autoencoder Catches)

In healthy driving, engine_load and throttle_pos are tightly coupled to speed and RPM. During alternator failure, engine_load rises WITHOUT corresponding throttle or speed increase. The model cannot reconstruct 'high load, normal throttle, normal speed' — it's never seen this.

## Sensor Deviations

| Sensor | Direction | Physical Reason |
|--------|-----------|-----------------|
| `engine_load` | RISES above throttle prediction | Parasitic alternator drag adds hidden mechanical load |
| `coolant_temp_C` | RISES above RPM prediction | Extra engine work from drag generates more heat |

## Run Statistics

```
  Healthy load avg (final 10 min) 42.1%
  Faulty  load avg (final 10 min) 51.9%
  Healthy temp (final)           119.7 C
  Faulty  temp (final)           123.0 C
  Alt drag severity (final)      0.730
```

## Expected Autoencoder Behavior

**Expected MSE:** HIGH — load/throttle/speed decorrelation detectable from ~75 min  

## Expected Downstream JSON Output

This is the approximate `live_telemetry.json` the system will produce:

```json
{
  "status": "ANOMALY",
  "title": "COMPONENT FAILURE DETECTED",
  "criticality": "CRITICAL",
  "root_cause_sensor": "engine_load",
  "failing_component": "Engine Block",
  "description": "Autoencoder detected deviation in engine_load. Highlight the Engine Block."
}
```

### 3D UI Action
Highlight: **Engine Block**
