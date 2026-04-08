# CLAUDE.md — PeptideAtlas Project Guide

## What This Project Is

PeptideAtlas is an interactive peptide education platform. Users explore how peptides affect the body through a visual atlas, build stacks, compare peptides, and get AI-powered recommendations. It's a Next.js 16 app deployed on AWS Amplify.

## Quick Start

```bash
cd /Volumes/T9/Development/peptide-atlas
npm run dev          # Starts on port 3000
npm run build        # Production build (must pass for Amplify deploy)
npx tsc --noEmit     # Type check without building
```

**Environment:** Requires `ANTHROPIC_API_KEY` in `.env.local` for AI features. Without it, AI features show friendly error messages but the site works fine otherwise.

**Important:** The T9 external drive is slow for npm/build operations. `npm install` can take 5-10 minutes. Use `npm rebuild` if `.bin` symlinks are missing after install.

## Architecture

### Route Groups

The app uses two Next.js route groups with different layouts:

- **`(marketing)/`** — Scrollable content pages with MarketingHeader + Footer. Routes: `/`, `/learn`, `/about`, `/glossary`, `/faq`, `/privacy`, `/terms`
- **`(atlas)/`** — Full-screen interactive tool with AtlasHeader, overflow-hidden. Routes: `/atlas`, `/atlas/peptides`, `/atlas/stacks`, `/atlas/effects`, `/atlas/compare`, `/atlas/protocol-generator`

### Key Directories

| Directory | Purpose |
|-----------|---------|
| `src/app/(atlas)/atlas/` | Interactive atlas pages |
| `src/app/(marketing)/` | Marketing/content pages |
| `src/app/api/ai/` | 7 AI API routes (Claude Sonnet/Haiku) |
| `src/components/ai/` | 11 AI-powered UI components |
| `src/components/body/` | Interactive body map SVG components |
| `src/components/marketing/` | Landing page sections |
| `src/components/blog/` | Blog system components |
| `src/components/layout/` | Headers, footer, sidebar, logo |
| `src/components/ui/` | Base UI primitives |
| `src/data/` | Static data (31 peptides, 10 stacks, 27 effects, 13 regions) |
| `src/lib/ai/` | AI prompts, schemas, caching |
| `src/stores/` | 5 Zustand state stores |
| `src/hooks/` | 5 custom React hooks |
| `src/types/` | TypeScript type definitions |
| `content/blog/` | 5 MDX blog articles |
| `docs/` | Project documentation |

### Two Headers

- **MarketingHeader** (`components/layout/marketing-header.tsx`): Logo, nav (Home, Learn, About, Glossary, FAQ), "Launch Atlas" CTA button
- **AtlasHeader** (`components/layout/atlas-header.tsx`): Logo, atlas nav (Body Map, Peptides, Stacks, Effects, Compare), AI search bar, "← Site" link

### AI System

7 API routes at `/api/ai/`:

| Route | Model | Input | Output | Used By |
|-------|-------|-------|--------|---------|
| `/chat` | Sonnet | messages[] | UI message stream | ChatWidget |
| `/search` | Haiku | query string | structured JSON | AISearchBar |
| `/protocol` | Sonnet | goals, experience | text stream | ProtocolGenerator |
| `/optimize` | Sonnet | peptideIds[] | structured JSON | StackAnalysisPanel |
| `/explain` | Sonnet | peptideId, level | text stream | MechanismExplainer |
| `/predict` | Haiku | peptideIds[], level | text stream | WhatToExpect, RegionSuggestion |
| `/compare` | Sonnet | peptideIds[] | text stream | ComparisonInsights |

All prompts are in `src/lib/ai/prompts.ts`. Each includes the full peptide database (~15-20K tokens) in the system prompt. Structured output uses Zod schemas in `src/lib/ai/schemas.ts`.

### Body Map SVG

The body silhouette uses polygon data from `react-body-highlighter` (viewBox `0 0 100 210`). Interactive markers are positioned at organ coordinates defined in `src/data/body-regions.ts`. Marker rendering is in `src/components/body/body-region.tsx` — glowing dots with hover/selection states.

### State Management

5 Zustand stores, each focused on one concern:
- `useBodyStore` — body region hover/selection/pathways
- `usePeptideStore` — peptide search/filter/selection
- `useStackStore` — stack builder (preset + custom)
- `useCompareStore` — comparison selections (max 4)
- `useChatStore` — global chat widget open/prefill state

### Blog System

MDX files in `content/blog/` with YAML frontmatter. Parsed by `src/lib/blog.ts` using `gray-matter` + `reading-time`. Rendered server-side via `next-mdx-remote/rsc`. Custom MDX components in `src/components/blog/mdx-components.tsx`.

## Design System

**Theme:** All dark. Background `#0a0e17`, surfaces `#111827`/`#1a1f2e`.
**Accents:** Neon cyan `#00d4ff`, green `#00ff88`, orange `#ff6b35`, purple `#a855f7`.
**Patterns:** Glass-morphism panels (`.glass`, `.glass-bright`), grid dot backgrounds (`.grid-bg`), glow effects.
**Font:** Inter (Google Fonts).
**CSS:** Tailwind v4 with `@theme inline` custom properties in `globals.css`.

## Common Tasks

### Add a new peptide
1. Add entry to `src/data/peptides.ts` following the `Peptide` interface
2. Map to body regions via `affectedRegions` with intensity 1-5
3. Add to relevant stacks in `src/data/stacks.ts`
4. Update `src/data/effects.ts` if the peptide introduces new effects

### Add a blog post
1. Create `content/blog/your-slug.mdx` with frontmatter (title, date, category, excerpt, author, tags)
2. It will automatically appear on `/learn` and generate a static page at `/learn/your-slug`

### Add an AI feature
1. Create API route in `src/app/api/ai/` using `streamText` or `generateObject`
2. Add system prompt in `src/lib/ai/prompts.ts`
3. If structured output, add Zod schema in `src/lib/ai/schemas.ts`
4. Create UI component in `src/components/ai/`
5. For streaming: use `useStreamingText` hook + `StreamingText` component
6. For JSON: use `fetch` + `useState`

### Deploy
Push to `main` branch → Amplify auto-builds. Ensure `npx tsc --noEmit` passes before pushing.

Set `ANTHROPIC_API_KEY` in Amplify environment variables for AI features.

## Build Commands

```bash
npm run dev       # Development server
npm run build     # Production build (Amplify uses this)
npm run lint      # ESLint
npx tsc --noEmit  # Type check
```

## Data Counts

- 31 peptides across 8 categories
- 10 pre-built stacks
- 27 effect categories across 7 groups
- 13 interactive body regions
- 21 glossary terms
- 15 FAQ items across 4 categories
- 5 blog articles
- 7 AI API endpoints
- 49 React components

## GitHub

- Repo: https://github.com/jonmohon/peptide-atlas
- Account: jonmohon
- Deploy: AWS Amplify (auto-deploy on push to main)

## Important Notes

- AI SDK v6 breaking changes: `maxOutputTokens` (not maxTokens), `toTextStreamResponse`/`toUIMessageStreamResponse` (not toDataStreamResponse), `sendMessage({ text })` (not handleSubmit), `DefaultChatTransport` (not api option)
- The `(atlas)` layout applies `overflow-hidden` locally — do NOT add it to globals.css or root layout
- Old URLs (/peptides, /stacks, etc.) have permanent redirects to /atlas/* in next.config.ts
- Body SVG viewBox is `0 0 100 210` — marker positions in body-regions.ts use this coordinate system
