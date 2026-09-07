import {
  GenericStrategy,
  BrakeStrategy,
  EngineStrategy,
  BeltStrategy,
  BatteryStrategy,
} from "./ComponentStrategy.js";

const strategies = {
  brake: new BrakeStrategy(),
  engine: new EngineStrategy(),
  belt: new BeltStrategy(),
  battery: new BatteryStrategy(),
  generic: new GenericStrategy(),
};

/**
 * Resolves the appropriate visualization strategy for a component based on ID or category.
 */
export function getVisualizationStrategy(componentId, category) {
  if (componentId && componentId.includes("brake")) {
    return strategies.brake;
  }
  if (componentId === "engine") {
    return strategies.engine;
  }
  if (componentId === "belt") {
    return strategies.belt;
  }
  if (componentId === "battery") {
    return strategies.battery;
  }
  if (category && strategies[category.toLowerCase()]) {
    return strategies[category.toLowerCase()];
  }
  return strategies.generic;
}
