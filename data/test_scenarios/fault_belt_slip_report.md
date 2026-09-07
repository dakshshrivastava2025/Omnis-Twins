# Scenario Report: Serpentine Belt Slip / Wear

**Type:** Fault  
**Generated:** 2026-09-07 23:28:08  
**CSV:** `d:\VIT\hackathon\Code2Create\github\data\test_scenarios\fault_belt_slip.csv`  
**Duration:** 7200 s (2 hours) at 1 Hz  
**Fault starts at:** 60 min (3600 s)  

---

## Description

Serpentine belt wear causes intermittent slipping, reducing the spin rate of the water pump below what RPM implies. Coolant flow drops, raising temperature. Belt slip also causes erratic coolant pressure dips and forces the driver to unconsciously add throttle to maintain speed against the power loss.

## Broken Correlation (What the Autoencoder Catches)

Three correlations break simultaneously: (1) coolant_temp rises faster than RPM implies (water pump underspeeding), (2) coolant_pressure shows erratic dips out of sync with RPM (pump loses prime), (3) throttle/load tick up without matching speed gain (belt power loss).

## Sensor Deviations

| Sensor | Direction | Physical Reason |
|--------|-----------|-----------------|
| `coolant_temp_C` | RISES above RPM prediction | Water pump spins slower than crank RPM implies |
| `coolant_pressure_PSI` | ERRATIC dips | Pump momentarily loses prime on hard slip events |
| `engine_load` | RISES above speed expectation | Power lost to slipping belt accessories |

## Run Statistics

```
  Healthy temp (final)           120.0 C
  Faulty  temp (final)           132.7 C
  Belt slip severity (final)     0.775
```

## Expected Autoencoder Behavior

**Expected MSE:** HIGH — erratic MSE spikes from ~65 min, persistent breach by ~85 min  

## Expected Downstream JSON Output

This is the approximate `live_telemetry.json` the system will produce:

```json
{
  "status": "ANOMALY",
  "title": "COMPONENT FAILURE DETECTED",
  "criticality": "CRITICAL",
  "root_cause_sensor": "coolant_temp_C",
  "failing_component": "Radiator / Cooling System",
  "description": "Autoencoder detected deviation in coolant_temp_C. Highlight the Radiator / Cooling System."
}
```

### 3D UI Action
Highlight: **Radiator / Cooling System**
