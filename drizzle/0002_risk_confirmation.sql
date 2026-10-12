ALTER TABLE "risk_profiles" ADD COLUMN "framework_version" text;--> statement-breakpoint
ALTER TABLE "risk_profiles" ADD COLUMN "decision" text;--> statement-breakpoint
ALTER TABLE "risk_profiles" ADD COLUMN "final_profile" text;--> statement-breakpoint
ALTER TABLE "risk_profiles" ADD COLUMN "acknowledged_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "risk_profiles" ADD COLUMN "flags" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "risk_profiles" ADD COLUMN "confirmed_at" timestamp with time zone;