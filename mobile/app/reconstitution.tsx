/**
 * Reconstitution calculator — given vial size (mg) and diluent volume (mL),
 * compute concentration and units-per-dose for a typical insulin syringe (100u/mL).
 *
 * Pre-fills vial size and typical dose from data/reconstitution.ts when a
 * peptide is selected. Free of any backend calls — pure math.
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/glass-card';
import { peptides } from '@/data/peptides';
import { reconstitutionData } from '@/data/reconstitution';

type Peptide = (typeof peptides)[number];

const SYRINGE_UNITS_PER_ML = 100; // standard insulin syringe

export default function ReconstitutionScreen() {
  const router = useRouter();
  const [picking, setPicking] = useState(false);
  const [peptide, setPeptide] = useState<Peptide | null>(null);
  const [vialMg, setVialMg] = useState('');
  const [diluentMl, setDiluentMl] = useState('1');
  const [doseMcg, setDoseMcg] = useState('');

  const recon = peptide ? reconstitutionData[peptide.id] : null;

  const concentrationMcgPerMl = useMemo(() => {
    const mg = parseFloat(vialMg);
    const ml = parseFloat(diluentMl);
    if (!isFinite(mg) || !isFinite(ml) || ml <= 0) return null;
    return (mg * 1000) / ml; // mg → mcg
  }, [vialMg, diluentMl]);

  const unitsPerDose = useMemo(() => {
    if (!concentrationMcgPerMl) return null;
    const dose = parseFloat(doseMcg);
    if (!isFinite(dose) || dose <= 0) return null;
    const ml = dose / concentrationMcgPerMl;
    return ml * SYRINGE_UNITS_PER_ML;
  }, [concentrationMcgPerMl, doseMcg]);

  const dosesPerVial = useMemo(() => {
    const mg = parseFloat(vialMg);
    const dose = parseFloat(doseMcg);
    if (!isFinite(mg) || !isFinite(dose) || dose <= 0) return null;
    return Math.floor((mg * 1000) / dose);
  }, [vialMg, doseMcg]);

  const handlePickPeptide = (p: Peptide) => {
    setPeptide(p);
    const info = reconstitutionData[p.id];
    if (info) {
      setVialMg(String(info.commonVialSizes[0]));
      setDoseMcg(String(info.typicalDoseMcg));
    }
    setPicking(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        <Pressable onPress={() => router.back()} className="-ml-2 mb-3 flex-row items-center gap-1 active:opacity-60">
          <Ionicons name="chevron-back" size={20} color="#a3a3a3" />
          <Text className="text-sm text-text-secondary">Back</Text>
        </Pressable>

        <View className="mb-5">
          <Text className="text-xs uppercase tracking-widest text-text-secondary">Tools</Text>
          <Text className="mt-1 text-3xl font-bold text-foreground">Reconstitution</Text>
          <Text className="mt-2 text-sm leading-relaxed text-text-secondary">
            Mix a vial. Calculate concentration and how many units to draw on a U-100 insulin
            syringe.
          </Text>
        </View>

        <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-secondary">
          Peptide
        </Text>
        <Pressable onPress={() => setPicking(true)} className="active:opacity-70">
          <GlassCard className="mb-5 p-4">
            {peptide ? (
              <View className="flex-row items-center gap-3">
                <View className="h-9 w-9 items-center justify-center rounded-lg bg-neon-cyan/15">
                  <Ionicons name="flask" size={16} color="#06b6d4" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">{peptide.name}</Text>
                  {recon && (
                    <Text className="mt-0.5 text-[11px] text-text-secondary">
                      Common vial sizes: {recon.commonVialSizes.join(', ')} mg · stored at{' '}
                      {recon.storageTempCelsius}°C
                    </Text>
                  )}
                </View>
                <Ionicons name="swap-horizontal-outline" size={16} color="#737373" />
              </View>
            ) : (
              <View className="flex-row items-center gap-3">
                <View className="h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06]">
                  <Ionicons name="add" size={16} color="#a3a3a3" />
                </View>
                <Text className="flex-1 text-sm text-text-secondary">Select a peptide (optional)</Text>
                <Ionicons name="chevron-forward" size={14} color="#737373" />
              </View>
            )}
          </GlassCard>
        </Pressable>

        <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-secondary">
          Vial &amp; diluent
        </Text>
        <GlassCard className="mb-5 p-4">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <NumField
                label="Vial size"
                value={vialMg}
                onChange={setVialMg}
                suffix="mg"
                placeholder="e.g. 5"
              />
            </View>
            <View className="flex-1">
              <NumField
                label="Diluent (BAC water)"
                value={diluentMl}
                onChange={setDiluentMl}
                suffix="mL"
                placeholder="e.g. 2"
              />
            </View>
          </View>
          {recon && (
            <View className="mt-3 flex-row flex-wrap" style={{ gap: 4 }}>
              {recon.commonVialSizes.map((size) => (
                <Pressable key={size} onPress={() => setVialMg(String(size))} className="active:opacity-70">
                  <View
                    className="rounded-full px-2.5 py-1 border"
                    style={{
                      backgroundColor:
                        vialMg === String(size) ? 'rgba(6,182,212,0.18)' : 'rgba(255,255,255,0.04)',
                      borderColor:
                        vialMg === String(size) ? 'rgba(6,182,212,0.45)' : 'rgba(255,255,255,0.1)',
                    }}
                  >
                    <Text
                      className="text-[11px] font-medium"
                      style={{ color: vialMg === String(size) ? '#06b6d4' : '#a3a3a3' }}
                    >
                      {size} mg
                    </Text>
                  </View>
                </Pressable>
              ))}
              <View className="flex-row" style={{ gap: 4 }}>
                {[1, 2, 3].map((ml) => (
                  <Pressable key={ml} onPress={() => setDiluentMl(String(ml))} className="active:opacity-70">
                    <View
                      className="rounded-full px-2.5 py-1 border"
                      style={{
                        backgroundColor:
                          diluentMl === String(ml) ? 'rgba(168,85,247,0.18)' : 'rgba(255,255,255,0.04)',
                        borderColor:
                          diluentMl === String(ml) ? 'rgba(168,85,247,0.45)' : 'rgba(255,255,255,0.1)',
                      }}
                    >
                      <Text
                        className="text-[11px] font-medium"
                        style={{ color: diluentMl === String(ml) ? '#a855f7' : '#a3a3a3' }}
                      >
                        {ml} mL
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </GlassCard>

        <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-secondary">
          Target dose
        </Text>
        <GlassCard className="mb-5 p-4">
          <NumField label="Per injection" value={doseMcg} onChange={setDoseMcg} suffix="mcg" placeholder="e.g. 250" />
        </GlassCard>

        <GlassCard className="mb-5 p-5" bright>
          <Text className="text-xs uppercase tracking-widest text-text-secondary">Result</Text>
          <View className="mt-3 gap-3">
            <ResultRow
              icon="beaker-outline"
              label="Concentration"
              value={
                concentrationMcgPerMl ? `${formatNum(concentrationMcgPerMl)} mcg/mL` : '—'
              }
              accent="#06b6d4"
            />
            <View className="h-px bg-white/5" />
            <ResultRow
              icon="medical-outline"
              label="Draw"
              value={unitsPerDose ? `${formatNum(unitsPerDose, 1)} units` : '—'}
              hint="on a U-100 insulin syringe"
              accent="#a855f7"
              big
            />
            <View className="h-px bg-white/5" />
            <ResultRow
              icon="cube-outline"
              label="Doses per vial"
              value={dosesPerVial ? `${dosesPerVial}` : '—'}
              accent="#10b981"
            />
          </View>
        </GlassCard>

        <View className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-3">
          <View className="flex-row items-start gap-2">
            <Ionicons name="warning-outline" size={14} color="#f97316" />
            <Text className="flex-1 text-[11px] leading-relaxed text-text-secondary">
              Calculations are estimates based on standard U-100 syringes. Always verify with a pharmacist
              or licensed clinician before injection.
            </Text>
          </View>
        </View>
      </ScrollView>

      {picking && <PeptidePicker onSelect={handlePickPeptide} onClose={() => setPicking(false)} />}
    </SafeAreaView>
  );
}

function NumField({
  label,
  value,
  onChange,
  suffix,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix: string;
  placeholder?: string;
}) {
  return (
    <View>
      <Text className="mb-1.5 text-[11px] font-medium text-text-secondary">{label}</Text>
      <View className="flex-row items-center rounded-lg border border-white/10 bg-white/[0.04] px-3">
        <TextInput
          value={value}
          onChangeText={onChange}
          keyboardType="decimal-pad"
          placeholder={placeholder}
          placeholderTextColor="#737373"
          className="flex-1 py-2.5 text-sm text-foreground"
        />
        <Text className="text-[11px] text-text-muted">{suffix}</Text>
      </View>
    </View>
  );
}

function ResultRow({
  icon,
  label,
  value,
  hint,
  accent,
  big,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  hint?: string;
  accent: string;
  big?: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center gap-2.5">
        <Ionicons name={icon} size={14} color={accent} />
        <View>
          <Text className="text-[11px] uppercase tracking-wider text-text-secondary">{label}</Text>
          {hint && <Text className="mt-0.5 text-[10px] text-text-muted">{hint}</Text>}
        </View>
      </View>
      <Text
        className={big ? 'text-2xl font-bold' : 'text-base font-semibold'}
        style={{ color: accent }}
      >
        {value}
      </Text>
    </View>
  );
}

function PeptidePicker({
  onSelect,
  onClose,
}: {
  onSelect: (p: Peptide) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const list = peptides.filter((p) => reconstitutionData[p.id]);
  const filtered = query
    ? list.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    : list;
  return (
    <View className="absolute inset-0 bg-black/85">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-row items-center justify-between border-b border-white/5 px-5 py-3">
          <Pressable onPress={onClose} className="active:opacity-60">
            <Text className="text-sm text-text-secondary">Cancel</Text>
          </Pressable>
          <Text className="text-base font-semibold text-foreground">Peptide</Text>
          <View style={{ width: 50 }} />
        </View>
        <View className="border-b border-white/5 px-5 py-3">
          <View className="flex-row items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
            <Ionicons name="search" size={14} color="#737373" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search injectable peptides"
              placeholderTextColor="#737373"
              className="flex-1 text-sm text-foreground"
              autoFocus
              autoCapitalize="none"
            />
          </View>
        </View>
        <ScrollView contentContainerStyle={{ padding: 12 }}>
          {filtered.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => onSelect(p)}
              className="rounded-xl px-3 py-3 active:bg-white/[0.04]"
            >
              <Text className="text-sm font-semibold text-foreground">{p.name}</Text>
              <Text className="mt-0.5 text-[11px] text-text-secondary" numberOfLines={1}>
                {p.fullName}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function formatNum(n: number, decimals = 0): string {
  return n.toLocaleString(undefined, {
    maximumFractionDigits: decimals === 0 && n < 100 ? 1 : decimals,
  });
}
