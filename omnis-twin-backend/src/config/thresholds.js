export const SEVERITY_THRESHOLDS = {
  HEALTHY: { max: 0.49, status: 'healthy' },
  WARN: { min: 0.50, max: 0.74, status: 'warn' },
  FAULT: { min: 0.75, status: 'fault' }
};

export const ANOMALY_TYPES = {
  BELT_SQUEAL: 'belt_squeal',
  NORMAL: 'normal'
};