import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import CameraController from "./components/CameraController";
import NearbySystems from "./components/Exoplanets/NearbySystems";
import { SolarSystem } from "./components/SolarSystem";
import StarField from "./components/StarField";
import useExoplanets from "./hooks/useExoplanets";
import useStars from "./hooks/useStars";
import "./styles.css";
import useSmallBodies from "./hooks/useSmallBodies";
import SmallBodies from "./components/SmallBodies";

// function useMemoizedCenter(stars: CosmicBody[]) {
//   const center = useMemo(() => {
//     if (stars.length === 0) return [0, 0, 0];

//     let x = 0,
//       y = 0,
//       z = 0;

//     for (const s of stars) {
//       x += s.x;
//       y += s.y;
//       z += s.z;
//     }

//     return [x / stars.length, y / stars.length, z / stars.length];
//   }, [stars]);
//   return center;
// }

export default function App() {
  const { data: stars } = useStars();
  const { data: systems } = useExoplanets();
  const { data: smallBodies } = useSmallBodies();
  const center = [0, 0, 0];

  return (
    <Canvas
      onCreated={({ gl }) => {
        // ensure context is explicitly released on unmount
        return () => gl.dispose();
      }}
      camera={{ position: [0, 0, 20], fov: 60, near: 0.1, far: 5000 }}
    >
      <CameraController target={center as [number, number, number]} />

      <EffectComposer>
        <Bloom intensity={0.5} luminanceThreshold={0.1} />
      </EffectComposer>
      <SolarSystem sunPosition={center as [number, number, number]} />
      <fog attach="fog" args={["#05070d", 15, 80]} />
      <StarField stars={stars || []} />
      <NearbySystems systems={systems || []} />
      <SmallBodies bodies={smallBodies || []} />
    </Canvas>
  );
}
