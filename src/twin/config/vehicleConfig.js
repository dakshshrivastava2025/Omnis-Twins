/**
 * Vehicle Component & System Registry (Phase 3)
 * Defines vehicle systems (Powertrain, Braking, Suspension, Wheels)
 * and component weights for realistic vehicle health calculation.
 */

export const VEHICLE_SYSTEMS = [
  { id: "powertrain", name: "Powertrain", icon: "Zap" },
  { id: "braking", name: "Braking System", icon: "Disc" },
  { id: "suspension", name: "Suspension", icon: "Activity" },
  { id: "wheels", name: "Wheels & Tires", icon: "Circle" },
];

export const VEHICLE_COMPONENTS = [
  // Powertrain System (Total Weight: 0.50)
  { id: "engine", name: "Engine", category: "powertrain", systemId: "powertrain", defaultNode: "Engine", weight: 0.25 },
  { id: "battery", name: "Battery", category: "powertrain", systemId: "powertrain", defaultNode: "Battery", weight: 0.15 },
  { id: "belt", name: "Serpentine Belt", category: "powertrain", systemId: "powertrain", defaultNode: "Belt", weight: 0.10 },

  // Braking System (Total Weight: 0.28 - 0.07 each)
  { id: "front-left-brake", name: "Front Left Brake", category: "braking", systemId: "braking", defaultNode: "Brake_FL", weight: 0.07 },
  { id: "front-right-brake", name: "Front Right Brake", category: "braking", systemId: "braking", defaultNode: "Brake_FR", weight: 0.07 },
  { id: "rear-left-brake", name: "Rear Left Brake", category: "braking", systemId: "braking", defaultNode: "Brake_RL", weight: 0.07 },
  { id: "rear-right-brake", name: "Rear Right Brake", category: "braking", systemId: "braking", defaultNode: "Brake_RR", weight: 0.07 },

  // Suspension System (Total Weight: 0.12 - 0.03 each)
  { id: "front-left-suspension", name: "Front Left Suspension", category: "suspension", systemId: "suspension", defaultNode: "Suspension_FL", weight: 0.03 },
  { id: "front-right-suspension", name: "Front Right Suspension", category: "suspension", systemId: "suspension", defaultNode: "Suspension_FR", weight: 0.03 },
  { id: "rear-left-suspension", name: "Rear Left Suspension", category: "suspension", systemId: "suspension", defaultNode: "Suspension_RL", weight: 0.03 },
  { id: "rear-right-suspension", name: "Rear Right Suspension", category: "suspension", systemId: "suspension", defaultNode: "Suspension_RR", weight: 0.03 },

  // Wheels System (Total Weight: 0.10 - 0.025 each)
  { id: "wheel-fl", name: "Front Left Wheel", category: "wheels", systemId: "wheels", defaultNode: "Wheel_FL", weight: 0.025 },
  { id: "wheel-fr", name: "Front Right Wheel", category: "wheels", systemId: "wheels", defaultNode: "Wheel_FR", weight: 0.025 },
  { id: "wheel-rl", name: "Rear Left Wheel", category: "wheels", systemId: "wheels", defaultNode: "Wheel_RL", weight: 0.025 },
  { id: "wheel-rr", name: "Rear Right Wheel", category: "wheels", systemId: "wheels", defaultNode: "Wheel_RR", weight: 0.025 },
];

export function getComponentsBySystem(systemId) {
  return VEHICLE_COMPONENTS.filter((c) => c.systemId === systemId);
}
