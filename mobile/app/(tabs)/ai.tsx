/**
 * AI tab — entry to the chat surface. The prototype shows the suggestion
 * grid and a stub message; streaming wiring to /api/ai/chat lands once the
 * Bearer-token auth path is added on the web routes.
 */

import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { GlassCard } from '@/components/glass-card';
import { Screen } from '@/components/screen';

const SUGGESTIONS = [
  'How does BPC-157 dosing work for tendon recovery?',
  'Compare Retatrutide vs Tirzepatide for fat loss',
  'Build me a 12-week recomp protocol',
  'What labs should I track on a GLP-1?',
];

export default function AiScreen() {
  return (
    <Screen>
      <View className="mb-6">
        <Text className="text-xs uppercase tracking-widest text-text-secondary">AI Assistant</Text>
        <Text className="mt-1 text-3xl font-bold text-foreground">Ask anything</Text>
        <Text className="mt-2 text-sm leading-relaxed text-text-secondary">
          Trained on the full peptide library and your journal. Replies are personalized to your goals.
        </Text>
      </View>

      <GlassCard className="mb-6 p-4" bright>
        <View className="flex-row items-start gap-3">
          <View className="h-9 w-9 items-center justify-center rounded-full bg-neon-purple/20">
            <Ionicons name="sparkles" size={18} color="#a855f7" />
          </View>
          <View className="flex-1">
            <Text className="text-sm leading-relaxed text-foreground/95">
              Hi — I&apos;m the Peptide Atlas assistant. Ask me about dosing, mechanisms, side effects, or
              tap a suggestion below to get started.
            </Text>
          </View>
        </View>
      </GlassCard>

      <Text className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-secondary">
        Try one
      </Text>
      <View className="gap-2.5">
        {SUGGESTIONS.map((s) => (
          <Pressable key={s} className="active:opacity-70">
            <GlassCard className="p-4">
              <View className="flex-row items-center gap-3">
                <Ionicons name="chatbubble-outline" size={16} color="#06b6d4" />
                <Text className="flex-1 text-sm text-foreground">{s}</Text>
                <Ionicons name="arrow-forward" size={14} color="#737373" />
              </View>
            </GlassCard>
          </Pressable>
        ))}
      </View>

      <Text className="mt-6 text-center text-[11px] leading-relaxed text-text-secondary">
        Information here is educational. Not medical advice. Consult a licensed clinician before starting any peptide protocol.
      </Text>
    </Screen>
  );
}
