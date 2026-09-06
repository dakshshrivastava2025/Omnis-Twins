import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { startTelemetryStream, getAnomalyHistory } from './pipelines/telemetryPipeline.js';

const app = express();

// Enable CORS for frontend integration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST']
}));
app.use(express.json());

const server = createServer(app);
const wss = new WebSocketServer({ server });

function broadcast(data) {
  const message = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(message);
  });
}

// Start dataset streaming pipeline
startTelemetryStream((payload) => {
  broadcast(payload);
});

// Root Health & API Overview
app.get('/', (req, res) => {
  res.json({
    service: 'Omnis Twin Track B - Telemetry & Anomaly Engine',
    status: 'online',
    connectedClients: wss.clients.size,
    endpoints: {
      health: 'GET /',
      anomalies: 'GET /api/anomalies',
      datasetInfo: 'GET /api/dataset/info'
    }
  });
});

// Anomaly History Endpoint
app.get('/api/anomalies', (req, res) => {
  const history = getAnomalyHistory();
  res.json({
    count: history.length,
    events: history
  });
});

// Dataset Info Endpoint
app.get('/api/dataset/info', (req, res) => {
  res.json({
    datasetName: 'telemetry_dataset.json',
    totalFrames: 30,
    streamIntervalMs: 1000,
    activeSensors: ['rpm', 'frequencyHz', 'decibels'],
    thresholds: {
      frequencyHzMax: 2400,
      decibelsMax: 72
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`[Track B] Telemetry Engine active at http://localhost:${PORT}`);
});