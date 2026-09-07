"""
edge_mountain_drive.py
----------------------
EDGE CASE: Sustained Uphill / Mountain Driving

This is NOT a fault — this is normal driving under high stress conditions.

What happens physically:
    Driving uphill requires significantly more engine torque to overcome
    gravity. This means:
      - Engine load: 70–92% (vs ~40% on flat roads)
      - RPM: 2500–3500 (driver downshifts to maintain torque)
      - Coolant temperature: 100–112°C (engine working hard → more heat)
      - Coolant pressure: proportionally higher (temp-driven)
      - Speed: moderate, 40–65 kph (going uphill, not fast)
      - Throttle: 65–85% (sustained wide-open throttle sections)

Why the autoencoder should NOT flag this:
    ALL sensors rise together in a PHYSICALLY CONSISTENT way:
      high throttle → high load → high RPM → elevated temp → elevated pressure
    The autoencoder learned these correlations during training (it saw high-
    load sections in the calibration drive). Even though the absolute values
    are elevated, the relationships between sensors remain intact.
    Reconstruction error stays LOW.

Expected result: MSE stays below threshold throughout. No anomaly flagged.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

import numpy as np
from scenario_utils import (
    correlated_noise, build_drive_profile, build_healthy_coolant, save_scenario
)

DURATION = 7200
SEED     = 55

rng = np.random.default_rng(SEED)
t   = np.arange(DURATION)

print("=" * 60)
print("EDGE CASE: Mountain / Sustained Uphill Drive")
print("=" * 60)

# ── Drive profile — mountain style (high sustained load) ──────
rpm, speed, throttle, load, ambient_temp, intake_air_temp = build_drive_profile(
    DURATION, rng, style="mountain"
)

# Add realistic gradient variation — steeper and shallower sections
gradient_profile = np.sin(2 * np.pi * t / (DURATION / 4)) * 0.15 + 0.05
gradient_profile = np.clip(gradient_profile, -0.05, 0.20)

# Gradient increases load and reduces speed proportionally
gradient_load_effect = 25 * gradient_profile
gradient_speed_effect = -15 * gradient_profile

load  = np.clip(load + gradient_load_effect, 10, 98)
speed = np.clip(speed + gradient_speed_effect, 10, 120)

# Higher load → more throttle needed
throttle = np.clip(throttle + 0.5 * gradient_load_effect, 0, 100)

# ── Coolant: runs hotter but CORRELATED with load/RPM ────────
healthy_temp, healthy_pressure = build_healthy_coolant(
    DURATION, rpm, load, speed, ambient_temp, rng
)

# On mountain drives, ambient temp at altitude is cooler (helps cooling)
# but the sustained high load keeps temp elevated anyway
altitude_cooling = correlated_noise(DURATION, 2, 0.99, rng)  # temp variation with altitude
healthy_temp = np.clip(healthy_temp + altitude_cooling, 70, 118)

# Pressure follows temperature (as always in healthy system)
healthy_pressure = (
    11.5
    + 0.09 * (healthy_temp - 70)
    + 0.0005 * rpm
    + correlated_noise(DURATION, 0.10, 0.93, rng)
)
healthy_pressure = np.clip(healthy_pressure, 8, 19)

# ── Save ──────────────────────────────────────────────────────
save_scenario("edge_mountain_drive", {
    "Time_s":               t,
    "rpm":                  rpm,
    "speed_kph":            speed,
    "throttle_pos":         throttle,
    "engine_load":          load,
    "coolant_temp_C":       healthy_temp,
    "coolant_pressure_PSI": healthy_pressure,
    "intake_air_temp_C":    intake_air_temp,
})

print(f"  Avg engine load : {load.mean():.1f}%  (vs ~42% normal)")
print(f"  Avg RPM         : {rpm.mean():.0f}    (vs ~1800 normal)")
print(f"  Avg coolant temp: {healthy_temp.mean():.1f} C")
print(f"  Max coolant temp: {healthy_temp.max():.1f} C")
print(f"  Avg speed       : {speed.mean():.1f} kph")
print("  -> All sensors correlated — expect LOW MSE")
print("=" * 60)
