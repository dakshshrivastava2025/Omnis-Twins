import * as THREE from "three";
import { COLOR } from "../renderer/Materials.js";
import { getDegradationLevel } from "../state/twinState.js";

/**
 * Centralized Visual State Mapper
 * Converts raw component state (health, wear, fault, confidence) into physical 3D rendering parameters.
 * 
 * TwinState -> VisualState -> Three.js Renderer
 */
export function getComponentVisualState(state) {
  if (!state) {
    return {
      degradationLevel: "healthy",
      baseColor: new THREE.Color(COLOR.neutralMesh),
      roughness: 0.5,
      metalness: 0.2,
      emissiveColor: new THREE.Color(0x000000),
      emissiveIntensity: 0,
      pulseRate: 0,
      confidenceScale: 0,
      faultActive: false,
      faultType: null,
    };
  }

  const health = state.health ?? 100;
  const wear = state.wear ?? 0;
  const level = getDegradationLevel(health);
  const fault = state.fault;

  // Base Color interpolation according to degradation level
  let baseColorHex = COLOR.neutralMesh;
  if (level === "warning") baseColorHex = COLOR.warning;
  else if (level === "critical") baseColorHex = COLOR.critical;
  else if (level === "severe") baseColorHex = "#8B0000"; // Severe Dark Red / Corrosion

  const baseColor = new THREE.Color(baseColorHex);

  // Surface texture changes based on wear (0-100)
  // Higher wear increases surface roughness (dull/corroded)
  const roughness = Math.min(0.2 + (wear / 100) * 0.7, 0.95);
  const metalness = Math.max(0.6 - (wear / 100) * 0.5, 0.1);

  // Fault calculation
  const faultActive = !!fault;
  const confidence = faultActive ? Math.min(Math.max(fault.confidence ?? 0, 0), 1) : 0;
  const confidenceScale = confidence; // 0.0 to 1.0

  let emissiveColorHex = 0x000000;
  let emissiveIntensity = 0;
  let pulseRate = 0;

  if (faultActive) {
    // Fault Emissive Color based on fault severity & confidence
    emissiveColorHex = level === "severe" || level === "critical" ? 0xff2200 : 0xe6a100;
    // High confidence -> stronger base emissive intensity (0.2 to 0.85)
    emissiveIntensity = 0.15 + confidence * 0.7;
    // Fault pulse speed scales with confidence & degradation level
    pulseRate = level === "severe" ? 4.5 : level === "critical" ? 3.0 : 1.8;
  }

  return {
    degradationLevel: level,
    baseColor,
    roughness,
    metalness,
    emissiveColor: new THREE.Color(emissiveColorHex),
    emissiveIntensity,
    pulseRate,
    confidenceScale,
    faultActive,
    faultType: fault ? fault.type : null,
  };
}
