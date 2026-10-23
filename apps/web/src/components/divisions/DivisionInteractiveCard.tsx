'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Calendar,
  Users,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Check,
  Clock,
  ArrowRight,
  ExternalLink,
  Copy,
  Mail,
  AlertCircle,
  Sparkles,
  Zap,
  Activity,
  Layers,
  Search,
  CheckCircle2,
  Tv,
} from 'lucide-react';
import { Division, Registration } from '../../types/organizer';
import { PartnerInviteTrackerModal } from './PartnerInviteTrackerModal';
import { TeamMatchDetailsModal, TeamLiveMatchInfo } from './TeamMatchDetailsModal';

interface DivisionInteractiveCardProps {
  division: Division;
  tournamentStatus?: 'Live' | 'Published' | 'Draft' | 'Concluded';
  tournamentName?: string;
  tournamentSlug?: string;
  viewerRole?: 'player' | 'founder' | 'director' | 'marshall' | 'volunteer' | 'public';
  registeredTeams?: Registration[];
  signedInPlayerId?: string;
  signedInPlayerTeamCode?: string;
  teamName?: string;
  isPlayerRegisteredInThisDiv?: boolean;
  playerTeamIsAwaitingPartner?: boolean;
  playerPartnerInfo?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    status?: 'sent' | 'opened' | 'registered' | 'confirmed';
  };
  onOpenRegistration?: (division: Division) => void;
  onOpenLiveDesk?: () => void;
  defaultExpanded?: boolean;
}

export const DivisionInteractiveCard: React.FC<DivisionInteractiveCardProps> = ({
  division,
  tournamentStatus = 'Live',
  tournamentName = 'Austin Winter Open 2026',
  tournamentSlug = 'austin-winter-open-2026',
  viewerRole = 'public',
  registeredTeams,
  signedInPlayerId,
  signedInPlayerTeamCode = 'TP-8492',
  teamName,
  isPlayerRegisteredInThisDiv = false,
  playerTeamIsAwaitingPartner = false,
  playerPartnerInfo,
  onOpenRegistration,
  onOpenLiveDesk,
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [rosterTab, setRosterTab] = useState<'teams' | 'bracket-stats' | 'partner-tracker'>('teams');
  const [selectedTeamForMatchModal, setSelectedTeamForMatchModal] = useState<Registration | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copiedCodeSuccess, setCopiedCodeSuccess] = useState<string | null>(null);
  const [teamSearch, setTeamSearch] = useState('');

  const isLive = tournamentStatus === 'Live';
  const isFounderOrDirector = viewerRole === 'founder' || viewerRole === 'director';

  // Demo Teams Generation if not passed
  const teamsList: Registration[] = useMemo(() => {
    if (registeredTeams && registeredTeams.length > 0) return registeredTeams;

    const playerTeamLabel = teamName || (playerTeamIsAwaitingPartner ? 'Miller & Partner (Pending)' : 'Miller & Reyes');
    const baseTeams = [
      {
        name: playerTeamLabel,
        dupr: 3.82,
        seed: 3,
        waiver: !playerTeamIsAwaitingPartner,
        paid: 'Paid',
        status: (playerTeamIsAwaitingPartner ? 'pending' : 'confirmed') as 'pending' | 'confirmed',
        isPlayerTeam: true,
      },
      { name: 'Reyes / Tran', dupr: 4.02, seed: 1, waiver: true, paid: 'Paid', status: 'confirmed' as const },
      { name: 'Cruz / Lee', dupr: 3.91, seed: 2, waiver: true, paid: 'Paid', status: 'confirmed' as const },
      { name: 'Johnson / Rivera', dupr: 3.65, seed: 5, waiver: true, paid: 'Paid', status: 'confirmed' as const },
      { name: 'Lowe / Shah', dupr: 3.88, seed: 4, waiver: true, paid: 'Paid', status: 'confirmed' as const },
      { name: 'Moss / Ito', dupr: 3.84, seed: 6, waiver: true, paid: 'Paid', status: 'confirmed' as const },
      { name: 'Patel / Kim', dupr: 3.80, seed: 7, waiver: true, paid: 'Paid', status: 'confirmed' as const },
      { name: 'Garcia / Wong', dupr: 3.77, seed: 8, waiver: true, paid: 'Paid', status: 'confirmed' as const },
      { name: 'Brooks / Diaz', dupr: 3.74, seed: 9, waiver: true, paid: 'Paid', status: 'confirmed' as const },
      { name: 'Singh / Hart', dupr: 3.71, seed: 10, waiver: true, paid: 'Paid', status: 'confirmed' as const },
      { name: 'Owens / Vega', dupr: 3.68, seed: 11, waiver: true, paid: 'Paid', status: 'confirmed' as const },
      { name: 'Park / Ruiz', dupr: 3.64, seed: 12, waiver: true, paid: 'Paid', status: 'confirmed' as const },
      { name: 'Chen / Boyd', dupr: 3.62, seed: 13, waiver: true, paid: 'Paid', status: 'confirmed' as const },
      { name: 'Khan / Fox', dupr: 3.58, seed: 14, waiver: true, paid: 'Paid', status: 'confirmed' as const },
      { name: 'Lopez / Reed', dupr: 3.55, seed: 15, waiver: false, paid: 'Pending', status: 'pending' as const },
      { name: 'Ward / Cole', dupr: 3.52, seed: 16, waiver: true, paid: 'Paid', status: 'confirmed' as const },
    ];

    return baseTeams.slice(0, division.teamCap || 16).map((t, idx) => ({
      id: `reg-${division.id}-${idx + 1}`,
      teamName: t.name,
      avgDupr: t.dupr,
      waiverSigned: t.waiver,
      paymentStatus: (t.paid === 'Paid' ? 'Paid' : 'Pending') as 'Paid' | 'Pending',
      seed: t.seed,
    }));
  }, [registeredTeams, division]);

  // Statistics
  const confirmedCount = teamsList.filter((t) => t.paymentStatus === 'Paid' && t.waiverSigned).length;
  const partialCount = teamsList.length - confirmedCount;
  const avgDupr = (teamsList.reduce((acc, t) => acc + t.avgDupr, 0) / (teamsList.length || 1)).toFixed(2);
  const totalRevenue = teamsList.filter((t) => t.paymentStatus === 'Paid').length * division.entryFee * 2;

  // Filtered Teams inside expanded view
  const filteredTeams = useMemo(() => {
    if (!teamSearch.trim()) return teamsList;
    return teamsList.filter((t) => t.teamName.toLowerCase().includes(teamSearch.toLowerCase()));
  }, [teamsList, teamSearch]);

  const handleCopyCode = (code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCodeSuccess(code);
      setTimeout(() => setCopiedCodeSuccess(null), 2500);
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-200 shadow-xs overflow-hidden ${
        isExpanded
          ? 'border-[#0A5C43] ring-1 ring-[#0A5C43]/20 shadow-md'
          : isPlayerRegisteredInThisDiv
          ? 'border-emerald-400 bg-emerald-50/10 hover:border-emerald-500'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* ============================================================== */}
      {/* 1. COLLAPSED / HEADER ROW (CLICK ANYWHERE TO EXPAND ROSTER)   */}
      {/* ============================================================== */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-5 cursor-pointer hover:bg-gray-50/60 transition flex flex-col justify-between gap-4 select-none"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Division Title & Identity */}
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base font-bold text-gray-900 group-hover:text-[#0A5C43] transition">
                {division.name}
              </span>

              {division.isPilot && (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold text-[10px] rounded-full border border-amber-300 flex items-center gap-1">
                  <Zap size={11} className="text-[#EF9F27]" />
                  <span>Dink Battle Pilot</span>
                </span>
              )}

              {isPlayerRegisteredInThisDiv && (
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-black text-[10px] rounded-full flex items-center gap-1 border border-emerald-300">
                  <Check size={11} /> You Are Registered
                </span>
              )}

              {playerTeamIsAwaitingPartner && (
                <span className="px-2 py-0.5 bg-amber-50 text-amber-900 font-bold text-[10px] rounded-full flex items-center gap-1 border border-amber-300 animate-pulse">
                  <AlertCircle size={11} className="text-amber-600" />
                  <span>Awaiting Partner Registration</span>
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
              <span>
                DUPR Range: <strong>{division.minDupr === 0 ? 'All Levels (Open)' : `${division.minDupr} - ${division.maxDupr}`}</strong>
              </span>
              <span>&bull;</span>
              <span>Format: <strong>{division.format}</strong></span>
              <span>&bull;</span>
              <span>Capacity: <strong>{teamsList.length} / {division.teamCap} Teams</strong></span>
              {division.scheduleDay && (
                <>
                  <span>&bull;</span>
                  <span className="text-emerald-800 font-semibold">Schedule: {division.scheduleDay}</span>
                </>
              )}
            </div>
          </div>

          {/* Right: Fee & Action Trigger */}
          <div className="flex items-center gap-4 self-end md:self-auto shrink-0">
            <div className="text-right">
              <div className="text-lg font-black text-[#0A5C43] font-mono">${division.entryFee}</div>
              <span className="text-[10px] text-gray-400 block font-semibold">per player</span>
            </div>

            <div className="flex items-center gap-2">
              {!isPlayerRegisteredInThisDiv && onOpenRegistration && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenRegistration(division);
                  }}
                  className="px-3.5 py-2 bg-[#0A5C43] hover:bg-[#084734] text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1"
                >
                  <span>Register</span>
                  <ArrowRight size={13} />
                </button>
              )}

              <div
                className={`p-2 rounded-xl transition border text-gray-500 ${
                  isExpanded ? 'bg-gray-100 text-gray-900 border-gray-300' : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                }`}
                title={isExpanded ? 'Collapse Roster' : 'Click to View Registered Teams & Players'}
              >
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>
          </div>
        </div>

        {/* 2. SUMMARY PILL BAR (Directly visible on the division card!) */}
        <div className="flex items-center gap-2 flex-wrap pt-1 text-xs border-t border-gray-100">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 font-bold border border-emerald-200 flex items-center gap-1.5">
            <Users size={12} className="text-emerald-700" />
            <span>{teamsList.length} / {division.teamCap} Teams ({confirmedCount} Confirmed)</span>
          </span>

          {partialCount > 0 && (
            <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 font-semibold border border-amber-200 flex items-center gap-1.5">
              <AlertCircle size={12} className="text-amber-600" />
              <span>{partialCount} Incomplete / Partner Pending</span>
            </span>
          )}

          <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 font-medium">
            Avg DUPR: <strong className="font-mono text-gray-900">{avgDupr}</strong>
          </span>

          {isFounderOrDirector && (
            <span className="px-2.5 py-1 rounded-lg bg-emerald-100/80 text-[#0A5C43] font-bold font-mono">
              ${totalRevenue.toLocaleString()} Collected
            </span>
          )}

          {isLive && (
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-amber-400 font-bold flex items-center gap-1.5 ml-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Court 2 & 4 Active Matches</span>
            </span>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. EXPANDED VIEW (TEAMS, PLAYERS, LIVE MATCHES & INVITES)     */}
      {/* ============================================================== */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-5 bg-[#FAF8F3]/60 space-y-5">
          {/* Top Sub-Navigation Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200/80 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRosterTab('teams')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  rosterTab === 'teams'
                    ? 'bg-gray-900 text-white shadow-xs'
                    : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                }`}
              >
                <Users size={13} />
                <span>Registered Teams & Players ({teamsList.length})</span>
              </button>

              {isLive && (
                <button
                  type="button"
                  onClick={() => setRosterTab('bracket-stats')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    rosterTab === 'bracket-stats'
                      ? 'bg-[#0A5C43] text-white shadow-xs'
                      : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                  }`}
                >
                  <Activity size={13} />
                  <span>Live Bracket & Match Progress</span>
                </button>
              )}

              {isPlayerRegisteredInThisDiv && (
                <button
                  type="button"
                  onClick={() => setRosterTab('partner-tracker')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    rosterTab === 'partner-tracker'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
                >
                  <Mail size={13} />
                  <span>Partner Invite Tracker</span>
                </button>
              )}
            </div>

            {/* Team Search inside division */}
            <div className="relative min-w-[200px]">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search registered teams..."
                value={teamSearch}
                onChange={(e) => setTeamSearch(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg pl-8 pr-3 py-1 text-xs text-gray-900 focus:outline-none focus:border-[#0A5C43]"
              />
            </div>
          </div>

          {/* PLAYER AWAITING PARTNER BANNER */}
          {playerTeamIsAwaitingPartner && (
            <div className="bg-amber-50 border border-amber-300 p-4 rounded-xl text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-amber-700 shrink-0" />
                  <span className="font-bold text-amber-950">
                    Your team is waiting for Morgan Reyes to complete registration
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInviteModal(true)}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition"
                >
                  Open Invite Tracker
                </button>
              </div>

              <div className="flex items-center gap-3 text-amber-900 flex-wrap">
                <span>Partner Email: <strong>{playerPartnerInfo?.email || 'morgan.reyes@dinkster.app'}</strong></span>
                <span>&bull;</span>
                <span>Team Code: <strong className="font-mono bg-white px-1.5 py-0.2 rounded border">{signedInPlayerTeamCode}</strong></span>
                <span>&bull;</span>
                <span className="text-emerald-800 font-semibold">Entry fee pre-paid by Captain ($0 cost for partner)</span>
              </div>
            </div>
          )}

          {/* TAB CONTENT 1: REGISTERED TEAMS & PLAYERS */}
          {rosterTab === 'teams' && (
            <div className="space-y-3">
              <div className="text-xs text-gray-500 flex items-center justify-between">
                <span>
                  Showing {filteredTeams.length} teams &bull; Click any team to inspect their <strong>Live Court Match & Score</strong>
                </span>
                <span className="text-[11px] font-semibold text-gray-400">
                  Sorted by DUPR Seed Rating
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {filteredTeams.map((team, idx) => {
                  const isPlayerTeam = team.teamName.includes('Miller');
                  const hasMatchLive = team.seed === 1 || team.seed === 2 || team.seed === 3;

                  return (
                    <div
                      key={team.id}
                      onClick={() => setSelectedTeamForMatchModal(team)}
                      className={`p-3.5 rounded-xl border transition shadow-2xs cursor-pointer flex items-center justify-between gap-3 group ${
                        isPlayerTeam
                          ? 'bg-emerald-50/70 border-emerald-400 hover:bg-emerald-50'
                          : 'bg-white border-gray-200 hover:border-[#0A5C43] hover:shadow-xs'
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[10px] font-black px-1.5 py-0.2 rounded bg-gray-100 text-gray-700">
                            Seed #{team.seed || idx + 1}
                          </span>

                          <span className="font-bold text-xs text-gray-900 group-hover:text-[#0A5C43] transition truncate">
                            {team.teamName}
                          </span>

                          {isPlayerTeam && (
                            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-emerald-200 text-emerald-900">
                              Your Team
                            </span>
                          )}

                          {team.paymentStatus === 'Pending' && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                              Partner Pending
                            </span>
                          )}
                        </div>

                        {/* Live Match Callout Pill */}
                        {isLive && hasMatchLive ? (
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>
                              {team.seed === 3
                                ? 'Court 2 vs Reyes/Tran (8-6 Game 1)'
                                : team.seed === 1
                                ? 'Court 2 vs Miller/Reyes (6-8 Game 1)'
                                : 'Court 4 vs Johnson/Rivera (10-8 Game 1)'}
                            </span>
                          </div>
                        ) : (
                          <div className="text-[11px] text-gray-500 flex items-center gap-2">
                            <span>Avg DUPR: <strong className="text-gray-800 font-mono">{team.avgDupr.toFixed(2)}</strong></span>
                            <span>&bull;</span>
                            <span>{team.waiverSigned ? 'Waiver Signed ✓' : 'Waiver Pending'}</span>
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[11px] font-bold text-[#0A5C43] opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
                          <span>Match Info</span>
                          <ArrowRight size={12} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB CONTENT 2: LIVE BRACKET & MATCH PROGRESS */}
          {rosterTab === 'bracket-stats' && (
            <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Pool Play & Bracket Operations</h4>
                  <p className="text-gray-500">Live progress across 16 teams and 24 scheduled round-robin matches.</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-emerald-800 text-sm">75% Complete</span>
                  <span className="text-[10px] text-gray-400 block">18 / 24 Matches</span>
                </div>
              </div>

              {/* Pool Progress Bar */}
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#0A5C43]" style={{ width: '75%' }} />
              </div>

              {/* Active Courts in this Division */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-gray-900">Court 2: Match M102</div>
                    <div className="text-[11px] text-gray-600">Miller & Reyes vs Reyes & Tran</div>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-800">8 - 6 In Progress</span>
                </div>

                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-gray-900">Court 4: Match M103</div>
                    <div className="text-[11px] text-gray-600">Cruz & Lee vs Johnson & Rivera</div>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-800">10 - 8 In Progress</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT 3: PARTNER INVITE TRACKER SUMMARY */}
          {rosterTab === 'partner-tracker' && (
            <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Partner Invitation & Registration Tracker</h4>
                  <p className="text-gray-500">Track your partner&apos;s progress joining team code {signedInPlayerTeamCode}.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInviteModal(true)}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition"
                >
                  Manage / Send Invites
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">Invite Sent</span>
                  <span className="text-xs font-bold text-emerald-950">Today, 2:15 PM</span>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">Link Opened</span>
                  <span className="text-xs font-bold text-emerald-950">Today, 2:24 PM</span>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">Registered</span>
                  <span className="text-xs font-bold text-emerald-950">Today, 2:28 PM</span>
                </div>
                <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-center">
                  <span className="text-[10px] uppercase font-bold text-emerald-900 block">Status</span>
                  <span className="text-xs font-black text-emerald-950">Pre-Paid ✓</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. MODALS: PARTNER INVITE & TEAM MATCH DETAILS                */}
      {/* ============================================================== */}
      {showInviteModal && (
        <PartnerInviteTrackerModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          teamName={teamName || 'Miller & Reyes'}
          divisionName={division.name}
          tournamentName={tournamentName}
          tournamentSlug={tournamentSlug}
          teammateCode={signedInPlayerTeamCode}
          isPrepaid={true}
          initialPartner={playerPartnerInfo}
        />
      )}

      {selectedTeamForMatchModal && (
        <TeamMatchDetailsModal
          isOpen={Boolean(selectedTeamForMatchModal)}
          onClose={() => setSelectedTeamForMatchModal(null)}
          team={selectedTeamForMatchModal}
          onOpenLiveDesk={onOpenLiveDesk}
        />
      )}
    </div>
  );
};
