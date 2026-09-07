# Test Scenario Run Report

**Generated:** 2026-09-07 23:28:08  
**Autoencoder trained on:** `data/calibration/baseline_drive.csv`  
**Schema:** `rpm, speed_kph, throttle_pos, engine_load, coolant_temp_C, coolant_pressure_PSI, intake_air_temp_C`

---

## Summary

| # | Scenario | Type | Expected MSE | Output File |
|---|----------|------|-------------|-------------|
| 1 | Coolant System Leak | Fault | HIGH — threshold breach ~30 min after fault | `fault_coolant_leak.csv` |
| 2 | Oil Pump Degradation | Fault | HIGH — steady climb from ~70 min | `fault_oil_pressure.csv` |
| 3 | Alternator Diode Failure | Fault | HIGH — rise from ~75 min | `fault_alternator.csv` |
| 4 | Serpentine Belt Slip | Fault | HIGH — erratic spikes from ~65 min | `fault_belt_slip.csv` |
| 5 | Mountain / Uphill Drive | Edge Case | LOW — stays below threshold | `edge_mountain_drive.csv` |
| 6 | Aggressive Highway Drive | Edge Case | LOW — brief spikes only, no sustained breach | `edge_aggressive_highway.csv` |

---

## ✅ Coolant System Leak (`fault_coolant_leak`)

**Type:** Fault  

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

---

## ✅ Oil Pump Degradation (`fault_oil_pressure`)

**Type:** Fault  

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

---

## ✅ Alternator Diode Failure (`fault_alternator`)

**Type:** Fault  

```
============================================================
SCENARIO: Alternator Diode Failure
============================================================
  Saved 7200 rows -> d:\VIT\hackathon\Code2Create\github\data\test_scenarios\fault_alternator.csv
  Report  -> d:\VIT\hackathon\Code2Create\github\data\test_scenarios\fault_alternator_report.md
  Healthy load  (final avg): 42.1%
  Faulty  load  (final avg): 51.9%
  Healthy temp  (final):     119.7 C
  Faulty  temp  (final):     123.0 C
  Alt drag severity (final): 0.730
============================================================
  Healthy load  (final avg): 42.1%
  Faulty  load  (final avg): 51.9%
  Healthy temp  (final):     119.7 C
  Faulty  temp  (final):     123.0 C
  Alt drag severity (final): 0.730
============================================================
```

---

## ✅ Serpentine Belt Slip (`fault_belt_slip`)

**Type:** Fault  

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

---

## ✅ Mountain / Uphill Drive (`edge_mountain_drive`)

**Type:** Edge Case  

```
============================================================
EDGE CASE: Mountain / Sustained Uphill Drive
============================================================
  Saved 7200 rows -> d:\VIT\hackathon\Code2Create\github\data\test_scenarios\edge_mountain_drive.csv
  Report  -> d:\VIT\hackathon\Code2Create\github\data\test_scenarios\edge_mountain_drive_report.md
  Avg engine load : 79.3%  (vs ~42% normal)
  Avg RPM         : 2794    (vs ~1800 normal)
  Avg coolant temp: 108.0 C
  Max coolant temp: 118.0 C
  Avg speed       : 54.3 kph
  -> All sensors correlated — expect LOW MSE
============================================================
```

---

## ✅ Aggressive Highway Drive (`edge_aggressive_highway`)

**Type:** Edge Case  

```
============================================================
EDGE CASE: Aggressive Highway Driving
============================================================
  Saved 7200 rows -> d:\VIT\hackathon\Code2Create\github\data\test_scenarios\edge_aggressive_highway.csv
  Report  -> d:\VIT\hackathon\Code2Create\github\data\test_scenarios\edge_aggressive_highway_report.md
  Avg speed       : 133.1 kph  (normal ~65)
  Max speed       : 200.0 kph
  Avg RPM         : 3280
  Max RPM         : 5539
  Avg coolant temp: 115.5 C
  Max coolant temp: 120.0 C
  Burst events    : 16
  -> All sensors burst and recover together — expect LOW sustained MSE
============================================================
```

---

## Sensor Coverage

| Sensor | Source | Fault Relevance |
|--------|--------|-----------------|
| `rpm` | OBD-II standard (PID 010C) | Load/temp correlation anchor |
| `speed_kph` | OBD-II standard (PID 010D) | Throttle/load/RPM cross-check |
| `throttle_pos` | OBD-II standard (PID 0111) | Load/speed decorrelation detector |
| `engine_load` | OBD-II standard (PID 0104) | Primary fault signal for oil/alternator |
| `coolant_temp_C` | OBD-II standard (PID 0105) | Primary fault signal for coolant/belt |
| `intake_air_temp_C` | OBD-II standard (PID 010F) | Ambient baseline reference |
| `coolant_pressure_PSI` | Easily attachable (~$20 transducer) | Pressure/temp decorrelation |

> **Note on microphones:** Acoustic sensors (for belt squeal, bearing noise) are not yet
> included. They require FFT preprocessing to extract a scalar `acoustic_dB` feature before
> feeding to the autoencoder. Planned for next iteration.