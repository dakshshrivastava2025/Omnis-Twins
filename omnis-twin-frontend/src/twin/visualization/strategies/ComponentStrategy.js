import * as THREE from "three";
import { getComponentVisualState } from "../VisualState.js";
import { COLOR } from "../../renderer/Materials.js";

/**
 * Interface: ComponentVisualizationStrategy
 * Defines specialized rendering behaviors for different mechanical component types.
 */
export class ComponentVisualizationStrategy {
  /**
   * Updates physical mesh properties & materials based on VisualState & animation time.
   * @param {THREE.Mesh} mesh 
   * @param {Object} twinState 
   * @param {Object} context { isSelected, isIsolated, isIsolatedTarget, elapsedTime }
   */
  update(mesh, twinState, context) {
    throw new Error("ComponentVisualizationStrategy.update must be implemented by subclass.");
  }
}

/**
 * Generic Strategy (Fallback)
 */
export class GenericStrategy extends ComponentVisualizationStrategy {
  update(mesh, twinState, context) {
    if (!mesh.material) return;
    const vState = getComponentVisualState(twinState);
    const { isSelected, isIsolated, isIsolatedTarget, elapsedTime } = context;

    applyCommonVisuals(mesh, vState, isSelected, isIsolated, isIsolatedTarget, elapsedTime);
  }
}

/**
 * Brake Component Strategy
 * Friction disc thermal discoloration, severe rotor rust tinting, and thermal friction glow.
 */
export class BrakeStrategy extends ComponentVisualizationStrategy {
  update(mesh, twinState, context) {
    if (!mesh.material) return;
    const vState = getComponentVisualState(twinState);
    const { isSelected, isIsolated, isIsolatedTarget, elapsedTime } = context;

    applyCommonVisuals(mesh, vState, isSelected, isIsolated, isIsolatedTarget, elapsedTime);

    // Specialized Brake effect: Friction wear darkens rotor surface
    if (twinState && twinState.wear > 50 && !isIsolated) {
      mesh.material.roughness = Math.min(mesh.material.roughness + 0.15, 0.95);
    }
  }
}

/**
 * Engine Component Strategy
 * Heat shimmer pulse, thermal expansion glow, high-temp warning tinting.
 */
export class EngineStrategy extends ComponentVisualizationStrategy {
  update(mesh, twinState, context) {
    if (!mesh.material) return;
    const vState = getComponentVisualState(twinState);
    const { isSelected, isIsolated, isIsolatedTarget, elapsedTime } = context;

    applyCommonVisuals(mesh, vState, isSelected, isIsolated, isIsolatedTarget, elapsedTime);

    // Specialized Engine effect: High heat engine thermal pulse on fault
    if (vState.faultActive && !isIsolated) {
      const thermalPulse = (Math.sin(elapsedTime * 4.0) + 1) * 0.5 * vState.confidenceScale;
      mesh.material.emissiveIntensity += thermalPulse * 0.35;
    }
  }
}

/**
 * Serpentine Belt Strategy
 * Surface cracking tint & tension friction degradation.
 */
export class BeltStrategy extends ComponentVisualizationStrategy {
  update(mesh, twinState, context) {
    if (!mesh.material) return;
    const vState = getComponentVisualState(twinState);
    const { isSelected, isIsolated, isIsolatedTarget, elapsedTime } = context;

    applyCommonVisuals(mesh, vState, isSelected, isIsolated, isIsolatedTarget, elapsedTime);

    // Specialized Belt effect: Rubber cracking darkening on severe wear
    if (twinState && twinState.wear > 40) {
      mesh.material.roughness = 0.9;
    }
  }
}

/**
 * Battery Component Strategy
 * Terminal oxidation tinting & electrolyte fault glow.
 */
export class BatteryStrategy extends ComponentVisualizationStrategy {
  update(mesh, twinState, context) {
    if (!mesh.material) return;
    const vState = getComponentVisualState(twinState);
    const { isSelected, isIsolated, isIsolatedTarget, elapsedTime } = context;

    applyCommonVisuals(mesh, vState, isSelected, isIsolated, isIsolatedTarget, elapsedTime);
  }
}

/**
 * Helper: Applies base visual state, state combinations, selection glow, and isolate mode.
 */
function applyCommonVisuals(mesh, vState, isSelected, isIsolated, isIsolatedTarget, elapsedTime) {
  const mat = mesh.material;

  if (isIsolated) {
    if (isIsolatedTarget) {
      mat.transparent = false;
      mat.opacity = 1.0;
      mat.wireframe = false;
      if (vState.degradationLevel !== "healthy" && vState.degradationLevel !== "nominal") {
        mat.color.copy(vState.baseColor);
      } else if (mesh.userData?.originalMaterial?.color) {
        mat.color.copy(mesh.userData.originalMaterial.color);
      }

      // Combine Fault Emissive Pulse + Selection Accent
      let emissiveIntensity = vState.emissiveIntensity;
      if (vState.faultActive && vState.pulseRate > 0) {
        const pulse = (Math.sin(elapsedTime * vState.pulseRate * Math.PI * 2) + 1) * 0.5;
        emissiveIntensity *= 0.5 + 0.5 * pulse;
      }
      if (isSelected) {
        mat.emissive.set(COLOR.accentSelected);
        mat.emissiveIntensity = Math.max(emissiveIntensity, 0.6);
      } else {
        mat.emissive.copy(vState.emissiveColor);
        mat.emissiveIntensity = emissiveIntensity;
      }
    } else {
      // Ghost out non-target component
      mat.transparent = true;
      mat.opacity = 0.08;
      mat.wireframe = true;
      mat.color.set(COLOR.neutralMesh);
      mat.emissive.set(0x000000);
      mat.emissiveIntensity = 0;
    }
  } else {
    // Normal Mode: Combine Health Color + Fault Pulse + Selection Accent
    if (mesh.userData?.originalMaterial) {
      mat.transparent = mesh.userData.originalMaterial.transparent;
      mat.opacity = mesh.userData.originalMaterial.opacity;
    } else {
      mat.transparent = false;
      mat.opacity = 1.0;
    }
    mat.wireframe = false;

    // Preserve original material color if healthy
    if (vState.degradationLevel !== "healthy" && vState.degradationLevel !== "nominal") {
      mat.color.copy(vState.baseColor);
    } else if (mesh.userData?.originalMaterial?.color) {
      mat.color.copy(mesh.userData.originalMaterial.color);
    }

    let finalEmissiveColor = vState.emissiveColor.clone();
    let finalEmissiveIntensity = vState.emissiveIntensity;

    if (vState.faultActive && vState.pulseRate > 0) {
      const pulse = (Math.sin(elapsedTime * vState.pulseRate * Math.PI * 2) + 1) * 0.5;
      finalEmissiveIntensity *= 0.4 + 0.6 * pulse * vState.confidenceScale;
    }

    if (isSelected) {
      // Coexisting State: Blend Selection Color with Fault/Health
      finalEmissiveColor.lerp(new THREE.Color(COLOR.accentSelected), 0.5);
      finalEmissiveIntensity = Math.max(finalEmissiveIntensity, 0.55);
    }

    mat.emissive.copy(finalEmissiveColor);
    mat.emissiveIntensity = finalEmissiveIntensity;
  }
}
