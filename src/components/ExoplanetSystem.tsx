import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

type Planet = {
  name: string | null;
  orbitalPeriod: number | null;
  semiMajorAxis: number | null;
  eccentricity: number;
  radiusEarth: number | null;
};

export type System = {
  hostname: string;
  position: { x: number; y: number; z: number };
  distance: number;
  star: {
    teff: number | null;
    mass: number | null;
    radius: number | null;
  };
  planets: Planet[];
};

function Planet({ planet }: { planet: Planet }) {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    const radius = (planet.semiMajorAxis || 0.05) * 0.2; // scale
    const speed = 1 / (planet.orbitalPeriod || 365);

    const angle = t * speed * Math.PI * 2;

    ref.current.position.set(
      Math.cos(angle) * radius,
      0,
      Math.sin(angle) * radius,
    );
  });

//   const orbitRadius = (planet.semiMajorAxis || 0.05) * 0.25;
  const rawSize = (planet.radiusEarth || 1) * 0.0015;
  const size = Math.min(0.008, Math.max(0.001, rawSize));

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 8, 8]} />
      <meshBasicMaterial color="white" />
      <Text
        position={[0, size + 0.002, 0]}
        fontSize={0.02}
        color="white"
        anchorX="center"
      >
        {planet.name}
      </Text>
    </mesh>
  );
}

export default function ExoplanetSystem({ system }: { system: System }) {
  return (
    <group position={[system.position.x, system.position.y, system.position.z]}>
      {/* Star */}
      <mesh>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color="#ffaa55" opacity={0.6} transparent />
      </mesh>

      {system.planets.map((planet, i) => (
        <Planet key={i} planet={planet} />
      ))}

      <Text
        position={[0, 0.05, 0]}
        fontSize={0.05}
        color="white"
        anchorX="center"
      >
        {system.hostname}
      </Text>
    </group>
  );
}
