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
} from 'lucide-react';
import { CourtDeskState, TournamentMatch, Sponsor } from '../../types/organizer';

interface TvBroadcastViewProps {
  tournamentName?: string;
  venueName?: string;
  courts: CourtDeskState[];
  matches: TournamentMatch[];
  sponsors?: Sponsor[];
  onExitTvMode?: () => void;
}

export const TvBroadcastView: React.FC<TvBroadcastViewProps> = ({
  tournamentName = 'Austin Winter Open 2026',
  venueName = 'Austin Tennis & Pickleball Center',
  courts,
  matches,
  sponsors = [],
  onExitTvMode,
}) => {
  const [displayMode, setDisplayMode] = useState<'jumbotron' | 'spotlight' | 'cycle'>('jumbotron');
  const [spotlightCourtNumber, setSpotlightCourtNumber] = useState<number>(1);
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

  // Auto-cycle courts if in cycle mode
  useEffect(() => {
    if (displayMode !== 'cycle') return;
    const interval = setInterval(() => {
      setSpotlightCourtNumber((prev) => (prev % courts.length) + 1);
    }, 12000); // 12 seconds per court
    return () => clearInterval(interval);
  }, [displayMode, courts.length]);

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
              8-Court Jumbotron
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

          {/* Spotlight Court Dropdown */}
          {(displayMode === 'spotlight' || displayMode === 'cycle') && (
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

      {/* Main TV Screen Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {displayMode === 'jumbotron' ? (
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
        ) : (
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
        )}
      </main>

      {/* Bottom Stadium Announcement & On-Deck Marquee */}
      <footer className="bg-slate-900 border-t border-slate-800 px-6 py-3 flex items-center justify-between text-xs font-medium">
        <div className="flex items-center gap-3 overflow-hidden">
          <span className="px-2.5 py-1 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold uppercase shrink-0">
            📢 On Deck
          </span>
          <div className="truncate text-slate-300">
            {scheduledMatches.length > 0 ? (
              scheduledMatches.slice(0, 4).map((m, i) => (
                <span key={m.id} className="mr-6">
                  <strong className="text-white">{m.team1 || 'Team 1'}</strong> vs <strong className="text-white">{m.team2 || 'Team 2'}</strong> ({m.divisionId})
                  {i < Math.min(scheduledMatches.length - 1, 3) && <span className="text-slate-600 ml-4">&bull;</span>}
                </span>
              ))
            ) : (
              <span>All scheduled pool matches are currently assigned to courts.</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0 font-mono text-slate-400">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>{currentTime}</span>
        </div>
      </footer>
    </div>
  );
};
