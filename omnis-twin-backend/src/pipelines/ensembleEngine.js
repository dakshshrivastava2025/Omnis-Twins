import { spawn } from 'child_process';
import path from 'path';
import { normalizeReading } from './calibrationEngine.js';
import * as beltClassifierModule from '../classifiers/beltClassifier.js';

/**
 * 1. Audio Stream Detector (Acoustic Sensor)
 */
async function processAudioStream(telemetryFrame) {
    const SENSOR_ID = 'MIC_ARRAY_FRONT_BAY';
    const MONITORED_COMPONENT = 'Serpentine Belt / Drive Pulley';

    try {
        const classifyFn =
            beltClassifierModule.classifyTelemetry ||
            beltClassifierModule.default ||
            beltClassifierModule;

        if (typeof classifyFn === 'function') {
            const result = classifyFn(telemetryFrame);
            const confidence = parseFloat(result.confidence) || 0.0;
            const isAnomaly = result.severity === 'FAULT' || confidence >= 0.50;

            return {
                sensor: SENSOR_ID,
                targetComponent: MONITORED_COMPONENT,
                confidence,
                label: result.label || 'NORMAL_ACOUSTICS',
                decibels: telemetryFrame.decibels || null,
                frequencyHz: telemetryFrame.frequencyHz || null,
                isAnomaly
            };
        }
    } catch (e) {
        return { sensor: SENSOR_ID, targetComponent: MONITORED_COMPONENT, isAnomaly: false, error: e.message };
    }
    return { sensor: SENSOR_ID, targetComponent: MONITORED_COMPONENT, isAnomaly: false };
}

/**
 * 2. Vibration Stream Detector (Accelerometer Sensor)
 */
async function processVibrationStream(telemetryFrame, context) {
    const SENSOR_ID = 'ACCELEROMETER_CHASSIS_AXIS';
    const MONITORED_COMPONENT = 'Wheel Hub Assembly / Suspension Bushing';

    const zResult = normalizeReading(
        telemetryFrame.vibration_amplitude || telemetryFrame.decibels || 70.0,
        'vibration',
        context.surface || 'ASPHALT'
    );

    return {
        sensor: SENSOR_ID,
        targetComponent: MONITORED_COMPONENT,
        rawReading: zResult.raw,
        zScore: zResult.zScore,
        isAnomaly: zResult.isContextualAnomaly
    };
}

/**
 * 3. Thermal Stream Detector (Infrared / Thermocouple Sensor)
 */
function processThermalStream(telemetryFrame) {
    const SENSOR_ID = 'THERMISTOR_ENGINE_BLOCK';
    const MONITORED_COMPONENT = 'Cooling Loop / Engine Block Gasket';

    return new Promise((resolve) => {
        const pythonScript = path.resolve('./src/models/anomaly_detector/bridge_inference.py');
        const pyProcess = spawn('python', [pythonScript]);

        let output = '';
        pyProcess.stdout.on('data', (data) => { output += data.toString(); });

        pyProcess.on('close', () => {
            try {
                const parsed = JSON.parse(output);
                const score = parsed.anomalyScore || 0.0;
                const isAnomaly = score > 0.65;

                resolve({
                    sensor: SENSOR_ID,
                    targetComponent: MONITORED_COMPONENT,
                    anomalyScore: parseFloat(score.toFixed(2)),
                    temperature_c: telemetryFrame.temperature_c || null,
                    isAnomaly
                });
            } catch (err) {
                resolve({ sensor: SENSOR_ID, targetComponent: MONITORED_COMPONENT, isAnomaly: false, error: err.message });
            }
        });

        pyProcess.stdin.write(JSON.stringify(telemetryFrame));
        pyProcess.stdin.end();
    });
}

/**
 * Parallel Multi-Modal Ensemble Evaluation
 */
export async function evaluateEnsemble(telemetryFrame, context = {}) {
    const [audioResult, vibrationResult, thermalResult] = await Promise.all([
        processAudioStream(telemetryFrame),
        processVibrationStream(telemetryFrame, context),
        processThermalStream(telemetryFrame)
    ]);

    const requiresRAG = audioResult.isAnomaly || vibrationResult.isAnomaly || thermalResult.isAnomaly;

    return {
        requiresRAG,
        context: {
            surface: context.surface || 'ASPHALT',
            rpm: telemetryFrame.rpm || 'N/A'
        },
        flags: {
            audioAnomaly: audioResult.isAnomaly,
            vibrationAnomaly: vibrationResult.isAnomaly,
            thermalAnomaly: thermalResult.isAnomaly
        },
        modalityBreakdown: {
            audioModel: audioResult,
            vibrationModel: vibrationResult,
            thermalModel: thermalResult
        }
    };
}