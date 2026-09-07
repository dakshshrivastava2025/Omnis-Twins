"""
fault_oil_pressure.py
---------------------
FAULT SCENARIO: Oil Pump Degradation / Pressure Loss

Fault mechanism:
    The oil pump begins to fail at ~60 minutes. Oil pressure drops
    progressively. Reduced lubrication causes increased friction in
    the engine, which generates EXTRA HEAT beyond what the cooling
    system can handle at that RPM/load level.

What the autoencoder catches:
    BROKEN CORRELATION — healthy coolant temperature is tightly linked
    to engine load and RPM (more load = more heat = higher temp). During
    oil pressure loss, coolant temperature rises FASTER than what the
    current load/RPM would predict. The model sees "low load but high
    temp" — a correlation it has never seen in healthy data → high MSE.

    Also: the engine compensates by reducing effective load transfer
    (driver feels sluggishness → eases throttle) while RPM stays up,
    breaking the normal throttle↔load↔speed relationship.

Sensors: All OBD-II standard + coolant pressure transducer (easily attachable)
Expected result: MSE climbs steadily from ~70 min onward.
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
SEED        = 17

rng = np.random.default_rng(SEED)
t   = np.arange(DURATION)

print("=" * 60)
print("SCENARIO: Oil Pump Degradation")
print("=" * 60)

# ── Drive profile ─────────────────────────────────────────────
rpm, speed, throttle, load, ambient_temp, intake_air_temp = build_drive_profile(
    DURATION, rng, style="normal"
)

# ── Healthy coolant baseline ──────────────────────────────────
healthy_temp, healthy_pressure = build_healthy_coolant(
    DURATION, rpm, load, speed, ambient_temp, rng
)

# ── Oil starvation severity (grows after fault start) ─────────
# Severity 0 = full lubrication, 1 = critically starved
oil_starvation = np.zeros(DURATION)

for i in range(DURATION):
    minutes = i / 60

    if minutes < 60:
        severity = 0.0

    elif minutes < 75:
        # Pump wear begins — very subtle initial drop
        p        = (minutes - 60) / 15
        severity = 0.05 * p

    elif minutes < 90:
        # Worsening — friction noticeably increases
        p        = (minutes - 75) / 15
        severity = 0.05 + 0.25 * p

    elif minutes < 105:
        # Serious starvation — engine running hot and rough
        p        = (minutes - 90) / 15
        severity = 0.30 + 0.35 * p

    else:
        # Critical — engine on the edge
        p        = (minutes - 105) / 15
        severity = 0.65 + 0.25 * p

    oil_starvation[i] = np.clip(
        severity + correlated_noise(1, 0.02, 0.98, rng)[0],
        0, 1
    )

# ── Friction heat effect ──────────────────────────────────────
# Low oil pressure → metal-on-metal friction → extra heat source
# This is INDEPENDENT of engine load, which breaks the normal correlation

fault_temp     = healthy_temp.copy()
fault_pressure = healthy_pressure.copy()

for i in range(1, DURATION):
    if i < FAULT_START:
        continue

    sev      = oil_starvation[i]
    prev_temp = fault_temp[i - 1]

    # Extra friction heat — proportional to severity, partially to RPM
    friction_heat = 0.0004 * sev * (0.5 + 0.5 * rpm[i] / 3000)

    # Normal engine heat
    engine_heat = 0.00065 * load[i] * (0.65 + 0.35 * rpm[i] / 3000)

    temp_diff = max(prev_temp - ambient_temp[i], 0)
    radiator_cooling = (
        0.000055 * temp_diff
        + 0.0000018 * speed[i] * temp_diff
    )

    fault_temp[i] = (
        prev_temp
        + engine_heat
        + friction_heat      # <-- extra heat the model never saw
        - radiator_cooling
        + rng.normal(0, 0.05)
    )
    fault_temp[i] = np.clip(fault_temp[i], 70, 140)

    # Coolant pressure stays roughly normal (no coolant lost)
    # but becomes noisier as engine vibrations increase with friction
    extra_noise = 0.15 * sev
    fault_pressure[i] = healthy_pressure[i] + rng.normal(0, extra_noise)
    fault_pressure[i] = np.clip(fault_pressure[i], 8, 19)

# ── Throttle / load / speed relationship degrades ────────────
# Driver feels engine struggling → unconsciously eases throttle
# but RPM stays elevated → load appears low for the RPM level
fault_load = load.copy()
for i in range(FAULT_START, DURATION):
    sev = oil_starvation[i]
    # Load appears lower than RPM would predict
    load_suppression = 8 * sev * (0.5 + 0.5 * rng.random())
    fault_load[i] = np.clip(load[i] - load_suppression, 5, 100)

# ── Save ──────────────────────────────────────────────────────
save_scenario("fault_oil_pressure", {
    "Time_s":               t,
    "rpm":                  rpm,
    "speed_kph":            speed,
    "throttle_pos":         throttle,
    "engine_load":          fault_load,
    "coolant_temp_C":       fault_temp,
    "coolant_pressure_PSI": fault_pressure,
    "intake_air_temp_C":    intake_air_temp,
})

print(f"  Healthy temp  (final): {healthy_temp[-1]:.1f} C")
print(f"  Faulty  temp  (final): {fault_temp[-1]:.1f} C")
print(f"  Oil starvation (final): {oil_starvation[-1]:.3f}")
print("=" * 60)
