import { Router } from 'express';
import { processTelemetry } from '../controllers/telemetryController.js';

const router = Router();

// Endpoint for single-frame or streaming telemetry evaluation
router.post('/evaluate', processTelemetry);

export default router;