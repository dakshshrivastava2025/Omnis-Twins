import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import {
    executeSeasonalRecalibration,
    loadPersistedBaselines,
    normalizeReading
} from '../../src/pipelines/calibrationEngine.js';

// Helper to parse CSV files into telemetry log arrays
async function loadDatasetLogs(filePath) {
    const logs = [];
    return new Promise((resolve) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                logs.push({
                    fault: row.failure_type || 'normal',
                    context: { surface: 'ASPHALT', driveMode: 'HIGHWAY' },
                    readings: {
                        decibels: parseFloat(row.decibels),
                        frequency_hz: parseFloat(row.frequency_hz)
                    }
                });
            })
            .on('end', () => resolve(logs));
    });
}

async function runDemo() {
    console.log('--- STEP 1: INITIAL BASELINE (COLD SEASON) ---');
    loadPersistedBaselines();

    const coldCheck = normalizeReading(80.0, 'decibels', 'ASPHALT');
    console.log(`80dB Reading on Cold Baseline (62dB μ): ${coldCheck.zScore}σ | Anomaly: ${coldCheck.isContextualAnomaly}`);

    console.log('\n--- STEP 2: LOADING 2-MONTH-LATER HOTTER CLIMATE DATA DATASET ---');
    const datasetPath = path.resolve('./data/processed/summer_telemetry.csv');

    if (!fs.existsSync(datasetPath)) {
        console.error(`Dataset not found at ${datasetPath}. Please create summer_telemetry.csv first.`);
        return;
    }

    const summerLogs = await loadDatasetLogs(datasetPath);
    console.log(`Successfully ingested ${summerLogs.length} frames from +2 Months (Hot Climate Data).`);

    console.log('\n--- STEP 3: EXECUTING RECALIBRATION ON NEW CLIMATE DATA ---');
    executeSeasonalRecalibration(summerLogs);

    console.log('\n--- STEP 4: VERIFY RECALIBRATED THRESHOLDS (HOT SEASON) ---');
    const hotCheck = normalizeReading(80.0, 'decibels', 'ASPHALT');
    console.log(`80dB Reading on Recalibrated Baseline (80dB μ): ${hotCheck.zScore}σ | Anomaly: ${hotCheck.isContextualAnomaly}`);
}

runDemo();