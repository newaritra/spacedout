import { useMemo } from "react";
import type { OrbitPoint } from "../lib/horizons";

type OrbitTrailProps = {
  points: OrbitPoint[];
  distanceScale?: number;
  zScale?: number;
  color?: string;
};

export default function OrbitTrail({
  points,
  distanceScale = 1e8,
  zScale = 1,
  color = "#666666",
}: OrbitTrailProps) {
  const positions = useMemo(() => {
    const arr = new Float32Array(points.length * 3);

    points.forEach((p, i) => {
      arr[i * 3] = p.x / distanceScale;
      arr[i * 3 + 1] = p.y / distanceScale;
      arr[i * 3 + 2] = (p.z / distanceScale) * zScale;
    });

    return arr;
  }, [points, distanceScale, zScale]);

  if (points.length < 2) return null;

  return (
    <line pointerEvents={"none"}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color={color} />
    </line>
  );
}
