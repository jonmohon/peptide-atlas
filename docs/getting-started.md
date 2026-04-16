# Getting Started

Local development setup for PeptideAtlas.

**Related Documentation:**
- [Architecture](ARCHITECTURE.md) - System design and directory structure
- [Database](database.md) - Amplify Data models

---

> Status: IMPLEMENTED — Last updated: 2026-04-14

## Prerequisites

- Node.js 20+
- AWS CLI configured with `nexvato` profile
- Anthropic API key (for AI features)

## Setup

```bash
# 1. Clone
git clone https://github.com/jonmohon/peptide-atlas
cd peptide-atlas

# 2. Install dependencies (slow on T9 external drive — 5-10 min)
npm install

# 3. Environment variables
# Create .env.local with:
#   ANTHROPIC_API_KEY=sk-ant-...

# 4. Deploy Amplify sandbox (creates Cognito + DynamoDB in AWS)
npx ampx sandbox --profile nexvato
# This generates amplify_outputs.json with all backend config

# 5. Start dev server
npm run dev
# Open http://localhost:3000
```

## Key Commands

```bash
npm run dev                        # Dev server (port 3000)
npm run build                      # Production build
npx tsc --noEmit                   # Type check
npm run lint                       # ESLint
npx ampx sandbox --profile nexvato # Full sandbox (watch mode)
npx ampx sandbox --once            # Deploy once, no watch
npx ampx generate outputs          # Regenerate amplify_outputs.json
```

## Notes

- **T9 drive is slow**: `npm install` and `npm run build` take longer than usual. Use `npm rebuild` if `.bin` symlinks are missing.
- **AI features need ANTHROPIC_API_KEY**: Without it, AI features show friendly error messages but the site works fine.
- **Amplify sandbox is per-developer**: Each developer gets their own Cognito + DynamoDB stack via `--identifier`.

## See Also

- [Architecture](ARCHITECTURE.md) - Full system diagram
- [Database](database.md) - Data model reference
