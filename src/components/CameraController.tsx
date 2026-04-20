import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";

export default function CameraController({ target }: { target: number[] }) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(target[0], target[1], target[2] + 20);
    camera.lookAt(target[0], target[1], target[2]);
  }, [target, camera]);

  return (
    <OrbitControls
      makeDefault
      enableDamping
      target={target as [number, number, number]}
    />
  );
}
