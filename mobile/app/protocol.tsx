/**
 * Protocol generator — pick goals + experience, optional preferences, get a
 * streaming AI-generated protocol from /api/ai/protocol. Output is plain text
 * (toTextStreamResponse on the route), so we just append every chunk.
 */

import { Ionicons } from '@expo/vector-icons';
import { fetch as expoFetch } from 'expo/fetch';
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
import Markdown from 'react-native-markdown-display';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/glass-card';
import { getIdToken } from '@/lib/amplify';
import { API_BASE_URL } from '@/lib/config';

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
  'Sexual health',
];

const EXPERIENCE_OPTIONS = ['Beginner', 'Intermediate', 'Advanced'];

export default function ProtocolScreen() {
  const router = useRouter();
  const [goals, setGoals] = useState<string[]>([]);
  const [experience, setExperience] = useState('Beginner');
  const [preferences, setPreferences] = useState('');
  const [output, setOutput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleGoal = (g: string) => {
    setGoals((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  };

  const generate = async () => {
    if (goals.length === 0) {
      setError('Pick at least one goal.');
      return;
    }
    setError(null);
    setOutput('');
    setStreaming(true);
    try {
      const token = await getIdToken();
      if (!token) throw new Error('Sign in required');

      const res = await expoFetch(`${API_BASE_URL}/api/ai/protocol`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ goals, experience, preferences: preferences.trim() || undefined }),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`HTTP ${res.status}: ${body.slice(0, 200)}`);
      }
      if (!res.body) throw new Error('Empty response');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setOutput(acc);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate');
    } finally {
      setStreaming(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <View className="flex-row items-center gap-2 border-b border-white/5 px-5 py-3">
          <Pressable onPress={() => router.back()} className="active:opacity-60">
            <Ionicons name="chevron-back" size={20} color="#a3a3a3" />
          </Pressable>
          <Text className="text-base font-semibold text-foreground">Protocol generator</Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
          {output.length === 0 && !streaming ? (
            <>
              <View className="mb-5">
                <Text className="text-xs uppercase tracking-widest text-text-secondary">AI</Text>
                <Text className="mt-1 text-3xl font-bold text-foreground">Build a protocol</Text>
                <Text className="mt-2 text-sm leading-relaxed text-text-secondary">
                  Tell us your goals and experience. Atlas AI builds a structured protocol that accounts
                  for your profile, conditions, and recent journal data.
                </Text>
              </View>

              <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-secondary">
                Goals (pick any)
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

              <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-secondary">
                Experience
              </Text>
              <GlassCard className="mb-5 p-4">
                <View className="-m-1 flex-row flex-wrap">
                  {EXPERIENCE_OPTIONS.map((e) => {
                    const active = e === experience;
                    return (
                      <Pressable key={e} onPress={() => setExperience(e)} className="m-1 active:opacity-70">
                        <View
                          className="rounded-full border px-3 py-1.5"
                          style={{
                            backgroundColor: active ? 'rgba(168,85,247,0.20)' : 'rgba(255,255,255,0.03)',
                            borderColor: active ? 'rgba(168,85,247,0.45)' : 'rgba(255,255,255,0.1)',
                          }}
                        >
                          <Text
                            className="text-xs font-medium"
                            style={{ color: active ? '#a855f7' : '#a3a3a3' }}
                          >
                            {e}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </GlassCard>

              <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-secondary">
                Preferences (optional)
              </Text>
              <TextInput
                value={preferences}
                onChangeText={setPreferences}
                placeholder="e.g. injection-only, max 8 weeks, avoid GH peptides"
                placeholderTextColor="#737373"
                multiline
                className="mb-5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-foreground"
                style={{ minHeight: 80, textAlignVertical: 'top' }}
              />

              {error && (
                <View className="mb-3 rounded-xl border border-red-500/25 bg-red-500/10 p-3">
                  <Text className="text-xs text-red-400">{error}</Text>
                </View>
              )}

              <Pressable onPress={generate} disabled={goals.length === 0} className="active:opacity-70">
                <View
                  className="flex-row items-center justify-center gap-2 rounded-xl border px-4 py-3.5"
                  style={{
                    backgroundColor: goals.length ? 'rgba(168,85,247,0.20)' : 'rgba(255,255,255,0.04)',
                    borderColor: goals.length ? 'rgba(168,85,247,0.45)' : 'rgba(255,255,255,0.1)',
                  }}
                >
                  <Ionicons
                    name="sparkles"
                    size={16}
                    color={goals.length ? '#a855f7' : '#737373'}
                  />
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: goals.length ? '#a855f7' : '#737373' }}
                  >
                    Generate protocol
                  </Text>
                </View>
              </Pressable>

              <Text className="mt-4 text-center text-[10px] leading-relaxed text-text-muted">
                Educational use only. Not medical advice.
              </Text>
            </>
          ) : (
            <>
              <View className="mb-3 flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <View className="h-6 w-6 items-center justify-center rounded-md bg-neon-purple/20">
                    <Ionicons name="sparkles" size={12} color="#c084fc" />
                  </View>
                  <Text className="text-sm font-semibold text-foreground">Atlas AI</Text>
                </View>
                <Pressable
                  onPress={() => {
                    setOutput('');
                    setError(null);
                  }}
                  disabled={streaming}
                  className={`active:opacity-60 ${streaming ? 'opacity-40' : ''}`}
                >
                  <Text className="text-xs text-text-secondary">New protocol</Text>
                </Pressable>
              </View>

              <View className="mb-3 flex-row flex-wrap" style={{ gap: 6 }}>
                {goals.map((g) => (
                  <View key={g} className="rounded-full bg-neon-cyan/15 px-2.5 py-1">
                    <Text className="text-[10px] font-medium text-neon-cyan">{g}</Text>
                  </View>
                ))}
                <View className="rounded-full bg-neon-purple/15 px-2.5 py-1">
                  <Text className="text-[10px] font-medium text-neon-purple">{experience}</Text>
                </View>
              </View>

              <View
                className="rounded-2xl border px-4 py-3"
                style={{
                  backgroundColor: 'rgba(168,85,247,0.10)',
                  borderColor: 'rgba(168,85,247,0.28)',
                }}
              >
                {output ? (
                  <Markdown style={MARKDOWN_STYLES}>{output}</Markdown>
                ) : (
                  <View className="py-2 flex-row items-center gap-2">
                    <ActivityIndicator size="small" color="#a855f7" />
                    <Text className="text-xs text-text-secondary">Generating…</Text>
                  </View>
                )}
              </View>

              {error && (
                <View className="mt-3 rounded-xl border border-red-500/25 bg-red-500/10 p-3">
                  <Text className="text-xs text-red-400">{error}</Text>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const MARKDOWN_STYLES = {
  body: { color: '#fafafa', fontSize: 14, lineHeight: 22 },
  paragraph: { color: '#fafafa', fontSize: 14, lineHeight: 22, marginTop: 0, marginBottom: 10 },
  strong: { color: '#ffffff', fontWeight: '700' as const },
  em: { color: '#fafafa', fontStyle: 'italic' as const },
  heading1: { color: '#ffffff', fontSize: 18, fontWeight: '700' as const, marginTop: 8, marginBottom: 6 },
  heading2: { color: '#ffffff', fontSize: 16, fontWeight: '700' as const, marginTop: 8, marginBottom: 6 },
  heading3: { color: '#ffffff', fontSize: 14, fontWeight: '700' as const, marginTop: 8, marginBottom: 4 },
  list_item: { marginBottom: 4 },
  bullet_list_icon: { color: '#06b6d4', marginRight: 8 },
  ordered_list_icon: { color: '#06b6d4', marginRight: 8 },
  blockquote: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderLeftColor: '#06b6d4',
    borderLeftWidth: 3,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginVertical: 6,
  },
  hr: { backgroundColor: 'rgba(255,255,255,0.1)', height: 1, marginVertical: 10 },
  code_inline: {
    color: '#a5f3fc',
    backgroundColor: 'rgba(6,182,212,0.12)',
    fontSize: 13,
    fontFamily: 'Menlo',
    paddingHorizontal: 4,
    borderRadius: 4,
  },
};
