import { evaluateEnsemble } from './src/pipelines/ensembleEngine.js';
import { generateRAGDiagnosis } from './src/pipelines/ragPredictor.js';

async function runTest() {
    const telemetryFrame = {
        decibels: 88.0,
        frequencyHz: 2500,
        vibration_amplitude: 12.4,
        temperature_c: 105.2
    };

    const context = { surface: 'ASPHALT' };

    console.log('--- Running Ensemble Evaluation ---');
    const ensembleResult = await evaluateEnsemble(telemetryFrame, context);
    console.log('Ensemble Result:', JSON.stringify(ensembleResult, null, 2));

    if (ensembleResult.requiresRAG) {
        console.log('\n--- Anomaly Flagged: Invoking RAG Predictor ---');
        const ragReport = await generateRAGDiagnosis(ensembleResult);
        console.log('RAG Diagnostic Report:', JSON.stringify(ragReport, null, 2));
    }
}

runTest();