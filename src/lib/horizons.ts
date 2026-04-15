export type OrbitPoint = {
  jd: number;
  x: number;
  y: number;
  z: number;
  vx: number | null;
  vy: number | null;
  vz: number | null;
};

export type BodyPhysicalData = {
  name: string;
  radiusKm: number | null;
  equatorialRadiusKm: number | null;
  geometricAlbedo: number | null;
  meanTemperatureK: number | null;
  visualMag: number | null;
  obliquityDeg: number | null;
  orbitalPeriodDays: number | null;
  orbitalSpeedKmS: number | null;
};

export type HorizonsBodyData = {
  physical: BodyPhysicalData;
  orbit: OrbitPoint[];
};

function extractNumber(input: string): number | null {
  const match = input.match(/[-+]?\d*\.?\d+(?:[Ee][-+]?\d+)?/);
  return match ? Number(match[0]) : null;
}

function parsePhysicalData(text: string): BodyPhysicalData {
  const lines = text.split("\n");

  const getLineContaining = (needle: string) =>
    lines.find((line) => line.includes(needle)) ?? "";

  const nameLine =
    lines.find((line) => line.includes("Target body name:")) ?? "";
  const nameMatch = nameLine.match(/Target body name:\s*(.+?)\s*\(/);
  const name = nameMatch?.[1]?.trim() ?? "Unknown";

  const meanRadiusLine = getLineContaining("Vol. mean radius (km)");
  const equatorialRadiusLine = getLineContaining("Equatorial radius (km)");
  const albedoLine = getLineContaining("Geometric Albedo");
  const temperatureLine = getLineContaining("Mean temperature (K)");
  const visualMagLine = getLineContaining("Visual mag. V(1,0)");
  const obliquityLine = getLineContaining("Obliquity to orbit");
  const orbitalPeriodLine = getLineContaining("Mean sidereal orb per =");
  const orbitalSpeedLine = getLineContaining("Orbital speed,  km/s");

  const radiusKm =
    extractNumber(meanRadiusLine.split("=").slice(1).join("=")) ?? null;

  const equatorialRadiusKm =
    extractNumber(equatorialRadiusLine.split("=").slice(1).join("=")) ?? null;

  const geometricAlbedo =
    extractNumber(albedoLine.split("=").slice(1).join("=")) ?? null;

  const meanTemperatureK =
    extractNumber(temperatureLine.split("=").slice(1).join("=")) ?? null;

  const visualMag =
    extractNumber(visualMagLine.split("=").slice(1).join("=")) ?? null;

  const obliquityDeg =
    extractNumber(obliquityLine.split("=").slice(1).join("=")) ?? null;

  // Prefer the "days" period line if present
  const orbitalPeriodDaysLine =
    lines.find((line) => line.includes("Mean sidereal orb per =") && line.includes(" d")) ??
    orbitalPeriodLine;

  const orbitalPeriodDays =
    extractNumber(orbitalPeriodDaysLine.split("=").slice(1).join("=")) ?? null;

  const orbitalSpeedKmS =
    extractNumber(orbitalSpeedLine.split("=").slice(1).join("=")) ?? null;

  return {
    name,
    radiusKm,
    equatorialRadiusKm,
    geometricAlbedo,
    meanTemperatureK,
    visualMag,
    obliquityDeg,
    orbitalPeriodDays,
    orbitalSpeedKmS,
  };
}

function parseOrbit(text: string): OrbitPoint[] {
  const lines = text.split("\n");
  const points: OrbitPoint[] = [];

  let currentJd: number | null = null;
  let currentPos: { x: number; y: number; z: number } | null = null;
  let currentVel: { vx: number; vy: number; vz: number } | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line.includes("=") && line.includes("TDB")) {
      const jd = Number(line.split("=")[0].trim());
      currentJd = Number.isFinite(jd) ? jd : null;
      currentPos = null;
      currentVel = null;
      continue;
    }

    if (line.startsWith("X =")) {
      const match = line.match(/X =\s*(\S+)\s+Y =\s*(\S+)\s+Z =\s*(\S+)/);
      if (match) {
        currentPos = {
          x: Number(match[1]),
          y: Number(match[2]),
          z: Number(match[3]),
        };
      }
      continue;
    }

    if (line.startsWith("VX=")) {
      const match = line.match(/VX=\s*(\S+)\s+VY=\s*(\S+)\s+VZ=\s*(\S+)/);
      if (match) {
        currentVel = {
          vx: Number(match[1]),
          vy: Number(match[2]),
          vz: Number(match[3]),
        };
      }
    }

    if (currentJd !== null && currentPos && currentVel) {
      points.push({
        jd: currentJd,
        x: currentPos.x,
        y: currentPos.y,
        z: currentPos.z,
        vx: currentVel.vx,
        vy: currentVel.vy,
        vz: currentVel.vz,
      });

      currentJd = null;
      currentPos = null;
      currentVel = null;
    }
  }

  return points;
}

export function parseHorizonsResponse(text: string): HorizonsBodyData {
  return {
    physical: parsePhysicalData(text),
    orbit: parseOrbit(text),
  };
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function interpolateOrbitPoint(a: OrbitPoint, b: OrbitPoint, jd: number) {
  const span = b.jd - a.jd;
  const t = span === 0 ? 0 : (jd - a.jd) / span;

  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    z: lerp(a.z, b.z, t),
  };
}

export function findOrbitSegment(points: OrbitPoint[], jd: number) {
  if (points.length < 2) return null;

  if (jd <= points[0].jd) {
    return { a: points[0], b: points[1] };
  }

  if (jd >= points[points.length - 1].jd) {
    return {
      a: points[points.length - 2],
      b: points[points.length - 1],
    };
  }

  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    if (jd >= a.jd && jd <= b.jd) {
      return { a, b };
    }
  }

  return null;
}