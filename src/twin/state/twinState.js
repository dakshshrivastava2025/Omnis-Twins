import { VEHICLE_COMPONENTS } from "../config/vehicleConfig.js";

/**
 * Health Degradation Levels:
 * 75 – 100: healthy
 * 40 – 74 : warning
 * 15 – 39 : critical
 *  0 – 14 : severe
 */
export function getHealthStatus(health) {
  if (health >= 75) return "healthy";
  if (health >= 40) return "warning";
  if (health >= 15) return "critical";
  return "critical"; // Map severe to critical status badge for compatibility
}

export function getDegradationLevel(health) {
  if (health >= 75) return "healthy";
  if (health >= 40) return "warning";
  if (health >= 15) return "critical";
  return "severe";
}

export function statusFromHealth(health) {
  return getHealthStatus(health);
}

/**
 * Calculates weighted vehicle health using component weights.
 */
export function overallHealth(componentsState) {
  let totalWeightedHealth = 0;
  let totalWeight = 0;

  VEHICLE_COMPONENTS.forEach((c) => {
    const state = componentsState[c.id];
    const compHealth = state ? state.health : 100;
    const w = c.weight || 0.1;
    totalWeightedHealth += compHealth * w;
    totalWeight += w;
  });

  if (totalWeight === 0) return 100;
  return Math.round(totalWeightedHealth / totalWeight);
}

export function calculateSystemHealth(componentsState, childComponentIds) {
  const matching = childComponentIds
    .map((id) => componentsState[id])
    .filter(Boolean);
  if (!matching.length) return 100;
  return Math.round(matching.reduce((sum, c) => sum + c.health, 0) / matching.length);
}

export function faultLabel(type) {
  if (!type) return "";
  return type.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}
