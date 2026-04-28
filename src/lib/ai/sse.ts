/**
 * Tiny SSE writer for streaming heterogeneous events from a route handler.
 *
 * Use it to emit stage updates from a multi-stage pipeline alongside the
 * eventual text-delta chunks. The mobile parser reads `data: {json}` lines
 * line-by-line.
 *
 * Event shapes the mobile expects:
 *   {type:'stage', id, label}     — progress indicator
 *   {type:'text-delta', delta}    — streaming response text
 *   {type:'warning', message}     — non-fatal safety advisory
 *   {type:'done'}                 — stream complete
 *   {type:'error', message}       — terminal error
 */

export type SseEvent =
  | { type: 'stage'; id: string; label: string }
  | { type: 'text-delta'; delta: string }
  | { type: 'warning'; message: string }
  | { type: 'done' }
  | { type: 'error'; message: string };

export function createSseStream(
  produce: (send: (event: SseEvent) => void, signal: AbortSignal) => Promise<void>
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      const ac = new AbortController();
      const send = (event: SseEvent) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch {
          // Stream already closed
        }
      };
      try {
        await produce(send, ac.signal);
        send({ type: 'done' });
      } catch (e) {
        send({ type: 'error', message: e instanceof Error ? e.message : 'Unknown error' });
      } finally {
        try {
          controller.close();
        } catch {
          // already closed
        }
      }
    },
  });
}

export const SSE_HEADERS = {
  'Content-Type': 'text/event-stream; charset=utf-8',
  'Cache-Control': 'no-cache, no-transform',
  Connection: 'keep-alive',
};
