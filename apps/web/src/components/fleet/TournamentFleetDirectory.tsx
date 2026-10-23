'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { TournamentEvent, Division, UserActorProfile, Sponsor } from '../../types/organizer';
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
  Crown,
  Briefcase,
  Globe,
  Smartphone,
  Award,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { SponsorsManagementHub } from '../sponsors/SponsorsManagementHub';
import { ExecutiveAnalyticsHub } from '../analytics/ExecutiveAnalyticsHub';

interface TournamentFleetDirectoryProps {
  tournaments: TournamentEvent[];
  sponsors?: Sponsor[];
  divisions?: Division[];
  activeTournamentId?: string | null;
  onSelectTournament: (tournamentId: string) => void;
  onCreateTournament: (newEvent: TournamentEvent) => void;
  onAddSponsor?: (newSponsor: Sponsor) => void;
  onUpdateSponsor?: (index: number, updated: Sponsor) => void;
  onDeleteSponsor?: (index: number) => void;
  onAssignCourt?: (sponsorIndex: number, courtNumber: number | null) => void;
  actorProfile?: UserActorProfile;
  onOpenAnalytics?: () => void;
  onAskCopilot?: (prompt: string) => void;
  initialHub?: 'events' | 'sponsors' | 'analytics' | 'facilities';
}

export const TournamentFleetDirectory: React.FC<TournamentFleetDirectoryProps> = ({
  tournaments,
  sponsors = [],
  divisions = [],
  activeTournamentId,
  onSelectTournament,
  onCreateTournament,
  onAddSponsor,
  onUpdateSponsor,
  onDeleteSponsor,
  onAssignCourt,
  actorProfile,
  onOpenAnalytics,
  onAskCopilot,
  initialHub = 'events',
}) => {
  const canViewFinancials = actorProfile ? actorProfile.permissions.canViewFinancials : true;
  const canManageFleet = actorProfile ? actorProfile.permissions.canManageFleet : true;
  const canManageGlobalSponsors = actorProfile ? actorProfile.permissions.canManageGlobalSponsors : true;

  // Active Multi-Hub Tab State ('events' | 'sponsors' | 'analytics' | 'facilities')
  const [activeHub, setActiveHub] = useState<'events' | 'sponsors' | 'analytics' | 'facilities'>(initialHub);

  const sponsorsList = sponsors || [];
  const [showSponsorsManager, setShowSponsorsManager] = useState(false);
  const [sponsorTabFilter, setSponsorTabFilter] = useState<'all' | 'global' | 'event'>('all');

  const totalSponsorRev = useMemo(() => {
    return sponsorsList.reduce((acc, s) => acc + (s.amountPaid || 0), 0);
  }, [sponsorsList]);

  const globalSponsors = useMemo(() => {
    return sponsorsList.filter((s) => s.scope === 'global');
  }, [sponsorsList]);

  const eventSponsors = useMemo(() => {
    return sponsorsList.filter((s) => s.scope !== 'global');
  }, [sponsorsList]);

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

    // Combined Gross Revenue (Tournaments Revenue + Sponsorships if viewing all/portfolio)
    const combinedGrossRev = statusFilter === 'all' ? totalRev + totalSponsorRev : totalRev;

    return {
      poolCount: count,
      poolRev: totalRev,
      combinedGrossRev,
      poolPlayers: totalPlayers,
      poolCourts: totalCourtsCount,
      liveCount,
      upcomingCount,
      draftsCount,
      concludedCount,
      totalCount: tournaments.length,
      targetPool,
    };
  }, [tournaments, statusFilter, totalSponsorRev]);

  // Texas Facilities & Venue Footprint derived dynamically from tournaments fleet
  const facilitiesList = useMemo(() => {
    const map = new Map<
      string,
      {
        venue: string;
        city: string;
        state: string;
        courts: number;
        surface: string;
        ball: string;
        tournaments: TournamentEvent[];
      }
    >();

    tournaments.forEach((t) => {
      const key = t.venue || `${t.city} Center`;
      if (!map.has(key)) {
        map.set(key, {
          venue: t.venue,
          city: t.city || 'Texas',
          state: t.state || 'TX',
          courts: t.totalCourts || 8,
          surface: t.courtSurface || 'Outdoor Acrylic Hardcourt (PPA Standard)',
          ball: t.ballType || 'Franklin X-40',
          tournaments: [t],
        });
      } else {
        const existing = map.get(key)!;
        existing.courts = Math.max(existing.courts, t.totalCourts || 8);
        existing.tournaments.push(t);
      }
    });

    return Array.from(map.values());
  }, [tournaments]);

  const totalFacilitiesCourts = useMemo(() => {
    return facilitiesList.reduce((acc, f) => acc + f.courts, 0);
  }, [facilitiesList]);

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
      {/* 0. FOUNDER & OWNER EXECUTIVE IDENTITY & PORTFOLIO BANNER */}
      {actorProfile?.role === 'founder' && (
        <div className="bg-gradient-to-br from-slate-950 via-[#0a2016] to-[#0A5C43] text-white p-5 rounded-2xl border border-amber-400/30 shadow-md relative overflow-hidden">
          {/* Subtle decorative glow */}
          <div className="absolute -right-16 -top-16 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-56 h-56 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            {/* Left: Founder Profile & Identity */}
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-sm ring-2 ring-amber-400/50">
                  {actorProfile.avatarInitials || 'AJ'}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                      <span>{actorProfile.name}</span>
                      <Crown size={15} className="text-amber-400" />
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      Head / Founder (Unrestricted)
                    </span>
                  </div>
                  <p className="text-xs text-emerald-200/80 font-mono">
                    {actorProfile.email} &bull; Dinkster Platform Owner & Operator
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed">
                Welcome to your Founder Operations Hub. You have unrestricted oversight across all <strong>{tournaments.length} Texas tournaments</strong>, active facility contracts, and the <strong>${totalSponsorRev.toLocaleString()} corporate sponsorship book</strong>.
              </p>

              {/* Founder Privileges & Scope Badges */}
              <div className="flex items-center gap-2 flex-wrap text-[11px] pt-1">
                <button
                  type="button"
                  onClick={() => setActiveHub('events')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-300 border border-white/10 font-medium transition cursor-pointer"
                  title="View Tournaments & Events Hub"
                >
                  <ShieldCheck size={12} className="text-emerald-400" />
                  <span>Unrestricted Fleet Control</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveHub('facilities')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-amber-300 border border-white/10 font-medium transition cursor-pointer"
                  title="View Texas Facilities & Operations Hub"
                >
                  <Building2 size={12} className="text-amber-400" />
                  <span>Texas Footprint: Austin, Dallas, Houston, San Antonio</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveHub('sponsors')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-blue-300 border border-white/10 font-medium transition cursor-pointer"
                  title="View Sponsors & Commercial Hub"
                >
                  <Globe size={12} className="text-blue-400" />
                  <span>Global Title Partner: JOOLA ($15,000/yr)</span>
                </button>
              </div>
            </div>

            {/* Right: Founder Portfolio Snapshot & Action Center */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3 shrink-0">
              <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
                <div className="bg-white/10 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-white/10 text-left">
                  <span className="text-[10px] uppercase font-bold text-amber-300 block">Total Portfolio Gross</span>
                  <span className="text-base font-extrabold text-white font-mono">
                    ${(dynamicStats.poolRev + totalSponsorRev).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-emerald-300 block">Entry Fees + Sponsors</span>
                </div>

                <div className="bg-white/10 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-white/10 text-left">
                  <span className="text-[10px] uppercase font-bold text-emerald-300 block">Commercial Sponsors</span>
                  <span className="text-base font-extrabold text-white font-mono">
                    ${totalSponsorRev.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-gray-300 block">{sponsorsList.length} Active Partners</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setActiveHub('sponsors')}
                  className={`px-3.5 py-1.5 font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs ${
                    activeHub === 'sponsors'
                      ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  }`}
                >
                  <Briefcase size={13} />
                  <span>Sponsors Hub</span>
                </button>

                {canViewFinancials && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveHub('analytics');
                      if (onOpenAnalytics) onOpenAnalytics();
                    }}
                    className={`px-3.5 py-1.5 font-semibold rounded-xl text-xs transition flex items-center gap-1.5 border ${
                      activeHub === 'analytics'
                        ? 'bg-white text-slate-950 border-white'
                        : 'bg-white/15 hover:bg-white/25 text-white border-white/20'
                    }`}
                  >
                    <BarChart3 size={13} className={activeHub === 'analytics' ? 'text-blue-600' : 'text-blue-300'} />
                    <span>Executive Analytics</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setActiveHub('facilities')}
                  className={`px-3.5 py-1.5 font-semibold rounded-xl text-xs transition flex items-center gap-1.5 border ${
                    activeHub === 'facilities'
                      ? 'bg-emerald-400 text-slate-950 border-emerald-300'
                      : 'bg-white/15 hover:bg-white/25 text-white border-white/20'
                  }`}
                >
                  <Building2 size={13} className={activeHub === 'facilities' ? 'text-slate-950' : 'text-emerald-300'} />
                  <span>Facilities Hub</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MULTI-HUB HORIZONTAL SWITCHER (APPLE/TESLA SEGMENTED PILL BAR) */}
      <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between gap-3 overflow-x-auto [scrollbar-width:none]">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Hub 1: Tournaments & Events */}
          <button
            type="button"
            onClick={() => setActiveHub('events')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeHub === 'events'
                ? 'bg-gray-900 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Trophy size={16} className={activeHub === 'events' ? 'text-emerald-400' : 'text-gray-400'} />
            <span>Tournaments & Events Hub</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeHub === 'events' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {tournaments.length}
            </span>
          </button>

          {/* Hub 2: Sponsors & Commercial */}
          <button
            type="button"
            onClick={() => setActiveHub('sponsors')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeHub === 'sponsors'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Briefcase size={16} className={activeHub === 'sponsors' ? 'text-slate-950' : 'text-amber-500'} />
            <span>Sponsors & Commercial Hub</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeHub === 'sponsors' ? 'bg-slate-950/20 text-slate-950' : 'bg-amber-100 text-amber-900'
              }`}
            >
              {sponsorsList.length}
            </span>
          </button>

          {/* Hub 3: Executive Analytics */}
          {canViewFinancials && (
            <button
              type="button"
              onClick={() => setActiveHub('analytics')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${
                activeHub === 'analytics'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <BarChart3 size={16} className={activeHub === 'analytics' ? 'text-white' : 'text-blue-600'} />
              <span>Executive Analytics Hub</span>
            </button>
          )}

          {/* Hub 4: Facilities & Operations */}
          <button
            type="button"
            onClick={() => setActiveHub('facilities')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeHub === 'facilities'
                ? 'bg-[#0A5C43] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Building2 size={16} className={activeHub === 'facilities' ? 'text-emerald-300' : 'text-emerald-700'} />
            <span>Facilities & Operations Hub</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeHub === 'facilities' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {facilitiesList.length}
            </span>
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-2 pr-3 text-xs text-gray-500 font-medium shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Texas Operations Network</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* HUB 1: TOURNAMENTS & EVENTS HUB */}
      {/* ============================================================== */}
      {activeHub === 'events' && (
        <div className="space-y-4">
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

          {canViewFinancials && onOpenAnalytics && (
            <button
              type="button"
              onClick={onOpenAnalytics}
              className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
              title="Launch Executive Analytics Dashboard"
            >
              <BarChart3 size={14} className="text-blue-700" />
              <span>Executive Analytics</span>
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
                  ? 'Total Portfolio Gross'
                  : statusFilter === 'Live'
                  ? 'Live Event Revenue'
                  : statusFilter === 'Published'
                  ? 'Upcoming Collections'
                  : statusFilter === 'Draft'
                  ? 'Projected Revenue'
                  : 'Historical Revenue'}
              </span>
              <span className="text-[10px] text-[#0A5C43] font-bold opacity-0 group-hover:opacity-100 transition flex items-center gap-0.5">
                Ledger &rarr;
              </span>
            </div>
            <div className="text-xl font-bold text-[#0A5C43] my-1">
              ${(statusFilter === 'all' ? dynamicStats.combinedGrossRev : dynamicStats.poolRev).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">
              {statusFilter === 'all'
                ? `$${dynamicStats.poolRev.toLocaleString()} Entries • $${totalSponsorRev.toLocaleString()} Sponsors`
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
    </div>
  )}

  {/* ============================================================== */}
  {/* HUB 2: SPONSORS & COMMERCIAL HUB */}
  {/* ============================================================== */}
  {activeHub === 'sponsors' && (
    <div className="space-y-4">
      {/* Sponsors Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-200">
              Commercial Partnerships Hub
            </span>
            <span className="text-[11px] text-gray-500 font-medium">
              Fleet-Wide & Event Level
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span>Corporate Sponsors & Commercial Partnerships Hub</span>
            <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full font-semibold">
              {sponsorsList.length} Active Partners
            </span>
          </h2>
          <p className="text-xs text-gray-600 mt-0.5 max-w-2xl">
            Multi-tournament global title presenting partners, court naming rights, and event commercial sponsors active across the Dinkster platform.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => setShowSponsorsManager(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center gap-2 shadow-xs"
          >
            <Briefcase size={14} />
            <span>Manage Fleet Partnerships</span>
          </button>
        </div>
      </div>

      {/* Commercial KPI Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase block">
            Total Contract Book
          </span>
          <div className="text-xl font-bold text-[#0A5C43] my-1 font-mono">
            ${totalSponsorRev.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">
            100% Invoiced & Contracted
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase block">
            Active Brand Partners
          </span>
          <div className="text-xl font-bold text-gray-900 my-1 font-mono">
            {sponsorsList.length} Partners
          </div>
          <div className="text-xs text-gray-500">
            {globalSponsors.length} Global &bull; {eventSponsors.length} Event-Specific
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase block">
            Court Naming Rights
          </span>
          <div className="text-xl font-bold text-emerald-800 my-1 font-mono">
            {sponsorsList.filter((s) => s.courtAssigned).length} Courts Branded
          </div>
          <div className="text-xs text-emerald-700 font-semibold">
            Baseline Signage Deployed
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase block">
            Global Title Partner
          </span>
          <div className="text-xl font-bold text-amber-900 my-1">
            JOOLA
          </div>
          <div className="text-xs text-amber-700 font-semibold">
            $15,000 / Year Headline Deal
          </div>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-gray-200 shadow-xs flex-wrap">
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setSponsorTabFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              sponsorTabFilter === 'all'
                ? 'bg-gray-900 text-white font-bold shadow-xs'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            All Partners ({sponsorsList.length})
          </button>
          <button
            type="button"
            onClick={() => setSponsorTabFilter('global')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              sponsorTabFilter === 'global'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
            }`}
          >
            Global Fleet Partners ({globalSponsors.length})
          </button>
          <button
            type="button"
            onClick={() => setSponsorTabFilter('event')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              sponsorTabFilter === 'event'
                ? 'bg-emerald-700 text-white font-bold shadow-xs'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}
          >
            Event Specific ({eventSponsors.length})
          </button>
        </div>

        <span className="text-xs text-gray-500">
          Showing {(sponsorTabFilter === 'global' ? globalSponsors : sponsorTabFilter === 'event' ? eventSponsors : sponsorsList).length} Partners
        </span>
      </div>

      {/* FEATURED: GLOBAL TITLE PRESENTING PARTNER (JOOLA) */}
      {globalSponsors.length > 0 && (sponsorTabFilter === 'all' || sponsorTabFilter === 'global') && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500 text-slate-950 tracking-wider">
                ★ Global Title Presenting Partner
              </span>
              <span className="text-xs font-semibold text-amber-900">
                Multi-Tournament Annual Agreement
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-lg font-extrabold text-gray-950">
                {globalSponsors[0].name}
              </h3>
              {canViewFinancials && (
                <span className="text-sm font-mono font-bold text-[#0A5C43]">
                  ${(globalSponsors[0].amountPaid || 15000).toLocaleString()} / Year
                </span>
              )}
            </div>
            <p className="text-xs text-gray-700 max-w-2xl">
              {globalSponsors[0].assetDescription || 'Headline logo across all Dinkster tournament portals, jumbo TV broadcasts, and official balls.'}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-gray-600 flex-wrap pt-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-medium">
                <Tv size={12} /> Jumbo TV Broadcast
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-medium">
                <Globe size={12} /> Player Portal Banner
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-medium">
                <Layers size={12} /> Baseline Court Banners
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-medium">
                <Smartphone size={12} /> Mobile App Shoutout
              </span>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            {globalSponsors[0].websiteUrl && (
              <a
                href={globalSponsors[0].websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl border border-amber-400 bg-white hover:bg-amber-50 text-amber-950 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
              >
                <span>Visit Official Site</span>
                <ExternalLink size={13} />
              </a>
            )}
          </div>
        </div>
      )}

      {/* SPONSORS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {(sponsorTabFilter === 'global' ? globalSponsors : sponsorTabFilter === 'event' ? eventSponsors : sponsorsList).map((s, idx) => {
          if (sponsorTabFilter === 'all' && s.scope === 'global') return null; // already featured on top
          return (
            <div
              key={s.id || idx}
              className="p-4 bg-white hover:bg-gray-50/50 rounded-2xl border border-gray-200 hover:border-gray-300 transition shadow-xs space-y-2.5 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                    s.scope === 'global' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {s.tier}
                  </span>
                  <h4 className="font-bold text-gray-900 text-sm mt-1.5 group-hover:text-[#0A5C43] transition">
                    {s.name}
                  </h4>
                </div>
                {canViewFinancials && (
                  <span className="font-mono text-sm font-extrabold text-[#0A5C43]">
                    ${(s.amountPaid || 0).toLocaleString()}
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-500 line-clamp-2">
                {s.assetDescription || s.categoryLabel || 'Official Tournament Commercial Partner'}
              </p>

              <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 text-[11px] text-gray-400">
                <span className="font-medium text-gray-600">
                  {s.categoryLabel || (s.scope === 'global' ? 'Fleet Partner' : 'Event Partner')}
                </span>
                {s.courtAssigned && (
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                    Court {s.courtAssigned} Naming
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Action Callout Card */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900">Commercial Partnerships Administration</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Add new sponsors, allocate court naming rights, manage contract amounts, and configure tier-based benefits.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowSponsorsManager(true)}
          className="px-4 py-2 bg-[#0A5C43] hover:bg-[#084734] text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-2 shrink-0"
        >
          <Briefcase size={14} />
          <span>Open Partnerships Manager</span>
        </button>
      </div>
    </div>
  )}

  {/* ============================================================== */}
  {/* HUB 3: EXECUTIVE ANALYTICS HUB */}
  {/* ============================================================== */}
  {activeHub === 'analytics' && (
    <div className="space-y-4">
      {canViewFinancials ? (
        <ExecutiveAnalyticsHub
          tournaments={tournaments}
          sponsors={sponsorsList}
          divisions={divisions}
          selectedTournamentId={null}
          actorProfile={actorProfile}
          onSelectTournament={onSelectTournament}
          onAskCopilot={onAskCopilot}
        />
      ) : (
        <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center space-y-3">
          <ShieldCheck size={36} className="text-amber-500 mx-auto" />
          <h3 className="text-base font-bold text-gray-900">Restricted Executive View</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Executive Financial Analytics and ledger audits are reserved for Dinkster Platform Founders and Tournament Directors.
          </p>
        </div>
      )}
    </div>
  )}

  {/* ============================================================== */}
  {/* HUB 4: FACILITIES & OPERATIONS HUB */}
  {/* ============================================================== */}
  {activeHub === 'facilities' && (
    <div className="space-y-4">
      {/* Facilities Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Operations & Facilities Network
            </span>
            <span className="text-[11px] text-gray-500 font-medium">
              Texas State Footprint
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span>Texas Facilities & Venue Operations Hub</span>
            <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full font-semibold">
              {facilitiesList.length} Contracted Venues
            </span>
          </h2>
          <p className="text-xs text-gray-600 mt-0.5 max-w-2xl">
            Audit contracted pickleball facilities, court surface specifications, official tournament ball standards, and multi-venue operational readiness across Austin, Dallas, Houston, and San Antonio.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => setActiveKpiModal('courts')}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs"
          >
            <Layers size={14} className="text-emerald-700" />
            <span>Court Allocation Audit</span>
          </button>

          {canManageFleet && (
            <button
              type="button"
              onClick={() => {
                setCreateMode('manual');
                setShowCreateModal(true);
              }}
              className="px-3.5 py-2 bg-[#0A5C43] hover:bg-[#084734] text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-2"
            >
              <Plus size={15} />
              <span>Add Facility Event</span>
            </button>
          )}
        </div>
      </div>

      {/* Operational KPI Metric Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase block">
            Contracted Venues
          </span>
          <div className="text-xl font-bold text-gray-900 my-1">
            {facilitiesList.length} Texas Venues
          </div>
          <div className="text-xs text-gray-500">
            Austin, Dallas, Houston, San Antonio
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase block">
            Total Competition Courts
          </span>
          <div className="text-xl font-bold text-emerald-800 my-1 font-mono">
            {totalFacilitiesCourts} Active Courts
          </div>
          <div className="text-xs text-emerald-700 font-semibold">
            Available for Tournament Scheduling
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase block">
            Certified Surface Standards
          </span>
          <div className="text-xl font-bold text-gray-900 my-1">
            100% PPA Certified
          </div>
          <div className="text-xs text-gray-500">
            Acrylic Hardcourt & Sport Tile
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase block">
            Official Ball Standard
          </span>
          <div className="text-xl font-bold text-amber-900 my-1">
            Franklin X-40
          </div>
          <div className="text-xs text-gray-500">
            USAP Approved Tournament Balls
          </div>
        </div>
      </div>

      {/* Facilities Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {facilitiesList.map((fac, idx) => (
          <div
            key={idx}
            className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:border-[#0A5C43] transition space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-800 uppercase tracking-wider">
                    {fac.city}, {fac.state}
                  </span>
                  <span className="text-[11px] text-emerald-700 font-semibold">
                    {fac.courts} Competition Courts
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-900 mt-1">
                  {fac.venue}
                </h3>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                <Building2 size={20} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Court Surface</span>
                <span className="font-semibold text-gray-800 mt-0.5 block">{fac.surface}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Match Ball</span>
                <span className="font-semibold text-gray-800 mt-0.5 block">{fac.ball}</span>
              </div>
            </div>

            {/* Associated Tournaments Hosted at this Facility */}
            <div className="border-t pt-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] font-bold text-gray-500 uppercase">
                  Tournaments Hosted ({fac.tournaments.length})
                </span>
              </div>

              <div className="space-y-1.5">
                {fac.tournaments.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => onSelectTournament(t.id)}
                    className="p-2.5 rounded-xl bg-gray-50 hover:bg-emerald-50/70 border border-gray-200 flex items-center justify-between transition cursor-pointer group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-bold text-gray-900 group-hover:text-[#0A5C43] transition truncate text-xs">
                        {t.name}
                      </div>
                      <div className="text-[11px] text-gray-500 truncate">
                        {t.dates} &bull; {t.registeredCount || 0} Registered
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.status === 'Live'
                            ? 'bg-emerald-100 text-emerald-800'
                            : t.status === 'Published'
                            ? 'bg-blue-100 text-blue-800'
                            : t.status === 'Draft'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {t.status === 'Live' ? 'LIVE NOW' : t.status}
                      </span>
                      <ChevronRight size={14} className="text-gray-400 group-hover:text-[#0A5C43] transition" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Technical Specifications & Equipment Standards */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <div className="border-b pb-3">
          <h3 className="text-base font-bold text-gray-900">
            Official Dinkster Technical & Equipment Specifications
          </h3>
          <p className="text-xs text-gray-500">
            All Texas venues must conform to USAP regulation standards for court geometry, surface friction, and tournament ball tolerances.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
            <span className="font-bold text-gray-900 block">Court Dimensions</span>
            <span className="text-gray-600 block">20&apos; x 44&apos; playing boundaries with 7&apos; Non-Volley Zone (Kitchen). Minimum 5&apos; side buffer.</span>
          </div>
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
            <span className="font-bold text-gray-900 block">Net Height & Tension</span>
            <span className="text-gray-600 block">36&quot; height at net posts, 34&quot; center strap height. Steel cable with tension adjusters.</span>
          </div>
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
            <span className="font-bold text-gray-900 block">Official Ball Specs</span>
            <span className="text-gray-600 block">Franklin X-40 (40 precision holes, 2.9&quot; diameter, 0.92 oz). Tested for 30-34&quot; bounce at 75°F.</span>
          </div>
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
            <span className="font-bold text-gray-900 block">Lighting & Camera Standards</span>
            <span className="text-gray-600 block">Minimum 750 Lux LED uniform distribution with dual baseline 4K optical broadcast mounts.</span>
          </div>
        </div>
      </div>
    </div>
  )}

      {/* 6. INTERACTIVE KPI BREAKDOWN MODAL */}
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
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-emerald-800 block">Total Portfolio Gross</span>
                      <strong className="text-base text-emerald-950 font-mono">${dynamicStats.combinedGrossRev.toLocaleString()}</strong>
                    </div>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-gray-500 block">Player Registrations</span>
                      <strong className="text-base text-gray-900 font-mono">${dynamicStats.poolRev.toLocaleString()}</strong>
                    </div>
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-amber-800 block">Corporate Sponsors</span>
                      <strong className="text-base text-amber-900 font-mono">${totalSponsorRev.toLocaleString()}</strong>
                    </div>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-gray-500 block">10% Platform Cut</span>
                      <strong className="text-base text-gray-900 font-mono">${Math.round(dynamicStats.combinedGrossRev * 0.1).toLocaleString()}</strong>
                    </div>
                  </div>

                  {/* Corporate & Fleet Sponsors Invoices */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-gray-800">
                      <span>Corporate Sponsorship Contracts ({sponsorsList.length} Partners)</span>
                      <span className="text-[#0A5C43] font-mono">${totalSponsorRev.toLocaleString()}</span>
                    </div>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {sponsorsList.map((s) => (
                        <div key={s.id || s.name} className="p-2.5 bg-amber-50/40 rounded-xl border border-amber-200/60 flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              s.scope === 'global' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {s.scope === 'global' ? 'Global Fleet' : 'Event Partner'}
                            </span>
                            <div>
                              <span className="font-bold text-gray-900">{s.name}</span>
                              <span className="text-gray-500 text-[11px] block">{s.categoryLabel || s.tier}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-[#0A5C43] font-mono">${(s.amountPaid || 0).toLocaleString()}</span>
                            <span className="text-[10px] text-gray-400 block">{s.scope === 'global' ? 'Annual Contract' : 'Single Event'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tournament Entry Fee Invoices */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-gray-800">
                      <span>Tournament Entry Fee Gross ({dynamicStats.targetPool.length} Events)</span>
                      <span className="text-[#0A5C43] font-mono">${dynamicStats.poolRev.toLocaleString()}</span>
                    </div>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {dynamicStats.targetPool.map((t) => (
                        <div key={t.id} className="p-2.5 bg-white rounded-xl border border-gray-200 flex justify-between items-center text-xs">
                          <div>
                            <div className="font-bold text-gray-900">{t.name}</div>
                            <div className="text-gray-500 text-[11px]">{t.status} &bull; {t.registeredCount || 0} Paid Registrations</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-[#0A5C43] font-mono">${(t.revenue || 0).toLocaleString()}</div>
                            <div className="text-[10px] text-gray-400">Stripe Connect: Settled</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
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

      {/* 7. CORPORATE & FLEET SPONSORS MANAGEMENT MODAL */}
      {showSponsorsManager && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-5xl w-full p-6 shadow-2xl border border-gray-200 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b pb-3 shrink-0">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <span>Corporate & Fleet Partnerships Manager</span>
                  <span className="text-[10px] bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded-full">
                    Executive Suite
                  </span>
                </h3>
                <p className="text-xs text-gray-500">
                  Manage multi-tournament title partners, court baseline agreements, and division sponsors across your fleet.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSponsorsManager(false)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <SponsorsManagementHub
                sponsors={sponsorsList}
                totalCourts={dynamicStats.poolCourts || 8}
                onAddSponsor={(newSponsor) => {
                  if (onAddSponsor) onAddSponsor(newSponsor);
                }}
                onUpdateSponsor={(index, updated) => {
                  if (onUpdateSponsor) onUpdateSponsor(index, updated);
                }}
                onDeleteSponsor={(index) => {
                  if (onDeleteSponsor) onDeleteSponsor(index);
                }}
                onAssignCourt={onAssignCourt}
                canViewFinancials={canViewFinancials}
                canManageSponsors={canManageGlobalSponsors}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
