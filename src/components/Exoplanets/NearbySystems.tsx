import { useThree } from "@react-three/fiber";
import type { System } from "./ExoplanetSystem";
import ExoplanetSystem from "./ExoplanetSystem";

export default function NearbySystems({ systems }: { systems: System[] }) {
  const { camera } = useThree();

  return (
    <>
      {systems.map((system, i) => {
        const dx = system.position.x - camera.position.x;
        const dy = system.position.y - camera.position.y;
        const dz = system.position.z - camera.position.z;

        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        // only show if close
        if (dist > 14) return null;

        return <ExoplanetSystem key={i} system={system} />;
      })}
    </>
  );
}
