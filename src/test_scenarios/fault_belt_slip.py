"""
fault_belt_slip.py
------------------
FAULT SCENARIO: Serpentine / Drive Belt Slip / Wear

Fault mechanism:
    The serpentine belt drives the water pump, power steering pump, and
    alternator off the engine crankshaft. As the belt wears and starts
    to slip at ~60 minutes:

      1. Water pump spins SLOWER than RPM implies → reduced coolant flow
         → coolant temperature rises disproportionately to RPM and load.

      2. Belt slip also reduces water pump delivery pressure → coolant
         pressure becomes more variable (intermittent pressure drops when
         the belt momentarily slips badly).

      3. Speed-to-RPM ratio drifts: the engine must rev slightly higher
         to maintain speed due to power-transfer losses from slipping
         accessories — throttle and load both tick up without matching
         speed gain.

What the autoencoder catches:
    BROKEN CORRELATION — coolant temp rises faster than RPM/load should
    cause. Coolant pressure becomes erratic (intermittent dips) out of
    sync with RPM. Throttle/load climb without matching speed increase.
    All three broken correlations contribute to high reconstruction error.

Sensors: All OBD-II standard + coolant pressure transducer (easily attachable)
Expected result: Erratic MSE spikes from ~65 min, persistent anomaly by ~85 min.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

import numpy as np
from scenario_utils import (
    correlated_noise, build_drive_profile, build_healthy_coolant, save_scenario
)

DURATION    = 7200
FAULT_START = 3600
SEED        = 7

rng = np.random.default_rng(SEED)
t   = np.arange(DURATION)

print("=" * 60)
print("SCENARIO: Serpentine Belt Slip / Wear")
print("=" * 60)

# ── Drive profile ─────────────────────────────────────────────
rpm, speed, throttle, load, ambient_temp, intake_air_temp = build_drive_profile(
    DURATION, rng, style="normal"
)

# ── Healthy coolant baseline ──────────────────────────────────
healthy_temp, healthy_pressure = build_healthy_coolant(
    DURATION, rpm, load, speed, ambient_temp, rng
)

# ── Belt slip severity ────────────────────────────────────────
# Belt slip is intermittent at first (only at high RPM or load peaks),
# then becomes more persistent as the belt degrades.

belt_slip_base = np.zeros(DURATION)

for i in range(DURATION):
    minutes = i / 60

    if minutes < 60:
        slip = 0.0

    elif minutes < 75:
        # Occasional slip at load peaks only
        p    = (minutes - 60) / 15
        slip = 0.10 * p

    elif minutes < 95:
        # Frequent slipping
        p    = (minutes - 75) / 20
        slip = 0.10 + 0.35 * p

    else:
        # Severe — belt barely gripping
        p    = (minutes - 95) / 25
        slip = 0.45 + 0.40 * p

    belt_slip_base[i] = np.clip(slip, 0, 1)

# Belt slip is intermittent — add high-frequency noise to create slipping events
belt_slip = belt_slip_base + correlated_noise(DURATION, 0.06, 0.90, rng)
belt_slip = np.clip(belt_slip, 0, 1)

# ── Effective water pump flow rate ───────────────────────────
# Water pump spins at RPM * (1 - slip). Reduced flow = less cooling.
# pump_efficiency = 1.0 when no slip, drops as slip worsens.
pump_efficiency = 1.0 - 0.70 * belt_slip  # max 70% reduction in flow

# ── Faulty sensor signals ─────────────────────────────────────
fault_temp     = healthy_temp.copy()
fault_pressure = healthy_pressure.copy()
fault_throttle = throttle.copy()
fault_load     = load.copy()

for i in range(1, DURATION):
    if i < FAULT_START:
        continue

    slip    = belt_slip[i]
    peff    = pump_efficiency[i]
    prev_temp = fault_temp[i - 1]

    # Temperature: radiator cooling is reduced by pump slip
    engine_heat = 0.00065 * load[i] * (0.65 + 0.35 * rpm[i] / 3000)
    temp_diff   = max(prev_temp - ambient_temp[i], 0)
    radiator_cooling = peff * (
        0.000055 * temp_diff
        + 0.0000018 * speed[i] * temp_diff
    )

    fault_temp[i] = prev_temp + (engine_heat - radiator_cooling) + rng.normal(0, 0.05)
    fault_temp[i] = np.clip(fault_temp[i], 70, 140)

    # Pressure: intermittent dips when belt slips hard (pump loses prime momentarily)
    base_pressure = (
        11.5
        + 0.09 * (fault_temp[i] - 70)
        + 0.0005 * rpm[i]
    )

    # Sudden pressure drops when slip is severe
    if slip > 0.55 and rng.random() < 0.30:
        pressure_dip = rng.uniform(0.8, 2.5)  # sudden dip
    else:
        pressure_dip = 0.0

    pressure_noise = rng.normal(0, 0.08 + 0.25 * slip)
    fault_pressure[i] = np.clip(
        base_pressure - pressure_dip + pressure_noise,
        5, 19
    )

    # Engine must work slightly harder to maintain speed
    # (power lost to slipping accessories)
    load_compensation = 5 * slip * rng.uniform(0.5, 1.0)
    fault_load[i] = np.clip(load[i] + load_compensation, 5, 100)

    # Throttle ticks up slightly (driver unconsciously compensating)
    fault_throttle[i] = np.clip(
        throttle[i] + 4 * slip * rng.uniform(0.3, 1.0),
        0, 100
    )

# ── Save ──────────────────────────────────────────────────────
save_scenario("fault_belt_slip", {
    "Time_s":               t,
    "rpm":                  rpm,
    "speed_kph":            speed,
    "throttle_pos":         fault_throttle,
    "engine_load":          fault_load,
    "coolant_temp_C":       fault_temp,
    "coolant_pressure_PSI": fault_pressure,
    "intake_air_temp_C":    intake_air_temp,
})

print(f"  Healthy temp  (final):     {healthy_temp[-1]:.1f} C")
print(f"  Faulty  temp  (final):     {fault_temp[-1]:.1f} C")
print(f"  Belt slip severity (final): {belt_slip[-1]:.3f}")
print("=" * 60)
