import numpy as np
import pandas as pd


# ============================================================
# SYNTHETIC VEHICLE SENSOR DATA
# Predictive Maintenance / Autoencoder Demo
#
# Output:
#   calibration_2h.csv
#   live_2h_with_fault.csv
#
# Sampling:
#   1 Hz
#   2 hours
#   7200 samples
# ============================================================


# ============================================================
# CONFIGURATION
# ============================================================

SEED = 42

rng = np.random.default_rng(SEED)

DURATION = 2 * 60 * 60       # 2 hours
FAULT_START = 40 * 60        # Physical fault begins around 40 min
WARNING_TIME = 100 * 60      # Severe fault around 100 min


# ============================================================
# TIME
# ============================================================

t = np.arange(DURATION)


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def correlated_noise(n, std, alpha=0.95):
    """
    Generates realistic slowly varying noise.

    Independent noise:
        1.0, -0.4, 0.8, -0.2, ...

    Correlated noise:
        0.1, 0.12, 0.14, 0.11, 0.16, ...

    Real sensors tend to have correlated noise.
    """

    x = np.zeros(n)

    if n == 0:
        return x

    x[0] = rng.normal(0, std)

    for i in range(1, n):

        x[i] = (
            alpha * x[i - 1]
            + rng.normal(
                0,
                std * np.sqrt(1 - alpha ** 2)
            )
        )

    return x


def moving_average(signal, window):

    kernel = np.ones(window) / window

    return np.convolve(
        signal,
        kernel,
        mode="same"
    )


# ============================================================
# AMBIENT TEMPERATURE
# ============================================================

ambient_temp = (
    28
    + 1.2 * np.sin(
        2 * np.pi * t / DURATION
    )
    + correlated_noise(
        DURATION,
        0.35,
        0.995
    )
)


# ============================================================
# INTAKE AIR TEMPERATURE
# ============================================================

intake_air_temp = (
    ambient_temp
    + 0.8
    + correlated_noise(
        DURATION,
        0.35,
        0.97
    )
)


# ============================================================
# DRIVING PROFILE
# ============================================================
#
# The driving profile is generated ONCE and reused for both
# datasets.
#
# This is important:
#
# calibration:
#       healthy vehicle + driving
#
# live:
#       same driving + developing fault
#
# Therefore the anomaly isn't caused by different driving.
# ============================================================

speed_target = np.zeros(DURATION)


# ------------------------------------------------------------
# Driving segments
# ------------------------------------------------------------

segments = [

    # start minute, end minute, type
    (0,   12,  "city"),
    (12,  30,  "highway"),
    (30,  45,  "city"),
    (45,  62,  "highway"),
    (62,  78,  "city"),
    (78,  96,  "highway"),
    (96,  110, "city"),
    (110, 120, "highway"),
]


for start_min, end_min, mode in segments:

    start = start_min * 60
    end = end_min * 60

    length = end - start

    if mode == "city":

        base_speed = rng.uniform(
            30,
            45
        )

        variation = rng.normal(
            0,
            5,
            length
        )

    else:

        base_speed = rng.uniform(
            85,
            105
        )

        variation = rng.normal(
            0,
            4,
            length
        )

    # Smooth driver behavior
    variation = moving_average(
        variation,
        30
    )

    speed_target[start:end] = (
        base_speed
        + variation
    )


# ============================================================
# TRAFFIC EVENTS
# ============================================================
#
# Stops, slowdowns and accelerations.
# ============================================================

for _ in range(30):

    start = rng.integers(
        0,
        DURATION - 45
    )

    duration = rng.integers(
        8,
        40
    )

    event = rng.choice([
        "stop",
        "slowdown",
        "acceleration"
    ])


    if event == "stop":

        speed_target[
            start:start + duration
        ] *= rng.uniform(
            0,
            0.05
        )


    elif event == "slowdown":

        speed_target[
            start:start + duration
        ] *= rng.uniform(
            0.35,
            0.70
        )


    else:

        speed_target[
            start:start + duration
        ] += rng.uniform(
            10,
            25
        )


speed_target = np.clip(
    speed_target,
    0,
    120
)


# ============================================================
# ACTUAL SPEED
# ============================================================

speed = np.zeros(DURATION)

for i in range(1, DURATION):

    error = (
        speed_target[i]
        - speed[i - 1]
    )


    # Acceleration and braking aren't instantaneous.

    if error > 0:

        max_change = rng.uniform(
            0.4,
            1.4
        )

    else:

        max_change = rng.uniform(
            0.6,
            2.0
        )


    change = np.clip(
        error * 0.20,
        -max_change,
        max_change
    )


    speed[i] = (
        speed[i - 1]
        + change
        + rng.normal(
            0,
            0.10
        )
    )


speed = np.clip(
    speed,
    0,
    120
)


# ============================================================
# THROTTLE POSITION
# ============================================================

throttle = np.zeros(DURATION)


for i in range(1, DURATION):

    acceleration = (
        speed[i]
        - speed[i - 1]
    )


    # Base throttle requirement
    desired = (
        4
        + 0.17 * speed[i]
    )


    # Extra throttle during acceleration
    if acceleration > 0:

        desired += (
            5
            * acceleration
        )


    # Almost closed throttle while stopped
    if speed[i] < 2:

        desired = rng.uniform(
            2,
            6
        )


    # Driver input has inertia
    throttle[i] = (
        0.90 * throttle[i - 1]
        + 0.10 * desired
        + rng.normal(
            0,
            0.8
        )
    )


throttle = np.clip(
    throttle,
    0,
    100
)


# ============================================================
# ENGINE RPM
# ============================================================

rpm = np.zeros(DURATION)

gear = 1


gear_ratio = {
    1: 70,
    2: 45,
    3: 33,
    4: 26,
    5: 20
}


for i in range(1, DURATION):

    current_speed = speed[i]


    if current_speed < 3:

        target_rpm = 750


    else:

        # Simplified automatic transmission
        if current_speed < 25:
            gear = 1

        elif current_speed < 50:
            gear = 2

        elif current_speed < 75:
            gear = 3

        elif current_speed < 100:
            gear = 4

        else:
            gear = 5


        target_rpm = (
            650
            + current_speed
            * gear_ratio[gear]
        )


        # Throttle affects RPM
        target_rpm += (
            2.2 * throttle[i]
        )


    rpm[i] = (
        0.87 * rpm[i - 1]
        + 0.13 * target_rpm
        + rng.normal(
            0,
            20
        )
    )


rpm = np.clip(
    rpm,
    650,
    5000
)


# ============================================================
# ENGINE LOAD
# ============================================================

acceleration = np.diff(
    speed,
    prepend=speed[0]
)


engine_load = (
    0.38 * throttle
    + 0.18 * (rpm / 40)
    + 0.15 * (speed / 1.5)
    + correlated_noise(
        DURATION,
        2.0,
        0.93
    )
)


# Extra load during acceleration
engine_load += (
    np.maximum(
        acceleration,
        0
    )
    * 6
)


engine_load = np.clip(
    engine_load,
    5,
    100
)


# ============================================================
# HEALTHY COOLANT TEMPERATURE
# ============================================================
#
# Simple thermal model:
#
#             ENGINE
#          heat generation
#                ↓
#        ┌───────────────┐
#        │    COOLANT    │
#        └───────────────┘
#                ↓
#            RADIATOR
#                ↓
#             ambient
#
# Temperature has thermal inertia, so it doesn't jump around
# with every change in RPM.
# ============================================================

healthy_temp = np.zeros(DURATION)

healthy_temp[0] = 72.0


for i in range(1, DURATION):

    previous_temp = healthy_temp[i - 1]


    # --------------------------------------------------------
    # Heat generated by engine
    # --------------------------------------------------------

    engine_heat = (
        0.00065
        * engine_load[i]
        *
        (
            0.65
            + 0.35 * rpm[i] / 3000
        )
    )


    # --------------------------------------------------------
    # Temperature difference
    # --------------------------------------------------------

    delta_temperature = max(
        previous_temp
        - ambient_temp[i],
        0
    )


    # --------------------------------------------------------
    # Radiator cooling
    #
    # Higher speed = more airflow
    # --------------------------------------------------------

    radiator_cooling = (
        0.000055
        * delta_temperature
        +
        0.0000018
        * speed[i]
        * delta_temperature
    )


    # --------------------------------------------------------
    # Thermal state update
    # --------------------------------------------------------

    d_temp = (
        engine_heat
        - radiator_cooling
    )


    healthy_temp[i] = (
        previous_temp
        + d_temp
        + rng.normal(
            0,
            0.018
        )
    )


healthy_temp = np.clip(
    healthy_temp,
    65,
    105
)


# ============================================================
# HEALTHY COOLANT PRESSURE
# ============================================================

healthy_pressure = (
    11.8
    + 0.10
    * (
        healthy_temp
        - 70
    )
    + 0.0006 * rpm
    + correlated_noise(
        DURATION,
        0.10,
        0.96
    )
    + rng.normal(
        0,
        0.04,
        DURATION
    )
)


healthy_pressure = np.clip(
    healthy_pressure,
    8,
    18
)


# ============================================================
# CALIBRATION DATASET
# ============================================================

calibration = pd.DataFrame({

    "Time_s": t,

    "rpm": rpm,

    "speed_kph": speed,

    "throttle_pos": throttle,

    "engine_load": engine_load,

    "coolant_temp_C": healthy_temp,

    "coolant_pressure_PSI": healthy_pressure,

    "intake_air_temp_C": intake_air_temp

})


calibration = calibration.round(2)


import os
out_dir = r"d:\VIT\hackathon\Code2Create\github\data\calibration"
os.makedirs(out_dir, exist_ok=True)
calibration.to_csv(os.path.join(out_dir, "baseline_drive.csv"), index=False)


# ============================================================
# LIVE DATASET
# ============================================================

live = calibration.copy()


fault_temp = healthy_temp.copy()
fault_pressure = healthy_pressure.copy()


# ============================================================
# DEVELOPING LEAK MODEL
# ============================================================
#
# The leak has a LATENT severity.
#
# It doesn't simply go:
#
#     0 → 1 → 2 → 3 → 4
#
# Instead, it behaves more like a physical degradation process:
#
#
# 0-40 min
# ───────────────────────
#
# 40-55 min
#       tiny irregular changes
#
# 55-75 min
#          increasingly persistent
#
# 75-100 min
#                  strong degradation
#
# 100-120 min
#                          severe
#
# ============================================================

leak_target = np.zeros(DURATION)


for i in range(DURATION):

    minutes = i / 60


    # --------------------------------------------------------
    # Completely healthy
    # --------------------------------------------------------

    if minutes < 40:

        target = 0.0


    # --------------------------------------------------------
    # EARLY PHYSICAL DEGRADATION
    # 40-50 minutes
    #
    # Almost invisible.
    # --------------------------------------------------------

    elif minutes < 50:

        p = (
            minutes - 40
        ) / 10

        target = (
            0.015
            + 0.045 * p
        )


    # --------------------------------------------------------
    # PRECURSOR PHASE
    # 50-60 minutes
    #
    # Increasing variance and occasional pressure loss.
    # --------------------------------------------------------

    elif minutes < 60:

        p = (
            minutes - 50
        ) / 10

        target = (
            0.06
            + 0.08 * p
        )


    # --------------------------------------------------------
    # DEVELOPING FAULT
    # 60-75 minutes
    # --------------------------------------------------------

    elif minutes < 75:

        p = (
            minutes - 60
        ) / 15

        target = (
            0.14
            + 0.18 * p
        )


    # --------------------------------------------------------
    # CLEAR DEGRADATION
    # 75-90 minutes
    # --------------------------------------------------------

    elif minutes < 90:

        p = (
            minutes - 75
        ) / 15

        target = (
            0.32
            + 0.33 * p
        )


    # --------------------------------------------------------
    # TERMINAL DEGRADATION EQUILIBRIUM (PLATEAU)
    # 90-120 minutes
    #
    # Fault reaches maximum aperture / steady-state severity.
    # System stabilizes at degraded operating equilibrium.
    # --------------------------------------------------------

    else:

        target = 0.65


    leak_target[i] = target


# ============================================================
# ADD NATURAL VARIATION TO LEAK PROGRESSION
# ============================================================
#
# This is what prevents a perfectly smooth upward line.
# ============================================================

leak_noise = correlated_noise(
    DURATION,
    0.08,
    0.985
)


# Small random disturbances
short_term_noise = correlated_noise(
    DURATION,
    0.035,
    0.85
)


raw_leak = (
    leak_target
    + leak_noise
    + short_term_noise
)


# ============================================================
# TEMPORARY RECOVERY / WORSENING EVENTS
# ============================================================
#
# Real faults can temporarily appear better or worse.
# ============================================================

for _ in range(18):

    start = rng.integers(
        FAULT_START,
        DURATION - 30
    )

    duration = rng.integers(
        10,
        90
    )

    magnitude = rng.uniform(
        -0.08,
        0.08
    )


    # Gradually apply and remove the disturbance
    event_curve = np.sin(
        np.linspace(
            0,
            np.pi,
            duration
        )
    )


    end = min(
        start + duration,
        DURATION
    )

    length = end - start

    raw_leak[
        start:end
    ] += (
        magnitude
        * event_curve[:length]
    )


# ============================================================
# PHYSICAL INERTIA OF THE LEAK
# ============================================================

leak = np.zeros(DURATION)


for i in range(1, DURATION):

    if i < FAULT_START:

        leak[i] = 0

    else:

        # Leak severity has inertia.
        # It follows its target but cannot jump instantly.

        leak[i] = (
            0.985 * leak[i - 1]
            + 0.015 * raw_leak[i]
        )


leak = np.clip(
    leak,
    0,
    1
)


# ============================================================
# GENERATE FAULTY COOLANT SIGNALS
# ============================================================

for i in range(1, DURATION):


    # ========================================================
    # BEFORE PHYSICAL FAULT
    # ========================================================

    if i < FAULT_START:

        fault_temp[i] = (
            healthy_temp[i]
        )

        fault_pressure[i] = (
            healthy_pressure[i]
        )

        continue


    previous_temp = fault_temp[i - 1]


    current_leak = leak[i]


    # ========================================================
    # COOLANT PRESSURE
    # ========================================================
    #
    # Healthy pressure depends on temperature and RPM.
    #
    # Leak introduces:
    #   - lower average pressure
    #   - higher variability
    #   - occasional transient dips
    # ========================================================

    expected_pressure = (
        11.8
        + 0.10
        * (
            previous_temp
            - 70
        )
        + 0.0006 * rpm[i]
    )


    # Pressure loss isn't purely proportional.
    #
    # More load / RPM makes the effect more visible.

    pressure_loss = (
        5.8
        * current_leak
        *
        (
            0.60
            +
            0.40
            * engine_load[i]
            / 100
        )
    )


    # Sensor becomes somewhat noisier as the fault worsens.

    pressure_noise_std = (
        0.08
        + 0.22 * current_leak
    )


    pressure_noise = rng.normal(
        0,
        pressure_noise_std
    )


    # Occasional transient pressure recovery
    # keeps the signal from becoming a perfect downward line.

    if rng.random() < (
        0.008
        + 0.015 * current_leak
    ):

        pressure_noise += rng.uniform(
            0.25,
            0.7
        )


    fault_pressure[i] = (
        expected_pressure
        - pressure_loss
        + pressure_noise
    )


    # ========================================================
    # COOLING EFFICIENCY
    # ========================================================
    #
    # The leak progressively reduces the effectiveness of the
    # cooling system.
    #
    # IMPORTANT:
    #
    # We do NOT add an artificial temperature ramp.
    #
    # Temperature rises because the physical model now removes
    # less heat.
    # ========================================================

    cooling_efficiency = (
        1.0
        - 0.50 * current_leak
    )


    # ========================================================
    # ENGINE HEAT
    # ========================================================

    engine_heat = (
        0.00065
        * engine_load[i]
        *
        (
            0.65
            + 0.35 * rpm[i] / 3000
        )
    )


    # ========================================================
    # RADIATOR COOLING
    # ========================================================

    temperature_difference = max(
        previous_temp
        - ambient_temp[i],
        0
    )


    radiator_cooling = (
        0.000055
        * temperature_difference
        +
        0.0000018
        * speed[i]
        * temperature_difference
    )


    # Apply leak-related reduction.

    radiator_cooling *= (
        cooling_efficiency
    )


    # ========================================================
    # ADDITIONAL HEAT RETENTION
    # ========================================================
    #
    # Coolant loss means the system has slightly less thermal
    # capacity. This becomes noticeable only as the fault
    # becomes significant.
    # ========================================================

    heat_retention = (
        0.00010
        * current_leak
        * engine_load[i]
    )


    # ========================================================
    # TEMPERATURE UPDATE
    # ========================================================

    d_temp = (
        engine_heat
        - radiator_cooling
        + heat_retention
    )


    # Sensor noise also increases slightly with degradation.

    temp_noise = rng.normal(
        0,
        0.018
        + 0.025 * current_leak
    )


    fault_temp[i] = (
        previous_temp
        + d_temp
        + temp_noise
    )


# ============================================================
# PHYSICAL SENSOR LIMITS
# ============================================================

fault_temp = np.clip(
    fault_temp,
    65,
    125
)

fault_pressure = np.clip(
    fault_pressure,
    3,
    20
)


# ============================================================
# INSERT FAULT SIGNALS
# ============================================================

live["coolant_temp_C"] = (
    fault_temp
)

live["coolant_pressure_PSI"] = (
    fault_pressure
)


# ============================================================
# ROUND SENSOR VALUES
# ============================================================

live = live.round(2)


# ============================================================
# SAVE
# ============================================================

live.to_csv(os.path.join(out_dir, "anomaly_drive.csv"), index=False)


# ============================================================
# SUMMARY
# ============================================================

print()
print("=" * 65)
print("SYNTHETIC VEHICLE DATA GENERATION COMPLETE")
print("=" * 65)

print()

print("Files:")
print("  calibration_2h.csv")
print("  live_2h_with_fault.csv")

print()

print("Dataset:")
print("  Duration       : 2 hours")
print("  Sampling rate  : 1 Hz")
print("  Samples        :", DURATION)

print()

print("Fault progression:")
print("  0-40 min       : Healthy")
print("  40-50 min      : Very early physical degradation")
print("  50-60 min      : Subtle precursor signs")
print("  60-75 min      : Developing fault")
print("  75-90 min      : Clear degradation")
print("  90-105 min     : Serious degradation")
print("  105-120 min    : Severe fault / warning territory")

print()

print("Coolant temperature:")
print(
    f"  Healthy final  : "
    f"{healthy_temp[-1]:.2f} °C"
)

print(
    f"  Faulty final   : "
    f"{fault_temp[-1]:.2f} °C"
)

print()

print("Coolant pressure:")
print(
    f"  Healthy final  : "
    f"{healthy_pressure[-1]:.2f} PSI"
)

print(
    f"  Faulty final   : "
    f"{fault_pressure[-1]:.2f} PSI"
)

print()

print("Fault severity:")
print(
    f"  At 40 min      : "
    f"{leak[40 * 60]:.3f}"
)

print(
    f"  At 60 min      : "
    f"{leak[60 * 60]:.3f}"
)

print(
    f"  At 80 min      : "
    f"{leak[80 * 60]:.3f}"
)

print(
    f"  At 100 min     : "
    f"{leak[100 * 60]:.3f}"
)

print(
    f"  At 120 min     : "
    f"{leak[-1]:.3f}"
)

print("=" * 65)