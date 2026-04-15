import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useHorizonsBody } from "../hooks/useHorizonsBody";
import { findOrbitSegment, interpolateOrbitPoint } from "../lib/horizons";
import OrbitTrail from "./OrbitTrail";
import {
  getBodyMaterialProps,
  radiusKmToRenderScale,
} from "../lib/bodyVisuals";
import { Center, Text, Text3D } from "@react-three/drei";

type OrbitingBodyProps = {
  command: string;
  start: string;
  stop: string;
  stepSize?: string;
  simDaysPerSecond?: number;
  distanceScale?: number;
  zScale?: number;
  showTrail?: boolean;
};

export function OrbitingBody({
  command,
  start,
  stop,
  stepSize = "1d",
  simDaysPerSecond = 2,
  distanceScale = 1e8,
  zScale = 1,
  showTrail = true,
}: OrbitingBodyProps) {
  const meshRef = useRef<THREE.Mesh>(null!);

  const { data, loading, error } = useHorizonsBody({
    command,
    start,
    stop,
    stepSize,
  });

  const bodyScale = useMemo(() => {
    return radiusKmToRenderScale(data?.physical.radiusKm ?? null);
  }, [data]);

  const materialProps = useMemo(() => {
    if (!data) {
      return {
        color: new THREE.Color("#dddddd"),
        emissive: new THREE.Color("#222222"),
        // emissiveIntensity: 0.4,
        roughness: 0.8,
        metalness: 0,
      };
    }
    return getBodyMaterialProps(data.physical);
  }, [data]);
  

  useFrame(({ clock }) => {
    if (!meshRef.current || !data || data.orbit.length < 2) return;

    const firstJd = data.orbit[0].jd;
    const lastJd = data.orbit[data.orbit.length - 1].jd;
    const jdSpan = lastJd - firstJd;

    const elapsedDays = clock.getElapsedTime() * simDaysPerSecond;
    const currentJd = firstJd + (elapsedDays % jdSpan);

    const segment = findOrbitSegment(data.orbit, currentJd);
    if (!segment) return;

    const p = interpolateOrbitPoint(segment.a, segment.b, currentJd);

    meshRef.current.position.set(
      p.x / distanceScale,
      p.y / distanceScale,
      (p.z / distanceScale) * zScale,
    );

    const obliquityDeg = data.physical.obliquityDeg ?? 0;
    meshRef.current.rotation.z = THREE.MathUtils.degToRad(obliquityDeg);

    // optional slow spin
    meshRef.current.rotation.y += 0.01;
  });

  if (loading) return null;
  if (error || !data) return null;

  return (
    <>
      {showTrail && (
        <OrbitTrail
          points={data.orbit}
          distanceScale={distanceScale}
          zScale={zScale}
          color="#555555"
        />
      )}

      <mesh ref={meshRef}>
        <sphereGeometry args={[bodyScale, 24, 24]} />
        <meshStandardMaterial {...materialProps} />

        <Text
          position={[0, bodyScale + 0.2, 0]}
          fontSize={0.25}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {data.physical.name}
        </Text>
      </mesh>
    </>
  );
}
