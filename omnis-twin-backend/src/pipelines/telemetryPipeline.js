import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import {
  detectContext,
  normalizeReading,
  recalibrateBaseline,
} from './calibrationEngine.js';

const anomalyHistory = [];

const SENSOR_COMPONENT_MAP = {
  SENSOR_THERMAL_BLOCK: 'Thermal Cooling Loop',
  SENSOR_VIBRATION_BEARING: 'Rear Left Suspension',
  SENSOR_TORQUE_TRANSDUCER: 'Transmission / Drivetrain',
  SENSOR_ACOUSTIC_MIC: 'Engine / Front Motor',
  SENSOR_WEAR_DISPLACEMENT: 'Front Left Brake',
  SENSOR_POWER_INVERTER: 'HV Battery Pack',
  SENSOR_POWER_STEERING: 'Electric Power Steering',
  SENSOR_TIRE_PRESSURE: 'Front Left Wheel & Tire',
  SENSOR_TELEMETRY_BUS: 'All Systems Nominal',
};

export function getAnomalyHistory() {
  return anomalyHistory;
}

export function clearAnomalyHistory() {
  anomalyHistory.length = 0;
}

export async function processTelemetryFrame(frame, index) {
  // Step A: Detect surface and situational context
  const context = detectContext(frame);

  // Step B: Normalize acoustic/vibration readings against contextual surface baselines
  const dbAnalysis = normalizeReading(frame.decibels, 'decibels', context.surface);
  const freqAnalysis = normalizeReading(frame.frequency_hz, 'frequency_hz', context.surface);

  // Step C: True Anomaly Decision (Combines flag + contextual Z-Score check)
  const isRawAnomaly = Number(frame.is_anomaly) === 1 || frame.failure_type !== 'normal';
  const isContextAnomaly = dbAnalysis.isContextualAnomaly || freqAnalysis.isContextualAnomaly;

  const isTrueAnomaly = isRawAnomaly || isContextAnomaly;
  const componentName = SENSOR_COMPONENT_MAP[frame.sensor_source] || frame.component;

  if (isTrueAnomaly) {
    const anomalyRecord = {
      id: index,
      timestamp: frame.timestamp || new Date().toISOString(),
      fault: frame.failure_type,
      component: componentName,
      sensor: frame.sensor_source,
      sensorName: frame.sensor_name,
      context,
      analysis: {
        decibelsZScore: dbAnalysis.zScore,
        frequencyZScore: freqAnalysis.zScore,
      },
      readings: {
        rpm: frame.rpm,
        airTemp: frame.air_temp_c,
        procTemp: frame.process_temp_c,
        torque: frame.torque_nm,
        toolWear: frame.tool_wear_min,
        frequency: frame.frequency_hz,
        decibels: frame.decibels,
      },
    };

    anomalyHistory.push(anomalyRecord);

    console.log(`\n🟡 WARN    Frame #${index} [Surface: ${context.surface} | Mode: ${context.driveMode}]`);
    console.log(`   Fault     : ${String(frame.failure_type).toUpperCase()}`);
    console.log(`   Component : ${componentName}`);
    console.log(`   Sensor    : ${frame.sensor_source}`);
    console.log(`   Z-Scores  : Noise ${dbAnalysis.zScore}σ  Freq ${freqAnalysis.zScore}σ`);
    console.log(
      `   Readings  : RPM ${frame.rpm}  Torque ${frame.torque_nm} Nm  dB ${frame.decibels}`
    );
  } else {
    // Continuous recalibration for normal frames to keep surface baseline updated
    recalibrateBaseline(context.surface, 'decibels', frame.decibels);
    recalibrateBaseline(context.surface, 'frequency_hz', frame.frequency_hz);

    console.log(`— Monitoring [${context.surface}]: ${componentName} (${frame.sensor_source}) —`);
  }
}

export async function processCsvDataset(csvFileName = 'demo_telemetry.csv') {
  const validFileName =
    typeof csvFileName === 'string' && csvFileName.endsWith('.csv')
      ? csvFileName
      : 'demo_telemetry.csv';

  const filePath = path.resolve(`./data/processed/${validFileName}`);

  if (!fs.existsSync(filePath)) {
    console.error(`[Dataset Engine] File not found at ${filePath}`);
    return;
  }

  console.log(`[Dataset Engine] Reading CSV dataset from ${validFileName}...`);

  const results = [];
  return new Promise((resolve) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        console.log(`[Dataset Engine] Processing ${results.length} telemetry frames...`);
        let anomalyCount = 0;

        for (let i = 0; i < results.length; i++) {
          const row = results[i];

          const parsedFrame = {
            ...row,
            is_anomaly: parseInt(row.is_anomaly, 10) || 0,
            rpm: parseFloat(row.rpm),
            torque_nm: parseFloat(row.torque_nm),
            air_temp_c: parseFloat(row.air_temp_c),
            process_temp_c: parseFloat(row.process_temp_c),
            tool_wear_min: parseFloat(row.tool_wear_min),
            frequency_hz: parseFloat(row.frequency_hz),
            decibels: parseFloat(row.decibels),
          };

          if (parsedFrame.is_anomaly === 1 || parsedFrame.failure_type !== 'normal') {
            anomalyCount++;
          }

          await processTelemetryFrame(parsedFrame, i + 1);
          await new Promise((r) => setTimeout(r, 100));
        }

        console.log('\n================================================================');
        console.log(`ANOMALY SUMMARY    (${anomalyCount} events detected)`);
        console.log('================================================================\n');
        resolve();
      });
  });
}

export const processDemoDataset = processCsvDataset;

export async function processExistingDataset(jsonFileName) {
  const filePath = path.resolve(`./data/${jsonFileName}`);
  if (!fs.existsSync(filePath)) {
    console.error(`[Dataset Engine] File not found at ${filePath}`);
    return;
  }
  const dataset = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  console.log(`[Dataset Engine] Processing ${dataset.length} items from ${jsonFileName}...`);
  for (let i = 0; i < dataset.length; i++) {
    await processTelemetryFrame(dataset[i], i + 1);
    await new Promise((r) => setTimeout(r, 300));
  }
  console.log('\n[Dataset Engine] Dataset execution completed.');
}

export default {
  processTelemetryFrame,
  processCsvDataset,
  processDemoDataset,
  processExistingDataset,
  getAnomalyHistory,
  clearAnomalyHistory,
};