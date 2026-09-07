import { evaluateEnsemble } from './src/pipelines/ensembleEngine.js';
import { generateRAGDiagnosis } from './src/pipelines/ragPredictor.js';

// Simulated dataset covering clean, single-fault, and multi-fault scenarios
const dataset = [
    {
        name: 'Frame 1: Audio Anomaly Only',
        telemetry: { decibels: 88.0, frequencyHz: 2500, vibration_amplitude: 12.4, temperature_c: 105.2, rpm: 1800 },
        context: { surface: 'ASPHALT' }
    },
    {
        name: 'Frame 2: Multi-Fault Scenario (All Anomaly)',
        telemetry: { decibels: 96.0, frequencyHz: 2800, vibration_amplitude: 48.2, temperature_c: 135.0, rpm: 3200 },
        context: { surface: 'GRAVEL' }
    }
];

async function runBatchEvaluation() {
    for (const item of dataset) {
        console.log(`\n========================================`);
        console.log(` Running: ${item.name}`);
        console.log(`========================================`);

        const ensembleResult = await evaluateEnsemble(item.telemetry, item.context);
        const ragReport = await generateRAGDiagnosis(ensembleResult);

        console.log(JSON.stringify(ragReport, null, 2));
    }
}

runBatchEvaluation();