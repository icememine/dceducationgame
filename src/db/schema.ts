import { boolean, index, integer, jsonb, pgTable, real, serial, text, timestamp, uuid } from "drizzle-orm/pg-core";

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
