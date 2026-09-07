import * as THREE from "three";
import { COLOR } from "../../renderer/Materials.js";

/**
 * Procedural Sedan Model Profile (Phase 2)
 * Full mechanical node mappings: Powertrain, Braking, Suspension, Wheels.
 */
export const proceduralSedanProfile = {
  id: "procedural-sedan",
  name: "Procedural Sedan (Full System)",
  type: "procedural",
  description: "Standard procedural twin mesh layout mapping Powertrain, Brakes, Suspension & Wheels.",
  
  nodeMapping: {
    "Engine": "engine",
    "Battery": "battery",
    "Belt": "belt",
    "Brake_FL": "front-left-brake",
    "Brake_FR": "front-right-brake",
    "Brake_RL": "rear-left-brake",
    "Brake_RR": "rear-right-brake",
    "Suspension_FL": "front-left-suspension",
    "Suspension_FR": "front-right-suspension",
    "Suspension_RL": "rear-left-suspension",
    "Suspension_RR": "rear-right-suspension",
    "Wheel_FL": "wheel-fl",
    "Wheel_FR": "wheel-fr",
    "Wheel_RL": "wheel-rl",
    "Wheel_RR": "wheel-rr",
  },

  initialOrbit: { radius: 6.2, theta: Math.PI / 4, phi: 1.15 },

  buildScene(group, meshRegistry) {
    const neutralMat = () => new THREE.MeshStandardMaterial({ color: COLOR.neutralMesh, roughness: 0.5 });

    // Chassis Body Context (non-selectable context mesh)
    const bodyMat = new THREE.MeshStandardMaterial({ color: COLOR.bodyMesh, roughness: 0.5, metalness: 0.2 });
    const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.55, 3.6), bodyMat);
    lowerBody.position.set(0, 0.5, 0);
    lowerBody.castShadow = true;
    lowerBody.name = "Chassis_Body";
    group.add(lowerBody);

    const cabinMat = new THREE.MeshStandardMaterial({ color: COLOR.glassMesh, roughness: 0.3, metalness: 0.3, transparent: true, opacity: 0.85 });
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.5, 1.7), cabinMat);
    cabin.position.set(0, 1.02, 0.15);
    cabin.castShadow = true;
    cabin.name = "Cabin_Glass";
    group.add(cabin);

    // Mapped Wheels
    const wheelPositions = [
      ["Wheel_FL", -1.0, 0.35, -1.35],
      ["Wheel_FR", 1.0, 0.35, -1.35],
      ["Wheel_RL", -1.0, 0.35, 1.35],
      ["Wheel_RR", 1.0, 0.35, 1.35],
    ];
    wheelPositions.forEach(([nodeName, x, y, z]) => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.24, 20), neutralMat());
      wheel.name = nodeName;
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, y, z);
      wheel.castShadow = true;
      wheel.userData.componentId = this.nodeMapping[nodeName];
      group.add(wheel);
      meshRegistry[wheel.userData.componentId] = wheel;
    });

    // Mapped Suspensions
    const suspPositions = [
      ["Suspension_FL", -0.75, 0.4, -1.35],
      ["Suspension_FR", 0.75, 0.4, -1.35],
      ["Suspension_RL", -0.75, 0.4, 1.35],
      ["Suspension_RR", 0.75, 0.4, 1.35],
    ];
    suspPositions.forEach(([nodeName, x, y, z]) => {
      const susp = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.4, 12), neutralMat());
      susp.name = nodeName;
      susp.position.set(x, y, z);
      susp.castShadow = true;
      susp.userData.componentId = this.nodeMapping[nodeName];
      group.add(susp);
      meshRegistry[susp.userData.componentId] = susp;
    });

    // Mapped Powertrain
    const engine = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.48, 0.8), neutralMat());
    engine.name = "Engine";
    engine.position.set(0, 0.62, -1.65);
    engine.castShadow = true;
    engine.userData.componentId = this.nodeMapping["Engine"];
    group.add(engine);
    meshRegistry[engine.userData.componentId] = engine;

    const battery = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.3), neutralMat());
    battery.name = "Battery";
    battery.position.set(0.58, 0.62, -1.55);
    battery.castShadow = true;
    battery.userData.componentId = this.nodeMapping["Battery"];
    group.add(battery);
    meshRegistry[battery.userData.componentId] = battery;

    const belt = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.04, 10, 24), neutralMat());
    belt.name = "Belt";
    belt.position.set(-0.52, 0.65, -1.72);
    belt.rotation.y = Math.PI / 2;
    belt.castShadow = true;
    belt.userData.componentId = this.nodeMapping["Belt"];
    group.add(belt);
    meshRegistry[belt.userData.componentId] = belt;

    // Mapped Brakes
    const brakeGeo = new THREE.BoxGeometry(0.18, 0.18, 0.18);
    const brakeDefs = [
      ["Brake_FL", -0.92, 0.38, -1.15],
      ["Brake_FR", 0.92, 0.38, -1.15],
      ["Brake_RL", -0.92, 0.38, 1.15],
      ["Brake_RR", 0.92, 0.38, 1.15],
    ];
    brakeDefs.forEach(([nodeName, x, y, z]) => {
      const brake = new THREE.Mesh(brakeGeo, neutralMat());
      brake.name = nodeName;
      brake.position.set(x, y, z);
      brake.castShadow = true;
      brake.userData.componentId = this.nodeMapping[nodeName];
      group.add(brake);
      meshRegistry[brake.userData.componentId] = brake;
    });
  },
};
