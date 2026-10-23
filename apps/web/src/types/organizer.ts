export type Role = 'org' | 'desk' | 'ref' | 'tv';
export type TabKey =
  | 'fleet'
  | 'dash'
  | 'overview'
  | 'setup'
  | 'divisions'
  | 'regs'
  | 'brackets'
  | 'sponsors'
  | 'analytics'
  | 'copilot'
  | 'log'
  | 'board'
  | 'disputes'
  | 'incidents'
  | 'card'
  | 'tv';

export interface PoolTeam {
  id: string;
  name: string;
  seed: number;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  pointDiff: number;
  qualified: boolean;
}

export interface PoolGroup {
  name: string; // e.g. "Pool A", "Pool B"
  teams: PoolTeam[];
  matches: Array<{
    id: string;
    team1: string;
    team2: string;
    score?: [number, number];
    status: 'COMPLETED' | 'LIVE' | 'SCHEDULED';
    court?: number;
  }>;
}

export interface PlayoffMatchNode {
  id: string;
  round: 'quarters' | 'semis' | 'bronze' | 'final';
  title: string; // e.g. "Semifinal 1", "Gold Medal Final"
  court?: number;
  team1: {
    name: string;
    seed?: number;
    score?: number;
    winner?: boolean;
  };
  team2: {
    name: string;
    seed?: number;
    score?: number;
    winner?: boolean;
  };
  status: 'SCHEDULED' | 'LIVE' | 'COMPLETED';
}

export interface PodiumAthlete {
  team: string;
  seed?: string;
  club?: string;
  score?: string;
}

export interface DivisionPodium {
  gold: PodiumAthlete;
  silver: PodiumAthlete;
  bronze: PodiumAthlete;
}

export interface DivisionBracketData {
  divisionId: string;
  divisionName: string;
  tournamentType: string;
  stage?: 'pools' | 'playoffs' | 'concluded';
  podium?: DivisionPodium;
  pools: PoolGroup[];
  playoffs: {
    quarters: PlayoffMatchNode[];
    semis: PlayoffMatchNode[];
    bronze: PlayoffMatchNode;
    final: PlayoffMatchNode;
  };
}

export interface Division {
  id: string;
  name: string;
  format: string;
  minDupr: number;
  maxDupr: number;
  entryFee: number;
  teamCap: number;
  isPilot?: boolean;
  ageBracket?: string;
  scoringFormat?: string;
  scheduleDay?: 'Saturday' | 'Sunday' | 'Friday' | string;
  timeSlot?: string;
}

export interface TournamentEvent {
  id: string;
  name: string;
  slug: string;
  joinCode: string;
  dates: string;
  venue: string;
  status: 'Live' | 'Published' | 'Draft' | 'Concluded';
  requireWaiver: boolean;
  seedByDupr: boolean;
  totalCourts: number;
  courtSurface?: string;
  ballType?: string;
  tournamentFormat?: string;
  registrationDeadline?: string;
  rulesNotes?: string;
  contactEmail?: string;
  sanctioningBody?: string;
  city?: string;
  state?: string;
  divisionsCount?: number;
  registeredCount?: number;
  maxCapacity?: number;
  revenue?: number;
}

export interface PastDivisionMatchResult {
  matchId: string;
  round: string;
  opponentTeam: string;
  scores: string;
  result: 'W' | 'L';
}

export interface PastDivisionRecord {
  tournamentSlug: string;
  tournamentName: string;
  divisionId: string;
  divisionName: string;
  dates: string;
  venue: string;
  city: string;
  finishPlacement: string;
  medal?: 'gold' | 'silver' | 'bronze';
  partnerName: string;
  matchesPlayed: number;
  matchesWon: number;
  duprDelta?: string;
  matchResults: PastDivisionMatchResult[];
}

export interface PlayerAccount {
  id: string;
  dinksterId: string;
  email: string;
  fullName: string;
  phone: string;
  duprRating?: number;
  duprId?: string;
  age?: number;
  emergencyName?: string;
  emergencyPhone?: string;
  registeredDivisions: Array<{
    tournamentSlug: string;
    tournamentName: string;
    divisionId: string;
    divisionName: string;
    teamName: string;
    isCaptain: boolean;
    scheduleDay?: string;
    timeSlot?: string;
    teammateCode?: string;
    amountPaid: number;
    partnerName?: string;
    status?: 'confirmed' | 'pending_partner' | 'checked_in' | 'awaiting_partner';
    courtAssigned?: number;
  }>;
  pastDivisions?: PastDivisionRecord[];
  careerStats?: {
    matchesPlayed: number;
    matchesWon: number;
    winRate: number;
    golds: number;
    silvers: number;
    bronzes: number;
  };
}

export interface TournamentFleetStats {
  totalTournaments: number;
  liveCount: number;
  upcomingCount: number;
  draftCount: number;
  concludedCount: number;
  totalRevenue: number;
  totalPlayers: number;
  activeCourtsTotal: number;
}


export interface Registration {
  id: string;
  teamName: string;
  avgDupr: number;
  waiverSigned: boolean;
  paymentStatus: 'Paid' | 'Pending' | 'Refunded';
  seed: number | null;
}

export type SponsorScope = 'global' | 'event';
export type SponsorCategory =
  | 'title'           // Title / Presenting Partner
  | 'court'           // Court Naming Rights (Court 1, Court 2...)
  | 'division_medal'  // Division / Medal Sponsor (Gold / Silver / Bronze)
  | 'hydration'       // Hydration & Nutrition (Electrolit, Celsius...)
  | 'finance'         // Official Financial / Bank Partner (Chase, Frost...)
  | 'paddles_gear'    // Paddles & Balls (Joola, Selkirk, Franklin...)
  | 'scorecards'      // Digital Scorecards & Desk Clipboards
  | 'apparel'         // Official Tournament Apparel & Merch
  | 'vendor_village'; // On-Site Vendor Village Booth

export interface Sponsor {
  id?: string;
  name: string;
  tier: 'Title' | 'Gold' | 'Community' | 'Premier Diamond' | 'Title Presenting' | 'Supporting Silver' | 'Official Gold';
  scope?: SponsorScope; // 'global' (fleet-wide multi-event) or 'event' (this tournament)
  category?: SponsorCategory;
  categoryLabel?: string;
  courtAssigned: number | null; // e.g., Court 1, Court 2
  divisionAssigned?: string | null; // e.g., Division A, Gold/Silver/Bronze
  assetDescription?: string; // e.g., "Official digital scorecard sponsor & desk clipboards"
  amountPaid?: number; // Contract cash value, e.g. $2,500
  startDate?: string;
  endDate?: string; // Time-bound for global contracts
  websiteUrl?: string;
  deliverables?: {
    jumboTvDisplay?: boolean;
    playerPortalBanner?: boolean;
    courtBanners?: boolean;
    mobileAppShoutout?: boolean;
  };
}

export type UserRole = 'founder' | 'director' | 'marshall' | 'volunteer';

export interface UserActorProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  avatarInitials: string;
  permissions: {
    canViewFinancials: boolean; // Gross revenue, entry fee intake, bank payouts
    canViewAnalytics: boolean; // Executive analytics dashboard & reporting across tournaments
    canManageFleet: boolean; // Create, archive, delete tournaments across fleet
    canManageGlobalSponsors: boolean; // Manage company-wide annual sponsor deals
    canManageEventSponsors: boolean; // Manage tournament-level court/medal sponsors
    canEditTournamentRules: boolean; // Scoring rules, mid-tournament rule pivot
    canDispatchCourts: boolean; // Match caller, live court assignments
    canResolveDisputes: boolean; // Incident logging, referee disputes
    canInputScores: boolean; // Score entry
  };
}

export interface TournamentMatch {
  id: string;
  divisionId: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'SCHEDULED' | 'PENDING';
  rules: string;
  revision: number;
  court?: number;
  team1?: string;
  team2?: string;
  score?: [number, number];
}

export interface CourtDeskState {
  number: number;
  label?: string;
  surface?: string;
  status: 'live' | 'called' | 'open' | 'blocked';
  matchTitle?: string;
  score?: [number, number];
  referee?: string;
  sinceTime?: string;
  matchId?: string;
}

export interface Dispute {
  id: string;
  matchId: string;
  courtNumber: number;
  raisedBy: string;
  issue: string;
  status: 'Open' | 'Escalated' | 'Resolved';
  resolutionOptions: string[];
  copilotSummary?: string;
  decision?: string;
}

export interface Incident {
  time: string;
  courtNumber: number;
  type: 'Injury' | 'Equipment' | 'Conduct' | 'Other';
  notes: string;
}

export interface ChangeLogEntry {
  time: string;
  actor: string;
  tool: string;
  matchCount: number;
  before: string;
  after: string;
  savedMinutes: number;
  matchIds: string[];
  isRolledBack: boolean;
}

export interface CopilotProposal {
  id: number;
  type: 'pivot' | 'draft' | 'seed' | 'dink' | 'move' | 'alert' | 'undo';
  title: string;
  toolName: string;
  body: string;
  status: 'proposed' | 'executed' | 'rejected';
  data: any;
}
