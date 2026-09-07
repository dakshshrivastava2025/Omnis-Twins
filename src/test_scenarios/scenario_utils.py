"""
scenario_utils.py
-----------------
Shared utilities for all test scenario data generators.

Sensors used (OBD-II standard + easily attachable):
  - rpm               : OBD-II standard (PID 010C)
  - speed_kph         : OBD-II standard (PID 010D)
  - throttle_pos      : OBD-II standard (PID 0111)
  - engine_load       : OBD-II standard (PID 0104)
  - coolant_temp_C    : OBD-II standard (PID 0105)
  - intake_air_temp_C : OBD-II standard (PID 010F)
  - coolant_pressure_PSI : Easily attachable (~$20 pressure transducer on coolant line)
"""

import numpy as np
import pandas as pd
import os

SCHEMA = [
    "Time_s",
    "rpm",
    "speed_kph",
    "throttle_pos",
    "engine_load",
    "coolant_temp_C",
    "coolant_pressure_PSI",
    "intake_air_temp_C",
]

OUT_DIR = r"d:\VIT\hackathon\Code2Create\github\data\test_scenarios"


def correlated_noise(n: int, std: float, alpha: float, rng: np.random.Generator) -> np.ndarray:
    """
    AR(1) correlated noise.

    alpha close to 1.0 = slow-moving drift (persistent).
    alpha close to 0.0 = white noise (fast-changing).
    """
    out = np.zeros(n)
    for i in range(1, n):
        out[i] = alpha * out[i - 1] + rng.normal(0, std * np.sqrt(1 - alpha ** 2))
    return out


def build_drive_profile(duration: int, rng: np.random.Generator, style: str = "normal"):
    """
    Generate correlated RPM / speed / throttle / load / temps for a full drive.

    style options:
        "normal"     - standard urban/highway mix
        "mountain"   - sustained high load, moderate speed
        "aggressive" - high speed bursts, high RPM peaks
    """
    t = np.arange(duration)

    if style == "mountain":
        base_rpm = 2800 + correlated_noise(duration, 200, 0.97, rng)
        base_speed = 55 + correlated_noise(duration, 8, 0.96, rng)
        base_throttle = 72 + correlated_noise(duration, 6, 0.95, rng)
        base_load = 78 + correlated_noise(duration, 5, 0.95, rng)

    elif style == "aggressive":
        base_rpm = 3200 + correlated_noise(duration, 600, 0.93, rng)
        base_speed = 130 + correlated_noise(duration, 20, 0.94, rng)
        base_throttle = 78 + correlated_noise(duration, 12, 0.90, rng)
        base_load = 80 + correlated_noise(duration, 10, 0.92, rng)

    else:  # normal
        base_rpm = 1800 + correlated_noise(duration, 300, 0.95, rng)
        base_speed = 65 + correlated_noise(duration, 15, 0.94, rng)
        base_throttle = 35 + correlated_noise(duration, 8, 0.93, rng)
        base_load = 42 + correlated_noise(duration, 7, 0.92, rng)

    rpm = np.clip(base_rpm, 600, 6000)
    speed = np.clip(base_speed, 0, 200)
    throttle = np.clip(base_throttle, 0, 100)
    load = np.clip(base_load, 5, 100)

    # Ambient temperature with slow daily drift
    ambient_temp = 22 + 4 * np.sin(2 * np.pi * t / duration) + correlated_noise(duration, 0.5, 0.99, rng)

    # Intake air temp tracks ambient + some heat soak at high load
    intake_air_temp = ambient_temp + 0.04 * load + correlated_noise(duration, 0.8, 0.97, rng)
    intake_air_temp = np.clip(intake_air_temp, -10, 60)

    return rpm, speed, throttle, load, ambient_temp, intake_air_temp


def build_healthy_coolant(duration: int, rpm: np.ndarray, load: np.ndarray,
                           speed: np.ndarray, ambient_temp: np.ndarray,
                           rng: np.random.Generator):
    """
    Physics-based healthy coolant temperature and pressure.

    Temperature emerges from the balance of engine heat vs radiator cooling.
    Pressure is driven by temperature and RPM (water pump speed).
    """
    temp = np.zeros(duration)
    temp[0] = ambient_temp[0] + 5

    for i in range(1, duration):
        prev = temp[i - 1]
        engine_heat = 0.00065 * load[i] * (0.65 + 0.35 * rpm[i] / 3000)
        temp_diff = max(prev - ambient_temp[i], 0)
        radiator_cooling = (
            0.000055 * temp_diff
            + 0.0000018 * speed[i] * temp_diff
        )
        delta = engine_heat - radiator_cooling
        temp[i] = prev + delta + rng.normal(0, 0.04)

    temp = np.clip(temp, 70, 120)

    # Pressure: driven by temperature and water pump (RPM)
    pressure = (
        11.5
        + 0.09 * (temp - 70)
        + 0.0005 * rpm
        + correlated_noise(duration, 0.10, 0.93, rng)
    )
    pressure = np.clip(pressure, 8, 19)

    return temp, pressure


def save_scenario(name: str, arrays: dict) -> str:
    """Build a DataFrame from arrays dict and save to the test_scenarios folder."""
    os.makedirs(OUT_DIR, exist_ok=True)
    df = pd.DataFrame(arrays)[SCHEMA].round(2)
    path = os.path.join(OUT_DIR, f"{name}.csv")
    df.to_csv(path, index=False)
    print(f"  Saved {len(df)} rows -> {path}")
    return path
