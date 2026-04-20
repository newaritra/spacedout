import { Line, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
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

const TIME_SCALE = 50;
const SIZE_SCALE = 0.002;
const STAR_SIZE_SCALE = 0.005;

function Planet({
  planet,
  starPos,
}: {
  planet: Planet;
  starPos: THREE.Vector3;
}) {
  // Fix 1: ref the group so both mesh and Text move together
  const groupRef = useRef<THREE.Group>(null!);
  const lineRef = useRef<any>(null);
  const planetPos = useRef(new THREE.Vector3());

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    const aAU = planet.semiMajorAxis ?? 0.05;
    const e = planet.eccentricity ?? 0;

    const base = Math.log10(1 + aAU) * 0.35;
    const a = Math.max(base, 0.02);
    const b = a * Math.sqrt(1 - e * e);

    const period = planet.orbitalPeriod ?? Math.sqrt(aAU * aAU * aAU);
    const n = (2 * Math.PI) / (period * TIME_SCALE);
    const M = n * t;

    let E = M;
    for (let i = 0; i < 6; i++) {
      E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    }

    const x = a * Math.cos(E) - a * e;
    const z = b * Math.sin(E);

    planetPos.current.set(x, 0, z);
    groupRef.current.position.copy(planetPos.current);

    // Fix 2: update line geometry every frame so it tracks the planet
    if (lineRef.current) {
      lineRef.current.geometry.setPositions([
        starPos.x,
        starPos.y,
        starPos.z,
        x,
        0,
        z,
      ]);
    }
  });

  const size = Math.max(0.001, (planet.radiusEarth ?? 1) * SIZE_SCALE);

  return (
    <>
      <Line
        ref={lineRef}
        points={[starPos, planetPos.current]}
        color="cyan"
        transparent
        opacity={0.05}
        lineWidth={2}
      />

      {/* Fix 1: group wraps mesh + Text so Text is no longer a child of mesh */}
      <group ref={groupRef}>
        <mesh>
          <sphereGeometry args={[size, 12, 12]} />
          <meshBasicMaterial color="white" />
        </mesh>

        <Text
          position={[0, size + 0.002, 0]}
          fontSize={size * 1.5}
          color="white"
          anchorX="center"
        >
          {planet.name}
        </Text>
      </group>
    </>
  );
}

export default function ExoplanetSystem({ system }: { system: System }) {
  const starRadiusSolar = system.star.radius ?? 1;
  const size = Math.max(0.002, starRadiusSolar * STAR_SIZE_SCALE);

  // Fix 3: stable reference, not recreated on every render
  const starPos = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  return (
    <group position={[system.position.x, system.position.y, system.position.z]}>
      <mesh>
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial color="#ffaa55" />
      </mesh>

      {system.planets.map((planet, i) => (
        <Planet key={i} planet={planet} starPos={starPos} />
      ))}

      <Text
        position={[0, size + 0.01, 0]}
        fontSize={size * 0.8}
        color="white"
        anchorX="center"
      >
        {system.hostname}
      </Text>
    </group>
  );
}
