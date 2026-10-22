'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { TournamentEvent, Division, UserActorProfile } from '../../types/organizer';
import {
  Trophy,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Plus,
  Search,
  ExternalLink,
  Tv,
  ArrowRight,
  Sparkles,
  Layers,
  Copy,
  Check,
  Filter,
  Flame,
  Send,
  MessageSquare,
  Bot,
  Zap,
  BarChart3,
  X,
  CreditCard,
  ShieldCheck,
  Building2,
  ChevronRight,
} from 'lucide-react';

interface TournamentFleetDirectoryProps {
  tournaments: TournamentEvent[];
  activeTournamentId?: string | null;
  onSelectTournament: (tournamentId: string) => void;
  onCreateTournament: (newEvent: TournamentEvent) => void;
  actorProfile?: UserActorProfile;
}

export const TournamentFleetDirectory: React.FC<TournamentFleetDirectoryProps> = ({
  tournaments,
  activeTournamentId,
  onSelectTournament,
  onCreateTournament,
  actorProfile,
}) => {
  const canViewFinancials = actorProfile ? actorProfile.permissions.canViewFinancials : true;
  const canManageFleet = actorProfile ? actorProfile.permissions.canManageFleet : true;

  const [statusFilter, setStatusFilter] = useState<'all' | 'Live' | 'Published' | 'Draft' | 'Concluded'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createMode, setCreateMode] = useState<'copilot' | 'manual'>('copilot');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Interactive KPI Breakdown Modal State
  const [activeKpiModal, setActiveKpiModal] = useState<'tournaments' | 'players' | 'revenue' | 'courts' | null>(null);

  // Form State for Manual Setup
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [dates, setDates] = useState('');
  const [venue, setVenue] = useState('');
  const [totalCourts, setTotalCourts] = useState<number>(8);
  const [courtSurface, setCourtSurface] = useState('Outdoor Acrylic Hardcourt (PPA Standard)');
  const [ballType, setBallType] = useState('Franklin X-40 (Outdoor Yellow)');

  // State for Copilot AI Tournament Architect
  const [copilotInput, setCopilotInput] = useState('');
  const [copilotHistory, setCopilotHistory] = useState<Array<{ sender: 'user' | 'copilot'; text: string; proposal?: Partial<TournamentEvent> }>>([
    {
      sender: 'copilot',
      text: 'Hi! I am your Tournament Copilot. Tell me about the event you want to run (e.g. city, weekend dates, number of courts, division types, entry fees, or DUPR sanctioning), and I will configure the complete tournament setup and divisions for you.',
    },
  ]);
  const [isCopilotThinking, setIsCopilotThinking] = useState(false);

  // Find the currently Live tournament in the fleet (if any)
  const liveTournament = useMemo(() => {
    return tournaments.find((t) => t.status === 'Live') || null;
  }, [tournaments]);

  // Filtered Tournaments List
  const filteredTournaments = useMemo(() => {
    return tournaments.filter((t) => {
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchesSearch =
        !searchQuery.trim() ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.city && t.city.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
  }, [tournaments, statusFilter, searchQuery]);

  // Overall & Dynamic Filtered Statistics
  const dynamicStats = useMemo(() => {
    const targetPool = statusFilter === 'all'
      ? tournaments
      : tournaments.filter((t) => t.status === statusFilter);

    const count = targetPool.length;
    const totalRev = targetPool.reduce((acc, t) => acc + (t.revenue || 0), 0);
    const totalPlayers = targetPool.reduce((acc, t) => acc + (t.registeredCount || 0), 0);
    const totalCourtsCount = targetPool.reduce((acc, t) => acc + (t.totalCourts || 0), 0);

    const liveCount = tournaments.filter((t) => t.status === 'Live').length;
    const upcomingCount = tournaments.filter((t) => t.status === 'Published').length;
    const draftsCount = tournaments.filter((t) => t.status === 'Draft').length;
    const concludedCount = tournaments.filter((t) => t.status === 'Concluded').length;

    return {
      poolCount: count,
      poolRev: totalRev,
      poolPlayers: totalPlayers,
      poolCourts: totalCourtsCount,
      liveCount,
      upcomingCount,
      draftsCount,
      concludedCount,
      totalCount: tournaments.length,
      targetPool,
    };
  }, [tournaments, statusFilter]);

  // Copilot Interactive Prompt Generator
  const handleCopilotSend = (customPrompt?: string) => {
    const text = (customPrompt || copilotInput).trim();
    if (!text) return;

    const newHistory = [...copilotHistory, { sender: 'user' as const, text }];
    setCopilotHistory(newHistory);
    setCopilotInput('');
    setIsCopilotThinking(true);

    setTimeout(() => {
      setIsCopilotThinking(false);

      const lower = text.toLowerCase();
      let proposedCity = 'Austin, TX';
      if (lower.includes('dallas')) proposedCity = 'Dallas, TX';
      else if (lower.includes('houston')) proposedCity = 'Houston, TX';
      else if (lower.includes('san antonio')) proposedCity = 'San Antonio, TX';
      else if (lower.includes('denver')) proposedCity = 'Denver, CO';
      else if (lower.includes('chicago')) proposedCity = 'Chicago, IL';

      let proposedCourts = 8;
      const courtMatch = text.match(/(\d+)\s*courts?/i);
      if (courtMatch) proposedCourts = parseInt(courtMatch[1], 10);
      else if (lower.includes('12')) proposedCourts = 12;
      else if (lower.includes('16')) proposedCourts = 16;
      else if (lower.includes('6')) proposedCourts = 6;

      const isDinkBattle = lower.includes('dink battle');
      const isDupr = lower.includes('dupr');
      const feeMatch = text.match(/\$(\d+)/);
      const proposedFee = feeMatch ? parseInt(feeMatch[1], 10) : isDinkBattle ? 50 : 75;

      const proposedTitle = isDinkBattle
        ? `${proposedCity.split(',')[0]} Dink Battle Pilot Slam`
        : isDupr
        ? `${proposedCity.split(',')[0]} DUPR Open Championship`
        : `${proposedCity.split(',')[0]} Pickleball Classic 2026`;

      const proposedSlug = proposedTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const proposedJoinCode = `D-${Math.floor(1000 + Math.random() * 9000)}`;

      const proposal: Partial<TournamentEvent> = {
        id: `tourn-${Date.now().toString().slice(-5)}`,
        name: proposedTitle,
        slug: proposedSlug,
        joinCode: proposedJoinCode,
        dates: 'Sat Jun 13 - Sun Jun 14, 2026',
        venue: `${proposedCity.split(',')[0]} Premier Pickleball Center`,
        city: proposedCity.split(',')[0],
        state: proposedCity.split(',')[1]?.trim() || 'TX',
        status: 'Draft',
        totalCourts: proposedCourts,
        courtSurface: isDinkBattle ? 'Dedicated Sport Court Modular Tile' : 'Outdoor Acrylic Hardcourt (PPA Standard)',
        ballType: 'Franklin X-40 (Outdoor Yellow)',
        tournamentFormat: isDinkBattle
          ? 'Dink Battle Pilot (Court shrinks after 5th shot)'
          : 'Round Robin Pools to Single Elimination Playoffs',
        divisionsCount: isDinkBattle ? 2 : 4,
        registeredCount: 0,
        maxCapacity: proposedCourts * 8,
        revenue: 0,
      };

      const replyText = `I have drafted **${proposedTitle}** in **${proposedCity}** with **${proposedCourts} competition courts**.\n\n• **Format**: ${proposal.tournamentFormat}\n• **Divisions**: ${
        isDinkBattle
          ? "Dink Battle Open ($50/player) & Dink Battle Mixed ($50/player)"
          : `Men's 3.5 ($${proposedFee}/player), Mixed 3.5 ($${proposedFee}/player), Men's 4.0+ ($${proposedFee}/player), Women's Open ($${proposedFee}/player)`
      }\n• **Estimated Capacity**: ${proposedCourts * 8} players\n• **Balls**: Franklin X-40\n\nWould you like to review this as a Draft, or publish it directly to start accepting player registrations?`;

      setCopilotHistory([
        ...newHistory,
        {
          sender: 'copilot',
          text: replyText,
          proposal,
        },
      ]);
    }, 700);
  };

  const handleApplyCopilotProposal = (proposal: Partial<TournamentEvent>, publishDirectly: boolean = false) => {
    const finalEvent: TournamentEvent = {
      id: proposal.id || `tourn-${Date.now().toString().slice(-5)}`,
      name: proposal.name || 'New Pickleball Tournament',
      slug: proposal.slug || 'new-tournament',
      joinCode: proposal.joinCode || `D-${Math.floor(1000 + Math.random() * 9000)}`,
      dates: proposal.dates || 'Sat Jun 13 - Sun Jun 14, 2026',
      venue: proposal.venue || 'Premier Pickleball Center',
      city: proposal.city || 'Austin',
      state: proposal.state || 'TX',
      status: publishDirectly ? 'Published' : 'Draft',
      requireWaiver: true,
      seedByDupr: true,
      totalCourts: proposal.totalCourts || 8,
      courtSurface: proposal.courtSurface || 'Outdoor Acrylic Hardcourt (PPA Standard)',
      ballType: proposal.ballType || 'Franklin X-40 (Outdoor Yellow)',
      tournamentFormat: proposal.tournamentFormat || 'Round Robin Pools to Single Elimination Playoffs',
      divisionsCount: proposal.divisionsCount || 4,
      registeredCount: 0,
      maxCapacity: (proposal.totalCourts || 8) * 8,
      revenue: 0,
    };

    onCreateTournament(finalEvent);
    setShowCreateModal(false);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const joinCode = `D-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTournament: TournamentEvent = {
      id: `tourn-${Date.now().toString().slice(-5)}`,
      name: name.trim(),
      slug,
      joinCode,
      dates: dates.trim() || 'Dates TBD',
      venue: venue.trim() || 'Venue TBD',
      city: city.trim() || 'Austin',
      state: 'TX',
      status: 'Draft',
      requireWaiver: true,
      seedByDupr: true,
      totalCourts: Math.max(1, totalCourts),
      courtSurface,
      ballType,
      tournamentFormat: 'Round Robin Pools to Single Elimination Playoffs',
      divisionsCount: 0,
      registeredCount: 0,
      maxCapacity: totalCourts * 8,
      revenue: 0,
    };

    onCreateTournament(newTournament);
    setShowCreateModal(false);
    setName('');
    setCity('');
    setDates('');
    setVenue('');
  };

  const copyCode = (code: string, id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCodeId(id);
      setTimeout(() => setCopiedCodeId(null), 2500);
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. TOP HEADER CARD */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
              Organizer Operations Fleet
            </span>
            <span className="text-[11px] text-gray-500 font-medium">
              Multi-Tournament Management
            </span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Tournaments Fleet & Events Directory
          </h1>
          <p className="text-xs text-gray-600 mt-0.5 max-w-2xl">
            Manage your entire portfolio of pickleball tournaments across ongoing live events, upcoming registrations, drafts, and past archives.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          {/* Quick Return to Live Tournament Desk (if a live event exists) */}
          {liveTournament && (
            <button
              type="button"
              onClick={() => onSelectTournament(liveTournament.id)}
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Go to Live: {liveTournament.name.split(' ')[0]}</span>
              <ArrowRight size={13} />
            </button>
          )}

          {canManageFleet && (
            <button
              type="button"
              onClick={() => {
                setCreateMode('copilot');
                setShowCreateModal(true);
              }}
              className="px-3.5 py-2 bg-[#0A5C43] hover:bg-[#084734] text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-2"
            >
              <Plus size={15} />
              <span>Create New Tournament</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. FILTER & SEARCH BAR (Positioned directly below the top card, above KPIs) */}
      <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-gray-900 text-white font-bold'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            All Tournaments ({dynamicStats.totalCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Live')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'Live'
                ? 'bg-emerald-700 text-white font-bold'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Now ({dynamicStats.liveCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Published')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'Published'
                ? 'bg-blue-700 text-white font-bold'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200'
            }`}
          >
            <span>Upcoming / Open ({dynamicStats.upcomingCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Draft')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              statusFilter === 'Draft'
                ? 'bg-amber-600 text-white font-bold'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
            }`}
          >
            Drafts ({dynamicStats.draftsCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Concluded')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              statusFilter === 'Concluded'
                ? 'bg-gray-700 text-white font-bold'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            Past / Concluded ({dynamicStats.concludedCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by event or venue..."
            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-[#0A5C43]"
          />
        </div>
      </div>

      {/* 3. DYNAMIC INTERACTIVE KPI METRIC CARDS (Clickable for Actor Breakdown!) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Tournament Events Count */}
        <div
          onClick={() => setActiveKpiModal('tournaments')}
          className="bg-white p-4 rounded-xl border border-gray-200 hover:border-[#0A5C43] hover:shadow-md transition cursor-pointer shadow-xs group"
          title="Click to view detailed Tournaments breakdown"
        >
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-semibold text-gray-500 uppercase block">
              {statusFilter === 'all'
                ? 'Total Tournaments'
                : statusFilter === 'Live'
                ? 'Live Tournaments'
                : statusFilter === 'Published'
                ? 'Upcoming Tournaments'
                : statusFilter === 'Draft'
                ? 'Draft Setups'
                : 'Past Tournaments'}
            </span>
            <span className="text-[10px] text-[#0A5C43] font-bold opacity-0 group-hover:opacity-100 transition flex items-center gap-0.5">
              Breakdown &rarr;
            </span>
          </div>
          <div className="text-xl font-bold text-gray-900 my-1 group-hover:text-[#0A5C43] transition">
            {dynamicStats.poolCount} {dynamicStats.poolCount === 1 ? 'Event' : 'Events'}
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-1.5">
            {statusFilter === 'all' ? (
              <>
                <span className="text-emerald-700 font-semibold">{dynamicStats.liveCount} Live</span>
                <span>&bull;</span>
                <span className="text-blue-700 font-semibold">{dynamicStats.upcomingCount} Upcoming</span>
              </>
            ) : statusFilter === 'Live' ? (
              <span className="text-emerald-700 font-semibold">Live match scoring in progress</span>
            ) : statusFilter === 'Published' ? (
              <span className="text-blue-700 font-semibold">Active registration portals open</span>
            ) : statusFilter === 'Draft' ? (
              <span className="text-amber-700 font-semibold">In setup & court contracting</span>
            ) : (
              <span className="text-gray-600 font-semibold">Archived final standings</span>
            )}
          </div>
        </div>

        {/* Card 2: Players Metric */}
        <div
          onClick={() => setActiveKpiModal('players')}
          className="bg-white p-4 rounded-xl border border-gray-200 hover:border-[#0A5C43] hover:shadow-md transition cursor-pointer shadow-xs group"
          title="Click to view detailed Players breakdown"
        >
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-semibold text-gray-500 uppercase block">
              {statusFilter === 'all'
                ? 'Total Players'
                : statusFilter === 'Live'
                ? 'Active Live Players'
                : statusFilter === 'Published'
                ? 'Registered Players'
                : statusFilter === 'Draft'
                ? 'Planned Capacity'
                : 'Completed Entries'}
            </span>
            <span className="text-[10px] text-[#0A5C43] font-bold opacity-0 group-hover:opacity-100 transition flex items-center gap-0.5">
              Breakdown &rarr;
            </span>
          </div>
          <div className="text-xl font-bold text-gray-900 my-1 group-hover:text-[#0A5C43] transition">
            {dynamicStats.poolPlayers} Players
          </div>
          <div className="text-xs text-gray-500">
            {statusFilter === 'Live'
              ? 'On courts and in pool brackets'
              : statusFilter === 'Published'
              ? 'Confirmed registrations'
              : statusFilter === 'Draft'
              ? 'Projected player roster cap'
              : 'Total participant count'}
          </div>
        </div>

        {/* Card 3: Revenue Metric (Founder & Director) OR Operational Readiness (Marshall & Volunteer) */}
        {canViewFinancials ? (
          <div
            onClick={() => setActiveKpiModal('revenue')}
            className="bg-white p-4 rounded-xl border border-gray-200 hover:border-[#0A5C43] hover:shadow-md transition cursor-pointer shadow-xs group"
            title="Click to view financial breakdown & platform fees"
          >
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-semibold text-gray-500 uppercase block">
                {statusFilter === 'all'
                  ? 'Gross Revenue'
                  : statusFilter === 'Live'
                  ? 'Live Event Revenue'
                  : statusFilter === 'Published'
                  ? 'Upcoming Collections'
                  : statusFilter === 'Draft'
                  ? 'Projected Revenue'
                  : 'Historical Revenue'}
              </span>
              <span className="text-[10px] text-[#0A5C43] font-bold opacity-0 group-hover:opacity-100 transition flex items-center gap-0.5">
                Breakdown &rarr;
              </span>
            </div>
            <div className="text-xl font-bold text-[#0A5C43] my-1">
              ${dynamicStats.poolRev.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">
              {statusFilter === 'all'
                ? 'Across all portfolio events'
                : statusFilter === 'Live'
                ? '100% collected entry fees'
                : 'Entry fee gross tracking'}
            </div>
          </div>
        ) : (
          <div
            onClick={() => setActiveKpiModal('courts')}
            className="bg-white p-4 rounded-xl border border-gray-200 hover:border-[#0A5C43] hover:shadow-md transition cursor-pointer shadow-xs group"
            title="Click to view court utilization and match readiness"
          >
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-semibold text-gray-500 uppercase block">
                Operational Courts
              </span>
              <span className="text-[10px] text-[#0A5C43] font-bold opacity-0 group-hover:opacity-100 transition flex items-center gap-0.5">
                Courts &rarr;
              </span>
            </div>
            <div className="text-xl font-bold text-gray-900 my-1">
              {dynamicStats.poolCourts} Competition Courts
            </div>
            <div className="text-xs text-emerald-700 font-semibold">
              {dynamicStats.liveCount > 0
                ? `${dynamicStats.liveCount} Events Live with Active Match Dispatch`
                : 'Court assignment & referee dispatch ready'}
            </div>
          </div>
        )}

        {/* Card 4: Competition Courts Metric */}
        <div
          onClick={() => setActiveKpiModal('courts')}
          className="bg-white p-4 rounded-xl border border-gray-200 hover:border-[#0A5C43] hover:shadow-md transition cursor-pointer shadow-xs group"
          title="Click to view court surface & venue allocations"
        >
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-semibold text-gray-500 uppercase block">
              {statusFilter === 'all'
                ? 'Competition Courts'
                : statusFilter === 'Live'
                ? 'Active Live Courts'
                : statusFilter === 'Published'
                ? 'Reserved Courts'
                : statusFilter === 'Draft'
                ? 'Allocated Courts'
                : 'Utilized Courts'}
            </span>
            <span className="text-[10px] text-[#0A5C43] font-bold opacity-0 group-hover:opacity-100 transition flex items-center gap-0.5">
              Breakdown &rarr;
            </span>
          </div>
          <div className="text-xl font-bold text-gray-900 my-1 group-hover:text-[#0A5C43] transition">
            {dynamicStats.poolCourts} Courts
          </div>
          <div className="text-xs text-gray-500">
            {statusFilter === 'Live'
              ? 'Under active desk management'
              : 'Across facility contracts'}
          </div>
        </div>
      </div>

      {/* 4. TOURNAMENTS GRID - ENTIRE TILE IS DIRECTLY CLICKABLE! */}
      <div className="space-y-3">
        {filteredTournaments.length === 0 ? (
          <div className="py-12 bg-white rounded-xl border border-gray-200 text-center">
            <p className="text-gray-500 text-xs font-medium">No tournaments match your current filter.</p>
            <button
              type="button"
              onClick={() => {
                setStatusFilter('all');
                setSearchQuery('');
              }}
              className="mt-2 text-xs font-semibold text-[#0A5C43] hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          filteredTournaments.map((t) => {
            const isLive = t.status === 'Live';
            const isUpcoming = t.status === 'Published';
            const isDraft = t.status === 'Draft';
            const isConcluded = t.status === 'Concluded';

            return (
              <div
                key={t.id}
                onClick={() => onSelectTournament(t.id)}
                className={`bg-white rounded-xl border transition shadow-xs hover:border-[#0A5C43] hover:shadow-md cursor-pointer p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 group ${
                  isLive ? 'border-emerald-400 ring-1 ring-emerald-500/20 bg-emerald-50/20' : 'border-gray-200'
                }`}
              >
                {/* Event Overview Info */}
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                        isLive
                          ? 'bg-emerald-100 text-emerald-800'
                          : isUpcoming
                          ? 'bg-blue-100 text-blue-800'
                          : isDraft
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {isLive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                      {isLive ? 'LIVE NOW' : isUpcoming ? 'REGISTRATION OPEN' : isDraft ? 'DRAFT SETUP' : 'CONCLUDED'}
                    </span>

                    <span className="text-[11px] text-gray-500">
                      Join Code: <strong className="font-mono text-gray-800">{t.joinCode}</strong>
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyCode(t.joinCode, t.id);
                      }}
                      className="text-[11px] text-gray-500 hover:text-gray-800"
                      title="Copy Join Code"
                    >
                      {copiedCodeId === t.id ? <Check size={12} className="text-emerald-600 inline" /> : <Copy size={12} className="inline" />}
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 group-hover:text-[#0A5C43] transition flex items-center gap-2">
                    <span>{t.name}</span>
                    <ChevronRight size={15} className="text-gray-400 opacity-0 group-hover:opacity-100 transition" />
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={13} className="text-gray-400" />
                      {t.dates}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-gray-400" />
                      {t.venue}
                    </span>
                    <span className="flex items-center gap-1">
                      <Layers size={13} className="text-gray-400" />
                      {t.totalCourts} Courts ({t.courtSurface || 'Acrylic'})
                    </span>
                  </div>
                </div>

                {/* Event Capacity & Revenue Metrics */}
                <div className="flex items-center gap-5 border-t lg:border-t-0 pt-3 lg:pt-0">
                  <div className="text-left lg:text-right">
                    <span className="text-[10px] uppercase font-semibold text-gray-400 block">Roster & Capacity</span>
                    <span className="text-xs font-bold text-gray-800">
                      {t.registeredCount || 0} / {t.maxCapacity || 64} Players
                    </span>
                    <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-[#0A5C43]"
                        style={{ width: `${Math.min(100, (((t.registeredCount || 0) / (t.maxCapacity || 64)) * 100))}%` }}
                      />
                    </div>
                  </div>

                  {canViewFinancials ? (
                    <div className="text-left lg:text-right">
                      <span className="text-[10px] uppercase font-semibold text-gray-400 block">Revenue</span>
                      <span className="text-xs font-bold text-[#0A5C43]">
                        ${(t.revenue || 0).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-gray-400 block">{t.divisionsCount || 3} Divisions</span>
                    </div>
                  ) : (
                    <div className="text-left lg:text-right">
                      <span className="text-[10px] uppercase font-semibold text-gray-400 block">Competition Setup</span>
                      <span className="text-xs font-bold text-gray-800">
                        {t.divisionsCount || 3} Divisions
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold block">{t.totalCourts || 8} Match Courts</span>
                    </div>
                  )}

                  {/* Actions Dropdown / Quick Links */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/t/${t.slug}`}
                      target="_blank"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 transition"
                      title="Open Public Player Registration Portal"
                    >
                      <ExternalLink size={14} />
                    </Link>

                    {isLive && (
                      <Link
                        href="/tv"
                        target="_blank"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 transition"
                        title="Open TV Jumbotron Scoreboard"
                      >
                        <Tv size={14} />
                      </Link>
                    )}

                    <button
                      type="button"
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1.5 pointer-events-none ${
                        isLive
                          ? 'bg-[#0A5C43] text-white font-bold'
                          : 'bg-gray-900 text-white'
                      }`}
                    >
                      <span>{isLive ? 'Open Live Desk' : 'Open Workspace'}</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. INTERACTIVE KPI BREAKDOWN MODAL */}
      {activeKpiModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center border-b pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className="text-[#0A5C43]" />
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {activeKpiModal === 'tournaments' && 'Tournaments Fleet Breakdown'}
                    {activeKpiModal === 'players' && 'Player Participation & Roster Breakdown'}
                    {activeKpiModal === 'revenue' && 'Financial Ledger & Revenue Breakdown'}
                    {activeKpiModal === 'courts' && 'Court Allocations & Surface Breakdown'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Detailed metric analytics for {statusFilter === 'all' ? 'All Tournaments' : `${statusFilter} Tournaments`}.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveKpiModal(null)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 text-xs">
              {activeKpiModal === 'tournaments' && (
                <div className="space-y-2">
                  {dynamicStats.targetPool.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => {
                        setActiveKpiModal(null);
                        onSelectTournament(t.id);
                      }}
                      className="p-3 bg-gray-50 hover:bg-emerald-50/60 rounded-xl border border-gray-200 flex justify-between items-center cursor-pointer transition"
                    >
                      <div>
                        <div className="font-bold text-gray-900">{t.name}</div>
                        <div className="text-gray-500 text-[11px]">
                          {t.dates} &bull; {t.venue} ({t.city}, {t.state})
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.status === 'Live' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-800'
                        }`}>
                          {t.status}
                        </span>
                        <span className="text-[#0A5C43] font-semibold text-xs">Open &rarr;</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeKpiModal === 'players' && (
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex justify-between">
                    <span>Total Participants in Selection:</span>
                    <strong>{dynamicStats.poolPlayers} Players</strong>
                  </div>
                  {dynamicStats.targetPool.map((t) => (
                    <div key={t.id} className="p-3 bg-white rounded-xl border border-gray-200 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-900">{t.name}</span>
                        <span className="font-mono text-gray-600 text-xs">
                          {t.registeredCount || 0} / {t.maxCapacity || 64} ({Math.round(((t.registeredCount || 0) / (t.maxCapacity || 64)) * 100)}% filled)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#0A5C43]"
                          style={{ width: `${Math.min(100, (((t.registeredCount || 0) / (t.maxCapacity || 64)) * 100))}%` }}
                        />
                      </div>
                      <div className="text-[11px] text-gray-500 flex justify-between">
                        <span>{t.divisionsCount || 3} Divisions Open</span>
                        <span>Estimated Team Capacity: {(t.totalCourts || 8) * 4} Teams</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeKpiModal === 'revenue' && canViewFinancials && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-emerald-800 block">Gross Invoiced</span>
                      <strong className="text-base text-emerald-950">${dynamicStats.poolRev.toLocaleString()}</strong>
                    </div>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-gray-500 block">10% Platform Cut</span>
                      <strong className="text-base text-gray-900">${Math.round(dynamicStats.poolRev * 0.1).toLocaleString()}</strong>
                    </div>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-gray-500 block">Director Net</span>
                      <strong className="text-base text-gray-900">${Math.round(dynamicStats.poolRev * 0.9).toLocaleString()}</strong>
                    </div>
                  </div>
                  {dynamicStats.targetPool.map((t) => (
                    <div key={t.id} className="p-3 bg-white rounded-xl border border-gray-200 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-gray-900">{t.name}</div>
                        <div className="text-gray-500 text-[11px]">{t.status} &bull; {t.registeredCount || 0} Paid Registrations</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[#0A5C43] text-sm">${(t.revenue || 0).toLocaleString()}</div>
                        <div className="text-[10px] text-gray-400">Stripe Connect: Settled</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeKpiModal === 'courts' && (
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 flex justify-between">
                    <span>Active Competition Courts Across Facilities:</span>
                    <strong>{dynamicStats.poolCourts} Courts</strong>
                  </div>
                  {dynamicStats.targetPool.map((t) => (
                    <div key={t.id} className="p-3 bg-white rounded-xl border border-gray-200 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-gray-900">{t.name}</div>
                        <div className="text-gray-500 text-[11px]">{t.venue}</div>
                        <div className="text-[11px] text-gray-600 mt-0.5">Surface: {t.courtSurface || 'Acrylic Hardcourt'}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900 text-sm">{t.totalCourts} Courts</div>
                        <div className="text-[10px] text-emerald-700 font-semibold">{t.ballType || 'Franklin X-40'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. CREATE NEW TOURNAMENT MODAL (Supports AI Copilot or Manual Setup!) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 space-y-4 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b pb-3 shrink-0">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <span>Create New Tournament</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                    Organizer Suite
                  </span>
                </h3>
                <p className="text-xs text-gray-500">
                  Launch a new tournament workspace with Copilot AI or configure manually.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl text-xs font-semibold shrink-0">
              <button
                type="button"
                onClick={() => setCreateMode('copilot')}
                className={`py-2 rounded-lg flex items-center justify-center gap-2 transition ${
                  createMode === 'copilot'
                    ? 'bg-white text-[#0A5C43] font-bold shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Sparkles size={15} className="text-[#EF9F27]" />
                <span>Create with AI Copilot (Fast & Smart)</span>
              </button>
              <button
                type="button"
                onClick={() => setCreateMode('manual')}
                className={`py-2 rounded-lg flex items-center justify-center gap-2 transition ${
                  createMode === 'manual'
                    ? 'bg-white text-gray-900 font-bold shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Layers size={15} />
                <span>Manual Setup (Standard Form)</span>
              </button>
            </div>

            {/* TAB CONTENT: COPILOT AI ARCHITECT */}
            {createMode === 'copilot' ? (
              <div className="flex flex-col flex-1 overflow-hidden space-y-3">
                {/* Copilot Chat / Conversation Box */}
                <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                  {copilotHistory.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.sender === 'copilot' && (
                        <div className="w-6 h-6 rounded-full bg-[#0A5C43] text-white flex items-center justify-center shrink-0 mt-0.5">
                          <Bot size={13} />
                        </div>
                      )}
                      <div
                        className={`max-w-[85%] p-3 rounded-xl leading-relaxed whitespace-pre-wrap ${
                          msg.sender === 'user'
                            ? 'bg-[#0A5C43] text-white font-medium'
                            : 'bg-white border border-gray-200 text-gray-800 shadow-2xs'
                        }`}
                      >
                        {msg.text}

                        {/* If Copilot produced an actionable tournament proposal */}
                        {msg.proposal && (
                          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={() => handleApplyCopilotProposal(msg.proposal!, false)}
                              className="px-3 py-1.5 bg-gray-900 hover:bg-black text-white rounded-lg font-semibold text-xs transition"
                            >
                              Draft Tournament & Open Workspace
                            </button>
                            <button
                              type="button"
                              onClick={() => handleApplyCopilotProposal(msg.proposal!, true)}
                              className="px-3 py-1.5 bg-[#0A5C43] hover:bg-[#084734] text-white rounded-lg font-semibold text-xs transition flex items-center gap-1.5"
                            >
                              <Zap size={12} className="text-[#EF9F27]" />
                              <span>Create & Publish Live</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {isCopilotThinking && (
                    <div className="flex items-center gap-2 text-gray-500 italic text-xs">
                      <Sparkles size={14} className="animate-spin text-[#EF9F27]" />
                      <span>Copilot is structuring tournament rules, schedule and divisions...</span>
                    </div>
                  )}
                </div>

                {/* Quick Suggestion Prompts */}
                <div className="space-y-1 shrink-0">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">
                    Quick AI Suggestions (Click to generate)
                  </span>
                  <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
                    <button
                      type="button"
                      onClick={() =>
                        handleCopilotSend('Dallas weekend open tournament, 12 courts, $75 fee, DUPR sanctioned')
                      }
                      className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 whitespace-nowrap transition"
                    >
                      Dallas Weekend Open (12 Courts, $75)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopilotSend('Austin Dink Battle pilot tournament, 6 courts, $50 fee, fast court shrink rule')
                      }
                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg whitespace-nowrap transition"
                    >
                      Dink Battle Pilot (6 Courts, $50)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopilotSend('Houston 50+ Senior Classic, round robin pools to playoffs, 8 courts')
                      }
                      className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 whitespace-nowrap transition"
                    >
                      Senior 50+ Classic (8 Courts)
                    </button>
                  </div>
                </div>

                {/* Copilot Input Field */}
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="text"
                    value={copilotInput}
                    onChange={(e) => setCopilotInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCopilotSend()}
                    placeholder="Describe your event (e.g. city, dates, court count, fees, sanctioning)..."
                    className="flex-1 bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#0A5C43]"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopilotSend()}
                    className="px-4 py-2 bg-[#0A5C43] hover:bg-[#084734] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <span>Ask</span>
                    <Send size={13} />
                  </button>
                </div>
              </div>
            ) : (
              /* TAB CONTENT: MANUAL SETUP FORM */
              <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs overflow-y-auto">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Tournament Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dallas DUPR Summer Classic 2026"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#0A5C43]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Event Dates</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sat Jun 20 - Sun Jun 21, 2026"
                      value={dates}
                      onChange={(e) => setDates(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Host City & State</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dallas, TX"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Venue Facility</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cole Park Pickleball Center"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Active Courts Count</label>
                    <input
                      type="number"
                      min={1}
                      max={32}
                      value={totalCourts}
                      onChange={(e) => setTotalCourts(parseInt(e.target.value, 10) || 8)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 font-bold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Court Surface</label>
                    <select
                      value={courtSurface}
                      onChange={(e) => setCourtSurface(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-2 text-xs text-gray-900 focus:outline-none"
                    >
                      <option>Outdoor Acrylic Hardcourt (PPA Standard)</option>
                      <option>Indoor Cushioned Acrylic Hardcourt</option>
                      <option>Dedicated Sport Court Modular Tile</option>
                      <option>Indoor Polyurethane Wood Floor</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-3.5 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0A5C43] hover:bg-[#084734] text-white rounded-lg font-semibold shadow-xs"
                  >
                    Create Tournament
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
