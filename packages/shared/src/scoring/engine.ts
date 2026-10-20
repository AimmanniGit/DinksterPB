import { MatchFormat, GameMode, ScoreState } from '../types';

/**
 * Creates a new Game ScoreState based on official Dinkster locked rules.
 */
export function createGame(params: {
  format: MatchFormat;
  mode: GameMode;
  targetScore?: number;
  bestOf?: number;
  firstServerTeam?: number;
  teamNames?: [string, string];
  isHost?: boolean;
}): ScoreState {
  const {
    format,
    mode,
    targetScore = 11,
    bestOf = 1,
    firstServerTeam = 0,
    teamNames = ['AJ & MR', 'JC & SK'],
    isHost = true,
  } = params;

  return {
    format,
    mode,
    targetScore,
    bestOf,
    teamNames,
    sets: [],
    currentScore: [0, 0],
    servingTeam: firstServerTeam,
    serverNumber: format === 'doubles' ? 2 : 1, // First server of the game starts as Server 2 under standard 2-server rule
    firstServerOfGame: firstServerTeam,
    isGameOver: false,
    shots: 0,
    ralliesCount: 0,
    sideOutsCount: 0,
    switchEndsNotice: false,
    nextSetNotice: false,
    isHost,
  };
}

/**
 * Generates the official audible/screen callout string (e.g. "4-2-1" or "3-5").
 */
export function getCalloutString(state: ScoreState): string {
  const serverScore = state.currentScore[state.servingTeam];
  const receiverScore = state.currentScore[1 - state.servingTeam];
  if (state.format === 'doubles') {
    return `${serverScore}-${receiverScore}-${state.serverNumber}`;
  }
  return `${serverScore}-${receiverScore}`;
}

/**
 * Calculates number of sets won per team.
 */
export function getSetsWon(state: ScoreState): [number, number] {
  return [
    state.sets.filter(s => s[0] > s[1]).length,
    state.sets.filter(s => s[1] > s[0]).length,
  ];
}

/**
 * Processes a rally outcome where winningTeamIndex (0 or 1) won the rally.
 * Returns a cloned, immutable new ScoreState.
 */
export function processRally(currentState: ScoreState, winningTeamIndex: 0 | 1): ScoreState {
  if (currentState.isGameOver) return currentState;

  const state: ScoreState = JSON.parse(JSON.stringify(currentState));
  state.shots = 0; // Reset Dink Battle shot counter for the next rally
  state.ralliesCount++;

  if (winningTeamIndex === state.servingTeam) {
    // Serving team wins rally: award point
    state.currentScore[winningTeamIndex]++;
  } else if (state.format === 'doubles' && state.serverNumber === 1) {
    // Receiving team wins rally, doubles first server: move to second server
    state.serverNumber = 2;
  } else {
    // Side out occurs: switch serving team
    state.servingTeam = 1 - state.servingTeam;
    state.serverNumber = 1;
    state.sideOutsCount++;
  }

  // Check for Side-switch prompt (when first team reaches 6)
  const [s0, s1] = state.currentScore;
  if (!state.switchEndsNotice && Math.max(s0, s1) === 6) {
    state.switchEndsNotice = true;
  }

  // Check for Set / Game Completion (must win by at least 2)
  if (Math.max(s0, s1) >= state.targetScore && Math.abs(s0 - s1) >= 2) {
    state.sets.push([s0, s1]);
    const setsWon = getSetsWon(state);
    const setsNeeded = Math.ceil(state.bestOf / 2);

    if (Math.max(...setsWon) >= setsNeeded) {
      state.isGameOver = true;
    } else {
      // Transition to next set in Best of 3
      state.currentScore = [0, 0];
      state.firstServerOfGame = 1 - state.firstServerOfGame;
      state.servingTeam = state.firstServerOfGame;
      state.serverNumber = state.format === 'doubles' ? 2 : 1;
      state.switchEndsNotice = false;
      state.nextSetNotice = true;
    }
  }

  return state;
}

/**
 * Handles silent host override adjustments.
 */
export function hostOverrideScore(
  currentState: ScoreState,
  teamIndex: 0 | 1,
  newScore: number
): ScoreState {
  if (!currentState.isHost) return currentState;
  const state: ScoreState = JSON.parse(JSON.stringify(currentState));
  state.currentScore[teamIndex] = Math.max(0, newScore);

  const [s0, s1] = state.currentScore;
  if (Math.max(s0, s1) >= state.targetScore && Math.abs(s0 - s1) >= 2) {
    state.sets.push([s0, s1]);
    const setsWon = getSetsWon(state);
    const setsNeeded = Math.ceil(state.bestOf / 2);
    if (Math.max(...setsWon) >= setsNeeded) {
      state.isGameOver = true;
    }
  }
  return state;
}

/**
 * Dink Battle: Increments rally shot counter.
 */
export function addDinkShot(currentState: ScoreState): ScoreState {
  const state: ScoreState = JSON.parse(JSON.stringify(currentState));
  state.shots++;
  return state;
}

/**
 * Dink Battle: Awards point if a player hit out when court shrunk (shot >= 5).
 */
export function processDinkOutBy(currentState: ScoreState, offendingTeam: 0 | 1): ScoreState {
  const winningTeam = (1 - offendingTeam) as 0 | 1;
  return processRally(currentState, winningTeam);
}
