'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Trophy,
  LayoutDashboard,
  Calendar,
  Users,
  Award,
  Sparkles,
  ClipboardList,
  Flame,
  AlertCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Tv,
  ArrowLeft,
  ChevronDown,
  Layers,
  ExternalLink,
  MapPin,
  Plus,
  Play,
  RotateCcw,
} from 'lucide-react';

import {
  Role,
  TabKey,
  TournamentEvent,
  Division,
  Registration,
  Sponsor,
  TournamentMatch,
  CourtDeskState,
  Dispute,
  Incident,
  ChangeLogEntry,
  CopilotProposal,
} from '../types/organizer';

import {
  INITIAL_EVENT,
  INITIAL_TOURNAMENT_FLEET,
  INITIAL_DIVISIONS,
  INITIAL_REGISTRATIONS,
  INITIAL_SPONSORS,
  generateInitialMatches,
  INITIAL_COURTS,
  generateCourts,
  INITIAL_DISPUTES,
  INITIAL_INCIDENTS,
} from '../constants/initialState';

import { TournamentFleetDirectory } from '../components/fleet';
import { EventSetupView } from '../components/setup';
import { CourtBoardView, DisputesView } from '../components/desk';
import { RegistrationsView, SponsorsView } from '../components/organizer';
import { RefereeScorecardView } from '../components/referee';
import { CopilotView, ChangeLogView } from '../components/copilot';
import { TvBroadcastView } from '../components/tv';
import { BracketsPlayoffsView } from '../components/brackets';

export default function DinksterWebPlatform() {
  const [role, setRole] = useState<Role>('org');
  const [theme, setTheme] = useState('default');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [tvInitialMode, setTvInitialMode] = useState<'jumbotron' | 'spotlight' | 'bracket' | 'cycle'>('jumbotron');

  // Multi-Tournament Fleet State
  const [tournaments, setTournaments] = useState<TournamentEvent[]>(INITIAL_TOURNAMENT_FLEET);
  // Default to the live tournament 'tourn-austin-live', but user can toggle to Fleet directory anytime (or set null)
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>('tourn-austin-live');
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  // Active Tournament Data State (Austin Winter Open or dynamically loaded)
  const [event, setEvent] = useState<TournamentEvent>(INITIAL_EVENT);
  const [divisions, setDivisions] = useState<Division[]>(INITIAL_DIVISIONS);
  const [registrations, setRegistrations] = useState<Registration[]>(INITIAL_REGISTRATIONS);
  const [sponsors, setSponsors] = useState<Sponsor[]>(INITIAL_SPONSORS);
  const [matches, setMatches] = useState<TournamentMatch[]>(generateInitialMatches());
  const [courts, setCourts] = useState<CourtDeskState[]>(INITIAL_COURTS);
  const [disputes, setDisputes] = useState<Dispute[]>(INITIAL_DISPUTES);
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [changeLog, setChangeLog] = useState<ChangeLogEntry[]>([]);
  const [copilotInitialPrompt, setCopilotInitialPrompt] = useState<string | undefined>(undefined);

  // Time & Projections State
  const [clockMinutes, setClockMinutes] = useState(13 * 60 + 42); // 1:42 PM
  const [mixedProjectedOffset, setMixedProjectedOffset] = useState(18); // 18m behind

  // Active Selected Tournament Entity
  const currentTournament = useMemo(() => {
    if (!selectedTournamentId) return null;
    return tournaments.find((t) => t.id === selectedTournamentId) || tournaments[0];
  }, [tournaments, selectedTournamentId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const formatClock = (mins: number) => {
    const h = Math.floor(mins / 60) % 24;
    const m = mins % 60;
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
  };

  // Fleet Level Actions
  const handleSelectTournament = (tournamentId: string) => {
    const found = tournaments.find((t) => t.id === tournamentId);
    if (found) {
      setSelectedTournamentId(tournamentId);
      setEvent(found);
      setActiveTab('overview');
      setRole('org');
      showToast(`Switched workspace to ${found.name}`);
    }
  };

  const handleCreateTournament = (newEvent: TournamentEvent) => {
    setTournaments((prev) => [newEvent, ...prev]);
    setSelectedTournamentId(newEvent.id);
    setEvent(newEvent);
    setActiveTab('setup');
    setRole('org');
    showToast(`Created "${newEvent.name}". Workspace opened.`);
  };

  const handleExitToFleet = () => {
    setSelectedTournamentId(null);
    setActiveTab('fleet');
    setRole('org');
    showToast('Returned to Fleet Directory (All Tournaments).');
  };

  // Court & Match Actions (Scoped to Current Tournament)
  const handleCallNextMatch = (courtNumber: number) => {
    const scheduled = matches.find((m) => m.status === 'SCHEDULED');
    if (!scheduled) {
      showToast('No more scheduled matches left in the pool.');
      return;
    }
    scheduled.status = 'PENDING';
    scheduled.court = courtNumber;

    setCourts((prev) =>
      prev.map((c) =>
        c.number === courtNumber
          ? {
              ...c,
              status: 'called',
              matchTitle: `${scheduled.id}  Team ${scheduled.id.slice(1)} vs Team ${Number(scheduled.id.slice(1)) + 1}`,
              matchId: scheduled.id,
            }
          : c
      )
    );
    showToast(`Court call sent for ${scheduled.id} on Court ${courtNumber}. Push alerts broadcast.`);
  };

  const handleStartMatch = (courtNumber: number) => {
    setCourts((prev) =>
      prev.map((c) =>
        c.number === courtNumber
          ? {
              ...c,
              status: 'live',
              score: [0, 0],
              referee: 'R. Gill',
              sinceTime: formatClock(clockMinutes),
            }
          : c
      )
    );
    showToast(`Court ${courtNumber} is now LIVE.`);
  };

  const handleBlockCourt = (courtNumber: number) => {
    setCourts((prev) =>
      prev.map((c) => (c.number === courtNumber ? { ...c, status: 'blocked' } : c))
    );
    showToast(`Court ${courtNumber} blocked.`);
  };

  const handleReopenCourt = (courtNumber: number) => {
    setCourts((prev) =>
      prev.map((c) => (c.number === courtNumber ? { ...c, status: 'open' } : c))
    );
    showToast(`Court ${courtNumber} reopened.`);
  };

  const handleUpdateScore = (courtNumber: number, teamIdx: 0 | 1, delta: number) => {
    setCourts((prev) =>
      prev.map((c) => {
        if (c.number === courtNumber && c.score) {
          const newScore = [...c.score] as [number, number];
          newScore[teamIdx] = Math.max(0, newScore[teamIdx] + delta);
          return { ...c, score: newScore };
        }
        return c;
      })
    );
  };

  const handleEndMatch = (courtNumber: number) => {
    setCourts((prev) =>
      prev.map((c) =>
        c.number === courtNumber
          ? {
              ...c,
              status: 'open',
              matchTitle: undefined,
              score: undefined,
              referee: undefined,
              sinceTime: undefined,
              matchId: undefined,
            }
          : c
      )
    );
    showToast(`Court ${courtNumber} match ended. Final referee score locked.`);
  };

  const handleSimulateWetSpot = () => {
    setRole('org');
    setActiveTab('copilot');
    setCopilotInitialPrompt('Court 3 has a wet spot. Move its upcoming matches to other courts.');
  };

  const handleAutoSeed = () => {
    const sorted = [...registrations].sort((a, b) => b.avgDupr - a.avgDupr);
    const seeded = sorted.map((r, i) => ({ ...r, seed: i + 1 }));
    setRegistrations(seeded);
    showToast('Seeds assigned to all 16 teams by DUPR.');
  };

  const handleRefund = (regId: string) => {
    setRegistrations((prev) =>
      prev.map((r) => (r.id === regId ? { ...r, paymentStatus: 'Refunded' } : r))
    );
    showToast('Refund processed via Stripe Connect. Platform fee reversed.');
  };

  const handleDraftDisputeSummary = (disputeId: string) => {
    setDisputes((prev) =>
      prev.map((d) =>
        d.id === disputeId
          ? {
              ...d,
              copilotSummary:
                d.id === 'D1'
                  ? 'Score was 10-10 on game point. Referee R. Gill called the baseline shot in. Player T. Lowe contends it landed deep. No camera review available. Recommend upholding referee call or playing let.'
                  : 'Self-reported score was 11-8. Scorekeeper recorded 11-9. Referee score outranks self-reported score. Recommend confirming 11-9 and issuing prompt.',
            }
          : d
      )
    );
  };

  const handleEscalateDispute = (disputeId: string) => {
    setDisputes((prev) =>
      prev.map((d) => (d.id === disputeId ? { ...d, status: 'Escalated' } : d))
    );
    showToast('Dispute escalated to Tournament Director desk.');
  };

  const handleResolveDispute = (disputeId: string, decision: string) => {
    setDisputes((prev) =>
      prev.map((d) =>
        d.id === disputeId
          ? {
              ...d,
              status: 'Resolved',
              decision: `${decision} (Decided at ${formatClock(clockMinutes)})`,
            }
          : d
      )
    );
    showToast(`Dispute ${disputeId} resolved: "${decision}".`);
  };

  const handleConfirmProposal = (prop: CopilotProposal) => {
    if (prop.type === 'pivot') {
      const matchIds: string[] = prop.data.matchIds;
      setMatches((prev) =>
        prev.map((m) =>
          matchIds.includes(m.id) && m.status !== 'COMPLETED' && m.status !== 'IN_PROGRESS'
            ? { ...m, rules: 'To 9, win by 2', revision: m.revision + 1 }
            : m
        )
      );

      setMixedProjectedOffset((prev) => prev - prop.data.savedMinutes);

      const entry: ChangeLogEntry = {
        time: formatClock(clockMinutes),
        actor: 'Organizer (Approved Copilot Proposal)',
        tool: 'apply_mid_tournament_rule_pivot',
        matchCount: matchIds.length,
        before: 'To 11, win by 2',
        after: 'To 9, win by 2',
        savedMinutes: prop.data.savedMinutes,
        matchIds,
        isRolledBack: false,
      };

      setChangeLog((prev) => [entry, ...prev]);
      showToast(`Rule pivot applied to ${matchIds.length} matches. Finish shifted 22 mins sooner.`);
    }

    if (prop.type === 'dink') {
      setDivisions((prev) => [
        ...prev,
        {
          id: `DB-${Date.now().toString().slice(-4)}`,
          name: prop.data.name,
          format: prop.data.format,
          minDupr: 0,
          maxDupr: 5.5,
          entryFee: prop.data.fee,
          teamCap: 16,
          isPilot: true,
          scheduleDay: 'Sunday',
          timeSlot: '3:00 PM - 7:00 PM',
        },
      ]);
      showToast('Pilot division added! Check Event Setup.');
    }

    if (prop.type === 'move') {
      setCourts((prev) =>
        prev.map((c) =>
          c.number === 6
            ? {
                ...c,
                status: 'called',
                matchTitle: 'M110  Reyes / Tran vs Cruz / Lee',
                matchId: 'M110',
              }
            : c
        )
      );
      showToast('Match M110 moved to Court 6. Court 3 will block after M107.');
    }

    prop.status = 'executed';
  };

  const handleRejectProposal = (_propId: number) => {
    showToast('Proposal rejected.');
  };

  const handleRollback = (logIdx: number) => {
    const entry = changeLog[logIdx];
    if (!entry || entry.isRolledBack) return;

    setMatches((prev) =>
      prev.map((m) =>
        entry.matchIds.includes(m.id) && m.status !== 'COMPLETED' && m.status !== 'IN_PROGRESS'
          ? { ...m, rules: entry.before, revision: m.revision + 1 }
          : m
      )
    );

    setMixedProjectedOffset((prev) => prev + entry.savedMinutes);

    setChangeLog((prev) =>
      prev.map((item, idx) => (idx === logIdx ? { ...item, isRolledBack: true } : item))
    );

    showToast('Change rolled back to original rules.');
  };

  const handleRefFinalScore = (_sets: [number, number][]) => {
    setMatches((prev) =>
      prev.map((m) =>
        m.id === 'M107'
          ? {
              ...m,
              status: 'COMPLETED',
            }
          : m
      )
    );
    showToast('Score recorded as official referee score. Match M107 locked.');
  };

  // Fullscreen TV Broadcast View Mode
  if (role === 'tv') {
    return (
      <TvBroadcastView
        tournamentName={event.name}
        venueName={event.venue}
        courts={courts}
        matches={matches}
        sponsors={sponsors}
        initialMode={tvInitialMode}
        onExitTvMode={() => setRole('org')}
      />
    );
  }

  return (
    <div className={`min-h-screen grid grid-cols-[260px_1fr] ${theme !== 'default' ? `theme-${theme}` : ''}`}>
      {/* Sidebar */}
      <aside className="bg-[#0A5C43] text-white p-5 flex flex-col gap-3 sticky top-0 h-screen select-none overflow-y-auto">
        {/* Brand */}
        <div className="flex items-center justify-between mb-1">
          <div className="font-bold text-xl tracking-tight text-white">
            dink<span className="text-[#EF9F27]">ster</span>
            <span className="text-[11px] font-mono font-normal ml-2 opacity-75">platform v5</span>
          </div>
        </div>

        {/* Workspace Switcher / Context Indicator */}
        {selectedTournamentId ? (
          <div className="bg-white/10 p-3 rounded-xl border border-white/15">
            <div className="flex items-center justify-between text-[11px] text-white/70 font-semibold mb-1">
              <span>Active Tournament</span>
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  currentTournament?.status === 'Live'
                    ? 'bg-emerald-400/20 text-emerald-300'
                    : 'bg-white/20 text-white'
                }`}
              >
                {currentTournament?.status || 'Active'}
              </span>
            </div>
            <div className="font-semibold text-xs text-white truncate mb-2">
              {currentTournament?.name || 'Tournament'}
            </div>
            <button
              type="button"
              onClick={handleExitToFleet}
              className="w-full text-center py-1.5 px-2 bg-white/10 hover:bg-white/20 text-white/90 rounded-lg text-[11px] font-semibold transition flex items-center justify-center gap-1.5"
            >
              <ArrowLeft size={13} />
              <span>All Tournaments Fleet</span>
            </button>
          </div>
        ) : (
          <div className="bg-white/10 p-3 rounded-xl border border-white/15 text-xs text-white/80">
            <div className="font-bold text-white mb-0.5">Fleet Overview Mode</div>
            <div className="text-[11px] text-white/70">Managing {tournaments.length} tournaments across tenure</div>
          </div>
        )}

        {/* In-Tournament Role Switcher */}
        {selectedTournamentId && (
          <div className="grid grid-cols-4 gap-1 bg-white/10 rounded-xl p-1">
            {(['org', 'desk', 'ref', 'tv'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setRole(r);
                  if (r !== 'tv') {
                    setActiveTab(r === 'org' ? 'overview' : r === 'desk' ? 'board' : 'card');
                  }
                }}
                className={`py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                  role === r ? 'bg-[#EF9F27] text-black shadow-xs font-bold' : 'text-white/80 hover:bg-white/10'
                }`}
              >
                {r === 'org' ? 'Org' : r === 'desk' ? 'Desk' : r === 'ref' ? 'Ref' : '📺 TV'}
              </button>
            ))}
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1 mt-1">
          {/* Top-Level Fleet Navigation */}
          {!selectedTournamentId ? (
            <>
              <NavItem
                icon={<LayoutDashboard size={17} />}
                label="Fleet Directory"
                active={activeTab === 'fleet'}
                badge={String(tournaments.length)}
                onClick={() => setActiveTab('fleet')}
              />
              <NavItem
                icon={<Award size={17} />}
                label="Global Sponsors"
                active={activeTab === 'sponsors'}
                onClick={() => setActiveTab('sponsors')}
              />
              <NavItem
                icon={<Sparkles size={17} />}
                label="Fleet Copilot AI"
                active={activeTab === 'copilot'}
                onClick={() => {
                  setCopilotInitialPrompt(undefined);
                  setActiveTab('copilot');
                }}
              />
              <NavItem
                icon={<ClipboardList size={17} />}
                label="Platform Audit Log"
                active={activeTab === 'log'}
                badge={changeLog.length > 0 ? String(changeLog.length) : undefined}
                onClick={() => setActiveTab('log')}
              />
            </>
          ) : role === 'org' ? (
            /* Tournament-Scoped Director Navigation */
            <>
              <NavItem
                icon={<LayoutDashboard size={17} />}
                label="Tournament Overview"
                active={activeTab === 'overview' || activeTab === 'dash'}
                onClick={() => setActiveTab('overview')}
              />
              <NavItem
                icon={<Calendar size={17} />}
                label="Event Setup & Courts"
                active={activeTab === 'setup'}
                onClick={() => setActiveTab('setup')}
              />
              <NavItem
                icon={<Layers size={17} />}
                label="Divisions & Rules"
                active={activeTab === 'divisions'}
                badge={`${divisions.length}`}
                onClick={() => setActiveTab('divisions')}
              />
              <NavItem
                icon={<Users size={17} />}
                label="Registrations"
                active={activeTab === 'regs'}
                badge={`${registrations.length}/16`}
                onClick={() => setActiveTab('regs')}
              />
              <NavItem
                icon={<Trophy size={17} />}
                label="Desk & Court Board"
                active={activeTab === 'board'}
                onClick={() => setActiveTab('board')}
              />
              <NavItem
                icon={<Award size={17} />}
                label="Brackets & Medals"
                active={activeTab === 'brackets'}
                onClick={() => setActiveTab('brackets')}
              />
              <NavItem
                icon={<Tv size={17} />}
                label="TV Jumbotron Cast"
                active={activeTab === 'tv'}
                onClick={() => setActiveTab('tv')}
              />
              <NavItem
                icon={<Award size={17} />}
                label="Tournament Sponsors"
                active={activeTab === 'sponsors'}
                onClick={() => setActiveTab('sponsors')}
              />
              <NavItem
                icon={<Sparkles size={17} />}
                label="Copilot AI"
                active={activeTab === 'copilot'}
                onClick={() => {
                  setCopilotInitialPrompt(undefined);
                  setActiveTab('copilot');
                }}
              />
              <NavItem
                icon={<ClipboardList size={17} />}
                label="Change Log"
                active={activeTab === 'log'}
                badge={changeLog.length > 0 ? String(changeLog.length) : undefined}
                onClick={() => setActiveTab('log')}
              />
            </>
          ) : role === 'desk' ? (
            /* Scoped Desk Operations Navigation */
            <>
              <NavItem
                icon={<Trophy size={17} />}
                label="Court Board"
                active={activeTab === 'board'}
                onClick={() => setActiveTab('board')}
              />
              <NavItem
                icon={<AlertCircle size={17} />}
                label="Silent Host Disputes"
                active={activeTab === 'disputes'}
                badge={disputes.filter((d) => d.status !== 'Resolved').length > 0 ? '2' : undefined}
                onClick={() => setActiveTab('disputes')}
              />
              <NavItem
                icon={<Flame size={17} />}
                label="Incidents"
                active={activeTab === 'incidents'}
                onClick={() => setActiveTab('incidents')}
              />
              <NavItem
                icon={<Sparkles size={17} />}
                label="Desk Copilot"
                active={activeTab === 'copilot'}
                onClick={() => setActiveTab('copilot')}
              />
            </>
          ) : (
            /* Scoped Referee Navigation */
            <NavItem
              icon={<Trophy size={17} />}
              label="Referee Scorecard"
              active={activeTab === 'card'}
              onClick={() => setActiveTab('card')}
            />
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className="mt-auto flex flex-col gap-3 pt-3 border-t border-white/10 text-xs">
          {/* Theme Palette Dropdown */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-white/60">Color Palette</span>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white"
            >
              <option value="default" className="text-black">
                Green Court (Default)
              </option>
              <option value="genz1" className="text-black">
                Neon Rave (Gen Z)
              </option>
              <option value="genz2" className="text-black">
                Y2K Pastel (Gen Z)
              </option>
              <option value="mil1" className="text-black">
                Clean Slate (Millennial)
              </option>
              <option value="mil2" className="text-black">
                Warm Studio (Millennial)
              </option>
            </select>
          </div>

          <div className="flex items-center gap-2 opacity-80 text-[11px]">
            <Clock size={13} />
            <span>Tournament Clock: {formatClock(clockMinutes)}</span>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="p-7 overflow-y-auto bg-[#FAF8F3]">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#0E2A20] text-white px-4 py-2.5 rounded-xl shadow-lg border border-white/20 flex items-center gap-2.5 animate-bounce text-xs font-semibold">
            <CheckCircle2 size={16} className="text-[#5DCAA5]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* TOURNAMENT-SCOPED CONTEXT HEADER (When inside a tournament) */}
        {selectedTournamentId && (
          <div className="mb-6 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start md:items-center gap-3">
              <button
                type="button"
                onClick={handleExitToFleet}
                title="Back to All Tournaments Fleet Directory"
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-800 transition"
              >
                <ArrowLeft size={18} />
              </button>

              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {/* Quick Tournament Switcher Dropdown */}
                  <div className="relative inline-block">
                    <select
                      value={selectedTournamentId}
                      onChange={(e) => handleSelectTournament(e.target.value)}
                      className="text-xs font-semibold bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-2.5 py-1 text-gray-800 pr-7 appearance-none cursor-pointer"
                    >
                      {tournaments.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.status})
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={13} className="absolute right-2 top-2 pointer-events-none text-gray-500" />
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1.5 ${
                      event.status === 'Live'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : event.status === 'Published'
                        ? 'bg-blue-50 text-blue-800 border-blue-300'
                        : event.status === 'Draft'
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-gray-100 text-gray-700 border-gray-300'
                    }`}
                  >
                    {event.status === 'Live' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                    <span>{event.status}</span>
                  </span>

                  {/* Game Join Code */}
                  <span className="text-[11px] font-mono font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                    Code: {event.joinCode || 'D-8421'}
                  </span>
                </div>

                <h1 className="text-xl font-bold text-gray-900 tracking-tight">{event.name}</h1>
                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                  <span>{event.dates}</span>
                  <span>&bull;</span>
                  <span>{event.venue}</span>
                  <span>&bull;</span>
                  <span>{event.totalCourts || 8} Competition Courts</span>
                </p>
              </div>
            </div>

            {/* Right Action Links */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Public Player Registration Portal */}
              <Link
                href={`/t/${event.slug || 'austin-winter-open-2026'}`}
                target="_blank"
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <span>Player Portal</span>
                <ExternalLink size={13} />
              </Link>

              {/* TV Broadcast Jumbotron */}
              <button
                type="button"
                onClick={() => setRole('tv')}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Tv size={13} className="text-emerald-400" />
                <span>TV Cast</span>
              </button>

              {/* Status Action Button */}
              {event.status === 'Draft' ? (
                <button
                  type="button"
                  onClick={() => {
                    const updated = { ...event, status: 'Published' as const };
                    setEvent(updated);
                    setTournaments((prev) => prev.map((t) => (t.id === event.id ? updated : t)));
                    showToast(`Tournament published! Registration is now open.`);
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                >
                  Publish Event
                </button>
              ) : event.status === 'Published' ? (
                <button
                  type="button"
                  onClick={() => {
                    const updated = { ...event, status: 'Live' as const };
                    setEvent(updated);
                    setTournaments((prev) => prev.map((t) => (t.id === event.id ? updated : t)));
                    showToast(`Tournament is now LIVE! Court desk and TV broadcasting activated.`);
                  }}
                  className="px-3 py-1.5 bg-[#0A5C43] hover:bg-[#084734] text-white rounded-lg text-xs font-semibold shadow-xs transition"
                >
                  Launch Live Desk
                </button>
              ) : null}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW: FLEET DIRECTORY (All Tournaments Top-Level View) */}
        {/* ============================================================== */}
        {(!selectedTournamentId || activeTab === 'fleet') && (
          <TournamentFleetDirectory
            tournaments={tournaments}
            onSelectTournament={handleSelectTournament}
            onCreateTournament={handleCreateTournament}
          />
        )}

        {/* ============================================================== */}
        {/* VIEW: TOURNAMENT OVERVIEW & DASHBOARD */}
        {/* ============================================================== */}
        {selectedTournamentId && (activeTab === 'overview' || activeTab === 'dash') && role === 'org' && (
          <div className="space-y-6">
            {/* Top KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KpiCard
                label="Teams Paid"
                value="15 of 16"
                subtext="Mixed 3.5 to 4.0 division"
              />
              <KpiCard
                label="Gross Revenue"
                value={`$${(event.revenue || 3630).toLocaleString()}`}
                subtext="10% platform fee: $363"
              />
              <KpiCard
                label="Matches Completed"
                value={`${matches.filter((m) => m.status === 'COMPLETED').length} of ${matches.length}`}
                subtext="Pool play in progress"
              />
              <KpiCard
                label="Open Disputes"
                value={String(disputes.filter((d) => d.status !== 'Resolved').length)}
                subtext="Silent host resolution active"
              />
            </div>

            {/* Dual Column Content */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
              {/* Projected Finish Times */}
              <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">Projected Finish by Division</h2>
                    <p className="text-xs text-gray-500">Live AI schedule pacing across active courts</p>
                  </div>
                  <span className="text-xs font-semibold text-gray-500">
                    Clock: {formatClock(clockMinutes)}
                  </span>
                </div>

                <DivisionProgress
                  title="Mixed Doubles 3.5 to 4.0"
                  planned="6:10 PM"
                  projected={mixedProjectedOffset > 0 ? `6:${10 + mixedProjectedOffset} PM` : '6:06 PM'}
                  status={mixedProjectedOffset > 0 ? `${mixedProjectedOffset}m Behind` : 'On Plan'}
                />
                <DivisionProgress
                  title="Men's Doubles 4.0 and up"
                  planned="5:25 PM"
                  projected="5:25 PM"
                  status="On Plan"
                />
                <DivisionProgress
                  title="Singles Open"
                  planned="4:30 PM"
                  projected="4:30 PM"
                  status="On Plan"
                />

                {mixedProjectedOffset > 0 ? (
                  <div className="mt-5 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-xs text-amber-900">
                        Mixed 3.5 to 4.0 is running {mixedProjectedOffset}m behind schedule
                      </p>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        Shortening 14 upcoming pool matches to games to 9 win by 2 will save 22 mins.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCopilotInitialPrompt(
                          'Courts are running behind. Switch the remaining pool matches in Mixed Doubles 3.5 to 4.0 to games to 9, win by 2.'
                        );
                        setActiveTab('copilot');
                      }}
                      className="px-3 py-1.5 bg-[#EF9F27] text-black font-semibold text-xs rounded-lg hover:opacity-90 shrink-0"
                    >
                      Ask Copilot
                    </button>
                  </div>
                ) : (
                  <div className="mt-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-600" />
                    <span>Pool play rules successfully adjusted. All courts on target for 6:06 PM finish.</span>
                  </div>
                )}
              </section>

              {/* Courts Overview Summary */}
              <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-base font-bold text-gray-900">Courts Overview</h2>
                      <p className="text-xs text-gray-500">{event.totalCourts || courts.length} active competition courts</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('board')}
                      className="text-xs font-semibold text-[#0A5C43] hover:underline"
                    >
                      Manage Desk &rarr;
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {courts.map((c) => (
                      <div key={c.number} className="p-2.5 border border-gray-200 rounded-xl text-center bg-gray-50">
                        <div className="font-bold text-xs text-gray-800">Court {c.number}</div>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider block mt-1 ${
                            c.status === 'live'
                              ? 'bg-emerald-100 text-emerald-800'
                              : c.status === 'called'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-gray-500 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span>Court 2 presented by Volt Paddles</span>
                  <span className="font-semibold text-emerald-700">2 courts available</span>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW: EVENT SETUP & GENERAL RULES */}
        {/* ============================================================== */}
        {selectedTournamentId && (activeTab === 'setup' || activeTab === 'divisions') && (
          <EventSetupView
            event={event}
            divisions={divisions}
            sponsors={sponsors}
            onUpdateEvent={(updated) => {
              setEvent(updated);
              setTournaments((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
              if (updated.totalCourts && updated.totalCourts !== courts.length) {
                setCourts((prev) => generateCourts(updated.totalCourts, prev));
                showToast(`Competition courts updated to ${updated.totalCourts} courts.`);
              }
            }}
            onAddDivision={(div) => {
              setDivisions([...divisions, div]);
              showToast(`Division "${div.name}" added.`);
            }}
            onUpdateDivision={(id, updated) => {
              setDivisions((prev) => prev.map((d) => (d.id === id ? updated : d)));
              showToast(`Division "${updated.name}" updated.`);
            }}
            onDeleteDivision={(id) => {
              setDivisions((prev) => prev.filter((d) => d.id !== id));
              showToast('Division removed.');
            }}
            onPublish={() => {
              const updated = {
                ...event,
                status: 'Published' as const,
                slug: event.slug || event.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                joinCode: event.joinCode || 'D-8421',
              };
              setEvent(updated);
              setTournaments((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
              showToast('Tournament published to independent web portal & Dinkster app!');
            }}
          />
        )}

        {/* ============================================================== */}
        {/* VIEW: BRACKETS & PLAYOFFS & MEDAL PODIUM */}
        {/* ============================================================== */}
        {selectedTournamentId && activeTab === 'brackets' && (
          <BracketsPlayoffsView
            onOpenTvMode={() => {
              setTvInitialMode('bracket');
              setRole('tv');
            }}
          />
        )}

        {/* ============================================================== */}
        {/* VIEW: REGISTRATIONS & PLAYER ACCOUNTS */}
        {/* ============================================================== */}
        {selectedTournamentId && activeTab === 'regs' && (
          <RegistrationsView
            registrations={registrations}
            onAutoSeed={handleAutoSeed}
            onRefund={handleRefund}
          />
        )}

        {/* ============================================================== */}
        {/* VIEW: SPONSORS (Event-Scoped or Global) */}
        {/* ============================================================== */}
        {activeTab === 'sponsors' && (
          <SponsorsView
            sponsors={sponsors}
            totalCourts={event.totalCourts || courts.length}
            onAddSponsor={(sp) => {
              setSponsors([...sponsors, sp]);
              showToast(`Sponsor "${sp.name}" added.`);
            }}
            onAssignCourt={(spIdx, courtNum) => {
              const updated = [...sponsors];
              updated[spIdx].courtAssigned = courtNum;
              setSponsors(updated);
              showToast(`Court ${courtNum ? courtNum : 'None'} assigned to ${updated[spIdx].name}.`);
            }}
          />
        )}

        {/* ============================================================== */}
        {/* VIEW: COURT BOARD (Desk Operations) */}
        {/* ============================================================== */}
        {selectedTournamentId && activeTab === 'board' && (
          <CourtBoardView
            courts={courts}
            sponsors={sponsors}
            matches={matches}
            onCallNextMatch={handleCallNextMatch}
            onStartMatch={handleStartMatch}
            onBlockCourt={handleBlockCourt}
            onReopenCourt={handleReopenCourt}
            onUpdateScore={handleUpdateScore}
            onEndMatch={handleEndMatch}
            onSimulateWetSpot={handleSimulateWetSpot}
          />
        )}

        {/* ============================================================== */}
        {/* VIEW: TV BROADCAST / JUMBOTRON DISPLAY CONFIGURATION */}
        {/* ============================================================== */}
        {selectedTournamentId && activeTab === 'tv' && (
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                  TV Jumbotron & Court Casting
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Real-time broadcast graphics, podium ceremonies, court schedules, and sponsor rotation.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRole('tv')}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition"
              >
                <Tv size={15} className="text-emerald-400" />
                <span>Launch Fullscreen TV View</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                onClick={() => {
                  setTvInitialMode('jumbotron');
                  setRole('tv');
                }}
                className="p-5 border border-gray-200 hover:border-gray-900 rounded-xl cursor-pointer transition bg-gray-50 hover:bg-white"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-gray-900 mb-2">
                  <Tv size={16} className="text-[#0A5C43]" />
                  <span>Jumbotron Court Board</span>
                </div>
                <p className="text-xs text-gray-600">
                  Live scores across all {event.totalCourts || 8} courts, next upcoming match calls, and ticker.
                </p>
              </div>

              <div
                onClick={() => {
                  setTvInitialMode('bracket');
                  setRole('tv');
                }}
                className="p-5 border border-gray-200 hover:border-gray-900 rounded-xl cursor-pointer transition bg-gray-50 hover:bg-white"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-gray-900 mb-2">
                  <Award size={16} className="text-amber-600" />
                  <span>Podium & Medal Matches</span>
                </div>
                <p className="text-xs text-gray-600">
                  Gold, Silver, Bronze podium ceremony with winner banners and photo spotlight.
                </p>
              </div>

              <div
                onClick={() => {
                  setTvInitialMode('cycle');
                  setRole('tv');
                }}
                className="p-5 border border-gray-200 hover:border-gray-900 rounded-xl cursor-pointer transition bg-gray-50 hover:bg-white"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-gray-900 mb-2">
                  <Sparkles size={16} className="text-blue-600" />
                  <span>Automated Carousel Cycle</span>
                </div>
                <p className="text-xs text-gray-600">
                  Cycles between live court board, playoff tree, podium, and sponsor spotlight on configurable timer.
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600 flex items-center justify-between">
              <span>Public Live Jumbotron URL for this tournament:</span>
              <code className="font-mono bg-white px-2 py-1 rounded border text-gray-800 text-[11px]">
                /t/{event.slug || 'austin-winter-open-2026'}/tv
              </code>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW: DISPUTES & INCIDENTS */}
        {/* ============================================================== */}
        {(activeTab === 'disputes' || activeTab === 'incidents') && (
          <DisputesView
            disputes={disputes}
            incidents={incidents}
            onDraftSummary={handleDraftDisputeSummary}
            onEscalate={handleEscalateDispute}
            onResolveDispute={handleResolveDispute}
            onAddIncident={(inc) => {
              setIncidents([inc, ...incidents]);
              showToast(`Incident logged for Court ${inc.courtNumber}.`);
            }}
          />
        )}

        {/* ============================================================== */}
        {/* VIEW: REFEREE SCORECARD */}
        {/* ============================================================== */}
        {activeTab === 'card' && (
          <RefereeScorecardView
            match={matches.find((m) => m.id === 'M107')}
            onSubmitFinalScore={handleRefFinalScore}
            onFlagDispute={() => showToast('Dispute flagged to desk.')}
          />
        )}

        {/* ============================================================== */}
        {/* VIEW: COPILOT AI */}
        {/* ============================================================== */}
        {activeTab === 'copilot' && (
          <CopilotView
            role={role === 'org' ? 'org' : 'desk'}
            matches={matches}
            onConfirmProposal={handleConfirmProposal}
            onRejectProposal={handleRejectProposal}
            initialPrompt={copilotInitialPrompt}
          />
        )}

        {/* ============================================================== */}
        {/* VIEW: CHANGE LOG */}
        {/* ============================================================== */}
        {activeTab === 'log' && (
          <ChangeLogView log={changeLog} onRollback={handleRollback} />
        )}
      </main>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active,
  badge,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition-colors ${
        active ? 'bg-white/20 text-white font-bold shadow-xs' : 'text-white/70 hover:bg-white/10 hover:text-white'
      }`}
    >
      <div className="flex items-center gap-2.5">
        {icon}
        <span>{label}</span>
      </div>
      {badge && (
        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#EF9F27] text-black rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}

function KpiCard({ label, value, subtext }: { label: string; value: string; subtext: string }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
      <div className="text-[11px] font-semibold text-gray-500 uppercase">{label}</div>
      <div className="text-2xl font-bold text-gray-900 my-1">{value}</div>
      <div className="text-xs text-gray-500">{subtext}</div>
    </div>
  );
}

function DivisionProgress({
  title,
  planned,
  projected,
  status,
}: {
  title: string;
  planned: string;
  projected: string;
  status: string;
}) {
  const isBehind = status.toLowerCase().includes('behind');
  return (
    <div className="py-3 border-b border-gray-100 last:border-0 flex justify-between items-center">
      <div>
        <div className="font-semibold text-xs text-gray-900">{title}</div>
        <div className="text-[11px] text-gray-500 mt-0.5">
          Planned finish: {planned} &bull; Projected: {projected}
        </div>
      </div>
      <span
        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
          isBehind ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        }`}
      >
        {status}
      </span>
    </div>
  );
}
