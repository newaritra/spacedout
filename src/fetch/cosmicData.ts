import type { System } from "../components/Exoplanets/ExoplanetSystem";
import type { CosmicBody } from "../components/StarField";

export async function fetchExoplanetSystems(): Promise<System[]> {
  const res = await fetch("/exoplanet_systems.json");
  const data = (await res.json()) as System[];

  // apply SAME scaling as HYG
  const scaled = data.slice(0, 10000).map((s) => ({
    ...s,
    position: {
      x: s.position.x / 50,
      y: s.position.y / 50,
      z: s.position.z / 50,
    },
  }));

  return scaled;
}

export async function fetchStarData(): Promise<CosmicBody[]> {
  const res = await fetch("/stars.json");
  const data = (await res.json()) as CosmicBody[];

  // Normalised and scaled to fit in scene - max distance is ~500ly, so divide by 50 to get max of 10 units
  const scaled = data.slice(0, 20000).map((s) => ({
    ...s,
    x: s.x / 50,
    y: s.y / 50,
    z: s.z / 50,
  }));

  return scaled;
}
