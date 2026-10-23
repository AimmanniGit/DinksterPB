'use client';

import React from 'react';
import { Clock, Users, Flame, Zap, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { TournamentEvent, Division } from '../../types/organizer';
import { getTournamentRunway } from '../../utils/tournamentRunway';

interface TournamentRunwayTrackerProps {
  tournament: Partial<TournamentEvent> & { name: string; dates?: string; status?: TournamentEvent['status'] | string };
  divisions?: Division[];
  variant?: 'compact' | 'card' | 'hero' | 'division-pills';
  showDivisionBreakdown?: boolean;
}

export const TournamentRunwayTracker: React.FC<TournamentRunwayTrackerProps> = ({
  tournament,
  divisions,
  variant = 'compact',
  showDivisionBreakdown = true,
}) => {
  const runway = getTournamentRunway(tournament, divisions);

  // Variant 1: Compact inline pill (for headers and small list rows)
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 flex-wrap text-xs">
        {/* Days to go badge */}
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1.5 ${
            runway.isLive
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : runway.urgencyLevel === 'critical'
              ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
              : 'bg-gray-100 text-gray-700 border border-gray-200'
          }`}
        >
          {runway.isLive ? (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          ) : (
            <Clock size={11} className="text-gray-500" />
          )}
          <span>{runway.daysToGoLabel}</span>
        </span>

        {/* Capacity / Team Fill Status */}
        <span className="text-[11px] font-medium text-gray-600 flex items-center gap-1">
          <Users size={12} className="text-gray-400" />
          <span>
            <strong>{runway.teamsRegistered}</strong> / {runway.totalTeamCap} Teams
          </span>
          <span className="text-gray-400 font-normal">({runway.fillPercentage}%)</span>
        </span>

        {/* Spots Left Scarcity Callout */}
        {runway.spotsRemaining > 0 && runway.spotsRemaining <= 6 && (
          <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
            <Flame size={10} className="text-amber-500" />
            <span>{runway.spotsRemaining} spots left</span>
          </span>
        )}
      </div>
    );
  }

  // Variant 2: Card Embedded Block (Used on Organizer Fleet & Player Explore Cards)
  if (variant === 'card') {
    return (
      <div className="space-y-2.5 pt-1 text-xs">
        {/* Top Status & Days Runway Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase flex items-center gap-1 ${
                runway.isLive
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-rose-50 text-rose-900 border border-rose-200'
              }`}
            >
              {runway.isLive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
              <span>{runway.daysToGoLabel}</span>
            </span>

            {runway.registrationStatusLabel && (
              <span className="text-[10px] text-gray-500 font-semibold hidden sm:inline">
                &bull; {runway.registrationStatusLabel}
              </span>
            )}
          </div>

          <div className="text-right">
            <span className="font-bold text-gray-900 text-xs">
              {runway.teamsRegistered} / {runway.totalTeamCap} Teams
            </span>
            <span className="text-[10px] text-gray-500 block">
              {runway.spotsRemaining === 0 ? (
                <strong className="text-amber-700">Sold Out 🔥</strong>
              ) : (
                `${runway.spotsRemaining} Spots Available`
              )}
            </span>
          </div>
        </div>

        {/* Capacity Progress Bar */}
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              runway.isLive
                ? 'bg-emerald-600'
                : runway.fillPercentage >= 90
                ? 'bg-amber-500'
                : 'bg-[#0A5C43]'
            }`}
            style={{ width: `${Math.min(100, Math.max(5, runway.fillPercentage))}%` }}
          />
        </div>

        {/* Division Breakdown Pills (Glanceable Division-by-Division Health) */}
        {showDivisionBreakdown && runway.divisionBreakdown.length > 0 && (
          <div className="pt-1">
            <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] pb-1">
              {runway.divisionBreakdown.map((div, i) => (
                <span
                  key={i}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-medium whitespace-nowrap border flex items-center gap-1 ${
                    div.spotsLeft === 0
                      ? 'bg-gray-100 text-gray-600 border-gray-200'
                      : div.spotsLeft <= 2
                      ? 'bg-amber-50 text-amber-900 border-amber-200 font-bold'
                      : 'bg-emerald-50/70 text-emerald-900 border-emerald-200'
                  }`}
                  title={`${div.name}: ${div.registeredTeams}/${div.teamCap} teams registered`}
                >
                  {div.isPilot && <Zap size={9} className="text-amber-600 shrink-0" />}
                  <span className="truncate max-w-[90px]">{div.name.split(' ')[0]} {div.name.split(' ')[1] || ''}</span>
                  <strong className="font-mono text-gray-800">
                    {div.registeredTeams}/{div.teamCap}
                  </strong>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Variant 3: Hero Banner Block (Used in EventSetupView and Portal Active Events)
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-3 text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 ${
                runway.isLive
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-rose-100 text-rose-900 border border-rose-300'
              }`}
            >
              {runway.isLive ? (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              ) : (
                <Clock size={11} className="text-rose-700" />
              )}
              <span>{runway.daysToGoLabel}</span>
            </span>

            <span className="text-xs text-gray-500 font-medium">
              {runway.registrationStatusLabel}
            </span>
          </div>

          <div className="text-gray-900 font-bold text-sm pt-0.5">
            Tournament Runway & Enrollment Health
          </div>
        </div>

        {/* High-level stats pill */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Teams</span>
            <span className="font-mono font-bold text-base text-[#0A5C43]">
              {runway.teamsRegistered} / {runway.totalTeamCap}
            </span>
          </div>
          <div className="h-6 w-[1px] bg-gray-200" />
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Fill Rate</span>
            <span className="font-mono font-bold text-base text-gray-900">
              {runway.fillPercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[11px] text-gray-500">
          <span>Overall Event Capacity Pacing</span>
          <span>
            {runway.spotsRemaining === 0 ? (
              <strong className="text-amber-700">Sold Out (100%)</strong>
            ) : (
              `${runway.spotsRemaining} Team Spots Remaining`
            )}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${
              runway.isLive ? 'bg-emerald-600' : runway.fillPercentage >= 90 ? 'bg-amber-500' : 'bg-[#0A5C43]'
            }`}
            style={{ width: `${Math.min(100, Math.max(5, runway.fillPercentage))}%` }}
          />
        </div>
      </div>

      {/* Division-level detailed pills */}
      {showDivisionBreakdown && runway.divisionBreakdown.length > 0 && (
        <div className="pt-2 border-t border-gray-100 space-y-1.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            Division Registration Health
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {runway.divisionBreakdown.map((div, idx) => (
              <div
                key={idx}
                className="p-2 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between text-[11px]"
              >
                <div className="truncate pr-2">
                  <div className="font-bold text-gray-900 truncate">{div.name}</div>
                  <div className="text-[10px] text-gray-500">{div.spotsLeft} spots open</div>
                </div>
                <div className="font-mono font-bold text-gray-800 bg-white px-1.5 py-0.5 rounded border text-[10px] shrink-0">
                  {div.registeredTeams}/{div.teamCap}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
