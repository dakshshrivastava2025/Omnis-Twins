import * as THREE from "three";
import { COLOR } from "../../renderer/Materials.js";

/**
 * Procedural EV SUV Profile
 * Demonstrates how an alternative vehicle layout (e.g. EV Skateboard battery + electric motors)
 * uses the EXACT SAME logical component IDs with different geometries and node mappings.
 */
export const proceduralEvProfile = {
  id: "procedural-ev",
  name: "Procedural EV SUV Concept",
  type: "procedural",
  description: "EV skateboard chassis architecture highlighting large battery pack & dual motors.",

  nodeMapping: {
    "Front_Motor_Assembly": "engine",
    "EV_Skateboard_Battery": "battery",
    "Cooling_Loop": "belt",
    "Front_Left_Caliper": "front-left-brake",
    "Front_Right_Caliper": "front-right-brake",
    "Rear_Left_Caliper": "rear-left-brake",
    "Rear_Right_Caliper": "rear-right-brake",
  },

  initialOrbit: { radius: 6.8, theta: Math.PI / 3, phi: 1.0 },

  buildScene(group, meshRegistry) {
    const neutralMat = () => new THREE.MeshStandardMaterial({ color: COLOR.neutralMesh, roughness: 0.5 });

    // EV Skateboard Frame Context
    const frameMat = new THREE.MeshStandardMaterial({ color: "#2E3440", roughness: 0.4, metalness: 0.6 });
    const skateboard = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.2, 3.8), frameMat);
    skateboard.position.set(0, 0.35, 0);
    skateboard.castShadow = true;
    group.add(skateboard);

    // Aerodynamic EV Body Shell (Glass Tint)
    const shellMat = new THREE.MeshStandardMaterial({ color: COLOR.glassMesh, roughness: 0.2, metalness: 0.8, transparent: true, opacity: 0.4 });
    const shell = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.7, 3.4), shellMat);
    shell.position.set(0, 0.8, 0);
    group.add(shell);

    // EV Wheels
    const wheelMat = new THREE.MeshStandardMaterial({ color: COLOR.wheelMesh, roughness: 0.8 });
    const wheelPositions = [
      [-1.05, 0.38, -1.4],
      [1.05, 0.38, -1.4],
      [-1.05, 0.38, 1.4],
      [1.05, 0.38, 1.4],
    ];
    wheelPositions.forEach(([x, y, z]) => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.3, 24), wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, y, z);
      wheel.castShadow = true;
      group.add(wheel);
    });

    // Mapped Component: EV Battery Pack (Underfloor Skateboard)
    const battery = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.22, 2.2), neutralMat());
    battery.name = "EV_Skateboard_Battery";
    battery.position.set(0, 0.48, 0);
    battery.castShadow = true;
    battery.userData.componentId = this.nodeMapping["EV_Skateboard_Battery"];
    group.add(battery);
    meshRegistry[battery.userData.componentId] = battery;

    // Mapped Component: Electric Front Motor (Logical: "engine")
    const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.7, 16), neutralMat());
    motor.name = "Front_Motor_Assembly";
    motor.rotation.z = Math.PI / 2;
    motor.position.set(0, 0.58, -1.3);
    motor.castShadow = true;
    motor.userData.componentId = this.nodeMapping["Front_Motor_Assembly"];
    group.add(motor);
    meshRegistry[motor.userData.componentId] = motor;

    // Mapped Component: Thermal Cooling Loop (Logical: "belt")
    const coolingLoop = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.04, 12, 32), neutralMat());
    coolingLoop.name = "Cooling_Loop";
    coolingLoop.position.set(0, 0.65, -0.6);
    coolingLoop.rotation.x = Math.PI / 2;
    coolingLoop.castShadow = true;
    coolingLoop.userData.componentId = this.nodeMapping["Cooling_Loop"];
    group.add(coolingLoop);
    meshRegistry[coolingLoop.userData.componentId] = coolingLoop;

    // Mapped Components: EV Regenerative Brakes
    const brakeGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.12, 16);
    const brakeDefs = [
      ["Front_Left_Caliper", -1.0, 0.42, -1.2],
      ["Front_Right_Caliper", 1.0, 0.42, -1.2],
      ["Rear_Left_Caliper", -1.0, 0.42, 1.2],
      ["Rear_Right_Caliper", 1.0, 0.42, 1.2],
    ];
    brakeDefs.forEach(([nodeName, x, y, z]) => {
      const brake = new THREE.Mesh(brakeGeo, neutralMat());
      brake.name = nodeName;
      brake.rotation.z = Math.PI / 2;
      brake.position.set(x, y, z);
      brake.castShadow = true;
      brake.userData.componentId = this.nodeMapping[nodeName];
      group.add(brake);
      meshRegistry[brake.userData.componentId] = brake;
    });
  },
};
