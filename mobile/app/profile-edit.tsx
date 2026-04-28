/**
 * Profile editor — writes to UserProfile (DynamoDB via Amplify Data). The AI
 * routes call buildUserContext(userId) which reads these fields and injects
 * them into the system prompt, so this is what makes the AI feel personalized.
 *
 * Goals, experience level, sex are chip-style pickers; numeric fields are
 * keyboard inputs; health conditions and allergies are free-text comma-split.
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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
import { fetchUserProfile, upsertUserProfile } from '@/lib/amplify-data';
import { useAuth } from '@/lib/auth-context';

const GOAL_OPTIONS = [
  'Fat loss',
  'Muscle gain',
  'Recovery',
  'Longevity',
  'Cognitive',
  'Sleep',
  'Joint health',
  'Hormonal balance',
  'Skin & hair',
];

const EXPERIENCE_OPTIONS = ['Beginner', 'Intermediate', 'Advanced'];
const SEX_OPTIONS = ['male', 'female', 'other'];

export default function ProfileEditScreen() {
  const router = useRouter();
  const { user, refresh } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [goals, setGoals] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<string | null>(null);
  const [weight, setWeight] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState<string | null>(null);
  const [healthConditions, setHealthConditions] = useState('');
  const [allergies, setAllergies] = useState('');

  useEffect(() => {
    let alive = true;
    fetchUserProfile()
      .then((p) => {
        if (!alive || !p) return;
        setName(p.name ?? '');
        setGoals(p.goals ?? []);
        setExperienceLevel(p.experienceLevel ?? null);
        // The remaining fields aren't on UserProfileRow loose-type yet; cast.
        const raw = p as unknown as Record<string, unknown>;
        if (typeof raw.weight === 'number') setWeight(String(raw.weight));
        if (typeof raw.heightCm === 'number') setHeightCm(String(raw.heightCm));
        if (typeof raw.age === 'number') setAge(String(raw.age));
        if (typeof raw.sex === 'string') setSex(raw.sex as string);
        if (Array.isArray(raw.healthConditions))
          setHealthConditions((raw.healthConditions as string[]).join(', '));
        if (Array.isArray(raw.allergies))
          setAllergies((raw.allergies as string[]).join(', '));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const toggleGoal = (g: string) => {
    setGoals((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  };

  const handleSave = async () => {
    if (!user?.email) {
      setError('Not signed in');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await upsertUserProfile(user.email, {
        name: name.trim() || null,
        goals: goals.length ? goals : null,
        experienceLevel,
        weight: weight ? parseFloat(weight) : null,
        heightCm: heightCm ? parseFloat(heightCm) : null,
        age: age ? parseInt(age, 10) : null,
        sex,
        healthConditions: healthConditions
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean) || null,
        allergies: allergies
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean) || null,
      });
      await refresh();
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#06b6d4" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center justify-between border-b border-white/5 px-5 py-3">
        <Pressable onPress={() => router.back()} className="active:opacity-60">
          <Text className="text-sm text-text-secondary">Cancel</Text>
        </Pressable>
        <Text className="text-base font-semibold text-foreground">Profile</Text>
        <Pressable onPress={handleSave} disabled={saving} className={`active:opacity-60 ${saving ? 'opacity-40' : ''}`}>
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

          <Text className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-secondary">
            About you
          </Text>
          <GlassCard className="mb-5 p-4">
            <Field label="Display name">
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Your name (optional)"
                placeholderTextColor="#737373"
                className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-foreground"
              />
            </Field>

            <View className="mt-3">
              <Text className="mb-2 text-[11px] font-medium text-text-secondary">Sex</Text>
              <ChipRow options={SEX_OPTIONS} selected={sex} onSelect={setSex} accent="#a855f7" />
            </View>

            <View className="mt-3 flex-row gap-2">
              <View className="flex-1">
                <NumField label="Age" value={age} onChange={setAge} suffix="yrs" />
              </View>
              <View className="flex-1">
                <NumField label="Height" value={heightCm} onChange={setHeightCm} suffix="cm" />
              </View>
              <View className="flex-1">
                <NumField label="Weight" value={weight} onChange={setWeight} suffix="kg" />
              </View>
            </View>
          </GlassCard>

          <Text className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-secondary">
            Goals
          </Text>
          <GlassCard className="mb-5 p-4">
            <View className="-m-1 flex-row flex-wrap">
              {GOAL_OPTIONS.map((g) => {
                const active = goals.includes(g);
                return (
                  <Pressable key={g} onPress={() => toggleGoal(g)} className="m-1 active:opacity-70">
                    <View
                      className="rounded-full border px-3 py-1.5"
                      style={{
                        backgroundColor: active ? 'rgba(6,182,212,0.20)' : 'rgba(255,255,255,0.03)',
                        borderColor: active ? 'rgba(6,182,212,0.45)' : 'rgba(255,255,255,0.1)',
                      }}
                    >
                      <Text
                        className="text-xs font-medium"
                        style={{ color: active ? '#06b6d4' : '#a3a3a3' }}
                      >
                        {g}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </GlassCard>

          <Text className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-secondary">
            Experience
          </Text>
          <GlassCard className="mb-5 p-4">
            <ChipRow
              options={EXPERIENCE_OPTIONS}
              selected={experienceLevel}
              onSelect={setExperienceLevel}
              accent="#10b981"
            />
          </GlassCard>

          <Text className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-secondary">
            Health
          </Text>
          <GlassCard className="mb-5 p-4">
            <Field label="Conditions">
              <TextInput
                value={healthConditions}
                onChangeText={setHealthConditions}
                placeholder="e.g. hypertension, hypothyroidism"
                placeholderTextColor="#737373"
                className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-foreground"
              />
              <Text className="mt-1 text-[10px] text-text-muted">Comma-separated.</Text>
            </Field>
            <View className="mt-3">
              <Field label="Allergies">
                <TextInput
                  value={allergies}
                  onChangeText={setAllergies}
                  placeholder="e.g. penicillin, shellfish"
                  placeholderTextColor="#737373"
                  className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-foreground"
                />
              </Field>
            </View>
          </GlassCard>

          <View className="mb-2 flex-row items-start gap-2 rounded-xl border border-neon-cyan/20 bg-neon-cyan/5 p-3">
            <Ionicons name="information-circle-outline" size={14} color="#06b6d4" />
            <Text className="flex-1 text-[11px] leading-relaxed text-text-secondary">
              Atlas AI uses your goals, experience, and health context to personalize replies.
              Nothing here is shared.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View>
      <Text className="mb-1.5 text-[11px] font-medium text-text-secondary">{label}</Text>
      {children}
    </View>
  );
}

function NumField({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix: string;
}) {
  return (
    <View>
      <Text className="mb-1.5 text-[11px] font-medium text-text-secondary">{label}</Text>
      <View className="flex-row items-center rounded-lg border border-white/10 bg-white/[0.04] px-3">
        <TextInput
          value={value}
          onChangeText={onChange}
          keyboardType="decimal-pad"
          placeholder="—"
          placeholderTextColor="#737373"
          className="flex-1 py-2.5 text-sm text-foreground"
        />
        <Text className="text-[11px] text-text-muted">{suffix}</Text>
      </View>
    </View>
  );
}

function ChipRow({
  options,
  selected,
  onSelect,
  accent,
}: {
  options: string[];
  selected: string | null;
  onSelect: (v: string) => void;
  accent: string;
}) {
  return (
    <View className="-m-1 flex-row flex-wrap">
      {options.map((o) => {
        const active = selected === o;
        return (
          <Pressable key={o} onPress={() => onSelect(o)} className="m-1 active:opacity-70">
            <View
              className="rounded-full border px-3 py-1.5"
              style={{
                backgroundColor: active ? `${accent}26` : 'rgba(255,255,255,0.03)',
                borderColor: active ? `${accent}66` : 'rgba(255,255,255,0.1)',
              }}
            >
              <Text className="text-xs font-medium" style={{ color: active ? accent : '#a3a3a3' }}>
                {o}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
