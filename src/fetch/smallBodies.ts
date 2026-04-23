export type SmallBody = {
  fullName: string;
  name: string | null;
  semiMajorAxis: number; // AU
  eccentricity: number;
  inclination: number; // deg
  ascendingNode: number; // deg (Ω)
  argPerihelion: number; // deg (ω)
  meanAnomaly: number; // deg (M₀ at epoch)
  periodYears: number;
  classification: string;
  absMag: number | null;
};

// Fetch named numbered asteroids — Ceres, Vesta, Eros etc.
// Swap sb-class filter to taste: MBA, NEO, TNO, COM...
export async function fetchSmallBodies(): Promise<SmallBody[]> {
  const fields = [
    "full_name",
    "name",
    "a",
    "e",
    "i",
    "om",
    "w",
    "ma",
    "per_y",
    "class",
    "H",
  ].join(",");

  // Named numbered asteroids (has an IAU name, well-determined orbit)
  const url =
    `/api/sbdb` +
    `?fields=${fields}` +
    `&sb-kind=a` +
    `&sb-ns=n` + // numbered only — these have the best orbits
    `&full-prec=true` +
    `&limit=500`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`JPL SBDB fetch failed: ${res.status}`);

  const json = await res.json();

  // Response shape: { fields: string[], data: (string|null)[][] }
  const fieldIndex = (name: string) => json.fields.indexOf(name);

  const fi = {
    fullName: fieldIndex("full_name"),
    name: fieldIndex("name"),
    a: fieldIndex("a"),
    e: fieldIndex("e"),
    i: fieldIndex("i"),
    om: fieldIndex("om"),
    w: fieldIndex("w"),
    ma: fieldIndex("ma"),
    perY: fieldIndex("per_y"),
    cls: fieldIndex("class"),
    H: fieldIndex("H"),
  };

  return (json.data as (string | null)[][])
    .map((row) => ({
      fullName: row[fi.fullName] ?? "Unknown",
      name: row[fi.name] ?? null,
      semiMajorAxis: parseFloat(row[fi.a] ?? "0"),
      eccentricity: parseFloat(row[fi.e] ?? "0"),
      inclination: parseFloat(row[fi.i] ?? "0"),
      ascendingNode: parseFloat(row[fi.om] ?? "0"),
      argPerihelion: parseFloat(row[fi.w] ?? "0"),
      meanAnomaly: parseFloat(row[fi.ma] ?? "0"),
      periodYears: parseFloat(row[fi.perY] ?? "0"),
      classification: row[fi.cls] ?? "",
      absMag: row[fi.H] != null ? parseFloat(row[fi.H]!) : null,
    }))
    .filter(
      (b) =>
        b.semiMajorAxis > 0 && b.periodYears > 0 && Boolean(b.name?.length),
    ); // drop bad rows
}
