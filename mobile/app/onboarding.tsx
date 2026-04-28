/**
 * 3-step onboarding shown after sign-up confirmation. Walks users through
 * goals + experience + welcome message, then writes them to UserProfile so
 * Atlas AI can personalize from the very first interaction.
 *
 * Skippable from any step — the dashboard's "Personalize Atlas AI" nudge
 * still appears if the user skips.
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/glass-card';
import { upsertUserProfile } from '@/lib/amplify-data';
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

const EXPERIENCE_OPTIONS = [
  { id: 'Beginner', label: 'Beginner', desc: 'New to peptides; want to learn safely.' },
  { id: 'Intermediate', label: 'Intermediate', desc: 'Run protocols; comfortable with dosing.' },
  { id: 'Advanced', label: 'Advanced', desc: 'Deep experience; want depth and edge cases.' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { user, refresh } = useAuth();
  const [step, setStep] = useState(0);
  const [goals, setGoals] = useState<string[]>([]);
  const [experience, setExperience] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const finish = async (skip = false) => {
    if (!user?.email) {
      router.replace('/(tabs)');
      return;
    }
    setSaving(true);
    try {
      if (!skip && (goals.length || experience)) {
        await upsertUserProfile(user.email, {
          goals: goals.length ? goals : null,
          experienceLevel: experience,
        });
        await refresh();
      }
      router.replace('/(tabs)');
    } catch {
      router.replace('/(tabs)');
    } finally {
      setSaving(false);
    }
  };

  const toggleGoal = (g: string) => {
    setGoals((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <LinearGradient
        colors={['rgba(168,85,247,0.12)', 'transparent', 'rgba(6,182,212,0.08)']}
        locations={[0, 0.5, 1]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <View className="flex-row items-center justify-between px-5 py-3">
          <View className="flex-row gap-1.5">
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                className="h-1 w-10 rounded-full"
                style={{
                  backgroundColor: i <= step ? '#06b6d4' : 'rgba(255,255,255,0.1)',
                }}
              />
            ))}
          </View>
          <Pressable onPress={() => finish(true)} disabled={saving} className="active:opacity-60">
            <Text className="text-sm text-text-secondary">Skip</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
          {step === 0 && (
            <View className="flex-1 justify-center">
              <View className="mb-6 items-center">
                <View className="h-20 w-20 items-center justify-center rounded-3xl bg-neon-cyan/15 border border-neon-cyan/30">
                  <Ionicons name="flask" size={36} color="#06b6d4" />
                </View>
              </View>
              <Text className="text-center text-3xl font-bold text-foreground">Welcome to Peptide Atlas</Text>
              <Text className="mt-3 text-center text-sm leading-relaxed text-text-secondary">
                Track your protocols, log doses, run AI analysis on your stack, and interpret bloodwork — all in one
                place.
              </Text>
              <View className="mt-8 gap-3">
                <Bullet icon="library-outline" color="#06b6d4">
                  80+ peptides with dosing, evidence, and side-effect data
                </Bullet>
                <Bullet icon="sparkles-outline" color="#a855f7">
                  AI personalized to your goals + journal data
                </Bullet>
                <Bullet icon="lock-closed-outline" color="#10b981">
                  Your data stays yours — owner-scoped on AWS
                </Bullet>
              </View>
            </View>
          )}

          {step === 1 && (
            <View>
              <Text className="text-xs uppercase tracking-widest text-neon-cyan">Step 2 of 3</Text>
              <Text className="mt-1 text-3xl font-bold text-foreground">Your goals</Text>
              <Text className="mt-2 text-sm leading-relaxed text-text-secondary">
                Pick any that apply. Atlas AI uses these to tailor responses.
              </Text>
              <View className="mt-6 -m-1 flex-row flex-wrap">
                {GOAL_OPTIONS.map((g) => {
                  const active = goals.includes(g);
                  return (
                    <Pressable key={g} onPress={() => toggleGoal(g)} className="m-1 active:opacity-70">
                      <View
                        className="rounded-full border px-4 py-2"
                        style={{
                          backgroundColor: active ? 'rgba(6,182,212,0.20)' : 'rgba(255,255,255,0.04)',
                          borderColor: active ? 'rgba(6,182,212,0.45)' : 'rgba(255,255,255,0.1)',
                        }}
                      >
                        <Text
                          className="text-sm font-medium"
                          style={{ color: active ? '#06b6d4' : '#a3a3a3' }}
                        >
                          {g}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {step === 2 && (
            <View>
              <Text className="text-xs uppercase tracking-widest text-neon-cyan">Step 3 of 3</Text>
              <Text className="mt-1 text-3xl font-bold text-foreground">Your experience</Text>
              <Text className="mt-2 text-sm leading-relaxed text-text-secondary">
                We&apos;ll match the depth of explanations to where you are.
              </Text>
              <View className="mt-6 gap-3">
                {EXPERIENCE_OPTIONS.map((e) => {
                  const active = e.id === experience;
                  return (
                    <Pressable key={e.id} onPress={() => setExperience(e.id)} className="active:opacity-70">
                      <GlassCard
                        className="p-4"
                        bright={active}
                      >
                        <View className="flex-row items-center gap-3">
                          <View
                            className="h-5 w-5 items-center justify-center rounded-full border"
                            style={{
                              borderColor: active ? '#06b6d4' : 'rgba(255,255,255,0.2)',
                              backgroundColor: active ? 'rgba(6,182,212,0.20)' : 'transparent',
                            }}
                          >
                            {active && (
                              <View
                                style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: 4,
                                  backgroundColor: '#06b6d4',
                                }}
                              />
                            )}
                          </View>
                          <View className="flex-1">
                            <Text className="text-sm font-semibold text-foreground">{e.label}</Text>
                            <Text className="mt-0.5 text-[11px] text-text-secondary">{e.desc}</Text>
                          </View>
                        </View>
                      </GlassCard>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}
        </ScrollView>

        <View className="border-t border-white/5 px-5 py-4">
          <View className="flex-row gap-3">
            {step > 0 && (
              <Pressable onPress={() => setStep((s) => s - 1)} className="active:opacity-70">
                <View className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5">
                  <Ionicons name="chevron-back" size={18} color="#a3a3a3" />
                </View>
              </Pressable>
            )}
            <Pressable
              onPress={() => {
                if (step === 2) finish();
                else setStep((s) => s + 1);
              }}
              disabled={saving || (step === 1 && goals.length === 0) || (step === 2 && !experience)}
              className={`flex-1 active:opacity-70 ${
                (step === 1 && goals.length === 0) || (step === 2 && !experience) ? 'opacity-40' : ''
              }`}
            >
              <View className="flex-row items-center justify-center gap-2 rounded-xl border border-neon-cyan/40 bg-neon-cyan/20 px-4 py-3.5">
                {saving ? (
                  <ActivityIndicator size="small" color="#06b6d4" />
                ) : (
                  <>
                    <Text className="text-sm font-semibold text-neon-cyan">
                      {step === 2 ? 'Finish' : 'Continue'}
                    </Text>
                    <Ionicons name="arrow-forward" size={16} color="#06b6d4" />
                  </>
                )}
              </View>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Bullet({
  icon,
  color,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <View className="flex-row items-center gap-3">
      <View
        className="h-9 w-9 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${color}20` }}
      >
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text className="flex-1 text-sm leading-relaxed text-foreground/90">{children}</Text>
    </View>
  );
}
