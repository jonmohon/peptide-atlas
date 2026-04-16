# Routing

PeptideAtlas uses Next.js 16 App Router with two route groups plus auth pages, 16 API routes, dynamic routes, permanent redirects, and SEO files.

## Route Group Architecture

Next.js route groups use parenthesized folder names (`(marketing)`, `(atlas)`) to organize routes without affecting the URL path. Each group has its own layout, allowing different page structures.

```
src/app/
  ├── layout.tsx              Root layout (shared)
  ├── globals.css             Global styles
  ├── robots.ts               robots.txt generation
  ├── sitemap.ts              sitemap.xml generation
  ├── auth/                   Auth pages (outside route groups)
  │     ├── signin/           Sign-in page
  │     └── verify/           Email verification page
  ├── (marketing)/            Content pages group
  │     ├── layout.tsx        MarketingHeader + Footer
  │     └── ...pages
  └── (atlas)/                Interactive tool group
        ├── layout.tsx        AtlasHeader, full-screen
        └── ...pages
```

## Layout Nesting

```
root layout (src/app/layout.tsx)
  │
  ├── Provides: <html>, <body>, Inter font, globals.css, ChatWidget
  │
  ├── (marketing) layout (src/app/(marketing)/layout.tsx)
  │     │
  │     ├── Provides: MarketingHeader, Footer, scrollable <main>
  │     └── Structure: flex-col min-h-screen
  │
  └── (atlas) layout (src/app/(atlas)/layout.tsx)
        │
        ├── Provides: AtlasHeader, overflow-hidden <main>
        └── Structure: flex-col h-screen overflow-hidden
```

The root layout renders `ChatWidget` globally -- it appears as a floating button on both marketing and atlas pages.

## Complete Route Table

### Auth Routes

| URL Path | Page File | Purpose | Dynamic? |
|----------|-----------|---------|----------|
| `/auth/signin` | `auth/signin/page.tsx` | Cognito-backed sign-in page | No |
| `/auth/verify` | `auth/verify/page.tsx` | Email verification / confirm code | No |

### Marketing Routes (Scrollable Content Pages)

| URL Path | Page File | Purpose | Dynamic? |
|----------|-----------|---------|----------|
| `/` | `(marketing)/page.tsx` | Landing page (hero, features, how-it-works, CTA) | No |
| `/learn` | `(marketing)/learn/page.tsx` | Blog index with search and category filtering | No |
| `/learn/[slug]` | `(marketing)/learn/[slug]/page.tsx` | Individual blog post (MDX rendered) | Yes |
| `/about` | `(marketing)/about/page.tsx` | About the platform | No |
| `/glossary` | `(marketing)/glossary/page.tsx` | Searchable peptide glossary | No |
| `/faq` | `(marketing)/faq/page.tsx` | Categorized FAQ accordion | No |
| `/privacy` | `(marketing)/privacy/page.tsx` | Privacy policy | No |
| `/terms` | `(marketing)/terms/page.tsx` | Terms of service | No |
| `/pricing` | `(marketing)/pricing/page.tsx` | Subscription pricing page (Free / Pro / Elite) | No |

### Atlas Routes (Full-Screen Interactive Tool)

| URL Path | Page File | Purpose | Dynamic? |
|----------|-----------|---------|----------|
| `/atlas` | `(atlas)/atlas/page.tsx` | Interactive body map with region markers | No |
| `/atlas/peptides` | `(atlas)/atlas/peptides/page.tsx` | Peptide database browser with search/filter | No |
| `/atlas/peptides/[slug]` | `(atlas)/atlas/peptides/[slug]/page.tsx` | Individual peptide detail page | Yes |
| `/atlas/stacks` | `(atlas)/atlas/stacks/page.tsx` | Pre-built stacks and custom stack builder | No |
| `/atlas/effects` | `(atlas)/atlas/effects/page.tsx` | Effects browser organized by category | No |
| `/atlas/compare` | `(atlas)/atlas/compare/page.tsx` | Side-by-side peptide comparison (up to 4) | No |
| `/atlas/protocol-generator` | `(atlas)/atlas/protocol-generator/page.tsx` | AI-powered protocol generation | No |
| `/atlas/journal` | `(atlas)/atlas/journal/page.tsx` | Journal calendar overview | No |
| `/atlas/journal/[date]` | `(atlas)/atlas/journal/[date]/page.tsx` | Daily journal entry form | Yes |
| `/atlas/journal/insights` | `(atlas)/atlas/journal/insights/page.tsx` | AI-generated trend analysis of journal data | No |
| `/atlas/journal/bloodwork` | `(atlas)/atlas/journal/bloodwork/page.tsx` | Bloodwork panel upload + AI interpretation | No |
| `/atlas/notes` | `(atlas)/atlas/notes/page.tsx` | User notes attached to peptides and stacks | No |
| `/atlas/profile` | `(atlas)/atlas/profile/page.tsx` | User profile: goals, conditions, tier | No |
| `/atlas/tools` | `(atlas)/atlas/tools/page.tsx` | Tools hub page | No |
| `/atlas/tools/reconstitution` | `(atlas)/atlas/tools/reconstitution/page.tsx` | Reconstitution calculator with SVG syringe visual | No |

### API Routes

#### AI Routes (`/api/ai/*`)

| URL Path | File | Method | Purpose |
|----------|------|--------|---------|
| `/api/ai/chat` | `api/ai/chat/route.ts` | POST | Conversational AI chat (streams UI messages) |
| `/api/ai/search` | `api/ai/search/route.ts` | POST | Natural language peptide search (returns JSON) |
| `/api/ai/explain` | `api/ai/explain/route.ts` | POST | Mechanism of action explanation (streams text) |
| `/api/ai/protocol` | `api/ai/protocol/route.ts` | POST | Protocol generation (streams text) |
| `/api/ai/optimize` | `api/ai/optimize/route.ts` | POST | Stack analysis/optimization (returns JSON) |
| `/api/ai/predict` | `api/ai/predict/route.ts` | POST | What-to-expect predictions (streams text) |
| `/api/ai/compare` | `api/ai/compare/route.ts` | POST | Peptide comparison insights (streams text) |
| `/api/ai/protocol-chat` | `api/ai/protocol-chat/route.ts` | POST | Protocol advisor chat using journal + bloodwork context (streams UI messages) |
| `/api/ai/journal-insight` | `api/ai/journal-insight/route.ts` | POST | AI trend analysis of journal entries (streams text) |
| `/api/ai/bloodwork` | `api/ai/bloodwork/route.ts` | POST | Bloodwork marker interpretation correlated with user's protocol (streams text) |

#### Stripe Routes (`/api/stripe/*`)

| URL Path | File | Method | Purpose |
|----------|------|--------|---------|
| `/api/stripe/checkout` | `api/stripe/checkout/route.ts` | POST | Create Stripe checkout session for Pro/Elite upgrade |
| `/api/stripe/webhook` | `api/stripe/webhook/route.ts` | POST | Handle Stripe webhook events (subscription created/updated/cancelled) |

#### User Routes (`/api/user/*`)

| URL Path | File | Method | Purpose |
|----------|------|--------|---------|
| `/api/user/tier` | `api/user/tier/route.ts` | GET | Fetch the authenticated user's subscription tier from DynamoDB |

## Dynamic Routes

### `/learn/[slug]`

Blog post pages. The `slug` parameter matches the MDX filename in `content/blog/` (without the `.mdx` extension).

**Example:** `content/blog/bpc-157-complete-guide.mdx` renders at `/learn/bpc-157-complete-guide`

### `/atlas/peptides/[slug]`

Individual peptide detail pages. The `slug` parameter matches the peptide's `slug` field from `src/data/peptides.ts`.

**Example:** A peptide with `slug: "bpc-157"` renders at `/atlas/peptides/bpc-157`

### `/atlas/journal/[date]`

Daily journal entry form. The `date` parameter is an ISO-8601 date string (`YYYY-MM-DD`).

**Example:** The journal entry for April 15 2026 renders at `/atlas/journal/2026-04-15`

The page fetches the existing `JournalEntry` for that date (if any) from DynamoDB and pre-fills the form. If no entry exists, an empty form is shown. The "copy from yesterday" button fetches the previous day's entry and pre-fills peptide doses.

## Redirects

Permanent redirects (301) are configured in `next.config.ts` for old URL patterns that existed before the `/atlas/` prefix was added:

| Old URL | New URL |
|---------|---------|
| `/peptides` | `/atlas/peptides` |
| `/peptides/:slug` | `/atlas/peptides/:slug` |
| `/stacks` | `/atlas/stacks` |
| `/effects` | `/atlas/effects` |
| `/compare` | `/atlas/compare` |
| `/protocol-generator` | `/atlas/protocol-generator` |

## SEO

### `sitemap.ts`

**File:** `src/app/sitemap.ts`

Generates `sitemap.xml` dynamically at build time. Includes:
- All static marketing pages (8 URLs)
- All peptide detail pages (31 URLs from `src/data/peptides.ts`)
- All blog post pages (from `content/blog/`)
- Atlas root page

**Base URL:** `https://peptideatlas.com`

### `robots.ts`

**File:** `src/app/robots.ts`

Generates `robots.txt`:
```
User-Agent: *
Allow: /
Sitemap: https://peptideatlas.com/sitemap.xml
```

### Metadata

The root layout defines default metadata:
- **Title template:** `%s | PeptideAtlas` (pages provide their own title, which gets the suffix)
- **Default title:** `PeptideAtlas - Interactive Peptide Education Platform`
- **Description:** Platform description for search engines
- **Keywords:** peptides, peptide guide, BPC-157, etc.

Individual pages override metadata as needed via the `metadata` export or `generateMetadata` function.

## How Route Groups Share Root Layout

Both `(marketing)` and `(atlas)` groups are rendered as children of the root layout. The root layout provides:

1. `<html>` tag with Inter font variable and `h-full` class
2. `<body>` tag with dark theme classes (`bg-background text-foreground`)
3. `ChatWidget` component (always rendered, floating)

Each group layout then wraps its pages with its own header and content structure. This means:
- Marketing pages get `MarketingHeader` + `Footer` + scrollable content
- Atlas pages get `AtlasHeader` + full-screen content + no footer
- Both have the floating `ChatWidget` available

The key difference: the atlas layout applies `h-screen overflow-hidden` to its wrapper div, creating a contained full-screen tool experience, while the marketing layout uses `min-h-screen` to allow natural scrolling.
