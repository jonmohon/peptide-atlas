import type { Peptide, PeptideCategory, RegionId } from '@/types';

let _peptides: Peptide[] = [];

export function setPeptides(peptides: Peptide[]) {
  _peptides = peptides;
}

export function getAllPeptides(): Peptide[] {
  return _peptides;
}

export function getPeptidesByRegion(regionId: RegionId): Peptide[] {
  return _peptides.filter((p) =>
    p.affectedRegions.some((r) => r.regionId === regionId)
  );
}

export function getPeptidesByEffect(effectId: string): Peptide[] {
  return _peptides.filter((p) => p.effects.includes(effectId));
}

export function getPeptidesByCategory(category: PeptideCategory): Peptide[] {
  return _peptides.filter((p) => p.category === category);
}

export function getPeptideRegionIntensity(
  peptideId: string,
  regionId: RegionId
): number {
  const peptide = _peptides.find((p) => p.id === peptideId);
  if (!peptide) return 0;
  const region = peptide.affectedRegions.find((r) => r.regionId === regionId);
  return region?.intensity ?? 0;
}

export function getRegionEffectDescription(
  peptideId: string,
  regionId: RegionId
): string | undefined {
  const peptide = _peptides.find((p) => p.id === peptideId);
  if (!peptide) return undefined;
  const region = peptide.affectedRegions.find((r) => r.regionId === regionId);
  return region?.description;
}

export function searchPeptides(query: string): Peptide[] {
  const q = query.toLowerCase().trim();
  if (!q) return _peptides;

  return _peptides.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.fullName.toLowerCase().includes(q) ||
      p.abbreviation.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.effects.some((e) => e.includes(q))
  );
}

export function getMergedRegionHighlights(
  peptideIds: string[]
): Map<RegionId, { intensity: number; count: number }> {
  const merged = new Map<RegionId, { intensity: number; count: number }>();

  for (const id of peptideIds) {
    const peptide = _peptides.find((p) => p.id === id);
    if (!peptide) continue;

    for (const region of peptide.affectedRegions) {
      const existing = merged.get(region.regionId);
      if (existing) {
        merged.set(region.regionId, {
          intensity: Math.max(existing.intensity, region.intensity),
          count: existing.count + 1,
        });
      } else {
        merged.set(region.regionId, {
          intensity: region.intensity,
          count: 1,
        });
      }
    }
  }

  return merged;
}
