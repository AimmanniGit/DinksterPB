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
  ArrowRight,
  ChevronDown,
  Layers,
  ExternalLink,
  MapPin,
  Plus,
  Play,
  RotateCcw,
  Search,
  BarChart3,
  Bot,
  Zap,
  ChevronRight,
  Settings,
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
  UserActorProfile,
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
  INITIAL_ACTOR_PROFILES,
} from '../constants/initialState';

import { TournamentFleetDirectory } from '../components/fleet';
import { EventSetupView } from '../components/setup';
import { CourtBoardView, DisputesView } from '../components/desk';
import { RegistrationsView, SponsorsView } from '../components/organizer';
import { RefereeScorecardView } from '../components/referee';
import { CopilotView, ChangeLogView, AgenticTournamentCreator } from '../components/copilot';
import { TvBroadcastView } from '../components/tv';
import { BracketsPlayoffsView } from '../components/brackets';
import { SponsorsManagementHub } from '../components/sponsors';
import { ExecutiveAnalyticsHub } from '../components/analytics';
import { CategorizedTournamentSwitcher } from '../components/navigation/CategorizedTournamentSwitcher';
import { ActorRoleSwitcher } from '../components/rbac/ActorRoleSwitcher';
import { PlatformFooter } from '../components/footer/PlatformFooter';

export default function DinksterV2Platform() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [tvInitialMode, setTvInitialMode] = useState<'jumbotron' | 'spotlight' | 'bracket' | 'cycle'>('jumbotron');
  const [isTvFullscreen, setIsTvFullscreen] = useState(false);

  // Multi-Tournament Fleet State
  const [tournaments, setTournaments] = useState<TournamentEvent[]>(INITIAL_TOURNAMENT_FLEET);
  // Default to live tournament 'tourn-austin-live', but user can toggle to Fleet directory anytime (or set null)
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>('tourn-austin-live');
  
  // Workspace Tab State (Clean V2 navigation tabs)
  // 'overview' | 'desk' | 'players' | 'brackets' | 'sponsors' | 'analytics' | 'settings' | 'copilot'
  const [workspaceTab, setWorkspaceTab] = useState<'overview' | 'desk' | 'players' | 'brackets' | 'sponsors' | 'analytics' | 'settings' | 'copilot'>('overview');
  const [isFleetAnalyticsOpen, setIsFleetAnalyticsOpen] = useState(false);

  // RBAC Current Active Role Profile
  const [currentActorProfile, setCurrentActorProfile] = useState<UserActorProfile>(INITIAL_ACTOR_PROFILES.founder);

  // Agentic Copilot Creator Modal
  const [showAgenticCreator, setShowAgenticCreator] = useState(false);

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
      setWorkspaceTab('overview');
      showToast(`Switched workspace to ${found.name}`);
    }
  };

  const handleCreateTournament = (newEvent: TournamentEvent) => {
    setTournaments((prev) => [newEvent, ...prev]);
    setSelectedTournamentId(newEvent.id);
    setEvent(newEvent);
    setWorkspaceTab('settings');
    showToast(`Created "${newEvent.name}". Workspace opened.`);
  };

  // Agentic Copilot Tournament Creation Handler
  const handleAgenticTournamentCreated = (
    newEvent: TournamentEvent,
    newDivisions: Division[],
    autoPublish: boolean
  ) => {
    setTournaments((prev) => [newEvent, ...prev]);
    setSelectedTournamentId(newEvent.id);
    setEvent(newEvent);
    setDivisions(newDivisions);
    setCourts(generateCourts(newEvent.totalCourts || 12));
    setWorkspaceTab(autoPublish ? 'overview' : 'settings');
    showToast(
      autoPublish
        ? `"${newEvent.name}" published live! Player registration open.`
        : `"${newEvent.name}" created as draft. Workspace opened.`
    );
  };

  const handleExitToFleet = () => {
    setSelectedTournamentId(null);
    showToast('Returned to All Tournaments Fleet Directory.');
  };

  // Sponsor & Partner Actions
  const handleAddSponsor = (newSponsor: Sponsor) => {
    setSponsors((prev) => [newSponsor, ...prev]);
    showToast(`Added sponsor: ${newSponsor.name}`);
  };

  const handleUpdateSponsor = (index: number, updated: Sponsor) => {
    setSponsors((prev) => prev.map((s, idx) => (idx === index ? updated : s)));
    showToast(`Updated sponsor: ${updated.name}`);
  };

  const handleDeleteSponsor = (index: number) => {
    setSponsors((prev) => prev.filter((_, idx) => idx !== index));
    showToast('Sponsor removed.');
  };

  const handleAssignCourt = (sponsorIndex: number, courtNumber: number | null) => {
    setSponsors((prev) =>
      prev.map((s, idx) => (idx === sponsorIndex ? { ...s, courtAssigned: courtNumber } : s))
    );
    showToast(courtNumber ? `Assigned to Court ${courtNumber}` : 'Court assignment cleared');
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
    showToast(`Court ${courtNumber} match ended. Final score locked.`);
  };

  const handleSimulateWetSpot = () => {
    setWorkspaceTab('copilot');
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

  // Fullscreen TV Broadcast View Mode
  if (isTvFullscreen) {
    return (
      <TvBroadcastView
        tournamentName={event.name}
        venueName={event.venue}
        courts={courts}
        matches={matches}
        sponsors={sponsors}
        initialMode={tvInitialMode}
        onExitTvMode={() => setIsTvFullscreen(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-gray-900 font-sans flex flex-col antialiased selection:bg-[#0A5C43] selection:text-white">
      
      {/* ============================================================== */}
      {/* V2 MINIMALIST APPLE/TESLA NAVIGATION HIERARCHY */}
      {/* TIER 1: GLOBAL BRAND & CONTEXTUAL SWITCHER */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/80 px-4 sm:px-6 py-2.5 transition">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Left: Brand + Contextual Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" onClick={() => setSelectedTournamentId(null)} className="flex items-center shrink-0">
              <span className="font-extrabold text-xl tracking-tight text-[#0A5C43]">
                dink<span className="text-[#EF9F27]">ster</span>
              </span>
            </Link>

            {selectedTournamentId && (
              <>
                <span className="text-gray-300 font-normal shrink-0">/</span>

                {/* Categorized Tournament Switcher (Live, Upcoming, Drafts, Concluded) */}
                <div className="min-w-0">
                  <CategorizedTournamentSwitcher
                    tournaments={tournaments}
                    selectedTournamentId={selectedTournamentId}
                    onSelectTournament={handleSelectTournament}
                    onExitToFleet={handleExitToFleet}
                    onOpenCreateModal={() => setShowAgenticCreator(true)}
                  />
                </div>
              </>
            )}
          </div>

          {/* Right: RBAC Role Switcher & Action Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {selectedTournamentId ? (
              <>
                {/* Copilot AI Assistant (Prominent Intelligence Trigger) */}
                <button
                  type="button"
                  onClick={() => setWorkspaceTab('copilot')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs ${
                    workspaceTab === 'copilot'
                      ? 'bg-[#EF9F27] text-black shadow-xs ring-2 ring-[#EF9F27]/40'
                      : 'bg-emerald-50 text-[#0A5C43] hover:bg-emerald-100 border border-emerald-200'
                  }`}
                  title="Open Copilot Tournament AI Assistant"
                >
                  <Sparkles size={13} className="text-[#EF9F27]" />
                  <span className="hidden sm:inline">Copilot AI</span>
                  <span className="sm:hidden">Copilot</span>
                </button>

                {/* TV Broadcast Presentation View */}
                <button
                  type="button"
                  onClick={() => setIsTvFullscreen(true)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition flex items-center gap-1.5 shadow-2xs"
                  title="Launch Jumbotron & Court Board Cast View"
                >
                  <Tv size={13} className="text-emerald-400" />
                  <span className="hidden md:inline">TV Cast</span>
                </button>

                {/* Public Registration Link */}
                <Link
                  href={`/t/${event.slug || 'austin-winter-open-2026'}`}
                  target="_blank"
                  className="px-3 py-1.5 rounded-xl text-xs font-medium bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 transition flex items-center gap-1.5"
                  title="Open Public Player Registration Portal"
                >
                  <span className="hidden md:inline">Player Portal</span>
                  <ExternalLink size={12} className="text-gray-400" />
                </Link>

                <div className="h-4 w-[1px] bg-gray-200 mx-0.5 hidden sm:block" />

                {/* RBAC Role Switcher (Founder, Director, Marshall, Volunteer) */}
                <ActorRoleSwitcher
                  currentProfile={currentActorProfile}
                  onSelectProfile={(p) => {
                    setCurrentActorProfile(p);
                    showToast(`Switched active actor role to ${p.name}`);
                  }}
                />
              </>
            ) : (
              /* Fleet Level Top Actions */
              <div className="flex items-center gap-2.5">
                {currentActorProfile.permissions.canManageFleet && (
                  <button
                    type="button"
                    onClick={() => setShowAgenticCreator(true)}
                    className="px-4 py-2 bg-[#0A5C43] hover:bg-[#084734] text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs"
                  >
                    <Sparkles size={15} className="text-[#EF9F27]" />
                    <span>Create with Copilot AI</span>
                  </button>
                )}

                {currentActorProfile.permissions.canManageFleet && (
                  <div className="h-4 w-[1px] bg-gray-200 mx-0.5" />
                )}

                <ActorRoleSwitcher
                  currentProfile={currentActorProfile}
                  onSelectProfile={(p) => {
                    setCurrentActorProfile(p);
                    showToast(`Switched active actor role to ${p.name}`);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* TIER 2: WORKSPACE SUB-NAVIGATION (DEDICATED, UNCLUTTERED BAR)  */}
      {/* ============================================================== */}
      {selectedTournamentId && (
        <div className="sticky top-[53px] z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/90 shadow-2xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
            {/* Clean Underline Navigation Tabs with Zero Scrollbars */}
            <nav className="flex items-center space-x-1 sm:space-x-4 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-1">
              <button
                type="button"
                onClick={() => setWorkspaceTab('overview')}
                className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition whitespace-nowrap ${
                  workspaceTab === 'overview'
                    ? 'bg-gray-100 text-gray-900 font-bold'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Overview
              </button>

              <button
                type="button"
                onClick={() => setWorkspaceTab('desk')}
                className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
                  workspaceTab === 'desk'
                    ? 'bg-emerald-50 text-[#0A5C43] font-bold border border-emerald-200/60'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {event.status === 'Live' && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                <span>Courts & Live Desk</span>
              </button>

              <button
                type="button"
                onClick={() => setWorkspaceTab('players')}
                className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition whitespace-nowrap ${
                  workspaceTab === 'players'
                    ? 'bg-gray-100 text-gray-900 font-bold'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Players & Teams
              </button>

              <button
                type="button"
                onClick={() => setWorkspaceTab('brackets')}
                className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition whitespace-nowrap ${
                  workspaceTab === 'brackets'
                    ? 'bg-gray-100 text-gray-900 font-bold'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Brackets & Medals
              </button>

              <button
                type="button"
                onClick={() => setWorkspaceTab('sponsors')}
                className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
                  workspaceTab === 'sponsors'
                    ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200/60'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span>Sponsors & Deals</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-200/80 text-amber-950 font-black">
                  {sponsors.length}
                </span>
              </button>

              {/* Executive Analytics Tab (Founder & Director Exclusive) */}
              {currentActorProfile.permissions.canViewAnalytics && (
                <button
                  type="button"
                  onClick={() => setWorkspaceTab('analytics')}
                  className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
                    workspaceTab === 'analytics'
                      ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200/70 shadow-2xs'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  title="Portfolio & Event Commercial Analytics (Founder & Director)"
                >
                  <BarChart3 size={14} className="text-blue-600" />
                  <span>Executive Analytics</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setWorkspaceTab('settings')}
                className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition whitespace-nowrap ${
                  workspaceTab === 'settings'
                    ? 'bg-gray-100 text-gray-900 font-bold'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Event Settings
              </button>
            </nav>

            {/* Clean Exit to Fleet Directory shortcut (wide desktop only, eliminating menu overlap) */}
            <div className="hidden xl:flex items-center shrink-0 pl-4">
              <button
                type="button"
                onClick={handleExitToFleet}
                className="text-xs text-gray-500 hover:text-[#0A5C43] font-semibold transition flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100"
                title="Return to All Tournaments Fleet Directory"
              >
                <span>Fleet Directory</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0E2A20] text-white px-4 py-2.5 rounded-xl shadow-lg border border-white/20 flex items-center gap-2.5 animate-bounce text-xs font-semibold">
          <CheckCircle2 size={16} className="text-[#5DCAA5]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* MAIN VIEW: FLEET DIRECTORY OR SCOPED WORKSPACE */}
      {/* ============================================================== */}
      <main className="max-w-7xl mx-auto px-6 py-6 w-full flex-1">
        
        {/* ============================================================ */}
        {/* VIEW 1: FLEET DIRECTORY OR PORTFOLIO EXECUTIVE ANALYTICS */}
        {/* ============================================================ */}
        {!selectedTournamentId && (
          <div className="space-y-6">
            {isFleetAnalyticsOpen && currentActorProfile.permissions.canViewAnalytics ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setIsFleetAnalyticsOpen(false)}
                    className="text-xs font-bold text-gray-700 hover:text-[#0A5C43] transition flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 shadow-2xs"
                  >
                    <ArrowLeft size={13} />
                    <span>Return to Fleet Directory</span>
                  </button>
                </div>
                <ExecutiveAnalyticsHub
                  tournaments={tournaments}
                  sponsors={sponsors}
                  divisions={divisions}
                  selectedTournamentId={null}
                  actorProfile={currentActorProfile}
                  onSelectTournament={handleSelectTournament}
                  onAskCopilot={(prompt) => {
                    setCopilotInitialPrompt(prompt);
                    setSelectedTournamentId(tournaments[0]?.id || 'tourn-austin-live');
                    setWorkspaceTab('copilot');
                  }}
                />
              </div>
            ) : (
              <TournamentFleetDirectory
                tournaments={tournaments}
                sponsors={sponsors}
                activeTournamentId={selectedTournamentId}
                onSelectTournament={handleSelectTournament}
                onCreateTournament={handleCreateTournament}
                onAddSponsor={handleAddSponsor}
                onUpdateSponsor={handleUpdateSponsor}
                onDeleteSponsor={handleDeleteSponsor}
                onAssignCourt={handleAssignCourt}
                actorProfile={currentActorProfile}
                onOpenAnalytics={() => setIsFleetAnalyticsOpen(true)}
              />
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 2: TOURNAMENT SCOPED WORKSPACE TABS */}
        {/* ============================================================ */}
        {selectedTournamentId && (
          <div className="space-y-6">
            
            {/* TAB: OVERVIEW */}
            {workspaceTab === 'overview' && (
              <div className="space-y-6">
                
                {/* Event Header Card */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-gray-500">{event.dates}</span>
                      <span>&bull;</span>
                      <span className="text-xs font-semibold text-gray-500">{event.venue}</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{event.name}</h1>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                      <span>{event.totalCourts || 8} Competition Courts</span>
                      <span>&bull;</span>
                      <span>Format: {event.tournamentFormat || 'Round Robin Pools'}</span>
                      <span>&bull;</span>
                      <span>Ball: {event.ballType || 'Franklin X-40'}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-auto">
                    <button
                      type="button"
                      onClick={() => setWorkspaceTab('desk')}
                      className="px-4 py-2.5 bg-[#0A5C43] hover:bg-[#084734] text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                    >
                      <Play size={14} className="fill-white" />
                      <span>Launch Live Desk</span>
                    </button>
                  </div>
                </div>

                {/* 4 Clean Metric Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                    <span className="text-[11px] font-semibold text-gray-500 uppercase block">Teams Registered</span>
                    <div className="text-2xl font-bold text-gray-900 my-1">16 of 16</div>
                    <span className="text-xs text-emerald-700 font-semibold">100% capacity filled</span>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                    {currentActorProfile.permissions.canViewFinancials ? (
                      <>
                        <span className="text-[11px] font-semibold text-gray-500 uppercase block">Gross Revenue</span>
                        <div className="text-2xl font-bold text-[#0A5C43] my-1">${(event.revenue || 3630).toLocaleString()}</div>
                        <span className="text-xs text-gray-500">10% Platform fee: $363</span>
                      </>
                    ) : (
                      <>
                        <span className="text-[11px] font-semibold text-gray-500 uppercase block">Court Utilization</span>
                        <div className="text-2xl font-bold text-[#0A5C43] my-1">
                          {courts.filter((c) => c.status === 'live').length} of {courts.length} Courts
                        </div>
                        <span className="text-xs text-emerald-700 font-semibold">Live match dispatch active</span>
                      </>
                    )}
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                    <span className="text-[11px] font-semibold text-gray-500 uppercase block">Matches Completed</span>
                    <div className="text-2xl font-bold text-gray-900 my-1">
                      {matches.filter((m) => m.status === 'COMPLETED').length} of {matches.length}
                    </div>
                    <span className="text-xs text-gray-500">Pool matches in progress</span>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                    <span className="text-[11px] font-semibold text-gray-500 uppercase block">Open Disputes</span>
                    <div className="text-2xl font-bold text-gray-900 my-1">
                      {disputes.filter((d) => d.status !== 'Resolved').length}
                    </div>
                    <span className="text-xs text-gray-500">Silent host resolution</span>
                  </div>
                </div>

                {/* Dual Column: Schedule Pace & Courts Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
                  <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-base font-bold text-gray-900">Projected Finish by Division</h2>
                        <p className="text-xs text-gray-500">Live AI schedule pacing across active courts</p>
                      </div>
                      <span className="text-xs font-semibold text-gray-500">
                        Tournament Clock: {formatClock(clockMinutes)}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3 bg-gray-50 rounded-xl flex justify-between items-center border border-gray-200">
                        <div>
                          <div className="font-bold text-xs text-gray-900">Mixed Doubles 3.5 to 4.0</div>
                          <div className="text-[11px] text-gray-500">Planned: 6:10 PM &bull; Projected: {mixedProjectedOffset > 0 ? `6:${10 + mixedProjectedOffset} PM` : '6:06 PM'}</div>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          mixedProjectedOffset > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {mixedProjectedOffset > 0 ? `${mixedProjectedOffset}m Behind` : 'On Plan'}
                        </span>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-xl flex justify-between items-center border border-gray-200">
                        <div>
                          <div className="font-bold text-xs text-gray-900">Men&apos;s Doubles 4.0 and Above</div>
                          <div className="text-[11px] text-gray-500">Planned: 5:25 PM &bull; Projected: 5:25 PM</div>
                        </div>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          On Plan
                        </span>
                      </div>
                    </div>

                    {mixedProjectedOffset > 0 && (
                      <div className="mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                        <div>
                          <strong className="text-amber-900 block font-bold">Courts are running 18m behind schedule</strong>
                          <span className="text-amber-800 text-[11px]">Shortening 14 pool matches to 9 points saves 22 mins.</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setWorkspaceTab('copilot');
                            setCopilotInitialPrompt('Courts are running behind. Switch the remaining pool matches in Mixed Doubles 3.5 to 4.0 to games to 9, win by 2.');
                          }}
                          className="px-3 py-1.5 bg-[#EF9F27] text-black font-bold text-xs rounded-lg hover:opacity-90 shrink-0"
                        >
                          Ask Copilot
                        </button>
                      </div>
                    )}
                  </section>

                  <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-bold text-gray-900">Competition Courts</h2>
                        <button
                          type="button"
                          onClick={() => setWorkspaceTab('desk')}
                          className="text-xs font-semibold text-[#0A5C43] hover:underline"
                        >
                          Open Live Desk &rarr;
                        </button>
                      </div>

                      <div className="grid grid-cols-4 gap-2 mb-3">
                        {courts.map((c) => (
                          <div key={c.number} className="p-2 border border-gray-200 rounded-xl text-center bg-gray-50">
                            <div className="font-bold text-xs text-gray-800">Court {c.number}</div>
                            <span
                              className={`text-[9px] font-bold px-1 py-0.2 rounded uppercase block mt-1 ${
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

                    <div className="text-xs text-gray-500 pt-3 border-t border-gray-100 flex justify-between">
                      <span>Court 2 sponsored by Volt Paddles</span>
                      <span className="text-emerald-700 font-semibold">2 Courts Open</span>
                    </div>
                  </section>
                </div>
              </div>
            )}

            {/* TAB: COURTS & DESK (Live Board & Silent Host Disputes) */}
            {workspaceTab === 'desk' && (
              <div className="space-y-6">
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

                {/* Silent Host Disputes Section */}
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
              </div>
            )}

            {/* TAB: PLAYERS & TEAMS */}
            {workspaceTab === 'players' && (
              <RegistrationsView
                registrations={registrations}
                onAutoSeed={handleAutoSeed}
                onRefund={handleRefund}
                canViewFinancials={currentActorProfile.permissions.canViewFinancials}
              />
            )}

            {/* TAB: BRACKETS & MEDALS */}
            {workspaceTab === 'brackets' && (
              <BracketsPlayoffsView
                onOpenTvMode={() => {
                  setTvInitialMode('bracket');
                  setIsTvFullscreen(true);
                }}
              />
            )}

            {/* TAB: SPONSORS & COMMERCIAL PARTNERS */}
            {workspaceTab === 'sponsors' && (
              <div className="space-y-6">
                <SponsorsManagementHub
                  sponsors={sponsors}
                  totalCourts={event.totalCourts || 8}
                  divisions={divisions}
                  onAddSponsor={handleAddSponsor}
                  onUpdateSponsor={handleUpdateSponsor}
                  onDeleteSponsor={handleDeleteSponsor}
                  onAssignCourt={handleAssignCourt}
                  canViewFinancials={currentActorProfile.permissions.canViewFinancials}
                  canManageSponsors={currentActorProfile.permissions.canManageEventSponsors}
                />
              </div>
            )}

            {/* TAB: EXECUTIVE ANALYTICS (Founder & Director Exclusive) */}
            {workspaceTab === 'analytics' && currentActorProfile.permissions.canViewAnalytics && (
              <ExecutiveAnalyticsHub
                tournaments={tournaments}
                sponsors={sponsors}
                divisions={divisions}
                selectedTournamentId={selectedTournamentId}
                actorProfile={currentActorProfile}
                onSelectTournament={handleSelectTournament}
                onAskCopilot={(prompt) => {
                  setCopilotInitialPrompt(prompt);
                  setWorkspaceTab('copilot');
                }}
              />
            )}

            {/* TAB: SETUP & SETTINGS */}
            {workspaceTab === 'settings' && (
              <EventSetupView
                event={event}
                divisions={divisions}
                sponsors={sponsors}
                canViewFinancials={currentActorProfile.permissions.canViewFinancials}
                canEditRules={currentActorProfile.permissions.canEditTournamentRules}
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
                onAddSponsor={handleAddSponsor}
                onUpdateSponsor={handleUpdateSponsor}
                onDeleteSponsor={handleDeleteSponsor}
                onAssignCourt={handleAssignCourt}
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

            {/* TAB: COPILOT AI */}
            {workspaceTab === 'copilot' && (
              <CopilotView
                role="org"
                matches={matches}
                onConfirmProposal={handleConfirmProposal}
                onRejectProposal={handleRejectProposal}
                initialPrompt={copilotInitialPrompt}
              />
            )}
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* AGENTIC COPILOT TOURNAMENT CREATOR (Autonomous Architect) */}
      {/* ============================================================== */}
      <AgenticTournamentCreator
        isOpen={showAgenticCreator}
        onClose={() => setShowAgenticCreator(false)}
        onCreated={handleAgenticTournamentCreated}
      />

      {/* Rich Multi-Tier Platform Footer with Emergency Desk Support & Hotline */}
      <PlatformFooter />
    </div>
  );
}
