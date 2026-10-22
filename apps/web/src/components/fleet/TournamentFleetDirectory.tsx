'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { TournamentEvent } from '../../types/organizer';
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
} from 'lucide-react';

interface TournamentFleetDirectoryProps {
  tournaments: TournamentEvent[];
  onSelectTournament: (tournamentId: string) => void;
  onCreateTournament: (newEvent: TournamentEvent) => void;
}

export const TournamentFleetDirectory: React.FC<TournamentFleetDirectoryProps> = ({
  tournaments,
  onSelectTournament,
  onCreateTournament,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'Live' | 'Published' | 'Draft' | 'Concluded'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Form State for + Create Tournament
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [dates, setDates] = useState('');
  const [venue, setVenue] = useState('');
  const [totalCourts, setTotalCourts] = useState<number>(8);
  const [courtSurface, setCourtSurface] = useState('Outdoor Acrylic Hardcourt (PPA Standard)');
  const [ballType, setBallType] = useState('Franklin X-40 (Outdoor Yellow)');

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

  // Overall Fleet Statistics
  const stats = useMemo(() => {
    const live = tournaments.filter((t) => t.status === 'Live').length;
    const upcoming = tournaments.filter((t) => t.status === 'Published').length;
    const drafts = tournaments.filter((t) => t.status === 'Draft').length;
    const concluded = tournaments.filter((t) => t.status === 'Concluded').length;
    const totalRev = tournaments.reduce((acc, t) => acc + (t.revenue || 0), 0);
    const totalPlayers = tournaments.reduce((acc, t) => acc + (t.registeredCount || 0), 0);
    const totalCourtsCount = tournaments.reduce((acc, t) => acc + (t.totalCourts || 0), 0);

    return {
      total: tournaments.length,
      live,
      upcoming,
      drafts,
      concluded,
      totalRev,
      totalPlayers,
      totalCourtsCount,
    };
  }, [tournaments]);

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
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
              Organizer Operations Fleet
            </span>
            <span className="text-xs text-gray-500 font-medium">
              Multi-Tournament Management
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Tournaments Fleet & Events Directory
          </h1>
          <p className="text-xs md:text-sm text-gray-600 mt-1 max-w-2xl leading-relaxed">
            Manage your entire portfolio of pickleball tournaments across ongoing live events, upcoming registrations, drafts, and past archives.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-[#0A5C43] hover:bg-[#084734] text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-2 self-start md:self-auto"
        >
          <Plus size={16} />
          <span>Create New Tournament</span>
        </button>
      </div>

      {/* Fleet KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-semibold text-gray-500 uppercase block">Total Tournaments</span>
          <div className="text-2xl font-bold text-gray-900 my-1">{stats.total} Events</div>
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <span className="text-emerald-700 font-semibold">{stats.live} Live Now</span>
            <span>&bull;</span>
            <span className="text-blue-700 font-semibold">{stats.upcoming} Upcoming</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-semibold text-gray-500 uppercase block">Fleet Players</span>
          <div className="text-2xl font-bold text-gray-900 my-1">{stats.totalPlayers} Registered</div>
          <div className="text-xs text-gray-500">Across all active & upcoming brackets</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-semibold text-gray-500 uppercase block">Total Revenue</span>
          <div className="text-2xl font-bold text-[#0A5C43] my-1">${stats.totalRev.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Gross entry fee collections</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-semibold text-gray-500 uppercase block">Competition Courts</span>
          <div className="text-2xl font-bold text-gray-900 my-1">{stats.totalCourtsCount} Courts</div>
          <div className="text-xs text-gray-500">Across all venue contracts</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
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
            All Tournaments ({stats.total})
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
            <span>Live Now ({stats.live})</span>
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
            <span>Upcoming / Open ({stats.upcoming})</span>
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
            Drafts ({stats.drafts})
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
            Past / Concluded ({stats.concluded})
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

      {/* Tournaments Grid */}
      <div className="space-y-3.5">
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
                className={`bg-white rounded-xl border transition shadow-xs hover:border-[#0A5C43] p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                  isLive ? 'border-emerald-300 ring-1 ring-emerald-500/20' : 'border-gray-200'
                }`}
              >
                {/* Event Overview Info */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 ${
                        isLive
                          ? 'bg-emerald-100 text-emerald-800 font-bold'
                          : isUpcoming
                          ? 'bg-blue-100 text-blue-800 font-bold'
                          : isDraft
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {isLive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                      {isLive ? 'LIVE NOW' : isUpcoming ? 'REGISTRATION OPEN' : isDraft ? 'DRAFT SETUP' : 'CONCLUDED'}
                    </span>

                    <span className="text-xs text-gray-500">
                      Join Code: <strong className="font-mono text-gray-800">{t.joinCode}</strong>
                    </span>

                    <button
                      type="button"
                      onClick={() => copyCode(t.joinCode, t.id)}
                      className="text-[11px] text-gray-500 hover:text-gray-800"
                      title="Copy Join Code"
                    >
                      {copiedCodeId === t.id ? <Check size={12} className="text-emerald-600 inline" /> : <Copy size={12} className="inline" />}
                    </button>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900">
                    {t.name}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
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
                <div className="flex items-center gap-6 border-t lg:border-t-0 pt-3 lg:pt-0">
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

                  <div className="text-left lg:text-right">
                    <span className="text-[10px] uppercase font-semibold text-gray-400 block">Revenue</span>
                    <span className="text-sm font-bold text-[#0A5C43]">
                      ${(t.revenue || 0).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-gray-400 block">{t.divisionsCount || 3} Divisions</span>
                  </div>

                  {/* Actions Dropdown / Quick Links */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/t/${t.slug}`}
                      target="_blank"
                      className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 transition"
                      title="Open Public Web Registration Portal"
                    >
                      <ExternalLink size={15} />
                    </Link>

                    {isLive && (
                      <Link
                        href="/tv"
                        target="_blank"
                        className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 transition"
                        title="Open TV Jumbotron Scoreboard"
                      >
                        <Tv size={15} />
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => onSelectTournament(t.id)}
                      className="px-3.5 py-2 bg-[#0A5C43] hover:bg-[#084734] text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
                    >
                      <span>Manage Event</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CREATE NEW TOURNAMENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">Create New Tournament</h3>
                <p className="text-xs text-gray-500">Add a new event to your organization fleet.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Tournament Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dallas DUPR Summer Classic 2026"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#0A5C43]"
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
          </div>
        </div>
      )}
    </div>
  );
};
