import { boolean, index, integer, jsonb, pgTable, primaryKey, real, serial, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

/**
 * Only learner STATE lives in the database. Lesson content is code (see /content) and is
 * referenced here by stable string ids — so content can be edited, reordered or extended
 * without migrations. (The reference duolingo-clone stores courses/units/lessons as serial
 * rows edited through react-admin; we trade that for PR-reviewed content.)
 */

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  nickname: text("nickname").notNull().default("Nhà đầu tư"),
  avatar: text("avatar").notNull().default("explore"),
  /** Optional link to a DragonX customer, set only after explicit consent. */
  dragonxRef: text("dragonx_ref"),
  dailyGoalMinutes: integer("daily_goal_minutes").notNull().default(10),
  activeSegmentId: text("active_segment_id").notNull().default("dc-funds"),
  /** Daily study reminder (push / in-app), at this hour in Asia/Ho_Chi_Minh. */
  reminderEnabled: boolean("reminder_enabled").notNull().default(false),
  reminderHour: integer("reminder_hour").notNull().default(20),
  /** "YYYY-MM-DD" (Vietnam) of the last reminder sent, so the cron never sends twice a day. */
  lastRemindedDay: text("last_reminded_day"),
  /** Random token for the public investment-plan card (/p/[token]); null = not shared. */
  planShareToken: text("plan_share_token").unique(),
  onboardedAt: timestamp("onboarded_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const userProgress = pgTable("user_progress", {
  userId: text("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  xp: integer("xp").notNull().default(0),
  hearts: integer("hearts").notNull().default(5),
  heartsUpdatedAt: timestamp("hearts_updated_at", { withTimezone: true }).notNull().defaultNow(),
  streak: integer("streak").notNull().default(0),
  /** "YYYY-MM-DD" in Asia/Ho_Chi_Minh. */
  streakLastDay: text("streak_last_day"),
  streakFreezes: integer("streak_freezes").notNull().default(1),
  leagueIndex: integer("league_index").notNull().default(0),
});

/** One row per attempt at a lesson; the server derives mistakes/perfect from its attempts. */
export const lessonSessions = pgTable(
  "lesson_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id").notNull(),
    segmentId: text("segment_id").notNull(),
    isPractice: boolean("is_practice").notNull().default(false),
    /** "lesson" | "review" (spaced repetition) | "placement" (jump-ahead test). */
    kind: text("kind").notNull().default("lesson"),
    /** Challenge ids of a review or placement session (they come from many lessons). */
    items: jsonb("items"),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    xpAwarded: integer("xp_awarded"),
    mistakes: integer("mistakes"),
  },
  (t) => [index("lesson_sessions_user_lesson_idx").on(t.userId, t.lessonId)],
);

/** Every answer. Doubles as content analytics: which questions confuse investors most. */
export const challengeAttempts = pgTable(
  "challenge_attempts",
  {
    id: serial("id").primaryKey(),
    sessionId: uuid("session_id").notNull().references(() => lessonSessions.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    challengeId: text("challenge_id").notNull(),
    /** null for ungraded items (info, profile, planner). */
    correct: boolean("correct"),
    answer: jsonb("answer").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("challenge_attempts_session_idx").on(t.sessionId), index("challenge_attempts_challenge_idx").on(t.challengeId)],
);

/** Append-only ledger; leaderboards and daily quests are sums over a time window. */
export const xpEvents = pgTable(
  "xp_events",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(),
    reason: text("reason").notNull(),
    lessonId: text("lesson_id"),
    perfect: boolean("perfect").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("xp_events_user_time_idx").on(t.userId, t.createdAt), index("xp_events_time_idx").on(t.createdAt)],
);

/** History of self-assessments (learners can retake; latest wins). */
export const riskProfiles = pgTable("risk_profiles", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  profile: text("profile").notNull(),
  dimensions: jsonb("dimensions").notNull(),
  capped: boolean("capped").notNull(),
  /** Lesson id + content version the answers came from, for audit. */
  quizLessonId: text("quiz_lesson_id").notNull(),
  /** Risk Scoring Framework version the result was computed with (e.g. "2.3"). */
  frameworkVersion: text("framework_version"),
  /** §5 confirmation: agree | lower | higher. Null until the learner confirms. */
  decision: text("decision"),
  /** Profile after the learner's decision; the one the app uses. */
  finalProfile: text("final_profile"),
  /** Set when the learner ticked the acknowledgement (choosing higher risk, or capacity warning). */
  acknowledgedAt: timestamp("acknowledged_at", { withTimezone: true }),
  /** §5.2 special cases for Compliance review. */
  flags: jsonb("flags").notNull().default([]),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  target: real("target").notNull(),
  monthly: real("monthly").notNull(),
  initial: real("initial").notNull(),
  annualReturn: real("annual_return").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Every AI answer (Hỏi Rồng now; coach and role-play later), kept for Compliance review and
 * for building evals from real questions. `flags` come from features/ai/guardrails.ts.
 */
export const aiMessages = pgTable(
  "ai_messages",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    surface: text("surface").notNull(),
    question: text("question").notNull(),
    answer: text("answer").notNull(),
    /** "ai" (model answered) or "offline" (library fallback, no API credentials). */
    mode: text("mode").notNull(),
    model: text("model"),
    flags: jsonb("flags").notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("ai_messages_user_idx").on(t.userId, t.createdAt)],
);

/**
 * Spaced repetition (Leitner boxes). A graded mistake puts the question in box 0, due now
 * ("Cần ôn lại"). Each correct review moves it up a box (due after 1, 3, 7, 21 days); a
 * wrong review sends it back to box 0. After the last box it is retired.
 */
export const reviewItems = pgTable(
  "review_items",
  {
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    challengeId: text("challenge_id").notNull(),
    lessonId: text("lesson_id").notNull(),
    box: integer("box").notNull().default(0),
    dueAt: timestamp("due_at", { withTimezone: true }),
    lapses: integer("lapses").notNull().default(0),
    lastWrongAt: timestamp("last_wrong_at", { withTimezone: true }),
    retiredAt: timestamp("retired_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.challengeId] }), index("review_items_due_idx").on(t.userId, t.dueAt)],
);

/** Placement ("Kiểm tra xếp lớp") results: lessons before `unlockIndex` open in that segment. */
export const placements = pgTable("placements", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  segmentId: text("segment_id").notNull(),
  unlockIndex: integer("unlock_index").notNull(),
  score: integer("score").notNull(),
  total: integer("total").notNull(),
  /** Per-unit result: [{ unitId, correct }]. */
  results: jsonb("results").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Badges and monthly-challenge awards, kept so "new" ones can be announced once. */
export const userBadges = pgTable(
  "user_badges",
  {
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    badgeId: text("badge_id").notNull(),
    earnedAt: timestamp("earned_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.badgeId] })],
);

/** Weekly league groups of up to 30 learners in the same tier. weekStart = Monday "YYYY-MM-DD" (Vietnam). */
export const leagueMemberships = pgTable(
  "league_memberships",
  {
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    weekStart: text("week_start").notNull(),
    tier: integer("tier").notNull(),
    groupNo: integer("group_no").notNull(),
    /** Set when the week is settled: "up" | "down" | "stay", with the final rank. */
    outcome: text("outcome"),
    rank: integer("rank"),
  },
  (t) => [primaryKey({ columns: [t.userId, t.weekStart] }), index("league_group_idx").on(t.weekStart, t.tier, t.groupNo)],
);

/** Weeks whose promotions/demotions have been applied (idempotent settlement). */
export const leagueWeeks = pgTable("league_weeks", {
  weekStart: text("week_start").primaryKey(),
  settledAt: timestamp("settled_at", { withTimezone: true }).notNull().defaultNow(),
});

/** In-app notifications (streak at risk, review due, league result, badge). */
export const notifications = pgTable(
  "notifications",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    href: text("href"),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("notifications_user_idx").on(t.userId, t.createdAt)],
);

/** Web Push subscriptions (one per browser/device). Sending needs VAPID keys in the environment. */
export const pushSubscriptions = pgTable(
  "push_subscriptions",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    endpoint: text("endpoint").notNull(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("push_endpoint_idx").on(t.endpoint)],
);

/**
 * Compliance review trail for AI answers ("ai" → ai_messages.id) and risk confirmations
 * ("risk" → risk_profiles.id). Append-only: the newest row per target is its current status,
 * older rows stay as history. `reviewer` is the staff login that made the call.
 */
export const complianceReviews = pgTable(
  "compliance_reviews",
  {
    id: serial("id").primaryKey(),
    kind: text("kind").notNull(),
    targetId: integer("target_id").notNull(),
    /** "ok" | "issue" | "escalated" */
    outcome: text("outcome").notNull(),
    note: text("note").notNull().default(""),
    reviewer: text("reviewer").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("compliance_reviews_target_idx").on(t.kind, t.targetId, t.createdAt)],
);
