import PusherServer from "pusher";
import PusherClient from "pusher-js";

// Server-side Pusher instance (for API routes)
export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

// Client-side Pusher instance (singleton)
let pusherClientInstance: PusherClient | null = null;

export function getPusherClient(): PusherClient {
  if (pusherClientInstance) return pusherClientInstance;

  pusherClientInstance = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  });

  return pusherClientInstance;
}

// Arena channel helpers
export const arenaChannel = (code: string) => `arena-${code}`;
export const ARENA_EVENTS = {
  PLAYER_JOINED: "player-joined",
  PLAYER_LEFT: "player-left",
  SESSION_STARTED: "session-started",
  QUESTION_PUSHED: "question-pushed",
  ANSWER_SUBMITTED: "answer-submitted",
  LEADERBOARD_UPDATE: "leaderboard-update",
  SESSION_ENDED: "session-ended",
  SCORE_UPDATE: "score-update",
} as const;
