CREATE TABLE "challenge_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"challenge_id" text NOT NULL,
	"correct" boolean,
	"answer" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "goals" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"kind" text NOT NULL,
	"target" real NOT NULL,
	"monthly" real NOT NULL,
	"initial" real NOT NULL,
	"annual_return" real NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"lesson_id" text NOT NULL,
	"segment_id" text NOT NULL,
	"is_practice" boolean DEFAULT false NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"xp_awarded" integer,
	"mistakes" integer
);
--> statement-breakpoint
CREATE TABLE "risk_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"profile" text NOT NULL,
	"dimensions" jsonb NOT NULL,
	"capped" boolean NOT NULL,
	"quiz_lesson_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_progress" (
	"user_id" text PRIMARY KEY NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	"hearts" integer DEFAULT 5 NOT NULL,
	"hearts_updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"streak" integer DEFAULT 0 NOT NULL,
	"streak_last_day" text,
	"streak_freezes" integer DEFAULT 1 NOT NULL,
	"league_index" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"nickname" text DEFAULT 'Nhà đầu tư' NOT NULL,
	"avatar" text DEFAULT 'explore' NOT NULL,
	"dragonx_ref" text,
	"daily_goal_minutes" integer DEFAULT 10 NOT NULL,
	"active_segment_id" text DEFAULT 'dc-funds' NOT NULL,
	"onboarded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "xp_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"amount" integer NOT NULL,
	"reason" text NOT NULL,
	"lesson_id" text,
	"perfect" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "challenge_attempts" ADD CONSTRAINT "challenge_attempts_session_id_lesson_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."lesson_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goals" ADD CONSTRAINT "goals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_sessions" ADD CONSTRAINT "lesson_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_profiles" ADD CONSTRAINT "risk_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xp_events" ADD CONSTRAINT "xp_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "challenge_attempts_session_idx" ON "challenge_attempts" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "challenge_attempts_challenge_idx" ON "challenge_attempts" USING btree ("challenge_id");--> statement-breakpoint
CREATE INDEX "lesson_sessions_user_lesson_idx" ON "lesson_sessions" USING btree ("user_id","lesson_id");--> statement-breakpoint
CREATE INDEX "xp_events_user_time_idx" ON "xp_events" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "xp_events_time_idx" ON "xp_events" USING btree ("created_at");