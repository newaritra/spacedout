import { useMemo } from "react";
import { radiusKmToRenderScale } from "../lib/bodyVisuals";

const SUN_RADIUS_KM = 696_340;

export function Sun() {
  const bodyScale = useMemo(() => {
    return radiusKmToRenderScale(SUN_RADIUS_KM);
  }, []);
  return (
    <mesh>
      <sphereGeometry args={[0.3, 32, 32]} />
      <meshBasicMaterial color="#ffd54a" toneMapped={false} />
    </mesh>
  );
}
