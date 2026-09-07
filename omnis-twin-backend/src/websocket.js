import { evaluateEnsemble } from './pipelines/ensembleEngine.js';
import { generateRAGDiagnosis } from './pipelines/ragPredictor.js';

export function handleWebSocketMessage(ws, message) {
    try {
        const data = JSON.parse(message);

        // Check if the incoming WebSocket frame contains telemetry data
        if (data.type === 'TELEMETRY_FRAME') {
            const { telemetry, context } = data.payload;

            // Execute ensemble & RAG asynchronously
            evaluateEnsemble(telemetry, context).then(async (ensembleResult) => {
                const ragReport = await generateRAGDiagnosis(ensembleResult);

                // Emit diagnostic event back to frontend dashboard
                ws.send(JSON.stringify({
                    type: 'TELEMETRY_DIAGNOSTIC_UPDATE',
                    requiresRAG: ensembleResult.requiresRAG,
                    flags: ensembleResult.flags,
                    diagnosis: ragReport
                }));
            });
        }
    } catch (err) {
        console.error('WebSocket telemetry processing error:', err.message);
    }
}