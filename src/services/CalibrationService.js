/**
 * Calibration Service
 * Manages adaptive baseline threshold models, environmental context state,
 * baseline drift telemetry, false-positive suppression metrics, and baseline sample submission APIs.
 * 
 * Isolated from production telemetry/diagnostic providers so real endpoints
 * (e.g. POST /api/calibration/baseline, POST /api/recalibrate, POST /api/zero-point-reset)
 * can be plugged in seamlessly.
 */

// In-memory baseline storage serving as backend source of truth for samples and calculated statistics
export const INITIAL_CALIBRATION_STATE = {
  activeProfile: "ADAPTIVE_DEFAULT_v4.2",
  environment: "ASPHALT", // ASPHALT | GRAVEL | OFF_ROAD
  drivingState: "CITY_CRUISE", // CITY_CRUISE | HIGHWAY | HIGH_LOAD
  context: {
    ambientTemp: "24.5 °C",
    vehicleSpeed: "54 km/h",
    terrainRoughness: "0.12 g RMS",
    lastUpdated: "Just now",
  },
  recalibration: {
    nextScheduled: "2026-11-01 (In 54 days)",
    lastRecalibrated: "2026-09-01 08:30:00 UTC",
    schedulePeriod: "2-Month Automated Cycle",
    sourceConfig: "FACTORY_BASELINE_v4.2",
    inProgress: false,
  },
  suppressionMetrics: {
    framesEvaluated: 1428590,
    rawAnomaliesAvoided: 3412,
    falseAlarmsSuppressed: 98.4, // percentage
    trueAnomaliesConfirmed: 4,
  },
  baselines: [
    {
      id: "metric-acoustic",
      sensorId: "sensor-audio-fl",
      metric: "Acoustic Noise (Brake FL)",
      componentId: "brakes",
      componentName: "Front Left Brake",
      unit: "dB",
      originalMean: 45.0,
      originalStdDev: 3.5,
      activeMean: 48.2,
      activeStdDev: 4.1,
      currentValue: 78.4,
      zScore: 7.37,
      status: "critical",
      samplesCount: 24,
      lastSampleSubmitted: "2026-09-01 08:30:00 UTC",
      history: [
        { time: "08:00", value: 46.1, mean: 48.0, upper3s: 60.3, lower3s: 35.7 },
        { time: "09:00", value: 47.5, mean: 48.0, upper3s: 60.3, lower3s: 35.7 },
        { time: "10:00", value: 52.0, mean: 48.1, upper3s: 60.4, lower3s: 35.8 },
        { time: "11:00", value: 61.2, mean: 48.2, upper3s: 60.5, lower3s: 35.9 },
        { time: "12:00", value: 72.8, mean: 48.2, upper3s: 60.5, lower3s: 35.9 },
        { time: "13:00", value: 78.4, mean: 48.2, upper3s: 60.5, lower3s: 35.9 },
      ],
      details: "High-frequency squeal spectrum monitoring on front left rotor. Z-score 7.37 indicates severe localized lining wear.",
    },
    {
      id: "metric-vibration",
      sensorId: "sensor-vib-susp",
      metric: "Vibration Frequency (Rear Strut)",
      componentId: "suspension",
      componentName: "Rear Left Suspension",
      unit: "g RMS",
      originalMean: 1.80,
      originalStdDev: 0.25,
      activeMean: 2.10,
      activeStdDev: 0.30,
      currentValue: 4.18,
      zScore: 6.93,
      status: "critical",
      samplesCount: 18,
      lastSampleSubmitted: "2026-09-01 08:30:00 UTC",
      history: [
        { time: "08:00", value: 1.95, mean: 2.05, upper3s: 2.95, lower3s: 1.15 },
        { time: "09:00", value: 2.10, mean: 2.08, upper3s: 2.98, lower3s: 1.18 },
        { time: "10:00", value: 2.85, mean: 2.09, upper3s: 2.99, lower3s: 1.19 },
        { time: "11:00", value: 3.40, mean: 2.10, upper3s: 3.00, lower3s: 1.20 },
        { time: "12:00", value: 3.90, mean: 2.10, upper3s: 3.00, lower3s: 1.20 },
        { time: "13:00", value: 4.18, mean: 2.10, upper3s: 3.00, lower3s: 1.20 },
      ],
      details: "Strut damping vertical vibration response. Elevated Z-score indicates reduced hydraulic fluid damping response.",
    },
    {
      id: "metric-thermal",
      sensorId: "sensor-temp-bat",
      metric: "Battery Pack Delta Temp",
      componentId: "battery",
      componentName: "HV Battery Pack",
      unit: "°C",
      originalMean: 4.2,
      originalStdDev: 1.1,
      activeMean: 5.5,
      activeStdDev: 1.4,
      currentValue: 9.2,
      zScore: 2.64,
      status: "warning",
      samplesCount: 30,
      lastSampleSubmitted: "2026-09-01 08:30:00 UTC",
      history: [
        { time: "08:00", value: 4.8, mean: 5.2, upper3s: 9.4, lower3s: 1.0 },
        { time: "09:00", value: 5.1, mean: 5.3, upper3s: 9.5, lower3s: 1.1 },
        { time: "10:00", value: 6.4, mean: 5.4, upper3s: 9.6, lower3s: 1.2 },
        { time: "11:00", value: 7.8, mean: 5.5, upper3s: 9.7, lower3s: 1.3 },
        { time: "12:00", value: 8.5, mean: 5.5, upper3s: 9.7, lower3s: 1.3 },
        { time: "13:00", value: 9.2, mean: 5.5, upper3s: 9.7, lower3s: 1.3 },
      ],
      details: "HV battery cell thermistor differential. Z-score 2.64 triggers attention state for Module #3 cooling loop.",
    },
    {
      id: "metric-tpms",
      sensorId: "sensor-tpms-fl",
      metric: "Tire Cold Inflation Delta (FL)",
      componentId: "wheels",
      componentName: "Front Left Wheel & Tire",
      unit: "PSI",
      originalMean: 34.0,
      originalStdDev: 0.8,
      activeMean: 33.8,
      activeStdDev: 0.9,
      currentValue: 31.5,
      zScore: -2.55,
      status: "warning",
      samplesCount: 15,
      lastSampleSubmitted: "2026-09-01 08:30:00 UTC",
      history: [
        { time: "08:00", value: 33.8, mean: 33.8, upper3s: 36.5, lower3s: 31.1 },
        { time: "09:00", value: 33.2, mean: 33.8, upper3s: 36.5, lower3s: 31.1 },
        { time: "10:00", value: 32.8, mean: 33.8, upper3s: 36.5, lower3s: 31.1 },
        { time: "11:00", value: 32.2, mean: 33.8, upper3s: 36.5, lower3s: 31.1 },
        { time: "12:00", value: 31.8, mean: 33.8, upper3s: 36.5, lower3s: 31.1 },
        { time: "13:00", value: 31.5, mean: 33.8, upper3s: 36.5, lower3s: 31.1 },
      ],
      details: "Tire pressure transducer tracking. Z-score -2.55 indicates slow pressure deflation relative to ambient temperature.",
    },
    {
      id: "metric-engine-vib",
      sensorId: "sensor-vib-eng",
      metric: "Front Motor Tri-Axial Vib",
      componentId: "engine",
      componentName: "Engine / Front Motor",
      unit: "g RMS",
      originalMean: 1.40,
      originalStdDev: 0.20,
      activeMean: 1.42,
      activeStdDev: 0.22,
      currentValue: 1.42,
      zScore: 0.00,
      status: "healthy",
      samplesCount: 40,
      lastSampleSubmitted: "2026-09-01 08:30:00 UTC",
      history: [
        { time: "08:00", value: 1.40, mean: 1.42, upper3s: 2.08, lower3s: 0.76 },
        { time: "09:00", value: 1.41, mean: 1.42, upper3s: 2.08, lower3s: 0.76 },
        { time: "10:00", value: 1.43, mean: 1.42, upper3s: 2.08, lower3s: 0.76 },
        { time: "11:00", value: 1.42, mean: 1.42, upper3s: 2.08, lower3s: 0.76 },
        { time: "12:00", value: 1.42, mean: 1.42, upper3s: 2.08, lower3s: 0.76 },
        { time: "13:00", value: 1.42, mean: 1.42, upper3s: 2.08, lower3s: 0.76 },
      ],
      details: "Stator winding vibration spectrum. Operating strictly at active baseline mean.",
    },
  ],
};

let currentCalibrationData = INITIAL_CALIBRATION_STATE;

// Factory default snapshot for Zero-Point Reset
const FACTORY_DEFAULT_BASELINES = JSON.parse(JSON.stringify(INITIAL_CALIBRATION_STATE.baselines));

export class CalibrationService {
  /**
   * Fetches current calibration state.
   */
  static async getCalibrationState() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(JSON.parse(JSON.stringify(currentCalibrationData)));
      }, 100);
    });
  }

  /**
   * Submits raw normal baseline samples (`POST /api/calibration/baseline`).
   * Performs authoritative statistical calculation of mean (μ) and standard deviation (σ).
   */
  static async submitBaselineData(payload) {
    const { sensorId, componentId, environment, drivingState, unit, samples } = payload;

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!samples || !Array.isArray(samples) || samples.length === 0) {
          return reject(new Error("At least one numeric reference sample is required."));
        }

        const validSamples = samples.map((s) => Number(s)).filter((n) => !isNaN(n));
        if (validSamples.length === 0) {
          return reject(new Error("Invalid sample values provided. Must be valid numbers."));
        }

        // Authoritative Backend Statistical Calculation: Mean (μ) and Standard Deviation (σ)
        const count = validSamples.length;
        const mean = validSamples.reduce((sum, val) => sum + val, 0) / count;
        
        const variance =
          count > 1
            ? validSamples.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (count - 1)
            : 0.1; // Default minimum variance for single sample
        const stdDev = Math.sqrt(variance) || 0.1;

        // Find or update baseline metric record
        let existing = currentCalibrationData.baselines.find(
          (b) => b.sensorId === sensorId || b.componentId === componentId
        );

        const timestampStr = new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC";

        if (existing) {
          existing.activeMean = parseFloat(mean.toFixed(2));
          existing.activeStdDev = parseFloat(stdDev.toFixed(2));
          existing.unit = unit || existing.unit;
          existing.samplesCount = (existing.samplesCount || 0) + count;
          existing.lastSampleSubmitted = timestampStr;

          // Re-evaluate Z-Score against new active baseline: Z = (currentValue - mean) / stdDev
          const zScoreVal = (existing.currentValue - existing.activeMean) / (existing.activeStdDev || 1);
          existing.zScore = parseFloat(zScoreVal.toFixed(2));

          const absZ = Math.abs(zScoreVal);
          existing.status = absZ <= 2.0 ? "healthy" : absZ <= 3.0 ? "warning" : "critical";
          existing.details = `Recalibrated with ${count} normal operator samples (${environment} / ${drivingState}). Active μ=${existing.activeMean}, σ=${existing.activeStdDev}.`;
        }

        currentCalibrationData.activeProfile = `CUSTOM_${environment}_${drivingState}`;
        currentCalibrationData.environment = environment;
        currentCalibrationData.drivingState = drivingState;
        currentCalibrationData.context.lastUpdated = "Just now";

        resolve({
          success: true,
          timestamp: timestampStr,
          calculatedMean: parseFloat(mean.toFixed(2)),
          calculatedStdDev: parseFloat(stdDev.toFixed(2)),
          sampleCount: count,
          updatedState: JSON.parse(JSON.stringify(currentCalibrationData)),
          message: `Baseline data saved successfully. Calculated μ=${mean.toFixed(2)}, σ=${stdDev.toFixed(2)} across ${count} samples.`,
        });
      }, 600);
    });
  }

  /**
   * Executes recalibration API (`POST /api/recalibrate`)
   */
  static async executeRecalibration(environment, drivingState) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const timestampStr = new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC";
        currentCalibrationData.environment = environment;
        currentCalibrationData.drivingState = drivingState;
        currentCalibrationData.activeProfile = `ADAPTIVE_${environment}_${drivingState}`;
        currentCalibrationData.recalibration.lastRecalibrated = timestampStr;

        resolve({
          success: true,
          timestamp: timestampStr,
          activeProfile: currentCalibrationData.activeProfile,
          updatedState: JSON.parse(JSON.stringify(currentCalibrationData)),
          message: "Adaptive sensor baseline recalibrated successfully.",
        });
      }, 1000);
    });
  }

  /**
   * Executes Zero-Point Reset (`POST /api/zero-point-reset`)
   */
  static async zeroPointReset() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const timestampStr = new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC";
        currentCalibrationData.baselines = JSON.parse(JSON.stringify(FACTORY_DEFAULT_BASELINES));
        currentCalibrationData.activeProfile = "FACTORY_BASELINE_v4.2";
        currentCalibrationData.recalibration.lastRecalibrated = timestampStr;

        resolve({
          success: true,
          timestamp: timestampStr,
          activeProfile: currentCalibrationData.activeProfile,
          updatedState: JSON.parse(JSON.stringify(currentCalibrationData)),
          message: "Factory baselines restored. Dynamic adaptations cleared.",
        });
      }, 1000);
    });
  }
}
