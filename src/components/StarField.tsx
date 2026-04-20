import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";

export type CosmicBody = {
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

// Reuse a single Color instance — no per-call allocation
const _color = new THREE.Color();
const _matrix = new THREE.Matrix4();

function ciToColor(ci: number | null, out: THREE.Color): THREE.Color {
  if (ci == null) return out.setRGB(1, 1, 1);

  const clamped = Math.max(-0.4, Math.min(2.0, ci));
  const t = (clamped + 0.4) / 2.4;
  const exaggerated = Math.pow(t, 1.5);

  return out.setHSL(0.66 - exaggerated * 0.66, 0.8, 0.7);
}

function magToSize(mag: number | null): number {
  if (mag == null) return 0.05;
  const base = Math.pow(10, -0.4 * mag);
  return Math.max(0.01, Math.min(0.15, base * 0.05));
}

export default function StarField({ stars }: { stars: CosmicBody[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);

  // Shared geometry/material — one sphere template, 8 segments is fine for distant stars
  const geometry = useMemo(() => new THREE.SphereGeometry(1, 8, 8), []);
  const material = useMemo(
    () => new THREE.MeshBasicMaterial({ color: 0xffffff }),
    [],
  );

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    stars.forEach((star, i) => {
      const size = magToSize(star.mag);

      // Scale encodes the radius; translation encodes position
      _matrix.makeScale(size, size, size);
      _matrix.setPosition(star.x, star.y, star.z);
      mesh.setMatrixAt(i, _matrix);

      ciToColor(star.ci, _color);
      const brightness = Math.max(0.35, 1 - star.dist / 300);
      _color.multiplyScalar(brightness * 1.5);
      mesh.setColorAt(i, _color);
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [stars]);

  return (
    <instancedMesh ref={meshRef} args={[geometry, material, stars.length]} />
  );
}
