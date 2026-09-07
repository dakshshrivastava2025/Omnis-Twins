"""
edge_aggressive_highway.py
--------------------------
EDGE CASE: Aggressive Highway Driving / Hard Acceleration Bursts

This is NOT a fault — this is normal driving done enthusiastically.

What happens physically:
    Hard acceleration to highway speeds, sustained high-speed cruising,
    and occasional overtaking bursts. All sensors spike together during
    acceleration, then settle during cruise. The key: every spike is
    internally consistent (high throttle → high load → high RPM → high
    speed — all happening simultaneously).

      - Speed: 120–165 kph (sustained), with bursts to 180+ during overtake
      - RPM: 3000–5000 during acceleration, 2200–2800 at cruise
      - Throttle: near 100% during bursts, 30–50% at cruise
      - Engine load: 85–98% during bursts, 40–60% at cruise
      - Coolant temp: 95–110°C (high but consistent with load)
      - Coolant pressure: proportionally elevated with temp

Why the autoencoder should NOT flag this:
    During acceleration bursts, ALL sensors peak together.
    During cruise, ALL sensors settle together.
    The correlations are perfectly intact — the autoencoder can reconstruct
    this pattern because it saw high-load/high-RPM sections in training.
    It may briefly approach the threshold during extreme bursts, but should
    recover immediately and NOT persistently breach it.

Expected result: MSE stays mostly below threshold, possible brief spikes
during extreme acceleration that immediately recover. No sustained anomaly.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

import numpy as np
from scenario_utils import (
    correlated_noise, build_drive_profile, build_healthy_coolant, save_scenario, save_report
)

DURATION = 7200
SEED     = 31

rng = np.random.default_rng(SEED)
t   = np.arange(DURATION)

print("=" * 60)
print("EDGE CASE: Aggressive Highway Driving")
print("=" * 60)

# ── Base aggressive drive profile ────────────────────────────
rpm, speed, throttle, load, ambient_temp, intake_air_temp = build_drive_profile(
    DURATION, rng, style="aggressive"
)

# ── Acceleration burst events ─────────────────────────────────
# Approximately every 8–15 minutes, simulate a hard overtake event.
# During each event, ALL sensors spike together — this is the key.
# The pattern is: throttle to 100%, load to 90–98%, RPM peaks, speed rises.

n_bursts = rng.integers(12, 20)

for _ in range(n_bursts):
    burst_start    = rng.integers(120, DURATION - 300)
    burst_duration = rng.integers(20, 60)         # 20–60 second burst
    burst_end      = min(burst_start + burst_duration, DURATION)

    # Smooth burst shape (ramp up, sustain, ramp down)
    half   = burst_duration // 2
    ramp   = np.linspace(0, 1, half)
    sustain = np.ones(burst_duration - half)
    burst_shape = np.concatenate([ramp, sustain])[:burst_end - burst_start]

    throttle_peak = rng.uniform(85, 100)
    load_peak     = rng.uniform(80, 98)
    rpm_peak      = rng.uniform(3800, 5200)
    speed_gain    = rng.uniform(15, 35)

    # All sensors respond together — correlated burst
    throttle[burst_start:burst_end] = np.clip(
        throttle[burst_start:burst_end] * (1 - burst_shape) + throttle_peak * burst_shape, 0, 100
    )
    load[burst_start:burst_end] = np.clip(
        load[burst_start:burst_end] * (1 - burst_shape) + load_peak * burst_shape, 5, 100
    )
    rpm[burst_start:burst_end] = np.clip(
        rpm[burst_start:burst_end] * (1 - burst_shape) + rpm_peak * burst_shape, 600, 7000
    )
    speed[burst_start:burst_end] = np.clip(
        speed[burst_start:burst_end] + speed_gain * burst_shape, 0, 200
    )

# ── Coolant: elevated but fully correlated with load/RPM ─────
healthy_temp, healthy_pressure = build_healthy_coolant(
    DURATION, rpm, load, speed, ambient_temp, rng
)

# Highway driving: good airflow through radiator keeps temp in check
# even though load is high — this is realistic and correlated
airflow_bonus = 0.0000015 * speed  # extra cooling from highway wind
corrected_pressure = np.zeros(DURATION)
corrected_temp     = np.zeros(DURATION)

corrected_temp[0] = healthy_temp[0]
for i in range(1, DURATION):
    prev      = corrected_temp[i - 1]
    eh        = 0.00065 * load[i] * (0.65 + 0.35 * rpm[i] / 3000)
    td        = max(prev - ambient_temp[i], 0)
    rc        = (0.000055 + airflow_bonus[i]) * td
    corrected_temp[i] = np.clip(prev + eh - rc + rng.normal(0, 0.04), 70, 120)

corrected_pressure = (
    11.5
    + 0.09 * (corrected_temp - 70)
    + 0.0005 * rpm
    + correlated_noise(DURATION, 0.10, 0.93, rng)
)
corrected_pressure = np.clip(corrected_pressure, 8, 19)

# ── Save ──────────────────────────────────────────────────────
save_scenario("edge_aggressive_highway", {
    "Time_s":               t,
    "rpm":                  rpm,
    "speed_kph":            speed,
    "throttle_pos":         throttle,
    "engine_load":          load,
    "coolant_temp_C":       corrected_temp,
    "coolant_pressure_PSI": corrected_pressure,
    "intake_air_temp_C":    intake_air_temp,
})

save_report("edge_aggressive_highway", {
    "scenario_type": "Edge Case",
    "title": "Aggressive Highway Drive",
    "description": (
        "Hard acceleration bursts to 130-165 kph with sustained high-speed cruising. "
        "All sensors spike simultaneously during bursts (throttle to 100%, "
        "load to 90-98%, RPM to 4000-5500) then settle together during cruise. "
        "This is normal performance driving, NOT a fault."
    ),
    "sensor_deltas": [
        ("speed_kph",      "HIGH (130-165 kph sustained)",  "Aggressive highway cruising"),
        ("rpm",            "HIGH (peaks to 5500+)",          "High-gear acceleration bursts"),
        ("throttle_pos",   "HIGH during bursts (85-100%)",  "Hard overtake / acceleration events"),
        ("engine_load",    "HIGH during bursts (85-98%)",   "Full demand during acceleration"),
        ("coolant_temp_C", "ELEVATED (avg 115 C)",          "High sustained load, but correlated"),
    ],
    "stats": {
        "Avg speed": f"{speed.mean():.1f} kph  (normal ~65)",
        "Max speed": f"{speed.max():.1f} kph",
        "Avg RPM": f"{rpm.mean():.0f}",
        "Max RPM": f"{rpm.max():.0f}",
        "Avg coolant temp": f"{corrected_temp.mean():.1f} C",
        "Max coolant temp": f"{corrected_temp.max():.1f} C",
        "Burst events": str(n_bursts),
    },
    "expected_mse": "LOW sustained — brief spikes during extreme bursts only, no persistent breach",
    "root_sensor": None,
    "failing_comp": None,
})

print(f"  Avg speed       : {speed.mean():.1f} kph  (normal ~65)")
print(f"  Max speed       : {speed.max():.1f} kph")
print(f"  Avg RPM         : {rpm.mean():.0f}")
print(f"  Max RPM         : {rpm.max():.0f}")
print(f"  Avg coolant temp: {corrected_temp.mean():.1f} C")
print(f"  Max coolant temp: {corrected_temp.max():.1f} C")
print(f"  Burst events    : {n_bursts}")
print("  -> All sensors burst and recover together — expect LOW sustained MSE")
print("=" * 60)
