'use client';

import React from 'react';
import Link from 'next/link';
import {
  X,
  Trophy,
  Calendar,
  MapPin,
  Clock,
  Tv,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Layers,
  Activity,
  Flame,
} from 'lucide-react';
import { Registration } from '../../types/organizer';

export interface TeamLiveMatchInfo {
  matchId: string;
  roundName: string;
  divisionName: string;
  courtNumber: number;
  courtSurface: string;
  status: 'IN_PROGRESS' | 'SCHEDULED' | 'COMPLETED' | 'WARMUP';
  team1: { name: string; seed?: number; avgDupr?: number; score: string };
  team2: { name: string; seed?: number; avgDupr?: number; score: string };
  currentServe?: string;
  refereeName?: string;
  elapsedTime?: string;
  projectedNextMatch?: string;
}

interface TeamMatchDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Registration | null;
  matchInfo?: TeamLiveMatchInfo | null;
  onOpenLiveDesk?: () => void;
}

export const TeamMatchDetailsModal: React.FC<TeamMatchDetailsModalProps> = ({
  isOpen,
  onClose,
  team,
  matchInfo,
  onOpenLiveDesk,
}) => {
  if (!isOpen || !team) return null;

  // Fallback realistic live match if not specifically injected
  const activeMatch: TeamLiveMatchInfo = matchInfo || {
    matchId: 'M102',
    roundName: 'Pool Play - Round 2',
    divisionName: 'Mixed Doubles 3.5 to 4.0',
    courtNumber: 2,
    courtSurface: 'Outdoor Acrylic Hardcourt',
    status: 'IN_PROGRESS',
    team1: {
      name: team.teamName,
      seed: team.seed || 3,
      avgDupr: team.avgDupr || 3.82,
      score: '8',
    },
    team2: {
      name: 'Reyes / Tran',
      seed: 1,
      avgDupr: 4.02,
      score: '6',
    },
    currentServe: `${team.teamName} Serving (Second Server, 8-6-2)`,
    refereeName: 'Dave Jenkins (USAP Level 2 Referee)',
    elapsedTime: '14 mins',
    projectedNextMatch: 'M107 on Court 3 vs Winner of Cruz/Lee vs Johnson/Rivera',
  };

  const isLive = activeMatch.status === 'IN_PROGRESS';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-black uppercase flex items-center gap-1.5 ${
                  isLive
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {isLive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                {isLive ? 'LIVE COURT MATCH' : activeMatch.status}
              </span>
              <span className="text-xs font-mono font-bold text-gray-700 bg-gray-100 px-1.5 py-0.2 rounded border">
                Match {activeMatch.matchId}
              </span>
            </div>
            <h3 className="text-base font-bold text-gray-900 mt-1">
              {team.teamName} &bull; Live Match Dossier
            </h3>
            <p className="text-xs text-gray-500">
              {activeMatch.roundName} &bull; {activeMatch.divisionName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold flex items-center justify-center text-xs"
          >
            ✕
          </button>
        </div>

        {/* Live Court & Scoreboard Card */}
        <div className="bg-gradient-to-br from-slate-950 via-[#0a2016] to-[#0A5C43] text-white p-5 rounded-2xl border border-white/10 shadow-md space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-300 border-b border-white/10 pb-2">
            <span className="flex items-center gap-1.5">
              <MapPin size={13} className="text-amber-400" />
              <strong className="text-white">Court {activeMatch.courtNumber}</strong> ({activeMatch.courtSurface})
            </span>
            <span className="flex items-center gap-1.5 text-amber-300 font-semibold">
              <Clock size={13} />
              <span>{activeMatch.elapsedTime} In Play</span>
            </span>
          </div>

          {/* Versus Score Display */}
          <div className="grid grid-cols-2 gap-4 items-center">
            {/* Team 1 */}
            <div className="space-y-1 text-left">
              <span className="text-[10px] font-bold text-amber-300 uppercase block">
                Seed #{activeMatch.team1.seed} &bull; DUPR {activeMatch.team1.avgDupr}
              </span>
              <div className="text-base font-bold text-white leading-tight">
                {activeMatch.team1.name}
              </div>
              <div className="text-3xl font-black text-emerald-400 font-mono">
                {activeMatch.team1.score}
              </div>
            </div>

            {/* Team 2 */}
            <div className="space-y-1 text-right">
              <span className="text-[10px] font-bold text-gray-400 uppercase block">
                Seed #{activeMatch.team2.seed} &bull; DUPR {activeMatch.team2.avgDupr}
              </span>
              <div className="text-base font-bold text-white leading-tight">
                {activeMatch.team2.name}
              </div>
              <div className="text-3xl font-black text-gray-300 font-mono">
                {activeMatch.team2.score}
              </div>
            </div>
          </div>

          {/* Current Server Callout */}
          {activeMatch.currentServe && (
            <div className="p-2.5 rounded-xl bg-white/10 text-emerald-300 text-xs font-semibold flex items-center justify-between">
              <span>{activeMatch.currentServe}</span>
              <span className="text-[10px] text-amber-300 font-bold uppercase">To 11, Win by 2</span>
            </div>
          )}
        </div>

        {/* Operational Context */}
        <div className="space-y-2 text-xs">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Court Referee</span>
            <span className="font-semibold text-gray-800">{activeMatch.refereeName}</span>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Next Projected Match</span>
            <span className="text-gray-700">{activeMatch.projectedNextMatch}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2 border-t gap-2 flex-wrap">
          <Link
            href="/tv"
            target="_blank"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-amber-400 transition flex items-center gap-1.5 shadow-xs"
          >
            <Tv size={14} />
            <span>Open TV Jumbotron View</span>
          </Link>

          {onOpenLiveDesk && (
            <button
              type="button"
              onClick={onOpenLiveDesk}
              className="px-4 py-2 bg-[#0A5C43] hover:bg-[#084734] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <span>Manage on Court Board</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
