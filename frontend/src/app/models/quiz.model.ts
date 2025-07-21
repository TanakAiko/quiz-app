export interface Quote {
    id: number;
    quote: string;
    author?: string;
}

export interface QuoteSubmission {
    id: number;
    answer: string;
}

export interface QuoteResult {
    success: boolean;
    message?: string;
}

export interface LeaderboardEntry {
    name: string;
    score: number;
    time?: number;
    date?: string;
  }

export interface LeaderboardResult {
    success: boolean;
    leaderboard: LeaderboardEntry[];
}