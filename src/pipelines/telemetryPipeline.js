import fs from 'fs';
import path from 'path';
import { classifyTelemetry } from '../classifiers/beltClassifier.js';

let streamInterval = null;
let currentIndex = 0;
const anomalyLog = []; // In-memory buffer for detected anomalies

const datasetPath = path.resolve('data/telemetry_dataset.json');
let dataset = [];

try {
  const rawData = fs.readFileSync(datasetPath, 'utf8');
  const parsedData = JSON.parse(rawData);
  dataset = parsedData.filter(item => typeof item.rpm === 'number');
  console.log(`[Track B] Loaded ${dataset.length} valid telemetry frames.`);
} catch (error) {
  console.error('[Track B] Failed to load dataset:', error.message);
}

export function startTelemetryStream(broadcastCallback) {
  if (streamInterval || dataset.length === 0) return;

  streamInterval = setInterval(() => {
    const row = dataset[currentIndex];

    const frame = {
      timestamp: new Date().toISOString(),
      rpm: row.rpm,
      frequencyHz: row.frequencyHz,
      decibels: row.decibels
    };

    const alertPayload = classifyTelemetry(frame);

    // If an anomaly is detected, record it to our history log
    if (alertPayload.severity !== 'HEALTHY') {
      const logEntry = {
        id: anomalyLog.length + 1,
        frameIndex: currentIndex + 1,
        timestamp: frame.timestamp,
        telemetry: frame,
        alert: alertPayload
      };
      
      anomalyLog.push(logEntry);
      
      // Keep only the last 50 recorded anomalies to prevent memory leaks
      if (anomalyLog.length > 50) anomalyLog.shift();
    }

    broadcastCallback({
      type: 'DATASET_STREAM_FRAME',
      frameIndex: currentIndex + 1,
      totalFrames: dataset.length,
      telemetry: frame,
      alert: alertPayload
    });

    currentIndex = (currentIndex + 1) % dataset.length;
  }, 1000);
}

export function getAnomalyHistory() {
  return anomalyLog;
}

export function stopTelemetryStream() {
  if (streamInterval) {
    clearInterval(streamInterval);
    streamInterval = null;
  }
}