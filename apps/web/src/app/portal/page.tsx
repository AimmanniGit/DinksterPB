'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Calendar,
  MapPin,
  Users,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  CreditCard,
  Medal,
  Share2,
  Info,
  KeyRound,
  User,
  LogIn,
  LogOut,
  Smartphone,
  Flame,
  Check,
  Clock,
  ChevronRight,
  Edit2,
  Save,
  X,
  ExternalLink,
  Copy,
  AlertCircle,
  Zap,
  Search,
  Filter,
  Activity,
  Layers,
  ChevronDown,
  ChevronUp,
  Award,
  Plus,
  QrCode,
  ArrowUpRight,
  Sliders,
  CheckCircle,
} from 'lucide-react';
import {
  INITIAL_EVENT,
  INITIAL_TOURNAMENT_FLEET,
  INITIAL_DIVISIONS,
  DEFAULT_PLAYER_ACCOUNT,
  DEMO_PARTNER_ACCOUNT,
} from '../../constants/initialState';
import { PlayerAccount, TournamentEvent, PastDivisionRecord } from '../../types/organizer';

export default function PlayerPortalHomePage() {
  // Session State
  const [signedInPlayer, setSignedInPlayer] = useState<PlayerAccount>(DEFAULT_PLAYER_ACCOUNT);
  const [tournaments] = useState<TournamentEvent[]>(INITIAL_TOURNAMENT_FLEET);

  // Active Tab: 'my-tournaments' | 'recommended' | 'results' | 'find-tournaments' | 'mobile-companion'
  const [activeTab, setActiveTab] = useState<
    'my-tournaments' | 'recommended' | 'results' | 'find-tournaments' | 'mobile-companion'
  >('my-tournaments');

  // Modals & Dialogs
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedCodeSuccess, setCopiedCodeSuccess] = useState<string | null>(null);

  // Profile Edit Form State
  const [editFullName, setEditFullName] = useState(signedInPlayer.fullName);
  const [editPhone, setEditPhone] = useState(signedInPlayer.phone);
  const [editAge, setEditAge] = useState(String(signedInPlayer.age || 34));
  const [editEmergencyPhone, setEditEmergencyPhone] = useState(signedInPlayer.emergencyPhone || '');
  const [editDuprId, setEditDuprId] = useState(signedInPlayer.duprId || '');

  // Sign In Dialog Input
  const [signInInput, setSignInInput] = useState('');

  // Tournament Explorer Filters
  const [cityFilter, setCityFilter] = useState<'All' | 'Austin' | 'Dallas' | 'Houston' | 'San Antonio'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Expandable match breakdown for past events
  const [expandedPastEvent, setExpandedPastEvent] = useState<string | null>(
    signedInPlayer.pastDivisions?.[0]?.tournamentSlug || null
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Restore session from localStorage if present
  useEffect(() => {
    try {
      const stored = localStorage.getItem('dinkster_player_session');
      if (stored) {
        const parsed = JSON.parse(stored);
        setSignedInPlayer((prev) => ({
          ...prev,
          ...parsed,
          pastDivisions: prev.pastDivisions,
          careerStats: prev.careerStats,
        }));
        setEditFullName(parsed.fullName || DEFAULT_PLAYER_ACCOUNT.fullName);
        setEditPhone(parsed.phone || DEFAULT_PLAYER_ACCOUNT.phone);
        setEditAge(String(parsed.age || DEFAULT_PLAYER_ACCOUNT.age || 34));
        setEditEmergencyPhone(parsed.emergencyPhone || DEFAULT_PLAYER_ACCOUNT.emergencyPhone || '');
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleCopyCode = (code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCodeSuccess(code);
      showToast(`Copied ${code} to clipboard!`);
      setTimeout(() => setCopiedCodeSuccess(null), 2500);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: PlayerAccount = {
      ...signedInPlayer,
      fullName: editFullName.trim() || signedInPlayer.fullName,
      phone: editPhone.trim() || signedInPlayer.phone,
      age: parseInt(editAge, 10) || signedInPlayer.age,
      emergencyPhone: editEmergencyPhone.trim() || signedInPlayer.emergencyPhone,
      duprId: editDuprId.trim() || signedInPlayer.duprId,
    };
    setSignedInPlayer(updated);
    setShowEditProfileModal(false);
    try {
      localStorage.setItem('dinkster_player_session', JSON.stringify(updated));
    } catch (e) {}
    showToast('Player profile saved successfully.');
  };

  const handleSwitchToDemo = (account: PlayerAccount) => {
    setSignedInPlayer(account);
    setEditFullName(account.fullName);
    setEditPhone(account.phone);
    setEditAge(String(account.age || 30));
    setEditEmergencyPhone(account.emergencyPhone || '');
    try {
      localStorage.setItem('dinkster_player_session', JSON.stringify(account));
    } catch (e) {}
    setShowSignInModal(false);
    showToast(`Switched active player account to ${account.fullName} (${account.dinksterId})`);
  };

  const handleSignOut = () => {
    try {
      localStorage.removeItem('dinkster_player_session');
    } catch (e) {}
    showToast('Signed out of Dinkster Player Portal.');
  };

  // Filtered Tournaments for the Explorer Tab
  const filteredTournaments = useMemo(() => {
    return tournaments.filter((t) => {
      const matchCity = cityFilter === 'All' || t.city === cityFilter || t.venue.includes(cityFilter);
      const matchSearch =
        !searchQuery.trim() ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.city && t.city.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCity && matchSearch;
    });
  }, [tournaments, cityFilter, searchQuery]);

  // Recommended Divisions based on player DUPR (3.82)
  const recommendedDivisions = useMemo(() => {
    const rating = signedInPlayer.duprRating || 3.82;
    const registeredSlugs = signedInPlayer.registeredDivisions.map((rd) => rd.tournamentSlug);

    return [
      {
        tournamentName: 'Austin Winter Open 2026',
        tournamentSlug: 'austin-winter-open-2026',
        divisionTitle: 'Dink Battle Pilot Slam (Court Shrink)',
        dates: 'Sunday Nov 8, 2026',
        venue: 'Austin Tennis & Pickleball Center',
        fee: 50,
        skillLabel: 'All DUPR Open Pilot (Fast Play)',
        matchReason: 'Exciting fast-paced pilot format: court shrinks to half-court after 5th shot!',
        spotsLeft: 4,
        isPilot: true,
      },
      {
        tournamentName: 'Houston DUPR Grand Prix 2026',
        tournamentSlug: 'houston-dupr-grand-prix-2026',
        divisionTitle: "Mixed Doubles 3.5 to 4.0",
        dates: 'Sat Apr 11 - Sun Apr 12, 2026',
        venue: 'Memorial Park Tennis & Pickleball Center, Houston, TX',
        fee: 60,
        skillLabel: 'DUPR 3.5 - 4.0 Bracket',
        matchReason: `98% Skill Match for your verified ${rating.toFixed(2)} DUPR rating.`,
        spotsLeft: 8,
        isPilot: false,
      },
      {
        tournamentName: 'Hill Country Summer Classic 2026',
        tournamentSlug: 'hill-country-summer-classic-2026',
        divisionTitle: "Open 3.5 Division",
        dates: 'Sat Jun 13 - Sun Jun 14, 2026',
        venue: 'Chicken N Pickle, San Antonio, TX',
        fee: 65,
        skillLabel: 'DUPR 3.5+ Sanctioned',
        matchReason: 'San Antonio premier venue with dedicated modular sport court tiles.',
        spotsLeft: 12,
        isPilot: false,
      },
    ];
  }, [signedInPlayer]);

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-gray-900 font-sans flex flex-col antialiased selection:bg-[#0A5C43] selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0E2A20] text-white px-4 py-2.5 rounded-xl shadow-lg border border-white/20 flex items-center gap-2.5 animate-bounce text-xs font-semibold">
          <CheckCircle2 size={16} className="text-[#5DCAA5]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. TOP HEADER NAVIGATION BAR */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 sm:px-6 py-2.5 transition">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Brand + Contextual Hub Title */}
          <div className="flex items-center gap-3">
            <Link href="/portal" className="flex items-center shrink-0">
              <span className="font-extrabold text-xl tracking-tight text-[#0A5C43]">
                dink<span className="text-[#EF9F27]">ster</span>
              </span>
            </Link>

            <span className="text-gray-300 font-normal shrink-0">/</span>

            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                Player Portal
              </span>
              <span className="hidden sm:inline text-xs text-gray-500 font-medium">
                Tournaments, Matches & DUPR
              </span>
            </div>
          </div>

          {/* Right: Quick Links & Active Player Session */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Link to Organizer / Tournament Director Host Suite */}
            <Link
              href="/"
              className="text-xs font-semibold text-gray-600 hover:text-[#0A5C43] transition hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-gray-100"
              title="Switch to Dinkster Host / Organizer Operations Suite"
            >
              <span>Host & Organizer Suite</span>
              <ArrowRight size={13} />
            </Link>

            <div className="h-4 w-[1px] bg-gray-200 hidden lg:block" />

            {/* Active Signed-In Player Pill */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowEditProfileModal(true)}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-2xs"
                title="View & Edit Player Profile"
              >
                <div className="w-5 h-5 rounded-full bg-[#0A5C43] text-white flex items-center justify-center text-[10px] font-black">
                  {signedInPlayer.fullName.split(' ').map((n) => n[0]).join('')}
                </div>
                <span>{signedInPlayer.fullName}</span>
                <span className="font-mono text-[10px] bg-white px-1.5 py-0.2 rounded border border-emerald-300 text-emerald-800 font-bold">
                  {signedInPlayer.dinksterId}
                </span>
                <span className="hidden md:inline px-1.5 py-0.2 rounded text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                  {signedInPlayer.duprRating?.toFixed(2)} DUPR
                </span>
              </button>

              <button
                type="button"
                onClick={() => setShowSignInModal(true)}
                className="p-1.5 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition text-xs font-semibold"
                title="Switch Player Account or Sign Out"
              >
                <User size={15} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. PLAYER PROFILE IDENTITY & DUPR HERO BANNER */}
      {/* ============================================================== */}
      <section className="bg-gradient-to-br from-[#0a2016] via-[#0E3D2F] to-[#0A5C43] text-white px-4 sm:px-6 py-6 border-b border-emerald-800/40 relative overflow-hidden">
        {/* Decorative soft glow */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Player Persona & Badges */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xl sm:text-2xl shadow-md ring-4 ring-white/10 shrink-0">
              {signedInPlayer.fullName.split(' ').map((n) => n[0]).join('')}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>{signedInPlayer.fullName}</span>
                  <CheckCircle2 size={18} className="text-emerald-400" />
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                  Verified Player
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-white/15 text-emerald-200 border border-white/20 font-bold">
                  {signedInPlayer.dinksterId}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-emerald-200/90 flex-wrap">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={13} className="text-amber-400" />
                  <span>DUPR ID: <strong className="text-white font-mono">{signedInPlayer.duprId || '2B48A'}</strong></span>
                </span>
                <span>&bull;</span>
                <span>{signedInPlayer.email}</span>
                <span>&bull;</span>
                <span>Age: {signedInPlayer.age || 34}</span>
              </div>

              {/* Ecosystem Callout: Web + Mobile unification */}
              <div className="flex items-center gap-2 pt-1 text-[11px] text-gray-300 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 text-emerald-300 border border-white/10">
                  <Smartphone size={12} className="text-emerald-400" />
                  <span>Unified Sign-in: Same DK-ID powers Dinkster Mobile on court</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  className="text-amber-300 hover:text-amber-200 font-semibold underline flex items-center gap-1"
                >
                  <QrCode size={12} />
                  <span>View Digital Pass</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Quick Performance Snapshot */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-black/25 backdrop-blur-xs p-3 rounded-2xl border border-white/10 shrink-0">
            <div className="p-2.5 text-center">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">DUPR Rating</span>
              <span className="text-lg font-black text-amber-300 font-mono">
                {signedInPlayer.duprRating?.toFixed(2) || '3.82'}
              </span>
              <span className="text-[10px] text-emerald-400 block font-semibold">+0.14 this season</span>
            </div>

            <div className="p-2.5 text-center">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Win Rate</span>
              <span className="text-lg font-black text-white font-mono">
                {signedInPlayer.careerStats?.winRate || 68}%
              </span>
              <span className="text-[10px] text-gray-400 block">
                {signedInPlayer.careerStats?.matchesWon || 26}W - {((signedInPlayer.careerStats?.matchesPlayed || 38) - (signedInPlayer.careerStats?.matchesWon || 26))}L
              </span>
            </div>

            <div className="p-2.5 text-center">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Matches</span>
              <span className="text-lg font-black text-white font-mono">
                {signedInPlayer.careerStats?.matchesPlayed || 38}
              </span>
              <span className="text-[10px] text-gray-400 block">Texas Tournaments</span>
            </div>

            <div className="p-2.5 text-center">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Podium Medals</span>
              <span className="text-sm font-black text-white flex items-center justify-center gap-1 mt-1">
                <span>🥇 {signedInPlayer.careerStats?.golds || 2}</span>
                <span>🥈 {signedInPlayer.careerStats?.silvers || 1}</span>
                <span>🥉 {signedInPlayer.careerStats?.bronzes || 3}</span>
              </span>
              <span className="text-[10px] text-amber-300 block font-semibold">6 Podiums</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. HORIZONTAL SEGMENTED NAVIGATION TABS */}
      {/* ============================================================== */}
      <nav className="bg-white border-b border-gray-200 sticky top-[53px] z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between overflow-x-auto [scrollbar-width:none]">
          <div className="flex items-center space-x-1 sm:space-x-2 py-2">
            <button
              type="button"
              onClick={() => setActiveTab('my-tournaments')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'my-tournaments'
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Trophy size={15} className={activeTab === 'my-tournaments' ? 'text-emerald-400' : 'text-gray-400'} />
              <span>My Active & Upcoming Events</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  activeTab === 'my-tournaments' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {signedInPlayer.registeredDivisions.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('recommended')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'recommended'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Sparkles size={15} className={activeTab === 'recommended' ? 'text-slate-950' : 'text-amber-500'} />
              <span>Recommended For You</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  activeTab === 'recommended' ? 'bg-slate-950/20 text-slate-950' : 'bg-amber-100 text-amber-900'
                }`}
              >
                {recommendedDivisions.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('results')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'results'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Medal size={15} className={activeTab === 'results' ? 'text-white' : 'text-blue-600'} />
              <span>Past Divisions & Results</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  activeTab === 'results' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'
                }`}
              >
                {signedInPlayer.pastDivisions?.length || 2}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('find-tournaments')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'find-tournaments'
                  ? 'bg-[#0A5C43] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Search size={15} className={activeTab === 'find-tournaments' ? 'text-emerald-300' : 'text-emerald-700'} />
              <span>Find Tournaments</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('mobile-companion')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'mobile-companion'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Smartphone size={15} className={activeTab === 'mobile-companion' ? 'text-emerald-400' : 'text-gray-400'} />
              <span>Mobile App Live Companion</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ============================================================== */}
      {/* 4. MAIN CONTENT CONTAINER */}
      {/* ============================================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1 space-y-6">
        {/* ============================================================ */}
        {/* TAB 1: MY ACTIVE & UPCOMING DIVISIONS */}
        {/* ============================================================ */}
        {activeTab === 'my-tournaments' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <div>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded uppercase">
                  Player Schedule & Roster
                </span>
                <h2 className="text-xl font-bold text-gray-900 mt-1">
                  My Registered Tournaments & Divisions
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  View check-in status, court assignments, partner invite codes, and upcoming scheduled matches.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('recommended')}
                  className="px-3.5 py-2 bg-[#0A5C43] hover:bg-[#084734] text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Join Another Division</span>
                </button>
              </div>
            </div>

            {signedInPlayer.registeredDivisions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3">
                <Trophy size={36} className="text-gray-300 mx-auto" />
                <h3 className="text-base font-bold text-gray-900">No active registrations yet</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  You are not currently registered for any upcoming pickleball divisions. Browse Texas tournaments and register!
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('find-tournaments')}
                  className="px-4 py-2 bg-[#0A5C43] text-white rounded-xl text-xs font-semibold"
                >
                  Browse Available Tournaments
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {signedInPlayer.registeredDivisions.map((reg, idx) => {
                  const isLiveEvent = reg.tournamentSlug === 'austin-winter-open-2026';

                  return (
                    <div
                      key={idx}
                      className={`bg-white rounded-2xl p-5 border transition shadow-xs space-y-4 ${
                        isLiveEvent
                          ? 'border-emerald-400 ring-2 ring-emerald-500/20 bg-emerald-50/10'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase flex items-center gap-1.5 ${
                                isLiveEvent
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {isLiveEvent && (
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              )}
                              {isLiveEvent ? 'LIVE MATCHES TODAY' : 'UPCOMING REGISTRATION'}
                            </span>

                            <span className="text-xs font-semibold text-gray-500">
                              Division ID: <strong className="text-gray-900 font-mono">{reg.divisionId}</strong>
                            </span>

                            {reg.isCaptain && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                Team Captain
                              </span>
                            )}
                          </div>

                          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <span>{reg.tournamentName}</span>
                            <span className="text-gray-400 font-normal">&bull;</span>
                            <span className="text-[#0A5C43]">{reg.divisionName}</span>
                          </h3>

                          <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Calendar size={13} className="text-gray-400" />
                              <span>{reg.scheduleDay} {reg.timeSlot ? `(${reg.timeSlot})` : ''}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Users size={13} className="text-gray-400" />
                              <span>Team: <strong>{reg.teamName}</strong></span>
                            </span>
                            {reg.partnerName && (
                              <span>Partner: <strong>{reg.partnerName}</strong></span>
                            )}
                          </div>
                        </div>

                        {/* Action buttons & Live Desk trigger */}
                        <div className="flex items-center gap-2 shrink-0 flex-wrap">
                          <Link
                            href={`/t/${reg.tournamentSlug}`}
                            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 transition flex items-center gap-1.5"
                          >
                            <span>Tournament Portal</span>
                            <ExternalLink size={13} />
                          </Link>

                          {isLiveEvent && (
                            <Link
                              href="/tv"
                              target="_blank"
                              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-amber-400 transition flex items-center gap-1.5 shadow-xs"
                            >
                              <span>TV Scoreboard</span>
                              <ArrowUpRight size={13} />
                            </Link>
                          )}
                        </div>
                      </div>

                      {/* Detail sub-card: Court status & Teammate pre-paid code */}
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="space-y-0.5">
                          <span className="text-[10px] uppercase font-bold text-gray-400 block">Check-in & Court</span>
                          {reg.courtAssigned ? (
                            <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                              <span>Assigned to Court {reg.courtAssigned} (Warm-up Ready)</span>
                            </div>
                          ) : (
                            <span className="font-semibold text-gray-700">Registration Confirmed &bull; Desk Check-in Open</span>
                          )}
                        </div>

                        <div className="space-y-0.5">
                          <span className="text-[10px] uppercase font-bold text-gray-400 block">Teammate Invite Code</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-300">
                              {reg.teammateCode || 'TP-8492'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyCode(reg.teammateCode || 'TP-8492')}
                              className="text-gray-500 hover:text-gray-800"
                              title="Copy Code"
                            >
                              {copiedCodeSuccess === (reg.teammateCode || 'TP-8492') ? (
                                <Check size={13} className="text-emerald-600" />
                              ) : (
                                <Copy size={13} />
                              )}
                            </button>
                            <span className="text-[10px] text-emerald-700 font-semibold">(Captain Pre-Paid)</span>
                          </div>
                        </div>

                        <div className="space-y-0.5">
                          <span className="text-[10px] uppercase font-bold text-gray-400 block">Amount Settled</span>
                          <span className="font-mono font-bold text-[#0A5C43]">
                            ${reg.amountPaid} Paid via Stripe
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: RECOMMENDED FOR YOU (SMART DUPR MATCHING) */}
        {/* ============================================================ */}
        {activeTab === 'recommended' && (
          <div className="space-y-5">
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-5 rounded-2xl border border-amber-300 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500 text-slate-950">
                    Smart Match Engine
                  </span>
                  <span className="text-xs font-bold text-amber-900">
                    Calibrated to {signedInPlayer.fullName}&apos;s verified {signedInPlayer.duprRating?.toFixed(2) || '3.82'} DUPR
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-950">
                  Recommended Events & Divisions For Your Skill Level
                </h2>
                <p className="text-xs text-gray-700 max-w-2xl">
                  We match you with sanctioned Texas tournaments where you can compete in closely rated brackets or test high-speed pilot formats like Dink Battle.
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-amber-300 text-right shrink-0">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Current DUPR</span>
                <span className="text-lg font-black text-amber-900 font-mono">
                  {signedInPlayer.duprRating?.toFixed(2) || '3.82'}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold block">Top 15% in Texas 3.5-4.0</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendedDivisions.map((rec, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs hover:border-[#0A5C43] transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rec.isPilot
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {rec.skillLabel}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-emerald-800">
                        ${rec.fee} / Team
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-gray-900 leading-snug">
                      {rec.divisionTitle}
                    </h3>

                    <p className="text-xs font-semibold text-gray-500">
                      {rec.tournamentName}
                    </p>

                    <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      {rec.matchReason}
                    </p>

                    <div className="space-y-1 text-xs text-gray-500 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-gray-400" />
                        <span>{rec.dates}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-gray-400" />
                        <span className="truncate">{rec.venue}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-amber-700 font-semibold">
                        <Flame size={13} className="text-amber-500" />
                        <span>Only {rec.spotsLeft} team spots remaining</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/t/${rec.tournamentSlug}`}
                    className="w-full py-2.5 bg-[#0A5C43] hover:bg-[#084734] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>Register with Partner</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: PAST DIVISIONS & MATCH RESULTS */}
        {/* ============================================================ */}
        {activeTab === 'results' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <div>
                <span className="text-[11px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded uppercase">
                  Historical Records & Standings
                </span>
                <h2 className="text-xl font-bold text-gray-900 mt-1">
                  Past Tournament Finishes & Match Scorecards
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Verified match results, bracket progression, podium medals, and DUPR rating impact from concluded events.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  Showing <strong>{signedInPlayer.pastDivisions?.length || 2} Concluded Events</strong>
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {(signedInPlayer.pastDivisions || []).map((past, idx) => {
                const isExpanded = expandedPastEvent === past.tournamentSlug;

                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden transition"
                  >
                    {/* Event Summary Row */}
                    <div
                      onClick={() => setExpandedPastEvent(isExpanded ? null : past.tournamentSlug)}
                      className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/70 transition"
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-xs ${
                            past.medal === 'gold'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-orange-100 text-orange-900 border border-orange-300'
                          }`}
                        >
                          {past.medal === 'gold' ? '🥇' : '🥉'}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                                past.medal === 'gold'
                                  ? 'bg-amber-400 text-slate-950'
                                  : 'bg-amber-100 text-amber-900'
                              }`}
                            >
                              {past.finishPlacement}
                            </span>
                            <span className="text-xs text-emerald-700 font-bold font-mono">
                              DUPR Impact: {past.duprDelta}
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-gray-900">
                            {past.tournamentName} &bull; <span className="text-[#0A5C43]">{past.divisionName}</span>
                          </h3>

                          <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                            <span>{past.dates}</span>
                            <span>&bull;</span>
                            <span>{past.venue} ({past.city})</span>
                            <span>&bull;</span>
                            <span>Partner: <strong>{past.partnerName}</strong></span>
                            <span>&bull;</span>
                            <span>Record: <strong className="text-gray-900">{past.matchesWon}W - {past.matchesPlayed - past.matchesWon}L</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-semibold text-gray-600">
                          {isExpanded ? 'Hide Scorecards' : 'View Match Scorecards'}
                        </span>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>

                    {/* Expandable Match Results Breakdown */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 p-5 bg-gray-50/70 space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                          Official Match Play Log & Game Scores
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                          {past.matchResults.map((match, mIdx) => (
                            <div
                              key={mIdx}
                              className="p-3 bg-white rounded-xl border border-gray-200 shadow-2xs space-y-1 text-xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-gray-900 text-[11px]">{match.round}</span>
                                <span
                                  className={`px-1.5 py-0.2 rounded text-[10px] font-black ${
                                    match.result === 'W'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {match.result === 'W' ? 'WON' : 'LOST'}
                                </span>
                              </div>

                              <div className="text-gray-600 truncate">
                                vs {match.opponentTeam}
                              </div>

                              <div className="font-mono font-bold text-[#0A5C43] text-sm pt-0.5">
                                {match.scores}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: FIND TOURNAMENTS (EXPLORER & SEARCH) */}
        {/* ============================================================ */}
        {activeTab === 'find-tournaments' && (
          <div className="space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <div>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded uppercase">
                  Texas Tournament Circuit
                </span>
                <h2 className="text-xl font-bold text-gray-900 mt-1">
                  Find & Register for Texas Pickleball Tournaments
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Browse sanctioned open tournaments across Austin, Dallas, Houston, and San Antonio.
                </p>
              </div>

              {/* City Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
                {(['All', 'Austin', 'Dallas', 'Houston', 'San Antonio'] as const).map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setCityFilter(city)}
                    className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                      cityFilter === city
                        ? 'bg-gray-900 text-white font-bold'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tournaments by title, venue, or city..."
                className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#0A5C43] shadow-xs"
              />
            </div>

            {/* Tournament Directory Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTournaments.map((t) => (
                <div
                  key={t.id}
                  className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs hover:border-[#0A5C43] transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.status === 'Live'
                            ? 'bg-emerald-100 text-emerald-800'
                            : t.status === 'Published'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {t.status === 'Live' ? 'LIVE NOW' : t.status === 'Published' ? 'REGISTRATION OPEN' : 'UPCOMING DRAFT'}
                      </span>

                      <span className="text-xs text-gray-500">
                        Join Code: <strong className="font-mono text-gray-900">{t.joinCode}</strong>
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-gray-900">
                      {t.name}
                    </h3>

                    <div className="space-y-1 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-gray-400" />
                        <span>{t.dates}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-gray-400" />
                        <span>{t.venue}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Layers size={13} className="text-gray-400" />
                        <span>{t.totalCourts} Courts &bull; {t.courtSurface || 'Acrylic Hardcourt'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="text-xs">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Registration</span>
                      <span className="font-bold text-gray-800">{t.registeredCount || 0} / {t.maxCapacity || 64} Players</span>
                    </div>

                    <Link
                      href={`/t/${t.slug}`}
                      className="px-4 py-2 bg-[#0A5C43] hover:bg-[#084734] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                    >
                      <span>View & Register</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: MOBILE APP LIVE COMPANION & ECOSYSTEM CLARITY */}
        {/* ============================================================ */}
        {activeTab === 'mobile-companion' && (
          <div className="space-y-5">
            <div className="bg-gradient-to-br from-slate-950 via-[#0a2016] to-[#0A5C43] text-white p-6 rounded-2xl border border-white/10 shadow-md space-y-4">
              <div className="max-w-2xl space-y-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-400 text-slate-950">
                  Dinkster Dual-Track Ecosystem
                </span>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Dinkster Web Portal vs Mobile App: Built to Complement
                </h2>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Your single Dinkster sign-in (<strong>{signedInPlayer.dinksterId}</strong>) connects both platforms. Here is how they work together:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                {/* Web App Card */}
                <div className="p-4 bg-white/10 backdrop-blur-xs rounded-xl border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-300 text-sm">
                    <ExternalLink size={16} />
                    <span>Dinkster Web Portal (This Experience)</span>
                  </div>
                  <ul className="space-y-1.5 text-gray-300">
                    <li>&bull; Find & browse upcoming Texas tournaments across Austin, Dallas, Houston</li>
                    <li>&bull; View comprehensive past division placements, medals & game scores</li>
                    <li>&bull; Register teams, pre-pay partner fees & invite partners via codes</li>
                    <li>&bull; View big-screen TV jumbotron scoreboard broadcasts</li>
                  </ul>
                </div>

                {/* Mobile App Card */}
                <div className="p-4 bg-white/10 backdrop-blur-xs rounded-xl border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
                    <Smartphone size={16} />
                    <span>Dinkster Mobile App (On Court)</span>
                  </div>
                  <ul className="space-y-1.5 text-gray-300">
                    <li>&bull; Live court match dispatch notifications (&quot;Court 2 Ready for You&quot;)</li>
                    <li>&bull; In-game live scorekeeping with paddle vibration alerts</li>
                    <li>&bull; Find pickup games, open rec courts & local hitting partners</li>
                    <li>&bull; Instant referee scorecard submissions & push disputes</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Digital Pass Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  Player Identity Token
                </span>
                <h3 className="text-lg font-bold text-gray-900">
                  {signedInPlayer.fullName}&apos;s Digital Player Pass
                </h3>
                <p className="text-xs text-gray-500">
                  Scan this barcode or show your Player ID at the tournament check-in desk for express entry and warm-up court allocation.
                </p>
                <div className="font-mono text-base font-black text-[#0A5C43] tracking-wider">
                  {signedInPlayer.dinksterId}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-center shrink-0 space-y-2">
                <div className="w-28 h-28 bg-white rounded-xl border-2 border-gray-900 p-2 mx-auto flex items-center justify-center">
                  <QrCode size={80} className="text-gray-900" />
                </div>
                <span className="text-[10px] font-mono text-gray-500 block">Scan at Desk</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* 5. EDIT PROFILE MODAL */}
      {/* ============================================================== */}
      {showEditProfileModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">Edit Player Profile</h3>
                <p className="text-xs text-gray-500">Update personal information & emergency details.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditProfileModal(false)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#0A5C43]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Age</label>
                  <input
                    type="number"
                    value={editAge}
                    onChange={(e) => setEditAge(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">DUPR Member ID</label>
                <input
                  type="text"
                  value={editDuprId}
                  onChange={(e) => setEditDuprId(e.target.value)}
                  placeholder="e.g. 2B48A"
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Emergency Phone</label>
                <input
                  type="text"
                  value={editEmergencyPhone}
                  onChange={(e) => setEditEmergencyPhone(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="px-3.5 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0A5C43] hover:bg-[#084734] text-white rounded-lg font-semibold shadow-xs"
                >
                  Save Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. SIGN IN / SWITCH ACCOUNT MODAL */}
      {/* ============================================================== */}
      {showSignInModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">Player Account Access</h3>
                <p className="text-xs text-gray-500">Sign in with your Dinkster Player ID or switch demo account.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowSignInModal(false)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Dinkster ID or Email</label>
                <input
                  type="text"
                  placeholder="e.g. DK-84920 or alex@dinkster.app"
                  value={signInInput}
                  onChange={(e) => setSignInInput(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#0A5C43]"
                />
              </div>

              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">
                  Quick Demo Accounts (1-Click Switch)
                </span>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleSwitchToDemo(DEFAULT_PLAYER_ACCOUNT)}
                    className="w-full p-3 rounded-xl bg-gray-50 hover:bg-emerald-50 border border-gray-200 flex items-center justify-between text-left transition"
                  >
                    <div>
                      <div className="font-bold text-gray-900">Alex Miller (DK-84920)</div>
                      <div className="text-[11px] text-gray-500">DUPR 3.82 &bull; Mixed Doubles Captain</div>
                    </div>
                    <span className="text-xs font-bold text-[#0A5C43]">Select &rarr;</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSwitchToDemo(DEMO_PARTNER_ACCOUNT)}
                    className="w-full p-3 rounded-xl bg-gray-50 hover:bg-emerald-50 border border-gray-200 flex items-center justify-between text-left transition"
                  >
                    <div>
                      <div className="font-bold text-gray-900">Morgan Reyes (DK-31990)</div>
                      <div className="text-[11px] text-gray-500">DUPR 3.91 &bull; Partner in Austin Winter Open</div>
                    </div>
                    <span className="text-xs font-bold text-[#0A5C43]">Select &rarr;</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="text-xs text-red-600 hover:underline font-semibold"
                >
                  Clear Session
                </button>
                <button
                  type="button"
                  onClick={() => setShowSignInModal(false)}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. DIGITAL QR PASS MODAL */}
      {/* ============================================================== */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 space-y-4 text-center">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                Desk Express Pass
              </span>
              <h3 className="text-base font-bold text-gray-900">{signedInPlayer.fullName}</h3>
              <p className="text-xs text-gray-500 font-mono">{signedInPlayer.dinksterId}</p>
            </div>

            <div className="w-48 h-48 bg-white rounded-2xl border-2 border-gray-900 p-3 mx-auto flex items-center justify-center shadow-xs">
              <QrCode size={160} className="text-gray-900" />
            </div>

            <p className="text-xs text-gray-500">
              Show this QR pass at the tournament desk or hold it up to the court referee scanner for verified check-in.
            </p>

            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full py-2 bg-[#0A5C43] text-white rounded-xl text-xs font-bold"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
