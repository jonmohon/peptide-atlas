/**
 * Log a daily journal entry. Sheet-style modal: peptide doses, energy/mood/sleep
 * sliders, free-text notes. Saves to JournalEntry via Amplify Data — owner auth
 * scopes the row to the signed-in Cognito user.
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AtlasButton } from '@/components/atlas-button';
import { GlassCard } from '@/components/glass-card';
import { peptides } from '@/data/peptides';
import { createJournalEntry, type DoseInput } from '@/lib/amplify-data';

const ROUTE_OPTIONS = ['SC', 'IM', 'oral', 'nasal'] as const;
type Route = (typeof ROUTE_OPTIONS)[number];

type DraftDose = {
  peptideId: string;
  peptideName: string;
  amount: string;
  route: Route;
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function LogEntryScreen() {
  const router = useRouter();
  const [date] = useState(todayIso());
  const [doses, setDoses] = useState<DraftDose[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState('');
  const [energy, setEnergy] = useState<number | null>(null);
  const [mood, setMood] = useState<number | null>(null);
  const [sleepHours, setSleepHours] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredPeptides = pickerQuery
    ? peptides.filter((p) => p.name.toLowerCase().includes(pickerQuery.toLowerCase()))
    : peptides;

  function addPeptide(peptideId: string, peptideName: string) {
    setDoses((prev) => [
      ...prev,
      { peptideId, peptideName, amount: '', route: 'SC' as Route },
    ]);
    setPickerOpen(false);
    setPickerQuery('');
  }

  function updateDose(i: number, patch: Partial<DraftDose>) {
    setDoses((prev) => prev.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
  }

  function removeDose(i: number) {
    setDoses((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      const dosesPayload: DoseInput[] = doses
        .filter((d) => d.amount.trim())
        .map((d) => ({
          peptideId: d.peptideId,
          peptideName: d.peptideName,
          amount: d.amount.trim(),
          route: d.route,
        }));

      await createJournalEntry({
        date,
        peptideDoses: dosesPayload,
        energy: energy ?? undefined,
        mood: mood ?? undefined,
        sleepHours: sleepHours ? parseFloat(sleepHours) : undefined,
        subjectiveNotes: notes.trim() || undefined,
      });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save entry');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center justify-between border-b border-white/5 px-5 py-3">
        <Pressable onPress={() => router.back()} className="active:opacity-60">
          <Text className="text-sm text-text-secondary">Cancel</Text>
        </Pressable>
        <Text className="text-base font-semibold text-foreground">Log entry</Text>
        <Pressable
          onPress={handleSave}
          disabled={saving || doses.length === 0}
          className={`active:opacity-60 ${saving || doses.length === 0 ? 'opacity-40' : ''}`}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#06b6d4" />
          ) : (
            <Text className="text-sm font-semibold text-neon-cyan">Save</Text>
          )}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        {error && (
          <View className="mb-4 rounded-xl border border-red-500/25 bg-red-500/10 p-3">
            <Text className="text-xs text-red-400">{error}</Text>
          </View>
        )}

        <Text className="mb-2 text-xs uppercase tracking-widest text-text-secondary">Date</Text>
        <GlassCard className="mb-5 p-4">
          <Text className="text-sm font-medium text-foreground">{formatDate(date)}</Text>
        </GlassCard>

        <Text className="mb-2 text-xs uppercase tracking-widest text-text-secondary">
          Peptide doses
        </Text>

        {doses.length === 0 && !pickerOpen && (
          <GlassCard className="mb-3 p-4">
            <Text className="text-xs text-text-secondary">No doses yet — add one below.</Text>
          </GlassCard>
        )}

        <View className="mb-3 gap-2.5">
          {doses.map((d, i) => (
            <GlassCard key={`${d.peptideId}-${i}`} className="p-3">
              <View className="flex-row items-center gap-2">
                <Text className="flex-1 text-sm font-semibold text-foreground">{d.peptideName}</Text>
                <Pressable onPress={() => removeDose(i)} className="active:opacity-60">
                  <Ionicons name="close-circle" size={18} color="#737373" />
                </Pressable>
              </View>
              <View className="mt-2 flex-row gap-2">
                <TextInput
                  value={d.amount}
                  onChangeText={(v) => updateDose(i, { amount: v })}
                  placeholder="Dose (e.g. 250mcg)"
                  placeholderTextColor="#737373"
                  className="flex-1 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-foreground"
                  autoCapitalize="none"
                />
                <View className="flex-row" style={{ gap: 4 }}>
                  {ROUTE_OPTIONS.map((r) => {
                    const active = d.route === r;
                    return (
                      <Pressable
                        key={r}
                        onPress={() => updateDose(i, { route: r })}
                        className="active:opacity-70"
                      >
                        <View
                          className="rounded-md border px-2 py-2"
                          style={{
                            backgroundColor: active ? 'rgba(6,182,212,0.18)' : 'rgba(255,255,255,0.04)',
                            borderColor: active ? 'rgba(6,182,212,0.45)' : 'rgba(255,255,255,0.1)',
                          }}
                        >
                          <Text
                            className="text-[10px] font-semibold"
                            style={{ color: active ? '#06b6d4' : '#a3a3a3' }}
                          >
                            {r}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </GlassCard>
          ))}
        </View>

        {pickerOpen ? (
          <GlassCard className="mb-5 p-3">
            <View className="mb-2 flex-row items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">
              <Ionicons name="search" size={14} color="#737373" />
              <TextInput
                value={pickerQuery}
                onChangeText={setPickerQuery}
                placeholder="Search peptides"
                placeholderTextColor="#737373"
                className="flex-1 text-xs text-foreground"
                autoCapitalize="none"
                autoFocus
              />
              <Pressable onPress={() => setPickerOpen(false)} className="active:opacity-60">
                <Ionicons name="close" size={14} color="#737373" />
              </Pressable>
            </View>
            <ScrollView style={{ maxHeight: 240 }} keyboardShouldPersistTaps="handled">
              {filteredPeptides.slice(0, 30).map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() => addPeptide(p.id, p.name)}
                  className="rounded-md py-2.5 active:bg-white/[0.04]"
                >
                  <Text className="px-2 text-sm text-foreground">{p.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </GlassCard>
        ) : (
          <Pressable onPress={() => setPickerOpen(true)} className="mb-5 active:opacity-70">
            <View className="flex-row items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 px-4 py-3.5">
              <Ionicons name="add" size={16} color="#06b6d4" />
              <Text className="text-sm font-medium text-neon-cyan">Add peptide</Text>
            </View>
          </Pressable>
        )}

        <Text className="mb-2 text-xs uppercase tracking-widest text-text-secondary">How you feel</Text>
        <GlassCard className="mb-5 p-4">
          <Slider10 label="Energy" value={energy} onChange={setEnergy} accent="#06b6d4" />
          <View className="my-3 h-px bg-white/5" />
          <Slider10 label="Mood" value={mood} onChange={setMood} accent="#10b981" />
          <View className="my-3 h-px bg-white/5" />
          <View>
            <Text className="mb-1.5 text-xs font-medium text-text-secondary">Sleep (hours)</Text>
            <TextInput
              value={sleepHours}
              onChangeText={setSleepHours}
              keyboardType="decimal-pad"
              placeholder="7.5"
              placeholderTextColor="#737373"
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-foreground"
            />
          </View>
        </GlassCard>

        <Text className="mb-2 text-xs uppercase tracking-widest text-text-secondary">Notes</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Any side effects, observations, or context"
          placeholderTextColor="#737373"
          multiline
          numberOfLines={4}
          className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-foreground"
          style={{ minHeight: 100, textAlignVertical: 'top' }}
        />

        <View className="mt-6">
          <AtlasButton
            label={saving ? 'Saving…' : 'Save entry'}
            loading={saving}
            disabled={doses.length === 0}
            onPress={handleSave}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Slider10({
  label,
  value,
  onChange,
  accent,
}: {
  label: string;
  value: number | null;
  onChange: (v: number) => void;
  accent: string;
}) {
  return (
    <View>
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-xs font-medium text-text-secondary">{label}</Text>
        <Text className="text-xs font-semibold" style={{ color: accent }}>
          {value ?? '–'}
          <Text className="text-[10px] text-text-muted">/10</Text>
        </Text>
      </View>
      <View className="flex-row gap-1.5">
        {Array.from({ length: 10 }).map((_, i) => {
          const n = i + 1;
          const active = value !== null && n <= value;
          return (
            <Pressable
              key={n}
              onPress={() => onChange(n)}
              className="flex-1 active:opacity-60"
              hitSlop={{ top: 8, bottom: 8 }}
            >
              <View
                className="h-2 rounded-full"
                style={{
                  backgroundColor: active ? accent : 'rgba(255,255,255,0.08)',
                }}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function formatDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
