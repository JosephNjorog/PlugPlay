CREATE TABLE "app_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"description" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "arena_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"player_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"answer" integer,
	"is_correct" boolean DEFAULT false NOT NULL,
	"response_time_ms" integer,
	"points_earned" integer DEFAULT 0 NOT NULL,
	"answered_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "arena_players" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"user_id" uuid,
	"nickname" text NOT NULL,
	"wallet_address" text,
	"score" integer DEFAULT 0 NOT NULL,
	"correct_answers" integer DEFAULT 0 NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "arena_players_session_id_nickname_unique" UNIQUE("session_id","nickname")
);
--> statement-breakpoint
CREATE TABLE "arena_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"topic" text NOT NULL,
	"question" text NOT NULL,
	"options" text[] NOT NULL,
	"answer" integer NOT NULL,
	"explanation" text,
	"difficulty" text DEFAULT 'medium' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "arena_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"host_id" uuid NOT NULL,
	"status" text DEFAULT 'waiting' NOT NULL,
	"topic" text,
	"round_index" integer DEFAULT 0 NOT NULL,
	"max_players" integer DEFAULT 50 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"ended_at" timestamp,
	CONSTRAINT "arena_sessions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "auth_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "auth_sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "challenges" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"tagline" text NOT NULL,
	"emoji" text DEFAULT '🏃' NOT NULL,
	"accent" text DEFAULT 'blue' NOT NULL,
	"tier" text NOT NULL,
	"ai_ready" boolean DEFAULT false NOT NULL,
	"est_minutes" integer DEFAULT 15 NOT NULL,
	"xp_reward" integer DEFAULT 200 NOT NULL,
	"badge_title" text NOT NULL,
	"concept" text NOT NULL,
	"brief" text NOT NULL,
	"steps" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"build_prompt" text,
	"ai_prompt" text,
	"submission" jsonb NOT NULL,
	"verification" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "challenges_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "event_participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"team_id" uuid,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"luma_checked_in" boolean DEFAULT false NOT NULL,
	"luma_email" text,
	"check_in_source" text DEFAULT 'self',
	CONSTRAINT "event_participants_event_id_user_id_unique" UNIQUE("event_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"host_user_id" uuid,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"format" text NOT NULL,
	"location" text,
	"zoom_url" text,
	"starts_at" timestamp NOT NULL,
	"ends_at" timestamp NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"category" text DEFAULT 'community' NOT NULL,
	"difficulty" text DEFAULT 'beginner' NOT NULL,
	"tracks" text[] DEFAULT '{}' NOT NULL,
	"missions" text[] DEFAULT '{}' NOT NULL,
	"capacity" integer DEFAULT 100 NOT NULL,
	"reward_pool" text,
	"cover_emoji" text DEFAULT '🎮' NOT NULL,
	"agenda" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_platform_event" boolean DEFAULT false NOT NULL,
	"luma_event_id" text,
	"requires_approval" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"persona" text NOT NULL,
	"category" text NOT NULL,
	"difficulty" text NOT NULL,
	"themes" text[] DEFAULT '{}' NOT NULL,
	"description" text NOT NULL,
	"learning_outcome" text NOT NULL,
	"emoji" text DEFAULT '🎮' NOT NULL,
	"duration" text DEFAULT '5 min' NOT NULL,
	"xp_reward" integer DEFAULT 100 NOT NULL,
	"reward_type" text DEFAULT 'xp' NOT NULL,
	"event_types" text[] DEFAULT '{}' NOT NULL,
	"game_type" text DEFAULT 'mission' NOT NULL,
	"status" text DEFAULT 'live' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mission_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"game_id" text NOT NULL,
	"event_id" uuid,
	"round_id" uuid,
	"status" text DEFAULT 'pending' NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"accuracy" integer DEFAULT 0,
	"time_spent" integer,
	"submission_data" jsonb,
	"verified" boolean DEFAULT false NOT NULL,
	"tx_hash" text,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nft_badges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"rarity" text DEFAULT 'common' NOT NULL,
	"emoji" text DEFAULT '🏆' NOT NULL,
	"game_id" text,
	"event_id" uuid,
	"minted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nft_mints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"game_id" text,
	"token_id" integer NOT NULL,
	"tx_hash" text NOT NULL,
	"contract_address" text NOT NULL,
	"metadata_uri" text,
	"minted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "password_reset_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"username" text NOT NULL,
	"emoji" text DEFAULT '🎮',
	"persona" text,
	"xp" integer DEFAULT 0 NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"stage" text DEFAULT 'newcomer' NOT NULL,
	"streak" integer DEFAULT 0 NOT NULL,
	"wallet_address" text,
	"status_tag" text,
	"is_admin" boolean DEFAULT false NOT NULL,
	"is_super_admin" boolean DEFAULT false NOT NULL,
	"onboarding_done" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_active_at" timestamp DEFAULT now(),
	CONSTRAINT "profiles_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "rewards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"kind" text NOT NULL,
	"rarity" text DEFAULT 'common' NOT NULL,
	"value" text,
	"claimed" boolean DEFAULT false NOT NULL,
	"claimed_at" timestamp,
	"event_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "arena_answers" ADD CONSTRAINT "arena_answers_session_id_arena_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."arena_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arena_answers" ADD CONSTRAINT "arena_answers_player_id_arena_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."arena_players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arena_answers" ADD CONSTRAINT "arena_answers_question_id_arena_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."arena_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arena_players" ADD CONSTRAINT "arena_players_session_id_arena_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."arena_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arena_players" ADD CONSTRAINT "arena_players_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arena_sessions" ADD CONSTRAINT "arena_sessions_host_id_profiles_id_fk" FOREIGN KEY ("host_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_host_user_id_profiles_id_fk" FOREIGN KEY ("host_user_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_attempts" ADD CONSTRAINT "mission_attempts_player_id_profiles_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_attempts" ADD CONSTRAINT "mission_attempts_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_attempts" ADD CONSTRAINT "mission_attempts_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nft_badges" ADD CONSTRAINT "nft_badges_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nft_mints" ADD CONSTRAINT "nft_mints_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rewards" ADD CONSTRAINT "rewards_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;