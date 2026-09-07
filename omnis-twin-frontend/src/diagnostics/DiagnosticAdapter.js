import { statusFromHealth } from "../twin/state/twinState.js";

/**
 * Deterministic Diagnostic Scenarios (Phase 3)
 */
export const DIAGNOSTIC_SCENARIOS = {
  HEALTHY: {
    id: "HEALTHY",
    name: "Scenario 1: All Systems Healthy",
    description: "All vehicle components operational with 100% health.",
    getDiagnostics: () => [
      { componentId: "engine", health: 100, wear: 0 },
      { componentId: "battery", health: 100, wear: 0 },
      { componentId: "belt", health: 100, wear: 0 },
      { componentId: "front-left-brake", health: 100, wear: 0 },
      { componentId: "front-right-brake", health: 100, wear: 0 },
      { componentId: "rear-left-brake", health: 100, wear: 0 },
      { componentId: "rear-right-brake", health: 100, wear: 0 },
      { componentId: "front-left-suspension", health: 100, wear: 0 },
      { componentId: "front-right-suspension", health: 100, wear: 0 },
      { componentId: "rear-left-suspension", health: 100, wear: 0 },
      { componentId: "rear-right-suspension", health: 100, wear: 0 },
      { componentId: "wheel-fl", health: 100, wear: 0 },
      { componentId: "wheel-fr", health: 100, wear: 0 },
      { componentId: "wheel-rl", health: 100, wear: 0 },
      { componentId: "wheel-rr", health: 100, wear: 0 },
    ],
  },

  BRAKE_WEAR: {
    id: "BRAKE_WEAR",
    name: "Scenario 2: Front Left Brake Wear",
    description: "Severe wear on Front Left Brake pad (35% health, 91% confidence fault).",
    getDiagnostics: () => [
      { componentId: "front-left-brake", health: 35, wear: 65, fault: "worn_brake_pad", confidence: 0.91 },
      { componentId: "front-right-brake", health: 78, wear: 22 },
      { componentId: "rear-left-brake", health: 92, wear: 8 },
      { componentId: "rear-right-brake", health: 90, wear: 10 },
      { componentId: "engine", health: 95, wear: 5 },
      { componentId: "battery", health: 88, wear: 12 },
      { componentId: "belt", health: 82, wear: 18 },
      { componentId: "front-left-suspension", health: 90, wear: 10 },
      { componentId: "front-right-suspension", health: 90, wear: 10 },
      { componentId: "rear-left-suspension", health: 90, wear: 10 },
      { componentId: "rear-right-suspension", health: 90, wear: 10 },
      { componentId: "wheel-fl", health: 85, wear: 15 },
      { componentId: "wheel-fr", health: 85, wear: 15 },
      { componentId: "wheel-rl", health: 85, wear: 15 },
      { componentId: "wheel-rr", health: 85, wear: 15 },
    ],
  },

  MULTIPLE_DEGRADATION: {
    id: "MULTIPLE_DEGRADATION",
    name: "Scenario 3: Multiple System Wear",
    description: "Simultaneous wear across Brakes, Belt, and Battery.",
    getDiagnostics: () => [
      { componentId: "front-left-brake", health: 32, wear: 68, fault: "worn_brake_pad", confidence: 0.92 },
      { componentId: "belt", health: 48, wear: 52, fault: "serpentine_belt_slippage", confidence: 0.85 },
      { componentId: "battery", health: 65, wear: 35, fault: "battery_degradation", confidence: 0.68 },
      { componentId: "engine", health: 88, wear: 12 },
      { componentId: "front-right-brake", health: 70, wear: 30 },
      { componentId: "rear-left-brake", health: 85, wear: 15 },
      { componentId: "rear-right-brake", health: 82, wear: 18 },
      { componentId: "rear-left-suspension", health: 58, wear: 42, fault: "damper_fluid_leak", confidence: 0.74 },
      { componentId: "front-left-suspension", health: 85, wear: 15 },
      { componentId: "front-right-suspension", health: 85, wear: 15 },
      { componentId: "rear-right-suspension", health: 85, wear: 15 },
      { componentId: "wheel-fl", health: 75, wear: 25 },
      { componentId: "wheel-fr", health: 78, wear: 22 },
      { componentId: "wheel-rl", health: 80, wear: 20 },
      { componentId: "wheel-rr", health: 80, wear: 20 },
    ],
  },

  CRITICAL_FAULT: {
    id: "CRITICAL_FAULT",
    name: "Scenario 4: Critical Belt Failure Risk",
    description: "Severe degradation on Serpentine Belt (12% health, 96% confidence fault).",
    getDiagnostics: () => [
      { componentId: "belt", health: 12, wear: 88, fault: "belt_snapping_risk", confidence: 0.96 },
      { componentId: "engine", health: 70, wear: 30, fault: "engine_overheating_risk", confidence: 0.82 },
      { componentId: "front-left-brake", health: 40, wear: 60, fault: "worn_brake_pad", confidence: 0.88 },
      { componentId: "battery", health: 72, wear: 28 },
      { componentId: "front-right-brake", health: 75, wear: 25 },
      { componentId: "rear-left-brake", health: 88, wear: 12 },
      { componentId: "rear-right-brake", health: 85, wear: 15 },
      { componentId: "front-left-suspension", health: 80, wear: 20 },
      { componentId: "front-right-suspension", health: 80, wear: 20 },
      { componentId: "rear-left-suspension", health: 80, wear: 20 },
      { componentId: "rear-right-suspension", health: 80, wear: 20 },
      { componentId: "wheel-fl", health: 70, wear: 30 },
      { componentId: "wheel-fr", health: 70, wear: 30 },
      { componentId: "wheel-rl", health: 75, wear: 25 },
      { componentId: "wheel-rr", health: 75, wear: 25 },
    ],
  },
};

/**
 * Mock Diagnostic Provider
 */
export const MockDiagnosticProvider = {
  currentScenario: "BRAKE_WEAR",

  getDiagnostics(scenarioId = this.currentScenario) {
    const scenario = DIAGNOSTIC_SCENARIOS[scenarioId] || DIAGNOSTIC_SCENARIOS.BRAKE_WEAR;
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(scenario.getDiagnostics());
      }, 300);
    });
  },
};

/**
 * DiagnosticAdapter: AI output -> TwinState.
 */
export function adaptDiagnosticsToTwinState(components, diagnostics) {
  const byId = Object.fromEntries(diagnostics.map((d) => [d.componentId, d]));
  const state = {};
  for (const c of components) {
    const d = byId[c.id];
    const health = d ? d.health : 100;
    state[c.id] = {
      id: c.id,
      health,
      wear: d ? d.wear : 0,
      status: statusFromHealth(health),
      fault: d && d.fault ? { type: d.fault, confidence: d.confidence } : null,
      rul: null, // Reserved for Phase 6
    };
  }
  return state;
}

/**
 * Backend Telemetry Pipeline Bridge
 */
export async function evaluateTelemetryStream(telemetryData, contextData = { surface: "ASPHALT" }) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  try {
    const response = await fetch(`${API_BASE_URL}/telemetry/evaluate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        telemetry: telemetryData,
        context: contextData,
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend evaluation failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error communicating with backend telemetry endpoint:", error);
    throw error;
  }
}