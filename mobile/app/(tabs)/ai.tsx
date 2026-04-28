/**
 * AI chat — streams from the deployed /api/ai/chat with the user's Cognito ID
 * token in the Authorization header. The web route's auth(req) helper verifies
 * the JWT against the User Pool's JWKS via aws-jwt-verify.
 *
 * We use a hand-rolled fetch + UI message stream parser instead of @ai-sdk/react's
 * useChat to keep the dependency surface tight on RN. Each chunk is a JSON
 * UIMessageStream event; we accumulate `text-delta` events into the assistant
 * message body. See `ai` SDK v6 docs for the stream protocol.
 */

import { Ionicons } from '@expo/vector-icons';
import { fetch as expoFetch } from 'expo/fetch';
import { useCallback, useEffect, useRef, useState } from 'react';
import Markdown from 'react-native-markdown-display';
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
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/glass-card';
import { getIdToken } from '@/lib/amplify';
import { API_BASE_URL } from '@/lib/config';

type Message = { id: string; role: 'user' | 'assistant'; text: string };

const SUGGESTIONS = [
  'How does BPC-157 dosing work for tendon recovery?',
  'Compare Retatrutide vs Tirzepatide for fat loss',
  'What labs should I track on a GLP-1?',
  'Build a 12-week recomposition protocol',
];

export default function AiScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Auto-scroll to bottom on new content.
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const send = useCallback(
    async (raw?: string) => {
      const text = (raw ?? input).trim();
      if (!text || streaming) return;
      setInput('');
      setError(null);

      const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', text };
      const assistantId = `a-${Date.now() + 1}`;
      const placeholder: Message = { id: assistantId, role: 'assistant', text: '' };
      setMessages((prev) => [...prev, userMsg, placeholder]);
      setStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const token = await getIdToken();
        if (!token) throw new Error('Sign in required');

        // streamText() in the route expects ModelMessage[] — { role, content }.
        // Skip empty placeholder bubbles so we don't send blank assistant turns.
        const apiMessages = [...messages, userMsg]
          .filter((m) => m.text.trim().length > 0)
          .map((m) => ({ role: m.role, content: m.text }));

        // expo/fetch exposes res.body as a real ReadableStream that supports
        // getReader(); the stock RN fetch returns null for body, which is why
        // we can't use it for streaming responses.
        const res = await expoFetch(`${API_BASE_URL}/api/ai/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ messages: apiMessages }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const body = await res.text();
          throw new Error(`HTTP ${res.status}: ${body.slice(0, 200)}`);
        }

        if (!res.body) throw new Error('Empty response body');

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let assistantText = '';

        // The route returns Server-Sent Events of UI message chunks. Each line is
        // either empty or "data: {json}". We collect text-delta events into the
        // assistant message body.
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let nlIdx = buffer.indexOf('\n');
          while (nlIdx !== -1) {
            const line = buffer.slice(0, nlIdx).trim();
            buffer = buffer.slice(nlIdx + 1);

            if (line.startsWith('data:')) {
              const payload = line.slice(5).trim();
              if (payload && payload !== '[DONE]') {
                try {
                  const evt = JSON.parse(payload) as Record<string, unknown>;
                  // Log every event type once so we can see the actual stream shape.
                  console.log('[ai-stream]', JSON.stringify(evt).slice(0, 200));
                  // AI SDK v6 sends multiple text-event flavors. Try them all.
                  const t = evt.type as string | undefined;
                  let chunk: string | null = null;
                  if (t === 'text-delta' && typeof evt.delta === 'string') chunk = evt.delta as string;
                  else if (t === 'text-delta' && typeof evt.text === 'string') chunk = evt.text as string;
                  else if (t === 'text' && typeof evt.text === 'string') chunk = evt.text as string;
                  else if (typeof evt.textDelta === 'string') chunk = evt.textDelta as string;
                  if (chunk) {
                    assistantText += chunk;
                    setMessages((prev) =>
                      prev.map((m) => (m.id === assistantId ? { ...m, text: assistantText } : m))
                    );
                  }
                } catch {
                  // Ignore non-JSON lines.
                }
              }
            }

            nlIdx = buffer.indexOf('\n');
          }
        }
      } catch (e) {
        if ((e as Error).name === 'AbortError') return;
        const msg = e instanceof Error ? e.message : 'Chat failed';
        setError(msg);
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [input, messages, streaming]
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <LinearGradient
        colors={['rgba(168,85,247,0.08)', 'transparent', 'rgba(6,182,212,0.06)']}
        locations={[0, 0.5, 1]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <View className="flex-row items-center justify-between border-b border-white/5 px-5 py-3">
          <View className="flex-row items-center gap-2">
            <View className="h-7 w-7 items-center justify-center rounded-lg bg-neon-purple/20">
              <Ionicons name="sparkles" size={14} color="#a855f7" />
            </View>
            <Text className="text-base font-semibold text-foreground">Atlas AI</Text>
          </View>
          {messages.length > 0 && (
            <Pressable onPress={() => setMessages([])} className="active:opacity-60">
              <Text className="text-xs text-text-secondary">Clear</Text>
            </Pressable>
          )}
        </View>

        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerStyle={{ padding: 20, paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          {messages.length === 0 ? (
            <>
              <View className="mb-6">
                <Text className="text-2xl font-bold text-foreground">Ask anything</Text>
                <Text className="mt-2 text-sm leading-relaxed text-text-secondary">
                  Trained on the full peptide library and your journal. Replies are personalized to
                  your goals.
                </Text>
              </View>
              <Text className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-secondary">
                Try one
              </Text>
              <View className="gap-2.5">
                {SUGGESTIONS.map((s) => (
                  <Pressable key={s} onPress={() => send(s)} className="active:opacity-70">
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
            </>
          ) : (
            <View className="gap-3">
              {messages.map((m) => (
                <Bubble key={m.id} message={m} />
              ))}
              {streaming && messages[messages.length - 1]?.text === '' && (
                <View className="self-start rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                  <ActivityIndicator size="small" color="#a855f7" />
                </View>
              )}
            </View>
          )}

          {error && (
            <View className="mt-4 rounded-xl border border-red-500/25 bg-red-500/10 p-3">
              <Text className="text-xs text-red-400">{error}</Text>
            </View>
          )}
        </ScrollView>

        <View className="border-t border-white/5 px-5 py-3">
          <View className="flex-row items-end gap-2">
            <View className="flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5">
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Ask about peptides, dosing, side effects…"
                placeholderTextColor="#737373"
                multiline
                editable={!streaming}
                className="text-sm text-foreground"
                style={{ minHeight: 22, maxHeight: 120 }}
              />
            </View>
            {streaming ? (
              <Pressable onPress={stop} className="active:opacity-70">
                <View className="h-11 w-11 items-center justify-center rounded-2xl bg-red-500/15 border border-red-500/30">
                  <Ionicons name="stop" size={16} color="#ef4444" />
                </View>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => send()}
                disabled={!input.trim()}
                className={`active:opacity-70 ${!input.trim() ? 'opacity-40' : ''}`}
              >
                <View className="h-11 w-11 items-center justify-center rounded-2xl bg-neon-cyan/20 border border-neon-cyan/40">
                  <Ionicons name="arrow-up" size={18} color="#06b6d4" />
                </View>
              </Pressable>
            )}
          </View>
          <Text className="mt-2 text-center text-[10px] leading-relaxed text-text-muted">
            Educational use only. Not medical advice.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Bubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <View className="self-end max-w-[85%]">
        <View
          className="rounded-2xl border px-4 py-2.5"
          style={{
            backgroundColor: 'rgba(6,182,212,0.20)',
            borderColor: 'rgba(6,182,212,0.40)',
          }}
        >
          <Text className="text-sm leading-relaxed text-cyan-100">{message.text}</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="self-start max-w-[85%]">
      <View
        className="rounded-2xl border px-4 py-3"
        style={{
          backgroundColor: 'rgba(168,85,247,0.20)',
          borderColor: 'rgba(168,85,247,0.40)',
        }}
      >
        {message.text ? (
          <Markdown style={MARKDOWN_STYLES}>{message.text}</Markdown>
        ) : (
          <Text className="text-sm text-text-muted">…</Text>
        )}
      </View>
    </View>
  );
}

const MARKDOWN_STYLES = {
  body: {
    color: '#fafafa',
    fontSize: 14,
    lineHeight: 22,
  },
  paragraph: {
    color: '#fafafa',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 0,
    marginBottom: 10,
  },
  strong: { color: '#ffffff', fontWeight: '700' as const },
  em: { color: '#fafafa', fontStyle: 'italic' as const },
  heading1: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700' as const,
    marginTop: 8,
    marginBottom: 6,
  },
  heading2: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700' as const,
    marginTop: 8,
    marginBottom: 6,
  },
  heading3: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700' as const,
    marginTop: 8,
    marginBottom: 4,
  },
  list_item: { marginBottom: 4 },
  bullet_list: { marginTop: 4, marginBottom: 8 },
  ordered_list: { marginTop: 4, marginBottom: 8 },
  bullet_list_icon: { color: '#06b6d4', marginRight: 8 },
  ordered_list_icon: { color: '#06b6d4', marginRight: 8 },
  code_inline: {
    color: '#a5f3fc',
    backgroundColor: 'rgba(6,182,212,0.12)',
    fontSize: 13,
    fontFamily: 'Menlo',
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  code_block: {
    color: '#cffafe',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderColor: 'rgba(6,182,212,0.25)',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontFamily: 'Menlo',
    fontSize: 12,
    lineHeight: 18,
  },
  fence: {
    color: '#cffafe',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderColor: 'rgba(6,182,212,0.25)',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontFamily: 'Menlo',
    fontSize: 12,
    lineHeight: 18,
  },
  blockquote: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderLeftColor: '#06b6d4',
    borderLeftWidth: 3,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginVertical: 6,
  },
  hr: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    height: 1,
    marginVertical: 10,
  },
  link: { color: '#06b6d4', textDecorationLine: 'underline' as const },
  table: {
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 8,
    marginVertical: 8,
  },
  th: { color: '#fafafa', fontWeight: '700' as const, padding: 6 },
  td: { color: '#e5e5e5', padding: 6 },
};
