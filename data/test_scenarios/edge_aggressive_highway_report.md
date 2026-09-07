# Scenario Report: Aggressive Highway Drive

**Type:** Edge Case  
**Generated:** 2026-09-07 23:28:08  
**CSV:** `d:\VIT\hackathon\Code2Create\github\data\test_scenarios\edge_aggressive_highway.csv`  
**Duration:** 7200 s (2 hours) at 1 Hz  

---

## Description

Hard acceleration bursts to 130-165 kph with sustained high-speed cruising. All sensors spike simultaneously during bursts (throttle to 100%, load to 90-98%, RPM to 4000-5500) then settle together during cruise. This is normal performance driving, NOT a fault.

## Sensor Deviations

| Sensor | Direction | Physical Reason |
|--------|-----------|-----------------|
| `speed_kph` | HIGH (130-165 kph sustained) | Aggressive highway cruising |
| `rpm` | HIGH (peaks to 5500+) | High-gear acceleration bursts |
| `throttle_pos` | HIGH during bursts (85-100%) | Hard overtake / acceleration events |
| `engine_load` | HIGH during bursts (85-98%) | Full demand during acceleration |
| `coolant_temp_C` | ELEVATED (avg 115 C) | High sustained load, but correlated |

## Run Statistics

```
  Avg speed                      133.1 kph  (normal ~65)
  Max speed                      200.0 kph
  Avg RPM                        3280
  Max RPM                        5539
  Avg coolant temp               115.5 C
  Max coolant temp               120.0 C
  Burst events                   16
```

## Expected Autoencoder Behavior

**Expected MSE:** LOW sustained — brief spikes during extreme bursts only, no persistent breach  

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
