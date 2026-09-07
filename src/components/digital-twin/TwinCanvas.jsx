import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { createBaseScene, buildVehicleFromProfile, applyTwinStateToScene } from "../../twin/renderer/TwinRenderer.js";
import { ComponentRaycaster } from "../../twin/interaction/Raycaster.js";
import { getModelProfile } from "../../twin/models/registry.js";
import { twinEventBus } from "../../twin/events/TwinEventBus.js";

export function TwinCanvas({
  twinState,
  selectedId,
  isolatedId,
  activeSystemId,
  activeModelId,
  onSelect,
  registerResetHandle,
  registerZoomHandle,
  registerFocusHandle,
}) {
  const mountRef = useRef(null);
  const stateRef = useRef({ twinState, selectedId, isolatedId, activeSystemId });
  stateRef.current = { twinState, selectedId, isolatedId, activeSystemId };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = createBaseScene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const modelProfile = getModelProfile(activeModelId);
    const meshRegistry = {};
    const vehicleGroup = buildVehicleFromProfile(scene, modelProfile, meshRegistry);

    const defaultTarget = new THREE.Vector3(0, 0.55, 0);
    const currentTarget = defaultTarget.clone();
    const desiredTarget = defaultTarget.clone();

    const defaultOrbit = modelProfile.initialOrbit || { radius: 6.2, theta: Math.PI / 4, phi: 1.15 };
    const orbit = { ...defaultOrbit };
    const desiredOrbit = { ...defaultOrbit };
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let introProgress = reducedMotion ? 1 : 0;

    const clock = new THREE.Clock();

    function updateCameraFromOrbit() {
      const { radius, theta, phi } = orbit;
      camera.position.set(
        currentTarget.x + radius * Math.sin(phi) * Math.sin(theta),
        currentTarget.y + radius * Math.cos(phi),
        currentTarget.z + radius * Math.sin(phi) * Math.cos(theta)
      );
      camera.lookAt(currentTarget);
    }
    updateCameraFromOrbit();

    function resize() {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);

    const raycaster = new ComponentRaycaster();
    let isDragging = false;
    let dragStart = { x: 0, y: 0 };
    let lastPointer = { x: 0, y: 0 };

    function pointerDown(e) {
      isDragging = true;
      const p = raycaster.getPointerPoint(e, mount);
      dragStart = p;
      lastPointer = p;
    }
    function pointerMove(e) {
      if (!isDragging) return;
      const p = raycaster.getPointerPoint(e, mount);
      const dx = p.x - lastPointer.x;
      const dy = p.y - lastPointer.y;
      orbit.theta -= dx * 0.008;
      orbit.phi = Math.min(Math.max(orbit.phi - dy * 0.008, 0.3), 1.6);
      desiredOrbit.theta = orbit.theta;
      desiredOrbit.phi = orbit.phi;
      lastPointer = p;
      updateCameraFromOrbit();
    }
    function pointerUp(e) {
      isDragging = false;
      const p = raycaster.getPointerPoint(e, mount);
      const moved = Math.hypot(p.x - dragStart.x, p.y - dragStart.y);
      if (moved < 6) {
        const componentId = raycaster.intersectComponent(p, mount, camera, meshRegistry);
        onSelect(componentId);
        if (componentId) {
          twinEventBus.emit("COMPONENT_SELECTED", { componentId });
        }
      }
    }
    function wheel(e) {
      e.preventDefault();
      orbit.radius = Math.min(Math.max(orbit.radius + e.deltaY * 0.005, 2.2), 10);
      desiredOrbit.radius = orbit.radius;
      updateCameraFromOrbit();
    }

    const dom = renderer.domElement;
    dom.addEventListener("pointerdown", pointerDown);
    window.addEventListener("pointermove", pointerMove);
    window.addEventListener("pointerup", pointerUp);
    dom.addEventListener("wheel", wheel, { passive: false });

    function focusComponentMesh(componentId) {
      const meshEntry = meshRegistry[componentId];
      const mesh = Array.isArray(meshEntry) ? meshEntry[0] : meshEntry;
      if (mesh) {
        const worldPos = new THREE.Vector3();
        mesh.getWorldPosition(worldPos);
        desiredTarget.copy(worldPos);
        desiredOrbit.radius = 3.8;
      } else {
        desiredTarget.copy(defaultTarget);
        desiredOrbit.radius = defaultOrbit.radius;
      }
    }

    registerResetHandle(() => {
      desiredTarget.copy(defaultTarget);
      desiredOrbit.radius = defaultOrbit.radius;
      desiredOrbit.theta = defaultOrbit.theta;
      desiredOrbit.phi = defaultOrbit.phi;
    });
    registerZoomHandle((dir) => {
      orbit.radius = Math.min(Math.max(orbit.radius + dir * 0.8, 2.2), 10);
      desiredOrbit.radius = orbit.radius;
      updateCameraFromOrbit();
    });
    registerFocusHandle((compOwnerId) => focusComponentMesh(compOwnerId));

    const unsubFocus = twinEventBus.on("COMPONENT_FOCUSED", ({ componentId }) => {
      focusComponentMesh(componentId);
    });

    let rafId;
    function animate() {
      rafId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (introProgress < 1) {
        introProgress = Math.min(introProgress + 0.025, 1);
        const ease = 1 - Math.pow(1 - introProgress, 3);
        orbit.radius = 9 - ease * (9 - defaultOrbit.radius);
      }

      currentTarget.lerp(desiredTarget, 0.08);
      orbit.radius += (desiredOrbit.radius - orbit.radius) * 0.08;
      updateCameraFromOrbit();

      applyTwinStateToScene(
        vehicleGroup,
        meshRegistry,
        stateRef.current.twinState,
        stateRef.current.selectedId,
        stateRef.current.isolatedId,
        stateRef.current.activeSystemId,
        elapsedTime
      );
      renderer.render(scene, camera);
    }
    animate();

    return () => {
      unsubFocus();
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      dom.removeEventListener("pointerdown", pointerDown);
      window.removeEventListener("pointermove", pointerMove);
      window.removeEventListener("pointerup", pointerUp);
      dom.removeEventListener("wheel", wheel);
      mount.removeChild(renderer.domElement);
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
      });
      renderer.dispose();
    };
  }, [activeModelId, onSelect, registerResetHandle, registerZoomHandle, registerFocusHandle]);

  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
}
