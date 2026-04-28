# Peptide Atlas

Peptide education platform with AI-personalized protocol generation, journal tracking, bloodwork interpretation, and an interactive body map. Live at **[peptideatlas.ai](https://peptideatlas.ai)**.

Two clients, one backend:
- **Web** — Next.js 16 SSR on AWS Amplify Hosting (`src/`)
- **Mobile** — Expo SDK 54 / React Native 0.81 (`mobile/`)

Both share the same Cognito User Pool, AppSync schema, and `/api/ai/*` route handlers.

## Documentation

| Topic | Doc |
|---|---|
| **System overview** | [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) |
| **AI features + multi-stage pipelines** | [`docs/AI-FEATURES.md`](docs/AI-FEATURES.md) |
| **Mobile app architecture** | [`docs/mobile.md`](docs/mobile.md) |
| **Data accuracy + audit workflow** | [`docs/data-accuracy.md`](docs/data-accuracy.md) |
| **Data model + types** | [`docs/DATA-MODEL.md`](docs/DATA-MODEL.md) |
| **DynamoDB / Amplify Data schema** | [`docs/database.md`](docs/database.md) |
| **Auth + Stripe payments** | [`docs/auth-and-payments.md`](docs/auth-and-payments.md) |
| **Routing structure** | [`docs/ROUTING.md`](docs/ROUTING.md) |
| **Components catalog** | [`docs/COMPONENTS.md`](docs/COMPONENTS.md) |
| **Design system** | [`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md) |
| **Deploy + custom domain** | [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) |
| **Journal subsystem** | [`docs/journal.md`](docs/journal.md) |
| **Tools (reconstitution, etc)** | [`docs/tools.md`](docs/tools.md) |
| **Blog system** | [`docs/BLOG-SYSTEM.md`](docs/BLOG-SYSTEM.md) |
| **Getting started** | [`docs/getting-started.md`](docs/getting-started.md) |

For agent-readable rules: see [`CLAUDE.md`](CLAUDE.md).

## Quick Start (web)

```bash
npm install --legacy-peer-deps
npm run dev                          # http://localhost:3000
npx tsc --noEmit                     # type check
npx ampx sandbox --once --profile nexvato  # deploy a sandbox backend
```

`amplify_outputs.json` is gitignored. Run `npx ampx generate outputs --branch main --app-id d3p5rtdaradk56 --profile nexvato` to fetch the prod values, or use a sandbox you deployed yourself.

## Quick Start (mobile)

```bash
cd mobile
npm install --legacy-peer-deps
npx expo start --port 8082
xcrun simctl openurl <SIMULATOR_UDID> exp://127.0.0.1:8082
```

The mobile app calls the production AI endpoints at `https://peptideatlas.ai/api/ai/*` via Bearer-token auth.

## Auditing the peptide catalog

```bash
ANTHROPIC_API_KEY=... npx tsx scripts/audit-peptides.ts   # Claude Opus accuracy review
npx tsx scripts/verify-pmids.ts                            # NCBI PubMed verification
npx tsx scripts/clean-bad-pmids.ts                         # remove fabricated citations
```

See [`docs/data-accuracy.md`](docs/data-accuracy.md) for the full workflow.

## Repo

- GitHub: [github.com/jonmohon/peptide-atlas](https://github.com/jonmohon/peptide-atlas)
- Amplify Hosting app ID: `d3p5rtdaradk56` (us-east-2)
- Cognito User Pool: `us-east-2_ldJBzHOWQ`

## License

Private. All rights reserved.
