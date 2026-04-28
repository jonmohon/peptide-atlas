/**
 * AI explain card — collapsed by default, tapping streams a personalized
 * mechanism-of-action explanation from /api/ai/explain. Shared component so
 * other detail screens can drop the same affordance in.
 */

import { Ionicons } from '@expo/vector-icons';
import { fetch as expoFetch } from 'expo/fetch';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Markdown from 'react-native-markdown-display';

import { GlassCard } from '@/components/glass-card';
import { getIdToken } from '@/lib/amplify';
import { API_BASE_URL } from '@/lib/config';

export function AiExplain({ peptideId, peptideName }: { peptideId: string; peptideName: string }) {
  const [output, setOutput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stream = async () => {
    setError(null);
    setOutput('');
    setStreaming(true);
    try {
      const token = await getIdToken();
      if (!token) throw new Error('Sign in required');
      const res = await expoFetch(`${API_BASE_URL}/api/ai/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ peptideId, level: 'intermediate' }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
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
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setStreaming(false);
    }
  };

  if (!output && !streaming) {
    return (
      <Pressable onPress={stream} className="active:opacity-70">
        <GlassCard className="p-4">
          <View className="flex-row items-center gap-3">
            <View className="h-9 w-9 items-center justify-center rounded-lg bg-neon-purple/15">
              <Ionicons name="sparkles" size={16} color="#a855f7" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-foreground">Explain {peptideName}</Text>
              <Text className="mt-0.5 text-[11px] text-text-secondary">
                AI deep dive on mechanism of action — personalized to your profile.
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={14} color="#a855f7" />
          </View>
        </GlassCard>
      </Pressable>
    );
  }

  return (
    <View>
      <View className="mb-2 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="h-6 w-6 items-center justify-center rounded-md bg-neon-purple/20">
            <Ionicons name="sparkles" size={12} color="#c084fc" />
          </View>
          <Text className="text-xs font-semibold text-foreground">Mechanism · Atlas AI</Text>
        </View>
        <Pressable onPress={() => setOutput('')} disabled={streaming} className="active:opacity-60">
          <Text className="text-[11px] text-text-secondary">Reset</Text>
        </Pressable>
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
        <View className="mt-2 rounded-xl border border-red-500/25 bg-red-500/10 p-2.5">
          <Text className="text-[11px] text-red-400">{error}</Text>
        </View>
      )}
    </View>
  );
}

const MARKDOWN_STYLES = {
  body: { color: '#fafafa', fontSize: 13, lineHeight: 20 },
  paragraph: { color: '#fafafa', fontSize: 13, lineHeight: 20, marginTop: 0, marginBottom: 8 },
  strong: { color: '#ffffff', fontWeight: '700' as const },
  em: { color: '#fafafa', fontStyle: 'italic' as const },
  heading1: { color: '#ffffff', fontSize: 16, fontWeight: '700' as const, marginTop: 6, marginBottom: 4 },
  heading2: { color: '#ffffff', fontSize: 14, fontWeight: '700' as const, marginTop: 6, marginBottom: 4 },
  heading3: { color: '#ffffff', fontSize: 13, fontWeight: '700' as const, marginTop: 4, marginBottom: 2 },
  list_item: { marginBottom: 3 },
  bullet_list_icon: { color: '#06b6d4', marginRight: 6 },
  ordered_list_icon: { color: '#06b6d4', marginRight: 6 },
};
