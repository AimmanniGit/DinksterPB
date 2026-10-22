'use client';

import React, { useState, useEffect } from 'react';
import {
  Tv,
  Maximize2,
  Minimize2,
  Share2,
  Layers,
  Flame,
  Radio,
  Clock,
  Trophy,
  Medal,
  Award,
  ChevronRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import {
  CourtDeskState,
  TournamentMatch,
  Sponsor,
  DivisionBracketData,
  PoolGroup,
  PlayoffMatchNode,
} from '../../types/organizer';
import { INITIAL_BRACKET_DATA } from '../../constants/initialState';

interface TvBroadcastViewProps {
  tournamentName?: string;
  venueName?: string;
  courts: CourtDeskState[];
  matches: TournamentMatch[];
  sponsors?: Sponsor[];
  onExitTvMode?: () => void;
  bracketData?: Record<string, DivisionBracketData>;
  initialMode?: 'jumbotron' | 'spotlight' | 'bracket' | 'cycle';
}

export const TvBroadcastView: React.FC<TvBroadcastViewProps> = ({
  tournamentName = 'Austin Winter Open 2026',
  venueName = 'Austin Tennis & Pickleball Center',
  courts,
  matches,
  sponsors = [],
  onExitTvMode,
  bracketData = INITIAL_BRACKET_DATA,
  initialMode = 'jumbotron',
}) => {
  const [displayMode, setDisplayMode] = useState<'jumbotron' | 'spotlight' | 'bracket' | 'cycle'>(initialMode);
  const [spotlightCourtNumber, setSpotlightCourtNumber] = useState<number>(1);
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>('A');
  const [cycleIndex, setCycleIndex] = useState<number>(0); // 0: Jumbotron, 1: Spotlight, 2: Bracket
  const [secondsRemaining, setSecondsRemaining] = useState<number>(14);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Update clock every second
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

  // Auto-cycle through Jumbotron -> Spotlight -> Bracket Tree Map with elapsed countdown
  useEffect(() => {
    if (displayMode !== 'cycle' || isPaused) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setCycleIndex((c) => (c + 1) % 3);
          setSpotlightCourtNumber((c) => (c % courts.length) + 1);
          return 14;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [displayMode, isPaused, courts.length]);

  // Keyboard Shortcuts (F: Fullscreen, Space: Pause/Resume cycle, Arrows: Step views)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'f' || e.key === 'F') {
        handleToggleFullscreen();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPaused((p) => !p);
      } else if (e.key === 'ArrowRight') {
        if (displayMode === 'spotlight') {
          setSpotlightCourtNumber((prev) => (prev % courts.length) + 1);
        } else if (displayMode === 'bracket') {
          const keys = Object.keys(bracketData);
          const idx = keys.indexOf(selectedDivisionId);
          setSelectedDivisionId(keys[(idx + 1) % keys.length]);
        }
      } else if (e.key === 'ArrowLeft') {
        if (displayMode === 'spotlight') {
          setSpotlightCourtNumber((prev) => (prev - 2 + courts.length) % courts.length + 1);
        } else if (displayMode === 'bracket') {
          const keys = Object.keys(bracketData);
          const idx = keys.indexOf(selectedDivisionId);
          setSelectedDivisionId(keys[(idx - 1 + keys.length) % keys.length]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [displayMode, courts.length, selectedDivisionId, bracketData]);

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

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
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

  const scheduledMatches = matches.filter((m) => m.status === 'SCHEDULED' || m.status === 'PENDING');
  const activeMatchesCount = courts.filter((c) => c.status === 'live').length;
  const spotlightCourt = courts.find((c) => c.number === spotlightCourtNumber) || courts[0];
  const activeScreen = displayMode === 'cycle'
    ? cycleIndex === 0
      ? 'jumbotron'
      : cycleIndex === 1
      ? 'spotlight'
      : 'bracket'
    : displayMode;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col select-none">
      {/* Top Stadium Bar / TV Controls */}
      <header className="bg-slate-900/90 border-b border-slate-800 px-6 py-3.5 flex items-center justify-between backdrop-blur sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white uppercase">{tournamentName}</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE TV CAST
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">{venueName} &bull; {activeMatchesCount} Courts Live</p>
            </div>
          </div>
        </div>

        {/* Mode Selector & TV Actions */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 flex items-center gap-1">
            <button
              onClick={() => setDisplayMode('jumbotron')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                displayMode === 'jumbotron'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              {courts.length}-Court Jumbotron
            </button>
            <button
              onClick={() => setDisplayMode('spotlight')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                displayMode === 'spotlight'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              Center Court
            </button>
            <button
              onClick={() => setDisplayMode('bracket')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                displayMode === 'bracket'
                  ? 'bg-amber-500 text-black shadow font-extrabold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              Brackets & Medals
            </button>
            <button
              onClick={() => setDisplayMode('cycle')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                displayMode === 'cycle'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              Auto-Cycle
            </button>
          </div>

          {/* Cycle Timer Pill & Pause Indicator */}
          {displayMode === 'cycle' && (
            <button
              onClick={() => setIsPaused((p) => !p)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition ${
                isPaused
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}
              title="Spacebar to Pause / Resume Rotation"
            >
              <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-ping'}`} />
              <span>{isPaused ? 'Paused' : `${secondsRemaining}s`}</span>
            </button>
          )}

          {/* In-App Board Zoom Multiplier */}
          <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-1.5 rounded-xl border border-slate-700/60 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 mr-0.5">Zoom</span>
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.8, Math.round((z - 0.1) * 10) / 10))}
              className="w-5 h-5 flex items-center justify-center rounded bg-slate-700 hover:bg-slate-600 text-white font-bold"
              title="Scale TV UI Down"
            >
              -
            </button>
            <span className="font-mono text-[11px] font-bold text-slate-200 px-1 w-9 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.4, Math.round((z + 0.1) * 10) / 10))}
              className="w-5 h-5 flex items-center justify-center rounded bg-slate-700 hover:bg-slate-600 text-white font-bold"
              title="Scale TV UI Up for Large Screens"
            >
              +
            </button>
          </div>

          {/* Spotlight Court Dropdown */}
          {displayMode === 'spotlight' && (
            <select
              value={spotlightCourtNumber}
              onChange={(e) => setSpotlightCourtNumber(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-xl px-3 py-2 outline-none"
            >
              {courts.map((c) => (
                <option key={c.number} value={c.number}>
                  Court {c.number} {c.matchTitle ? `(${c.matchTitle})` : '(Open)'}
                </option>
              ))}
            </select>
          )}

          {/* Share Link */}
          <button
            onClick={handleCopyShareLink}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
            title="Copy Public Screen Link for TV"
          >
            <Share2 className="w-3.5 h-3.5" />
            {copiedLink ? 'Link Copied!' : 'Share TV Link'}
          </button>

          {/* Fullscreen */}
          <button
            onClick={handleToggleFullscreen}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5 shadow"
            title="Press F for Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen TV'}
          </button>

          {onExitTvMode && (
            <button
              onClick={onExitTvMode}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Close TV
            </button>
          )}
        </div>
      </header>

      {/* Elapsed Rotation Progress Bar */}
      {displayMode === 'cycle' && (
        <div className="w-full bg-slate-900 h-1 overflow-hidden relative border-b border-slate-800">
          <div
            className={`h-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all duration-1000 ease-linear ${
              isPaused ? 'opacity-30' : ''
            }`}
            style={{ width: `${Math.round(((14 - secondsRemaining) / 14) * 100)}%` }}
          />
        </div>
      )}

      {/* Main TV Screen Content */}
      <main className="flex-1 p-6 overflow-y-auto" style={{ zoom: zoomLevel }}>
        {activeScreen === 'jumbotron' ? (
          /* ====================================================
             MODE 1: 8-COURT JUMBOTRON GRID (STADIUM VIEW)
             ==================================================== */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {courts.map((court) => {
              const sponsor = sponsors.find((s) => s.courtAssigned === court.number);
              const isLive = court.status === 'live';
              const isCalled = court.status === 'called';
              const isBlocked = court.status === 'blocked';
              const score = court.score || [0, 0];

              // Parse team names from matchTitle if available
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
                  className={`rounded-2xl border transition-all flex flex-col justify-between overflow-hidden shadow-2xl ${
                    isLive
                      ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-emerald-500/40 shadow-emerald-950/20'
                      : isCalled
                      ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-amber-500/40'
                      : isBlocked
                      ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-red-500/40'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  {/* Court Header Banner */}
                  <div
                    className={`px-4 py-2.5 flex items-center justify-between border-b ${
                      isLive
                        ? 'bg-emerald-950/60 border-emerald-800/40 text-emerald-300'
                        : isCalled
                        ? 'bg-amber-950/60 border-amber-800/40 text-amber-300'
                        : isBlocked
                        ? 'bg-red-950/60 border-red-800/40 text-red-300'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm tracking-wide uppercase">
                        Court {court.number}
                      </span>
                      {sponsor && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/10 text-white/90">
                          {sponsor.name}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isLive
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : isCalled
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : isBlocked
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-slate-700/40 text-slate-400'
                      }`}
                    >
                      {isLive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                      {court.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Court Body: Teams & Live Scores */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    {court.matchTitle ? (
                      <div>
                        {/* Division Subtitle */}
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                          Match {court.matchId || 'Live'} &bull; Active Rally
                        </div>

                        {/* Team 1 Row */}
                        <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
                          <div className="flex items-center gap-2 flex-1 pr-2">
                            {isLive && score[0] >= score[1] && (
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" title="Serving" />
                            )}
                            <span className="font-extrabold text-base tracking-tight text-white truncate">
                              {teamA}
                            </span>
                          </div>
                          <span className="text-3xl font-black text-emerald-400 font-mono tracking-tighter">
                            {score[0]}
                          </span>
                        </div>

                        {/* Team 2 Row */}
                        <div className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-2 flex-1 pr-2">
                            {isLive && score[1] > score[0] && (
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" title="Serving" />
                            )}
                            <span className="font-extrabold text-base tracking-tight text-white truncate">
                              {teamB}
                            </span>
                          </div>
                          <span className="text-3xl font-black text-emerald-400 font-mono tracking-tighter">
                            {score[1]}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 text-center flex flex-col items-center justify-center">
                        <span className="text-sm font-semibold text-slate-500">Court Ready</span>
                        <span className="text-xs text-slate-600 mt-1">Awaiting Match Call</span>
                      </div>
                    )}

                    {/* Footer Referee & Timer */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Ref: <strong className="text-slate-300">{court.referee || 'Desk Call'}</strong></span>
                      {court.sinceTime && (
                        <span className="font-mono text-slate-400">Since {court.sinceTime}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : activeScreen === 'spotlight' ? (
          /* ====================================================
             MODE 2: CENTER COURT SPOTLIGHT (GIANT SCOREBOARD)
             ==================================================== */
          <div className="max-w-6xl mx-auto flex flex-col justify-center items-center py-4">
            {spotlightCourt && spotlightCourt.matchTitle ? (
              <div className="w-full bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/40 rounded-3xl p-8 md:p-12 shadow-2xl shadow-emerald-950/30">
                {/* Court & Sponsor Banner */}
                <div className="flex flex-col md:flex-row items-center justify-between border-b border-slate-800 pb-6 mb-8 gap-4">
                  <div className="flex items-center gap-3">
                    <span className="px-4 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-black text-sm tracking-widest uppercase">
                      Court {spotlightCourtNumber}
                    </span>
                    <h2 className="text-2xl font-black text-white tracking-tight">
                      {spotlightCourt.matchTitle}
                    </h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-extrabold uppercase text-slate-400">Referee:</span>
                    <span className="text-base font-bold text-white bg-slate-800 px-3 py-1 rounded-lg">
                      {spotlightCourt.referee || 'Head Desk Official'}
                    </span>
                  </div>
                </div>

                {/* Giant Live Score Board */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center my-4">
                  {/* Side 1 */}
                  <div className="md:col-span-2 text-center md:text-left">
                    <div className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Team A</div>
                    <div className="text-4xl md:text-5xl font-black text-white tracking-tight mb-3">
                      {spotlightCourt.matchTitle.split(' vs ')[0] || 'Team A'}
                    </div>
                    {spotlightCourt.score && spotlightCourt.score[0] >= spotlightCourt.score[1] && (
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-black uppercase">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        Serving Side
                      </span>
                    )}
                  </div>

                  {/* Giant Numerals */}
                  <div className="md:col-span-1 flex items-center justify-center">
                    <div className="bg-slate-950 border border-slate-800 px-8 py-5 rounded-3xl flex items-center gap-4 shadow-inner">
                      <span className="text-6xl md:text-8xl font-black text-emerald-400 font-mono tracking-tighter">
                        {spotlightCourt.score ? spotlightCourt.score[0] : 0}
                      </span>
                      <span className="text-4xl font-black text-slate-600">:</span>
                      <span className="text-6xl md:text-8xl font-black text-emerald-400 font-mono tracking-tighter">
                        {spotlightCourt.score ? spotlightCourt.score[1] : 0}
                      </span>
                    </div>
                  </div>

                  {/* Side 2 */}
                  <div className="md:col-span-2 text-center md:text-right">
                    <div className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Team B</div>
                    <div className="text-4xl md:text-5xl font-black text-white tracking-tight mb-3">
                      {spotlightCourt.matchTitle.split(' vs ')[1] || 'Team B'}
                    </div>
                    {spotlightCourt.score && spotlightCourt.score[1] > spotlightCourt.score[0] && (
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-black uppercase">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        Serving Side
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <h3 className="text-2xl font-bold text-slate-400">Court {spotlightCourtNumber} is Currently Open</h3>
                <p className="text-slate-500 mt-2">Next match will automatically display when dispatched from the desk.</p>
              </div>
            )}
          </div>
        ) : (
          /* ====================================================
             MODE 3: TOURNAMENT BRACKET & MEDAL PROGRESSION TREE
             Round Robin Pools -> Playoff Tree -> Medal Matches
             ==================================================== */
          <div className="max-w-[1500px] mx-auto space-y-6 py-2">
            {/* Division & Progression Header Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-3xl shadow-xl">
              <div className="flex items-center gap-2 overflow-x-auto">
                <span className="text-xs font-black uppercase text-amber-400 tracking-wider mr-2 flex items-center gap-1.5 shrink-0">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  Division:
                </span>
                {Object.values(bracketData).map((b) => (
                  <button
                    key={b.divisionId}
                    onClick={() => setSelectedDivisionId(b.divisionId)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                      selectedDivisionId === b.divisionId
                        ? 'bg-amber-500 text-black shadow font-extrabold'
                        : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {b.divisionName}
                  </button>
                ))}
              </div>

              {/* Broadcast Stage Flow Badges */}
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Stage 1: Round Robin Pools
                </span>
                <ChevronRight className="w-4 h-4 text-slate-600" />
                <span className="px-3 py-1.5 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Stage 2: Playoff Semifinals
                </span>
                <ChevronRight className="w-4 h-4 text-slate-600" />
                <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/25 text-amber-300 border border-amber-500/40 font-black flex items-center gap-1.5 shadow-sm">
                  <Medal className="w-4 h-4 text-amber-400" />
                  🥇 Gold & 🥉 Bronze Medal Matches
                </span>
              </div>
            </div>

            {/* Stadium Tree Map Grid */}
            {(() => {
              const currentBracket = bracketData[selectedDivisionId] || bracketData['A'];
              const hasPools = currentBracket.pools && currentBracket.pools.length > 0;

              return (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* ====================================================
                      COLUMN 1: STAGE 1 (POOLS OR QUARTERFINALS)
                      ==================================================== */}
                  <div className="lg:col-span-5 space-y-5">
                    {hasPools ? (
                      <>
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                          <h3 className="text-sm font-black uppercase text-emerald-400 tracking-wider flex items-center gap-2">
                            <span>Stage 1: Round Robin Pools</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">
                              Top 2 Advance to Semis
                            </span>
                          </h3>
                        </div>

                        {currentBracket.pools.map((pool) => (
                          <div
                            key={pool.name}
                            className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-lg"
                          >
                            <div className="bg-emerald-950/40 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
                              <span className="font-black text-xs text-emerald-300 uppercase tracking-wider">
                                {pool.name} Standings
                              </span>
                              <span className="text-[11px] text-slate-400 font-semibold">
                                4 Teams &bull; 6 Matches Total
                              </span>
                            </div>

                            <table className="w-full text-xs text-left">
                              <thead className="bg-slate-950/60 text-slate-400 font-bold border-b border-slate-800">
                                <tr>
                                  <th className="py-2 px-3">#</th>
                                  <th className="py-2 px-3">Team</th>
                                  <th className="py-2 px-2 text-center">W-L</th>
                                  <th className="py-2 px-2 text-center">+/-</th>
                                  <th className="py-2 px-3 text-right">Advancement</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800/60 font-medium">
                                {pool.teams.map((t, idx) => {
                                  const liveCourtNum = findLiveCourtForTeam(t.name);
                                  const isLastQualifier = t.qualified && (!pool.teams[idx + 1] || !pool.teams[idx + 1].qualified);

                                  return (
                                    <React.Fragment key={t.id}>
                                      <tr
                                        className={
                                          t.qualified
                                            ? 'bg-emerald-950/20 text-white font-bold'
                                            : 'text-slate-400'
                                        }
                                      >
                                        <td className="py-2.5 px-3 font-mono font-bold text-slate-500">
                                          {idx + 1}
                                        </td>
                                        <td className="py-2.5 px-3">
                                          <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                                              #{t.seed}
                                            </span>
                                            <span className="font-bold text-white truncate max-w-[130px]">
                                              {t.name}
                                            </span>
                                            {liveCourtNum && (
                                              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 flex items-center gap-1 shrink-0 animate-pulse">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                C{liveCourtNum} LIVE
                                              </span>
                                            )}
                                          </div>
                                        </td>
                                        <td className="py-2.5 px-2 text-center font-mono">
                                          {t.wins}-{t.losses}
                                        </td>
                                        <td className="py-2.5 px-2 text-center font-mono text-emerald-400">
                                          {t.pointDiff > 0 ? `+${t.pointDiff}` : t.pointDiff}
                                        </td>
                                        <td className="py-2.5 px-3 text-right">
                                          {t.qualified ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                              <CheckCircle2 size={10} className="text-emerald-400" />
                                              Q{idx + 1} Advancing &rarr;
                                            </span>
                                          ) : (
                                            <span className="text-[10px] text-slate-600">Eliminated</span>
                                          )}
                                        </td>
                                      </tr>
                                      {isLastQualifier && (
                                        <tr key={`${pool.name}-cutline`}>
                                          <td colSpan={5} className="py-1 px-3 bg-emerald-950/40 border-y border-emerald-500/40 text-[10px] font-black uppercase tracking-wider text-emerald-400">
                                            <div className="flex items-center justify-between">
                                              <span className="flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                PLAYOFF ADVANCEMENT CUTLINE
                                              </span>
                                              <span className="text-[9px] text-emerald-300 font-bold">TOP 2 ADVANCE TO MEDAL SEMIS</span>
                                            </div>
                                          </td>
                                        </tr>
                                      )}
                                    </React.Fragment>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        ))}
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                          <h3 className="text-sm font-black uppercase text-slate-300 tracking-wider">
                            Quarterfinals (Round of 8)
                          </h3>
                        </div>
                        <div className="space-y-4">
                          {currentBracket.playoffs.quarters.map((q) => (
                            <TvMatchNodeCard key={q.id} node={q} />
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* ====================================================
                      COLUMN 2: STAGE 2 (SEMIFINALS BRACKET NODES)
                      ==================================================== */}
                  <div className="lg:col-span-3 space-y-5">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <h3 className="text-sm font-black uppercase text-blue-400 tracking-wider flex items-center gap-2">
                        <span>Stage 2: Semifinals</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300">
                          Win to Gold
                        </span>
                      </h3>
                    </div>

                    <div className="space-y-6 pt-2">
                      {currentBracket.playoffs.semis.map((semi) => (
                        <TvMatchNodeCard key={semi.id} node={semi} isSemi />
                      ))}
                    </div>
                  </div>

                  {/* ====================================================
                      COLUMN 3: STAGE 3 (GOLD & BRONZE MEDAL FINALS)
                      ==================================================== */}
                  <div className="lg:col-span-4 space-y-6">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <h3 className="text-sm font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        <span>Stage 3: Medal Matches</span>
                      </h3>
                    </div>

                    {/* 🥇 Gold & Silver Championship Match */}
                    <div className="bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 border-2 border-amber-400 rounded-3xl p-5 shadow-2xl shadow-amber-950/40 ring-1 ring-amber-400/40">
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-amber-400/30">
                        <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                          <Trophy className="w-4 h-4 text-amber-400" />
                          🥇 Gold & 🥈 Silver Final
                        </span>
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg bg-amber-400 text-black shadow-sm">
                          Stadium Court 1
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              #1
                            </span>
                            <span className="font-black text-base text-white">
                              {currentBracket.playoffs.final.team1.name}
                            </span>
                          </div>
                          <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-white/10 text-white">
                            Pool A #1
                          </span>
                        </div>

                        <div className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                              TBD
                            </span>
                            <span className="font-black text-base text-slate-300">
                              {currentBracket.playoffs.final.team2.name}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-amber-400/80">
                            Winner Semi 2
                          </span>
                        </div>
                      </div>

                      {/* Golden Award Footer */}
                      <div className="mt-4 pt-3 border-t border-amber-400/20 flex items-center justify-between text-[11px] text-amber-200/90 font-semibold">
                        <span>🥇 Gold: Trophy + $1,200</span>
                        <span>🥈 Silver: Medal + $600</span>
                      </div>
                    </div>

                    {/* 🥉 Bronze 3rd Place Match */}
                    <div className="bg-gradient-to-b from-orange-950/30 via-slate-900 to-slate-950 border border-orange-500/60 rounded-3xl p-5 shadow-xl shadow-orange-950/20">
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-orange-500/30">
                        <span className="text-xs font-black uppercase tracking-wider text-orange-300 flex items-center gap-1.5">
                          <Medal className="w-4 h-4 text-orange-400" />
                          🥉 Bronze 3rd Place Match
                        </span>
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg bg-orange-500/20 text-orange-300 border border-orange-500/40">
                          Court 3
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-1.5 border-b border-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                              #3
                            </span>
                            <span className="font-bold text-sm text-white">
                              {currentBracket.playoffs.bronze.team1.name}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400">Loser Semi 1</span>
                        </div>

                        <div className="flex items-center justify-between py-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                              TBD
                            </span>
                            <span className="font-bold text-sm text-slate-400">
                              {currentBracket.playoffs.bronze.team2.name}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400">Loser Semi 2</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-orange-500/20 flex items-center justify-between text-[11px] text-orange-200/80 font-semibold">
                        <span>🥉 Bronze: Medal + DUPR 4.0+</span>
                        <span className="text-slate-400">Scheduled 3:45 PM</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </main>

      {/* 3-Tier Stadium Broadcast Band */}
      <footer className="bg-slate-900 border-t border-slate-800 px-6 py-2.5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium shadow-2xl">
        {/* Tier 1: Finished Today Podium Showcase */}
        <div className="flex items-center gap-2 overflow-hidden shrink-0">
          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-extrabold uppercase flex items-center gap-1 shadow-sm">
            <Trophy size={12} className="text-amber-400" />
            Podium
          </span>
          <span className="text-slate-300 text-xs truncate max-w-[280px]">
            <strong>Singles Open:</strong> 🥇 Reyes &bull; 🥈 Chen &bull; 🥉 Patel
          </span>
        </div>

        {/* Tier 2: On-Deck Stadium Queue */}
        <div className="flex items-center gap-2.5 overflow-hidden flex-1 px-4 border-l border-r border-slate-800">
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-extrabold uppercase shrink-0 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            On Deck
          </span>
          <div className="truncate text-slate-300 text-xs">
            {scheduledMatches.length > 0 ? (
              scheduledMatches.slice(0, 3).map((m, i) => (
                <span key={m.id} className="mr-4">
                  <strong className="text-white">{m.team1 || 'Team 1'}</strong> vs <strong className="text-white">{m.team2 || 'Team 2'}</strong>
                  {i < Math.min(scheduledMatches.length - 1, 2) && <span className="text-slate-600 ml-3">&bull;</span>}
                </span>
              ))
            ) : (
              <span>All scheduled pool matches are assigned to courts.</span>
            )}
          </div>
        </div>

        {/* Tier 3: Active Rallies & Wall Clock */}
        <div className="flex items-center gap-4 shrink-0 font-mono text-slate-400 text-xs">
          <span className="text-emerald-400 font-bold">{activeMatchesCount} Courts Live</span>
          <span className="text-slate-600">&bull;</span>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
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
}

const TvMatchNodeCard: React.FC<TvMatchNodeCardProps> = ({ node, isSemi = false }) => {
  const isLive = node.status === 'LIVE';
  const isCompleted = node.status === 'COMPLETED';

  return (
    <div
      className={`rounded-2xl border transition-all overflow-hidden shadow-lg ${
        isLive
          ? 'bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/30'
          : isCompleted
          ? 'bg-slate-900/90 border-slate-700/80'
          : 'bg-slate-900/60 border-slate-800'
      }`}
    >
      {/* Node Header */}
      <div
        className={`px-3.5 py-1.5 flex items-center justify-between text-[11px] font-bold border-b ${
          isLive
            ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-300'
            : 'bg-slate-950/60 border-slate-800 text-slate-400'
        }`}
      >
        <span className="truncate pr-2 font-black uppercase tracking-wider">{node.title}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          {node.court && (
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">
              Court {node.court}
            </span>
          )}
          {isLive && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 uppercase font-black">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Live
            </span>
          )}
        </div>
      </div>

      {/* Teams & Scores */}
      <div className="p-3 space-y-2">
        {/* Team 1 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 truncate pr-2">
            {node.team1.seed && (
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                #{node.team1.seed}
              </span>
            )}
            <span
              className={`text-sm truncate ${
                node.team1.winner ? 'font-black text-emerald-300' : 'font-bold text-white'
              }`}
            >
              {node.team1.name}
            </span>
          </div>
          {node.team1.score !== undefined && (
            <span
              className={`text-lg font-mono font-black ${
                node.team1.winner ? 'text-emerald-400' : 'text-slate-400'
              }`}
            >
              {node.team1.score}
            </span>
          )}
        </div>

        {/* Team 2 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 truncate pr-2">
            {node.team2.seed && (
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                #{node.team2.seed}
              </span>
            )}
            <span
              className={`text-sm truncate ${
                node.team2.winner ? 'font-black text-emerald-300' : 'font-bold text-white'
              }`}
            >
              {node.team2.name}
            </span>
          </div>
          {node.team2.score !== undefined && (
            <span
              className={`text-lg font-mono font-black ${
                node.team2.winner ? 'text-emerald-400' : 'text-slate-400'
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
