import express from 'express';
import cors from 'cors';
// ... existing imports ...
import telemetryRoutes from './routes/telemetryRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

// ... existing middleware and routes ...

// Mount multi-modal telemetry pipeline routes
app.use('/api/telemetry', telemetryRoutes);

// Define port and start listening
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend server active on http://localhost:${PORT}`);
});