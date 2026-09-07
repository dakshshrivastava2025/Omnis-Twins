import * as THREE from "three";

/**
 * Handles raycasting and mouse/touch selection of mapped 3D component meshes.
 */
export class ComponentRaycaster {
  constructor() {
    this.raycaster = new THREE.Raycaster();
    this.pointerNdc = new THREE.Vector2();
  }

  getPointerPoint(e, mountElement) {
    const rect = mountElement.getBoundingClientRect();
    const src = e.touches && e.touches.length ? e.touches[0] : e;
    return {
      x: src.clientX - rect.left,
      y: src.clientY - rect.top,
    };
  }

  intersectComponent(point, mountElement, camera, meshRegistry) {
    const rect = mountElement.getBoundingClientRect();
    this.pointerNdc.x = (point.x / rect.width) * 2 - 1;
    this.pointerNdc.y = -(point.y / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointerNdc, camera);
    const meshes = Object.values(meshRegistry).flat();
    const hits = this.raycaster.intersectObjects(meshes, true);

    if (hits.length > 0) {
      // Find nearest hit that has a mapped componentId
      for (const hit of hits) {
        let obj = hit.object;
        while (obj && !obj.userData?.componentId && obj.parent) {
          obj = obj.parent;
        }
        if (obj?.userData?.componentId) {
          return obj.userData.componentId;
        }
      }
    }
    return null;
  }
}
