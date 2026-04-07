'use client';

import { cn } from '@/lib/utils';

interface StreamingTextProps {
  text: string;
  isStreaming: boolean;
  className?: string;
}

function parseMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const nodes: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    if (trimmed.startsWith('## ')) {
      nodes.push(
        <h2 key={i} className="text-lg font-semibold text-neon-cyan mt-4 mb-2">
          {applyInlineFormatting(trimmed.slice(3))}
        </h2>
      );
    } else if (trimmed.startsWith('### ')) {
      nodes.push(
        <h3 key={i} className="text-base font-semibold text-neon-cyan/80 mt-3 mb-1">
          {applyInlineFormatting(trimmed.slice(4))}
        </h3>
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      nodes.push(
        <li key={i} className="text-sm text-text-secondary ml-4 list-disc mb-1">
          {applyInlineFormatting(trimmed.slice(2))}
        </li>
      );
    } else if (/^\d+\.\s/.test(trimmed)) {
      const content = trimmed.replace(/^\d+\.\s/, '');
      nodes.push(
        <li key={i} className="text-sm text-text-secondary ml-4 list-decimal mb-1">
          {applyInlineFormatting(content)}
        </li>
      );
    } else if (trimmed === '') {
      nodes.push(<div key={i} className="h-2" />);
    } else {
      nodes.push(
        <p key={i} className="text-sm text-text-secondary mb-1">
          {applyInlineFormatting(trimmed)}
        </p>
      );
    }
  });

  return nodes;
}

function applyInlineFormatting(text: string): React.ReactNode {
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

export function StreamingText({ text, isStreaming, className }: StreamingTextProps) {
  return (
    <div className={cn('relative', className)}>
      <div className="space-y-0">
        {parseMarkdown(text)}
      </div>
      {isStreaming && (
        <span className="inline-block w-2 h-4 bg-neon-cyan animate-pulse ml-0.5 align-text-bottom rounded-sm" />
      )}
    </div>
  );
}
