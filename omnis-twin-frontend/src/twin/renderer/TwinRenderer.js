import * as THREE from "three";
import { COLOR } from "./Materials.js";
import { getVisualizationStrategy } from "../visualization/strategies/StrategyRegistry.js";
import { VEHICLE_COMPONENTS } from "../config/vehicleConfig.js";

/**
 * 3D ENGINE (Phase 3)
 * Delegates component material updates to specialized Visualization Strategies.
 */
export function createBaseScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(COLOR.bg);
  scene.fog = new THREE.Fog(COLOR.bg, 8, 18);

  // Ground Plane
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(6.5, 48),
    new THREE.MeshStandardMaterial({ color: COLOR.ground, roughness: 1 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Grid
  const grid = new THREE.GridHelper(12, 24, 0x94a3b8, 0xd1d5db);
  grid.position.y = 0.001;
  scene.add(grid);

  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.55);
  scene.add(ambient);
  
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(4, 6, 3);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  scene.add(key);

  const rim = new THREE.DirectionalLight(0x8fb4d9, 0.45);
  rim.position.set(-4, 3, -4);
  scene.add(rim);

  return scene;
}

export function buildVehicleFromProfile(scene, modelProfile, meshRegistry, onLoaded) {
  const group = new THREE.Group();

  if (modelProfile.buildScene) {
    modelProfile.buildScene(group, meshRegistry, onLoaded);
  } else if (modelProfile.type === "gltf") {
    const fallbackBox = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.6, 3.2),
      new THREE.MeshStandardMaterial({ color: COLOR.bodyMesh, wireframe: true })
    );
    group.add(fallbackBox);
  }

  scene.add(group);
  return group;
}

/**
 * Applies twin state, component selection highlight, and isolate mode ghosting to 3D meshes
 * via Strategy pattern and visual state mapping.
 */
export function applyTwinStateToScene(
  vehicleGroup,
  meshRegistry,
  twinState,
  selectedId,
  isolatedId,
  activeSystemId,
  elapsedTime = 0
) {
  const isIsolated = !!isolatedId;

  // 1. Context Geometry (Chassis Body, Cabin Glass, BodyShell, etc.)
  vehicleGroup.traverse((child) => {
    if (child.isMesh && !child.userData?.componentId) {
      if (isIsolated) {
        child.material.transparent = true;
        child.material.opacity = 0.05;
        child.material.wireframe = true;
      } else {
        child.material.transparent = child.name === "Cabin_Glass" || child.name === "WindowGlass";
        child.material.opacity = (child.name === "Cabin_Glass" || child.name === "WindowGlass") ? 0.85 : 1.0;
        child.material.wireframe = false;
      }
    }
  });

  // 2. Mapped Diagnosable Components via Strategy Pattern
  Object.entries(meshRegistry).forEach(([id, meshEntry]) => {
    const state = twinState[id] || { health: 100, wear: 0, status: "healthy" };

    const compDef = VEHICLE_COMPONENTS.find((c) => c.id === id);
    const category = compDef ? compDef.category : null;
    const strategy = getVisualizationStrategy(id, category);

    const isSelected = id === selectedId;
    const isIsolatedTarget = isIsolated && (id === isolatedId || compDef?.systemId === activeSystemId);

    const meshes = Array.isArray(meshEntry) ? meshEntry : [meshEntry];
    meshes.forEach((mesh) => {
      if (!mesh || !mesh.material) return;
      strategy.update(mesh, state, {
        isSelected,
        isIsolated,
        isIsolatedTarget,
        elapsedTime,
      });
    });
  });
}
