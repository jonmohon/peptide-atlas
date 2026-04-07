'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useChatStore } from '@/stores/use-chat-store';

const transport = new DefaultChatTransport({ api: '/api/ai/chat' });

export function ChatWidget() {
  const { isOpen, prefillText, setOpen } = useChatStore();
  const [input, setInput] = useState('');
  const { messages, sendMessage, status, error } = useChat({ transport });
  const isLoading = status === 'streaming' || status === 'submitted';

  useEffect(() => {
    if (prefillText) {
      setInput(prefillText);
      useChatStore.setState({ prefillText: '' });
    }
  }, [prefillText]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input.trim() });
    setInput('');
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-neon-cyan/20 border border-neon-cyan/30 text-neon-cyan shadow-[0_0_15px_rgba(0,212,255,0.2)] hover:bg-neon-cyan/30 hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition-all hover:scale-105 flex items-center justify-center"
        aria-label={isOpen ? 'Close chat' : 'Open AI assistant'}
      >
        {isOpen ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-22 right-6 z-50 w-[380px] max-h-[520px] glass-bright rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-neon-cyan/10 border-b border-neon-cyan/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-neon-cyan/20 border border-neon-cyan/30 flex items-center justify-center">
                  <svg className="w-4 h-4 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">PeptideAtlas AI</div>
                  <div className="text-xs text-text-secondary">Ask about peptides, stacks, effects</div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[340px]">
              {messages.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-sm text-text-secondary mb-3">
                    Ask me anything about peptides!
                  </p>
                  <div className="space-y-1.5">
                    {[
                      'What helps with joint pain?',
                      'Best peptides for sleep?',
                      'How does BPC-157 work?',
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setInput(suggestion)}
                        className="block w-full text-left text-xs px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-neon-cyan/[0.05] hover:border-neon-cyan/20 text-text-secondary hover:text-neon-cyan transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm',
                      message.role === 'user'
                        ? 'bg-neon-cyan/20 text-foreground border border-neon-cyan/20 rounded-tr-sm'
                        : 'bg-white/[0.04] text-foreground border border-white/[0.06] rounded-tl-sm'
                    )}
                  >
                    <div className="whitespace-pre-wrap">
                      {message.parts
                        ?.filter((part): part is { type: 'text'; text: string } => part.type === 'text')
                        .map((part, i) => <span key={i}>{part.text}</span>)
                      }
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl rounded-tl-sm px-3.5 py-2.5">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-neon-cyan animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-neon-cyan animate-bounce [animation-delay:0.1s]" />
                      <div className="w-2 h-2 rounded-full bg-neon-cyan animate-bounce [animation-delay:0.2s]" />
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="text-center text-xs text-[#ff6b35] bg-[#ff6b35]/10 border border-[#ff6b35]/20 rounded-lg p-2">
                  {error.message.includes('API_KEY')
                    ? 'AI features require an ANTHROPIC_API_KEY to be configured'
                    : 'An error occurred. Please try again.'}
                </div>
              )}
            </div>

            {/* Disclaimer */}
            <div className="px-4 py-1.5 bg-white/[0.02] border-t border-white/[0.06]">
              <p className="text-[10px] text-text-muted text-center">
                For educational purposes only. Not medical advice.
              </p>
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-white/[0.06]">
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about peptides..."
                  className="flex-1 text-sm px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-foreground focus:outline-none focus:ring-1 focus:ring-neon-cyan/20 focus:border-neon-cyan/30 placeholder:text-text-muted"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={isLoading || !input.trim()}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
