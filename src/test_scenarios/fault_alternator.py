"""
fault_alternator.py
-------------------
FAULT SCENARIO: Alternator Diode Failure / Charging System Fault

Fault mechanism:
    The alternator starts failing at ~60 minutes. A failing alternator
    draws more mechanical energy from the engine to try to compensate,
    increasing engine load for the same RPM and speed. This causes
    the engine to run hotter than expected, and throttle position
    increases to maintain speed despite the extra mechanical drag.

What the autoencoder catches:
    BROKEN CORRELATION — in healthy driving, engine_load and throttle_pos
    are tightly coupled to speed and RPM (high speed = open throttle = high
    load). During alternator failure, engine_load rises WITHOUT a
    corresponding rise in speed or throttle demand. The extra drag from
    the failing alternator creates a load-speed-throttle decorrelation.

    Secondary: coolant temperature rises slightly above what the
    current speed/RPM would predict (extra mechanical load → extra heat).

Note on sensors: This fault is observable purely through OBD-II standard
sensors. In practice, a $10 OBD dongle also reports battery voltage which
would catch this immediately — but here we show it's detectable even without.

Sensors: All OBD-II standard + coolant pressure transducer (easily attachable)
Expected result: MSE rises from ~75 min, clear anomaly by ~90 min.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

import numpy as np
from scenario_utils import (
    correlated_noise, build_drive_profile, build_healthy_coolant, save_scenario, save_report
)

DURATION    = 7200
FAULT_START = 3600
SEED        = 99

rng = np.random.default_rng(SEED)
t   = np.arange(DURATION)

print("=" * 60)
print("SCENARIO: Alternator Diode Failure")
print("=" * 60)

# ── Drive profile ─────────────────────────────────────────────
rpm, speed, throttle, load, ambient_temp, intake_air_temp = build_drive_profile(
    DURATION, rng, style="normal"
)

# ── Healthy coolant baseline ──────────────────────────────────
healthy_temp, healthy_pressure = build_healthy_coolant(
    DURATION, rpm, load, speed, ambient_temp, rng
)

# ── Alternator drag severity ──────────────────────────────────
# As diodes fail, the alternator draws more torque from the engine.
alt_drag = np.zeros(DURATION)

for i in range(DURATION):
    minutes = i / 60

    if minutes < 60:
        drag = 0.0

    elif minutes < 80:
        # Subtle early failure — intermittent drag pulses
        p    = (minutes - 60) / 20
        drag = 0.08 * p

    elif minutes < 100:
        # Worsening — consistent drag on every revolution
        p    = (minutes - 80) / 20
        drag = 0.08 + 0.30 * p

    else:
        # Severe — alternator barely functioning
        p    = (minutes - 100) / 20
        drag = 0.38 + 0.35 * p

    alt_drag[i] = np.clip(drag + correlated_noise(1, 0.015, 0.97, rng)[0], 0, 1)

# ── Effect on engine load ─────────────────────────────────────
# Alternator drag is a parasitic load on the engine.
# Engine load increases WITHOUT more throttle or more speed.

fault_load    = load.copy()
fault_throttle = throttle.copy()
fault_temp    = healthy_temp.copy()
fault_pressure = healthy_pressure.copy()

# Load increases due to alternator drag
for i in range(FAULT_START, DURATION):
    drag = alt_drag[i]

    # Extra engine load from alternator drag (up to +18% at full fault)
    extra_load = 18 * drag * (0.7 + 0.3 * rng.random())
    fault_load[i] = np.clip(load[i] + extra_load, 5, 100)

    # Throttle position is NORMAL (driver hasn't changed pedal position)
    # This creates the decorrelation: high load, normal throttle, normal speed

# Coolant temperature rises from the extra engine load
for i in range(1, DURATION):
    if i < FAULT_START:
        continue

    drag      = alt_drag[i]
    prev_temp = fault_temp[i - 1]

    engine_heat = 0.00065 * fault_load[i] * (0.65 + 0.35 * rpm[i] / 3000)
    temp_diff   = max(prev_temp - ambient_temp[i], 0)
    radiator_cooling = (
        0.000055 * temp_diff
        + 0.0000018 * speed[i] * temp_diff
    )

    fault_temp[i] = prev_temp + (engine_heat - radiator_cooling) + rng.normal(0, 0.05)
    fault_temp[i] = np.clip(fault_temp[i], 70, 135)

    # Pressure rises slightly with temperature (but less than load increase would imply)
    fault_pressure[i] = (
        11.5
        + 0.09 * (fault_temp[i] - 70)
        + 0.0005 * rpm[i]
        + rng.normal(0, 0.12)
    )
    fault_pressure[i] = np.clip(fault_pressure[i], 8, 19)

# ── Save ──────────────────────────────────────────────────────
save_scenario("fault_alternator", {
    "Time_s":               t,
    "rpm":                  rpm,
    "speed_kph":            speed,
    "throttle_pos":         fault_throttle,
    "engine_load":          fault_load,
    "coolant_temp_C":       fault_temp,
    "coolant_pressure_PSI": fault_pressure,
    "intake_air_temp_C":    intake_air_temp,
})

save_report("fault_alternator", {
    "scenario_type": "Fault",
    "title": "Alternator Diode Failure",
    "fault_start_min": 60,
    "description": (
        "Alternator diode failure causes the alternator to draw extra mechanical torque "
        "from the engine to compensate, acting as a parasitic drag load. "
        "This raises engine_load without the driver increasing throttle or gaining speed."
    ),
    "broken_corr": (
        "In healthy driving, engine_load and throttle_pos are tightly coupled to speed and RPM. "
        "During alternator failure, engine_load rises WITHOUT corresponding throttle or speed increase. "
        "The model cannot reconstruct 'high load, normal throttle, normal speed' — it's never seen this."
    ),
    "sensor_deltas": [
        ("engine_load",   "RISES above throttle prediction", "Parasitic alternator drag adds hidden mechanical load"),
        ("coolant_temp_C","RISES above RPM prediction",      "Extra engine work from drag generates more heat"),
    ],
    "stats": {
        "Healthy load avg (final 10 min)": f"{load[-600:].mean():.1f}%",
        "Faulty  load avg (final 10 min)": f"{fault_load[-600:].mean():.1f}%",
        "Healthy temp (final)":            f"{healthy_temp[-1]:.1f} C",
        "Faulty  temp (final)":            f"{fault_temp[-1]:.1f} C",
        "Alt drag severity (final)":       f"{alt_drag[-1]:.3f}",
    },
    "expected_mse": "HIGH — load/throttle/speed decorrelation detectable from ~75 min",
    "root_sensor": "engine_load",
    "failing_comp": "Engine Block",
})

print(f"  Healthy load  (final avg): {load[-600:].mean():.1f}%")
print(f"  Faulty  load  (final avg): {fault_load[-600:].mean():.1f}%")
print(f"  Healthy temp  (final):     {healthy_temp[-1]:.1f} C")
print(f"  Faulty  temp  (final):     {fault_temp[-1]:.1f} C")
print(f"  Alt drag severity (final): {alt_drag[-1]:.3f}")
print("=" * 60)
