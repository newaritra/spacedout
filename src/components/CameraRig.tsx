// import { useThree, useFrame } from "@react-three/fiber";
// import { OrbitControls } from "@react-three/drei";
// import { useMemo, useRef } from "react";
// import * as THREE from "three";

// export function CameraRig({ mode, sunPosition }) {
//   const { camera } = useThree();
//   const controlsRef = useRef<any>(null);

//   const targetPos = useMemo(() => {
//     if (mode === "galaxy") {
//       return {
//         camera: new THREE.Vector3(
//           sunPosition[0] + 20,
//           sunPosition[1] + 12,
//           sunPosition[2] + 20,
//         ),
//         target: new THREE.Vector3(...sunPosition),
//       };
//     }

//     return {
//       camera: new THREE.Vector3(
//         sunPosition[0] + 4,
//         sunPosition[1] + 2,
//         sunPosition[2] + 4,
//       ),
//       target: new THREE.Vector3(...sunPosition),
//     };
//   }, [mode, sunPosition]);

//   useFrame(() => {
//     const dist = camera.position.distanceTo(targetPos.camera);

//     // 🚀 ONLY move camera while transitioning
//     if (dist > 0.1) {
//       camera.position.lerp(targetPos.camera, 0.08);

//       if (controlsRef.current) {
//         controlsRef.current.target.lerp(targetPos.target, 0.08);
//         controlsRef.current.update();
//       }
//     }
//   });

//   return (
//     <OrbitControls
//       ref={controlsRef}
//       makeDefault
//       enableDamping
//       dampingFactor={0.08}
//     />
//   );
// }
