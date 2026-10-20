// ==========================================
// Dinkster Core Shared Types
// ==========================================

export type DinksterId = `DK-${string}`;
export type GameCode = `D-${string}`;

export type MatchFormat = 'singles' | 'doubles';
export type GameMode = 'classic' | 'dink'; // 'dink' = Dink Battle pilot variation

export type ThemeName = 'default' | 'genz1' | 'genz2' | 'mil1' | 'mil2';

export interface ScoreState {
  format: MatchFormat;
  mode: GameMode;
  targetScore: number;       // 11, 15, or 9
  bestOf: number;            // 1 or 3 sets
  teamNames: [string, string];
  sets: [number, number][];  // Completed sets
  currentScore: [number, number];
  servingTeam: number;       // 0 or 1
  serverNumber: number;      // 1 or 2 (in doubles)
  firstServerOfGame: number; // 0 or 1
  isGameOver: boolean;
  shots: number;             // Dink Battle shot counter
  ralliesCount: number;
  sideOutsCount: number;
  switchEndsNotice: boolean; // Prompt when first team hits 6
  nextSetNotice: boolean;
  isHost: boolean;
}

export interface PlayerProfile {
  id: DinksterId;
  name: string;
  initials: string;
  dupr: number;
  distance: string;
  gamesPlayed: number;
  verified: boolean;
  likesYou: boolean;
  vibeTags: string[];
  lookingFor: string;
  promptQuestion: string;
  promptAnswer: string;
  whyMatch: string;
}

export type MatchState = 'new' | 'proposed' | 'planned' | 'played';

export interface Proposal {
  id: string;
  when: string;
  venue: string;
  gameCode: GameCode;
  proposedByTeam: number;
  accepted: boolean;
}

export interface CrewMember {
  name: string;
  initials: string;
  dupr: number;
  state: MatchState;
  unread: boolean;
  messages: Array<{ fromMe: boolean; text: string; timestamp?: string }>;
  proposal?: Proposal;
  gamesPlayedTogether?: number;
}

export interface CourtVenue {
  id: number;
  name: string;
  type: 'free' | 'paid';
  isIndoor: boolean;
  distance: string;
  courtCount: number;
  ratePerHour?: number;
  peakRatePerHour?: number;
  rating?: string;
  info: string;
  availabilityText: string;
  claimedByCurrentUser?: boolean;
}

export interface BenefitSlot {
  key: 'wellhub' | 'classpass' | 'insurance';
  label: string;
  venueName: string;
  location: string;
  slots: [string, string][];
  ctaText: string;
}
