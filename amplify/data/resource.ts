import { a, defineData, type ClientSchema } from '@aws-amplify/backend';

const schema = a.schema({
  // ─── User Profile (synced from Cognito + AI context) ──────────
  UserProfile: a.model({
    email: a.email().required(),
    name: a.string(),
    tier: a.enum(['FREE', 'PRO', 'PRO_PLUS']),
    // Stripe
    stripeCustomerId: a.string(),
    stripeSubscriptionId: a.string(),
    stripeStatus: a.string(),
    // AI context fields
    goals: a.string().array(),
    experienceLevel: a.string(),
    currentProtocolSummary: a.string(),
    healthConditions: a.string().array(),
    allergies: a.string().array(),
    weight: a.float(),
    heightCm: a.float(),
    age: a.integer(),
    sex: a.string(),
  })
    .authorization((allow) => [allow.owner()])
    .secondaryIndexes((index) => [
      index('email'),
    ]),

  // ─── Journal Entry (daily tracking) ───────────────────────────
  JournalEntry: a.model({
    date: a.date().required(),
    peptideDoses: a.json(),
    weight: a.float(),
    bodyFat: a.float(),
    measurements: a.json(),
    dietNotes: a.string(),
    sideEffects: a.json(),
    mood: a.integer(),
    energy: a.integer(),
    sleepHours: a.float(),
    sleepQuality: a.integer(),
    subjectiveNotes: a.string(),
    tags: a.string().array(),
  })
    .authorization((allow) => [allow.owner()])
    .secondaryIndexes((index) => [
      index('date'),
    ]),

  // ─���─ Bloodwork Panel (lab results) ──────────���─────────────────
  BloodworkPanel: a.model({
    date: a.date().required(),
    labName: a.string(),
    markers: a.json().required(),
    s3Key: a.string(),
    aiInterpretation: a.string(),
    parsedByAi: a.boolean(),
    notes: a.string(),
  })
    .authorization((allow) => [allow.owner()])
    .secondaryIndexes((index) => [
      index('date'),
    ]),

  // ─── Saved Stacks ───��────────────────────────────────────────
  SavedStack: a.model({
    name: a.string().required(),
    peptideIds: a.string().array().required(),
    analysis: a.json(),
  })
    .authorization((allow) => [allow.owner()]),

  // ─── Saved Protocols ──���──────────────────────────────────────
  SavedProtocol: a.model({
    name: a.string().required(),
    goals: a.string().array().required(),
    experience: a.string().required(),
    content: a.json().required(),
    shareSlug: a.string(),
  })
    .authorization((allow) => [allow.owner()])
    .secondaryIndexes((index) => [
      index('shareSlug'),
    ]),

  // ─── AI Usage Tracking (Rate Limiting) ──��─────────────────────
  AiUsage: a.model({
    date: a.string().required(),
    endpoint: a.string().required(),
    count: a.integer().required(),
  })
    .authorization((allow) => [allow.owner()])
    .secondaryIndexes((index) => [
      index('date'),
    ]),

  // ─── User Notes ──────────���───────────────────────────────────
  UserNote: a.model({
    title: a.string(),
    content: a.string().required(),
    attachedTo: a.enum(['PEPTIDE', 'STACK', 'PROTOCOL', 'GENERAL']),
    attachedId: a.string(),
    tags: a.string().array(),
    pinned: a.boolean(),
  })
    .authorization((allow) => [allow.owner()])
    .secondaryIndexes((index) => [
      index('attachedTo'),
    ]),

  // ─── AI Conversation (chat memory) ───────────────────────────
  AiConversation: a.model({
    title: a.string(),
    context: a.enum(['GENERAL', 'PROTOCOL', 'BLOODWORK', 'JOURNAL_REVIEW']),
    summary: a.string(),
    lastMessageAt: a.datetime(),
    messageCount: a.integer(),
  })
    .authorization((allow) => [allow.owner()]),

  // ─── AI Insight Reports ──────────────────────────────────────
  AiInsightReport: a.model({
    period: a.enum(['WEEKLY', 'MONTHLY']),
    startDate: a.date().required(),
    endDate: a.date().required(),
    content: a.json().required(),
    summary: a.string(),
    generatedAt: a.datetime(),
  })
    .authorization((allow) => [allow.owner()])
    .secondaryIndexes((index) => [
      index('startDate'),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
