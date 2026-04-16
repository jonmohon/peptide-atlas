# AI Features

PeptideAtlas integrates Claude AI (via the Vercel AI SDK v6 and `@ai-sdk/anthropic`) to provide intelligent peptide search, mechanism explanations, stack optimization, protocol generation, comparison insights, and conversational chat. All AI features are educational and include medical disclaimers.

## API Endpoints Overview

All routes are in `src/app/api/ai/` and follow a consistent pattern: validate API key, parse input, call Claude, return response.

| Route | Model | Input | Output | Max Tokens | Max Duration | Used By |
|-------|-------|-------|--------|-----------|-------------|---------|
| `/api/ai/chat` | claude-sonnet-4-6 | `messages[]` | UI message stream | 1024 | 30s | ChatWidget |
| `/api/ai/search` | claude-haiku-4-5 | `query` (string) | Structured JSON | 512 | 15s | AISearchBar |
| `/api/ai/explain` | claude-sonnet-4-6 | `peptideId`, `level` | Text stream | 1024 | 20s | MechanismExplainer |
| `/api/ai/protocol` | claude-sonnet-4-6 | `goals[]`, `experience`, `preferences` | Text stream | 2048 | 30s | ProtocolGenerator page |
| `/api/ai/optimize` | claude-sonnet-4-6 | `peptideIds[]` | Structured JSON | 1536 | 20s | StackAnalysisPanel |
| `/api/ai/predict` | claude-haiku-4-5 | `peptideIds[]`, `level` | Text stream | 512 | 15s | WhatToExpect, RegionSuggestion |
| `/api/ai/compare` | claude-sonnet-4-6 | `peptideIds[]` | Text stream | 1024 | 20s | ComparisonInsights |
| `/api/ai/protocol-chat` | claude-sonnet-4-6 | `messages[]` | UI message stream | 1024 | 30s | Protocol advisor chat in /atlas/journal |
| `/api/ai/journal-insight` | claude-sonnet-4-6 | `entries[]` | Text stream | 2048 | 30s | Journal Insights page |
| `/api/ai/bloodwork` | claude-sonnet-4-6 | `panelId` or raw markers | Text stream | 2048 | 30s | Bloodwork interpretation in /atlas/journal/bloodwork |

**Model selection rationale:**
- **Sonnet** for complex tasks requiring nuanced analysis (chat, explain, protocol, optimize, compare)
- **Haiku** for fast, lightweight tasks (search ranking, prediction summaries)

## System Prompts Architecture

All prompts are defined in `src/lib/ai/prompts.ts`.

### BASE_SYSTEM_PROMPT

Every endpoint builds on the base prompt, which contains:

1. **Role definition** -- "PeptideAtlas AI, an expert peptide education assistant"
2. **Critical rules** (6 rules):
   - Not a doctor; always include disclaimer
   - Only reference peptides from the provided database
   - Always mention consulting a healthcare professional
   - Be precise about dosing; cite database values
   - Honest about knowledge gaps
   - Professional, clinical tone
3. **Full peptide database** -- All 31 peptides serialized as text (~15-20K tokens), including name, full name, description, category, effects, evidence level, dosing details, affected regions with intensity, side effects, and contraindications
4. **Stack database** -- All 10 pre-built stacks with peptide roles and combined effects

### Feature-Specific Extensions

Each endpoint appends task-specific instructions to the base prompt:

| Prompt Constant | Extension Focus |
|----------------|-----------------|
| `CHAT_SYSTEM_PROMPT` | Conversational mode, 300-word limit, end with disclaimer |
| `PROTOCOL_SYSTEM_PROMPT` | Structured protocol output (overview, peptides, dosing schedule, timeline, notes, disclaimer) |
| `STACK_OPTIMIZER_PROMPT` | Synergy analysis (score 1-10, synergies, issues, suggestions, timing) |
| `SEARCH_SYSTEM_PROMPT` | Ranked peptide matching with peptideId, relevanceScore, explanation |
| `MECHANISM_SYSTEM_PROMPT` | Mechanism of action at 3 knowledge levels (beginner/intermediate/advanced) |
| `COMPARISON_SYSTEM_PROMPT` | Multi-peptide comparison (strengths, differences, best use cases, combinations) |
| `PROTOCOL_CHAT_PROMPT` | Protocol advisor: correlates user's journal data + bloodwork with their active peptides; requires USER CONTEXT |
| `JOURNAL_INSIGHT_PROMPT` | Structured journal analysis: trends, correlations, concerns, adherence, recommendations from `entries[]` |
| `BLOODWORK_INTERPRETATION_PROMPT` | Per-marker interpretation correlated with user's active peptides; flags critical values |

### Peptide Database Injection

The `buildPeptideContext()` function serializes the peptide database into the system prompt:

```
- BPC-157 (Body Protection Compound-157): [description] Category: healing-repair.
  Effects: gut-healing, joint-repair, ... Evidence: strong.
  Dosing: 250-500mcg subcutaneous daily, cycle 4-8 weeks.
  Regions: gut(5/5), joints(4/5), muscles(3/5).
  Side effects: nausea, headache. Contraindications: pregnancy.
```

The `buildStackContext()` function similarly serializes stacks:

```
- Recovery Stack (Accelerate healing): bpc-157(primary) + tb-500(synergist) + ...
  Effects: gut-healing, joint-repair, ...
```

## User Context Injection

All AI routes inject a personalized `USER CONTEXT` block into the system prompt for authenticated users. This is what allows the AI to reference the user's specific peptides, goals, journal trends, and bloodwork — rather than giving generic advice.

**Source:** `src/lib/ai/user-context.ts` — `buildUserContext(userId: string): Promise<string>`

**Pattern used in every AI route:**

```typescript
const session = await auth();
const userContext = session?.user?.id
  ? await buildUserContext(session.user.id)
  : '';
const system = `${BASE_SYSTEM_PROMPT}\n\n${userContext}\n\n${ENDPOINT_PROMPT}`;
```

**What `buildUserContext()` returns:**

The function fetches the user's Cognito identity server-side via `runWithAmplifyServerContext`. It returns a `--- USER CONTEXT --- / --- END USER CONTEXT ---` block injected between the base prompt and the endpoint-specific prompt. The block is ~1-2K tokens and stays well under the 4K budget reserved for user context.

If the user is unauthenticated or the fetch fails, it returns an empty string (the prompt degrades gracefully to generic advice).

**Rate limiting:** Every AI request is tracked in the `AiUsage` DynamoDB model. Free-tier users are subject to monthly request limits checked before the Claude API call. See `src/lib/ai/rate-limit.ts`.

## Frontend Integration Patterns

### Pattern 1: Streaming Text

Used by: MechanismExplainer, ProtocolGenerator, WhatToExpect, RegionSuggestion, ComparisonInsights

**Hook:** `src/hooks/use-streaming-text.ts`

```typescript
const { text, isStreaming, error, startStream, reset } = useStreamingText();

// Trigger streaming
startStream('/api/ai/explain', { peptideId: 'bpc-157', level: 'intermediate' });
```

**How it works:**
1. `startStream(url, body)` sends a POST request
2. Reads the response as a `ReadableStream`
3. Decodes chunks with `TextDecoder` and accumulates text
4. Updates `text` state on each chunk (causes re-render with progressive text)
5. Supports abort via `AbortController`

**Display component:** `StreamingText` -- renders the accumulated text with a typing cursor animation while streaming.

### Pattern 2: Structured JSON

Used by: AISearchBar (search), StackAnalysisPanel (optimize)

```typescript
const res = await fetch('/api/ai/search', {
  method: 'POST',
  body: JSON.stringify({ query }),
});
const data = await res.json(); // Typed as SearchResult
```

The server uses `generateObject()` with a Zod schema, ensuring the response conforms to a predictable structure. The client parses the JSON and renders structured UI (ranked lists, synergy cards, timing tables).

### Pattern 3: Chat (UI Message Stream)

Used by: ChatWidget

```typescript
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

const transport = new DefaultChatTransport({ api: '/api/ai/chat' });
const { messages, sendMessage, status, error } = useChat({ transport });

// Send a message
sendMessage({ text: 'What helps with joint pain?' });
```

The chat route returns `result.toUIMessageStreamResponse()`, which streams a structured message format compatible with `useChat`. Messages include `parts` with `type: 'text'` segments.

## Zod Schemas for Structured Output

Defined in `src/lib/ai/schemas.ts`:

### `searchResultSchema`

```typescript
{
  results: [{
    peptideId: string,       // Must match database ID
    relevanceScore: number,  // 1-10
    explanation: string      // Why this peptide matches
  }],
  suggestedCategory?: string // Category to explore
}
```

### `stackAnalysisSchema`

```typescript
{
  overallScore: number,      // 1-10 synergy score
  synergies: [{
    peptideA: string,
    peptideB: string,
    type: 'synergistic' | 'complementary' | 'neutral' | 'redundant' | 'conflicting',
    explanation: string
  }],
  issues: [{
    severity: 'low' | 'medium' | 'high',
    description: string
  }],
  suggestions: [{
    action: 'add' | 'remove' | 'replace',
    peptide: string,
    reason: string
  }],
  timingSchedule: [{
    peptide: string,
    timeOfDay: string,
    withFood: boolean,
    notes?: string
  }]
}
```

### `protocolSchema`

```typescript
{
  overview: string,
  peptides: [{
    name: string,
    role: string,
    dosage: string,
    frequency: string,
    duration: string
  }],
  timeline: [{
    week: string,
    milestone: string
  }],
  expectedResults: string[],
  warnings: string[],
  disclaimer: string
}
```

## Caching Strategy

Client-side caching is implemented in `src/lib/ai/cache.ts` using `sessionStorage`:

| Function | Purpose |
|----------|---------|
| `getCachedResponse(key)` | Retrieves cached response if within TTL |
| `setCachedResponse(key, value)` | Stores response with timestamp |
| `makeCacheKey(...parts)` | Creates deterministic cache key from sorted parts |

**Configuration:**
- **Storage:** `sessionStorage` (cleared when tab closes)
- **TTL:** 30 minutes
- **Key format:** `ai-cache:part1:part2:part3` (parts sorted alphabetically)
- **Quota handling:** Silently fails on `QuotaExceededError`

This prevents redundant API calls when users revisit the same peptide explanation or re-run the same search.

## How to Add a New AI Feature

### Step 1: Create the API route

Create `src/app/api/ai/your-feature/route.ts`:

```typescript
import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';  // or generateObject for structured output
import { YOUR_SYSTEM_PROMPT } from '@/lib/ai/prompts';

export const maxDuration = 20;

export async function POST(req: Request) {
  const { input } = await req.json();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),  // or claude-haiku-4-5-20251001
    system: YOUR_SYSTEM_PROMPT,
    prompt: `Your task: ${input}`,
    maxOutputTokens: 1024,
  });

  return result.toTextStreamResponse();  // or toUIMessageStreamResponse() for chat
}
```

### Step 2: Add the system prompt

In `src/lib/ai/prompts.ts`:

```typescript
export const YOUR_SYSTEM_PROMPT = `${BASE_SYSTEM_PROMPT}

Your feature-specific instructions here...`;
```

### Step 3: Add Zod schema (if structured output)

In `src/lib/ai/schemas.ts`:

```typescript
export const yourFeatureSchema = z.object({
  // define your output shape
});
```

### Step 4: Create the UI component

In `src/components/ai/your-feature.tsx`:

For streaming text:
```typescript
import { useStreamingText } from '@/hooks/use-streaming-text';
import { StreamingText } from '@/components/ai/streaming-text';

export function YourFeature() {
  const { text, isStreaming, error, startStream } = useStreamingText();
  // ...
  return <StreamingText text={text} isStreaming={isStreaming} />;
}
```

For structured JSON:
```typescript
const [data, setData] = useState<YourType | null>(null);
const res = await fetch('/api/ai/your-feature', { method: 'POST', body: ... });
setData(await res.json());
```

### Step 5: Wire it up

Import and render your component in the appropriate page or parent component.

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `ANTHROPIC_API_KEY` | Yes (for AI features) | Authenticates with Anthropic API |

Without the API key, all AI routes return a 500 with `{ error: 'ANTHROPIC_API_KEY not configured' }`. The ChatWidget displays a friendly error message. The rest of the site functions normally.

## Cost Considerations

- **System prompt size:** ~15-20K tokens per request (full peptide database injected)
- **Sonnet routes** (chat, explain, protocol, optimize, compare): Higher cost per request due to larger model + larger output
- **Haiku routes** (search, predict): Lower cost, faster response
- **Protocol generation** has the highest token budget (2048 output tokens)
- **Search** has the lowest (512 output tokens)
- **No server-side caching** -- each request hits the Anthropic API. Client-side sessionStorage caching mitigates repeated calls within a session
- Consider adding server-side caching (Redis, Upstash) for high-traffic scenarios
