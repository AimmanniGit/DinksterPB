export type Role = 'org' | 'desk' | 'ref';
export type TabKey =
  | 'dash'
  | 'setup'
  | 'regs'
  | 'sponsors'
  | 'copilot'
  | 'log'
  | 'board'
  | 'disputes'
  | 'incidents'
  | 'card';

export interface Division {
  id: string;
  name: string;
  format: string;
  minDupr: number;
  maxDupr: number;
  entryFee: number;
  teamCap: number;
  isPilot?: boolean;
}

export interface TournamentEvent {
  name: string;
  dates: string;
  venue: string;
  status: 'Draft' | 'Published' | 'Live';
  requireWaiver: boolean;
  seedByDupr: boolean;
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
