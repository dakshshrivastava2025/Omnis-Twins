# Omnis Twin - Track B (Telemetry & Anomaly Engine)

Track B processes high-frequency engine telemetry, identifies mechanical anomalies (belt slips), and streams real-time state alerts via WebSockets alongside a REST query API.

## Setup & Execution
1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Engine runs by default at `http://localhost:3001`

## API Endpoints
- **GET `/`**: Service status & client metrics
- **GET `/api/anomalies`**: Historical log of detected anomaly events
- **GET `/api/dataset/info`**: Dataset metadata and active thresholds

## WebSocket Interface
- **URL**: `ws://localhost:3001`
- **Payload Schema (`DATASET_STREAM_FRAME`)**:
  ```json
  {
    "type": "DATASET_STREAM_FRAME",
    "frameIndex": 16,
    "totalFrames": 30,
    "telemetry": {
      "timestamp": "2026-09-06T12:15:15.154Z",
      "rpm": 3800,
      "frequencyHz": 2850,
      "decibels": 78.4
    },
    "alert": {
      "severity": "FAULT",
      "label": "Belt Slip Detected",
      "confidence": 0.88
    }
  }