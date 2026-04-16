# CLAUDE.md — PeptideAtlas

## Documentation

**Always check `README.md` first** — it contains the documentation index with links to all detailed docs in `/docs`.

Before implementing or modifying features, **read the relevant doc**:

| Area | Doc |
|------|-----|
| Architecture & tech stack | `docs/architecture.md` |
| Data models (Amplify Data / DynamoDB) | `docs/database.md` |
| AI system (prompts, schemas, endpoints) | `docs/ai-system.md` |
| Auth & payments (Cognito, Stripe) | `docs/auth-and-payments.md` |
| Journal & tracking system | `docs/journal.md` |
| Tools (reconstitution calc, cycle planner) | `docs/tools.md` |
| Body map & visualization | `docs/body-map.md` |
| Blog & content system | `docs/blog.md` |
| Getting started | `docs/getting-started.md` |

## Architecture Overview

```
User → Cognito Auth → UserProfile (DynamoDB)
  ├── JournalEntry (daily tracking)
  ├── BloodworkPanel (lab results)
  ├── SavedStack / SavedProtocol (saved work)
  ├── AiUsage (rate limiting)
  ├── UserNote (attached to peptides/stacks)
  └── AiConversation (AI memory)
```

- **User**: Cognito identity. One user owns all their data via `allow.owner()`.
- **UserProfile**: Goals, health conditions, tier — injected into every AI prompt for personalization.
- **JournalEntry**: Daily doses, weight, mood, energy, sleep, side effects. The retention anchor.
- **AI endpoints**: 7+ Claude API routes. All read user context from UserProfile + recent journal data.

## Critical Rules

### 1. ALWAYS scope data with owner auth

Every Amplify Data model uses `allow.owner()`. Never create a model without it. Never query another user's data.

```typescript
// CORRECT — amplify/data/resource.ts
SavedStack: a.model({ ... })
  .authorization((allow) => [allow.owner()])

// WRONG — data leaks across users
SavedStack: a.model({ ... })
  .authorization((allow) => [allow.authenticated()])
```

### 2. ALWAYS use AI SDK v6 patterns

The project uses AI SDK v6 which has breaking changes from v5.

```typescript
// CORRECT
streamText({ model, system, messages, maxOutputTokens: 1024 })
return result.toTextStreamResponse()

// WRONG — v5 API, will fail at runtime
streamText({ model, system, messages, maxTokens: 1024 })
return result.toDataStreamResponse()
```

### 3. NEVER add overflow-hidden to root layout or globals.css

The `(atlas)` layout applies `overflow-hidden` locally. Adding it globally breaks scrolling on marketing pages.

### 4. ALWAYS inject user context into AI prompts for authenticated users

```typescript
// CORRECT — personalized AI
const userContext = session?.user?.id
  ? await buildUserContext(session.user.id)
  : '';
const system = `${BASE_SYSTEM_PROMPT}\n\n${userContext}\n\n${ENDPOINT_PROMPT}`;

// WRONG — generic AI, no personalization
const system = `${BASE_SYSTEM_PROMPT}\n\n${ENDPOINT_PROMPT}`;
```

### 5. ALWAYS use glass panels for new UI components

All surfaces use the glass-morphism design system. Never use solid background colors.

```tsx
// CORRECT
<div className="glass rounded-xl p-5">

// WRONG — breaks visual consistency
<div className="bg-gray-800 rounded-xl p-5">
```

### 6. NEVER put secrets in amplify_outputs.json or NEXT_PUBLIC_ env vars

`amplify_outputs.json` is committed to git. `NEXT_PUBLIC_` vars are exposed to the browser. Secrets go in `.env.local` (gitignored) or Amplify environment variables.

### 7. ALWAYS check tier before premium features

```typescript
// CORRECT — server-side
const session = await auth();
if (session?.user?.tier === 'FREE') {
  return NextResponse.json({ error: 'Upgrade required' }, { status: 403 });
}

// CORRECT — client-side
<PremiumGate feature="bloodwork_tracker">
  <BloodworkUpload />
</PremiumGate>
```

## Common Commands

```bash
npm run dev                        # Dev server on port 3000
npm run build                      # Production build (must pass for Amplify)
npx tsc --noEmit                   # Type check
npm run lint                       # ESLint
npx ampx sandbox --profile nexvato # Amplify sandbox (deploys Cognito + DynamoDB + AppSync)
npx ampx sandbox --once            # Deploy sandbox once (no watch mode)
npx ampx generate outputs          # Regenerate amplify_outputs.json
```

## Don'ts

- Don't use `maxTokens` — use `maxOutputTokens` (AI SDK v6)
- Don't use `toDataStreamResponse` — use `toTextStreamResponse` or `toUIMessageStreamResponse`
- Don't hardcode colors — use theme tokens (`neon-cyan`, `neon-green`, `neon-orange`, `text-secondary`)
- Don't add `overflow-hidden` to root layout — only `(atlas)` layout uses it
- Don't commit `.env.local` or `amplify_outputs.json` (both are gitignored)
- Don't create Amplify Data models without `.authorization((allow) => [allow.owner()])`
- Don't import from `aws-amplify` in server components — use `aws-amplify/auth/server` with `runWithAmplifyServerContext`
- Don't skip the medical disclaimer on AI health features — every AI response about peptides needs one
- Don't use Prisma or PostgreSQL — all data goes through Amplify Data (DynamoDB via AppSync)
- Don't skip `npx tsc --noEmit` before pushing — Amplify build will fail on type errors

## Subsystem Gotchas

### Amplify Data (AppSync/DynamoDB)
No relational joins. All queries are single-table lookups by owner + optional secondary index. If you need data from two models, make two queries client-side. `a.json()` fields are opaque to DynamoDB — you cannot query inside them. → `docs/database.md`

### AI System
Every AI prompt includes the full peptide database (~15-20K tokens) in the system prompt. Adding user context adds ~1-2K more. Stay under 4K tokens for user context to leave room for conversation. All prompts live in `src/lib/ai/prompts.ts` — never inline prompts in route files. → `docs/ai-system.md`

### Body Map SVG
ViewBox is `0 0 100 210`. Marker positions in `body-regions.ts` use this coordinate system. The polygons come from `react-body-highlighter` — don't modify them directly. → `docs/body-map.md`

### Auth (Cognito)
`auth()` returns the Cognito user but does NOT fetch tier from DynamoDB. Tier is fetched separately via `/api/user/tier` or `buildUserContext()`. Client-side auth uses `getCurrentUser()` from `aws-amplify/auth`. Server-side uses `runWithAmplifyServerContext` with `cookies`. → `docs/auth-and-payments.md`

### Two Route Groups
`(marketing)/` has a scrollable layout with MarketingHeader + Footer. `(atlas)/` has a full-screen layout with AtlasHeader and `overflow-hidden`. Never mix components between layouts without checking scroll behavior. → `docs/architecture.md`

### Journal System
Journal entries use `a.json()` for peptideDoses, sideEffects, and measurements because the structure varies per user. The "copy from yesterday" feature fetches the previous day's entry and pre-fills the form. Trend charts use recharts. → `docs/journal.md`

## GitHub & Deploy

- Repo: https://github.com/jonmohon/peptide-atlas
- Deploy: AWS Amplify (us-east-2, nexvato profile, app ID: `d3p5rtdaradk56`)
- Push to `main` → Amplify auto-builds backend (Cognito + DynamoDB) + frontend (Next.js SSR)
- Amplify IAM role: `AmplifyBackendDeployRole-peptide-atlas` with `AdministratorAccess-Amplify`
