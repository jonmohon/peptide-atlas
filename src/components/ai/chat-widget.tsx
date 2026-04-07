'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } =
    useChat({
      api: '/api/ai/chat',
    });

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-medical-500 text-white shadow-lg hover:bg-medical-600 transition-all hover:scale-105 flex items-center justify-center"
        aria-label={isOpen ? 'Close chat' : 'Open AI assistant'}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[520px] bg-white rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-medical-500 text-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-semibold">PeptideAtlas AI</div>
                  <div className="text-xs text-white/70">Ask about peptides, stacks, effects</div>
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
                        onClick={() => {
                          const fakeEvent = {
                            target: { value: suggestion },
                          } as React.ChangeEvent<HTMLInputElement>;
                          handleInputChange(fakeEvent);
                        }}
                        className="block w-full text-left text-xs px-3 py-2 rounded-lg bg-surface-dim hover:bg-medical-50 text-text-secondary hover:text-medical-600 transition-colors"
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
                        ? 'bg-medical-500 text-white rounded-tr-sm'
                        : 'bg-surface-dim text-foreground rounded-tl-sm'
                    )}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-surface-dim rounded-2xl rounded-tl-sm px-3.5 py-2.5">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-medical-400 animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-medical-400 animate-bounce [animation-delay:0.1s]" />
                      <div className="w-2 h-2 rounded-full bg-medical-400 animate-bounce [animation-delay:0.2s]" />
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="text-center text-xs text-red-500 bg-red-50 rounded-lg p-2">
                  {error.message.includes('API_KEY')
                    ? 'AI features require an ANTHROPIC_API_KEY to be configured in .env.local'
                    : 'An error occurred. Please try again.'}
                </div>
              )}
            </div>

            {/* Disclaimer */}
            <div className="px-4 py-1.5 bg-amber-50 border-t border-amber-200">
              <p className="text-[10px] text-amber-700 text-center">
                For educational purposes only. Not medical advice.
              </p>
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-border">
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask about peptides..."
                  className="flex-1 text-sm px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-medical-500/30 focus:border-medical-500"
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
