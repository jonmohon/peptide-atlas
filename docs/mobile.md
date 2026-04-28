# Mobile App

The Peptide Atlas mobile app lives in `mobile/` at the project root. Built with Expo SDK 54, expo-router 6, NativeWind 4, and React Native 0.81. iOS bundle ID `com.peptideatlas`; same Android package.

## Architecture

```
mobile/
├── app/                          expo-router file-based routing
│   ├── _layout.tsx              root: Amplify config + AuthProvider + Stack
│   ├── (auth)/                  sign-in, sign-up, confirm
│   ├── (tabs)/                  Atlas, Journal, Peptides, AI, Profile
│   ├── peptides/[slug].tsx      peptide detail (with AI explain)
│   ├── stacks/[slug].tsx        stack detail (with AI synergy analysis)
│   ├── bloodwork/[id].tsx       lab panel detail (with multi-stage Opus interpretation)
│   ├── body-map.tsx             react-native-svg silhouette + region markers
│   ├── compare.tsx              two-peptide side-by-side + AI summary
│   ├── effects.tsx              browse effects → related peptides
│   ├── notes/                   personal notes CRUD
│   ├── reconstitution.tsx       vial-mix reference (NOT a dose calculator)
│   ├── reminders.tsx            daily journal reminder via expo-notifications
│   ├── medical-disclaimer.tsx   first-launch gate (mandatory)
│   ├── onboarding.tsx           goals + experience after sign-up
│   ├── log-entry.tsx            modal: log doses + sliders for energy/mood/sleep
│   ├── profile-edit.tsx         modal: write to UserProfile
│   ├── protocol.tsx             AI protocol generator (multi-stage pipeline UI)
│   └── saved-stacks.tsx         user's bookmarked stacks
├── components/                  shared RN components
│   ├── glass-card.tsx           backdrop-blur glass surface (expo-blur)
│   ├── screen.tsx               page wrapper with radial-glow gradient
│   ├── atlas-button.tsx         primary CTA component
│   ├── step-sequencer.tsx       multi-stage AI pipeline progress UI + SSE parser
│   ├── ai-explain.tsx           per-peptide AI deep-dive card
│   └── sparkline.tsx            tiny chart for bloodwork trends
├── data/                        copy of src/data/* (peptides, regions, etc)
│   See docs/data-accuracy.md for catalog accuracy workflow
├── lib/
│   ├── amplify.ts               configureAmplify() + getIdToken() helpers
│   ├── amplify-data.ts          loose-typed AppSync helpers (UserProfile,
│                                JournalEntry, BloodworkPanel, SavedStack,
│                                UserNote)
│   ├── auth-context.tsx         AuthProvider, useAuth(), tier resolution
│   ├── config.ts                API_BASE_URL = https://peptideatlas.ai
│   └── notifications.ts         setReminder / clearReminder helpers
└── types/                       Peptide, BodyRegion, Stack, etc (mirrors src/types/)
```

## Auth flow

The mobile app uses **Cognito `USER_PASSWORD_AUTH`** instead of the default SRP because Expo Go can't link the native crypto module that SRP requires. SRP stays available for the web app and future dev-client builds.

- `/(auth)/sign-in` — email + password against the prod User Pool
- `/(auth)/sign-up` → `/onboarding` → `/medical-disclaimer` → `/(tabs)`
- Tokens persisted via AsyncStorage; `getIdToken()` returns the current ID token for AI route calls
- Auth gate logic in `(tabs)/_layout.tsx`: if no session → `/(auth)/sign-in`; if disclaimer not accepted → `/medical-disclaimer`

## Calling AI routes

Mobile calls every `/api/ai/*` endpoint at `https://peptideatlas.ai`:

```ts
import { fetch as expoFetch } from 'expo/fetch';
import { getIdToken } from '@/lib/amplify';
import { API_BASE_URL } from '@/lib/config';

const token = await getIdToken();
const res = await expoFetch(`${API_BASE_URL}/api/ai/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify({ messages }),
});
```

`expo/fetch` is required for streaming responses; RN's stock `fetch` doesn't expose `body.getReader()`.

For multi-stage SSE endpoints (`/api/ai/protocol`, `/api/ai/bloodwork`), use the shared parser:

```ts
import { consumeSseStream } from '@/components/step-sequencer';

await consumeSseStream(res.body, {
  onStage: (id, label) => /* light up step */,
  onText: (delta) => setOutput(acc + delta),
  onWarning: (msg) => /* show in safety banner */,
  onError: (msg) => setError(msg),
  onDone: () => /* mark all done */,
});
```

## Reader-app App Store positioning

Per Apple Review Guideline 3.1.3(a), the mobile app is configured as a **reader app** — sign-in only, no in-app purchases for premium tiers. The Profile tier card says "Manage on the web" for FREE users; payment happens at `https://peptideatlas.ai/pricing` via Stripe. Eliminates the 30% Apple cut and the IAP integration burden.

## Local development

```bash
cd mobile
npm install --legacy-peer-deps
npx expo start --port 8082
# In another shell:
xcrun simctl openurl <SIMULATOR_UDID> exp://127.0.0.1:8082
```

Requires `amplify_outputs.json` in the `mobile/` directory pointing at a deployed Amplify backend (the same one the web app uses, fetched via `npx ampx generate outputs --branch main --app-id d3p5rtdaradk56 --profile nexvato`). The file is gitignored.

## Production build (deferred)

For TestFlight / App Store delivery, the next step is a development build via EAS:

```bash
npx expo install expo-dev-client
eas build --profile preview --platform ios
```

A dev-client build also unlocks SRP auth, native expo-notifications APNs, and any other native modules that don't ship with Expo Go.

## Audit + accuracy tooling

See [`data-accuracy.md`](./data-accuracy.md) for how the peptide catalog is audited and how confidence levels are surfaced.
