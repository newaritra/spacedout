import * as THREE from "three";
import type { BodyPhysicalData } from "./horizons";

export const BODY_COLORS: Record<string, string> = {
  Mercury: "#9a9a9a",
  Venus: "#d9c58b",
  Earth: "#4f86f7",
  Mars: "#c65d3b",
  Jupiter: "#d8b38a",
  Saturn: "#e3d3a1",
  Uranus: "#8fe7ff",
  Neptune: "#4b70dd",
  Pluto: "#b79b7f",
  Sun: "#ffd54a",
};

export function getBodyColor(name: string) {
  return BODY_COLORS[name] ?? "#dddddd";
}

export function radiusKmToRenderScale(radiusKm: number | null) {
  if (!radiusKm || radiusKm <= 0) return 0.15;

  // Exaggerated for visibility, not physically to scale
  if (radiusKm < 3000) return 0.18;
  if (radiusKm < 7000) return 0.25;
  if (radiusKm < 30000) return 0.45;
  if (radiusKm < 70000) return 0.75;
  return 1.1;
}

export function visualMagToEmissiveIntensity(visualMag: number | null) {
  if (visualMag == null) return 0.4;

  if (visualMag < -20) return 2.5;
  if (visualMag < -5) return 1.5;
  if (visualMag < 0) return 0.9;
  if (visualMag < 2) return 0.6;
  return 0.35;
}

export function albedoToRoughness(albedo: number | null) {
  if (albedo == null) return 0.8;
  return 1 - Math.max(0.05, Math.min(0.9, albedo));
}

export function getBodyMaterialProps(physical: BodyPhysicalData) {
  const color = new THREE.Color(getBodyColor(physical.name));

  return {
    color,
    emissive: color.clone().multiplyScalar(1.2),
    emissiveIntensity: visualMagToEmissiveIntensity(physical.visualMag),
    roughness: albedoToRoughness(physical.geometricAlbedo),
    metalness: 0,
  };
}
