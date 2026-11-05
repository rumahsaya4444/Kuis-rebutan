export type MediaKind = 'image' | 'video' | 'none';

export interface QuizQuestion {
  id: string;
  question: string;
  mediaType: MediaKind;
  mediaUrl?: string;
  videoUrl?: string;
  options: [string, string, string, string];
  correctIndex: number; // 0, 1, 2, 3
  timeLimitSeconds: number;
  explanation: string;
  category: string;
}

export interface QuizSet {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Mudah' | 'Menengah' | 'Sulit';
  coverImage?: string;
  questions: QuizQuestion[];
  createdDate: string;
  isCustom?: boolean;
}

export interface PlayerAvatar {
  iconId: string; // e.g., 'cat', 'bot', 'fox', 'knight', 'owl', 'alien', 'ninja'
  colorTheme: string; // e.g., 'emerald', 'indigo', 'amber', 'rose', 'cyan', 'violet'
  accessory: string; // e.g., 'crown', 'glasses', 'headphones', 'halo', 'none'
  title: string; // e.g., 'Si Kilat ⚡', 'Master Trivia 🧠'
}

export interface Player {
  id: string;
  name: string;
  avatar: PlayerAvatar;
  score: number;
  streak: number;
  bestStreak: number;
  totalCorrect: number;
  totalAnswered: number;
  totalTimeMs: number;
  isReady?: boolean;
  rank?: number;
  previousRank?: number;
  lastAnswer?: {
    questionIndex: number;
    selectedOption: number;
    isCorrect: boolean;
    pointsAwarded: number;
    timeElapsedMs: number;
  };
}

export type GamePhase = 
  | 'LOBBY' 
  | 'QUESTION' 
  | 'REVEAL' 
  | 'LEADERBOARD' 
  | 'PODIUM';

export interface RoomState {
  roomCode: string;
  hostId: string;
  quiz: QuizSet;
  phase: GamePhase;
  currentQuestionIndex: number;
  timeRemainingSeconds: number;
  questionStartTime: number;
  players: Record<string, Player>;
  answersReceived: Record<string, { option: number; timeElapsedMs: number; points: number }>;
}

export interface PlayerStatSummary {
  playerId: string;
  playerName: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracyPercentage: number;
  averageResponseTimeSeconds: number;
  totalScore: number;
  bestStreak: number;
  categoryStats: Record<string, { total: number; correct: number }>;
  questionHistory: Array<{
    questionText: string;
    mediaType: MediaKind;
    mediaUrl?: string;
    userSelected: number;
    correctOption: number;
    isCorrect: boolean;
    responseTimeMs: number;
    points: number;
    options: string[];
    explanation: string;
  }>;
}

export interface GlobalLeaderboardEntry {
  id: string;
  playerName: string;
  avatar: PlayerAvatar;
  xpScore: number;
  gamesPlayed: number;
  winCount: number;
  accuracy: number;
  tier: 'Master Kilat' | 'Jawara Kuis' | 'Penjelajah Cepat' | 'Pejuang Trivia' | 'Pemula';
  lastActive: string;
}

export interface FriendChallenge {
  id: string;
  senderName: string;
  senderAvatar: PlayerAvatar;
  quizTitle: string;
  quizCategory: string;
  roomCode: string;
  createdAt: number;
  expiresInSeconds: number;
}

export interface UserAccountProfile {
  id: string;
  syncToken: string;
  name: string;
  avatar: PlayerAvatar;
  stats: {
    totalGames: number;
    totalWins: number;
    totalPoints: number;
    highestStreak: number;
    accuracyRate: number;
  };
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    unlockedAt?: string;
    icon: string;
  }>;
  customQuizzes: QuizSet[];
}
