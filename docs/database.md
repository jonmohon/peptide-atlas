# Database & Data Models

All user data is stored in DynamoDB via Amplify Data (AppSync GraphQL). Static reference data (peptides, stacks, effects) lives in TypeScript files.

**Related Documentation:**
- [Architecture](ARCHITECTURE.md) - System design and tech stack
- [AI System](AI-FEATURES.md) - How AI endpoints query user data
- [Auth & Payments](auth-and-payments.md) - Cognito user identity and Stripe
- [Journal](journal.md) - Journal-specific models and patterns

---

> Status: IMPLEMENTED — Last updated: 2026-04-14

## Overview

PeptideAtlas has two data layers:

1. **Static data** (`src/data/`) — 31 peptides, 10 stacks, 27 effects, 13 body regions. Read-only, imported directly.
2. **User data** (`amplify/data/resource.ts`) — DynamoDB tables via AppSync. Owner-scoped, CRUD via GraphQL.

```
Static Data (TypeScript)          User Data (DynamoDB via AppSync)
├── peptides.ts (31 peptides)     ├── UserProfile (tier, goals, health)
├── stacks.ts (10 stacks)        ├── JournalEntry (daily tracking)
├── effects.ts (27 effects)      ├── BloodworkPanel (lab results)
├── body-regions.ts (13 regions)  ├── SavedStack (custom stacks)
├── reconstitution.ts (29 entries)├── SavedProtocol (AI protocols)
└── glossary/faq data             ├── AiUsage (rate limiting)
                                  ├── UserNote (attached notes)
                                  ├── AiConversation (chat memory)
                                  └── AiInsightReport (weekly/monthly)
```

## Amplify Data Models

Defined in `amplify/data/resource.ts`. All models use `allow.owner()` authorization.

### UserProfile
The central user record. Extended with AI context fields for personalization.

| Field | Type | Purpose |
|-------|------|---------|
| email | AWSEmail (required) | From Cognito |
| name | String | Display name |
| tier | Enum: FREE/PRO/PRO_PLUS | Subscription tier |
| goals | String[] | Health goals for AI context |
| experienceLevel | String | beginner/intermediate/advanced |
| currentProtocolSummary | String | Free-text protocol summary |
| healthConditions | String[] | For AI context |
| allergies | String[] | For AI context |
| weight | Float | For AI context + journal baseline |
| heightCm | Float | For AI context |
| age | Integer | For AI context |
| sex | String | For AI context |
| stripeCustomerId | String | Stripe integration |
| stripeSubscriptionId | String | Stripe integration |
| stripeStatus | String | active/canceled/past_due |

Index: `email`

### JournalEntry
Daily tracking — the retention anchor.

| Field | Type | Purpose |
|-------|------|---------|
| date | AWSDate (required) | Entry date |
| peptideDoses | JSON | Array of {peptideId, dose, unit, route, site, time} |
| weight | Float | Body weight |
| bodyFat | Float | Body fat percentage |
| measurements | JSON | {waist, chest, arms, thighs, etc.} |
| dietNotes | String | Free-text diet log |
| sideEffects | JSON | Array of {name, severity 1-5} |
| mood | Integer | 1-10 scale |
| energy | Integer | 1-10 scale |
| sleepHours | Float | Hours slept |
| sleepQuality | Integer | 1-10 scale |
| subjectiveNotes | String | Free-text notes |
| tags | String[] | User-defined tags |

Index: `date`

### BloodworkPanel
Lab results — uploaded or manually entered.

| Field | Type | Purpose |
|-------|------|---------|
| date | AWSDate (required) | Lab date |
| labName | String | Lab provider |
| markers | JSON (required) | Array of {name, value, unit, referenceRange, flag} |
| s3Key | String | Uploaded PDF/image path in S3 |
| aiInterpretation | String | Cached AI analysis |
| parsedByAi | Boolean | Whether markers were AI-extracted |
| notes | String | User notes |

Index: `date`

### SavedStack, SavedProtocol, AiUsage, UserNote, AiConversation, AiInsightReport
See `amplify/data/resource.ts` for full definitions.

## Key Patterns

### Owner-scoped queries
Every model uses `allow.owner()`. The `owner` field is auto-populated with the Cognito username. Queries automatically filter by owner.

### JSON fields for variable structures
`peptideDoses`, `sideEffects`, `measurements`, `markers` use `a.json()` because their structure varies per user and per entry. Trade-off: cannot query inside JSON fields in DynamoDB.

### No joins
DynamoDB has no joins. If you need data from UserProfile + JournalEntry, make two queries. The `buildUserContext()` function in `src/lib/ai/user-context.ts` does this server-side for AI prompts.

## Gotchas

- **JSON fields are opaque**: You cannot filter or sort by fields inside `a.json()` columns. All filtering happens client-side after fetching.
- **Secondary indexes are partition-key only**: `index('date')` creates a GSI. To query "all entries for date X", use `listJournalEntryByDate({ date: '2026-04-14' })`.
- **Owner field is auto-managed**: Don't try to set or query the `owner` field manually. Amplify handles it via the Cognito token.

## See Also

- [Architecture](ARCHITECTURE.md) - Full system diagram
- [Journal](journal.md) - Journal UI and tracking patterns
- [AI System](AI-FEATURES.md) - How user data feeds into AI prompts
