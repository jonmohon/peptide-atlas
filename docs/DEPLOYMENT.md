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

Domain configuration is managed in the Amplify Console under **App settings > Domain management**.

To add a custom domain:
1. Go to Amplify Console > Domain management > Add domain
2. Enter your domain (e.g., `peptideatlas.com`)
3. Configure subdomains (e.g., `www` redirect to apex)
4. Amplify provisions an SSL certificate via ACM
5. Update your domain's DNS records as instructed by Amplify

The sitemap and robots.txt currently reference `https://peptideatlas.com` as the base URL (configured in `src/app/sitemap.ts` and `src/app/robots.ts`).
