import { proceduralSedanProfile } from "./profiles/proceduralSedan.js";
import { proceduralEvProfile } from "./profiles/proceduralEv.js";
import { createGltfModelProfile } from "./profiles/gltfVehicleProfile.js";
import { carAnatomyProfile } from "./profiles/carAnatomyProfile.js";

/**
 * Registry of available 3D Vehicle Models.
 * New models (GLTF or procedural) can be added here cleanly without touching rendering logic.
 */
export const MODEL_REGISTRY = [
  carAnatomyProfile,
  proceduralSedanProfile,
  proceduralEvProfile,
];

export function getModelProfile(modelId) {
  return MODEL_REGISTRY.find((m) => m.id === modelId) || MODEL_REGISTRY[0];
}
