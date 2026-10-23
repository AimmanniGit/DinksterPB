'use client';

import React, { useState } from 'react';
import {
  Trophy,
  Award,
  Medal,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
  Tv,
  Share2,
  Sparkles,
  Download,
} from 'lucide-react';
import { DivisionBracketData, PoolGroup, PlayoffMatchNode } from '../../types/organizer';
import { INITIAL_BRACKET_DATA } from '../../constants/initialState';
import { generateDuprCsv, downloadDuprCsv } from '@/lib/duprExporter';

interface BracketsPlayoffsViewProps {
  onOpenTvMode?: () => void;
}

export const BracketsPlayoffsView: React.FC<BracketsPlayoffsViewProps> = ({ onOpenTvMode }) => {
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>('A');
  const [stageFilter, setStageFilter] = useState<'all' | 'pools' | 'bracket'>('all');
  const [bracketData, setBracketData] = useState<Record<string, DivisionBracketData>>(INITIAL_BRACKET_DATA);

  const currentBracket = bracketData[selectedDivisionId] || bracketData['A'];
  const hasPools = currentBracket.pools && currentBracket.pools.length > 0;
  const hasQuarters = currentBracket.playoffs.quarters && currentBracket.playoffs.quarters.length > 0;

  const handleExportDupr = () => {
    const records = [
      {
        tournamentName: 'Dink Masters Open',
        matchDate: '2026-11-07',
        divisionName: currentBracket.divisionName,
        round: 'Gold Medal Final',
        team1Player1Name: 'Alex Miller',
        team1Player1DuprId: 'DUPR-4912',
        team1Player2Name: 'Sarah Smith',
        team1Player2DuprId: 'DUPR-8814',
        team2Player1Name: 'David Chen',
        team2Player1DuprId: 'DUPR-3190',
        team2Player2Name: 'Emma Davis',
        team2Player2DuprId: 'DUPR-7721',
        set1Score: '11-8',
        set2Score: '11-9',
        winningTeam: 1 as const,
      },
      {
        tournamentName: 'Dink Masters Open',
        matchDate: '2026-11-07',
        divisionName: currentBracket.divisionName,
        round: 'Bronze 3rd Place',
        team1Player1Name: 'Liam Thompson',
        team1Player1DuprId: 'DUPR-5511',
        team1Player2Name: 'Chloe Brooks',
        team1Player2DuprId: 'DUPR-9923',
        team2Player1Name: 'Mason Wilson',
        team2Player1DuprId: 'DUPR-2104',
        team2Player2Name: 'Ava Hayes',
        team2Player2DuprId: 'DUPR-4419',
        set1Score: '11-7',
        winningTeam: 1 as const,
      },
    ];
    const csv = generateDuprCsv(records);
    downloadDuprCsv(`${currentBracket.divisionName.replace(/\s+/g, '_')}_DUPR_Official.csv`, csv);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Division Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-[#0A5C43]/10 text-[#0A5C43]">
              Tournament Draw
            </span>
            <span className="text-xs text-gray-500 font-medium">Auto-advancement enabled</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Bracket Progression & Medal Matches
          </h1>
          <p className="text-sm text-gray-600 mt-0.5">
            Round-robin pool standings to single elimination playoffs and podium medal matches.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportDupr}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
            title="Export official results for DUPR upload"
          >
            <Download size={15} />
            Export to DUPR (CSV)
          </button>
          {onOpenTvMode && (
            <button
              onClick={onOpenTvMode}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
            >
              <Tv size={15} className="text-emerald-400" />
              Project Bracket on TV
            </button>
          )}
        </div>
      </div>

      {/* Division Selector Tabs & Stage Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-gray-200 shadow-sm">
        {/* Division Picker */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {Object.values(bracketData).map((b) => (
            <button
              key={b.divisionId}
              onClick={() => setSelectedDivisionId(b.divisionId)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedDivisionId === b.divisionId
                  ? 'bg-[#0A5C43] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {b.divisionName}
            </button>
          ))}
        </div>

        {/* Stage Filter */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setStageFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              stageFilter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Stages
          </button>
          {hasPools && (
            <button
              onClick={() => setStageFilter('pools')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                stageFilter === 'pools' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Pool Standings
            </button>
          )}
          <button
            onClick={() => setStageFilter('bracket')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              stageFilter === 'bracket' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Playoff Bracket
          </button>
        </div>
      </div>

      {/* Format Info Callout */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between text-xs text-emerald-950 font-medium">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
            <Layers size={16} />
          </span>
          <div>
            <span className="font-extrabold text-sm block">{currentBracket.divisionName} Format</span>
            <span className="text-emerald-800">{currentBracket.tournamentType}</span>
          </div>
        </div>
        <span className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold">
          Standard 11 Win by 2
        </span>
      </div>

      {/* STAGE 1: ROUND ROBIN POOLS */}
      {(stageFilter === 'all' || stageFilter === 'pools') && hasPools && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <span>Stage 1: Round Robin Pool Play</span>
              <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2.5 py-0.5 rounded-full">
                Top 2 Advance to Semifinals
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {currentBracket.pools.map((pool) => (
              <div key={pool.name} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="bg-[#0A5C43]/5 border-b border-gray-200 px-5 py-3 flex items-center justify-between">
                  <h3 className="font-black text-sm text-[#0A5C43] tracking-wide uppercase">{pool.name}</h3>
                  <span className="text-xs font-semibold text-gray-600">4 Teams &bull; 6 Matches Total</span>
                </div>

                {/* Standings Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Team Name</th>
                        <th className="py-2.5 px-2 text-center">W</th>
                        <th className="py-2.5 px-2 text-center">L</th>
                        <th className="py-2.5 px-2 text-center">+/-</th>
                        <th className="py-2.5 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {pool.teams.map((t, idx) => (
                        <tr
                          key={t.id}
                          className={t.qualified ? 'bg-emerald-50/50 hover:bg-emerald-50' : 'hover:bg-gray-50'}
                        >
                          <td className="py-3 px-3 font-bold text-gray-500">{idx + 1}</td>
                          <td className="py-3 px-3">
                            <span className="font-extrabold text-gray-900 block">{t.name}</span>
                            <span className="text-[10px] text-gray-500">Seed #{t.seed}</span>
                          </td>
                          <td className="py-3 px-2 text-center font-bold text-emerald-700">{t.wins}</td>
                          <td className="py-3 px-2 text-center font-bold text-gray-600">{t.losses}</td>
                          <td className="py-3 px-2 text-center font-mono font-bold">
                            {t.pointDiff > 0 ? `+${t.pointDiff}` : t.pointDiff}
                          </td>
                          <td className="py-3 px-3 text-right">
                            {t.qualified ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-600 text-white shadow-xs">
                                <CheckCircle2 size={12} />
                                Advances (Semi)
                              </span>
                            ) : (
                              <span className="text-[11px] text-gray-400 font-medium">Eliminated</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pool Match Pills */}
                <div className="bg-gray-50/60 p-4 border-t border-gray-100">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
                    Recent Pool Match Scores:
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {pool.matches.slice(0, 4).map((m) => (
                      <div key={m.id} className="bg-white p-2 rounded-xl border border-gray-200 flex items-center justify-between text-[11px]">
                        <span className="truncate pr-2 font-medium text-gray-700">
                          {m.team1.split(' & ')[0]} v {m.team2.split(' & ')[0]}
                        </span>
                        <span className="font-mono font-black text-[#0A5C43]">
                          {m.score ? `${m.score[0]}-${m.score[1]}` : 'sched'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* STAGE 2: PLAYOFF BRACKET & MEDAL ROUNDS */}
      {(stageFilter === 'all' || stageFilter === 'bracket') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <span>Stage 2: Championship Playoff Bracket</span>
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Medal size={12} />
                Gold, Silver & Bronze Matches
              </span>
            </h2>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm overflow-x-auto">
            <div className="flex items-start gap-8 min-w-[760px] justify-between">
              {/* Column 1: Quarterfinals (if present) */}
              {hasQuarters && (
                <div className="flex-1 space-y-4">
                  <div className="text-center pb-2 border-b border-gray-200">
                    <span className="text-xs font-extrabold uppercase text-gray-500 tracking-wider">Quarterfinals</span>
                  </div>
                  <div className="space-y-4">
                    {currentBracket.playoffs.quarters.map((q) => (
                      <MatchNodeCard key={q.id} node={q} />
                    ))}
                  </div>
                </div>
              )}

              {/* Column 2: Semifinals */}
              <div className="flex-1 space-y-4">
                <div className="text-center pb-2 border-b border-gray-200">
                  <span className="text-xs font-extrabold uppercase text-emerald-800 tracking-wider">Semifinals</span>
                </div>
                <div className="space-y-6 pt-4">
                  {currentBracket.playoffs.semis.map((semi) => (
                    <MatchNodeCard key={semi.id} node={semi} highlightWinner />
                  ))}
                </div>
              </div>

              {/* Connecting Divider */}
              <div className="flex flex-col items-center justify-center pt-28 text-gray-300">
                <ChevronRight size={32} />
              </div>

              {/* Column 3: Championship Finals & Bronze Podium */}
              <div className="flex-1 space-y-6">
                {/* Gold Medal Final */}
                <div>
                  <div className="text-center pb-2 border-b border-amber-300">
                    <span className="text-xs font-extrabold uppercase text-amber-800 tracking-wider flex items-center justify-center gap-1">
                      <Trophy size={14} className="text-amber-500" />
                      🥇 Gold Championship Final
                    </span>
                  </div>
                  <div className="pt-2">
                    <MatchNodeCard node={currentBracket.playoffs.final} isChampionship />
                  </div>
                </div>

                {/* Bronze Medal Match */}
                <div>
                  <div className="text-center pb-2 border-b border-orange-300">
                    <span className="text-xs font-extrabold uppercase text-orange-800 tracking-wider flex items-center justify-center gap-1">
                      <Medal size={14} className="text-orange-500" />
                      🥉 Bronze 3rd Place Match
                    </span>
                  </div>
                  <div className="pt-2">
                    <MatchNodeCard node={currentBracket.playoffs.bronze} isBronze />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Podium Celebration Preview */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/40 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
            <Trophy size={20} />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-gray-900">Official Medal Awards & DUPR Export</h4>
            <p className="text-xs text-gray-600">
              Upon final match confirmation, Gold, Silver, and Bronze badges are minted to player profiles and exported to DUPR.
            </p>
          </div>
        </div>
        <span className="px-4 py-2 bg-amber-500/20 text-amber-900 font-extrabold text-xs rounded-xl border border-amber-400/40">
          Podium Ready
        </span>
      </div>
    </div>
  );
};

// Sub-component: Playoff Match Node
interface MatchNodeCardProps {
  node: PlayoffMatchNode;
  highlightWinner?: boolean;
  isChampionship?: boolean;
  isBronze?: boolean;
}

const MatchNodeCard: React.FC<MatchNodeCardProps> = ({
  node,
  highlightWinner = false,
  isChampionship = false,
  isBronze = false,
}) => {
  const isLive = node.status === 'LIVE';
  const isCompleted = node.status === 'COMPLETED';

  return (
    <div
      className={`rounded-2xl border transition-all overflow-hidden ${
        isChampionship
          ? 'bg-gradient-to-b from-amber-50/80 to-white border-amber-400 shadow-md ring-2 ring-amber-400/30'
          : isBronze
          ? 'bg-gradient-to-b from-orange-50/80 to-white border-orange-300 shadow-sm'
          : isLive
          ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
          : 'bg-white border-gray-200 shadow-xs'
      }`}
    >
      {/* Node Header */}
      <div className="px-3.5 py-1.5 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between text-[11px] font-bold">
        <span className="text-gray-700 truncate">{node.title}</span>
        <div className="flex items-center gap-2">
          {node.court && <span className="text-gray-500">Ct {node.court}</span>}
          {isLive && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white animate-pulse">
              LIVE
            </span>
          )}
          {isCompleted && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gray-200 text-gray-700">
              FINAL
            </span>
          )}
        </div>
      </div>

      {/* Teams & Scores */}
      <div className="p-3 space-y-2 text-xs">
        {/* Team 1 */}
        <div
          className={`flex items-center justify-between p-1.5 rounded-lg ${
            node.team1.winner ? 'bg-emerald-100/70 text-emerald-950 font-black' : 'text-gray-800 font-semibold'
          }`}
        >
          <div className="flex items-center gap-1.5 truncate">
            {node.team1.seed && <span className="text-[10px] text-gray-400 font-mono">#{node.team1.seed}</span>}
            <span className="truncate">{node.team1.name}</span>
          </div>
          {node.team1.score !== undefined && (
            <span className="font-mono font-black text-sm ml-2">{node.team1.score}</span>
          )}
        </div>

        {/* Team 2 */}
        <div
          className={`flex items-center justify-between p-1.5 rounded-lg ${
            node.team2.winner ? 'bg-emerald-100/70 text-emerald-950 font-black' : 'text-gray-800 font-semibold'
          }`}
        >
          <div className="flex items-center gap-1.5 truncate">
            {node.team2.seed && <span className="text-[10px] text-gray-400 font-mono">#{node.team2.seed}</span>}
            <span className="truncate">{node.team2.name}</span>
          </div>
          {node.team2.score !== undefined && (
            <span className="font-mono font-black text-sm ml-2">{node.team2.score}</span>
          )}
        </div>
      </div>
    </div>
  );
};
