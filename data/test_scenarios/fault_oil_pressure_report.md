# Scenario Report: Oil Pump Degradation

**Type:** Fault  
**Generated:** 2026-09-07 23:28:07  
**CSV:** `d:\VIT\hackathon\Code2Create\github\data\test_scenarios\fault_oil_pressure.csv`  
**Duration:** 7200 s (2 hours) at 1 Hz  
**Fault starts at:** 60 min (3600 s)  

---

## Description

The oil pump wears progressively, reducing lubrication pressure. Metal-on-metal friction generates extra heat independent of engine load, and the driver unconsciously eases throttle as the engine feels sluggish, causing load to drop without a matching speed decrease.

## Broken Correlation (What the Autoencoder Catches)

Healthy coolant_temp_C is tightly linked to engine_load and RPM. During oil starvation, friction generates heat INDEPENDENT of load — the model sees temperature rising faster than load/RPM would predict. Also: engine_load drops while speed holds steady (throttle suppression), breaking the normal load-speed relationship.

## Sensor Deviations

| Sensor | Direction | Physical Reason |
|--------|-----------|-----------------|
| `coolant_temp_C` | RISES above load/RPM prediction | Extra friction heat source from poor lubrication |
| `engine_load` | FALLS below expected for speed | Driver eases off unconsciously; power lost to friction |

## Run Statistics

```
  Healthy temp (final)           118.5 C
  Faulty  temp (final)           119.6 C
  Oil starvation (final)         0.900
```

## Expected Autoencoder Behavior

**Expected MSE:** HIGH — steady climb from ~70 min as friction heat accumulates  

## Expected Downstream JSON Output

This is the approximate `live_telemetry.json` the system will produce:

```json
{
  "status": "ANOMALY",
  "title": "COMPONENT FAILURE DETECTED",
  "criticality": "CRITICAL",
  "root_cause_sensor": "coolant_temp_C",
  "failing_component": "Engine Block",
  "description": "Autoencoder detected deviation in coolant_temp_C. Highlight the Engine Block."
}
```

### 3D UI Action
Highlight: **Engine Block**
