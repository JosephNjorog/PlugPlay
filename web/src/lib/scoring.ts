export interface ScoreInput {
  accuracy: number; // 0-100 percentage
  timeSpent: number; // seconds
  timeLimit: number; // seconds
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  attemptNumber: number; // 1 = first attempt
}

export interface ScoreResult {
  score: number;
  accuracyPts: number;
  speedBonus: number;
  perfectBonus: number;
  fastBonus: number;
  difficultyMultiplier: number;
  retryPenalty: number;
}

export function difficultyMultiplier(difficulty: string): number {
  switch (difficulty.toLowerCase()) {
    case "advanced": return 1.6;
    case "intermediate": return 1.3;
    default: return 1.0;
  }
}

export function rarityFor(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case "advanced": return "legendary";
    case "intermediate": return "rare";
    default: return "common";
  }
}

export function predictScore(input: ScoreInput): ScoreResult {
  const accuracyPts = Math.round((input.accuracy / 100) * 500);
  const timeRemaining = Math.max(0, input.timeLimit - input.timeSpent);
  const speedBonus = Math.round((timeRemaining / input.timeLimit) * 200);
  const mult = difficultyMultiplier(input.difficulty);
  const penalty = Math.max(0.5, 1.0 - (input.attemptNumber - 1) * 0.15);
  const perfectBonus = input.accuracy === 100 && input.attemptNumber === 1 ? 100 : 0;
  const fastBonus = input.timeSpent < input.timeLimit * 0.5 ? 50 : 0;

  const score = Math.floor((accuracyPts + speedBonus) * mult * penalty) + perfectBonus + fastBonus;

  return {
    score,
    accuracyPts,
    speedBonus,
    perfectBonus,
    fastBonus,
    difficultyMultiplier: mult,
    retryPenalty: penalty,
  };
}

export function xpFromScore(score: number): number {
  return Math.floor(score / 10);
}
