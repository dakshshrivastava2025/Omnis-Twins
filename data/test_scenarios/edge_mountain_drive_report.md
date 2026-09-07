# Scenario Report: Mountain / Sustained Uphill Drive

**Type:** Edge Case  
**Generated:** 2026-09-07 23:28:08  
**CSV:** `d:\VIT\hackathon\Code2Create\github\data\test_scenarios\edge_mountain_drive.csv`  
**Duration:** 7200 s (2 hours) at 1 Hz  

---

## Description

Sustained uphill driving requires significantly higher engine torque. Engine load runs at 70–92%, RPM is elevated to 2500–3500, and coolant temperature rises to 100–112°C. All sensors rise together in a physically consistent way — this is NOT a fault.

## Sensor Deviations

| Sensor | Direction | Physical Reason |
|--------|-----------|-----------------|
| `engine_load` | HIGH (70–92%) | Gravity resistance requires constant high torque |
| `rpm` | HIGH (2500–3500) | Driver downshifts to maintain torque |
| `coolant_temp_C` | ELEVATED (100–112 C) | More heat from sustained high load |
| `coolant_pressure_PSI` | ELEVATED proportionally | Temperature-driven — fully correlated |
| `speed_kph` | MODERATE (40–65 kph) | Going uphill, not fast |

## Run Statistics

```
  Avg engine load                79.3%  (vs ~42% normal)
  Avg RPM                        2794  (vs ~1800 normal)
  Avg coolant temp               108.0 C
  Max coolant temp               118.0 C
  Avg speed                      54.3 kph
```

## Expected Autoencoder Behavior

**Expected MSE:** LOW — all sensors correlated, no threshold breach expected  

## Expected Downstream JSON Output

```json
{
  "status": "HEALTHY",
  "title": "SYSTEM NORMAL",
  "criticality": "NONE"
}
```

### 3D UI Action
No component highlight. System displays green / nominal state.
