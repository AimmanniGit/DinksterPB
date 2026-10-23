import React, { useState } from 'react';
import { TournamentMatch } from '../../types/organizer';

interface RefereeScorecardViewProps {
  match?: TournamentMatch;
  onSubmitFinalScore: (sets: [number, number][]) => void;
  onFlagDispute: () => void;
}

export const RefereeScorecardView: React.FC<RefereeScorecardViewProps> = ({
  match,
  onSubmitFinalScore,
  onFlagDispute,
}) => {
  const [sets, setSets] = useState<[number, number][]>([
    [11, 8],
    [9, 11],
    [12, 10],
  ]);
  const [errorMessage, setErrorMessage] = useState('');

  const isCompleted = match?.status === 'COMPLETED';

  const handleSubmit = () => {
    // Validate scores: at least 11 points and win by 2
    const playedSets = sets.filter((s) => s[0] > 0 || s[1] > 0);
    if (playedSets.length === 0) {
      setErrorMessage('Please enter at least one game score.');
      return;
    }

    const invalidSets = playedSets.filter(
      (s) => Math.max(...s) < 11 || Math.abs(s[0] - s[1]) < 2
    );

    if (invalidSets.length > 0) {
      setErrorMessage(
        `${invalidSets[0][0]}-${invalidSets[0][1]} is not a valid score. Pickleball games go to 11 and must be won by 2.`
      );
      return;
    }

    const team0Wins = playedSets.filter((s) => s[0] > s[1]).length;
    const team1Wins = playedSets.filter((s) => s[1] > s[0]).length;
    if (Math.max(team0Wins, team1Wins) < 2) {
      setErrorMessage('Best of 3 matches require one team to win 2 games.');
      return;
    }

    setErrorMessage('');
    onSubmitFinalScore(playedSets);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Referee Scorecard</h1>
          <p className="text-sm text-gray-600">
            Assigned: Court 3 &bull; M107 &bull; Lowe / Shah vs Moss / Ito
          </p>
        </div>
        <span
          className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
            isCompleted ? 'bg-green-100 text-[#0A5C43]' : 'bg-amber-100 text-amber-800'
          }`}
        >
          {match?.status || 'IN_PROGRESS'}
        </span>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-black/10 shadow-sm max-w-xl">
        {isCompleted ? (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">
              🔒 Final Score Locked
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Completed matches cannot be modified. Completed results outrank self-reported scores. If a correction is required, the court desk must initiate a review.
            </p>
            <div className="bg-[#E8F7F1] p-4 rounded-xl font-mono font-bold text-lg text-[#0A5C43]">
              Final Recorded: {sets.map((s) => `${s[0]}-${s[1]}`).join(', ')}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="text-xs font-bold text-gray-500 uppercase">
              Format: {match?.rules || 'To 11, win by 2'} &bull; Best of 3 Sets
            </div>

            {sets.map((set, setIdx) => (
              <div key={setIdx} className="flex justify-between items-center py-2 border-b">
                <span className="font-bold text-sm text-gray-800">Game {setIdx + 1}</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={set[0]}
                    onChange={(e) => {
                      const updated = [...sets] as [number, number][];
                      updated[setIdx] = [Number(e.target.value), updated[setIdx][1]];
                      setSets(updated);
                    }}
                    className="w-16 bg-[#FAF8F3] border border-black/10 rounded-lg p-2 text-center font-mono font-bold text-base"
                  />
                  <span className="text-xs font-bold text-gray-400">to</span>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={set[1]}
                    onChange={(e) => {
                      const updated = [...sets] as [number, number][];
                      updated[setIdx] = [updated[setIdx][0], Number(e.target.value)];
                      setSets(updated);
                    }}
                    className="w-16 bg-[#FAF8F3] border border-black/10 rounded-lg p-2 text-center font-mono font-bold text-base"
                  />
                </div>
              </div>
            ))}

            {errorMessage && (
              <div className="bg-red-50 text-red-700 text-xs font-bold p-3 rounded-xl border border-red-200">
                ⚠️ {errorMessage}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSubmit}
                className="flex-1 py-3 bg-[#0A5C43] text-white rounded-xl text-xs font-bold hover:opacity-95 shadow-sm"
              >
                Submit Final Score (Lock Match)
              </button>
              <button
                onClick={onFlagDispute}
                className="py-3 px-4 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200"
              >
                Flag Dispute to Desk
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
