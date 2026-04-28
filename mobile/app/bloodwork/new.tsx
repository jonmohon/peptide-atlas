/**
 * New bloodwork panel — manual marker entry. Add markers row-by-row with name,
 * value, unit, and reference range. Future iterations will use Claude vision to
 * OCR a lab report photo, but for the prototype this gets data into BloodworkPanel
 * end-to-end so the trend tooling can be built around it.
 */

import { Ionicons } from '@expo/vector-icons';
import { fetch as expoFetch } from 'expo/fetch';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/glass-card';
import {
  createBloodworkPanel,
  type BloodworkMarker,
} from '@/lib/amplify-data';
import { getIdToken } from '@/lib/amplify';
import { API_BASE_URL } from '@/lib/config';

type DraftMarker = {
  name: string;
  value: string;
  unit: string;
  refLow: string;
  refHigh: string;
};

const COMMON_MARKERS = [
  { name: 'Testosterone (Total)', unit: 'ng/dL', refLow: '300', refHigh: '1000' },
  { name: 'Testosterone (Free)', unit: 'pg/mL', refLow: '6.6', refHigh: '20' },
  { name: 'Estradiol (E2)', unit: 'pg/mL', refLow: '20', refHigh: '50' },
  { name: 'IGF-1', unit: 'ng/mL', refLow: '94', refHigh: '252' },
  { name: 'TSH', unit: 'mIU/L', refLow: '0.5', refHigh: '5' },
  { name: 'HbA1c', unit: '%', refLow: '4.0', refHigh: '5.6' },
  { name: 'LDL Cholesterol', unit: 'mg/dL', refLow: '0', refHigh: '100' },
  { name: 'HDL Cholesterol', unit: 'mg/dL', refLow: '40', refHigh: '60' },
  { name: 'Triglycerides', unit: 'mg/dL', refLow: '0', refHigh: '150' },
  { name: 'Hematocrit', unit: '%', refLow: '40', refHigh: '54' },
];

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function NewBloodworkScreen() {
  const router = useRouter();
  const [date, setDate] = useState(todayIso());
  const [labName, setLabName] = useState('');
  const [notes, setNotes] = useState('');
  const [markers, setMarkers] = useState<DraftMarker[]>([
    { name: '', value: '', unit: '', refLow: '', refHigh: '' },
  ]);
  const [picking, setPicking] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parseWarning, setParseWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addRow = () =>
    setMarkers((prev) => [...prev, { name: '', value: '', unit: '', refLow: '', refHigh: '' }]);

  const removeRow = (i: number) =>
    setMarkers((prev) => prev.filter((_, idx) => idx !== i));

  const updateRow = (i: number, patch: Partial<DraftMarker>) =>
    setMarkers((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const applyTemplate = (i: number, t: (typeof COMMON_MARKERS)[number]) => {
    updateRow(i, { name: t.name, unit: t.unit, refLow: t.refLow, refHigh: t.refHigh });
    setPicking(null);
  };

  const pickPhoto = async () => {
    setError(null);
    setParseWarning(null);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError('Photo library access denied');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      base64: true,
      quality: 0.7,
    });
    if (result.canceled || !result.assets?.[0]?.base64) return;
    await parseImage(result.assets[0].base64, result.assets[0].mimeType ?? 'image/jpeg');
  };

  const takePhoto = async () => {
    setError(null);
    setParseWarning(null);
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      setError('Camera access denied');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      base64: true,
      quality: 0.7,
    });
    if (result.canceled || !result.assets?.[0]?.base64) return;
    await parseImage(result.assets[0].base64, result.assets[0].mimeType ?? 'image/jpeg');
  };

  const parseImage = async (base64: string, mediaType: string) => {
    setParsing(true);
    setError(null);
    try {
      const token = await getIdToken();
      if (!token) throw new Error('Sign in required');
      const res = await expoFetch(`${API_BASE_URL}/api/ai/parse-bloodwork`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fileBase64: base64, mediaType }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`HTTP ${res.status}: ${t.slice(0, 200)}`);
      }
      const json = (await res.json()) as {
        markers?: Array<{
          name: string;
          value: number;
          unit?: string;
          referenceRange?: string;
        }>;
        collectionDate?: string | null;
        warnings?: string[];
      };

      if (json.collectionDate) setDate(json.collectionDate);
      if (json.markers && json.markers.length > 0) {
        const draft = json.markers.map((m) => {
          const [lo, hi] = parseRange(m.referenceRange);
          return {
            name: m.name,
            value: String(m.value),
            unit: m.unit ?? '',
            refLow: lo ?? '',
            refHigh: hi ?? '',
          };
        });
        setMarkers(draft);
      }
      if (json.warnings && json.warnings.length > 0) {
        setParseWarning(json.warnings.join(' · '));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Parse failed');
    } finally {
      setParsing(false);
    }
  };

  const handleSave = async () => {
    const valid: BloodworkMarker[] = markers
      .filter((m) => m.name.trim() && m.value.trim() && !isNaN(parseFloat(m.value)))
      .map((m) => ({
        name: m.name.trim(),
        value: parseFloat(m.value),
        unit: m.unit.trim() || '',
        refLow: m.refLow ? parseFloat(m.refLow) : undefined,
        refHigh: m.refHigh ? parseFloat(m.refHigh) : undefined,
      }));
    if (valid.length === 0) {
      setError('Add at least one marker with a numeric value.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createBloodworkPanel({
        date,
        labName: labName.trim() || undefined,
        markers: valid,
        notes: notes.trim() || undefined,
      });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center justify-between border-b border-white/5 px-5 py-3">
        <Pressable onPress={() => router.back()} className="active:opacity-60">
          <Text className="text-sm text-text-secondary">Cancel</Text>
        </Pressable>
        <Text className="text-base font-semibold text-foreground">New panel</Text>
        <Pressable
          onPress={handleSave}
          disabled={saving}
          className={`active:opacity-60 ${saving ? 'opacity-40' : ''}`}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#06b6d4" />
          ) : (
            <Text className="text-sm font-semibold text-neon-cyan">Save</Text>
          )}
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
          {error && (
            <View className="mb-4 rounded-xl border border-red-500/25 bg-red-500/10 p-3">
              <Text className="text-xs text-red-400">{error}</Text>
            </View>
          )}

          <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-secondary">
            Quick add (Pro+)
          </Text>
          <View className="mb-5 flex-row gap-3">
            <Pressable onPress={takePhoto} disabled={parsing} className="flex-1 active:opacity-70">
              <GlassCard className="items-center p-4">
                <View className="h-9 w-9 items-center justify-center rounded-lg bg-neon-purple/15">
                  <Ionicons name="camera-outline" size={18} color="#a855f7" />
                </View>
                <Text className="mt-2 text-xs font-semibold text-foreground">Take photo</Text>
                <Text className="mt-0.5 text-[10px] text-text-secondary">Lab report</Text>
              </GlassCard>
            </Pressable>
            <Pressable onPress={pickPhoto} disabled={parsing} className="flex-1 active:opacity-70">
              <GlassCard className="items-center p-4">
                <View className="h-9 w-9 items-center justify-center rounded-lg bg-neon-cyan/15">
                  <Ionicons name="image-outline" size={18} color="#06b6d4" />
                </View>
                <Text className="mt-2 text-xs font-semibold text-foreground">Pick from library</Text>
                <Text className="mt-0.5 text-[10px] text-text-secondary">Photo or PDF</Text>
              </GlassCard>
            </Pressable>
          </View>
          {parsing && (
            <View className="mb-5 flex-row items-center gap-2 rounded-xl border border-neon-purple/30 bg-neon-purple/10 p-3">
              <ActivityIndicator size="small" color="#a855f7" />
              <Text className="flex-1 text-xs text-text-secondary">
                Reading the lab report with Atlas AI…
              </Text>
            </View>
          )}
          {parseWarning && (
            <View className="mb-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
              <View className="flex-row items-start gap-2">
                <Ionicons name="warning-outline" size={14} color="#f59e0b" />
                <Text className="flex-1 text-[11px] leading-relaxed text-amber-200">
                  {parseWarning}
                </Text>
              </View>
            </View>
          )}

          <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-secondary">
            Date &amp; lab
          </Text>
          <GlassCard className="mb-5 p-4">
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="mb-1.5 text-[11px] font-medium text-text-secondary">Date</Text>
                <TextInput
                  value={date}
                  onChangeText={setDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#737373"
                  autoCapitalize="none"
                  className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-foreground"
                />
              </View>
              <View className="flex-1">
                <Text className="mb-1.5 text-[11px] font-medium text-text-secondary">Lab (optional)</Text>
                <TextInput
                  value={labName}
                  onChangeText={setLabName}
                  placeholder="Quest, LabCorp, …"
                  placeholderTextColor="#737373"
                  className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-foreground"
                />
              </View>
            </View>
          </GlassCard>

          <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-secondary">
            Markers
          </Text>
          <View className="mb-3 gap-3">
            {markers.map((m, i) => (
              <GlassCard key={i} className="p-3">
                <View className="flex-row items-center gap-2">
                  <TextInput
                    value={m.name}
                    onChangeText={(v) => updateRow(i, { name: v })}
                    placeholder="Marker name"
                    placeholderTextColor="#737373"
                    className="flex-1 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-foreground"
                  />
                  <Pressable onPress={() => setPicking(i)} className="active:opacity-60">
                    <View className="h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06]">
                      <Ionicons name="list-outline" size={14} color="#a3a3a3" />
                    </View>
                  </Pressable>
                  {markers.length > 1 && (
                    <Pressable onPress={() => removeRow(i)} className="active:opacity-60">
                      <View className="h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06]">
                        <Ionicons name="close" size={14} color="#737373" />
                      </View>
                    </Pressable>
                  )}
                </View>
                <View className="mt-2 flex-row gap-2">
                  <TextInput
                    value={m.value}
                    onChangeText={(v) => updateRow(i, { value: v })}
                    placeholder="Value"
                    placeholderTextColor="#737373"
                    keyboardType="decimal-pad"
                    className="flex-1 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-foreground"
                  />
                  <TextInput
                    value={m.unit}
                    onChangeText={(v) => updateRow(i, { unit: v })}
                    placeholder="Unit"
                    placeholderTextColor="#737373"
                    autoCapitalize="none"
                    className="flex-1 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-foreground"
                  />
                </View>
                <View className="mt-2 flex-row gap-2">
                  <TextInput
                    value={m.refLow}
                    onChangeText={(v) => updateRow(i, { refLow: v })}
                    placeholder="Ref low"
                    placeholderTextColor="#737373"
                    keyboardType="decimal-pad"
                    className="flex-1 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-foreground"
                  />
                  <TextInput
                    value={m.refHigh}
                    onChangeText={(v) => updateRow(i, { refHigh: v })}
                    placeholder="Ref high"
                    placeholderTextColor="#737373"
                    keyboardType="decimal-pad"
                    className="flex-1 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-foreground"
                  />
                </View>
              </GlassCard>
            ))}
          </View>

          <Pressable onPress={addRow} className="mb-5 active:opacity-70">
            <View className="flex-row items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 px-4 py-3">
              <Ionicons name="add" size={14} color="#06b6d4" />
              <Text className="text-xs font-semibold text-neon-cyan">Add another marker</Text>
            </View>
          </Pressable>

          <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-secondary">
            Notes
          </Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Context, fasting state, what you were on at the time…"
            placeholderTextColor="#737373"
            multiline
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-foreground"
            style={{ minHeight: 80, textAlignVertical: 'top' }}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {picking !== null && (
        <View className="absolute inset-0 bg-black/85">
          <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
            <View className="flex-row items-center justify-between border-b border-white/5 px-5 py-3">
              <Pressable onPress={() => setPicking(null)} className="active:opacity-60">
                <Text className="text-sm text-text-secondary">Cancel</Text>
              </Pressable>
              <Text className="text-base font-semibold text-foreground">Common markers</Text>
              <View style={{ width: 50 }} />
            </View>
            <ScrollView contentContainerStyle={{ padding: 12 }}>
              {COMMON_MARKERS.map((t) => (
                <Pressable
                  key={t.name}
                  onPress={() => applyTemplate(picking, t)}
                  className="rounded-xl px-3 py-3 active:bg-white/[0.04]"
                >
                  <Text className="text-sm font-semibold text-foreground">{t.name}</Text>
                  <Text className="mt-0.5 text-[11px] text-text-secondary">
                    {t.unit} · ref {t.refLow}–{t.refHigh}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </SafeAreaView>
        </View>
      )}
    </SafeAreaView>
  );
}

/**
 * Parse a "low-high" or "<high" or ">low" reference range string into [low, high].
 */
function parseRange(s?: string): [string | undefined, string | undefined] {
  if (!s) return [undefined, undefined];
  const cleaned = s.replace(/[^\d.\-<>]/g, '').trim();
  // "lo-hi"
  const dash = cleaned.match(/^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)$/);
  if (dash) return [dash[1], dash[2]];
  // "<hi"
  const lt = cleaned.match(/^<(\d+(?:\.\d+)?)$/);
  if (lt) return ['0', lt[1]];
  // ">lo"
  const gt = cleaned.match(/^>(\d+(?:\.\d+)?)$/);
  if (gt) return [gt[1], undefined];
  return [undefined, undefined];
}
