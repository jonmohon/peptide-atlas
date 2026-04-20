/**
 * Dose arithmetic for the execution wizard — vial + BAC water → concentration,
 * target dose → volume → insulin-syringe units. Plus the "snap to clean math"
 * algorithm that picks the BAC volume so a target dose lands on a whole unit.
 *
 * All internal math is in mcg and mL. Unit conversions stay at the boundary.
 */

export type SyringeSize = 'u30' | 'u50' | 'u100';

export const SYRINGE_CAPACITY_ML: Record<SyringeSize, number> = {
  u30: 0.3,
  u50: 0.5,
  u100: 1.0,
};

export const SYRINGE_MAX_UNITS: Record<SyringeSize, number> = {
  u30: 30,
  u50: 50,
  u100: 100,
};

/** Insulin-syringe units are 1 unit = 0.01 mL, regardless of barrel size. */
export function mlToUnits(volumeMl: number): number {
  return volumeMl * 100;
}

export function unitsToMl(units: number): number {
  return units / 100;
}

export interface Recipe {
  vialSizeMg: number;
  waterMl: number;
}

export interface PullResult {
  volumeMl: number;
  units: number;
  concentrationMcgPerMl: number;
  concentrationMcgPerUnit: number;
  dosesPerVial: number;
  fitsInSyringe: boolean;
  recommendedSyringe: SyringeSize;
  /** Dose error if the user pulls to the nearest whole unit. */
  toleranceMcgPerUnit: number;
  subUnitPrecision: boolean;
}

export function concentration(recipe: Recipe): number {
  if (recipe.waterMl <= 0) return 0;
  return (recipe.vialSizeMg * 1000) / recipe.waterMl;
}

export function pullForDose(recipe: Recipe, desiredDoseMcg: number): PullResult {
  const mcgPerMl = concentration(recipe);
  const volumeMl = mcgPerMl > 0 ? desiredDoseMcg / mcgPerMl : 0;
  const units = mlToUnits(volumeMl);
  const mcgPerUnit = mcgPerMl / 100;

  const recommendedSyringe: SyringeSize =
    units <= 30 ? 'u30' : units <= 50 ? 'u50' : 'u100';

  return {
    volumeMl,
    units,
    concentrationMcgPerMl: mcgPerMl,
    concentrationMcgPerUnit: mcgPerUnit,
    dosesPerVial: desiredDoseMcg > 0 ? (recipe.vialSizeMg * 1000) / desiredDoseMcg : 0,
    fitsInSyringe: units <= SYRINGE_MAX_UNITS.u100,
    recommendedSyringe,
    toleranceMcgPerUnit: mcgPerUnit,
    subUnitPrecision: units > 0 && units < 2,
  };
}

/**
 * Pick a BAC water volume so that `targetDoseMcg` lands exactly on `targetUnits`
 * whole insulin-syringe units. Caller usually passes `targetUnits = 25` to aim
 * for a quarter-syringe draw on a U-100, or a round number that's easy to hit.
 */
export function snapToCleanMath(
  vialSizeMg: number,
  targetDoseMcg: number,
  options: { targetUnits?: number; syringe?: SyringeSize; preferWholeMl?: boolean } = {},
): number {
  const { targetUnits, syringe = 'u50', preferWholeMl = false } = options;

  const candidates: Array<{ waterMl: number; distance: number }> = [];
  const maxUnits = SYRINGE_MAX_UNITS[syringe];

  // If caller specified a target unit count, compute directly.
  if (targetUnits && targetUnits > 0 && targetUnits <= maxUnits) {
    const waterMl = (vialSizeMg * 1000 * targetUnits) / (targetDoseMcg * 100);
    candidates.push({ waterMl, distance: 0 });
  }

  // Also try a range of common clean targets: 10, 20, 25, 40, 50 units.
  const cleanUnitTargets = [10, 20, 25, 40, 50].filter((u) => u <= maxUnits);
  for (const units of cleanUnitTargets) {
    const waterMl = (vialSizeMg * 1000 * units) / (targetDoseMcg * 100);
    const distance = Math.abs(units - (targetUnits ?? 25));
    candidates.push({ waterMl, distance });
  }

  // Filter sensible BAC volumes (0.5–5 mL) and prefer whole/half mL if requested.
  const usable = candidates
    .filter((c) => c.waterMl >= 0.5 && c.waterMl <= 5)
    .sort((a, b) => {
      if (preferWholeMl) {
        const aWhole = Math.abs(a.waterMl - Math.round(a.waterMl * 2) / 2);
        const bWhole = Math.abs(b.waterMl - Math.round(b.waterMl * 2) / 2);
        return aWhole - bWhole || a.distance - b.distance;
      }
      return a.distance - b.distance;
    });

  return usable[0]?.waterMl ?? 2;
}

export function reconstitutedShelfLifeRemainingDays(
  reconstitutedAt: Date,
  shelfLifeDays: number,
  now: Date = new Date(),
): number {
  const elapsedMs = now.getTime() - reconstitutedAt.getTime();
  const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24);
  return Math.max(0, shelfLifeDays - elapsedDays);
}
