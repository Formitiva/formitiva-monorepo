
export const dimensionUnitsMap: Record<string, string[]> = {
  length: ["m", "cm", "mm", "km", "in", "ft", "yd", "mi"],
  area: ["m^2", "cm^2", "mm^2", "in^2", "ft^2", "yd^2"],
  volume: ["L", "m^3", "cm^3", "mL", "in^3", "ft^3", "yd^3"],
  weight: ["kg", "g", "mg", "t", "lb", "oz"],
  time: ["min", "s", "h", "ms", "d"],
  temperature: ["C", "F", "K"],
  angle: ["deg", "rad", "rev"],
};

// Friendly display names for units (per-dimension) used for labels in UI dropdowns
export const dimensionUnitDisplayMap: Record<string, Record<string, string>> = {
  length: {
    m: "Meter (m)",
    mm: "Millimeter (mm)",
    cm: "Centimeter (cm)",
    km: "Kilometer (km)",
    in: "Inch (in)",
    ft: "Foot (ft)",
    yd: "Yard (yd)",
    mi: "Mile (mi)",
  },
  area: {
    "m^2": "Square meter (m^2)",
    "mm^2": "Square millimeter (mm^2)",
    "cm^2": "Square centimeter (cm^2)",
    "in^2": "Square inch (in^2)",
    "ft^2": "Square foot (ft^2)",
    "yd^2": "Square yard (yd^2)",
  },
  volume: {
    L: "Liter (L)",
    "cm^3": "Cubic centimeter (cm^3)",
    "m^3": "Cubic meter (m^3)",
    mL: "Milliliter (mL)",
    "in^3": "Cubic inch (in^3)",
    "ft^3": "Cubic foot (ft^3)",
    "yd^3": "Cubic yard (yd^3)",
  },
  weight: {
    kg: "Kilogram (kg)",
    g: "Gram (g)",
    mg: "Milligram (mg)",
    t: "Tonne (t)",
    lb: "Pound (lb)",
    oz: "Ounce (oz)",
  },
  time: {
    s: "Second (s)",
    min: "Minute (min)",
    h: "Hour (h)",
    ms: "Millisecond (ms)",
    d: "Day (d)",
    wk: "Week (wk)",
  },
  temperature: {
    C: "Celsius (C)",
    F: "Fahrenheit (F)",
    K: "Kelvin (K)",
  },
  angle: {
    deg: "Degree (deg)",
    rad: "Radian (rad)",
    rev: "Revolution (rev)",
  },
};

export const dimensonUnitFactorsMap: Record<string, Record<string, number>> = {
  length: {
    "mm": 1000,
    "cm": 100,
    "m": 1,
    "km": 0.001,
    "in": 100 / 2.54,
    "ft": 100 / (2.54 * 12),
    "yd": 100 / (2.54 * 36),
    "mi": 1 / 1609.344,
  },
  area: {
    "m^2": 1.0,
    "mm^2": 1000000,
    "cm^2": 10000,
    "km^2": 1 / 1000000,
    "in^2": (100 / 2.54) ** 2,
    "ft^2": (100 / (2.54 * 12)) ** 2,
    "yd^2": (100 / (2.54 * 36)) ** 2,
  },
  volume: {
    "cm^3": 1000000,
    "m^3": 1.0,
    "L": 1.0,
    "mL": 1000000,
    "in^3": (100 / 2.54) ** 3,
    "ft^3": (100 / (2.54 * 12)) ** 3,
    "yd^3": (100 / (2.54 * 36)) ** 3,
  },
  weight: {
    "mg": 1000000,
    "g": 1000,
    "kg": 1,
    "t": 0.001,
    "lb": 1 / 0.45359237,
    "oz": 1 / 0.028349523125,
  },
  time: {
    "ms": 1000,
    "s": 1,
    "min": 1 / 60,
    "h": 1 / 3600,
    "d": 1 / 86400,
    "wk": 1 / 604800,
  },
  temperature: {
    "C": 1,
    "F": 33.8,
    "K": 274.15,
  },
  angle: {
    "deg": 1,
    "rad": Math.PI / 180,
    "rev": 1 / 360,
  },
};

// Merge the three maps (unit lists, displays, and factors) into a single lookup
export const unitsByDimension: Record<
  string,
  Record<string, { name: string; shortName: string; factor?: number }>
> = {};

// Collect all dimension keys present in any of the maps
const allDimensions = new Set<string>([
  ...Object.keys(dimensionUnitsMap),
  ...Object.keys(dimensionUnitDisplayMap),
  ...Object.keys(dimensonUnitFactorsMap),
]);

for (const dim of allDimensions) {
  const units: Record<string, { name: string; shortName: string; factor?: number }> = {};

  const list = dimensionUnitsMap[dim] ?? [];
  const display = dimensionUnitDisplayMap[dim] ?? {};
  const factors = dimensonUnitFactorsMap[dim] ?? {};

  // Start from the ordered list when present
  for (const u of list) {
    const displayVal = display[u];
    units[u] = {
      name: typeof displayVal === "string" ? displayVal : String(u),
      shortName: u,
      factor: u in factors ? factors[u] : undefined,
    };
  }

  // Include any units mentioned in display map but not in list
  for (const [u, info] of Object.entries(display)) {
    if (!units[u]) {
      const name = typeof info === "string" ? info : String(u);
      units[u] = { name, shortName: u, factor: u in factors ? factors[u] : undefined };
    }
  }

  // Include any units present in factors but not yet added
  for (const [u, f] of Object.entries(factors)) {
    if (!units[u]) {
      units[u] = { name: String(u), shortName: String(u), factor: f };
    }
  }

  unitsByDimension[dim] = units;
}

// Temperature conversion (non-linear)
export function convertTemperature(
  fromUnit: string,
  toUnit: string,
  value: number
): number {
  if (fromUnit === "C") {
    if (toUnit === "F") return value * (9 / 5) + 32;
    if (toUnit === "K") return value + 273.15;
  } else if (fromUnit === "F") {
    if (toUnit === "C") return ((value - 32) * 5) / 9;
    if (toUnit === "K") return ((value - 32) * 5) / 9 + 273.15;
  } else if (fromUnit === "K") {
    if (toUnit === "C") return value - 273.15;
    if (toUnit === "F") return ((value - 273.15) * 9) / 5 + 32;
  }
  return value;
}

// Get unit conversion factors for a dimension
export function getUnitFactors(dimension: string): {
  default: string;
  units: string[];
  factors: Record<string, number>;
} | null {
  const unitsForDim = unitsByDimension[dimension];
  if (!unitsForDim) return null;

  const factorsMap: Record<string, number> = {};
  const unitKeys: string[] = [];

  for (const [u, info] of Object.entries(unitsForDim)) {
    if (typeof info.factor === "number") factorsMap[u] = info.factor;
    unitKeys.push(u);
  }

  const preferredDefault = Object.keys(unitsForDim)[0] ?? "";
  return {
    default: preferredDefault,
    units: unitKeys,
    factors: factorsMap,
  };
}

