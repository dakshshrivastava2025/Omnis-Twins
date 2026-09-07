import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.resolve('./data/config/sensor_baselines.json');

// Default or loaded baselines
let SURFACE_BASELINES = {
    ASPHALT: { decibels: { mean: 62.0, std: 3.5 }, frequency_hz: { mean: 350.0, std: 45.0 } },
    GRAVEL: { decibels: { mean: 82.0, std: 6.0 }, frequency_hz: { mean: 1200.0, std: 150.0 } },
    OFF_ROAD: { decibels: { mean: 92.0, std: 8.5 }, frequency_hz: { mean: 2200.0, std: 280.0 } },
};

// Load saved baselines from disk if available on server boot
export function loadPersistedBaselines() {
    if (fs.existsSync(CONFIG_PATH)) {
        const data = fs.readFileSync(CONFIG_PATH, 'utf-8');
        SURFACE_BASELINES = JSON.parse(data);
        console.log('[Calibration Engine] Loaded seasonal baseline thresholds from storage.');
    }
}

// 1. Context Classifier: Detect surface based on sensor attributes
export function detectContext(frame) {
    const freq = frame.frequency_hz || 0;
    const db = frame.decibels || 0;

    let surface = 'ASPHALT';
    if (freq > 1800 || db > 90) {
        surface = 'OFF_ROAD';
    } else if (freq > 800 || db > 75) {
        surface = 'GRAVEL';
    }

    let driveMode = 'CITY_CRUISE';
    if (frame.rpm > 2000) driveMode = 'HIGHWAY';
    if (frame.torque_nm > 80) driveMode = 'HIGH_LOAD';

    return { surface, driveMode };
}

// 2. Normalize reading into a Z-Score based on active surface baseline
export function normalizeReading(reading, metricName, surface) {
    const profile = SURFACE_BASELINES[surface] || SURFACE_BASELINES.ASPHALT;
    const stats = profile[metricName] || { mean: reading, std: 1.0 };

    const zScore = (reading - stats.mean) / (stats.std || 1.0);
    return {
        raw: reading,
        zScore: parseFloat(zScore.toFixed(2)),
        isContextualAnomaly: Math.abs(zScore) > 3.0,
    };
}

// 3. Continuous Recalibration: Update running baseline averages (EMA)
export function recalibrateBaseline(surface, metricName, newNominalValue, alpha = 0.05) {
    if (!SURFACE_BASELINES[surface]) return;
    const current = SURFACE_BASELINES[surface][metricName];
    if (!current) return;

    current.mean = alpha * newNominalValue + (1 - alpha) * current.mean;
}

// 4. Bi-Monthly Seasonal Recalibration: Recalculate and save to disk
export function executeSeasonalRecalibration(recentTelemetryLogs) {
    console.log('[Calibration Engine] Executing bi-monthly seasonal recalibration...');

    const surfaceBuckets = { ASPHALT: [], GRAVEL: [], OFF_ROAD: [] };

    recentTelemetryLogs.forEach((log) => {
        if (log.context && surfaceBuckets[log.context.surface] && log.fault === 'normal') {
            surfaceBuckets[log.context.surface].push(log.readings || log);
        }
    });

    Object.keys(surfaceBuckets).forEach((surface) => {
        const logs = surfaceBuckets[surface];
        if (logs.length < 10) return;

        ['decibels', 'frequency_hz'].forEach((metric) => {
            const values = logs.map((l) => l[metric]).filter((v) => typeof v === 'number');
            if (values.length === 0) return;

            const mean = values.reduce((a, b) => a + b, 0) / values.length;
            const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
            const std = Math.sqrt(variance);

            SURFACE_BASELINES[surface][metric] = {
                mean: parseFloat(mean.toFixed(2)),
                std: parseFloat(std.toFixed(2)) || 1.0,
            };
        });
    });

    fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(SURFACE_BASELINES, null, 2));
    console.log('[Calibration Engine] Bi-monthly recalibration complete. New thresholds saved.');
}