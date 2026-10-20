import { create } from 'zustand';
import {
  ScoreState,
  MatchFormat,
  GameMode,
  createGame,
  processRally,
  hostOverrideScore,
  addDinkShot,
  processDinkOutBy,
  getCalloutString,
} from '@dinkster/shared';

interface GameStore {
  game: ScoreState | null;
  gameCode: string;
  undoStack: ScoreState[];
  
  // Actions
  startNewGame: (params: {
    format: MatchFormat;
    mode: GameMode;
    targetScore?: number;
    bestOf?: number;
    teamNames?: [string, string];
    isHost?: boolean;
    code?: string;
  }) => void;
  recordRally: (winnerIndex: 0 | 1) => void;
  sideOut: () => void;
  overrideScore: (teamIndex: 0 | 1, newScore: number) => void;
  undo: () => void;
  addShot: () => void;
  recordOutBy: (offendingTeam: 0 | 1) => void;
  dismissSwitchNotice: () => void;
  dismissSetNotice: () => void;
  callout: () => string;
}

export const useGameStore = create<GameStore>((set, get) => ({
  game: null,
  gameCode: 'D-7741',
  undoStack: [],

  startNewGame: ({ format, mode, targetScore = 11, bestOf = 1, teamNames, isHost = true, code = 'D-7741' }) => {
    const newGame = createGame({
      format,
      mode,
      targetScore,
      bestOf,
      teamNames,
      isHost,
    });
    set({ game: newGame, gameCode: code, undoStack: [] });
  },

  recordRally: (winnerIndex: 0 | 1) => {
    const { game, undoStack } = get();
    if (!game || game.isGameOver) return;
    
    // Save state to undo stack
    const updatedUndo = [...undoStack, JSON.parse(JSON.stringify(game))];
    const nextGame = processRally(game, winnerIndex);
    set({ game: nextGame, undoStack: updatedUndo });
  },

  sideOut: () => {
    const { game, undoStack } = get();
    if (!game || game.isGameOver) return;
    const updatedUndo = [...undoStack, JSON.parse(JSON.stringify(game))];
    
    // Force a side-out
    const nextGame: ScoreState = JSON.parse(JSON.stringify(game));
    nextGame.servingTeam = (1 - nextGame.servingTeam);
    nextGame.serverNumber = 1;
    nextGame.sideOutsCount++;
    set({ game: nextGame, undoStack: updatedUndo });
  },

  overrideScore: (teamIndex: 0 | 1, newScore: number) => {
    const { game, undoStack } = get();
    if (!game) return;
    const updatedUndo = [...undoStack, JSON.parse(JSON.stringify(game))];
    const nextGame = hostOverrideScore(game, teamIndex, newScore);
    set({ game: nextGame, undoStack: updatedUndo });
  },

  undo: () => {
    const { undoStack } = get();
    if (undoStack.length === 0) return;
    const previousState = undoStack[undoStack.length - 1];
    set({
      game: previousState,
      undoStack: undoStack.slice(0, undoStack.length - 1),
    });
  },

  addShot: () => {
    const { game } = get();
    if (!game || game.isGameOver) return;
    set({ game: addDinkShot(game) });
  },

  recordOutBy: (offendingTeam: 0 | 1) => {
    const { game, undoStack } = get();
    if (!game || game.isGameOver) return;
    const updatedUndo = [...undoStack, JSON.parse(JSON.stringify(game))];
    const nextGame = processDinkOutBy(game, offendingTeam);
    set({ game: nextGame, undoStack: updatedUndo });
  },

  dismissSwitchNotice: () => {
    const { game } = get();
    if (!game) return;
    set({ game: { ...game, switchEndsNotice: false } });
  },

  dismissSetNotice: () => {
    const { game } = get();
    if (!game) return;
    set({ game: { ...game, nextSetNotice: false } });
  },

  callout: () => {
    const { game } = get();
    return game ? getCalloutString(game) : '0-0-2';
  },
}));
