import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  uuid,
  jsonb,
  unique,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Profiles ──────────────────────────────────────────────────────────────
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().unique(), // FK to users table (auth)
  username: text("username").notNull(),
  emoji: text("emoji").default("🎮"),
  persona: text("persona"),
  xp: integer("xp").default(0).notNull(),
  level: integer("level").default(1).notNull(),
  stage: text("stage").default("newcomer").notNull(),
  streak: integer("streak").default(0).notNull(),
  walletAddress: text("wallet_address"),
  statusTag: text("status_tag"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  isSuperAdmin: boolean("is_super_admin").default(false).notNull(),
  onboardingDone: boolean("onboarding_done").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Games / Missions ────────────────────────────────────────────────────────
export const games = pgTable("games", {
  id: text("id").primaryKey(), // slug e.g. "gas-rush"
  title: text("title").notNull(),
  persona: text("persona").notNull(), // student | developer | builder | founder | business | all
  category: text("category").notNull(), // Quiz | Simulation | Puzzle | Build Challenge | Team Challenge | Arcade
  difficulty: text("difficulty").notNull(), // Beginner | Intermediate | Advanced
  themes: text("themes").array().default([]).notNull(),
  description: text("description").notNull(),
  learningOutcome: text("learning_outcome").notNull(),
  emoji: text("emoji").default("🎮").notNull(),
  duration: text("duration").default("5 min").notNull(),
  xpReward: integer("xp_reward").default(100).notNull(),
  rewardType: text("reward_type").default("xp").notNull(), // xp | nft | merch | token
  eventTypes: text("event_types").array().default([]).notNull(),
  gameType: text("game_type").default("mission").notNull(), // mission | arcade | multiplayer
  status: text("status").default("live").notNull(), // live | soon
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Challenges (Speedruns) ─────────────────────────────────────────────────
export const challenges = pgTable("challenges", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  tagline: text("tagline").notNull(),
  emoji: text("emoji").default("🏃").notNull(),
  accent: text("accent").default("blue").notNull(), // blue | green | purple | orange | pink
  tier: text("tier").notNull(), // beginner | intermediate | advanced
  aiReady: boolean("ai_ready").default(false).notNull(),
  estMinutes: integer("est_minutes").default(15).notNull(),
  xpReward: integer("xp_reward").default(200).notNull(),
  badgeTitle: text("badge_title").notNull(),
  concept: text("concept").notNull(),
  brief: text("brief").notNull(),
  steps: jsonb("steps").default([]).notNull(),
  buildPrompt: text("build_prompt"),
  aiPrompt: text("ai_prompt"),
  submission: jsonb("submission").notNull(),
  verification: jsonb("verification").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Events ──────────────────────────────────────────────────────────────────
export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  hostUserId: uuid("host_user_id").references(() => profiles.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  format: text("format").notNull(), // irl | zoom | hybrid
  location: text("location"),
  zoomUrl: text("zoom_url"),
  startsAt: timestamp("starts_at").notNull(),
  endsAt: timestamp("ends_at").notNull(),
  status: text("status").default("draft").notNull(), // draft | live | paused | ended
  category: text("category").default("community").notNull(),
  difficulty: text("difficulty").default("beginner").notNull(),
  tracks: text("tracks").array().default([]).notNull(),
  missions: text("missions").array().default([]).notNull(),
  capacity: integer("capacity").default(100).notNull(),
  rewardPool: text("reward_pool"),
  coverEmoji: text("cover_emoji").default("🎮").notNull(),
  agenda: jsonb("agenda").default([]).notNull(),
  isPlatformEvent: boolean("is_platform_event").default(false).notNull(),
  lumaEventId: text("luma_event_id"),
  requiresApproval: boolean("requires_approval").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Event Participants ──────────────────────────────────────────────────────
export const eventParticipants = pgTable(
  "event_participants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
    teamId: uuid("team_id"),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
    lumaCheckedIn: boolean("luma_checked_in").default(false).notNull(),
    lumaEmail: text("luma_email"),
    checkInSource: text("check_in_source").default("self"), // luma_api | luma_csv | self
  },
  (t) => [unique().on(t.eventId, t.userId)]
);

// ─── Mission Attempts ────────────────────────────────────────────────────────
export const missionAttempts = pgTable("mission_attempts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  gameId: text("game_id").notNull().references(() => games.id, { onDelete: "cascade" }),
  eventId: uuid("event_id").references(() => events.id, { onDelete: "set null" }),
  roundId: uuid("round_id"),
  status: text("status").default("pending").notNull(), // pending | completed | failed | verified
  score: integer("score").default(0).notNull(),
  accuracy: integer("accuracy").default(0), // percentage 0-100
  timeSpent: integer("time_spent"), // seconds
  submissionData: jsonb("submission_data"),
  verified: boolean("verified").default(false).notNull(),
  txHash: text("tx_hash"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── NFT Mints ───────────────────────────────────────────────────────────────
export const nftMints = pgTable("nft_mints", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  gameId: text("game_id"),
  tokenId: integer("token_id").notNull(),
  txHash: text("tx_hash").notNull(),
  contractAddress: text("contract_address").notNull(),
  metadataUri: text("metadata_uri"),
  mintedAt: timestamp("minted_at").defaultNow().notNull(),
});

// ─── NFT Badges ──────────────────────────────────────────────────────────────
export const nftBadges = pgTable("nft_badges", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  rarity: text("rarity").default("common").notNull(), // common | rare | legendary
  emoji: text("emoji").default("🏆").notNull(),
  gameId: text("game_id"),
  eventId: uuid("event_id"),
  mintedAt: timestamp("minted_at").defaultNow().notNull(),
});

// ─── Rewards ─────────────────────────────────────────────────────────────────
export const rewards = pgTable("rewards", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  kind: text("kind").notNull(), // merch | token
  rarity: text("rarity").default("common").notNull(),
  value: text("value"),
  claimed: boolean("claimed").default(false).notNull(),
  claimedAt: timestamp("claimed_at"),
  eventId: uuid("event_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Arena Sessions ──────────────────────────────────────────────────────────
export const arenaSessions = pgTable("arena_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(), // 6-char join code
  hostId: uuid("host_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  status: text("status").default("waiting").notNull(), // waiting | active | ended
  topic: text("topic"),
  roundIndex: integer("round_index").default(0).notNull(),
  maxPlayers: integer("max_players").default(50).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
});

// ─── Arena Players ───────────────────────────────────────────────────────────
export const arenaPlayers = pgTable(
  "arena_players",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id").notNull().references(() => arenaSessions.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => profiles.id, { onDelete: "set null" }),
    nickname: text("nickname").notNull(),
    walletAddress: text("wallet_address"),
    score: integer("score").default(0).notNull(),
    correctAnswers: integer("correct_answers").default(0).notNull(),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (t) => [unique().on(t.sessionId, t.nickname)]
);

// ─── Quiz Questions (solo missions) ─────────────────────────────────────────
export const quizQuestions = pgTable("quiz_questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  theme: text("theme").notNull(), // e.g. "Avalanche Basics"
  question: text("question").notNull(),
  options: jsonb("options").$type<string[]>().notNull(), // exactly 4 options
  answer: integer("answer").notNull(), // zero-based index of correct option
  difficulty: text("difficulty").default("beginner").notNull(), // beginner | intermediate | advanced
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Arena Questions ─────────────────────────────────────────────────────────
export const arenaQuestions = pgTable("arena_questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  topic: text("topic").notNull(),
  question: text("question").notNull(),
  options: text("options").array().notNull(), // [A, B, C, D] — zero-indexed
  answer: integer("answer").notNull(),        // zero-indexed correct option
  explanation: text("explanation"),
  difficulty: text("difficulty").default("medium").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Arena Answers ───────────────────────────────────────────────────────────
export const arenaAnswers = pgTable("arena_answers", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").notNull().references(() => arenaSessions.id, { onDelete: "cascade" }),
  playerId: uuid("player_id").notNull().references(() => arenaPlayers.id, { onDelete: "cascade" }),
  questionId: uuid("question_id").notNull().references(() => arenaQuestions.id, { onDelete: "cascade" }),
  answer: integer("answer"),
  isCorrect: boolean("is_correct").default(false).notNull(),
  responseTimeMs: integer("response_time_ms"),
  pointsEarned: integer("points_earned").default(0).notNull(),
  answeredAt: timestamp("answered_at").defaultNow().notNull(),
});

// ─── App Settings ────────────────────────────────────────────────────────────
export const appSettings = pgTable("app_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Auth Sessions (for NextAuth) ────────────────────────────────────────────
export const authSessions = pgTable("auth_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Password Reset Tokens ────────────────────────────────────────────────────
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Relations ───────────────────────────────────────────────────────────────
export const profilesRelations = relations(profiles, ({ many }) => ({
  missionAttempts: many(missionAttempts),
  nftBadges: many(nftBadges),
  nftMints: many(nftMints),
  rewards: many(rewards),
  eventParticipants: many(eventParticipants),
  arenaSessions: many(arenaSessions),
  arenaPlayers: many(arenaPlayers),
}));

export const gamesRelations = relations(games, ({ many }) => ({
  missionAttempts: many(missionAttempts),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  host: one(profiles, { fields: [events.hostUserId], references: [profiles.id] }),
  participants: many(eventParticipants),
  missionAttempts: many(missionAttempts),
}));

export const eventParticipantsRelations = relations(eventParticipants, ({ one }) => ({
  event: one(events, { fields: [eventParticipants.eventId], references: [events.id] }),
  user: one(profiles, { fields: [eventParticipants.userId], references: [profiles.id] }),
}));

export const missionAttemptsRelations = relations(missionAttempts, ({ one }) => ({
  player: one(profiles, { fields: [missionAttempts.userId], references: [profiles.userId] }),
  game: one(games, { fields: [missionAttempts.gameId], references: [games.id] }),
  event: one(events, { fields: [missionAttempts.eventId], references: [events.id] }),
}));

export const arenaSessionsRelations = relations(arenaSessions, ({ one, many }) => ({
  host: one(profiles, { fields: [arenaSessions.hostId], references: [profiles.id] }),
  players: many(arenaPlayers),
}));

export const arenaPlayersRelations = relations(arenaPlayers, ({ one, many }) => ({
  session: one(arenaSessions, { fields: [arenaPlayers.sessionId], references: [arenaSessions.id] }),
  user: one(profiles, { fields: [arenaPlayers.userId], references: [profiles.id] }),
  answers: many(arenaAnswers),
}));

export const arenaAnswersRelations = relations(arenaAnswers, ({ one }) => ({
  session: one(arenaSessions, { fields: [arenaAnswers.sessionId], references: [arenaSessions.id] }),
  player: one(arenaPlayers, { fields: [arenaAnswers.playerId], references: [arenaPlayers.id] }),
  question: one(arenaQuestions, { fields: [arenaAnswers.questionId], references: [arenaQuestions.id] }),
}));

// ─── Type Exports ────────────────────────────────────────────────────────────
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;
export type Challenge = typeof challenges.$inferSelect;
export type NewChallenge = typeof challenges.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type EventParticipant = typeof eventParticipants.$inferSelect;
export type MissionAttempt = typeof missionAttempts.$inferSelect;
export type NftBadge = typeof nftBadges.$inferSelect;
export type NftMint = typeof nftMints.$inferSelect;
export type Reward = typeof rewards.$inferSelect;
export type ArenaSession = typeof arenaSessions.$inferSelect;
export type ArenaPlayer = typeof arenaPlayers.$inferSelect;
export type ArenaQuestion = typeof arenaQuestions.$inferSelect;
export type ArenaAnswer = typeof arenaAnswers.$inferSelect;
export type AppSetting = typeof appSettings.$inferSelect;
