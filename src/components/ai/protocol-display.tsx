'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface ProtocolDisplayProps {
  text: string;
  isStreaming: boolean;
}

interface Section {
  title: string;
  content: string;
}

function parseSections(text: string): Section[] {
  const lines = text.split('\n');
  const sections: Section[] = [];
  let currentTitle = '';
  let currentContent: string[] = [];

  for (const line of lines) {
    const headerMatch = line.match(/^##\s+(.+)/);
    if (headerMatch) {
      if (currentTitle || currentContent.length > 0) {
        sections.push({
          title: currentTitle || 'Overview',
          content: currentContent.join('\n').trim(),
        });
      }
      currentTitle = headerMatch[1];
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }

  if (currentTitle || currentContent.length > 0) {
    sections.push({
      title: currentTitle || 'Overview',
      content: currentContent.join('\n').trim(),
    });
  }

  return sections;
}

function renderContent(content: string): React.ReactNode[] {
  const lines = content.split('\n');
  return lines.map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={i} className="h-1.5" />;

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      return (
        <li key={i} className="text-sm text-text-secondary ml-4 list-disc mb-1">
          {renderInline(trimmed.slice(2))}
        </li>
      );
    }

    if (/^\d+\.\s/.test(trimmed)) {
      const content = trimmed.replace(/^\d+\.\s/, '');
      return (
        <li key={i} className="text-sm text-text-secondary ml-4 list-decimal mb-1">
          {renderInline(content)}
        </li>
      );
    }

    return (
      <p key={i} className="text-sm text-text-secondary mb-1">
        {renderInline(trimmed)}
      </p>
    );
  });
}

function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <strong key={match.index} className="font-semibold text-foreground">
        {match[1]}
      </strong>
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

export function ProtocolDisplay({ text, isStreaming }: ProtocolDisplayProps) {
  const sections = useMemo(() => parseSections(text), [text]);

  if (!text && !isStreaming) return null;

  return (
    <div className="space-y-4">
      {sections.map((section, i) => {
        const isDisclaimer =
          section.title.toLowerCase().includes('disclaimer') ||
          section.title.toLowerCase().includes('warning');

        return (
          <div
            key={i}
            className={cn(
              'rounded-xl border p-5',
              isDisclaimer
                ? 'border-amber-500/30 bg-amber-500/[0.05]'
                : 'border-white/[0.08] bg-white/[0.02] backdrop-blur-sm'
            )}
          >
            <h3
              className={cn(
                'text-base font-semibold mb-3',
                isDisclaimer ? 'text-amber-400' : 'text-neon-cyan'
              )}
            >
              {section.title}
            </h3>
            <div>{renderContent(section.content)}</div>
          </div>
        );
      })}

      {isStreaming && (
        <span className="inline-block w-2 h-4 bg-neon-cyan animate-pulse ml-1 rounded-sm" />
      )}
    </div>
  );
}
