import * as THREE from "three";
import { COLOR } from "../../renderer/Materials.js";

/**
 * GLTF Vehicle Model Profile Template
 * Demonstrates how a real .glb / .gltf file is configured with node mapping.
 * 
 * Usage:
 * When you have a .glb file (e.g. '/assets/models/car.glb'), pass its URL and
 * node mapping dictionary here. The GLTF Loader will traverse its node graph
 * and automatically bind internal mesh nodes to logical component IDs.
 */
export function createGltfModelProfile({ id, name, gltfUrl, nodeMapping, initialOrbit }) {
  return {
    id: id || "gltf-vehicle",
    name: name || "Custom GLTF Model",
    type: "gltf",
    gltfUrl: gltfUrl || "/models/vehicle.glb",
    description: "External GLB/GLTF model asset mapped to twin state nodes.",
    
    // Model Node -> Logical Component ID Mapping
    nodeMapping: nodeMapping || {
      "Engine_Mesh": "engine",
      "Battery_Box": "battery",
      "Serpentine_Belt": "belt",
      "BrakeDisc_FL": "front-left-brake",
      "BrakeDisc_FR": "front-right-brake",
      "BrakeDisc_RL": "rear-left-brake",
      "BrakeDisc_RR": "rear-right-brake",
    },

    initialOrbit: initialOrbit || { radius: 6.5, theta: Math.PI / 4, phi: 1.15 },

    /**
     * Traverses a loaded GLTF scene graph, matches mesh names against nodeMapping,
     * attaches userData.componentId, and registers meshes for state binding & raycasting.
     */
    bindGltfScene(gltfScene, group, meshRegistry) {
      gltfScene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          // Check if this mesh node name matches our node mapping
          const mappedComponentId = this.nodeMapping[child.name];
          if (mappedComponentId) {
            child.userData.componentId = mappedComponentId;
            // Set initial neutral material
            child.material = new THREE.MeshStandardMaterial({
              color: COLOR.neutralMesh,
              roughness: 0.5,
            });
            meshRegistry[mappedComponentId] = child;
          }
        }
      });
      group.add(gltfScene);
    },
  };
}
