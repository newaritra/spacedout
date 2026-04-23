import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { SmallBody } from "../fetch/smallBodies";

// Scale: 1 AU → 1 scene unit (matches your exoplanet system's AU scale)
const AU = 1;
// const TIME_SCALE = 50; // match your existing constant

const _matrix = new THREE.Matrix4();
const _pos = new THREE.Vector3();
const _color = new THREE.Color();

const SMALL_BODY_TIME_SCALE = 0.05;

function classToColor(cls: string): THREE.Color {
  if (cls.startsWith("NEO") || cls === "APO" || cls === "ATE" || cls === "AMO")
    return _color.setHex(0xff6644); // NEOs: orange-red
  if (cls === "MBA") return _color.setHex(0x8899aa); // Main belt: grey-blue
  if (cls === "TNO" || cls === "CEN") return _color.setHex(0x44aaff); // Trans-Neptunian / Centaurs: icy blue
  return _color.setHex(0xcccccc);
}

export default function SmallBodies({ bodies }: { bodies: SmallBody[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);

  // Build geometry/material once
  useEffect(() => {
    const mesh = meshRef.current;
    const geo = new THREE.SphereGeometry(1, 4, 4);
    const mat = new THREE.MeshBasicMaterial();
    mesh.geometry = geo;
    mesh.material = mat;

    // Set initial colors (static per body)
    bodies.forEach((body, i) => {
      classToColor(body.classification);
      mesh.setColorAt(i, _color);
    });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

    return () => {
      geo.dispose();
      mat.dispose();
    };
  }, [bodies]);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    const t = clock.getElapsedTime();

    bodies.forEach((body, i) => {
      const {
        semiMajorAxis: aAU,
        eccentricity: e,
        inclination,
        ascendingNode: om,
        argPerihelion: w,
        meanAnomaly: M0,
        periodYears,
      } = body;

      const a = aAU * AU;
      const b = a * Math.sqrt(1 - e * e);
      const n = (2 * Math.PI) / (periodYears / SMALL_BODY_TIME_SCALE);
      const M = M0 * (Math.PI / 180) + n * t;

      // Kepler's equation — eccentric anomaly
      let E = M;
      for (let k = 0; k < 6; k++)
        E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));

      // Position in orbital plane
      const xOrb = a * Math.cos(E) - a * e;
      const zOrb = b * Math.sin(E);

      // Apply Euler rotations: ω (arg perihelion), i (inclination), Ω (ascending node)
      const iRad = inclination * (Math.PI / 180);
      const omRad = om * (Math.PI / 180);
      const wRad = w * (Math.PI / 180);

      const cosW = Math.cos(wRad),
        sinW = Math.sin(wRad);
      const cosI = Math.cos(iRad),
        sinI = Math.sin(iRad);
      const cosO = Math.cos(omRad),
        sinO = Math.sin(omRad);

      // Rotate into ecliptic frame
      const x1 = cosW * xOrb - sinW * zOrb;
      const y1 = sinW * xOrb + cosW * zOrb;

      const x2 = x1;
      const y2 = cosI * y1;
      const z2 = sinI * y1;

      const x3 = cosO * x2 - sinO * y2; // X ecliptic
      const y3 = sinO * x2 + cosO * y2; // Y ecliptic  ← becomes Three.js Z
      const z3 = z2; // Z ecliptic  ← becomes Three.js Y

      const size = 0.005; // uniform small size — these are tiny
      _pos.set(x3, z3, y3); // swap Y/Z: ecliptic → Three.js (Y-up)

      _matrix.makeScale(size, size, size);
      _matrix.setPosition(_pos);

      mesh.setMatrixAt(i, _matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, bodies.length]} />
  );
}
