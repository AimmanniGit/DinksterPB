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
  Mail,
  UserCheck,
} from 'lucide-react';
import {
  INITIAL_EVENT,
  INITIAL_TOURNAMENT_FLEET,
  INITIAL_DIVISIONS,
  DEFAULT_PLAYER_ACCOUNT,
  DEMO_PARTNER_ACCOUNT,
} from '../../constants/initialState';
import { PlayerAccount, TournamentEvent, PastDivisionRecord, Division } from '../../types/organizer';
import { DivisionInteractiveCard, PartnerInviteTrackerModal } from '../../components/divisions';
import { TournamentRunwayTracker } from '../../components/common';

interface GroupedPastEvent {
  tournamentSlug: string;
  tournamentName: string;
  dates: string;
  venue: string;
  city: string;
  divisions: PastDivisionRecord[];
  totalMatchesPlayed: number;
  totalMatchesWon: number;
  golds: number;
  silvers: number;
  bronzes: number;
}

export default function PlayerPortalHomePage() {
  // Session State
  const [signedInPlayer, setSignedInPlayer] = useState<PlayerAccount | null>(DEFAULT_PLAYER_ACCOUNT);
  const [tournaments] = useState<TournamentEvent[]>(INITIAL_TOURNAMENT_FLEET);

  // Active Tab: 'my-tournaments' | 'find-tournaments' | 'results' | 'mobile-companion'
  const [activeTab, setActiveTab] = useState<
    'my-tournaments' | 'find-tournaments' | 'results' | 'mobile-companion'
  >('my-tournaments');

  // Modals & Dialogs
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedCodeSuccess, setCopiedCodeSuccess] = useState<string | null>(null);
  const [showMoreRecommended, setShowMoreRecommended] = useState(false);

  // Partner Invite Tracker Modal State
  const [partnerInviteModalData, setPartnerInviteModalData] = useState<{
    teamName: string;
    divisionName: string;
    tournamentName: string;
    tournamentSlug: string;
    teammateCode: string;
    isPrepaid: boolean;
    initialPartner?: {
      firstName?: string;
      lastName?: string;
      email?: string;
      status?: 'sent' | 'opened' | 'registered' | 'confirmed';
    };
  } | null>(null);

  // Profile Edit Form State
  const [editFullName, setEditFullName] = useState(DEFAULT_PLAYER_ACCOUNT.fullName);
  const [editPhone, setEditPhone] = useState(DEFAULT_PLAYER_ACCOUNT.phone);
  const [editAge, setEditAge] = useState(String(DEFAULT_PLAYER_ACCOUNT.age || 34));
  const [editEmergencyPhone, setEditEmergencyPhone] = useState(DEFAULT_PLAYER_ACCOUNT.emergencyPhone || '');
  const [editDuprId, setEditDuprId] = useState(DEFAULT_PLAYER_ACCOUNT.duprId || '');

  // Sign In Dialog Input
  const [signInInput, setSignInInput] = useState('');

  // Tournament Explorer Filters
  const [cityFilter, setCityFilter] = useState<'All' | 'Austin' | 'Dallas' | 'Houston' | 'San Antonio'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Expandable States for Past Events & Divisions (Collapsed by default!)
  const [expandedPastEvents, setExpandedPastEvents] = useState<Record<string, boolean>>({});
  const [expandedPastDivisions, setExpandedPastDivisions] = useState<Record<string, boolean>>({});

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
          ...(prev || DEFAULT_PLAYER_ACCOUNT),
          ...parsed,
          pastDivisions: prev?.pastDivisions || DEFAULT_PLAYER_ACCOUNT.pastDivisions,
          careerStats: prev?.careerStats || DEFAULT_PLAYER_ACCOUNT.careerStats,
        }));
        setEditFullName(parsed.fullName || DEFAULT_PLAYER_ACCOUNT.fullName);
        setEditPhone(parsed.phone || DEFAULT_PLAYER_ACCOUNT.phone);
        setEditAge(String(parsed.age || DEFAULT_PLAYER_ACCOUNT.age || 34));
        setEditEmergencyPhone(parsed.emergencyPhone || DEFAULT_PLAYER_ACCOUNT.emergencyPhone || '');
        setEditDuprId(parsed.duprId || DEFAULT_PLAYER_ACCOUNT.duprId || '');
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
    if (!signedInPlayer) return;

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
    setEditDuprId(account.duprId || '');
    try {
      localStorage.setItem('dinkster_player_session', JSON.stringify(account));
    } catch (e) {}
    setShowSignInModal(false);
    showToast(`Switched active player account to ${account.fullName} (${account.dinksterId})`);
  };

  const handleSignOut = () => {
    setSignedInPlayer(null);
    try {
      localStorage.removeItem('dinkster_player_session');
    } catch (e) {}
    showToast('Signed out of Dinkster Player Portal.');
  };

  // Open teammate invite modal with active registration or default team code
  const handleOpenTeammateInvite = () => {
    if (!signedInPlayer) {
      setShowSignInModal(true);
      return;
    }

    const activeReg = signedInPlayer.registeredDivisions[0];
    if (activeReg) {
      setPartnerInviteModalData({
        teamName: activeReg.teamName,
        divisionName: activeReg.divisionName,
        tournamentName: activeReg.tournamentName,
        tournamentSlug: activeReg.tournamentSlug,
        teammateCode: activeReg.teammateCode || 'TP-8492',
        isPrepaid: activeReg.isCaptain,
        initialPartner: {
          firstName: activeReg.partnerName ? activeReg.partnerName.split(' ')[0] : 'Morgan',
          lastName: activeReg.partnerName ? activeReg.partnerName.split(' ').slice(1).join(' ') : 'Reyes',
          email: activeReg.partnerName
            ? `${activeReg.partnerName.toLowerCase().replace(/\s+/g, '.')}@dinkster.app`
            : 'morgan.reyes@dinkster.app',
          status: activeReg.partnerName ? 'registered' : 'sent',
        },
      });
    } else {
      setPartnerInviteModalData({
        teamName: `${signedInPlayer.fullName} & Partner`,
        divisionName: 'Mixed Doubles 3.5 to 4.0',
        tournamentName: 'Austin Winter Open 2026',
        tournamentSlug: 'austin-winter-open-2026',
        teammateCode: 'TP-8492',
        isPrepaid: true,
        initialPartner: {
          firstName: 'Morgan',
          lastName: 'Reyes',
          email: 'morgan.reyes@dinkster.app',
          status: 'sent',
        },
      });
    }
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

  // Recommended Divisions based on player DUPR
  const recommendedDivisions = useMemo(() => {
    const rating = signedInPlayer?.duprRating || 3.82;

    return [
      {
        tournamentName: 'Austin Winter Open 2026',
        tournamentSlug: 'austin-winter-open-2026',
        divisionTitle: 'Dink Battle Pilot Slam (Court Shrink)',
        dates: 'Sunday Nov 8, 2026',
        venue: 'Austin Tennis & Pickleball Center',
        fee: 50,
        skillLabel: 'All DUPR Open Pilot (Fast Play)',
        matchReason: 'Fast-paced pilot format: court shrinks to half-court after 5th shot! Zero conflict with your Saturday matches.',
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
        matchReason: `98% Skill Match for your verified ${rating.toFixed(2)} DUPR rating. Premier Houston venue with 12 courts.`,
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
        matchReason: 'San Antonio premier venue with dedicated modular sport court tiles and shaded outdoor stadium courts.',
        spotsLeft: 12,
        isPilot: false,
      },
    ];
  }, [signedInPlayer]);

  // Group Past Divisions by Event (Past Events -> Divisions within Event)
  const groupedPastEvents = useMemo<GroupedPastEvent[]>(() => {
    const pastList = signedInPlayer?.pastDivisions || [];
    const map = new Map<string, GroupedPastEvent>();

    for (const record of pastList) {
      const existing = map.get(record.tournamentSlug);
      if (!existing) {
        map.set(record.tournamentSlug, {
          tournamentSlug: record.tournamentSlug,
          tournamentName: record.tournamentName,
          dates: record.dates,
          venue: record.venue,
          city: record.city,
          divisions: [record],
          totalMatchesPlayed: record.matchesPlayed,
          totalMatchesWon: record.matchesWon,
          golds: record.medal === 'gold' ? 1 : 0,
          silvers: record.medal === 'silver' ? 1 : 0,
          bronzes: record.medal === 'bronze' ? 1 : 0,
        });
      } else {
        existing.divisions.push(record);
        existing.totalMatchesPlayed += record.matchesPlayed;
        existing.totalMatchesWon += record.matchesWon;
        if (record.medal === 'gold') existing.golds += 1;
        if (record.medal === 'silver') existing.silvers += 1;
        if (record.medal === 'bronze') existing.bronzes += 1;
      }
    }

    return Array.from(map.values());
  }, [signedInPlayer?.pastDivisions]);

  const togglePastEvent = (slug: string) => {
    setExpandedPastEvents((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  const togglePastDivision = (divId: string) => {
    setExpandedPastDivisions((prev) => ({
      ...prev,
      [divId]: !prev[divId],
    }));
  };

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

          {/* Right: Explicit Player Actions (Invite Teammate, Profile, Sign Out) */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {signedInPlayer ? (
              <>
                {/* 1. Dedicated Invite Teammate Action */}
                <button
                  type="button"
                  onClick={handleOpenTeammateInvite}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-2xs"
                  title="Invite Teammate or Share Team Registration Code"
                >
                  <Mail size={13} className="text-slate-950" />
                  <span className="hidden sm:inline">Invite Teammate</span>
                  <span className="sm:hidden">Invite</span>
                </button>

                {/* 2. Dedicated Player Profile Action */}
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(true)}
                  className="px-3 py-1.5 bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-2xs"
                  title="View & Edit Player Profile Details"
                >
                  <div className="w-5 h-5 rounded-full bg-[#0A5C43] text-white flex items-center justify-center text-[10px] font-black shrink-0">
                    {signedInPlayer.fullName.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <span className="hidden md:inline">{signedInPlayer.fullName}</span>
                  <span className="font-mono text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded border border-emerald-200">
                    {signedInPlayer.dinksterId}
                  </span>
                  <span className="hidden lg:inline px-1.5 py-0.2 rounded text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                    {signedInPlayer.duprRating?.toFixed(2)} DUPR
                  </span>
                </button>

                {/* 3. Dedicated Sign Out Action */}
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="px-2.5 py-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold transition flex items-center gap-1 border border-transparent hover:border-red-200"
                  title="Sign Out of Dinkster Player Session"
                >
                  <LogOut size={13} />
                  <span className="hidden md:inline">Sign Out</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setShowSignInModal(true)}
                className="px-4 py-1.5 bg-[#0A5C43] hover:bg-[#084734] text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs"
              >
                <LogIn size={13} />
                <span>Sign In / Demo</span>
              </button>
            )}

            <div className="h-4 w-[1px] bg-gray-200 hidden xl:block" />

            {/* Subtle Organizer Switcher for Admins */}
            <Link
              href="/"
              className="text-xs font-semibold text-gray-500 hover:text-[#0A5C43] transition hidden xl:flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100"
              title="Switch to Dinkster Host & Organizer Suite"
            >
              <span>Host Suite &rarr;</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. PLAYER PROFILE IDENTITY & DUPR HERO BANNER */}
      {/* ============================================================== */}
      <section className="bg-gradient-to-br from-[#0a2016] via-[#0E3D2F] to-[#0A5C43] text-white px-4 sm:px-6 py-6 border-b border-emerald-800/40 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {signedInPlayer ? (
            <>
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

                  {/* Quick Action links */}
                  <div className="flex items-center gap-3 pt-1 text-[11px] text-gray-300 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setShowEditProfileModal(true)}
                      className="text-emerald-300 hover:text-white font-semibold underline flex items-center gap-1"
                    >
                      <Edit2 size={11} />
                      <span>Edit Profile</span>
                    </button>
                    <span>&bull;</span>
                    <button
                      type="button"
                      onClick={() => setShowQrModal(true)}
                      className="text-amber-300 hover:text-amber-200 font-semibold underline flex items-center gap-1"
                    >
                      <QrCode size={11} />
                      <span>View Desk QR Pass</span>
                    </button>
                    <span>&bull;</span>
                    <button
                      type="button"
                      onClick={handleOpenTeammateInvite}
                      className="text-amber-300 hover:text-amber-200 font-semibold underline flex items-center gap-1"
                    >
                      <Mail size={11} />
                      <span>Invite Teammate</span>
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
            </>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                  Guest Player Access
                </span>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Welcome to Dinkster Player Portal
                </h1>
                <p className="text-xs text-emerald-200 max-w-xl">
                  Sign in with your Dinkster ID or DUPR rating to access active tournament check-in, court notifications, partner invite tracking, and career scorecards.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowSignInModal(true)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition shadow-xs"
                >
                  Sign In with Dinkster ID
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchToDemo(DEFAULT_PLAYER_ACCOUNT)}
                  className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/20 transition"
                >
                  1-Click Demo Alex Miller (DUPR 3.82)
                </button>
              </div>
            </div>
          )}
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
              <span>My Active Events & Roster</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  activeTab === 'my-tournaments' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {signedInPlayer?.registeredDivisions.length || 0}
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
              <Sparkles size={15} className={activeTab === 'find-tournaments' ? 'text-amber-400' : 'text-amber-600'} />
              <span>Find Tournaments & Smart Match</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  activeTab === 'find-tournaments' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {tournaments.length}
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
              <span>Past Events & Results</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  activeTab === 'results' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'
                }`}
              >
                {groupedPastEvents.length}
              </span>
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
        {/* TAB 1: MY ACTIVE & UPCOMING EVENTS (LIST CARD VIEW) */}
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
                  onClick={() => setActiveTab('find-tournaments')}
                  className="px-3.5 py-2 bg-[#0A5C43] hover:bg-[#084734] text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Join Another Division</span>
                </button>
              </div>
            </div>

            {!signedInPlayer || signedInPlayer.registeredDivisions.length === 0 ? (
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
              <div className="flex flex-col gap-4">
                {signedInPlayer.registeredDivisions.map((reg, idx) => {
                  const isLiveEvent = reg.tournamentSlug === 'austin-winter-open-2026';
                  const isAwaitingPartner = !reg.partnerName || reg.status === 'awaiting_partner';

                  const divObj: Division = {
                    id: reg.divisionId,
                    name: reg.divisionName,
                    format: 'Double Elimination Pools & Playoffs',
                    minDupr: 3.5,
                    maxDupr: 4.0,
                    entryFee: reg.amountPaid / (reg.isCaptain ? 2 : 1),
                    teamCap: 16,
                    scheduleDay: reg.scheduleDay,
                    timeSlot: reg.timeSlot,
                  };

                  return (
                    <div
                      key={idx}
                      className={`bg-white rounded-2xl p-5 border transition shadow-xs space-y-4 ${
                        isLiveEvent
                          ? 'border-emerald-400 ring-2 ring-emerald-500/20 bg-emerald-50/10'
                          : 'border-gray-200'
                      }`}
                    >
                      {/* Top Context & Dispatch Header */}
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

                            {isAwaitingPartner && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950 animate-pulse">
                                Awaiting Partner Registration
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
                            {reg.partnerName ? (
                              <span>Partner: <strong>{reg.partnerName}</strong></span>
                            ) : (
                              <span className="text-amber-700 font-semibold">Partner: <strong>Pending Invite Acceptance</strong></span>
                            )}
                          </div>
                        </div>

                        {/* Action buttons & Live Desk trigger */}
                        <div className="flex items-center gap-2 shrink-0 flex-wrap">
                          <button
                            type="button"
                            onClick={() =>
                              setPartnerInviteModalData({
                                teamName: reg.teamName,
                                divisionName: reg.divisionName,
                                tournamentName: reg.tournamentName,
                                tournamentSlug: reg.tournamentSlug,
                                teammateCode: reg.teammateCode || 'TP-8492',
                                isPrepaid: reg.isCaptain,
                                initialPartner: {
                                  firstName: reg.partnerName ? reg.partnerName.split(' ')[0] : 'Morgan',
                                  lastName: reg.partnerName ? reg.partnerName.split(' ').slice(1).join(' ') : 'Reyes',
                                  email: reg.partnerName
                                    ? `${reg.partnerName.toLowerCase().replace(/\s+/g, '.')}@dinkster.app`
                                    : 'morgan.reyes@dinkster.app',
                                  status: isAwaitingPartner ? 'sent' : 'registered',
                                },
                              })
                            }
                            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center gap-1.5 shadow-2xs"
                          >
                            <Mail size={13} />
                            <span>{isAwaitingPartner ? 'Send / Track Partner Invite' : 'Partner Invite Tracker'}</span>
                          </button>

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
                      <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
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
                            <span className="text-[10px] text-emerald-700 font-semibold">
                              {reg.isCaptain ? '(Captain Pre-Paid)' : '(Team Entry)'}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-0.5">
                          <span className="text-[10px] uppercase font-bold text-gray-400 block">Amount Settled</span>
                          <span className="font-mono font-bold text-[#0A5C43]">
                            ${reg.amountPaid} Paid via Stripe
                          </span>
                        </div>
                      </div>

                      {/* Tournament Runway & Division Pacing Tracker */}
                      {(() => {
                        const matchedTourn: TournamentEvent = tournaments.find((t) => t.slug === reg.tournamentSlug) || {
                          id: reg.tournamentSlug,
                          name: reg.tournamentName,
                          slug: reg.tournamentSlug,
                          joinCode: 'D-8492',
                          dates: reg.scheduleDay || 'Upcoming',
                          venue: 'Texas Dedicated Complex',
                          status: isLiveEvent ? 'Live' : 'Published',
                          requireWaiver: true,
                          seedByDupr: true,
                          registeredCount: 56,
                          maxCapacity: 64,
                          totalCourts: 16,
                        };
                        return (
                          <div className="bg-[#FAF8F3] p-3.5 rounded-xl border border-gray-200">
                            <TournamentRunwayTracker
                              tournament={matchedTourn}
                              divisions={isLiveEvent ? INITIAL_DIVISIONS : [divObj]}
                              variant="card"
                              showDivisionBreakdown={true}
                            />
                          </div>
                        );
                      })()}

                      {/* Interactive Division Card (Collapsed by default!) */}
                      <div className="pt-1">
                        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                          <span>Division Teams, Competitors & Schedule Pacing</span>
                          <span className="text-emerald-700 font-normal">Click card to expand roster & opponents</span>
                        </div>
                        <DivisionInteractiveCard
                          division={divObj}
                          tournamentStatus={isLiveEvent ? 'Live' : 'Published'}
                          tournamentName={reg.tournamentName}
                          tournamentSlug={reg.tournamentSlug}
                          viewerRole="player"
                          signedInPlayerId={signedInPlayer.dinksterId}
                          signedInPlayerTeamCode={reg.teammateCode || 'TP-8492'}
                          teamName={reg.teamName}
                          isPlayerRegisteredInThisDiv={true}
                          playerTeamIsAwaitingPartner={isAwaitingPartner}
                          playerPartnerInfo={{
                            firstName: reg.partnerName ? reg.partnerName.split(' ')[0] : 'Morgan',
                            lastName: reg.partnerName ? reg.partnerName.split(' ').slice(1).join(' ') : 'Reyes',
                            email: reg.partnerName
                              ? `${reg.partnerName.toLowerCase().replace(/\s+/g, '.')}@dinkster.app`
                              : 'morgan.reyes@dinkster.app',
                            status: isAwaitingPartner ? 'sent' : 'registered',
                          }}
                          defaultExpanded={false}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: FIND TOURNAMENTS & SMART MATCH (UNIFIED DISCOVERY) */}
        {/* ============================================================ */}
        {activeTab === 'find-tournaments' && (
          <div className="space-y-6">
            {/* 1. RECOMMENDED FOR YOU (BEST MATCHING EVENT & DIVISION AT TOP) */}
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-5 rounded-2xl border border-amber-300 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500 text-slate-950 flex items-center gap-1">
                      <Sparkles size={12} />
                      <span>Smart DUPR Match</span>
                    </span>
                    <span className="text-xs font-bold text-amber-900">
                      Recommended for {signedInPlayer?.fullName || 'You'} ({signedInPlayer?.duprRating?.toFixed(2) || '3.82'} DUPR)
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-950">
                    Best Matching Event & Division For Your Skill Level
                  </h2>
                  <p className="text-xs text-gray-700 max-w-2xl">
                    Our algorithm pairs you with Texas tournaments that match your verified rating, protect your weekend schedule from overlapping times, and feature high-pacing brackets.
                  </p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-amber-300 text-right shrink-0">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Verified DUPR</span>
                  <span className="text-lg font-black text-amber-900 font-mono">
                    {signedInPlayer?.duprRating?.toFixed(2) || '3.82'}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold block">Top 15% in Texas 3.5-4.0</span>
                </div>
              </div>

              {/* BEST MATCH: Highlighted First Pick (List Card View) */}
              {recommendedDivisions.length > 0 && (() => {
                const best = recommendedDivisions[0];
                const bestDivObj: Division = {
                  id: 'rec-div-1',
                  name: best.divisionTitle,
                  format: best.isPilot ? 'Dink Battle (Court Shrink Pilot)' : 'Double Elimination',
                  minDupr: 3.5,
                  maxDupr: 4.0,
                  entryFee: best.fee,
                  teamCap: 16,
                  isPilot: best.isPilot,
                  scheduleDay: best.dates,
                };

                return (
                  <div className="bg-white rounded-2xl p-5 border-2 border-amber-400 shadow-sm space-y-3">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                            #1 Top Recommended Fit (98% Match)
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            {best.skillLabel}
                          </span>
                          <span className="text-xs font-mono font-bold text-[#0A5C43]">
                            ${best.fee} / Player Entry
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900">
                          {best.tournamentName} &bull; <span className="text-[#0A5C43]">{best.divisionTitle}</span>
                        </h3>

                        <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar size={13} className="text-gray-400" />
                            <span>{best.dates}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={13} className="text-gray-400" />
                            <span>{best.venue}</span>
                          </span>
                          <span className="flex items-center gap-1 text-amber-700 font-semibold">
                            <Flame size={13} className="text-amber-500" />
                            <span>Only {best.spotsLeft} team spots remaining</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          href={`/t/${best.tournamentSlug}`}
                          className="px-4 py-2 bg-[#0A5C43] hover:bg-[#084734] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                        >
                          <span>Register with Partner</span>
                          <ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>

                    <div className="text-xs text-gray-700 bg-amber-50/70 p-3 rounded-xl border border-amber-200">
                      <strong>Why Dinkster Recommends This:</strong> {best.matchReason}
                    </div>

                    {/* Interactive Division Expansion (Collapsed by default!) */}
                    <div className="pt-1">
                      <DivisionInteractiveCard
                        division={bestDivObj}
                        tournamentStatus={best.tournamentSlug === 'austin-winter-open-2026' ? 'Live' : 'Published'}
                        tournamentName={best.tournamentName}
                        tournamentSlug={best.tournamentSlug}
                        viewerRole="player"
                        signedInPlayerId={signedInPlayer?.dinksterId}
                        isPlayerRegisteredInThisDiv={false}
                        defaultExpanded={false}
                        onOpenRegistration={() => {
                          window.location.href = `/t/${best.tournamentSlug}`;
                        }}
                      />
                    </div>
                  </div>
                );
              })()}

              {/* Secondary Recommended Divisions Toggle & List Cards */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowMoreRecommended((prev) => !prev)}
                  className="w-full py-2 px-3 bg-white/80 hover:bg-white border border-amber-300 rounded-xl text-xs font-bold text-amber-950 flex items-center justify-between transition shadow-2xs"
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-600" />
                    <span>
                      {showMoreRecommended
                        ? 'Hide Additional Recommended Divisions'
                        : `Explore ${recommendedDivisions.length - 1} More Matching Divisions (Houston & San Antonio)`}
                    </span>
                  </span>
                  {showMoreRecommended ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>

                {showMoreRecommended && (
                  <div className="flex flex-col gap-3 mt-3">
                    {recommendedDivisions.slice(1).map((rec, idx) => {
                      const recDivObj: Division = {
                        id: `rec-div-${idx + 2}`,
                        name: rec.divisionTitle,
                        format: 'Double Elimination',
                        minDupr: 3.5,
                        maxDupr: 4.0,
                        entryFee: rec.fee,
                        teamCap: 16,
                        scheduleDay: rec.dates,
                      };

                      return (
                        <div
                          key={idx}
                          className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs hover:border-[#0A5C43] transition space-y-3"
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  {rec.skillLabel}
                                </span>
                                <span className="text-xs font-mono font-bold text-gray-900">
                                  ${rec.fee} / Player
                                </span>
                                <span className="text-xs text-amber-700 font-semibold">
                                  &bull; {rec.spotsLeft} spots left
                                </span>
                              </div>

                              <h4 className="text-base font-bold text-gray-900">
                                {rec.tournamentName} &bull; <span className="text-[#0A5C43]">{rec.divisionTitle}</span>
                              </h4>

                              <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                                <span>{rec.dates}</span>
                                <span>&bull;</span>
                                <span>{rec.venue}</span>
                              </div>
                            </div>

                            <Link
                              href={`/t/${rec.tournamentSlug}`}
                              className="px-3.5 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 self-start lg:self-auto shrink-0"
                            >
                              <span>View & Register</span>
                              <ArrowRight size={13} />
                            </Link>
                          </div>

                          <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-200/80">
                            {rec.matchReason}
                          </p>

                          {/* Collapsed by default */}
                          <DivisionInteractiveCard
                            division={recDivObj}
                            tournamentStatus="Published"
                            tournamentName={rec.tournamentName}
                            tournamentSlug={rec.tournamentSlug}
                            viewerRole="player"
                            signedInPlayerId={signedInPlayer?.dinksterId}
                            isPlayerRegisteredInThisDiv={false}
                            defaultExpanded={false}
                            onOpenRegistration={() => {
                              window.location.href = `/t/${rec.tournamentSlug}`;
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* 2. TEXAS TOURNAMENT CIRCUIT DIRECTORY (LIST CARD VIEW) */}
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                <div>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded uppercase">
                    Texas Tournament Circuit
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mt-1">
                    All Upcoming Sanctioned Tournaments
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Browse verified tournaments across Texas with direct team registration and partner invites.
                  </p>
                </div>

                {/* City Filter Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold [scrollbar-width:none]">
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
                  placeholder="Search tournaments by name, venue, city, or surface..."
                  className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#0A5C43] shadow-xs"
                />
              </div>

              {/* Tournament Directory (Strict List Card View - Mobile Friendly) */}
              <div className="flex flex-col gap-4">
                {filteredTournaments.map((t) => (
                  <div
                    key={t.id}
                    className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs hover:border-[#0A5C43] transition space-y-4"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
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

                          <span className="text-xs text-gray-400">&bull;</span>
                          <span className="text-xs text-gray-600 font-semibold">{t.city}, {t.state || 'TX'}</span>
                        </div>

                        <h4 className="text-lg font-bold text-gray-900">
                          {t.name}
                        </h4>

                        <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                          <span className="flex items-center gap-1.5">
                            <Calendar size={13} className="text-gray-400" />
                            <span>{t.dates}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin size={13} className="text-gray-400" />
                            <span>{t.venue}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Layers size={13} className="text-gray-400" />
                            <span>{t.totalCourts} Courts &bull; {t.courtSurface || 'Acrylic Hardcourt'}</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          href={`/t/${t.slug}`}
                          className="px-4 py-2.5 bg-[#0A5C43] hover:bg-[#084734] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs whitespace-nowrap"
                        >
                          <span>View & Register</span>
                          <ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>

                    {/* Tournament Runway & Division Capacity Breakdown */}
                    <div className="pt-2 border-t border-gray-100">
                      <TournamentRunwayTracker
                        tournament={t}
                        divisions={t.slug === 'austin-winter-open-2026' ? INITIAL_DIVISIONS : undefined}
                        variant="card"
                        showDivisionBreakdown={true}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: PAST EVENTS & RESULTS (GROUPED BY EVENT FIRST) */}
        {/* ============================================================ */}
        {activeTab === 'results' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <div>
                <span className="text-[11px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded uppercase">
                  Historical Career Archive
                </span>
                <h2 className="text-xl font-bold text-gray-900 mt-1">
                  Past Events & Official Match Records
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Organized by past tournaments attended, with divisions, medal placements, and verified scorecards.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  Showing <strong>{groupedPastEvents.length} Concluded Events</strong>
                </span>
              </div>
            </div>

            {groupedPastEvents.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3">
                <Medal size={36} className="text-gray-300 mx-auto" />
                <h3 className="text-base font-bold text-gray-900">No past tournament records</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Once your upcoming tournament matches conclude, verified game scores and DUPR impact will appear here.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {groupedPastEvents.map((evtGroup) => {
                  const isEventExpanded = Boolean(expandedPastEvents[evtGroup.tournamentSlug]);

                  return (
                    <div
                      key={evtGroup.tournamentSlug}
                      className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden transition"
                    >
                      {/* Past Event Header Row (Click to toggle expansion) */}
                      <div
                        onClick={() => togglePastEvent(evtGroup.tournamentSlug)}
                        className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/70 transition"
                      >
                        <div className="flex items-start gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 border border-amber-300 flex items-center justify-center text-xl shrink-0 shadow-2xs">
                            {evtGroup.golds > 0 ? '🥇' : evtGroup.silvers > 0 ? '🥈' : '🥉'}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-gray-900 text-white">
                                {evtGroup.divisions.length} {evtGroup.divisions.length === 1 ? 'Division Played' : 'Divisions Played'}
                              </span>

                              {evtGroup.golds > 0 && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950">
                                  {evtGroup.golds} Gold
                                </span>
                              )}
                              {evtGroup.silvers > 0 && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-800">
                                  {evtGroup.silvers} Silver
                                </span>
                              )}
                              {evtGroup.bronzes > 0 && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                                  {evtGroup.bronzes} Bronze
                                </span>
                              )}

                              <span className="text-xs text-emerald-700 font-bold font-mono">
                                Record: {evtGroup.totalMatchesWon}W - {evtGroup.totalMatchesPlayed - evtGroup.totalMatchesWon}L
                              </span>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900">
                              {evtGroup.tournamentName}
                            </h3>

                            <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                              <span>{evtGroup.dates}</span>
                              <span>&bull;</span>
                              <span>{evtGroup.venue} ({evtGroup.city})</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs font-semibold text-gray-600">
                            {isEventExpanded ? 'Collapse Divisions' : `View ${evtGroup.divisions.length} Divisions`}
                          </span>
                          {isEventExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </div>

                      {/* Expandable Divisions Nested Within This Event */}
                      {isEventExpanded && (
                        <div className="border-t border-gray-100 p-5 bg-gray-50/50 space-y-4">
                          <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
                            Divisions Contested at {evtGroup.tournamentName}
                          </div>

                          <div className="flex flex-col gap-3">
                            {evtGroup.divisions.map((divRecord, dIdx) => {
                              const isDivExpanded = Boolean(expandedPastDivisions[divRecord.divisionId]);

                              return (
                                <div
                                  key={dIdx}
                                  className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs space-y-3"
                                >
                                  {/* Division Summary Row */}
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="space-y-0.5">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span
                                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                            divRecord.medal === 'gold'
                                              ? 'bg-amber-400 text-slate-950'
                                              : divRecord.medal === 'silver'
                                              ? 'bg-slate-200 text-slate-900'
                                              : 'bg-amber-100 text-amber-900'
                                          }`}
                                        >
                                          {divRecord.finishPlacement}
                                        </span>
                                        <span className="text-xs font-mono font-bold text-emerald-700">
                                          DUPR {divRecord.duprDelta}
                                        </span>
                                      </div>

                                      <h4 className="text-base font-bold text-gray-900">
                                        {divRecord.divisionName}
                                      </h4>

                                      <div className="text-xs text-gray-500">
                                        Partner: <strong>{divRecord.partnerName}</strong> &bull; Match Record:{' '}
                                        <strong className="text-gray-900">
                                          {divRecord.matchesWon}W - {divRecord.matchesPlayed - divRecord.matchesWon}L
                                        </strong>
                                      </div>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => togglePastDivision(divRecord.divisionId)}
                                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center gap-1.5 self-start sm:self-auto"
                                    >
                                      <span>{isDivExpanded ? 'Hide Match Scores' : 'View Match Scores'}</span>
                                      {isDivExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                    </button>
                                  </div>

                                  {/* Nested Match Scorecards */}
                                  {isDivExpanded && (
                                    <div className="pt-2 border-t border-gray-100 space-y-2">
                                      <span className="text-[10px] uppercase font-bold text-gray-400 block">
                                        Official Match Play Log
                                      </span>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {divRecord.matchResults.map((match, mIdx) => (
                                          <div
                                            key={mIdx}
                                            className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 text-xs space-y-0.5"
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
                                            <div className="text-gray-500 truncate">vs {match.opponentTeam}</div>
                                            <div className="font-mono font-bold text-[#0A5C43] text-xs pt-0.5">
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
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: MOBILE APP LIVE COMPANION & DUAL-TRACK ECOSYSTEM */}
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
                  Your single Dinkster sign-in (<strong>{signedInPlayer?.dinksterId || 'DK-84920'}</strong>) connects both platforms. Here is how they work together:
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
                    <li>&bull; View comprehensive past event placements, medals & official game scores</li>
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
                  {signedInPlayer?.fullName || 'Alex Miller'}&apos;s Digital Player Pass
                </h3>
                <p className="text-xs text-gray-500">
                  Scan this barcode or show your Player ID at the tournament check-in desk for express entry and warm-up court allocation.
                </p>
                <div className="font-mono text-base font-black text-[#0A5C43] tracking-wider">
                  {signedInPlayer?.dinksterId || 'DK-84920'}
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
      {showEditProfileModal && signedInPlayer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">Player Profile & Credentials</h3>
                <p className="text-xs text-gray-500">Manage your player identity, contact, and DUPR ID.</p>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">DUPR Member ID</label>
                  <input
                    type="text"
                    value={editDuprId}
                    onChange={(e) => setEditDuprId(e.target.value)}
                    placeholder="e.g. 2B48A"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Dinkster ID (Permanent)</label>
                  <input
                    type="text"
                    disabled
                    value={signedInPlayer.dinksterId}
                    className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-500 font-mono font-bold cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Emergency Phone Contact</label>
                <input
                  type="text"
                  value={editEmergencyPhone}
                  onChange={(e) => setEditEmergencyPhone(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="text-xs text-red-600 hover:underline font-semibold flex items-center gap-1"
                >
                  <LogOut size={13} />
                  <span>Sign Out of Account</span>
                </button>

                <div className="flex items-center gap-2">
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
                    Save Changes
                  </button>
                </div>
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
                {signedInPlayer && (
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="text-xs text-red-600 hover:underline font-semibold"
                  >
                    Sign Out Current Session
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowSignInModal(false)}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold text-xs ml-auto"
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
      {showQrModal && signedInPlayer && (
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

      {/* ============================================================== */}
      {/* 8. PARTNER INVITE TRACKER MODAL */}
      {/* ============================================================== */}
      {partnerInviteModalData && (
        <PartnerInviteTrackerModal
          isOpen={Boolean(partnerInviteModalData)}
          onClose={() => setPartnerInviteModalData(null)}
          teamName={partnerInviteModalData.teamName}
          divisionName={partnerInviteModalData.divisionName}
          tournamentName={partnerInviteModalData.tournamentName}
          tournamentSlug={partnerInviteModalData.tournamentSlug}
          teammateCode={partnerInviteModalData.teammateCode}
          isPrepaid={partnerInviteModalData.isPrepaid}
          initialPartner={partnerInviteModalData.initialPartner}
        />
      )}
    </div>
  );
}
