'use client';

import React, { useState } from 'react';
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
  INITIAL_DIVISIONS,
  INITIAL_REGISTRATIONS,
  INITIAL_SPONSORS,
  generateInitialMatches,
  INITIAL_COURTS,
  generateCourts,
  INITIAL_DISPUTES,
  INITIAL_INCIDENTS,
} from '../constants/initialState';

import { EventSetupView } from '../components/setup';
import { CourtBoardView, DisputesView } from '../components/desk';
import { RegistrationsView, SponsorsView } from '../components/organizer';
import { RefereeScorecardView } from '../components/referee';
import { CopilotView, ChangeLogView } from '../components/copilot';
import { TvBroadcastView } from '../components/tv';
import { BracketsPlayoffsView } from '../components/brackets';

export default function DinksterWebPlatform() {
  const [role, setRole] = useState<Role>('org');
  const [activeTab, setActiveTab] = useState<TabKey>('dash');
  const [theme, setTheme] = useState('default');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [tvInitialMode, setTvInitialMode] = useState<'jumbotron' | 'spotlight' | 'bracket' | 'cycle'>('jumbotron');

  // Tournament Data State
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const formatClock = (mins: number) => {
    const h = Math.floor(mins / 60) % 24;
    const m = mins % 60;
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
  };

  // ==========================================
  // DISPATCHERS
  // ==========================================
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

  const handleRejectProposal = (propId: number) => {
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

  const handleRefFinalScore = (sets: [number, number][]) => {
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
      <aside className="bg-[#0A5C43] text-white p-5 flex flex-col gap-3 sticky top-0 h-screen select-none">
        {/* Brand */}
        <div className="font-display font-extrabold text-2xl tracking-tight mb-1">
          dink<span className="text-[#EF9F27]">ster</span>
          <span className="text-xs font-mono font-normal ml-2 opacity-70">platform v5</span>
        </div>

        {/* Role Switcher */}
        <div className="grid grid-cols-4 gap-1 bg-white/10 rounded-xl p-1 mb-2">
          {(['org', 'desk', 'ref', 'tv'] as const).map((r) => (
            <button
              key={r}
              onClick={() => {
                setRole(r);
                if (r !== 'tv') {
                  setActiveTab(r === 'org' ? 'dash' : r === 'desk' ? 'board' : 'card');
                }
              }}
              className={`py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                role === r ? 'bg-[#EF9F27] text-black shadow-sm' : 'text-white/80 hover:bg-white/10'
              }`}
            >
              {r === 'org' ? 'Org' : r === 'desk' ? 'Desk' : r === 'ref' ? 'Ref' : '📺 TV'}
            </button>
          ))}
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1">
          {role === 'org' && (
            <>
              <NavItem
                icon={<LayoutDashboard size={18} />}
                label="Dashboard"
                active={activeTab === 'dash'}
                onClick={() => setActiveTab('dash')}
              />
              <NavItem
                icon={<Calendar size={18} />}
                label="Event Setup"
                active={activeTab === 'setup'}
                onClick={() => setActiveTab('setup')}
              />
              <NavItem
                icon={<Trophy size={18} />}
                label="Brackets & Medals"
                active={activeTab === 'brackets'}
                onClick={() => setActiveTab('brackets')}
              />
              <NavItem
                icon={<Users size={18} />}
                label="Registrations"
                active={activeTab === 'regs'}
                badge="16/16"
                onClick={() => setActiveTab('regs')}
              />
              <NavItem
                icon={<Award size={18} />}
                label="Sponsors"
                active={activeTab === 'sponsors'}
                onClick={() => setActiveTab('sponsors')}
              />
              <NavItem
                icon={<Sparkles size={18} />}
                label="Copilot AI"
                active={activeTab === 'copilot'}
                onClick={() => {
                  setCopilotInitialPrompt(undefined);
                  setActiveTab('copilot');
                }}
              />
              <NavItem
                icon={<ClipboardList size={18} />}
                label="Change Log"
                active={activeTab === 'log'}
                badge={changeLog.length > 0 ? String(changeLog.length) : undefined}
                onClick={() => setActiveTab('log')}
              />
            </>
          )}

          {role === 'desk' && (
            <>
              <NavItem
                icon={<Trophy size={18} />}
                label="Court Board"
                active={activeTab === 'board'}
                onClick={() => setActiveTab('board')}
              />
              <NavItem
                icon={<AlertCircle size={18} />}
                label="Disputes"
                active={activeTab === 'disputes'}
                badge={disputes.filter((d) => d.status !== 'Resolved').length > 0 ? '2' : undefined}
                onClick={() => setActiveTab('disputes')}
              />
              <NavItem
                icon={<Flame size={18} />}
                label="Incidents"
                active={activeTab === 'incidents'}
                onClick={() => setActiveTab('incidents')}
              />
              <NavItem
                icon={<Sparkles size={18} />}
                label="Desk Copilot"
                active={activeTab === 'copilot'}
                onClick={() => setActiveTab('copilot')}
              />
            </>
          )}

          {role === 'ref' && (
            <NavItem
              icon={<Trophy size={18} />}
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

          <div className="flex items-center gap-2 opacity-80">
            <Clock size={14} />
            <span>Tournament Clock: {formatClock(clockMinutes)}</span>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="p-8 overflow-y-auto bg-[#FAF8F3]">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#0E2A20] text-white px-5 py-3 rounded-2xl shadow-xl border border-white/20 flex items-center gap-3 animate-bounce">
            <CheckCircle2 size={18} className="text-[#5DCAA5]" />
            <span className="text-xs font-bold">{toastMessage}</span>
          </div>
        )}

        {/* VIEW: DASHBOARD */}
        {activeTab === 'dash' && role === 'org' && (
          <div>
            <header className="flex justify-between items-center mb-6">
              <div>
                <h1 className="font-display font-bold text-3xl">{event.name}</h1>
                <p className="text-sm text-gray-600">
                  {event.dates} &bull; {event.venue}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-green-100 text-[#0A5C43] rounded-full text-xs font-bold border border-green-300">
                  {event.status}
                </span>
                <button
                  onClick={() => setRole('tv')}
                  className="px-3.5 py-2 bg-slate-900 text-white border border-slate-700 rounded-xl font-bold text-xs hover:bg-slate-800 shadow-sm flex items-center gap-1.5 transition"
                >
                  <Tv size={15} className="text-emerald-400" />
                  TV Cast Mode
                </button>
                <button
                  onClick={() => {
                    const nextStatus = event.status === 'Draft' ? 'Published' : 'Live';
                    setEvent({ ...event, status: nextStatus });
                    showToast(`Tournament status updated to ${nextStatus}.`);
                  }}
                  className="px-4 py-2 bg-[#0A5C43] text-white rounded-xl font-bold text-sm hover:opacity-95 shadow-sm"
                >
                  {event.status === 'Draft' ? 'Publish Event' : 'Launch Tournament Live'}
                </button>
              </div>
            </header>

            {/* Top KPI Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <KpiCard label="Teams Paid" value="15 of 16" subtext="Mixed 3.5 to 4.0" />
              <KpiCard label="Gross Revenue" value="$3,630" subtext="10% platform fee: $363" />
              <KpiCard
                label="Matches Completed"
                value={`${matches.filter((m) => m.status === 'COMPLETED').length} of ${matches.length}`}
                subtext="Pool play in progress"
              />
              <KpiCard
                label="Open Disputes"
                value={String(disputes.filter((d) => d.status !== 'Resolved').length)}
                subtext="1 line call, 1 score diff"
              />
            </div>

            {/* Dual Column Content */}
            <div className="grid grid-cols-[1.4fr_1fr] gap-6">
              <section className="bg-white p-6 rounded-2xl border border-black/10 shadow-sm">
                <h2 className="font-display font-bold text-xl mb-4">Projected Finish by Division</h2>

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
                  <div className="mt-6 p-4 bg-[#FEF3E2] border border-[#FAC775] rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-[#7A4A00]">
                        Mixed 3.5 to 4.0 is running {mixedProjectedOffset}m behind
                      </p>
                      <p className="text-xs text-[#7A4A00]">
                        Shortening 14 upcoming pool matches to games to 9 win by 2 will save 22 mins.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setCopilotInitialPrompt(
                          'Courts are running behind. Switch the remaining pool matches in Mixed Doubles 3.5 to 4.0 to games to 9, win by 2.'
                        );
                        setActiveTab('copilot');
                      }}
                      className="px-3.5 py-2 bg-[#EF9F27] text-black font-bold text-xs rounded-lg shadow-sm hover:opacity-90"
                    >
                      Ask Copilot
                    </button>
                  </div>
                ) : (
                  <div className="mt-6 p-4 bg-[#E8F7F1] border border-[#5DCAA5] rounded-xl text-xs font-bold text-[#0A5C43]">
                    ✓ Pool play rules successfully adjusted. All courts on target for 6:06 PM finish.
                  </div>
                )}
              </section>

              <section className="bg-white p-6 rounded-2xl border border-black/10 shadow-sm flex flex-col justify-between">
                <div>
                  <h2 className="font-display font-bold text-xl mb-4">Courts Overview</h2>
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {courts.map((c) => (
                      <div key={c.number} className="p-2.5 border rounded-xl text-center">
                        <div className="font-bold text-xs">Court {c.number}</div>
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider block mt-1 ${
                            c.status === 'live'
                              ? 'bg-green-100 text-[#0A5C43]'
                              : c.status === 'called'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-xs text-gray-500 pt-3 border-t">
                  Court 2 presented by Volt Paddles &bull; 2 courts available for assignments.
                </div>
              </section>
            </div>
          </div>
        )}

        {/* VIEW: SETUP */}
        {activeTab === 'setup' && (
          <EventSetupView
            event={event}
            divisions={divisions}
            sponsors={sponsors}
            onUpdateEvent={(updated) => {
              setEvent(updated);
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
              setEvent((prev) => ({
                ...prev,
                status: 'Published',
                slug: prev.slug || prev.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                joinCode: prev.joinCode || 'D-8421',
              }));
              showToast('Tournament published to independent web portal & Dinkster app!');
            }}
          />
        )}

        {/* VIEW: BRACKETS & PLAYOFFS */}
        {activeTab === 'brackets' && (
          <BracketsPlayoffsView
            onOpenTvMode={() => {
              setTvInitialMode('bracket');
              setRole('tv');
            }}
          />
        )}

        {/* VIEW: REGISTRATIONS */}
        {activeTab === 'regs' && (
          <RegistrationsView
            registrations={registrations}
            onAutoSeed={handleAutoSeed}
            onRefund={handleRefund}
          />
        )}

        {/* VIEW: SPONSORS */}
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

        {/* VIEW: COURT BOARD */}
        {activeTab === 'board' && (
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

        {/* VIEW: DISPUTES & INCIDENTS */}
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

        {/* VIEW: REFEREE SCORECARD */}
        {activeTab === 'card' && (
          <RefereeScorecardView
            match={matches.find((m) => m.id === 'M107')}
            onSubmitFinalScore={handleRefFinalScore}
            onFlagDispute={() => showToast('Dispute flagged to desk.')}
          />
        )}

        {/* VIEW: COPILOT */}
        {activeTab === 'copilot' && (
          <CopilotView
            role={role === 'org' ? 'org' : 'desk'}
            matches={matches}
            onConfirmProposal={handleConfirmProposal}
            onRejectProposal={handleRejectProposal}
            initialPrompt={copilotInitialPrompt}
          />
        )}

        {/* VIEW: CHANGE LOG */}
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
      onClick={onClick}
      className={`flex items-center justify-between p-2.5 rounded-xl text-sm font-semibold transition-colors ${
        active ? 'bg-white/20 text-white shadow-sm' : 'text-white/70 hover:bg-white/10 hover:text-white'
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>
      {badge && (
        <span className="text-[11px] font-bold px-1.5 py-0.5 bg-[#EF9F27] text-black rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}

function KpiCard({ label, value, subtext }: { label: string; value: string; subtext: string }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-sm">
      <div className="text-xs font-bold text-gray-500 uppercase">{label}</div>
      <div className="font-display font-extrabold text-3xl my-1">{value}</div>
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
    <div className="py-3 border-b last:border-0 flex justify-between items-center">
      <div>
        <div className="font-bold text-sm">{title}</div>
        <div className="text-xs text-gray-500">
          Planned finish: {planned} &bull; Projected: {projected}
        </div>
      </div>
      <span
        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
          isBehind ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}
      >
        {status}
      </span>
    </div>
  );
}
