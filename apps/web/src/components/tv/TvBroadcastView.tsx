'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Tv,
  Maximize2,
  Minimize2,
  Share2,
  Clock,
  Trophy,
  Medal,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  Settings,
  Check,
  RotateCw,
  Pause,
  Play,
} from 'lucide-react';
import {
  CourtDeskState,
  TournamentMatch,
  Sponsor,
  DivisionBracketData,
  PlayoffMatchNode,
} from '../../types/organizer';
import { INITIAL_BRACKET_DATA } from '../../constants/initialState';
import { TvOlympicPodium } from './TvOlympicPodium';

interface TvBroadcastViewProps {
  tournamentName?: string;
  venueName?: string;
  courts: CourtDeskState[];
  matches: TournamentMatch[];
  sponsors?: Sponsor[];
  onExitTvMode?: () => void;
  bracketData?: Record<string, DivisionBracketData>;
  initialMode?: 'jumbotron' | 'spotlight' | 'bracket' | 'cycle' | 'podium' | 'courts' | 'pools' | string;
}

export const TvBroadcastView: React.FC<TvBroadcastViewProps> = ({
  tournamentName = 'Austin Winter Open 2026',
  venueName = 'Austin Tennis & Pickleball Center',
  courts,
  matches,
  sponsors = [],
  onExitTvMode,
  bracketData = INITIAL_BRACKET_DATA,
  initialMode,
}) => {
  // Available screen items in rotation
  const divisionList = useMemo(() => Object.values(bracketData), [bracketData]);
  const allDivisionIds = useMemo(() => divisionList.map((d) => d.divisionId), [divisionList]);

  // Operator Settings State (Persisted in LocalStorage)
  const [selectedDivisionIds, setSelectedDivisionIds] = useState<string[]>(allDivisionIds);

  // Synchronize selectedDivisionIds whenever division list updates
  useEffect(() => {
    setSelectedDivisionIds((prev) => {
      const missing = allDivisionIds.filter((id) => !prev.includes(id));
      return missing.length > 0 ? [...prev, ...missing] : prev;
    });
  }, [allDivisionIds]);
  const [includeLiveCourts, setIncludeLiveCourts] = useState<boolean>(true);
  const [rotate, setRotate] = useState<boolean>(true);
  const [dwellSecs, setDwellSecs] = useState<number>(15);
  const [dwellDraft, setDwellDraft] = useState<string>('15');
  const [poolsPerView, setPoolsPerView] = useState<number>(4);
  const [poolsPerViewDraft, setPoolsPerViewDraft] = useState<string>('4');
  const [poolFlipSecs, setPoolFlipSecs] = useState<number>(8);
  const [poolFlipDraft, setPoolFlipDraft] = useState<string>('8');
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [themeMode, setThemeMode] = useState<'dark' | 'green' | 'light'>('dark');

  // Active Presentation State
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(15);
  const [poolHalfIndex, setPoolHalfIndex] = useState<number>(0);
  const [poolHalfRemaining, setPoolHalfRemaining] = useState<number>(8);

  // Operator UI State
  const [panelOpen, setPanelOpen] = useState<boolean>(false);
  const [extraSettingsCollapsed, setExtraSettingsCollapsed] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  const autoCloseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-close operator control panel after 6s of inactivity
  const scheduleAutoClose = useCallback(() => {
    if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
    autoCloseTimerRef.current = setTimeout(() => {
      setPanelOpen(false);
    }, 6000);
  }, []);

  // Update wall clock every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Compute rotation screen sequence based on operator selections
  interface ScreenItem {
    id: string;
    type: 'division' | 'live-courts' | 'podium';
    title: string;
    subtitle: string;
    divisionData?: DivisionBracketData;
    stageType?: 'pools' | 'playoffs' | 'concluded';
  }

  const screens: ScreenItem[] = useMemo(() => {
    const list: ScreenItem[] = [];
    if (includeLiveCourts) {
      list.push({
        id: 'screen-live-courts',
        type: 'live-courts',
        title: 'Live Stadium Courts',
        subtitle: `${courts.filter((c) => c.status === 'live').length} Active Matches · ${courts.length} Total Courts`,
      });
    }

    divisionList
      .filter((d) => selectedDivisionIds.includes(d.divisionId))
      .forEach((d) => {
        const isConcluded = d.stage === 'concluded' || !!d.podium;
        const hasBracket = d.playoffs.semis.length > 0 || d.playoffs.quarters.length > 0;
        const hasPools = d.pools && d.pools.length > 0;

        if (isConcluded) {
          list.push({
            id: `${d.divisionId}-podium`,
            type: 'podium',
            title: d.divisionName,
            subtitle: 'Official Podium · Medal Ceremony Completed',
            divisionData: d,
            stageType: 'concluded',
          });
        } else {
          // If division has round-robin pools, add dedicated Pools screen
          if (hasPools) {
            list.push({
              id: `${d.divisionId}-pools`,
              type: 'division',
              title: `${d.divisionName}`,
              subtitle: 'Round-Robin Pool Play Standings · Top 2 Advance to Semis',
              divisionData: d,
              stageType: 'pools',
            });
          }
          // If division has playoff matches, add dedicated Playoffs screen
          if (hasBracket) {
            list.push({
              id: `${d.divisionId}-playoffs`,
              type: 'division',
              title: `${d.divisionName}`,
              subtitle: 'Playoff Progression & Medal Matches',
              divisionData: d,
              stageType: 'playoffs',
            });
          }
          // Fallback if neither pools nor playoffs are populated yet
          if (!hasPools && !hasBracket) {
            list.push({
              id: d.divisionId,
              type: 'division',
              title: d.divisionName,
              subtitle: 'Division Schedule & Match Desk',
              divisionData: d,
              stageType: 'pools',
            });
          }
        }
      });

    return list;
  }, [includeLiveCourts, courts, divisionList, selectedDivisionIds]);

  const safePageIndex = screens.length > 0 ? (((pageIndex % screens.length) + screens.length) % screens.length) : 0;
  const currentScreen = screens[safePageIndex] || null;
  const nextScreen = screens.length > 1 ? screens[(safePageIndex + 1) % screens.length] : null;

  // Support initialMode (e.g., ?mode=podium, ?stage=podium) to immediately land on the requested stage
  useEffect(() => {
    if (!initialMode || screens.length === 0) return;
    const mode = initialMode.toLowerCase();
    if (mode === 'podium' || mode === 'champions') {
      const idx = screens.findIndex((s) => s.type === 'podium');
      if (idx >= 0) {
        setPageIndex(idx);
        setSecondsRemaining(dwellSecs);
      }
    } else if (mode === 'bracket' || mode === 'playoffs') {
      const idx = screens.findIndex((s) => s.stageType === 'playoffs');
      if (idx >= 0) {
        setPageIndex(idx);
        setSecondsRemaining(dwellSecs);
      }
    } else if (mode === 'pools' || mode === 'roundrobin') {
      const idx = screens.findIndex((s) => s.stageType === 'pools');
      if (idx >= 0) {
        setPageIndex(idx);
        setSecondsRemaining(dwellSecs);
      }
    } else if (mode === 'courts' || mode === 'jumbotron') {
      const idx = screens.findIndex((s) => s.type === 'live-courts');
      if (idx >= 0) {
        setPageIndex(idx);
        setSecondsRemaining(dwellSecs);
      }
    }
  }, [initialMode, screens, dwellSecs]);

  // Single long-lived timer for automatic division rotation
  useEffect(() => {
    if (!rotate || screens.length <= 1) return;
    const tick = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setPageIndex((p) => p + 1);
          setPoolHalfIndex(0);
          setPoolHalfRemaining(poolFlipSecs);
          return dwellSecs;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [rotate, screens.length, dwellSecs, poolFlipSecs]);

  // Sub-timer for large pool divisions (split pagination)
  const currentPools = currentScreen?.divisionData?.pools || [];
  const isPoolSplit = currentPools.length > poolsPerView && poolsPerView > 0;
  const displayedPools = isPoolSplit
    ? poolHalfIndex === 0
      ? currentPools.slice(0, poolsPerView)
      : currentPools.slice(poolsPerView)
    : currentPools;

  useEffect(() => {
    if (!rotate || !isPoolSplit) return;
    const tick = setInterval(() => {
      setPoolHalfRemaining((prev) => {
        if (prev <= 1) {
          setPoolHalfIndex((h) => (h === 0 ? 1 : 0));
          return poolFlipSecs;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [rotate, isPoolSplit, poolFlipSecs]);

  // Reset timers on manual step or jump
  const jumpToScreen = (targetId: string) => {
    const idx = screens.findIndex(
      (s) =>
        s.id === targetId ||
        s.id === `${targetId}-pools` ||
        s.id === `${targetId}-playoffs` ||
        s.id === `${targetId}-podium` ||
        s.divisionData?.divisionId === targetId
    );
    if (idx >= 0) {
      setPageIndex(idx);
      setSecondsRemaining(dwellSecs);
      setPoolHalfIndex(0);
      setPoolHalfRemaining(poolFlipSecs);
    }
  };

  const stepScreen = (delta: number) => {
    if (screens.length <= 1) return;
    setPageIndex((prev) => prev + delta);
    setSecondsRemaining(dwellSecs);
    setPoolHalfIndex(0);
    setPoolHalfRemaining(poolFlipSecs);
  };

  // Keyboard Shortcuts (F: Fullscreen, Space: Pause/Resume, C: Controls, Arrows: Step)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'f' || e.key === 'F') {
        handleToggleFullscreen();
      } else if (e.key === 'c' || e.key === 'C') {
        setPanelOpen((v) => !v);
      } else if (e.key === ' ') {
        e.preventDefault();
        setRotate((r) => !r);
      } else if (e.key === 'ArrowRight') {
        stepScreen(1);
      } else if (e.key === 'ArrowLeft') {
        stepScreen(-1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screens.length, dwellSecs, poolFlipSecs]);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleCopyShareLink = () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/tv` : 'https://dinkster.app/tv';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  // Cross-reference live active court by team name
  const findLiveCourtForTeam = (teamName: string): number | null => {
    if (!teamName) return null;
    const cleanTeam = teamName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const members = teamName.toLowerCase().split(/[&/]/).map((m) => m.trim().replace(/[^a-z0-9]/g, ''));

    for (const c of courts) {
      if (c.status === 'live' && c.matchTitle) {
        const cleanMatch = c.matchTitle.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (cleanMatch.includes(cleanTeam)) return c.number;
        if (members.length > 0 && members.every((m) => m.length > 1 && cleanMatch.includes(m))) {
          return c.number;
        }
      }
    }
    return null;
  };

  const scheduledMatches = matches.filter((m) => m.status === 'SCHEDULED' || m.status === 'PENDING');
  const activeMatchesCount = courts.filter((c) => c.status === 'live').length;

  // Background Theme Styles
  const themeBgClass =
    themeMode === 'green'
      ? 'bg-[#07241A] text-white'
      : themeMode === 'light'
      ? 'bg-slate-100 text-slate-900'
      : 'bg-slate-950 text-white';

  const themeHeaderClass =
    themeMode === 'green'
      ? 'bg-[#051C14]/95 border-[#0A5C43]/40'
      : themeMode === 'light'
      ? 'bg-white/95 border-slate-300 text-slate-900 shadow-sm'
      : 'bg-slate-900/95 border-slate-800 text-white';

  const themeCardBg =
    themeMode === 'green'
      ? 'bg-[#0A2E22]/90 border-[#0A5C43]/50'
      : themeMode === 'light'
      ? 'bg-white border-slate-200 text-slate-900 shadow-md'
      : 'bg-slate-900/90 border-slate-800 text-white';

  // Progress Bar percentage (smooth elapsed filling)
  const barProgressPercent = isPoolSplit
    ? Math.round(((poolFlipSecs - poolHalfRemaining) / poolFlipSecs) * 100)
    : Math.round(((dwellSecs - secondsRemaining) / dwellSecs) * 100);

  return (
    <div className={`min-h-screen ${themeBgClass} font-sans flex flex-col select-none relative overflow-x-hidden`}>
      {/* ========================================================
          SLIDE-DOWN OPERATOR ADMIN CONTROL PANEL
          ======================================================== */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out transform ${
          panelOpen ? 'translate-y-0 opacity-100 shadow-2xl' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
        onClick={scheduleAutoClose}
        onInput={scheduleAutoClose}
      >
        <div className="bg-slate-900 border-b-2 border-emerald-500 text-white p-5 shadow-2xl backdrop-blur-md">
          {/* Row 1: Divisions Multiselect Filter & Instant Jump */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase text-amber-400 tracking-wider mr-2 flex items-center gap-1.5">
                <Trophy size={14} className="text-amber-400" />
                Screens:
              </span>

              {/* Quick Select Buttons */}
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl mr-2">
                <button
                  type="button"
                  onClick={() => setSelectedDivisionIds(allDivisionIds)}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-700 hover:bg-slate-600 text-white"
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDivisionIds([])}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-700 hover:bg-slate-600 text-white"
                >
                  None
                </button>
              </div>

              {/* Live Courts Screen Chip */}
              <div
                className={`flex items-center rounded-xl border text-xs font-bold transition overflow-hidden ${
                  includeLiveCourts
                    ? currentScreen?.type === 'live-courts'
                      ? 'border-amber-400 bg-amber-400/20 text-white ring-1 ring-amber-400'
                      : 'border-emerald-500/60 bg-emerald-950/40 text-emerald-300'
                    : 'border-slate-800 bg-slate-800/40 text-slate-500'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setIncludeLiveCourts((prev) => !prev)}
                  className="px-2.5 py-1.5 hover:bg-white/10 border-r border-slate-700 flex items-center justify-center"
                  title={includeLiveCourts ? 'Exclude from rotation' : 'Include in rotation'}
                >
                  {includeLiveCourts ? <Check size={12} className="text-emerald-400 font-black" /> : <span className="w-3 h-3 border border-slate-600 rounded" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIncludeLiveCourts(true);
                    jumpToScreen('screen-live-courts');
                  }}
                  className="px-3 py-1.5 hover:bg-white/10 flex items-center gap-1.5"
                  title="Jump to Live Courts now"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Courts
                </button>
              </div>

              {/* Division Chips */}
              {divisionList.map((d) => {
                const isSelected = selectedDivisionIds.includes(d.divisionId);
                const isCurrent = currentScreen?.id === d.divisionId;

                return (
                  <div
                    key={d.divisionId}
                    className={`flex items-center rounded-xl border text-xs font-bold transition overflow-hidden ${
                      isSelected
                        ? isCurrent
                          ? 'border-amber-400 bg-amber-400/20 text-white ring-1 ring-amber-400'
                          : 'border-slate-700 bg-slate-800 text-slate-200'
                        : 'border-slate-800 bg-slate-900/60 text-slate-500'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedDivisionIds((prev) =>
                          prev.includes(d.divisionId) ? prev.filter((id) => id !== d.divisionId) : [...prev, d.divisionId]
                        )
                      }
                      className="px-2.5 py-1.5 hover:bg-white/10 border-r border-slate-700 flex items-center justify-center"
                      title={isSelected ? 'Exclude from rotation' : 'Include in rotation'}
                    >
                      {isSelected ? <Check size={12} className="text-amber-400 font-black" /> : <span className="w-3 h-3 border border-slate-600 rounded" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!isSelected) {
                          setSelectedDivisionIds((prev) => [...prev, d.divisionId]);
                        }
                        jumpToScreen(d.divisionId);
                      }}
                      className="px-3 py-1.5 hover:bg-white/10 truncate max-w-[200px]"
                      title="Jump to this division now"
                    >
                      {d.divisionName}
                    </button>
                  </div>
                );
              })}

              {/* Quick Stage Jump Buttons */}
              <div className="flex items-center gap-1.5 pl-3 border-l border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider mr-1">Stage:</span>
                {divisionList.some((d) => d.stage === 'concluded' || d.podium) && (
                  <button
                    type="button"
                    onClick={() => {
                      const idx = screens.findIndex((s) => s.type === 'podium');
                      if (idx >= 0) {
                        setPageIndex(idx);
                        setSecondsRemaining(dwellSecs);
                      } else {
                        const div = divisionList.find((d) => d.stage === 'concluded' || d.podium);
                        if (div) {
                          setSelectedDivisionIds((prev) => (prev.includes(div.divisionId) ? prev : [...prev, div.divisionId]));
                          jumpToScreen(`${div.divisionId}-podium`);
                        }
                      }
                    }}
                    className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg flex items-center gap-1 transition ${
                      currentScreen?.type === 'podium'
                        ? 'bg-amber-400 text-black shadow-sm font-black'
                        : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                    }`}
                    title="Jump to 3D Olympic Medal Podium"
                  >
                    <span>🥇 Podium</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const idx = screens.findIndex((s) => s.stageType === 'playoffs');
                    if (idx >= 0) {
                      setPageIndex(idx);
                      setSecondsRemaining(dwellSecs);
                    } else {
                      const div = divisionList.find((d) => (d.playoffs.semis.length > 0 || d.playoffs.quarters.length > 0) && d.stage !== 'concluded' && !d.podium);
                      if (div) {
                        setSelectedDivisionIds((prev) => (prev.includes(div.divisionId) ? prev : [...prev, div.divisionId]));
                        jumpToScreen(`${div.divisionId}-playoffs`);
                      }
                    }
                  }}
                  className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg flex items-center gap-1 transition ${
                    currentScreen?.stageType === 'playoffs'
                      ? 'bg-blue-400 text-black shadow-sm font-black'
                      : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40'
                  }`}
                  title="Jump to Playoff Bracket"
                >
                  <span>🏆 Playoffs</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const idx = screens.findIndex((s) => s.stageType === 'pools');
                    if (idx >= 0) {
                      setPageIndex(idx);
                      setSecondsRemaining(dwellSecs);
                      setPoolHalfIndex(0);
                    } else {
                      const div = divisionList.find((d) => d.pools.length > 0 && d.stage !== 'concluded' && !d.podium);
                      if (div) {
                        setSelectedDivisionIds((prev) => (prev.includes(div.divisionId) ? prev : [...prev, div.divisionId]));
                        jumpToScreen(`${div.divisionId}-pools`);
                      }
                    }
                  }}
                  className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg flex items-center gap-1 transition ${
                    currentScreen?.stageType === 'pools'
                      ? 'bg-emerald-400 text-black shadow-sm font-black'
                      : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                  }`}
                  title="Jump to Active Pools"
                >
                  <span>📊 Pools</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIncludeLiveCourts(true);
                    const idx = screens.findIndex((s) => s.type === 'live-courts');
                    if (idx >= 0) {
                      setPageIndex(idx);
                      setSecondsRemaining(dwellSecs);
                    } else {
                      jumpToScreen('screen-live-courts');
                    }
                  }}
                  className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg flex items-center gap-1 transition ${
                    currentScreen?.type === 'live-courts'
                      ? 'bg-purple-400 text-black shadow-sm font-black'
                      : 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40'
                  }`}
                  title="Jump to Live Courts"
                >
                  <span>🏟️ Courts</span>
                </button>
              </div>
            </div>

            {/* Collapse toggle button for advanced row */}
            <button
              type="button"
              onClick={() => setExtraSettingsCollapsed((prev) => !prev)}
              className="text-slate-400 hover:text-white text-xs font-bold flex items-center gap-1 shrink-0 px-2 py-1 bg-slate-800 rounded-lg"
            >
              {extraSettingsCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              <span>{extraSettingsCollapsed ? 'More Controls' : 'Hide Controls'}</span>
            </button>
          </div>

          {/* Row 2: Advanced Operator Overrides & Timing Settings */}
          {!extraSettingsCollapsed && (
            <div className="pt-4 flex flex-wrap items-center justify-between gap-6 text-xs font-semibold">
              {/* Rotation & Dwell Time Input */}
              <div className="flex items-center gap-3 bg-slate-800/80 p-2 rounded-xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => setRotate((r) => !r)}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
                    rotate ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400'
                  }`}
                  title="Spacebar toggles rotation"
                >
                  <RotateCw size={13} className={rotate ? 'animate-spin-slow' : ''} />
                  <span>{rotate ? 'Auto-Rotate ON' : 'Paused'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 text-[11px] uppercase font-bold">Switch every</span>
                  <input
                    type="number"
                    min={3}
                    max={300}
                    value={dwellDraft}
                    onChange={(e) => {
                      setDwellDraft(e.target.value);
                      const n = parseInt(e.target.value, 10);
                      if (!isNaN(n) && n >= 3) {
                        setDwellSecs(n);
                        setSecondsRemaining(n);
                      }
                    }}
                    className="w-14 text-center font-mono font-bold bg-slate-900 border border-slate-700 rounded-lg py-1 text-emerald-400 focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-slate-400">sec</span>
                </div>

                {/* Step Buttons */}
                <div className="flex items-center gap-1 border-l border-slate-700 pl-2">
                  <button
                    type="button"
                    onClick={() => stepScreen(-1)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-700 hover:bg-slate-600 text-white"
                    title="Previous screen (Left Arrow)"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => stepScreen(1)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-700 hover:bg-slate-600 text-white"
                    title="Next screen (Right Arrow)"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* Pool Pagination Controls */}
              <div className="flex items-center gap-3 bg-slate-800/80 p-2 rounded-xl border border-slate-700">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 text-[11px] uppercase font-bold">Split above</span>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={poolsPerViewDraft}
                    onChange={(e) => {
                      setPoolsPerViewDraft(e.target.value);
                      const n = parseInt(e.target.value, 10);
                      if (!isNaN(n) && n >= 1) setPoolsPerView(n);
                    }}
                    className="w-12 text-center font-mono font-bold bg-slate-900 border border-slate-700 rounded-lg py-1 text-emerald-400 focus:outline-none"
                  />
                  <span className="text-slate-400">pools/view</span>
                </div>

                <div className="flex items-center gap-1.5 border-l border-slate-700 pl-3">
                  <span className="text-slate-400 text-[11px] uppercase font-bold">Flip pool half</span>
                  <input
                    type="number"
                    min={3}
                    max={60}
                    value={poolFlipDraft}
                    onChange={(e) => {
                      setPoolFlipDraft(e.target.value);
                      const n = parseInt(e.target.value, 10);
                      if (!isNaN(n) && n >= 3) {
                        setPoolFlipSecs(n);
                        setPoolHalfRemaining(n);
                      }
                    }}
                    className="w-12 text-center font-mono font-bold bg-slate-900 border border-slate-700 rounded-lg py-1 text-emerald-400 focus:outline-none"
                  />
                  <span className="text-slate-400">sec</span>
                </div>
              </div>

              {/* In-App Board Zoom */}
              <div className="flex items-center gap-2 bg-slate-800/80 p-2 rounded-xl border border-slate-700">
                <span className="text-slate-400 text-[11px] uppercase font-bold">Zoom</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(0.7, Math.round((z - 0.1) * 10) / 10))}
                  className="w-6 h-6 flex items-center justify-center rounded bg-slate-700 hover:bg-slate-600 font-bold"
                >
                  -
                </button>
                <span className="font-mono text-emerald-400 w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(1.5, Math.round((z + 0.1) * 10) / 10))}
                  className="w-6 h-6 flex items-center justify-center rounded bg-slate-700 hover:bg-slate-600 font-bold"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel(1.0)}
                  className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-[10px] font-bold"
                >
                  Reset
                </button>
              </div>

              {/* Stadium Theme Switcher */}
              <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
                {(['dark', 'green', 'light'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setThemeMode(t)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition ${
                      themeMode === t ? 'bg-amber-500 text-black shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {t === 'dark' ? 'Dark Stadium' : t === 'green' ? 'Green Court' : 'Clean Light'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          STAGE SWITCHER BAR (EVENT DIRECTOR & VENUE TEST BAR)
          ======================================================== */}
      <div
        className={`px-4 py-2 flex flex-wrap items-center justify-between text-xs shrink-0 z-40 select-none backdrop-blur border-b transition-colors ${
          themeMode === 'light'
            ? 'bg-slate-100/95 border-slate-300 text-slate-800'
            : 'bg-slate-950/95 border-slate-800 text-white'
        }`}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <strong
            className={`text-[11px] uppercase tracking-wider mr-1 ${
              themeMode === 'light' ? 'text-slate-900 font-black' : 'text-white'
            }`}
          >
            Stage Switcher:
          </strong>
          <button
            type="button"
            onClick={() => setRotate((r) => !r)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              rotate
                ? themeMode === 'light'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : themeMode === 'light'
                ? 'bg-red-100 text-red-800 border border-red-300'
                : 'bg-red-500/20 text-red-300 border border-red-500/40'
            }`}
            title="Press Space to Pause or Resume rotation"
          >
            <RotateCw size={12} className={rotate ? 'animate-spin-slow' : ''} />
            <span>{rotate ? 'Auto-Cycling' : 'Paused (Space)'}</span>
          </button>

          {screens.some((s) => s.type === 'podium') && (
            <button
              type="button"
              onClick={() => {
                const idx = screens.findIndex((s) => s.type === 'podium');
                if (idx >= 0) {
                  setPageIndex(idx);
                  setSecondsRemaining(dwellSecs);
                } else {
                  const div = divisionList.find((d) => d.stage === 'concluded' || d.podium);
                  if (div) {
                    setSelectedDivisionIds((prev) => (prev.includes(div.divisionId) ? prev : [...prev, div.divisionId]));
                    jumpToScreen(`${div.divisionId}-podium`);
                  }
                }
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                currentScreen?.type === 'podium'
                  ? 'bg-amber-400 text-black shadow-md font-black'
                  : themeMode === 'light'
                  ? 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              <span>🥇 Jump to Podium / Finals</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              const idx = screens.findIndex((s) => s.stageType === 'playoffs');
              if (idx >= 0) {
                setPageIndex(idx);
                setSecondsRemaining(dwellSecs);
              } else {
                const div = divisionList.find((d) => (d.playoffs.semis.length > 0 || d.playoffs.quarters.length > 0) && d.stage !== 'concluded' && !d.podium);
                if (div) {
                  setSelectedDivisionIds((prev) => (prev.includes(div.divisionId) ? prev : [...prev, div.divisionId]));
                  jumpToScreen(`${div.divisionId}-playoffs`);
                }
              }
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              currentScreen?.stageType === 'playoffs'
                ? themeMode === 'light'
                  ? 'bg-blue-600 text-white shadow-md font-black'
                  : 'bg-blue-400 text-black shadow-[0_0_15px_rgba(96,165,250,0.6)] font-black'
                : themeMode === 'light'
                ? 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            <span>🏆 Jump to Playoff Bracket</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const idx = screens.findIndex((s) => s.stageType === 'pools');
              if (idx >= 0) {
                setPageIndex(idx);
                setSecondsRemaining(dwellSecs);
                setPoolHalfIndex(0);
              } else {
                const div = divisionList.find((d) => d.pools && d.pools.length > 0);
                if (div) {
                  setSelectedDivisionIds((prev) => (prev.includes(div.divisionId) ? prev : [...prev, div.divisionId]));
                  jumpToScreen(`${div.divisionId}-pools`);
                }
              }
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              currentScreen?.stageType === 'pools'
                ? themeMode === 'light'
                  ? 'bg-emerald-600 text-white shadow-md font-black'
                  : 'bg-emerald-400 text-black shadow-[0_0_15px_rgba(52,211,153,0.6)] font-black'
                : themeMode === 'light'
                ? 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            <span>📊 Jump to Active Pools</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIncludeLiveCourts(true);
              const idx = screens.findIndex((s) => s.type === 'live-courts');
              if (idx >= 0) {
                setPageIndex(idx);
                setSecondsRemaining(dwellSecs);
              } else {
                jumpToScreen('screen-live-courts');
              }
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              currentScreen?.type === 'live-courts'
                ? themeMode === 'light'
                  ? 'bg-purple-600 text-white shadow-md font-black'
                  : 'bg-purple-400 text-black shadow-[0_0_15px_rgba(192,132,252,0.6)] font-black'
                : themeMode === 'light'
                ? 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            <span>🏟️ Jump to Courts Live</span>
          </button>
        </div>

        {/* Hotkey Guide */}
        <div
          className={`hidden lg:flex items-center gap-2 text-[11px] font-mono ${
            themeMode === 'light' ? 'text-slate-600' : 'text-slate-400'
          }`}
        >
          <span>
            Press{' '}
            <kbd
              className={`px-1.5 py-0.5 rounded text-[10px] ${
                themeMode === 'light'
                  ? 'bg-white border border-slate-300 text-slate-700 shadow-sm'
                  : 'bg-slate-800 border border-slate-700 text-slate-200'
              }`}
            >
              SPACE
            </kbd>{' '}
            to Pause
          </span>
          <span>&bull;</span>
          <span>
            <kbd
              className={`px-1.5 py-0.5 rounded text-[10px] ${
                themeMode === 'light'
                  ? 'bg-white border border-slate-300 text-slate-700 shadow-sm'
                  : 'bg-slate-800 border border-slate-700 text-slate-200'
              }`}
            >
              &larr;
            </kbd>{' '}
            <kbd
              className={`px-1.5 py-0.5 rounded text-[10px] ${
                themeMode === 'light'
                  ? 'bg-white border border-slate-300 text-slate-700 shadow-sm'
                  : 'bg-slate-800 border border-slate-700 text-slate-200'
              }`}
            >
              &rarr;
            </kbd>{' '}
            Skip
          </span>
          <span>&bull;</span>
          <span>
            <kbd
              className={`px-1.5 py-0.5 rounded text-[10px] ${
                themeMode === 'light'
                  ? 'bg-white border border-slate-300 text-slate-700 shadow-sm'
                  : 'bg-slate-800 border border-slate-700 text-slate-200'
              }`}
            >
              C
            </kbd>{' '}
            Settings
          </span>
          <span>&bull;</span>
          <span>
            <kbd
              className={`px-1.5 py-0.5 rounded text-[10px] ${
                themeMode === 'light'
                  ? 'bg-white border border-slate-300 text-slate-700 shadow-sm'
                  : 'bg-slate-800 border border-slate-700 text-slate-200'
              }`}
            >
              F
            </kbd>{' '}
            Fullscreen
          </span>
        </div>
      </div>

      {/* ========================================================
          ROCK-SOLID BROADCAST STADIUM HEADER (NEVER SHIFTS)
          ======================================================== */}
      <header className={`${themeHeaderClass} px-6 py-3 flex items-center justify-between backdrop-blur sticky top-0 z-40 border-b transition-colors`}>
        {/* Left: Tournament Branding */}
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              themeMode === 'light'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm'
                : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
            }`}
          >
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-lg font-black tracking-tight uppercase ${
                  themeMode === 'light' ? 'text-slate-950' : 'text-white'
                }`}
              >
                {tournamentName}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold ${
                  themeMode === 'light'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full animate-pulse ${
                    themeMode === 'light' ? 'bg-emerald-600' : 'bg-emerald-400'
                  }`}
                />
                LIVE BROADCAST
              </span>
            </div>
            <p
              className={`text-xs font-medium ${
                themeMode === 'light' ? 'text-slate-600' : 'opacity-70 text-slate-300'
              }`}
            >
              {venueName} &bull; {activeMatchesCount} Courts Active
            </p>
          </div>
        </div>

        {/* Right: Permanent Action Controls (Rock Solid) */}
        <div className="flex items-center gap-3">
          {/* Status Indicator Pill */}
          <span
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border transition-colors ${
              themeMode === 'light'
                ? 'bg-slate-100 text-slate-800 border-slate-300 shadow-sm'
                : 'bg-white/10 text-white border-white/10'
            }`}
          >
            {currentScreen?.type === 'podium' ? (
              <span className={`flex items-center gap-1.5 ${themeMode === 'light' ? 'text-amber-800 font-black' : 'text-amber-300'}`}>
                <Trophy size={14} className={themeMode === 'light' ? 'text-amber-600' : 'text-amber-400'} />
                Medal Ceremony
              </span>
            ) : currentScreen?.type === 'live-courts' ? (
              <span className={`flex items-center gap-1.5 ${themeMode === 'light' ? 'text-emerald-800 font-black' : 'text-emerald-400'}`}>
                <span className={`w-2 h-2 rounded-full animate-pulse ${themeMode === 'light' ? 'bg-emerald-600' : 'bg-emerald-400'}`} />
                Court Scoreboard
              </span>
            ) : currentScreen?.stageType === 'playoffs' ? (
              <span className={`flex items-center gap-1.5 ${themeMode === 'light' ? 'text-blue-800 font-black' : 'text-blue-400'}`}>
                <span className={`w-2 h-2 rounded-full ${themeMode === 'light' ? 'bg-blue-600' : 'bg-blue-400'}`} />
                Playoffs & Medals
              </span>
            ) : (
              <span className={`flex items-center gap-1.5 ${themeMode === 'light' ? 'text-emerald-800 font-black' : 'text-emerald-400'}`}>
                <span className={`w-2 h-2 rounded-full ${themeMode === 'light' ? 'bg-emerald-600' : 'bg-emerald-400'}`} />
                Pool Play Standings
              </span>
            )}
          </span>

          {/* Fullscreen Button */}
          <button
            onClick={handleToggleFullscreen}
            className={`p-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center shadow-sm ${
              themeMode === 'light'
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title="Toggle Fullscreen (F)"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          {/* Settings Drawer Button */}
          <button
            onClick={() => {
              setPanelOpen((v) => !v);
              if (!panelOpen) scheduleAutoClose();
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow ${
              panelOpen
                ? 'bg-amber-500 text-black font-extrabold'
                : themeMode === 'light'
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
            title="Open Admin Controls (Hotkey: C)"
          >
            <Settings size={15} />
            <span>Settings</span>
          </button>

          {/* Share Link */}
          <button
            onClick={handleCopyShareLink}
            className={`p-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center ${
              themeMode === 'light'
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title="Copy Public TV URL"
          >
            <Share2 size={16} />
          </button>

          {/* Stadium Wall Clock */}
          <div
            className={`flex items-center gap-2 pl-2 font-mono text-sm font-bold border-l ${
              themeMode === 'light'
                ? 'border-slate-300 text-slate-800'
                : 'border-white/15 text-white opacity-90'
            }`}
          >
            <Clock size={16} className={themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'} />
            <span>{currentTime}</span>
          </div>

          {onExitTvMode && (
            <button
              onClick={onExitTvMode}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                themeMode === 'light'
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  : 'opacity-70 hover:opacity-100 hover:bg-white/10'
              }`}
            >
              Exit
            </button>
          )}
        </div>
      </header>

      {/* ========================================================
          ELAPSED COUNTDOWN GLIDE BAR (0% -> 100%)
          ======================================================== */}
      {rotate && screens.length > 1 && (
        <div
          className={`w-full h-1 overflow-hidden relative border-b ${
            themeMode === 'light' ? 'bg-slate-200 border-slate-300' : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-amber-500 transition-all duration-1000 ease-linear"
            style={{ width: `${barProgressPercent}%` }}
          />
        </div>
      )}

      {/* ========================================================
          MAIN STAGE AREA
          ======================================================== */}
      <main className="flex-1 p-6 overflow-y-auto relative" style={{ zoom: zoomLevel }}>
        {/* Edge Stepper Navigation Arrows */}
        {screens.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => stepScreen(-1)}
              className="fixed left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur z-30 transition opacity-30 hover:opacity-100"
              title="Previous screen (Left Arrow)"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => stepScreen(1)}
              className="fixed right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur z-30 transition opacity-30 hover:opacity-100"
              title="Next screen (Right Arrow)"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Current Screen Header Title Strip */}
        <div
          className={`max-w-[1500px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-6 border-b transition-colors ${
            themeMode === 'light' ? 'border-slate-300' : 'border-white/10'
          }`}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                  currentScreen?.type === 'podium'
                    ? 'bg-amber-400 text-black shadow-sm'
                    : currentScreen?.type === 'live-courts'
                    ? themeMode === 'light'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-400 text-black'
                    : currentScreen?.stageType === 'playoffs'
                    ? themeMode === 'light'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-400 text-black'
                    : themeMode === 'light'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-amber-400 text-black'
                }`}
              >
                {currentScreen?.type === 'podium'
                  ? '🥇 Medal Ceremony'
                  : currentScreen?.type === 'live-courts'
                  ? 'Active Action'
                  : currentScreen?.stageType === 'playoffs'
                  ? 'Playoff Bracket'
                  : 'Pool Standings'}
              </span>
              <span
                className={`text-xs font-semibold ${
                  themeMode === 'light' ? 'text-slate-600 font-bold' : 'opacity-75 text-slate-300'
                }`}
              >
                {currentScreen?.subtitle}
                {isPoolSplit ? ` · Pools Part ${poolHalfIndex + 1}/2` : ''}
              </span>
            </div>
            <h1
              className={`font-display font-black text-3xl md:text-4xl tracking-tight ${
                themeMode === 'light' ? 'text-slate-950' : 'text-white'
              }`}
            >
              {currentScreen?.title}
            </h1>
          </div>

          {/* Rotation Position & Next Indicator */}
          <div className="flex items-center gap-3">
            {rotate && nextScreen && (
              <span
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                  themeMode === 'light'
                    ? 'bg-white text-slate-800 border-slate-300 shadow-sm'
                    : 'bg-white/10 text-white border-white/10'
                }`}
              >
                Next:{' '}
                <strong className={themeMode === 'light' ? 'text-amber-800 font-black' : 'text-amber-400'}>
                  {nextScreen.title}
                </strong>{' '}
                in {isPoolSplit ? poolHalfRemaining : secondsRemaining}s
              </span>
            )}
            <span
              className={`font-mono text-xs font-black px-3 py-1.5 rounded-xl border transition-colors ${
                themeMode === 'light'
                  ? 'bg-white text-slate-800 border-slate-300 shadow-sm'
                  : 'bg-white/10 text-white border-white/10'
              }`}
            >
              {safePageIndex + 1} / {screens.length}
            </span>
          </div>
        </div>

        {/* Screen Rendering */}
        <div className="max-w-[1500px] mx-auto">
          {screens.length === 0 ? (
            <div className="py-24 text-center">
              <h3 className={`text-2xl font-bold ${themeMode === 'light' ? 'text-slate-700' : 'opacity-60 text-white'}`}>
                No screens currently selected in rotation.
              </h3>
              <p className={`text-sm mt-2 ${themeMode === 'light' ? 'text-slate-500' : 'opacity-40 text-slate-400'}`}>
                Click Settings above and select at least one division or Live Courts.
              </p>
            </div>
          ) : currentScreen?.type === 'podium' && currentScreen.divisionData?.podium ? (
            /* ====================================================
               SCREEN TYPE C: 3D OLYMPIC MEDAL PODIUM
               ==================================================== */
            <TvOlympicPodium
              podium={currentScreen.divisionData.podium}
              divisionName={currentScreen.title}
              subtitle={currentScreen.subtitle}
              themeMode={themeMode}
            />
          ) : currentScreen?.type === 'live-courts' ? (
            /* ====================================================
               SCREEN TYPE A: LIVE STADIUM COURTS GRID
               ==================================================== */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {courts.map((court) => {
                const sponsor = sponsors.find((s) => s.courtAssigned === court.number);
                const isLive = court.status === 'live';
                const isCalled = court.status === 'called';
                const isBlocked = court.status === 'blocked';
                const score = court.score || [0, 0];

                let teamA = 'Team A';
                let teamB = 'Team B';
                if (court.matchTitle && court.matchTitle.includes(' vs ')) {
                  const parts = court.matchTitle.split(' vs ');
                  teamA = parts[0];
                  teamB = parts[1];
                }

                return (
                  <div
                    key={court.number}
                    className={`rounded-3xl border-2 flex flex-col justify-between overflow-hidden transition-all shadow-xl ${themeCardBg} ${
                      isLive
                        ? themeMode === 'light'
                          ? 'border-emerald-500 shadow-emerald-900/10 ring-1 ring-emerald-500/30'
                          : 'border-emerald-500 shadow-emerald-950/40 ring-1 ring-emerald-500/30'
                        : isCalled
                        ? themeMode === 'light'
                          ? 'border-amber-500 shadow-amber-900/10'
                          : 'border-amber-500 shadow-amber-950/30'
                        : isBlocked
                        ? 'border-red-500/80'
                        : themeMode === 'light'
                        ? 'border-slate-300'
                        : 'border-slate-800'
                    }`}
                  >
                    <div
                      className={`px-4 py-2.5 flex items-center justify-between border-b ${
                        isLive
                          ? themeMode === 'light'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-black'
                            : 'bg-emerald-950/60 border-emerald-800/40 text-emerald-300'
                          : isCalled
                          ? themeMode === 'light'
                            ? 'bg-amber-50 border-amber-200 text-amber-900 font-black'
                            : 'bg-amber-950/60 border-amber-800/40 text-amber-300'
                          : isBlocked
                          ? themeMode === 'light'
                            ? 'bg-red-50 border-red-200 text-red-900 font-black'
                            : 'bg-red-950/60 border-red-800/40 text-red-300'
                          : themeMode === 'light'
                          ? 'bg-slate-100 border-slate-200 text-slate-700 font-bold'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm tracking-wide uppercase">Court {court.number}</span>
                        {sponsor && (
                          <span
                            className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                              themeMode === 'light'
                                ? 'bg-slate-200 text-slate-800 border border-slate-300'
                                : 'bg-white/10 text-white/90'
                            }`}
                          >
                            {sponsor.name}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          isLive
                            ? themeMode === 'light'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-black'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : isCalled
                            ? themeMode === 'light'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300 font-black'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : isBlocked
                            ? themeMode === 'light'
                              ? 'bg-red-100 text-red-900 border border-red-300 font-black'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : themeMode === 'light'
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-slate-700/40 text-slate-400'
                        }`}
                      >
                        {isLive && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                              themeMode === 'light' ? 'bg-emerald-600' : 'bg-emerald-400'
                            }`}
                          />
                        )}
                        {court.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      {court.matchTitle ? (
                        <div>
                          <div
                            className={`text-[11px] font-bold uppercase tracking-wider mb-3 ${
                              themeMode === 'light' ? 'text-slate-500 font-extrabold' : 'opacity-60'
                            }`}
                          >
                            Match {court.matchId || 'Live'} &bull; Active Rally
                          </div>

                          <div
                            className={`flex items-center justify-between py-2 border-b ${
                              themeMode === 'light' ? 'border-slate-200' : 'border-white/10'
                            }`}
                          >
                            <div className="flex items-center gap-2 flex-1 pr-2">
                              {isLive && score[0] >= score[1] && (
                                <span
                                  className={`w-2.5 h-2.5 rounded-full ${
                                    themeMode === 'light'
                                      ? 'bg-emerald-600 shadow-[0_0_8px_#059669]'
                                      : 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                                  }`}
                                  title="Serving"
                                />
                              )}
                              <span
                                className={`font-extrabold text-base tracking-tight truncate ${
                                  themeMode === 'light' ? 'text-slate-950 font-black' : 'text-white'
                                }`}
                              >
                                {teamA}
                              </span>
                            </div>
                            <span
                              className={`text-3xl font-black font-mono tracking-tighter ${
                                themeMode === 'light' ? 'text-emerald-700' : 'text-emerald-400'
                              }`}
                            >
                              {score[0]}
                            </span>
                          </div>

                          <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-2 flex-1 pr-2">
                              {isLive && score[1] > score[0] && (
                                <span
                                  className={`w-2.5 h-2.5 rounded-full ${
                                    themeMode === 'light'
                                      ? 'bg-emerald-600 shadow-[0_0_8px_#059669]'
                                      : 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                                  }`}
                                  title="Serving"
                                />
                              )}
                              <span
                                className={`font-extrabold text-base tracking-tight truncate ${
                                  themeMode === 'light' ? 'text-slate-950 font-black' : 'text-white'
                                }`}
                              >
                                {teamB}
                              </span>
                            </div>
                            <span
                              className={`text-3xl font-black font-mono tracking-tighter ${
                                themeMode === 'light' ? 'text-emerald-700' : 'text-emerald-400'
                              }`}
                            >
                              {score[1]}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="py-8 text-center flex flex-col items-center justify-center">
                          <span
                            className={`text-sm font-semibold ${
                              themeMode === 'light' ? 'text-slate-600 font-bold' : 'opacity-60'
                            }`}
                          >
                            Court Open
                          </span>
                          <span
                            className={`text-xs mt-1 ${
                              themeMode === 'light' ? 'text-slate-400 font-medium' : 'opacity-40'
                            }`}
                          >
                            Ready for next assignment
                          </span>
                        </div>
                      )}

                      <div
                        className={`mt-3 pt-2.5 border-t flex items-center justify-between text-[11px] ${
                          themeMode === 'light' ? 'border-slate-200 text-slate-600 font-medium' : 'border-white/10 opacity-70'
                        }`}
                      >
                        <span>
                          Ref: <strong className={themeMode === 'light' ? 'text-slate-800' : 'text-white'}>{court.referee || 'Desk Call'}</strong>
                        </span>
                        {court.sinceTime && <span className="font-mono">Since {court.sinceTime}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : currentScreen?.stageType === 'pools' && currentScreen.divisionData?.pools ? (
            /* ====================================================
               SCREEN TYPE B1: DEDICATED ROUND-ROBIN POOL PLAY STANDINGS
               ==================================================== */
            <div className="space-y-6">
              <div
                className={`flex items-center justify-between pb-3 border-b ${
                  themeMode === 'light' ? 'border-slate-300' : 'border-white/10'
                }`}
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className={`w-3 h-3 rounded-full animate-pulse ${
                      themeMode === 'light' ? 'bg-emerald-600' : 'bg-emerald-400'
                    }`}
                  />
                  <h2
                    className={`text-base md:text-lg font-black uppercase tracking-wider ${
                      themeMode === 'light' ? 'text-slate-900' : 'text-emerald-400'
                    }`}
                  >
                    Stage 1: Round-Robin Pool Play Standings
                  </h2>
                  <span
                    className={`text-xs font-black px-3 py-1 rounded-full ${
                      themeMode === 'light'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    Top 2 Advance to Medal Semis
                  </span>
                </div>
                <div
                  className={`text-xs font-semibold ${
                    themeMode === 'light' ? 'text-slate-600' : 'opacity-70 text-slate-400'
                  }`}
                >
                  {currentScreen.divisionData.pools.length} Pools &bull; Live Progression
                </div>
              </div>

              {/* Multi-Pool Responsive Grid */}
              <div
                className={`grid grid-cols-1 ${
                  displayedPools.length > 1 ? 'lg:grid-cols-2' : 'max-w-4xl mx-auto'
                } gap-6 items-start`}
              >
                {displayedPools.map((pool) => (
                  <div
                    key={pool.name}
                    className={`rounded-3xl border overflow-hidden shadow-xl transition-all ${themeCardBg} ${
                      themeMode === 'light' ? 'border-slate-300' : 'border-slate-800'
                    }`}
                  >
                    <div
                      className={`px-5 py-3.5 flex items-center justify-between border-b ${
                        themeMode === 'light'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                          : 'bg-emerald-950/40 border-white/10 text-emerald-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-black text-sm uppercase tracking-wider">{pool.name} Standings</span>
                      </div>
                      <span
                        className={`text-xs font-bold ${
                          themeMode === 'light' ? 'text-slate-600' : 'opacity-70 text-slate-300'
                        }`}
                      >
                        {pool.teams.length} Teams &bull; Advance Top 2
                      </span>
                    </div>

                    <table className="w-full text-xs text-left">
                      <thead
                        className={`font-black border-b ${
                          themeMode === 'light'
                            ? 'bg-slate-100 text-slate-700 border-slate-200 uppercase tracking-wider text-[11px]'
                            : 'bg-black/20 text-slate-200 opacity-80 border-white/10'
                        }`}
                      >
                        <tr>
                          <th className="py-2.5 px-4">#</th>
                          <th className="py-2.5 px-4">Team</th>
                          <th className="py-2.5 px-3 text-center">W-L</th>
                          <th className="py-2.5 px-3 text-center">+/-</th>
                          <th className="py-2.5 px-4 text-right">Advancement</th>
                        </tr>
                      </thead>
                      <tbody
                        className={`divide-y font-medium ${
                          themeMode === 'light' ? 'divide-slate-200 text-slate-900' : 'divide-white/5'
                        }`}
                      >
                        {pool.teams.map((t, idx) => {
                          const liveCourtNum = findLiveCourtForTeam(t.name);
                          const isLastQualifier = t.qualified && (!pool.teams[idx + 1] || !pool.teams[idx + 1].qualified);

                          return (
                            <React.Fragment key={t.id}>
                              <tr
                                className={`transition-colors ${
                                  t.qualified
                                    ? themeMode === 'light'
                                      ? 'bg-emerald-50/70 font-bold text-slate-950'
                                      : 'bg-emerald-950/20 font-bold text-white'
                                    : themeMode === 'light'
                                    ? 'text-slate-700 hover:bg-slate-50'
                                    : 'opacity-60 text-slate-300'
                                }`}
                              >
                                <td className="py-3 px-4 font-mono font-black opacity-80">{idx + 1}</td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`text-[10px] font-black px-2 py-0.5 rounded ${
                                        themeMode === 'light'
                                          ? 'bg-slate-100 text-slate-800 border border-slate-300'
                                          : 'bg-white/10 text-white opacity-80'
                                      }`}
                                    >
                                      #{t.seed}
                                    </span>
                                    <span
                                      className={`text-sm truncate max-w-[200px] ${
                                        themeMode === 'light' ? 'text-slate-950 font-black' : 'font-bold'
                                      }`}
                                    >
                                      {t.name}
                                    </span>
                                    {liveCourtNum && (
                                      <span
                                        className={`px-2 py-0.5 rounded-full text-[9px] font-black flex items-center gap-1 shrink-0 animate-pulse ${
                                          themeMode === 'light'
                                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-400'
                                            : 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                                        }`}
                                      >
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        C{liveCourtNum} LIVE
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td
                                  className={`py-3 px-3 text-center font-mono font-bold ${
                                    themeMode === 'light' ? 'text-slate-900' : 'text-white'
                                  }`}
                                >
                                  {t.wins}-{t.losses}
                                </td>
                                <td
                                  className={`py-3 px-3 text-center font-mono font-black ${
                                    themeMode === 'light' ? 'text-emerald-700' : 'text-emerald-400'
                                  }`}
                                >
                                  {t.pointDiff > 0 ? `+${t.pointDiff}` : t.pointDiff}
                                </td>
                                <td className="py-3 px-4 text-right">
                                  {t.qualified ? (
                                    <span
                                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black ${
                                        themeMode === 'light'
                                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                      }`}
                                    >
                                      <CheckCircle2 size={12} className={themeMode === 'light' ? 'text-emerald-700' : 'text-emerald-400'} />
                                      Q{idx + 1} Advancing &rarr;
                                    </span>
                                  ) : (
                                    <span
                                      className={`text-[11px] font-semibold ${
                                        themeMode === 'light' ? 'text-slate-400' : 'opacity-40 text-slate-400'
                                      }`}
                                    >
                                      Eliminated
                                    </span>
                                  )}
                                </td>
                              </tr>
                              {/* Visual Playoff Advancement Cutline */}
                              {isLastQualifier && (
                                <tr key={`${pool.name}-cutline`}>
                                  <td
                                    colSpan={5}
                                    className={`py-1.5 px-4 text-[10px] font-black uppercase tracking-wider ${
                                      themeMode === 'light'
                                        ? 'bg-emerald-100/90 border-y-2 border-emerald-500 text-emerald-950'
                                        : 'bg-emerald-950/60 border-y border-emerald-500/40 text-emerald-400'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        PLAYOFF ADVANCEMENT CUTLINE
                                      </span>
                                      <span
                                        className={`font-black ${
                                          themeMode === 'light' ? 'text-emerald-900' : 'text-emerald-300'
                                        }`}
                                      >
                                        TOP 2 ADVANCE TO MEDAL SEMIS
                                      </span>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>

                    {/* Mini Match Scores Ticker for this pool */}
                    {pool.matches && pool.matches.length > 0 && (
                      <div
                        className={`p-3 border-t flex items-center gap-2 overflow-x-auto text-[11px] ${
                          themeMode === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-black/20 border-white/5'
                        }`}
                      >
                        <span
                          className={`font-black uppercase text-[10px] shrink-0 ${
                            themeMode === 'light' ? 'text-slate-600' : 'opacity-70 text-slate-400'
                          }`}
                        >
                          Results:
                        </span>
                        {pool.matches.slice(0, 4).map((m) => (
                          <span
                            key={m.id}
                            className={`px-2 py-1 rounded-lg border shrink-0 font-medium ${
                              themeMode === 'light'
                                ? 'bg-white border-slate-300 text-slate-800'
                                : 'bg-white/10 border-white/10 text-slate-200'
                            }`}
                          >
                            <strong>{m.team1.split(' ')[0]}</strong> {m.score?.[0]}-{m.score?.[1]} <strong>{m.team2.split(' ')[0]}</strong>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* ====================================================
               SCREEN TYPE B2: PLAYOFF PROGRESSION & CHAMPIONSHIP MEDAL MATCHES
               ==================================================== */
            (() => {
              const d = currentScreen?.divisionData!;

              return (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Stage 2 Semifinals (or Quarters) */}
                  <div className="lg:col-span-5 space-y-5">
                    <div
                      className={`flex items-center justify-between pb-2 border-b ${
                        themeMode === 'light' ? 'border-slate-300' : 'border-white/10'
                      }`}
                    >
                      <h3
                        className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${
                          themeMode === 'light' ? 'text-blue-700 font-black' : 'text-blue-400'
                        }`}
                      >
                        <span>Stage 2: Playoff Semifinals</span>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            themeMode === 'light'
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : 'bg-blue-500/20 border border-blue-500/30 text-blue-300'
                          }`}
                        >
                          Winners to Gold &bull; Losers to Bronze
                        </span>
                      </h3>
                    </div>

                    <div className="space-y-4 pt-1">
                      {d.playoffs.semis.map((semi) => (
                        <TvMatchNodeCard
                          key={semi.id}
                          node={semi}
                          isSemi
                          cardBg={themeCardBg}
                          themeMode={themeMode}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Stage 3 Gold & Bronze Medal Matches */}
                  <div className="lg:col-span-7 space-y-6">
                    <div
                      className={`flex items-center justify-between pb-2 border-b ${
                        themeMode === 'light' ? 'border-slate-300' : 'border-white/10'
                      }`}
                    >
                      <h3
                        className={`text-sm font-black uppercase tracking-wider flex items-center gap-1.5 ${
                          themeMode === 'light' ? 'text-amber-800 font-black' : 'text-amber-400'
                        }`}
                      >
                        <Trophy className={`w-4 h-4 ${themeMode === 'light' ? 'text-amber-600' : 'text-amber-400'}`} />
                        <span>Stage 3: Championship Medal Matches</span>
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* 🥇 Gold & Silver Championship Match */}
                      <div
                        className={`rounded-3xl p-5 transition-all shadow-xl ${
                          themeMode === 'light'
                            ? 'bg-gradient-to-b from-amber-50/90 via-white to-white border-2 border-amber-400 text-slate-900 shadow-amber-900/10 ring-1 ring-amber-300'
                            : 'bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 border-2 border-amber-400 text-white shadow-2xl shadow-amber-950/40 ring-1 ring-amber-400/40'
                        }`}
                      >
                        <div
                          className={`flex items-center justify-between pb-3 mb-3 border-b ${
                            themeMode === 'light' ? 'border-amber-300' : 'border-amber-400/30'
                          }`}
                        >
                          <span
                            className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                              themeMode === 'light' ? 'text-amber-950' : 'text-amber-300'
                            }`}
                          >
                            <Trophy className={`w-4 h-4 ${themeMode === 'light' ? 'text-amber-600' : 'text-amber-400'}`} />
                            🥇 Gold & 🥈 Silver Final
                          </span>
                          <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-amber-400 text-black shadow-sm">
                            Stadium Court 1
                          </span>
                        </div>

                        <div className="space-y-3">
                          <div
                            className={`flex items-center justify-between py-2 border-b ${
                              themeMode === 'light' ? 'border-slate-200' : 'border-white/10'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs font-black px-1.5 py-0.5 rounded ${
                                  themeMode === 'light'
                                    ? 'bg-amber-100 text-amber-950 border border-amber-300'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                }`}
                              >
                                #1
                              </span>
                              <span
                                className={`font-black text-base ${
                                  themeMode === 'light' ? 'text-slate-950' : 'text-white'
                                }`}
                              >
                                {d.playoffs.final.team1.name}
                              </span>
                            </div>
                            <span
                              className={`text-xs font-extrabold px-2 py-0.5 rounded ${
                                themeMode === 'light'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                  : 'bg-white/10 text-white'
                              }`}
                            >
                              Pool A #1
                            </span>
                          </div>

                          <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs font-black px-1.5 py-0.5 rounded ${
                                  themeMode === 'light'
                                    ? 'bg-slate-200 text-slate-700 border border-slate-300'
                                    : 'bg-white/10 opacity-75'
                                }`}
                              >
                                TBD
                              </span>
                              <span
                                className={`font-black text-base ${
                                  themeMode === 'light' ? 'text-slate-700' : 'opacity-75'
                                }`}
                              >
                                {d.playoffs.final.team2.name}
                              </span>
                            </div>
                            <span
                              className={`text-xs font-bold ${
                                themeMode === 'light' ? 'text-amber-800' : 'text-amber-400/80'
                              }`}
                            >
                              Winner Semi 2
                            </span>
                          </div>
                        </div>

                        <div
                          className={`mt-4 pt-3 border-t flex items-center justify-between text-[11px] font-bold ${
                            themeMode === 'light'
                              ? 'border-amber-200 text-amber-950'
                              : 'border-amber-400/20 text-amber-200/90'
                          }`}
                        >
                          <span>🥇 Gold: Trophy + $1,200</span>
                          <span>🥈 Silver: Medal + $600</span>
                        </div>
                      </div>

                      {/* 🥉 Bronze 3rd Place Match */}
                      <div
                        className={`rounded-3xl p-5 transition-all shadow-md ${
                          themeMode === 'light'
                            ? 'bg-gradient-to-b from-orange-50/90 via-white to-white border border-orange-300 text-slate-900 shadow-orange-900/10'
                            : 'bg-gradient-to-b from-orange-950/30 via-slate-900 to-slate-950 border border-orange-500/60 text-white shadow-xl shadow-orange-950/20'
                        }`}
                      >
                        <div
                          className={`flex items-center justify-between pb-3 mb-3 border-b ${
                            themeMode === 'light' ? 'border-orange-200' : 'border-orange-500/30'
                          }`}
                        >
                          <span
                            className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                              themeMode === 'light' ? 'text-orange-950' : 'text-orange-300'
                            }`}
                          >
                            <Medal className={`w-4 h-4 ${themeMode === 'light' ? 'text-orange-600' : 'text-orange-400'}`} />
                            🥉 Bronze 3rd Place Match
                          </span>
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg ${
                              themeMode === 'light'
                                ? 'bg-orange-100 text-orange-900 border border-orange-300'
                                : 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                            }`}
                          >
                            Court 3
                          </span>
                        </div>

                        <div className="space-y-3">
                          <div
                            className={`flex items-center justify-between py-1.5 border-b ${
                              themeMode === 'light' ? 'border-slate-200' : 'border-white/10'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs font-black px-1.5 py-0.5 rounded ${
                                  themeMode === 'light'
                                    ? 'bg-orange-100 text-orange-900 border border-orange-200'
                                    : 'bg-white/10 opacity-75'
                                }`}
                              >
                                #3
                              </span>
                              <span
                                className={`font-bold text-sm ${
                                  themeMode === 'light' ? 'text-slate-950' : 'text-white'
                                }`}
                              >
                                {d.playoffs.bronze.team1.name}
                              </span>
                            </div>
                            <span
                              className={`text-xs ${
                                themeMode === 'light' ? 'text-slate-600' : 'opacity-60'
                              }`}
                            >
                              Loser Semi 1
                            </span>
                          </div>

                          <div className="flex items-center justify-between py-1.5">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs font-black px-1.5 py-0.5 rounded ${
                                  themeMode === 'light'
                                    ? 'bg-slate-200 text-slate-700 border border-slate-300'
                                    : 'bg-white/10 opacity-75'
                                }`}
                              >
                                TBD
                              </span>
                              <span
                                className={`font-bold text-sm ${
                                  themeMode === 'light' ? 'text-slate-700' : 'opacity-60'
                                }`}
                              >
                                {d.playoffs.bronze.team2.name}
                              </span>
                            </div>
                            <span
                              className={`text-xs ${
                                themeMode === 'light' ? 'text-slate-600' : 'opacity-60'
                              }`}
                            >
                              Loser Semi 2
                            </span>
                          </div>
                        </div>

                        <div
                          className={`mt-3 pt-2.5 border-t flex items-center justify-between text-[11px] font-bold ${
                            themeMode === 'light'
                              ? 'border-orange-200 text-orange-950'
                              : 'border-orange-500/20 text-orange-200/80'
                          }`}
                        >
                          <span>🥉 Bronze: Medal + DUPR 4.0+</span>
                          <span className={themeMode === 'light' ? 'text-slate-500' : 'opacity-60'}>Scheduled 3:45 PM</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()
          )}
        </div>
      </main>

      {/* ========================================================
          3-TIER STADIUM BROADCAST FOOTER BAND
          ======================================================== */}
      <footer className={`${themeHeaderClass} px-6 py-2.5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium border-t transition-colors shadow-2xl`}>
        {/* Tier 1: Finished Today Podium Showcase */}
        <div className="flex items-center gap-2 overflow-hidden shrink-0">
          <span
            className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold uppercase flex items-center gap-1 shadow-sm ${
              themeMode === 'light'
                ? 'bg-amber-100 border border-amber-300 text-amber-900'
                : 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
            }`}
          >
            <Trophy size={12} className={themeMode === 'light' ? 'text-amber-600' : 'text-amber-400'} />
            Podium
          </span>
          <span
            className={`text-xs truncate max-w-[280px] ${
              themeMode === 'light' ? 'text-slate-800' : 'opacity-80 text-white'
            }`}
          >
            <strong>Singles Open:</strong> 🥇 Reyes &bull; 🥈 Chen &bull; 🥉 Patel
          </span>
        </div>

        {/* Tier 2: On-Deck Stadium Queue */}
        <div
          className={`flex items-center gap-2.5 overflow-hidden flex-1 px-4 border-l border-r ${
            themeMode === 'light' ? 'border-slate-300' : 'border-white/10'
          }`}
        >
          <span
            className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold uppercase shrink-0 flex items-center gap-1 ${
              themeMode === 'light'
                ? 'bg-emerald-100 border border-emerald-300 text-emerald-800'
                : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                themeMode === 'light' ? 'bg-emerald-600' : 'bg-emerald-400'
              }`}
            />
            On Deck
          </span>
          <div
            className={`truncate text-xs ${
              themeMode === 'light' ? 'text-slate-800' : 'opacity-80 text-white'
            }`}
          >
            {scheduledMatches.length > 0 ? (
              scheduledMatches.slice(0, 3).map((m, i) => (
                <span key={m.id} className="mr-4">
                  <strong>{m.team1 || 'Team 1'}</strong> vs <strong>{m.team2 || 'Team 2'}</strong>
                  {i < Math.min(scheduledMatches.length - 1, 2) && (
                    <span className={`ml-3 ${themeMode === 'light' ? 'text-slate-400' : 'opacity-40'}`}>&bull;</span>
                  )}
                </span>
              ))
            ) : (
              <span>All scheduled pool matches are assigned to courts.</span>
            )}
          </div>
        </div>

        {/* Tier 3: Active Rallies & Wall Clock */}
        <div
          className={`flex items-center gap-4 shrink-0 font-mono text-xs ${
            themeMode === 'light' ? 'text-slate-700 font-bold' : 'opacity-80 text-white'
          }`}
        >
          <span className={`font-black ${themeMode === 'light' ? 'text-emerald-700' : 'text-emerald-400'}`}>
            {activeMatchesCount} Courts Live
          </span>
          <span className={themeMode === 'light' ? 'text-slate-400' : 'opacity-40'}>&bull;</span>
          <div className="flex items-center gap-1.5">
            <Clock className={`w-3.5 h-3.5 ${themeMode === 'light' ? 'text-slate-500' : 'opacity-60'}`} />
            <span>{currentTime}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Sub-component: Playoff Node Card for TV Broadcast
interface TvMatchNodeCardProps {
  node: PlayoffMatchNode;
  isSemi?: boolean;
  cardBg?: string;
  themeMode?: 'dark' | 'green' | 'light';
}

const TvMatchNodeCard: React.FC<TvMatchNodeCardProps> = ({
  node,
  isSemi = false,
  cardBg = 'bg-slate-900/90 border-slate-800',
  themeMode = 'dark',
}) => {
  const isLive = node.status === 'LIVE';
  const isCompleted = node.status === 'COMPLETED';
  const isLight = themeMode === 'light';

  return (
    <div
      className={`rounded-2xl border transition-all overflow-hidden shadow-lg ${cardBg} ${
        isLive
          ? isLight
            ? 'border-emerald-600 ring-2 ring-emerald-500/30'
            : 'border-emerald-500 ring-2 ring-emerald-500/30'
          : isCompleted
          ? isLight
            ? 'border-slate-300'
            : 'border-white/10'
          : isLight
          ? 'border-slate-200'
          : 'border-white/5 opacity-80'
      }`}
    >
      <div
        className={`px-3.5 py-1.5 flex items-center justify-between text-[11px] font-bold border-b ${
          isLive
            ? isLight
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-black'
              : 'bg-emerald-950/40 border-emerald-800/40 text-emerald-300'
            : isLight
            ? 'bg-slate-100 border-slate-200 text-slate-800 font-extrabold'
            : 'bg-black/20 border-white/10 opacity-70'
        }`}
      >
        <span className="truncate pr-2 font-black uppercase tracking-wider">{node.title}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          {node.court && (
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                isLight ? 'bg-slate-200 text-slate-800 border border-slate-300' : 'bg-white/10 opacity-80'
              }`}
            >
              Court {node.court}
            </span>
          )}
          {isLive && (
            <span
              className={`flex items-center gap-1 text-[10px] uppercase font-black ${
                isLight ? 'text-emerald-700' : 'text-emerald-400'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isLight ? 'bg-emerald-600' : 'bg-emerald-400'} animate-ping`} />
              Live
            </span>
          )}
        </div>
      </div>

      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 truncate pr-2">
            {node.team1.seed && (
              <span
                className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                  isLight ? 'bg-slate-100 text-slate-800 border border-slate-300' : 'bg-white/10 opacity-75'
                }`}
              >
                #{node.team1.seed}
              </span>
            )}
            <span
              className={`text-sm truncate ${
                node.team1.winner
                  ? isLight
                    ? 'font-black text-emerald-700'
                    : 'font-black text-emerald-400'
                  : isLight
                  ? 'font-bold text-slate-900'
                  : 'font-bold'
              }`}
            >
              {node.team1.name}
            </span>
          </div>
          {node.team1.score !== undefined && (
            <span
              className={`text-lg font-mono font-black ${
                node.team1.winner
                  ? isLight
                    ? 'text-emerald-700'
                    : 'text-emerald-400'
                  : isLight
                  ? 'text-slate-500 font-bold'
                  : 'opacity-60'
              }`}
            >
              {node.team1.score}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 truncate pr-2">
            {node.team2.seed && (
              <span
                className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                  isLight ? 'bg-slate-100 text-slate-800 border border-slate-300' : 'bg-white/10 opacity-75'
                }`}
              >
                #{node.team2.seed}
              </span>
            )}
            <span
              className={`text-sm truncate ${
                node.team2.winner
                  ? isLight
                    ? 'font-black text-emerald-700'
                    : 'font-black text-emerald-400'
                  : isLight
                  ? 'font-bold text-slate-900'
                  : 'font-bold'
              }`}
            >
              {node.team2.name}
            </span>
          </div>
          {node.team2.score !== undefined && (
            <span
              className={`text-lg font-mono font-black ${
                node.team2.winner
                  ? isLight
                    ? 'text-emerald-700'
                    : 'text-emerald-400'
                  : isLight
                  ? 'text-slate-500 font-bold'
                  : 'opacity-60'
              }`}
            >
              {node.team2.score}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
