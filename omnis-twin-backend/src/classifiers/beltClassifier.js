import { ANOMALY_TYPES } from '../config/thresholds.js';

export function classifyTelemetry(frame) {
  const { frequencyHz, decibels, rpm } = frame;

  // Normal operational bounds for serpentine belts: 
  // High-pitch squeals occur > 2400 Hz at high decibels relative to lower engine RPMs
  const isHighFrequencyPeak = frequencyHz > 2400;
  const isNoiseElevated = decibels > 72;

  if (isHighFrequencyPeak && isNoiseElevated) {
    // Calculate confidence based on severity of frequency shift and noise level
    const freqFactor = Math.min(1.0, (frequencyHz - 2200) / 1200);
    const noiseFactor = Math.min(1.0, (decibels - 65) / 25);
    const rawConfidence = (freqFactor * 0.6) + (noiseFactor * 0.4);

    return {
      label: ANOMALY_TYPES.BELT_SQUEAL,
      confidence: parseFloat(Math.min(0.99, Math.max(0.50, rawConfidence)).toFixed(2)),
      severity: rawConfidence > 0.75 ? 'FAULT' : 'WARN',
      audioClip: '/assets/audio/belt_squeal_demo.mp3'
    };
  }

  return {
    label: ANOMALY_TYPES.NORMAL,
    confidence: 0.0,
    severity: 'HEALTHY',
    audioClip: null
  };
}