import * as THREE from "three";
import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import "./styles.css";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { SolarSystem } from "./components/SolarSystem";
import type { System } from "./components/ExoplanetSystem";
import ExoplanetSystem from "./components/ExoplanetSystem";

type CosmicBody = {
  id: string | null;
  name: string | null;
  con: string | null;
  spect: string | null;
  x: number;
  y: number;
  z: number;
  dist: number;
  mag: number | null;
  absmag: number | null;
  ci: number | null;
  ra: number | null;
  dec: number | null;
};

function ciToColor(ci: number | null) {
  if (ci == null) return new THREE.Color(1, 1, 1);

  // clamp
  ci = Math.max(-0.4, Math.min(2.0, ci));

  // normalize 0 → 1
  const t = (ci + 0.4) / 2.4;

  // exaggerate contrast (this is key)
  const exaggerated = Math.pow(t, 1.5);

  const color = new THREE.Color();

  // blue → white → yellow → red gradient
  color.setHSL(
    0.66 - exaggerated * 0.66, // blue → red
    0.8, // saturation boost
    0.7, // brightness
  );

  return color;
}

function StarField({ stars }: { stars: CosmicBody[] }) {
  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(stars.length * 3);
    const colors = new Float32Array(stars.length * 3);

    const color = new THREE.Color();

    stars.forEach((star, i) => {
      positions[i * 3] = star.x;
      positions[i * 3 + 1] = star.y;
      positions[i * 3 + 2] = star.z;

      color.copy(ciToColor(star.ci));

      const brightness = Math.max(0.35, 1 - star.dist / 300);
      color.multiplyScalar(brightness * 1.8);

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    });

    return { positions, colors };
  }, [stars]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.95}
        depthWrite={false}
        toneMapped={false}
      />
    </points>
  );
}

function CameraController({ target }: { target: number[] }) {
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

function NearbySystems({ systems }: { systems: System[] }) {
  const { camera } = useThree();

  return (
    <>
      {systems.map((system, i) => {
        const dx = system.position.x - camera.position.x;
        const dy = system.position.y - camera.position.y;
        const dz = system.position.z - camera.position.z;

        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        // only show if close
        if (dist > 10) return null;

        return <ExoplanetSystem key={i} system={system} />;
      })}
    </>
  );
}

export default function App() {
  const [stars, setStars] = useState<CosmicBody[]>([]);
  const [zoomMode, setZoomMode] = useState<"galaxy" | "solar">("galaxy");
  const [sunPosition, setSunPosition] = useState<[number, number, number]>([
    0, 0, 0,
  ]);

  const [systems, setSystems] = useState<System[]>([]);

  useEffect(() => {
    fetch("/exoplanet_systems.json")
      .then((r) => r.json())
      .then((data) => {
        // apply SAME scaling as HYG
        const scaled = data.slice(0, 10000).map((s) => ({
          ...s,
          position: {
            x: s.position.x / 50,
            y: s.position.y / 50,
            z: s.position.z / 50,
          },
        }));

        setSystems(scaled);
      });
  }, []);

  useEffect(() => {
    fetch("/stars.json")
      .then((r) => r.json())
      .then((data) => {
        const scaled = data.slice(0, 10000).map((s) => ({
          ...s,
          x: s.x / 50,
          y: s.y / 50,
          z: s.z / 50,
        }));

        setStars(scaled);

        // 🔥 FIND THE SUN
        const sun =
          scaled.find((s) => s.name === "Sol") ||
          scaled.find((s) => parseInt(s.dist) === 0);

        console.log(
          "Looking for the Sun in dataset of",
          scaled.length,
          "stars",
          sun,
          scaled.slice(0, 10),
        );

        if (sun) {
          console.log("Sun found:", sun);
          setSunPosition([sun.x, sun.y, sun.z]);
        } else {
          console.warn("Sun not found in dataset");
        }
      });
  }, []);

  const center = useMemo(() => {
    if (stars.length === 0) return [0, 0, 0];

    let x = 0,
      y = 0,
      z = 0;

    for (const s of stars) {
      x += s.x;
      y += s.y;
      z += s.z;
    }

    return [x / stars.length, y / stars.length, z / stars.length];
  }, [stars]);
  return (
    <Canvas
      camera={{ position: [0, 0, 20], fov: 60, near: 0.1, far: 5000 }}
      // gl={async (props) => {
      //   const renderer = new THREE.WebGPURenderer(props as any);
      //   await renderer.init();
      //   return renderer;
      // }}
    >
      <CameraController target={center as [number, number, number]} />

      <EffectComposer>
        <Bloom intensity={0.5} luminanceThreshold={0.1} />
      </EffectComposer>
      <SolarSystem sunPosition={center as [number, number, number]} />
      {/* <ambientLight intensity={Math.PI / 2} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        decay={0}
        intensity={Math.PI}
      />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} /> */}
      <StarField stars={stars} />
      <NearbySystems systems={systems} />
      {/* <CameraRig mode={zoomMode} sunPosition={sunPosition} /> */}
      {/* <TestPoints/> */}
    </Canvas>
  );
}
