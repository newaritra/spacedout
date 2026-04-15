import { OrbitingBody } from "./OrbitingBody";
import { Sun } from "./Sun";
type Vec3 = [number, number, number];

import { useEffect, useState } from "react";

const PLANETS = [
  { command: "199", stepSize: "2d" }, // Mercury
  { command: "299", stepSize: "2d" }, // Venus
  { command: "399", stepSize: "2d" }, // Earth
  { command: "499", stepSize: "2d" }, // Mars
  { command: "599", stepSize: "5d" }, // Jupiter
  { command: "699", stepSize: "5d" }, // Saturn
  { command: "799", stepSize: "7d" }, // Uranus
  { command: "899", stepSize: "7d" }, // Neptune
];

export function SolarSystemBase() {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function revealSequentially() {
      for (let i = 0; i < PLANETS.length; i++) {
        if (cancelled) return;
        setVisibleCount(i + 1);
        await new Promise((r) => setTimeout(r, 700));
      }
    }

    revealSequentially();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <Sun />

      {PLANETS.slice(0, visibleCount).map((planet) => (
        <OrbitingBody
          key={planet.command}
          command={planet.command}
          start="2026-01-01"
          stop="2026-12-31"
          stepSize={planet.stepSize}
          simDaysPerSecond={12}
        />
      ))}
    </>
  );
}

export function SolarSystem({ sunPosition }: { sunPosition: Vec3 }) {
  return (
    <group position={sunPosition}>
      <SolarSystemBase />
    </group>
  );
}
