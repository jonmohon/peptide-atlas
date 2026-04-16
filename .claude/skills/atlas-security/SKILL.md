---
name: atlas-security
description: "Security audit for PeptideAtlas — auth, data isolation, AI safety"
argument-hint: "[area to audit: auth, api, data, ai]"
---

# Security Audit

You are performing a **security audit** on: `$ARGUMENTS`

## Analysis Framework

### 1. Authentication & Authorization

Check all API routes in `src/app/api/`:
- Does every route call `auth()` or check session?
- Are premium features gated by tier?
- Can unauthenticated users access paid features?

| Route | Auth Check | Tier Check | Issue |
|-------|-----------|------------|-------|
| (list each route) | Yes/No | Yes/No/N/A | (finding) |

### 2. Data Isolation

Check Amplify Data models in `amplify/data/resource.ts`:
- Does every model have `.authorization((allow) => [allow.owner()])`?
- Are there any models with `allow.authenticated()` that should be `allow.owner()`?
- Can one user's data leak to another?

### 3. AI Safety

Check AI prompts in `src/lib/ai/prompts.ts`:
- Do all health-related prompts include medical disclaimers?
- Can users inject malicious content into prompts via input fields?
- Is user input sanitized before being interpolated into prompts?

### 4. Secret Exposure

- Are any secrets in `amplify_outputs.json` (committed to git)?
- Are any `NEXT_PUBLIC_` env vars actually secret?
- Is `.env.local` in `.gitignore`?

## Output Format

1. **Executive Summary** — Overall security posture in 2-3 sentences
2. **Findings Table** — Every finding with severity (HIGH/MEDIUM/LOW), location, recommendation
3. **Priority Actions** — Top 3 fixes, ordered by severity
4. **Risk Assessment** — What happens if findings are not addressed
