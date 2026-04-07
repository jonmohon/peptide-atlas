import Link from 'next/link';
import type { MDXComponents } from 'mdx/types';

function Callout({
  type = 'info',
  children,
}: {
  type?: 'info' | 'warning' | 'tip';
  children: React.ReactNode;
}) {
  const styles = {
    info: 'border-[#00d4ff] bg-[#00d4ff]/[0.04]',
    warning: 'border-[#ff6b35] bg-[#ff6b35]/[0.04]',
    tip: 'border-[#00ff88] bg-[#00ff88]/[0.04]',
  };
  const labels = { info: 'Info', warning: 'Warning', tip: 'Tip' };
  const labelColors = {
    info: 'text-[#00d4ff]',
    warning: 'text-[#ff6b35]',
    tip: 'text-[#00ff88]',
  };

  return (
    <div
      className={`my-6 rounded-lg border-l-4 p-4 ${styles[type]}`}
    >
      <p className={`mb-1 text-sm font-semibold ${labelColors[type]}`}>
        {labels[type]}
      </p>
      <div className="text-sm text-white/70">{children}</div>
    </div>
  );
}

function PeptideLink({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={`/atlas/peptides/${slug}`}
      className="inline-flex items-center gap-1 rounded bg-[#00d4ff]/10 px-2 py-0.5 text-sm font-medium text-[#00d4ff] transition-colors hover:bg-[#00d4ff]/20 hover:underline"
    >
      {children}
    </Link>
  );
}

export const mdxComponents: MDXComponents = {
  h1: (props) => (
    <h1
      className="mb-6 mt-10 scroll-mt-24 text-3xl font-bold text-white"
      {...props}
    />
  ),
  h2: (props) => (
    <h2
      className="mb-4 mt-8 scroll-mt-24 text-2xl font-semibold text-white"
      {...props}
    />
  ),
  h3: (props) => (
    <h3
      className="mb-3 mt-6 scroll-mt-24 text-xl font-semibold text-white/90"
      {...props}
    />
  ),
  p: (props) => (
    <p className="mb-4 leading-relaxed text-white/60" {...props} />
  ),
  a: (props) => (
    <a
      className="text-[#00d4ff] underline-offset-2 transition-colors hover:underline"
      {...props}
    />
  ),
  ul: (props) => (
    <ul
      className="mb-4 ml-6 list-disc space-y-1 text-white/60 marker:text-[#00d4ff]/50"
      {...props}
    />
  ),
  ol: (props) => (
    <ol
      className="mb-4 ml-6 list-decimal space-y-1 text-white/60 marker:text-[#00d4ff]/50"
      {...props}
    />
  ),
  li: (props) => <li className="leading-relaxed" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="my-6 border-l-4 border-[#00d4ff]/40 bg-white/[0.02] py-3 pl-4 pr-3 italic text-white/50"
      {...props}
    />
  ),
  code: (props) => (
    <code
      className="rounded bg-white/[0.05] px-1.5 py-0.5 text-sm text-[#00d4ff]"
      {...props}
    />
  ),
  pre: (props) => (
    <pre
      className="my-4 overflow-x-auto rounded-lg bg-[#0d1117] p-4 text-sm"
      {...props}
    />
  ),
  hr: () => <hr className="my-8 border-white/[0.06]" />,
  strong: (props) => <strong className="font-semibold text-white" {...props} />,
  table: (props) => (
    <div className="my-6 overflow-x-auto">
      <table className="w-full text-sm text-white/60" {...props} />
    </div>
  ),
  th: (props) => (
    <th
      className="border-b border-white/[0.06] px-3 py-2 text-left font-semibold text-white"
      {...props}
    />
  ),
  td: (props) => (
    <td className="border-b border-white/[0.04] px-3 py-2" {...props} />
  ),
  Callout,
  PeptideLink,
};
