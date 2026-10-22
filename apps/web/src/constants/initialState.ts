import {
  TournamentEvent,
  Division,
  Registration,
  Sponsor,
  TournamentMatch,
  CourtDeskState,
  Dispute,
  Incident,
  DivisionBracketData,
} from '../types/organizer';

export const INITIAL_EVENT: TournamentEvent = {
  name: 'Dink Masters Open',
  dates: 'Sat Nov 7 - Sun Nov 8, 2026',
  venue: 'Barton Springs Pickleball, Austin',
  status: 'Draft',
  requireWaiver: true,
  seedByDupr: true,
  totalCourts: 8,
  courtSurface: 'Outdoor Hardcourt',
};

export const INITIAL_DIVISIONS: Division[] = [
  {
    id: 'A',
    name: 'Mixed Doubles 3.5 to 4.0',
    format: 'Mixed doubles',
    minDupr: 3.5,
    maxDupr: 4.0,
    entryFee: 60,
    teamCap: 16,
  },
  {
    id: 'B',
    name: "Men's Doubles 4.0 and up",
    format: 'Doubles',
    minDupr: 4.0,
    maxDupr: 5.0,
    entryFee: 60,
    teamCap: 16,
  },
  {
    id: 'C',
    name: 'Singles Open',
    format: 'Singles',
    minDupr: 0,
    maxDupr: 5.5,
    entryFee: 45,
    teamCap: 24,
  },
];

const TEAM_NAMES = [
  'Reyes / Tran',
  'Johnson / Rivera',
  'Cruz / Lee',
  'Lowe / Shah',
  'Moss / Ito',
  'Patel / Kim',
  'Garcia / Wong',
  'Brooks / Diaz',
  'Singh / Hart',
  'Owens / Vega',
  'Park / Ruiz',
  'Chen / Boyd',
  'Khan / Fox',
  'Lopez / Reed',
  'Ward / Cole',
  'Young / Bell',
];

const DUPR_SCORES = [
  4.02, 3.65, 3.91, 3.88, 3.84, 3.80, 3.77, 3.74, 3.71, 3.68, 3.64, 3.62, 3.58, 3.55, 3.52, 3.50,
];

export const INITIAL_REGISTRATIONS: Registration[] = TEAM_NAMES.map((name, i) => ({
  id: `REG-${100 + i}`,
  teamName: name,
  avgDupr: DUPR_SCORES[i],
  waiverSigned: i !== 13,
  paymentStatus: i === 13 ? 'Pending' : 'Paid',
  seed: null,
}));

export const INITIAL_SPONSORS: Sponsor[] = [
  { name: 'Volt Paddles', tier: 'Title', courtAssigned: 2 },
  { name: 'Hill Country Hydration', tier: 'Gold', courtAssigned: null },
  { name: 'Barton Springs Bakery', tier: 'Community', courtAssigned: null },
];

export function generateInitialMatches(): TournamentMatch[] {
  const matches: TournamentMatch[] = [];
  let id = 101;

  // 6 Completed
  for (let i = 0; i < 6; i++) {
    matches.push({
      id: `M${id++}`,
      divisionId: 'A',
      status: 'COMPLETED',
      rules: 'To 11, win by 2',
      revision: 1,
    });
  }

  // 2 In Progress
  matches.push({
    id: `M${id++}`,
    divisionId: 'A',
    status: 'IN_PROGRESS',
    rules: 'To 11, win by 2',
    revision: 1,
    court: 3,
  });
  matches.push({
    id: `M${id++}`,
    divisionId: 'A',
    status: 'IN_PROGRESS',
    rules: 'To 11, win by 2',
    revision: 1,
    court: 4,
  });

  // 14 Scheduled
  for (let i = 0; i < 14; i++) {
    matches.push({
      id: `M${id++}`,
      divisionId: 'A',
      status: 'SCHEDULED',
      rules: 'To 11, win by 2',
      revision: 1,
    });
  }

  // 2 Pending
  for (let i = 0; i < 2; i++) {
    matches.push({
      id: `M${id++}`,
      divisionId: 'A',
      status: 'PENDING',
      rules: 'To 11, win by 2',
      revision: 1,
    });
  }

  return matches;
}

export const INITIAL_COURTS: CourtDeskState[] = [
  {
    number: 1,
    label: 'Stadium Court (Court 1)',
    status: 'live',
    matchTitle: 'B-14  Okafor / Cruz vs Tran / Lee',
    score: [7, 5],
    referee: 'S. Hart',
    sinceTime: '1:20 PM',
  },
  {
    number: 2,
    label: 'Court 2',
    status: 'live',
    matchTitle: 'B-15  Brooks / Diaz vs Singh / Hart',
    score: [3, 6],
    referee: 'M. Ono',
    sinceTime: '1:31 PM',
  },
  {
    number: 3,
    label: 'Court 3',
    status: 'live',
    matchTitle: 'M107  Lowe / Shah vs Moss / Ito',
    score: [10, 10],
    referee: 'R. Gill',
    sinceTime: '1:12 PM',
    matchId: 'M107',
  },
  {
    number: 4,
    label: 'Court 4',
    status: 'live',
    matchTitle: 'M108  Chen / Kim vs Park / Ruiz',
    score: [11, 9],
    referee: 'R. Gill',
    sinceTime: '1:05 PM',
    matchId: 'M108',
  },
  {
    number: 5,
    label: 'Court 5',
    status: 'live',
    matchTitle: 'C-08  Singles, Reyes vs Chen',
    score: [4, 8],
    referee: 'A. Pruitt',
    sinceTime: '1:34 PM',
  },
  {
    number: 6,
    label: 'Court 6',
    status: 'open',
  },
  {
    number: 7,
    label: 'Court 7',
    status: 'open',
  },
  {
    number: 8,
    label: 'Court 8',
    status: 'called',
    matchTitle: 'M109  Johnson / Rivera vs Cruz / Lee',
    matchId: 'M109',
  },
];

export function generateCourts(count: number, existingCourts: CourtDeskState[] = []): CourtDeskState[] {
  const safeCount = Math.max(1, Math.min(32, count));
  const result: CourtDeskState[] = [];
  
  for (let i = 1; i <= safeCount; i++) {
    const existing = existingCourts.find((c) => c.number === i) || INITIAL_COURTS.find((c) => c.number === i);
    if (existing) {
      result.push({
        ...existing,
        number: i,
        label: existing.label || (i === 1 ? 'Stadium Court (Court 1)' : `Court ${i}`),
      });
    } else {
      result.push({
        number: i,
        label: `Court ${i}`,
        status: 'open',
      });
    }
  }
  return result;
}

export const INITIAL_DISPUTES: Dispute[] = [
  {
    id: 'D1',
    matchId: 'M107',
    courtNumber: 3,
    raisedBy: 'Player T. Lowe',
    issue: 'Line call on game point at 10-10',
    status: 'Open',
    resolutionOptions: ['Replay the point', 'Referee call stands'],
  },
  {
    id: 'D2',
    matchId: 'M108',
    courtNumber: 4,
    raisedBy: 'Referee R. Gill',
    issue: 'Self-reported 11-8 does not match referee 11-9',
    status: 'Escalated',
    resolutionOptions: [
      'Confirm referee score 11-9',
      'Confirm self-reported score 11-8',
    ],
  },
];

export const INITIAL_INCIDENTS: Incident[] = [
  {
    time: '12:58 PM',
    courtNumber: 5,
    type: 'Injury',
    notes: 'Player rolled ankle, iced and rested, resumed play.',
  },
];

export const INITIAL_BRACKET_DATA: Record<string, DivisionBracketData> = {
  A: {
    divisionId: 'A',
    divisionName: 'Mixed Doubles 3.5 to 4.0',
    tournamentType: 'Pool Play (2 Pools of 4) &rarr; Single Elimination (Top 2 Advance)',
    pools: [
      {
        name: 'Pool A',
        teams: [
          { id: 't1', name: 'Miller & Smith', seed: 1, wins: 3, losses: 0, pointsFor: 33, pointsAgainst: 18, pointDiff: 15, qualified: true },
          { id: 't2', name: 'Chen & Davis', seed: 4, wins: 2, losses: 1, pointsFor: 30, pointsAgainst: 24, pointDiff: 6, qualified: true },
          { id: 't3', name: 'Jackson & Ruiz', seed: 5, wins: 1, losses: 2, pointsFor: 25, pointsAgainst: 29, pointDiff: -4, qualified: false },
          { id: 't4', name: 'Patel & Nguyen', seed: 8, wins: 0, losses: 3, pointsFor: 17, pointsAgainst: 34, pointDiff: -17, qualified: false },
        ],
        matches: [
          { id: 'pa1', team1: 'Miller & Smith', team2: 'Patel & Nguyen', score: [11, 4], status: 'COMPLETED', court: 1 },
          { id: 'pa2', team1: 'Chen & Davis', team2: 'Jackson & Ruiz', score: [11, 8], status: 'COMPLETED', court: 2 },
          { id: 'pa3', team1: 'Miller & Smith', team2: 'Jackson & Ruiz', score: [11, 6], status: 'COMPLETED', court: 1 },
          { id: 'pa4', team1: 'Chen & Davis', team2: 'Patel & Nguyen', score: [11, 5], status: 'COMPLETED', court: 3 },
          { id: 'pa5', team1: 'Miller & Smith', team2: 'Chen & Davis', score: [11, 8], status: 'COMPLETED', court: 1 },
          { id: 'pa6', team1: 'Jackson & Ruiz', team2: 'Patel & Nguyen', score: [11, 8], status: 'COMPLETED', court: 4 },
        ],
      },
      {
        name: 'Pool B',
        teams: [
          { id: 't5', name: 'AJ & MR', seed: 2, wins: 3, losses: 0, pointsFor: 33, pointsAgainst: 21, pointDiff: 12, qualified: true },
          { id: 't6', name: 'Thompson & Brooks', seed: 3, wins: 2, losses: 1, pointsFor: 31, pointsAgainst: 25, pointDiff: 6, qualified: true },
          { id: 't7', name: 'Wilson & Hayes', seed: 6, wins: 1, losses: 2, pointsFor: 24, pointsAgainst: 30, pointDiff: -6, qualified: false },
          { id: 't8', name: 'Taylor & Clark', seed: 7, wins: 0, losses: 3, pointsFor: 21, pointsAgainst: 33, pointDiff: -12, qualified: false },
        ],
        matches: [
          { id: 'pb1', team1: 'AJ & MR', team2: 'Taylor & Clark', score: [11, 6], status: 'COMPLETED', court: 2 },
          { id: 'pb2', team1: 'Thompson & Brooks', team2: 'Wilson & Hayes', score: [11, 7], status: 'COMPLETED', court: 4 },
          { id: 'pb3', team1: 'AJ & MR', team2: 'Wilson & Hayes', score: [11, 7], status: 'COMPLETED', court: 2 },
          { id: 'pb4', team1: 'Thompson & Brooks', team2: 'Taylor & Clark', score: [11, 7], status: 'COMPLETED', court: 3 },
          { id: 'pb5', team1: 'AJ & MR', team2: 'Thompson & Brooks', score: [11, 8], status: 'COMPLETED', court: 2 },
          { id: 'pb6', team1: 'Wilson & Hayes', team2: 'Taylor & Clark', score: [11, 8], status: 'COMPLETED', court: 5 },
        ],
      },
    ],
    playoffs: {
      quarters: [],
      semis: [
        {
          id: 'semi-1',
          round: 'semis',
          title: 'Semifinal 1 (Pool A #1 vs Pool B #2)',
          court: 1,
          status: 'COMPLETED',
          team1: { name: 'Miller & Smith', seed: 1, score: 11, winner: true },
          team2: { name: 'Thompson & Brooks', seed: 3, score: 8, winner: false },
        },
        {
          id: 'semi-2',
          round: 'semis',
          title: 'Semifinal 2 (Pool B #1 vs Pool A #2)',
          court: 2,
          status: 'LIVE',
          team1: { name: 'AJ & MR', seed: 2, score: 9, winner: false },
          team2: { name: 'Chen & Davis', seed: 4, score: 7, winner: false },
        },
      ],
      bronze: {
        id: 'bronze-match',
        round: 'bronze',
        title: '🥉 Bronze Medal Match (3rd Place)',
        court: 3,
        status: 'SCHEDULED',
        team1: { name: 'Thompson & Brooks', seed: 3 },
        team2: { name: 'TBD (Loser Semi 2)' },
      },
      final: {
        id: 'gold-final',
        round: 'final',
        title: '🏆 Gold & Silver Championship Final',
        court: 1,
        status: 'SCHEDULED',
        team1: { name: 'Miller & Smith', seed: 1 },
        team2: { name: 'TBD (Winner Semi 2)' },
      },
    },
  },
  B: {
    divisionId: 'B',
    divisionName: "Men's Doubles 4.0 and up",
    tournamentType: '8-Team Single Elimination Bracket with Bronze Match',
    pools: [],
    playoffs: {
      quarters: [
        {
          id: 'q1',
          round: 'quarters',
          title: 'Quarterfinal 1',
          court: 1,
          status: 'COMPLETED',
          team1: { name: 'Kowalski & Vogel', seed: 1, score: 11, winner: true },
          team2: { name: 'Ortiz & Sanders', seed: 8, score: 4, winner: false },
        },
        {
          id: 'q2',
          round: 'quarters',
          title: 'Quarterfinal 2',
          court: 2,
          status: 'COMPLETED',
          team1: { name: 'Foster & Vance', seed: 4, score: 11, winner: true },
          team2: { name: 'Gomez & Diaz', seed: 5, score: 9, winner: false },
        },
        {
          id: 'q3',
          round: 'quarters',
          title: 'Quarterfinal 3',
          court: 3,
          status: 'COMPLETED',
          team1: { name: 'Becker & Scott', seed: 2, score: 11, winner: true },
          team2: { name: 'Hughes & Kelly', seed: 7, score: 5, winner: false },
        },
        {
          id: 'q4',
          round: 'quarters',
          title: 'Quarterfinal 4',
          court: 4,
          status: 'COMPLETED',
          team1: { name: 'Wright & Young', seed: 3, score: 11, winner: true },
          team2: { name: 'Murphy & Bailey', seed: 6, score: 8, winner: false },
        },
      ],
      semis: [
        {
          id: 'b-semi-1',
          round: 'semis',
          title: 'Semifinal 1',
          court: 1,
          status: 'COMPLETED',
          team1: { name: 'Kowalski & Vogel', seed: 1, score: 11, winner: true },
          team2: { name: 'Foster & Vance', seed: 4, score: 9, winner: false },
        },
        {
          id: 'b-semi-2',
          round: 'semis',
          title: 'Semifinal 2',
          court: 2,
          status: 'LIVE',
          team1: { name: 'Becker & Scott', seed: 2, score: 10, winner: false },
          team2: { name: 'Wright & Young', seed: 3, score: 8, winner: false },
        },
      ],
      bronze: {
        id: 'b-bronze',
        round: 'bronze',
        title: '🥉 Bronze Medal Match',
        court: 3,
        status: 'SCHEDULED',
        team1: { name: 'Foster & Vance', seed: 4 },
        team2: { name: 'TBD (Loser Semi 2)' },
      },
      final: {
        id: 'b-final',
        round: 'final',
        title: '🏆 Gold Championship Final',
        court: 1,
        status: 'SCHEDULED',
        team1: { name: 'Kowalski & Vogel', seed: 1 },
        team2: { name: 'TBD (Winner Semi 2)' },
      },
    },
  },
};
