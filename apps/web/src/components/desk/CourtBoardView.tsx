import React, { useState } from 'react';
import { CourtDeskState, Sponsor, TournamentMatch } from '../../types/organizer';

interface CourtBoardViewProps {
  courts: CourtDeskState[];
  sponsors: Sponsor[];
  matches: TournamentMatch[];
  onCallNextMatch: (courtNumber: number) => void;
  onStartMatch: (courtNumber: number) => void;
  onBlockCourt: (courtNumber: number) => void;
  onReopenCourt: (courtNumber: number) => void;
  onUpdateScore: (courtNumber: number, teamIndex: 0 | 1, delta: number) => void;
  onEndMatch: (courtNumber: number) => void;
  onSimulateWetSpot: () => void;
}

export const CourtBoardView: React.FC<CourtBoardViewProps> = ({
  courts,
  sponsors,
  matches,
  onCallNextMatch,
  onStartMatch,
  onBlockCourt,
  onReopenCourt,
  onUpdateScore,
  onEndMatch,
  onSimulateWetSpot,
}) => {
  const [activeKioskCourt, setActiveKioskCourt] = useState<CourtDeskState | null>(null);

  const getSponsorName = (courtNumber: number) => {
    const sp = sponsors.find((s) => s.courtAssigned === courtNumber);
    return sp ? `presented by ${sp.name}` : null;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-display font-bold text-3xl">Court Desk Board</h1>
          <p className="text-sm text-gray-600">
            Real-time court management, referee scoring, and automated court calls across all {courts.length} courts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/tv"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            📺 Open TV Jumbotron
          </a>
          <button
            onClick={onSimulateWetSpot}
            className="px-3.5 py-2 bg-amber-100 text-amber-800 border border-amber-300 rounded-xl text-xs font-bold hover:bg-amber-200 transition-colors"
          >
            ⚠️ Simulate Court 3 Wet Spot
          </button>
        </div>
      </div>

      {/* 8-Court Grid */}
      <div className="grid grid-cols-4 gap-4">
        {courts.map((c) => {
          const sponsorText = getSponsorName(c.number);
          const isLive = c.status === 'live';
          const isCalled = c.status === 'called';
          const isBlocked = c.status === 'blocked';
          const isOpen = c.status === 'open';

          return (
            <div
              key={c.number}
              className={`bg-white rounded-2xl border-2 p-4 flex flex-col justify-between min-h-[220px] transition-all ${
                isLive
                  ? 'border-[#0A5C43] shadow-md'
                  : isCalled
                  ? 'border-[#EF9F27]'
                  : isBlocked
                  ? 'border-red-400 bg-red-50/40 border-dashed'
                  : 'border-black/10'
              }`}
            >
              <div>
                {/* Court Header */}
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-display font-extrabold text-lg">Court {c.number}</h3>
                    {sponsorText && (
                      <p className="text-[11px] font-bold text-[#0A5C43]">{sponsorText}</p>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isLive
                        ? 'bg-green-100 text-[#0A5C43]'
                        : isCalled
                        ? 'bg-amber-100 text-amber-800'
                        : isBlocked
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                {/* Match Information */}
                {c.matchTitle ? (
                  <p className="text-sm font-bold text-gray-800 line-clamp-2 mb-2">
                    {c.matchTitle}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 italic mb-2">Court Available</p>
                )}

                {/* Live Match Scoreboard */}
                {isLive && c.score && (
                  <div className="my-2">
                    <div className="font-display font-extrabold text-3xl text-gray-900 tracking-tight">
                      {c.score[0]} : {c.score[1]}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Ref {c.referee || 'Assigned'} &bull; Since {c.sinceTime || 'Recently'}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t flex flex-wrap gap-1.5 mt-auto">
                {isOpen && (
                  <>
                    <button
                      onClick={() => onCallNextMatch(c.number)}
                      className="flex-1 py-1.5 bg-[#0A5C43] text-white text-xs font-bold rounded-lg hover:opacity-90"
                    >
                      Call Next Match
                    </button>
                    <button
                      onClick={() => onBlockCourt(c.number)}
                      className="px-2 py-1.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200"
                    >
                      Block
                    </button>
                  </>
                )}

                {isCalled && (
                  <button
                    onClick={() => onStartMatch(c.number)}
                    className="w-full py-2 bg-[#EF9F27] text-black text-xs font-bold rounded-lg hover:opacity-90 shadow-sm"
                  >
                    Start Match (Referee Ready)
                  </button>
                )}

                {isLive && (
                  <button
                    onClick={() => setActiveKioskCourt(c)}
                    className="w-full py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-black"
                  >
                    Open Tablet Kiosk
                  </button>
                )}

                {isBlocked && (
                  <button
                    onClick={() => onReopenCourt(c.number)}
                    className="w-full py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-50"
                  >
                    Reopen Court
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tablet Referee Kiosk Modal */}
      {activeKioskCourt && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6">
          <div className="bg-[#111] p-4 rounded-3xl w-full max-w-2xl border-4 border-[#333] shadow-2xl">
            <div className="bg-[#FAF8F3] p-6 rounded-2xl">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="font-display font-extrabold text-2xl text-gray-900">
                    Court {activeKioskCourt.number} Scorecard
                  </h2>
                  <p className="text-xs text-gray-600 font-semibold">
                    {activeKioskCourt.matchTitle}
                  </p>
                </div>
                <button
                  onClick={() => setActiveKioskCourt(null)}
                  className="px-3 py-1 bg-gray-200 rounded-lg text-xs font-bold hover:bg-gray-300"
                >
                  Exit Kiosk
                </button>
              </div>

              {/* Huge Touch Score Targets */}
              <div className="grid grid-cols-2 gap-4 my-6">
                {[0, 1].map((teamIdx) => (
                  <div
                    key={teamIdx}
                    className="bg-white p-6 rounded-2xl border-2 border-black/10 text-center shadow-sm"
                  >
                    <p className="text-sm font-bold text-gray-500 uppercase">Team {teamIdx + 1}</p>
                    <div className="font-display font-black text-7xl my-3 text-gray-900">
                      {activeKioskCourt.score ? activeKioskCourt.score[teamIdx] : 0}
                    </div>
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => {
                          onUpdateScore(activeKioskCourt.number, teamIdx as 0 | 1, -1);
                          if (activeKioskCourt.score) {
                            const newScore = [...activeKioskCourt.score] as [number, number];
                            newScore[teamIdx] = Math.max(0, newScore[teamIdx] - 1);
                            setActiveKioskCourt({ ...activeKioskCourt, score: newScore });
                          }
                        }}
                        className="px-4 py-2 bg-gray-100 rounded-xl font-bold text-sm hover:bg-gray-200"
                      >
                        -
                      </button>
                      <button
                        onClick={() => {
                          onUpdateScore(activeKioskCourt.number, teamIdx as 0 | 1, 1);
                          if (activeKioskCourt.score) {
                            const newScore = [...activeKioskCourt.score] as [number, number];
                            newScore[teamIdx] = newScore[teamIdx] + 1;
                            setActiveKioskCourt({ ...activeKioskCourt, score: newScore });
                          }
                        }}
                        className="px-6 py-2 bg-[#0A5C43] text-white rounded-xl font-bold text-base hover:opacity-95"
                      >
                        + 1 Pt
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Referee Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => alert(`Desk alerted to Court ${activeKioskCourt.number}.`)}
                  className="py-2.5 px-4 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700"
                >
                  🚨 Call Desk
                </button>
                <button
                  onClick={() => alert(`Incident report initiated for Court ${activeKioskCourt.number}.`)}
                  className="py-2.5 px-4 bg-gray-200 text-gray-800 rounded-xl text-xs font-bold hover:bg-gray-300"
                >
                  Report Injury
                </button>
                <button
                  onClick={() => {
                    onEndMatch(activeKioskCourt.number);
                    setActiveKioskCourt(null);
                  }}
                  className="ml-auto py-2.5 px-5 bg-[#EF9F27] text-black rounded-xl text-xs font-bold hover:opacity-90 shadow-sm"
                >
                  End Match (Lock Referee Score)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
