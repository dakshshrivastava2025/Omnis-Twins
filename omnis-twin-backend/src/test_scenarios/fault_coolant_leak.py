"""
fault_coolant_leak.py
---------------------
FAULT SCENARIO: Coolant System Leak

Fault mechanism:
    A small crack develops in the coolant hose at ~60 minutes.
    Coolant fluid slowly escapes, reducing the system's heat-carrying
    capacity. The cooling efficiency drops progressively.

What the autoencoder catches:
    BROKEN CORRELATION — in healthy driving, coolant temperature and
    coolant pressure rise and fall TOGETHER (both driven by RPM and load).
    During a leak, temperature RISES while pressure FALLS. This
    anti-correlated behavior is impossible to reconstruct → high MSE.

Sensors: All OBD-II standard + coolant pressure transducer (easily attachable)
Expected result: MSE exceeds threshold ~20-30 min after fault starts.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

import numpy as np
from scenario_utils import (
    correlated_noise, build_drive_profile, build_healthy_coolant, save_scenario, save_report
)

DURATION    = 7200   # 2 hours at 1 Hz
FAULT_START = 3600   # Fault begins at 1 hour mark
SEED        = 42

rng = np.random.default_rng(SEED)
t   = np.arange(DURATION)

print("=" * 60)
print("SCENARIO: Coolant System Leak")
print("=" * 60)

# ── Drive profile (normal urban/highway mix) ──────────────────
rpm, speed, throttle, load, ambient_temp, intake_air_temp = build_drive_profile(
    DURATION, rng, style="normal"
)

# ── Healthy coolant baseline ──────────────────────────────────
healthy_temp, healthy_pressure = build_healthy_coolant(
    DURATION, rpm, load, speed, ambient_temp, rng
)

# ── Leak severity curve ───────────────────────────────────────
# Leak grows through several phases, never instantly — physical inertia.

leak_target = np.zeros(DURATION)

for i in range(DURATION):
    minutes = i / 60

    if minutes < 40:
        target = 0.0

    elif minutes < 50:
        p      = (minutes - 40) / 10
        target = 0.015 + 0.045 * p

    elif minutes < 60:
        p      = (minutes - 50) / 10
        target = 0.06 + 0.08 * p

    elif minutes < 75:
        p      = (minutes - 60) / 15
        target = 0.14 + 0.18 * p

    elif minutes < 90:
        p      = (minutes - 75) / 15
        target = 0.32 + 0.25 * p

    elif minutes < 105:
        p      = (minutes - 90) / 15
        target = 0.57 + 0.25 * p

    else:
        p      = (minutes - 105) / 15
        target = 0.82 + 0.15 * p

    leak_target[i] = target

# Correlated noise so it looks rough, not smooth
leak_noise      = correlated_noise(DURATION, 0.08, 0.985, rng)
short_term_noise = correlated_noise(DURATION, 0.035, 0.85, rng)
raw_leak        = leak_target + leak_noise + short_term_noise

# Random transient recovery / worsening events
for _ in range(18):
    start     = rng.integers(FAULT_START, DURATION - 30)
    dur_event = rng.integers(10, 90)
    magnitude = rng.uniform(-0.08, 0.08)
    curve     = np.sin(np.linspace(0, np.pi, dur_event))
    end       = min(start + dur_event, DURATION)
    raw_leak[start:end] += magnitude * curve[:end - start]

# Physical inertia: leak cannot jump instantly
leak = np.zeros(DURATION)
for i in range(1, DURATION):
    if i < FAULT_START:
        leak[i] = 0
    else:
        leak[i] = 0.985 * leak[i - 1] + 0.015 * raw_leak[i]
leak = np.clip(leak, 0, 1)

# ── Faulty sensor signals ─────────────────────────────────────
fault_temp     = healthy_temp.copy()
fault_pressure = healthy_pressure.copy()

for i in range(1, DURATION):
    if i < FAULT_START:
        continue

    current_leak = leak[i]
    prev_temp    = fault_temp[i - 1]

    # Cooling efficiency degrades with leak severity
    cooling_efficiency = 1.0 - 0.50 * current_leak

    engine_heat = 0.00065 * load[i] * (0.65 + 0.35 * rpm[i] / 3000)
    temp_diff   = max(prev_temp - ambient_temp[i], 0)
    radiator_cooling = cooling_efficiency * (
        0.000055 * temp_diff + 0.0000018 * speed[i] * temp_diff
    )

    fault_temp[i] = prev_temp + (engine_heat - radiator_cooling) + rng.normal(0, 0.05)
    fault_temp[i] = np.clip(fault_temp[i], 70, 140)

    # Pressure loss: leak reduces system pressure, anti-correlated with temp rise
    pressure_loss = 5.8 * current_leak * (0.60 + 0.40 * load[i] / 100)
    pressure_noise_std = 0.08 + 0.22 * current_leak
    fault_pressure[i] = (
        healthy_pressure[i]
        - pressure_loss
        + rng.normal(0, pressure_noise_std)
    )
    fault_pressure[i] = np.clip(fault_pressure[i], 5, 19)

# ── Save ──────────────────────────────────────────────────────
save_scenario("fault_coolant_leak", {
    "Time_s":               t,
    "rpm":                  rpm,
    "speed_kph":            speed,
    "throttle_pos":         throttle,
    "engine_load":          load,
    "coolant_temp_C":       fault_temp,
    "coolant_pressure_PSI": fault_pressure,
    "intake_air_temp_C":    intake_air_temp,
})

save_report("fault_coolant_leak", {
    "scenario_type": "Fault",
    "title": "Coolant System Leak",
    "fault_start_min": 60,
    "description": (
        "A crack in the coolant hose causes progressive fluid loss. "
        "Cooling capacity drops as coolant level falls, causing the engine to overheat. "
        "The leak severity grows over 4 phases from 60 to 120 minutes."
    ),
    "broken_corr": (
        "In healthy driving, coolant_temp_C and coolant_pressure_PSI rise and fall TOGETHER "
        "(both driven by RPM and engine load). During a leak, temperature RISES while pressure FALLS — "
        "a physically anti-correlated pattern the autoencoder cannot reconstruct."
    ),
    "sensor_deltas": [
        ("coolant_temp_C",       "RISES above healthy",  "Reduced coolant volume = less heat absorption"),
        ("coolant_pressure_PSI", "FALLS below healthy",  "Fluid loss reduces system pressure"),
    ],
    "stats": {
        "Healthy temp (final)": f"{healthy_temp[-1]:.1f} C",
        "Faulty  temp (final)": f"{fault_temp[-1]:.1f} C",
        "Healthy pressure (final)": f"{healthy_pressure[-1]:.2f} PSI",
        "Faulty  pressure (final)": f"{fault_pressure[-1]:.2f} PSI",
        "Leak severity (final)": f"{leak[-1]:.3f}",
    },
    "expected_mse": "HIGH — threshold breach expected ~30 min after fault start",
    "root_sensor": "coolant_pressure_PSI",
    "failing_comp": "Radiator / Coolant Lines",
})

print(f"  Healthy temp  (final): {healthy_temp[-1]:.1f} C")
print(f"  Faulty  temp  (final): {fault_temp[-1]:.1f} C")
print(f"  Healthy press (final): {healthy_pressure[-1]:.2f} PSI")
print(f"  Faulty  press (final): {fault_pressure[-1]:.2f} PSI")
print(f"  Leak severity (final): {leak[-1]:.3f}")
print("=" * 60)
