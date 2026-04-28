/**
 * Step sequencer — vertical list of stages with state per row (pending,
 * active, done). Used by the AI surfaces (protocol generator, journal
 * insights, etc) to communicate what's happening between server stages
 * so multi-second waits don't feel broken.
 *
 * Active step: spinner + cyan label.
 * Done step:   green check + dimmed label.
 * Pending:     hollow circle + dim text.
 */

import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Text, View } from 'react-native';

export type StepState = 'pending' | 'active' | 'done';

export type Step = {
  id: string;
  label: string;
  state: StepState;
};

export function StepSequencer({ steps }: { steps: Step[] }) {
  return (
    <View className="gap-2.5">
      {steps.map((s, i) => (
        <View key={s.id} className="flex-row items-center gap-3">
          <View className="items-center" style={{ width: 22 }}>
            {s.state === 'active' ? (
              <ActivityIndicator size="small" color="#06b6d4" />
            ) : s.state === 'done' ? (
              <View className="h-5 w-5 items-center justify-center rounded-full bg-neon-green/20">
                <Ionicons name="checkmark" size={12} color="#10b981" />
              </View>
            ) : (
              <View className="h-5 w-5 rounded-full border border-white/15" />
            )}
            {i < steps.length - 1 && (
              <View className="my-1 w-px flex-1" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
            )}
          </View>
          <Text
            className="flex-1 text-sm"
            style={{
              color:
                s.state === 'active' ? '#06b6d4' : s.state === 'done' ? '#a3a3a3' : '#737373',
              fontWeight: s.state === 'active' ? '600' : '400',
            }}
          >
            {s.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

/**
 * Shared SSE parser for AI routes that emit {type:'stage'|'text-delta'|'warning'|'done'|'error'}.
 * Returns void; calls the supplied handlers.
 */
export type SseHandlers = {
  onStage?: (id: string, label: string) => void;
  onText?: (delta: string) => void;
  onWarning?: (message: string) => void;
  onError?: (message: string) => void;
  onDone?: () => void;
};

export async function consumeSseStream(
  body: ReadableStream<Uint8Array>,
  handlers: SseHandlers
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let nl = buffer.indexOf('\n');
    while (nl !== -1) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (line.startsWith('data:')) {
        const payload = line.slice(5).trim();
        if (payload && payload !== '[DONE]') {
          try {
            const evt = JSON.parse(payload) as {
              type?: string;
              id?: string;
              label?: string;
              delta?: string;
              message?: string;
            };
            if (evt.type === 'stage' && evt.id && evt.label) {
              handlers.onStage?.(evt.id, evt.label);
            } else if (evt.type === 'text-delta' && typeof evt.delta === 'string') {
              handlers.onText?.(evt.delta);
            } else if (evt.type === 'warning' && evt.message) {
              handlers.onWarning?.(evt.message);
            } else if (evt.type === 'error' && evt.message) {
              handlers.onError?.(evt.message);
            } else if (evt.type === 'done') {
              handlers.onDone?.();
            }
          } catch {
            // ignore malformed lines
          }
        }
      }
      nl = buffer.indexOf('\n');
    }
  }
}
