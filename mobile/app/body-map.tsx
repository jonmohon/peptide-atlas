/**
 * Body map — anterior silhouette with tappable region markers.
 *
 * Coordinate system: viewBox 0 0 100 210. The silhouette is built from
 * pre-defined polygons. Each `bodyRegion` entry has an (x,y) marker position.
 * Tapping a marker selects the region and reveals related peptides at the
 * bottom of the screen.
 */

import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, { Circle, Defs, Pattern, Polygon, Rect } from 'react-native-svg';

import { GlassCard } from '@/components/glass-card';
import { Screen } from '@/components/screen';
import { bodyPolygons } from '@/data/body-polygons';
import { bodyRegions } from '@/data/body-regions';
import { categories } from '@/data/categories';
import { peptides } from '@/data/peptides';
import type { RegionId } from '@/types';

const REGION_ACCENT: Record<string, string> = {
  brain: '#a855f7',
  pituitary: '#a855f7',
  heart: '#ef4444',
  lungs: '#06b6d4',
  liver: '#f97316',
  gut: '#10b981',
  kidneys: '#06b6d4',
  muscles: '#ef4444',
  joints: '#10b981',
  skin: '#ec4899',
  bones: '#a3a3a3',
  reproductive: '#ec4899',
  'immune-system': '#10b981',
};

export default function BodyMapScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<RegionId | null>(null);

  const selectedRegion = bodyRegions.find((r) => r.id === selected);
  const selectedAccent = selected ? REGION_ACCENT[selected] ?? '#06b6d4' : '#06b6d4';

  const relatedPeptides = useMemo(() => {
    if (!selected) return [];
    return peptides
      .filter((p) => p.affectedRegions.some((r) => r.regionId === selected))
      .map((p) => {
        const effect = p.affectedRegions.find((r) => r.regionId === selected);
        return { peptide: p, intensity: effect?.intensity ?? 0, description: effect?.description ?? '' };
      })
      .sort((a, b) => b.intensity - a.intensity);
  }, [selected]);

  return (
    <Screen contentContainerStyle={{ paddingTop: 8 }}>
      <Pressable onPress={() => router.back()} className="-ml-2 mb-3 flex-row items-center gap-1 active:opacity-60">
        <Ionicons name="chevron-back" size={20} color="#a3a3a3" />
        <Text className="text-sm text-text-secondary">Atlas</Text>
      </Pressable>

      <View className="mb-4">
        <Text className="text-xs uppercase tracking-widest text-text-secondary">Explore</Text>
        <Text className="mt-1 text-3xl font-bold text-foreground">Body map</Text>
        <Text className="mt-2 text-sm leading-relaxed text-text-secondary">
          Tap a region to see peptides that affect it.
        </Text>
      </View>

      <GlassCard className="mb-5 p-4" bright>
        <View style={{ aspectRatio: 100 / 210, alignSelf: 'center', width: '85%' }}>
          <Svg viewBox="0 0 100 210" width="100%" height="100%">
            <Defs>
              <Pattern id="grid" width={5} height={5} patternUnits="userSpaceOnUse">
                <Circle cx={2.5} cy={2.5} r={0.12} fill="rgba(255,255,255,0.05)" />
              </Pattern>
            </Defs>
            <Rect x={0} y={0} width={100} height={210} fill="url(#grid)" />

            {bodyPolygons.map((points, i) => (
              <Polygon
                key={i}
                points={points}
                fill="rgba(6,182,212,0.06)"
                stroke="rgba(6,182,212,0.18)"
                strokeWidth={0.3}
                strokeLinejoin="round"
              />
            ))}

            {bodyRegions.map((region) => {
              const isSelected = region.id === selected;
              const accent = REGION_ACCENT[region.id] ?? '#06b6d4';
              return (
                <Circle
                  key={region.id}
                  cx={region.position.x}
                  cy={region.position.y}
                  r={isSelected ? 4 : 2.5}
                  fill={isSelected ? accent : `${accent}cc`}
                  stroke={isSelected ? '#ffffff' : 'rgba(255,255,255,0.4)'}
                  strokeWidth={isSelected ? 0.6 : 0.3}
                  onPress={() => setSelected(region.id)}
                />
              );
            })}
          </Svg>
        </View>
      </GlassCard>

      {!selected && (
        <View className="mb-3">
          <Text className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-secondary">
            All regions
          </Text>
          <View className="flex-row flex-wrap" style={{ gap: 8 }}>
            {bodyRegions.map((r) => {
              const accent = REGION_ACCENT[r.id] ?? '#06b6d4';
              return (
                <Pressable key={r.id} onPress={() => setSelected(r.id)} className="active:opacity-70">
                  <View
                    className="rounded-full border px-3 py-1.5"
                    style={{ backgroundColor: `${accent}1a`, borderColor: `${accent}55` }}
                  >
                    <Text className="text-xs font-medium" style={{ color: accent }}>
                      {r.label}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {selectedRegion && (
        <>
          <GlassCard className="mb-5 p-5" bright>
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-3">
                <Text className="text-xs uppercase tracking-widest" style={{ color: selectedAccent }}>
                  Selected region
                </Text>
                <Text className="mt-1 text-xl font-bold text-foreground">{selectedRegion.label}</Text>
                <Text className="mt-2 text-xs leading-relaxed text-text-secondary">
                  {selectedRegion.description}
                </Text>
              </View>
              <Pressable onPress={() => setSelected(null)} className="active:opacity-60">
                <Ionicons name="close-circle" size={22} color="#737373" />
              </Pressable>
            </View>

            {selectedRegion.relatedEffects.length > 0 && (
              <View className="mt-4 flex-row flex-wrap" style={{ gap: 6 }}>
                {selectedRegion.relatedEffects.map((e) => (
                  <View key={e} className="rounded-full bg-white/[0.06] px-2.5 py-1">
                    <Text className="text-[10px] text-text-secondary">{e}</Text>
                  </View>
                ))}
              </View>
            )}
          </GlassCard>

          <Text className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-secondary">
            {relatedPeptides.length} peptide{relatedPeptides.length === 1 ? '' : 's'} affect this region
          </Text>

          <View className="gap-2.5">
            {relatedPeptides.map(({ peptide, intensity, description }) => {
              const cat = categories.find((c) => c.id === peptide.category);
              const accent = cat?.color ?? '#06b6d4';
              return (
                <Link key={peptide.id} href={`/peptides/${peptide.slug}`} asChild>
                  <Pressable className="active:opacity-70">
                    <GlassCard className="p-4">
                      <View className="flex-row items-start gap-3">
                        <View className="items-center" style={{ width: 28 }}>
                          <Text className="text-xs font-bold" style={{ color: accent }}>
                            {intensity}
                          </Text>
                          <Text className="text-[8px] uppercase tracking-wider text-text-muted">
                            /5
                          </Text>
                        </View>
                        <View className="flex-1">
                          <View className="flex-row items-center gap-2">
                            <Text className="text-sm font-semibold text-foreground">{peptide.name}</Text>
                            <View
                              className="rounded-full px-2 py-0.5"
                              style={{ backgroundColor: `${accent}1f` }}
                            >
                              <Text className="text-[10px]" style={{ color: accent }}>
                                {cat?.label ?? peptide.category}
                              </Text>
                            </View>
                          </View>
                          <Text className="mt-1 text-xs leading-relaxed text-text-secondary">
                            {description}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={14} color="#737373" />
                      </View>
                    </GlassCard>
                  </Pressable>
                </Link>
              );
            })}
            {relatedPeptides.length === 0 && (
              <Text className="text-center text-sm text-text-secondary">
                No peptides catalogued for this region yet.
              </Text>
            )}
          </View>
        </>
      )}
    </Screen>
  );
}
