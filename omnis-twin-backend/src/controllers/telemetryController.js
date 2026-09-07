import { evaluateEnsemble } from '../pipelines/ensembleEngine.js';
import { generateRAGDiagnosis } from '../pipelines/ragPredictor.js';

/**
 * Express Controller: Handles incoming telemetry frames
 * Route: POST /api/telemetry/evaluate
 */
export async function processTelemetry(req, res) {
    try {
        const { telemetry, context } = req.body;

        if (!telemetry) {
            return res.status(400).json({
                success: false,
                error: 'Missing telemetry object in request body.'
            });
        }

        // 1. Parallel Ensemble Evaluation across Audio, Vibration, and Thermal models
        const ensembleResult = await evaluateEnsemble(telemetry, context || {});

        // 2. Unconditional RAG diagnostic generation with metrics & mapped components
        const ragReport = await generateRAGDiagnosis(ensembleResult);

        // 3. Return consolidated backend response
        return res.status(200).json({
            success: true,
            requiresRAG: ensembleResult.requiresRAG,
            flags: ensembleResult.flags,
            diagnosis: ragReport
        });
    } catch (error) {
        console.error('Telemetry Evaluation Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error during telemetry processing.',
            details: error.message
        });
    }
}