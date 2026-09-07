import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { COLOR } from "../../renderer/Materials.js";

/**
 * Registry of Component IDs -> GLB Node Names.
 * Centralized mapping for the new car_anatomy.glb asset node structure.
 * Nodes:
 * - Fitted_Squared_Body -> Context Body
 * - FloorPan -> Context Floor Pan
 * - Battery, BMS -> battery
 * - EngineBlock, EngineHead, Manifold, EngineCylinder (x4), Pulley -> engine
 * - Radiator -> cooling
 * - BrakeDisc (x4), Caliper (x4) -> brakes / front & rear brake components
 * - Tire (x4), Rim (x4), InnerWheelRod (x4), InnerWheelRod2 (x4) -> wheels / suspension
 */
export const CAR_ANATOMY_NODE_MAPPING = {
  // Specific & Group Brakes
  "front-left-brake": ["BrakeDisc", "Caliper"],
  "front-right-brake": ["BrakeDisc", "Caliper"],
  "rear-left-brake": ["BrakeDisc", "Caliper"],
  "rear-right-brake": ["BrakeDisc", "Caliper"],
  "brakes": ["BrakeDisc", "Caliper"],

  // Powertrain & Engine
  "engine": ["EngineBlock", "EngineHead", "Manifold", "EngineCylinder", "Pulley"],
  "transmission": ["EngineBlock"],
  "drivetrain": ["EngineBlock", "InnerWheelRod", "InnerWheelRod2"],

  // Battery & Thermal Cooling
  "battery": ["Battery", "BMS"],
  "cooling": ["Radiator"],

  // Steering & Suspension
  "steering": ["InnerWheelRod", "InnerWheelRod2"],
  "front-left-suspension": ["InnerWheelRod", "InnerWheelRod2"],
  "front-right-suspension": ["InnerWheelRod", "InnerWheelRod2"],
  "rear-left-suspension": ["InnerWheelRod", "InnerWheelRod2"],
  "rear-right-suspension": ["InnerWheelRod", "InnerWheelRod2"],
  "suspension": ["InnerWheelRod", "InnerWheelRod2"],

  // Wheels
  "wheel-fl": ["Tire", "Rim"],
  "wheel-fr": ["Tire", "Rim"],
  "wheel-rl": ["Tire", "Rim"],
  "wheel-rr": ["Tire", "Rim"],
  "wheels": ["Tire", "Rim"],
};

/**
 * Direct mapping dictionary for matching mesh names or index-based fallback.
 */
export const MESH_TO_COMPONENT_ID = {
  "BrakeDisc": "brakes",
  "Caliper": "brakes",
  "EngineBlock": "engine",
  "EngineHead": "engine",
  "Manifold": "engine",
  "EngineCylinder": "engine",
  "Pulley": "engine",
  "Radiator": "cooling",
  "Battery": "battery",
  "BMS": "battery",
  "InnerWheelRod": "suspension",
  "InnerWheelRod2": "suspension",
  "Tire": "wheels",
  "Rim": "wheels",
};

export const carAnatomyProfile = {
  id: "car-anatomy-glb",
  name: "Detailed Vehicle Anatomy (car_anatomy.glb)",
  type: "gltf",
  gltfUrl: "/car_anatomy.glb",
  description: "High-detail anatomical vehicle model with addressable sub-component meshes.",
  initialOrbit: { radius: 7.2, theta: Math.PI / 4, phi: 1.15 },

  buildScene(group, meshRegistry, onLoaded) {
    const loader = new GLTFLoader();
    
    loader.load(
      this.gltfUrl,
      (gltf) => {
        const gltfScene = gltf.scene;

        // Reset meshRegistry
        Object.keys(meshRegistry).forEach((key) => delete meshRegistry[key]);

        // Auto-center and normalize scale of loaded model
        const box = new THREE.Box3().setFromObject(gltfScene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        if (maxDim > 0) {
          const targetScale = 3.6 / maxDim; // scale to fit standard vehicle viewport size
          gltfScene.scale.setScalar(targetScale);
          // Center at origin and adjust vertical position
          gltfScene.position.set(-center.x * targetScale, 0.5 - center.y * targetScale, -center.z * targetScale);
        }

        let tireCount = 0;
        let brakeCount = 0;

        gltfScene.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            if (child.material) {
              child.userData.originalMaterial = child.material.clone();
              // Enable DoubleSide so inverted mesh normals do not cull faces
              child.material.side = THREE.DoubleSide;
            }

            const nodeName = child.name;
            let mappedCompId = MESH_TO_COMPONENT_ID[nodeName];

            // Positional mapping for repeating mesh names (Tire, Rim, BrakeDisc, Caliper)
            if (nodeName === "Tire" || nodeName === "Rim") {
              const wheelIds = ["wheel-fl", "wheel-fr", "wheel-rl", "wheel-rr"];
              const specificId = wheelIds[Math.floor(tireCount / 2) % 4];
              tireCount++;

              [specificId, "wheels"].forEach((cid) => {
                if (!meshRegistry[cid]) meshRegistry[cid] = [];
                meshRegistry[cid].push(child);
              });
              child.userData.componentId = specificId;
            } else if (nodeName === "BrakeDisc" || nodeName === "Caliper") {
              const brakeIds = ["front-left-brake", "front-right-brake", "rear-left-brake", "rear-right-brake"];
              const specificId = brakeIds[Math.floor(brakeCount / 2) % 4];
              brakeCount++;

              [specificId, "brakes"].forEach((cid) => {
                if (!meshRegistry[cid]) meshRegistry[cid] = [];
                meshRegistry[cid].push(child);
              });
              child.userData.componentId = specificId;
            } else if (mappedCompId) {
              child.userData.componentId = mappedCompId;
              child.userData.nodeName = nodeName;

              if (!meshRegistry[mappedCompId]) {
                meshRegistry[mappedCompId] = [];
              }
              meshRegistry[mappedCompId].push(child);
            }
          }
        });

        group.add(gltfScene);
        if (onLoaded) onLoaded(gltfScene);
      },
      undefined,
      (error) => {
        console.error("Error loading car_anatomy.glb:", error);
      }
    );
  },
};
