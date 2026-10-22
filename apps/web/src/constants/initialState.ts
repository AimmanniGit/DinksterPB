import {
  TournamentEvent,
  Division,
  Registration,
  Sponsor,
  TournamentMatch,
  CourtDeskState,
  Dispute,
  Incident,
} from '../types/organizer';

export const INITIAL_EVENT: TournamentEvent = {
  name: 'Dink Masters Open',
  dates: 'Sat Nov 7 - Sun Nov 8, 2026',
  venue: 'Barton Springs Pickleball, Austin',
  status: 'Draft',
  requireWaiver: true,
  seedByDupr: true,
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
    status: 'live',
    matchTitle: 'B-14  Okafor / Cruz vs Tran / Lee',
    score: [7, 5],
    referee: 'S. Hart',
    sinceTime: '1:20 PM',
  },
  {
    number: 2,
    status: 'live',
    matchTitle: 'B-15  Brooks / Diaz vs Singh / Hart',
    score: [3, 6],
    referee: 'M. Ono',
    sinceTime: '1:31 PM',
  },
  {
    number: 3,
    status: 'live',
    matchTitle: 'M107  Lowe / Shah vs Moss / Ito',
    score: [10, 10],
    referee: 'R. Gill',
    sinceTime: '1:12 PM',
    matchId: 'M107',
  },
  {
    number: 4,
    status: 'live',
    matchTitle: 'M108  Chen / Kim vs Park / Ruiz',
    score: [11, 9],
    referee: 'R. Gill',
    sinceTime: '1:05 PM',
    matchId: 'M108',
  },
  {
    number: 5,
    status: 'live',
    matchTitle: 'C-08  Singles, Reyes vs Chen',
    score: [4, 8],
    referee: 'A. Pruitt',
    sinceTime: '1:34 PM',
  },
  {
    number: 6,
    status: 'open',
  },
  {
    number: 7,
    status: 'open',
  },
  {
    number: 8,
    status: 'called',
    matchTitle: 'M109  Johnson / Rivera vs Cruz / Lee',
    matchId: 'M109',
  },
];

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
