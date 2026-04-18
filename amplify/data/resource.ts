/**
 * Amplify Gen 2 AppSync/DynamoDB schema — defines all data models (UserProfile, JournalEntry,
 * BloodworkPanel, SavedStack, SavedProtocol, AiUsage, UserNote, AiConversation, AiInsightReport)
 * each scoped to the authenticated owner via allow.owner().
 */

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
    // Onboarding + engagement
    onboardingCompleted: a.boolean(),
    onboardingCompletedAt: a.datetime(),
    notificationsEnabled: a.boolean(),
    reminderQuietHoursStart: a.integer(),
    reminderQuietHoursEnd: a.integer(),
    weeklyEmailEnabled: a.boolean(),
    lastWeeklyEmailAt: a.datetime(),
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

  // ─── Achievements (meaningful milestones) ────────────────────
  Achievement: a.model({
    code: a.string().required(),
    title: a.string().required(),
    description: a.string(),
    unlockedAt: a.datetime().required(),
    iconKey: a.string(),
    meta: a.json(),
  })
    .authorization((allow) => [allow.owner()])
    .secondaryIndexes((index) => [
      index('code'),
    ]),

  // ─── Progress Photos ─────────────────────────────────────────
  ProgressPhoto: a.model({
    date: a.date().required(),
    s3Key: a.string().required(),
    angle: a.enum(['FRONT', 'BACK', 'SIDE_LEFT', 'SIDE_RIGHT', 'OTHER']),
    weight: a.float(),
    bodyFat: a.float(),
    notes: a.string(),
    aiObservation: a.string(),
    aiComparison: a.string(),
  })
    .authorization((allow) => [allow.owner()])
    .secondaryIndexes((index) => [
      index('date'),
    ]),

  // ─── Affiliate Click Tracking ─────────────────────────────────
  AffiliateClick: a.model({
    vendorId: a.string().required(),
    peptideId: a.string(),
    clickedAt: a.datetime().required(),
    referer: a.string(),
  })
    .authorization((allow) => [allow.owner()]),

  // ─── Reminders (dose notifications) ──────────────────────────
  Reminder: a.model({
    title: a.string().required(),
    body: a.string(),
    time: a.string().required(),
    daysOfWeek: a.string().array(),
    peptideId: a.string(),
    dose: a.string(),
    unit: a.string(),
    enabled: a.boolean(),
  })
    .authorization((allow) => [allow.owner()]),

  // ─── Community Protocols (published by users, browsable by all) ─
  CommunityProtocol: a.model({
    authorId: a.string().required(),
    authorName: a.string(),
    name: a.string().required(),
    slug: a.string().required(),
    description: a.string(),
    goals: a.string().array().required(),
    experience: a.string().required(),
    peptideIds: a.string().array().required(),
    content: a.json().required(),
    journalSummary: a.string(),
    durationWeeks: a.integer(),
    upvoteCount: a.integer(),
    commentCount: a.integer(),
    published: a.boolean(),
    flaggedCount: a.integer(),
    createdAt: a.datetime(),
  })
    .authorization((allow) => [
      allow.authenticated().to(['read']),
      allow.owner(),
    ])
    .secondaryIndexes((index) => [
      index('slug'),
      index('createdAt'),
    ]),

  CommunityProtocolUpvote: a.model({
    protocolId: a.string().required(),
    voterId: a.string().required(),
  })
    .authorization((allow) => [
      allow.authenticated().to(['read']),
      allow.owner(),
    ])
    .secondaryIndexes((index) => [
      index('protocolId'),
    ]),

  CommunityProtocolComment: a.model({
    protocolId: a.string().required(),
    authorId: a.string().required(),
    authorName: a.string(),
    content: a.string().required(),
    createdAt: a.datetime().required(),
    flagged: a.boolean(),
  })
    .authorization((allow) => [
      allow.authenticated().to(['read']),
      allow.owner(),
    ])
    .secondaryIndexes((index) => [
      index('protocolId'),
    ]),

  // ─── Cycles (multi-peptide on/off plans) ─────────────────────
  Cycle: a.model({
    name: a.string().required(),
    startDate: a.date().required(),
    durationWeeks: a.integer().required(),
    entries: a.json().required(),
    notes: a.string(),
    active: a.boolean(),
    aiAnalysis: a.json(),
  })
    .authorization((allow) => [allow.owner()])
    .secondaryIndexes((index) => [
      index('startDate'),
    ]),

  // ─── Research Digest (PubMed summaries) ──────────────────────
  ResearchDigest: a.model({
    generatedAt: a.datetime().required(),
    peptideIds: a.string().array().required(),
    experienceLevel: a.string(),
    summary: a.string().required(),
    articles: a.json().required(),
    viewed: a.boolean(),
  })
    .authorization((allow) => [allow.owner()])
    .secondaryIndexes((index) => [
      index('generatedAt'),
    ]),

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
