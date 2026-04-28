# Deployment

PeptideAtlas is deployed on AWS Amplify with automatic builds triggered by pushes to the `main` branch on GitHub.

## AWS Amplify Setup

- **GitHub repo:** `jonmohon/peptide-atlas`
- **Branch:** `main` (auto-deploy)
- **Framework:** Next.js (SSR, detected automatically by Amplify)
- **Build spec:** `amplify.yml` in project root

## amplify.yml Build Spec

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci --cache .npm --prefer-offline
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - .next/cache/**/*
      - .npm/**/*
      - node_modules/**/*
```

### Phase Breakdown

| Phase | Command | Purpose |
|-------|---------|---------|
| **preBuild** | `npm ci --cache .npm --prefer-offline` | Install dependencies from lockfile. Uses `.npm` cache directory and prefers cached packages for faster installs. |
| **build** | `npm run build` | Runs `next build` which compiles the Next.js app in standalone mode. |

### Artifacts

- **baseDirectory:** `.next` -- the Next.js build output
- **files:** `**/*` -- all files in the `.next` directory are deployed

### Cache

Three directories are cached between builds for faster subsequent deployments:

| Path | Purpose |
|------|---------|
| `.next/cache/**/*` | Next.js build cache (incremental builds) |
| `.npm/**/*` | npm package cache (faster installs) |
| `node_modules/**/*` | Installed dependencies |

## Environment Variables

Must be set in the Amplify Console under **App settings > Environment variables**:

| Variable | Required | Value | Purpose |
|----------|----------|-------|---------|
| `ANTHROPIC_API_KEY` | Yes (for AI features) | `sk-ant-...` | Authenticates with Anthropic API for Claude |

Without `ANTHROPIC_API_KEY`, the site builds and runs fine but all 7 AI endpoints return 500 errors with `"ANTHROPIC_API_KEY not configured"`. The ChatWidget displays a user-friendly error message.

## next.config.ts Settings

```typescript
const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [
      { source: '/peptides', destination: '/atlas/peptides', permanent: true },
      { source: '/peptides/:slug', destination: '/atlas/peptides/:slug', permanent: true },
      { source: '/stacks', destination: '/atlas/stacks', permanent: true },
      { source: '/effects', destination: '/atlas/effects', permanent: true },
      { source: '/compare', destination: '/atlas/compare', permanent: true },
      { source: '/protocol-generator', destination: '/atlas/protocol-generator', permanent: true },
    ];
  },
};
```

### `output: "standalone"`

Required for Amplify deployment. Produces a self-contained build output that includes only the necessary `node_modules` files, so the deployed artifact is smaller and doesn't require a full `npm install` at runtime.

### Redirects

Six permanent (301) redirects from old URL patterns to new `/atlas/*` paths. These ensure bookmarks and search engine links from before the route reorganization continue to work.

## Build Cache Strategy

Next.js build caching (`/.next/cache/`) is preserved between Amplify builds. This enables:
- **Incremental static regeneration** -- unchanged pages don't need to be rebuilt
- **Webpack cache** -- faster recompilation of unchanged modules
- **Image optimization cache** -- processed images are cached

The npm cache (`/.npm/`) and `node_modules/` are also cached, significantly reducing `npm ci` time on subsequent builds.

## Deploy Workflow

```
1. Developer pushes to `main` branch
2. GitHub webhook notifies Amplify
3. Amplify pulls the latest code
4. preBuild: npm ci (uses cache)
5. build: next build (standalone output)
6. Amplify deploys .next artifacts to CDN
7. Site is live with SSR support
```

### Pre-Push Checklist

Before pushing to `main`, ensure:

```bash
# Type check passes
npx tsc --noEmit

# Build succeeds locally
npm run build

# Lint passes
npm run lint
```

## Troubleshooting

### AI SDK v6 Type Errors

The Vercel AI SDK v6 introduced breaking changes from v5. Common issues:

| Error | Fix |
|-------|-----|
| `maxTokens` not recognized | Use `maxOutputTokens` instead |
| `toDataStreamResponse` not found | Use `toTextStreamResponse()` for plain text or `toUIMessageStreamResponse()` for chat |
| `handleSubmit` not found on `useChat` | Use `sendMessage({ text: '...' })` instead |
| `api` option not found on `useChat` | Use `DefaultChatTransport` from `'ai'` and pass as `transport` option |

### T9 Drive npm Issues

The project lives on a T9 external drive which can cause slow npm operations:

| Issue | Solution |
|-------|----------|
| `npm install` takes 5-10 minutes | Expected behavior on external drive |
| Missing `.bin` symlinks after install | Run `npm rebuild` |
| ENOENT errors during install | Check T9 drive is mounted at `/Volumes/T9/` |
| Slow `next dev` startup | Expected; subsequent hot reloads are fast |

### Common Build Failures

| Symptom | Cause | Fix |
|---------|-------|-----|
| TypeScript errors | Type mismatch or missing imports | Run `npx tsc --noEmit` locally first |
| Module not found | Missing dependency | Run `npm ci` to ensure lockfile packages are installed |
| Out of memory | Build too large | Increase Amplify build compute (or check for accidental large imports) |
| Redirect loops | Conflicting redirects | Check `next.config.ts` redirects don't conflict with actual routes |
| AI features broken post-deploy | Missing env var | Set `ANTHROPIC_API_KEY` in Amplify Console |

## GitHub Integration

- **Repo:** [github.com/jonmohon/peptide-atlas](https://github.com/jonmohon/peptide-atlas)
- **Account:** `jonmohon`
- **Auto-deploy:** Push to `main` triggers Amplify build
- **Branch deploys:** Not configured (only `main` deploys)
- **PR previews:** Not configured (can be enabled in Amplify Console)

## Domain Setup

**Production domain: `peptideatlas.ai`** (apex + www, both serve the same Amplify app).

The custom domain is wired to the Amplify Hosting app `d3p5rtdaradk56` (us-east-2). Route 53 hosted zone `Z03442552Q6PKQDXRWV6G` holds the records:

```
peptideatlas.ai          A ALIAS  →  d3kgz27guvj49v.cloudfront.net
www.peptideatlas.ai      CNAME    →  d3kgz27guvj49v.cloudfront.net
_fa52...peptideatlas.ai  CNAME    →  ACM validation target
```

To re-create from scratch (this is what was done):

```bash
# 1. Register the domain with Amplify
aws amplify create-domain-association \
  --app-id d3p5rtdaradk56 \
  --domain-name peptideatlas.ai \
  --sub-domain-settings prefix=,branchName=main prefix=www,branchName=main \
  --enable-auto-sub-domain --profile nexvato --region us-east-2

# 2. Get the records Amplify needs
aws amplify get-domain-association \
  --app-id d3p5rtdaradk56 --domain-name peptideatlas.ai \
  --profile nexvato --region us-east-2

# 3. Apply the CNAME + ALIAS in Route 53 (apex needs ALIAS, not CNAME)
aws route53 change-resource-record-sets --hosted-zone-id Z03442552Q6PKQDXRWV6G \
  --change-batch file://r53-changes.json --profile nexvato

# 4. Wait ~10-30 min for ACM cert validation + CloudFront propagation
# Status flow: PENDING_VERIFICATION → PENDING_DEPLOYMENT → AVAILABLE
```

The mobile app's `mobile/lib/config.ts` references `https://peptideatlas.ai` as `API_BASE_URL`. The sitemap, robots, and all in-app legal links use the same domain.

## Mobile App Deployment (Expo)

The mobile app at `mobile/` is currently developed against Expo Go. For TestFlight / App Store delivery a dev-client build is required (Expo Go can't link arbitrary native modules):

```bash
cd mobile
npm install -g eas-cli
npx expo install expo-dev-client
eas login
eas build --profile preview --platform ios
```

Once on a dev client, switch `lib/auth-context.tsx` from `USER_PASSWORD_AUTH` back to SRP — the dev client can link `@aws-amplify/react-native`'s native crypto module that Expo Go cannot. SRP is preferred for production.

See [`mobile.md`](./mobile.md) for the full mobile architecture.
