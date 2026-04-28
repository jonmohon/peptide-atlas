# Architecture Overview

PeptideAtlas is a peptide education platform served at **`https://peptideatlas.ai`**. The web client is Next.js 16 deployed on AWS Amplify; a parallel React Native (Expo) mobile app at `mobile/` shares the same Cognito User Pool, AppSync schema, and AI route handlers. Users explore how peptides affect the body through a visual atlas, build stacks, compare peptides, log a daily journal, track bloodwork, and get AI-powered recommendations through a multi-stage Opus 4.7 pipeline (see [`AI-FEATURES.md`](./AI-FEATURES.md)).

**Two clients, one backend:**
- **Web** (`src/`) — Next.js 16 SSR on Amplify Hosting; cookie-based Cognito auth via the Amplify adapter.
- **Mobile** (`mobile/`) — Expo SDK 54, expo-router 6, NativeWind 4. Bearer-token auth against the same Cognito User Pool. See [`mobile.md`](./mobile.md).

Both clients hit the same `https://peptideatlas.ai/api/ai/*` endpoints; `auth(req)` accepts cookies (web) or `Authorization: Bearer <ID token>` (mobile).

## System Diagram

```
                         +---------------------------+
                         |      AWS Amplify CDN       |
                         |   (auto-deploy from main)  |
                         +-------------+-------------+
                                       |
                         +-------------v-------------+
                         |     Next.js 16 Server      |
                         |   (standalone output mode)  |
                         +---+---+---+---+---+---+---+
                             |   |   |   |   |   |
              +--------------+   |   |   |   |   +--------------+
              |                  |   |   |   |                  |
    +---------v---------+  +----v---v---v----+  +---------------v--+
    |  (marketing)      |  |   API Routes    |  |    (atlas)       |
    |  Route Group      |  |                 |  |  Route Group     |
    |                   |  | /api/ai/*       |  |                  |
    | /                 |  |  10 endpoints   |  | /atlas (dash.)   |
    | /learn            |  |                 |  | /atlas/body-map  |
    | /learn/[slug]     |  | /api/stripe/*   |  | /atlas/peptides  |
    | /about            |  |  checkout       |  | /atlas/stacks    |
    | /glossary         |  |  webhook        |  | /atlas/effects   |
    | /faq              |  |                 |  | /atlas/compare   |
    | /privacy          |  | /api/user/*     |  | /atlas/protocol- |
    | /terms            |  |  tier           |  |   generator      |
    | /pricing          |  |                 |  | /atlas/journal/* |
    +---------+---------+  +--------+--------+  | /atlas/notes     |
              |                     |           | /atlas/profile   |
              |                     |           +--------+---------+
              |            +--------v--------+           |
              |            | Anthropic API   |           |
              |            | (Claude Sonnet  |           |
              |            |  & Haiku)       |           |
              |            +-----------------+           |
              |                                          |
              |            +----------------+            |
              |            | Stripe API     |            |
              |            | (checkout,     |            |
              |            |  webhooks)     |            |
              |            +----------------+            |
              |                                          |
    +---------v---------+  +----------------+  +---------v---------+
    | MarketingHeader   |  | AWS Cognito    |  | AtlasHeader       |
    | + Footer          |  | (Auth)         |  | (no footer, full  |
    | (scrollable)      |  +-------+--------+  |  screen, overflow-|
    +-------------------+          |           |  hidden)          |
                                   v           +-------------------+
                         +---------+----------+
                         | AWS AppSync        |
                         | (GraphQL API)      |
                         +--------+-----------+
                                  |
                         +--------v-----------+
                         | AWS DynamoDB       |
                         | UserProfile        |
                         | JournalEntry       |
                         | BloodworkPanel     |
                         | SavedStack         |
                         | SavedProtocol      |
                         | AiUsage            |
                         | UserNote           |
                         | AiConversation     |
                         +--------------------+
              |                                           |
              +----------------+   +----------------------+
                               |   |
                     +---------v---v---------+
                     |   Shared Services     |
                     |                       |
                     | 6 Zustand Stores      |
                     | 5 Custom Hooks        |
                     | Static Data Layer     |
                     |   (peptides, stacks,  |
                     |    effects, regions,  |
                     |    pathways, etc.)    |
                     | ChatWidget (global)   |
                     +-----------------------+
```

## Route Groups

Next.js route groups use parenthesized folder names to organize routes without affecting the URL path. PeptideAtlas uses two groups:

### `(marketing)` -- Content Pages

| Route | Purpose |
|-------|---------|
| `/` | Landing page with hero, features, how-it-works, CTA |
| `/learn` | Blog index with search and category filtering |
| `/learn/[slug]` | Individual blog post (MDX rendered) |
| `/about` | About the platform |
| `/glossary` | Searchable peptide glossary |
| `/faq` | Categorized FAQ accordion |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |
| `/pricing` | Subscription pricing page (Free / Pro / Elite tiers) |

**Layout:** `MarketingHeader` + scrollable `<main>` + `Footer`. Standard content page pattern.

### Auth Pages (outside route groups)

| Route | Purpose |
|-------|---------|
| `/auth/signin` | Cognito-backed sign-in page |
| `/auth/verify` | Email verification / confirm code page |

### `(atlas)` -- Interactive Tool

| Route | Purpose |
|-------|---------|
| `/atlas` | Dashboard: today's log status, streak, quick actions, explore cards |
| `/atlas/body-map` | Interactive body map with region markers |
| `/atlas/peptides` | Peptide database browser with search/filter |
| `/atlas/peptides/[slug]` | Individual peptide detail page |
| `/atlas/stacks` | Pre-built stacks and custom stack builder |
| `/atlas/effects` | Effects browser organized by category |
| `/atlas/compare` | Side-by-side peptide comparison (up to 4) |
| `/atlas/protocol-generator` | AI-powered protocol generation |
| `/atlas/journal` | Journal calendar overview |
| `/atlas/journal/[date]` | Daily journal entry form (dynamic) |
| `/atlas/journal/insights` | AI-generated trend analysis of journal data |
| `/atlas/journal/bloodwork` | Bloodwork panel upload + AI interpretation |
| `/atlas/notes` | User notes attached to peptides and stacks |
| `/atlas/profile` | User profile: goals, health conditions, tier |
| `/atlas/tools` | Tools hub page |
| `/atlas/tools/reconstitution` | Reconstitution calculator with SVG syringe visual |

**Layout:** Collapsible sidebar + slim `AtlasHeader` + full-screen `<main>` with `overflow-hidden`. No footer. Designed for tool-like interaction.

**Sidebar groups:**
- **Explore:** Dashboard, Body Map, Peptides, Stacks, Effects, Compare, Protocol Generator
- **My Data:** Journal, Bloodwork, AI Insights, Notes
- **Tools:** Reconstitution Calc, All Tools

**AtlasHeader:** Logo, AI search bar, and user menu only. No navigation pills.

### Shared Root Layout

Both groups share the root layout at `src/app/layout.tsx`, which provides:
- Inter font loading via `next/font/google`
- Global CSS import
- `<html>` and `<body>` tags with dark theme classes
- `ChatWidget` component (floating AI chat, available on every page)

## Component Hierarchy

```
RootLayout
  ├── ChatWidget (global, floating)
  ├── (marketing)/layout
  │     ├── MarketingHeader
  │     ├── <main> (scrollable)
  │     │     └── [page content]
  │     └── Footer
  └── (atlas)/layout
        ├── AtlasHeader (logo, AI search bar, user menu)
        ├── CollapsibleSidebar (3 groups: Explore, My Data, Tools)
        └── <main> (overflow-auto, flex-1)
              └── [page content]
```

## State Management

The app uses 6 Zustand stores, each focused on a single concern. All stores are client-side only.

| Store | File | Purpose | Key State |
|-------|------|---------|-----------|
| `useBodyStore` | `src/stores/use-body-store.ts` | Body map interaction state | `hoveredRegion`, `selectedRegion`, `highlightedRegions` (Map), `showPathways`, `activePathwayPeptideId` |
| `usePeptideStore` | `src/stores/use-peptide-store.ts` | Peptide browsing/filtering | `selectedPeptideId`, `searchQuery`, `activeCategory`, `activeEffects[]` |
| `useStackStore` | `src/stores/use-stack-store.ts` | Stack builder (preset + custom) | `activePresetStackId`, `customStackPeptideIds[]` (max 5) |
| `useCompareStore` | `src/stores/use-compare-store.ts` | Comparison tool selections | `selectedPeptideIds[]` (max 4), `activeAxes[]` (6 rating dimensions) |
| `useChatStore` | `src/stores/use-chat-store.ts` | Global chat widget state | `isOpen`, `prefillText` |
| `useJournalStore` | `src/stores/use-journal-store.ts` | Journal UI state | `selectedDate`, `currentEntry`, `calendarDays[]`, draft entry fields |

**Design principles:**
- Stores are minimal -- each manages one feature's state
- No persistence (state resets on page reload)
- `useStackStore` and `useCompareStore` enforce maximum selection limits via constants (`MAX_STACK_SIZE=5`, `MAX_COMPARE_SIZE=4`)
- `useChatStore.openWithText()` allows other components to open the chat with pre-filled text

## Data Flow

### Static Data Layer

All peptide data is defined as TypeScript constants in `src/data/`:

```
src/data/
  ├── peptides.ts      31 peptides with full details
  ├── stacks.ts        10 pre-built stacks referencing peptide IDs
  ├── effects.ts       27 effects referencing peptide IDs and region IDs
  ├── body-regions.ts  13 body regions with positions and metadata
  ├── pathways.ts      Pathway definitions for body map animations
  ├── categories.ts    Category metadata
  ├── glossary.ts      21 glossary term definitions
  └── faq.ts           15 FAQ items across 4 categories
```

**Data relationships:**
- Peptides reference body regions via `affectedRegions[].regionId`
- Stacks reference peptides via `peptides[].peptideId`
- Effects reference peptides via `relatedPeptideIds[]` and regions via `primaryRegions[]`
- Body regions reference effects via `relatedEffects[]`

### Data Flow: Peptide Selection

```
User clicks body region marker
  → useBodyStore.selectRegion()
  → BodyMapView filters peptides by region
  → Displays PeptideCard list in SidebarPanel
  → User clicks PeptideCard
  → usePeptideStore.selectPeptide()
  → Body map highlights peptide's affected regions
  → SidebarPanel shows peptide detail (dosing, timeline, effects)
```

## AI System Architecture

See [AI-FEATURES.md](./AI-FEATURES.md) for full details.

**Summary:**
- 10 API routes at `/api/ai/*` using `@ai-sdk/anthropic` + Vercel AI SDK v6
- System prompts in `src/lib/ai/prompts.ts` with BASE prompt containing full peptide database
- All routes inject personalized user context via `buildUserContext()` in `src/lib/ai/user-context.ts`
- Rate limiting tracked in `AiUsage` DynamoDB model via `src/lib/ai/rate-limit.ts`
- Structured output via Zod schemas in `src/lib/ai/schemas.ts`
- Client-side caching in `src/lib/ai/cache.ts` (sessionStorage, 30min TTL)
- Two consumption patterns: streaming text (`useStreamingText` hook) and structured JSON (`generateObject` + `fetch`)

## Blog System

See [BLOG-SYSTEM.md](./BLOG-SYSTEM.md) for full details.

**Summary:**
- MDX files in `content/blog/` with YAML frontmatter
- Parsed by `gray-matter` + `reading-time`
- Rendered server-side via `next-mdx-remote/rsc`
- Custom MDX components (Callout, PeptideLink, styled headings/code/tables)
- Blog index at `/learn` with category filtering

## Build and Deploy Pipeline

```
Developer pushes to main
  → GitHub webhook triggers AWS Amplify build
  → Amplify runs amplify.yml:
      preBuild: npm ci --cache .npm --prefer-offline
      build:    npm run build
  → Artifacts: .next directory
  → Cache: .next/cache, .npm, node_modules
  → Deploy to Amplify CDN
```

**Key configuration:**
- `next.config.ts`: `output: "standalone"` for Amplify compatibility
- `ANTHROPIC_API_KEY` must be set in Amplify environment variables
- Old URLs (`/peptides`, `/stacks`, etc.) have permanent redirects to `/atlas/*`

## Tech Stack (Backend)

| Service | Purpose |
|---------|---------|
| AWS Amplify Gen 2 | CI/CD hosting + backend orchestration |
| AWS Cognito | User authentication (email/password) |
| AWS AppSync | GraphQL API layer in front of DynamoDB |
| AWS DynamoDB | NoSQL user data storage (via Amplify Data) |
| Stripe | Subscription billing (checkout sessions + webhooks) |

**Amplify backend source:** `amplify/` directory at repo root.
- `amplify/auth/resource.ts` — Cognito configuration
- `amplify/data/resource.ts` — DynamoDB model definitions (10 models)
- `amplify/backend.ts` — Combines auth + data resources

## Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 16.2.2 | Framework |
| `react` | 19.2.4 | UI library |
| `ai` | ^6.0.149 | Vercel AI SDK (streaming, structured output) |
| `@ai-sdk/anthropic` | ^3.0.67 | Claude model provider |
| `@ai-sdk/react` | ^3.0.151 | React hooks for AI (useChat) |
| `aws-amplify` | ^6 | Amplify client (auth, data) |
| `@aws-amplify/adapter-nextjs` | ^1 | Server-side Amplify context for Next.js |
| `stripe` | ^17 | Stripe Node.js SDK |
| `zustand` | ^5 | State management |
| `framer-motion` | ^12 | Animations |
| `gsap` | ^3 | Pathway animations on body map |
| `next-mdx-remote` | ^6.0.0 | Server-side MDX rendering |
| `gray-matter` | ^4.0.3 | Frontmatter parsing |
| `recharts` | ^2 | Charts for comparison view and journal trends |
| `react-body-highlighter` | ^2.0.5 | Body silhouette polygon data |
| `tailwindcss` | ^4 | Styling |
