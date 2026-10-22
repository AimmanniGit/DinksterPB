export type Role = 'org' | 'desk' | 'ref' | 'tv';
export type TabKey =
  | 'dash'
  | 'setup'
  | 'regs'
  | 'brackets'
  | 'sponsors'
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
}

export interface TournamentEvent {
  name: string;
  slug?: string;
  joinCode?: string;
  dates: string;
  venue: string;
  status: 'Draft' | 'Published' | 'Live';
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
}

export interface Registration {
  id: string;
  teamName: string;
  avgDupr: number;
  waiverSigned: boolean;
  paymentStatus: 'Paid' | 'Pending' | 'Refunded';
  seed: number | null;
}

export interface Sponsor {
  name: string;
  tier: 'Title' | 'Gold' | 'Community';
  courtAssigned: number | null;
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
