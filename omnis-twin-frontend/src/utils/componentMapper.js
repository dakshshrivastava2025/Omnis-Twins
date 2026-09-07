/**
 * Bidirectional Component & Mesh Mapper
 * Unifies 2D dashboard component IDs (e.g. "brakes", "suspension")
 * with 3D Three.js mesh node names (e.g. "Brake_FL", "Suspension_RL")
 * and 3D twin component IDs (e.g. "front-left-brake").
 */

export const COMPONENT_MAP = {
  brakes: {
    dashboardId: "brakes",
    meshNode: "Brake_FL",
    twin3DId: "front-left-brake",
    all3DNodes: ["Brake_FL", "Brake_FR", "Brake_RL", "Brake_RR"],
  },
  suspension: {
    dashboardId: "suspension",
    meshNode: "Suspension_RL",
    twin3DId: "rear-left-suspension",
    all3DNodes: ["Suspension_FL", "Suspension_FR", "Suspension_RL", "Suspension_RR"],
  },
  wheels: {
    dashboardId: "wheels",
    meshNode: "Wheel_FL",
    twin3DId: "wheel-fl",
    all3DNodes: ["Wheel_FL", "Wheel_FR", "Wheel_RL", "Wheel_RR"],
  },
  battery: {
    dashboardId: "battery",
    meshNode: "Battery",
    twin3DId: "battery",
    all3DNodes: ["Battery"],
  },
  engine: {
    dashboardId: "engine",
    meshNode: "Engine",
    twin3DId: "engine",
    all3DNodes: ["Engine", "Belt"],
  },
  transmission: {
    dashboardId: "transmission",
    meshNode: "Engine",
    twin3DId: "engine",
    all3DNodes: ["Engine"],
  },
  steering: {
    dashboardId: "steering",
    meshNode: "Engine",
    twin3DId: "engine",
    all3DNodes: ["Engine"],
  },
  cooling: {
    dashboardId: "cooling",
    meshNode: "Engine",
    twin3DId: "engine",
    all3DNodes: ["Engine"],
  },
};

/**
 * Maps any 3D node name or 3D twin ID to the primary 2D dashboard component ID
 */
export function map3DToDashboardId(nodeOr3DId) {
  if (!nodeOr3DId) return "brakes";
  const normalized = String(nodeOr3DId).toLowerCase();

  if (normalized.includes("brake")) return "brakes";
  if (normalized.includes("suspension") || normalized.includes("strut")) return "suspension";
  if (normalized.includes("wheel") || normalized.includes("tire")) return "wheels";
  if (normalized.includes("battery")) return "battery";
  if (normalized.includes("engine") || normalized.includes("motor")) return "engine";
  if (normalized.includes("gearbox") || normalized.includes("trans")) return "transmission";
  if (normalized.includes("steering")) return "steering";
  if (normalized.includes("radiator") || normalized.includes("cool")) return "cooling";

  return "brakes";
}

/**
 * Maps a 2D dashboard component ID to the primary 3D mesh node name
 */
export function mapDashboardToMeshNode(dashboardId) {
  if (!dashboardId) return "Brake_FL";
  const found = COMPONENT_MAP[dashboardId];
  return found ? found.meshNode : "Brake_FL";
}

/**
 * Maps a 2D dashboard component ID to the 3D twin component ID used in twinState
 */
export function mapDashboardTo3DTwinId(dashboardId) {
  if (!dashboardId) return "front-left-brake";
  const found = COMPONENT_MAP[dashboardId];
  return found ? found.twin3DId : "front-left-brake";
}

/**
 * Converts 2D vehicleData components array to 3D twinState object
 */
export function buildTwinStateFromComponents(components) {
  const twinState = {
    "engine": { health: 92, wear: 8, status: "healthy", fault: null },
    "battery": { health: 68, wear: 32, status: "warning", fault: { type: "Cell Thermal Imbalance", confidence: 0.88 } },
    "belt": { health: 85, wear: 15, status: "healthy", fault: null },
    "front-left-brake": { health: 35, wear: 65, status: "critical", fault: { type: "Brake Pad Lining Wear", confidence: 0.94 } },
    "front-right-brake": { health: 90, wear: 10, status: "healthy", fault: null },
    "rear-left-brake": { health: 88, wear: 12, status: "healthy", fault: null },
    "rear-right-brake": { health: 88, wear: 12, status: "healthy", fault: null },
    "front-left-suspension": { health: 85, wear: 15, status: "healthy", fault: null },
    "front-right-suspension": { health: 85, wear: 15, status: "healthy", fault: null },
    "rear-left-suspension": { health: 58, wear: 42, status: "warning", fault: { type: "Shock Absorber Fluid Weep", confidence: 0.76 } },
    "rear-right-suspension": { health: 82, wear: 18, status: "healthy", fault: null },
    "wheel-fl": { health: 80, wear: 20, status: "warning", fault: { type: "TPMS Under-Inflation", confidence: 0.99 } },
    "wheel-fr": { health: 92, wear: 8, status: "healthy", fault: null },
    "wheel-rl": { health: 90, wear: 10, status: "healthy", fault: null },
    "wheel-rr": { health: 90, wear: 10, status: "healthy", fault: null },
  };

  components.forEach((comp) => {
    const twinId = mapDashboardTo3DTwinId(comp.id);
    if (twinState[twinId]) {
      twinState[twinId].health = comp.health;
      twinState[twinId].wear = 100 - comp.health;
      twinState[twinId].status = comp.status === "attention" ? "warning" : comp.status;
    }
  });

  return twinState;
}
