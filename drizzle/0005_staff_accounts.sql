CREATE TABLE "staff_audit" (
	"id" serial PRIMARY KEY NOT NULL,
	"staff_id" integer,
	"username" text NOT NULL,
	"action" text NOT NULL,
	"target" text,
	"detail" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staff_sessions" (
	"token_hash" text PRIMARY KEY NOT NULL,
	"staff_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staff_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"display_name" text NOT NULL,
	"role" text NOT NULL,
	"password_hash" text NOT NULL,
	"must_change_password" boolean DEFAULT true NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "staff_users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "compliance_reviews" ADD COLUMN "staff_id" integer;--> statement-breakpoint
ALTER TABLE "staff_audit" ADD CONSTRAINT "staff_audit_staff_id_staff_users_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_sessions" ADD CONSTRAINT "staff_sessions_staff_id_staff_users_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "staff_audit_time_idx" ON "staff_audit" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "staff_audit_user_idx" ON "staff_audit" USING btree ("username","created_at");--> statement-breakpoint
CREATE INDEX "staff_sessions_staff_idx" ON "staff_sessions" USING btree ("staff_id");