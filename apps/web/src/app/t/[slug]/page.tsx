'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
} from 'lucide-react';
import {
  INITIAL_EVENT,
  INITIAL_DIVISIONS,
  INITIAL_SPONSORS,
  INITIAL_BRACKET_DATA,
} from '../../../constants/initialState';
import { Division, PlayerAccount } from '../../../types/organizer';
import { BracketsPlayoffsView } from '../../../components/brackets';
import {
  TournamentRegistrationModal,
  RegisteredPlayerRecord,
} from '../../../components/registration';

interface PublicTournamentPageProps {
  params: {
    slug: string;
  };
}

export default function PublicTournamentPage({ params }: PublicTournamentPageProps) {
  const searchParams = useSearchParams();
  const joinParam = searchParams.get('join') || searchParams.get('team');

  const [activeTab, setActiveTab] = useState<'info' | 'divisions' | 'draw' | 'sponsors'>('info');
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [teammateCodeToJoin, setTeammateCodeToJoin] = useState<string | null>(joinParam);

  // Quick Join Code Dialog State
  const [showJoinCodeDialog, setShowJoinCodeDialog] = useState(false);
  const [inputTeammateCode, setInputTeammateCode] = useState('');

  // Persistent Player Account State (Free Dinkster Account)
  const [signedInPlayer, setSignedInPlayer] = useState<PlayerAccount | null>(null);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [signInEmail, setSignInEmail] = useState('');
  const [signInOtp, setSignInOtp] = useState('');
  const [signInOtpSent, setSignInOtpSent] = useState(false);
  const [showMyRegistrationsDrawer, setShowMyRegistrationsDrawer] = useState(false);

  // Player Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editEmergencyPhone, setEditEmergencyPhone] = useState('');

  // DUPR Upcoming Integration Modal
  const [showDuprModal, setShowDuprModal] = useState(false);
  const [copiedCodeSuccess, setCopiedCodeSuccess] = useState(false);

  const eventName = INITIAL_EVENT.name;
  const eventVenue = INITIAL_EVENT.venue;
  const eventDates = INITIAL_EVENT.dates;
  const totalCourts = INITIAL_EVENT.totalCourts || 8;
  const courtSurface = INITIAL_EVENT.courtSurface || 'Outdoor Acrylic Hardcourt';

  // Restore player session on mount from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('dinkster_player_session');
      if (stored) {
        const parsed = JSON.parse(stored);
        setSignedInPlayer(parsed);
        setEditFullName(parsed.fullName || '');
        setEditPhone(parsed.phone || '');
        setEditAge(parsed.age ? String(parsed.age) : '34');
        setEditEmergencyPhone(parsed.emergencyPhone || '(512) 555-0100');
      }
    } catch (e) {
      // ignore in SSR
    }
  }, []);

  // If a joinParam is detected in the URL, prompt the teammate registration immediately
  useEffect(() => {
    if (joinParam) {
      setTeammateCodeToJoin(joinParam);
      setSelectedDivision(INITIAL_DIVISIONS[0]);
      setShowRegisterModal(true);
    }
  }, [joinParam]);

  const handleOpenRegistration = (division: Division, teamCode?: string) => {
    setSelectedDivision(division);
    setTeammateCodeToJoin(teamCode || null);
    setShowRegisterModal(true);
  };

  const handleOpenJoinCodeDialog = () => {
    setInputTeammateCode('');
    setShowJoinCodeDialog(true);
  };

  const handleSubmitJoinCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputTeammateCode.trim()) return;
    setShowJoinCodeDialog(false);
    setSelectedDivision(INITIAL_DIVISIONS[0]);
    setTeammateCodeToJoin(inputTeammateCode.trim().toUpperCase());
    setShowRegisterModal(true);
  };

  // Handle successful registration: auto-sign in or update player account
  const handleRegistrationComplete = (record: RegisteredPlayerRecord) => {
    const updatedAccount: PlayerAccount = {
      id: record.id,
      dinksterId: record.dinksterId,
      email: record.email,
      fullName: record.fullName,
      phone: record.phone,
      duprRating: record.duprRating,
      duprId: record.duprId,
      age: record.age,
      emergencyName: record.emergencyName,
      emergencyPhone: record.emergencyPhone,
      registeredDivisions: [
        ...(signedInPlayer?.registeredDivisions || []).filter(
          (d) => !(d.tournamentSlug === params.slug && d.divisionId === record.divisionId)
        ),
        {
          tournamentSlug: params.slug,
          tournamentName: eventName,
          divisionId: record.divisionId,
          divisionName: record.divisionName,
          teamName: record.teamName,
          isCaptain: record.isCaptain,
          scheduleDay: record.divisionId === 'A' || record.divisionId === 'C' ? 'Saturday' : 'Sunday',
          teammateCode: record.teammateCode,
          amountPaid: record.amountPaid,
        },
      ],
    };

    setSignedInPlayer(updatedAccount);
    setEditFullName(updatedAccount.fullName);
    setEditPhone(updatedAccount.phone || '');
    setEditAge(updatedAccount.age ? String(updatedAccount.age) : '34');
    try {
      localStorage.setItem('dinkster_player_session', JSON.stringify(updatedAccount));
    } catch (e) {}
  };

  // Sign In handler via Email & OTP
  const handleSendSignInOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail.trim()) return;
    setSignInOtpSent(true);
  };

  const handleConfirmSignInOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const demoAccount: PlayerAccount = {
      id: `PL-${Date.now().toString().slice(-4)}`,
      dinksterId: 'DK-84920',
      email: signInEmail,
      fullName: signInEmail.toLowerCase().includes('alex')
        ? 'Alex Miller'
        : signInEmail.split('@')[0].replace(/[^a-zA-Z]/g, ' ').toUpperCase() || 'ALEX MILLER',
      phone: '(512) 555-0199',
      duprRating: 3.82,
      duprId: '2B48A',
      age: 34,
      emergencyPhone: '(512) 555-0100',
      registeredDivisions: [
        {
          tournamentSlug: params.slug,
          tournamentName: eventName,
          divisionId: 'A',
          divisionName: "Mixed Doubles 3.5 to 4.0",
          teamName: 'Miller & Partner',
          isCaptain: true,
          scheduleDay: 'Saturday',
          teammateCode: 'TP-8492', // Team Pre-Paid code
          amountPaid: 80,
        },
      ],
    };

    setSignedInPlayer(demoAccount);
    setEditFullName(demoAccount.fullName);
    setEditPhone(demoAccount.phone || '');
    setEditAge(String(demoAccount.age || 34));
    setEditEmergencyPhone(demoAccount.emergencyPhone || '(512) 555-0100');

    try {
      localStorage.setItem('dinkster_player_session', JSON.stringify(demoAccount));
    } catch (e) {}

    setShowSignInModal(false);
    setSignInOtpSent(false);
    setSignInEmail('');
    setSignInOtp('');
  };

  const handleSaveProfileUpdates = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signedInPlayer) return;

    const updated: PlayerAccount = {
      ...signedInPlayer,
      fullName: editFullName.trim() || signedInPlayer.fullName,
      phone: editPhone.trim() || signedInPlayer.phone,
      age: parseInt(editAge, 10) || signedInPlayer.age,
      emergencyPhone: editEmergencyPhone.trim() || signedInPlayer.emergencyPhone,
    };

    setSignedInPlayer(updated);
    setIsEditingProfile(false);
    try {
      localStorage.setItem('dinkster_player_session', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleSignOut = () => {
    setSignedInPlayer(null);
    try {
      localStorage.removeItem('dinkster_player_session');
    } catch (e) {}
    setShowMyRegistrationsDrawer(false);
  };

  const copyTeammateCode = (code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCodeSuccess(true);
      setTimeout(() => setCopiedCodeSuccess(false), 2500);
    }
  };

  // Multi-Division Upsell Engine:
  // Identifies divisions the player is NOT yet registered for, checks for non-conflicting schedule days and DUPR eligibility
  const eligibleAddonDivisions = useMemo(() => {
    if (!signedInPlayer) return [];

    const registeredDivIds = signedInPlayer.registeredDivisions
      .filter((rd) => rd.tournamentSlug === params.slug)
      .map((rd) => rd.divisionId);

    const registeredDays = signedInPlayer.registeredDivisions
      .filter((rd) => rd.tournamentSlug === params.slug)
      .map((rd) => rd.scheduleDay)
      .filter(Boolean);

    return INITIAL_DIVISIONS.filter((div) => {
      // 1. Not already registered
      if (registeredDivIds.includes(div.id)) return false;

      // 2. Schedule Day non-conflict check (prefer divisions on separate days!)
      const isDifferentDay = !registeredDays.includes(div.scheduleDay);

      // 3. DUPR Rating check
      const rating = signedInPlayer.duprRating || 3.5;
      const isDuprEligible =
        div.minDupr === 0 ||
        (rating >= div.minDupr - 0.25 && rating <= div.maxDupr + 0.1);

      return isDifferentDay && isDuprEligible;
    });
  }, [signedInPlayer, params.slug]);

  const playerRegisteredInThisEvent = useMemo(() => {
    if (!signedInPlayer) return [];
    return signedInPlayer.registeredDivisions.filter((rd) => rd.tournamentSlug === params.slug);
  }, [signedInPlayer, params.slug]);

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-gray-900 font-sans flex flex-col antialiased">
      {/* Top Header - Streamlined to ONLY 'Have a Team Code' and 'Sign In / Register' */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="text-xl font-bold tracking-tight text-[#0A5C43]">
              dink<span className="text-[#EF9F27]">ster</span>
            </div>
          </Link>
          <span className="text-gray-300 font-normal">/</span>
          <Link
            href="/portal"
            className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-[#0A5C43] border border-emerald-200 transition flex items-center gap-1"
            title="Return to Player Portal Home"
          >
            <span>Player Home</span>
            <ArrowRight size={10} />
          </Link>
        </div>

        <div className="flex items-center gap-2.5">
          {/* 1. Teammate Code button */}
          <button
            type="button"
            onClick={handleOpenJoinCodeDialog}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-50 hover:bg-gray-100 text-gray-800 transition flex items-center gap-1.5 border border-gray-200"
          >
            <KeyRound size={13} className="text-[#0A5C43]" />
            <span className="hidden sm:inline">Have a Team Code?</span>
            <span className="sm:hidden">Team Code</span>
          </button>

          {/* 2. Player Account Sign-In / Register / User Pill */}
          {signedInPlayer ? (
            <div className="flex items-center gap-2">
              <Link
                href="/portal"
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-50 hover:bg-gray-100 text-gray-700 transition flex items-center gap-1.5 border border-gray-200"
                title="Go to My Player Home Dashboard"
              >
                <Trophy size={13} className="text-[#0A5C43]" />
                <span className="hidden md:inline">My Player Dashboard</span>
              </Link>

              <button
                type="button"
                onClick={() => setShowMyRegistrationsDrawer(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-[#0A5C43] border border-emerald-300 transition flex items-center gap-2 shadow-2xs"
              >
                <User size={13} className="text-[#0A5C43]" />
                <span className="font-bold">{signedInPlayer.fullName.split(' ')[0]}</span>
                <span className="font-mono text-[10px] px-1.5 py-0.2 bg-white rounded border border-emerald-300 text-emerald-800">
                  {signedInPlayer.dinksterId}
                </span>
                {playerRegisteredInThisEvent.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                title="Sign Out"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowSignInModal(true)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#0A5C43] hover:bg-[#084734] text-white transition flex items-center gap-1.5 shadow-2xs"
            >
              <LogIn size={13} />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </header>

      {/* Teammate Invite Alert Banner (when visiting via shared partner link) */}
      {teammateCodeToJoin && !showRegisterModal && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-[#0A5C43] shrink-0" />
            <span>
              You have an invitation to join team code <strong>{teammateCodeToJoin}</strong>{' '}
              ({teammateCodeToJoin.startsWith('TP-') ? 'Pre-Paid by Captain ($0 cost)' : 'Partner Self-Pay'}).
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleOpenRegistration(INITIAL_DIVISIONS[0], teammateCodeToJoin)}
            className="px-3 py-1 bg-[#0A5C43] text-white font-semibold rounded-md hover:bg-[#084734]"
          >
            Join Team
          </button>
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#0A5C43] to-[#0E3D2F] text-white py-9 px-6">
        <div className="max-w-4xl mx-auto space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EF9F27] text-black">
              Official Tournament
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-emerald-200 border border-white/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Registration Open
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            {eventName}
          </h1>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs md:text-sm text-white/90 pt-1">
            <div className="flex items-center gap-1.5">
              <Calendar size={15} className="text-[#EF9F27]" />
              <span>{eventDates}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin size={15} className="text-[#EF9F27]" />
              <span>{eventVenue}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-emerald-300" />
              <span>DUPR Sanctioned &bull; {courtSurface}</span>
            </div>
          </div>
        </div>
      </section>

      {/* PROMINENT HIGHLIGHTED ROW FOR SIGNED-IN PLAYER */}
      {signedInPlayer && (
        <div className="bg-[#FAF8F3] px-6 pt-5 pb-1">
          <div className="max-w-4xl mx-auto">
            {playerRegisteredInThisEvent.length > 0 ? (
              /* PLAYER IS REGISTERED: SHOW STATUS CONFIRMATION & TEAMS + NON-PUSHY UPSELL */
              <div className="bg-white rounded-2xl p-4 border-2 border-emerald-500 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#0A5C43] flex items-center justify-center font-bold shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          Registered Player
                        </span>
                        <span className="text-xs font-bold text-gray-900">
                          {signedInPlayer.fullName} ({signedInPlayer.dinksterId})
                        </span>
                      </div>
                      <div className="text-sm font-bold text-[#0A5C43] mt-1">
                        You are registered for {playerRegisteredInThisEvent.map((r) => r.divisionName).join(', ')}
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5 flex items-center gap-2 flex-wrap">
                        <span>Team: <strong>{playerRegisteredInThisEvent[0].teamName}</strong></span>
                        <span>&bull;</span>
                        <span>
                          Partner Code:{' '}
                          <strong className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-900 border">
                            {playerRegisteredInThisEvent[0].teammateCode}
                          </strong>{' '}
                          ({playerRegisteredInThisEvent[0].teammateCode?.startsWith('TP-') ? 'Team Pre-paid' : 'Team Unpaid'})
                        </span>
                        <button
                          type="button"
                          onClick={() => copyTeammateCode(playerRegisteredInThisEvent[0].teammateCode || '')}
                          className="text-[#0A5C43] hover:underline font-semibold flex items-center gap-0.5"
                        >
                          {copiedCodeSuccess ? <Check size={12} /> : <Copy size={12} />}
                          <span>{copiedCodeSuccess ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowMyRegistrationsDrawer(true)}
                    className="px-3.5 py-1.5 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-semibold transition self-start sm:self-auto shrink-0 shadow-2xs"
                  >
                    View Account & Team Details &rarr;
                  </button>
                </div>

                {/* Non-Pushy Multi-Division Add-On Recommendation */}
                {eligibleAddonDivisions.length > 0 && (
                  <div className="pt-2.5 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50/50 p-2.5 rounded-xl text-xs">
                    <div className="flex items-center gap-2">
                      <Sparkles size={15} className="text-[#EF9F27] shrink-0" />
                      <span className="text-emerald-950">
                        <strong>Eligible to play another division!</strong> Enter{' '}
                        <strong className="text-[#0A5C43]">{eligibleAddonDivisions[0].name}</strong> on{' '}
                        <strong>{eligibleAddonDivisions[0].scheduleDay || 'Sunday'}</strong> with no schedule conflict.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenRegistration(eligibleAddonDivisions[0])}
                      className="px-3 py-1.5 bg-[#0A5C43] hover:bg-[#084734] text-white rounded-lg font-semibold text-xs transition whitespace-nowrap self-start sm:self-auto shadow-2xs"
                    >
                      Add Division (+${eligibleAddonDivisions[0].entryFee})
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* PLAYER IS SIGNED IN BUT NOT REGISTERED IN THIS EVENT */
              <div className="bg-white rounded-2xl p-4 border border-emerald-300 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#0A5C43] flex items-center justify-center font-bold shrink-0">
                    <User size={15} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">
                      Welcome, {signedInPlayer.fullName}! (Dinkster ID: {signedInPlayer.dinksterId})
                    </div>
                    <p className="text-gray-600 mt-0.5">
                      Based on your DUPR rating ({signedInPlayer.duprRating || '3.50'}), we recommend entering{' '}
                      <strong>{INITIAL_DIVISIONS[0].name}</strong>.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenRegistration(INITIAL_DIVISIONS[0])}
                  className="px-3.5 py-2 bg-[#0A5C43] hover:bg-[#084734] text-white rounded-xl font-bold transition shadow-xs whitespace-nowrap self-start sm:self-auto"
                >
                  Register for {INITIAL_DIVISIONS[0].name.split(' ')[0]} &rarr;
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-[53px] z-30 px-6">
        <div className="max-w-4xl mx-auto flex items-center gap-6 overflow-x-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`py-3 border-b-2 transition whitespace-nowrap ${
              activeTab === 'info'
                ? 'border-[#0A5C43] text-[#0A5C43] font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Overview & Divisions
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('draw')}
            className={`py-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'draw'
                ? 'border-[#0A5C43] text-[#0A5C43] font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Trophy size={14} />
            Live Draw & Brackets
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sponsors')}
            className={`py-3 border-b-2 transition whitespace-nowrap ${
              activeTab === 'sponsors'
                ? 'border-[#0A5C43] text-[#0A5C43] font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Sponsors & Partners
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-6 py-8 flex-1 w-full space-y-8">
        
        {/* TAB 1: OVERVIEW & AVAILABLE DIVISIONS */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            {/* Quick Highlights Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">Competition Format</span>
                <span className="font-bold text-base text-gray-900">Pool Play &rarr; Medal Playoffs</span>
                <p className="text-xs text-gray-600 mt-1">Guaranteed 4+ matches per team in round-robin pools before playoffs.</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">Rating System</span>
                <span className="font-bold text-base text-emerald-800">Verified DUPR Export</span>
                <p className="text-xs text-gray-600 mt-1">Match scores automatically submit to DUPR player profiles.</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">Schedule & Courts</span>
                <span className="font-bold text-base text-gray-900">{totalCourts} Dedicated Courts</span>
                <p className="text-xs text-gray-600 mt-1">Surface: {courtSurface} &bull; Franklin X-40 tournament balls.</p>
              </div>
            </div>

            {/* Divisions List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Competition Divisions</h2>
                  <p className="text-xs text-gray-500">Entry fee is per player. Select your division below.</p>
                </div>
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {INITIAL_DIVISIONS.length} Divisions Open
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {INITIAL_DIVISIONS.map((div) => {
                  const isPlayerRegisteredInThisDiv = playerRegisteredInThisEvent.some((r) => r.divisionId === div.id);

                  return (
                    <div
                      key={div.id}
                      className={`bg-white rounded-xl border p-5 transition shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        isPlayerRegisteredInThisDiv
                          ? 'border-emerald-500 ring-1 ring-emerald-500/20 bg-emerald-50/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base font-bold text-gray-900">{div.name}</span>
                          {div.isPilot && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold text-[10px] rounded-full">
                              Pilot Rules
                            </span>
                          )}
                          {isPlayerRegisteredInThisDiv && (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full flex items-center gap-1">
                              <Check size={11} /> Registered
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
                          <span>
                            DUPR Range: <strong>{div.minDupr === 0 ? 'All Levels' : `${div.minDupr} - ${div.maxDupr}`}</strong>
                          </span>
                          <span>&bull;</span>
                          <span>Format: <strong>{div.format}</strong></span>
                          <span>&bull;</span>
                          <span>Cap: <strong>{div.teamCap} teams</strong></span>
                          {div.scheduleDay && (
                            <>
                              <span>&bull;</span>
                              <span className="text-emerald-800 font-semibold">Schedule: {div.scheduleDay}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 self-end md:self-auto">
                        <div className="text-right">
                          <div className="text-lg font-bold text-[#0A5C43]">${div.entryFee}</div>
                          <span className="text-[10px] text-gray-400 block font-semibold">per player</span>
                        </div>

                        {isPlayerRegisteredInThisDiv ? (
                          <button
                            type="button"
                            onClick={() => setShowMyRegistrationsDrawer(true)}
                            className="px-4 py-2 bg-emerald-50 border border-emerald-300 text-[#0A5C43] font-bold text-xs rounded-lg hover:bg-emerald-100 transition"
                          >
                            View Team
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenRegistration(div)}
                            className="px-4 py-2 bg-[#0A5C43] hover:bg-[#084734] text-white font-semibold text-xs rounded-lg transition shadow-xs flex items-center gap-1"
                          >
                            <span>Register</span>
                            <ArrowRight size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* DINKSTER MOBILE APP PROMO */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0A5C43] flex items-center justify-center shrink-0">
                  <Smartphone size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Download the Dinkster Mobile App</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    View live match court assignments, get push notifications when your team is called, and self-report scores.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-gray-100 text-gray-700">
                  iOS & Android
                </span>
                <span className="text-xs font-bold text-[#0A5C43] bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
                  Free
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LIVE DRAW & BRACKETS */}
        {activeTab === 'draw' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Live Tournament Draw & Standings</h3>
                <p className="text-xs text-gray-500">Real-time match scores updated directly from referee scorecards and desk.</p>
              </div>
              <span className="text-xs font-mono font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                Live Feed
              </span>
            </div>
            <BracketsPlayoffsView />
          </div>
        )}

        {/* TAB 3: SPONSORS */}
        {activeTab === 'sponsors' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs text-center space-y-4">
              <h2 className="text-lg font-bold text-gray-900">Official Tournament Partners</h2>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Thank you to the brand partners supporting the {eventName}.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                {INITIAL_SPONSORS.map((sp, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex flex-col items-center justify-center">
                    <span className="font-bold text-sm text-gray-900">{sp.name}</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mt-1">
                      {sp.tier} Partner
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* QUICK JOIN CODE MODAL (Dialog) */}
      {showJoinCodeDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <KeyRound size={16} className="text-[#0A5C43]" />
                <h3 className="text-base font-bold text-gray-900">Join Team</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowJoinCodeDialog(false)}
                className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitJoinCode} className="space-y-3 text-xs">
              <p className="text-gray-600">
                Enter the team partner invite code (e.g. <strong>TP-8492</strong> for pre-paid or <strong>TU-8492</strong>) provided by your team captain.
              </p>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Partner Invite Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TP-8492 or TU-8492"
                  value={inputTeammateCode}
                  onChange={(e) => setInputTeammateCode(e.target.value.toUpperCase())}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-center text-sm font-mono font-bold text-gray-900 uppercase focus:outline-none focus:border-[#0A5C43]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-[#0A5C43] hover:bg-[#084734] text-white rounded-lg font-semibold shadow-xs transition"
              >
                Join Partner &rarr;
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SIGN IN / REGISTER WITH EMAIL OTP MODAL */}
      {showSignInModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <User size={16} className="text-[#0A5C43]" />
                <h3 className="text-base font-bold text-gray-900">Sign In / Register</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowSignInModal(false);
                  setSignInOtpSent(false);
                }}
                className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {!signInOtpSent ? (
              <form onSubmit={handleSendSignInOtp} className="space-y-3 text-xs">
                <p className="text-gray-600">
                  Enter your email to sign in or register for your free Dinkster Player Account.
                </p>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. alex@example.com"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#0A5C43]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#0A5C43] hover:bg-[#084734] text-white rounded-lg font-semibold shadow-xs transition"
                >
                  Send One-Time Code
                </button>
              </form>
            ) : (
              <form onSubmit={handleConfirmSignInOtp} className="space-y-3 text-xs">
                <p className="text-gray-600">
                  We sent a 6-digit code to <strong>{signInEmail}</strong>.
                </p>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Enter Code</label>
                  <input
                    type="text"
                    required
                    placeholder="123456"
                    maxLength={6}
                    value={signInOtp}
                    onChange={(e) => setSignInOtp(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-center text-lg font-mono text-gray-900 focus:outline-none focus:border-[#0A5C43]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setSignInOtp('123456')}
                  className="text-[11px] text-[#0A5C43] font-semibold hover:underline block"
                >
                  Demo Shortcut: Fill &apos;123456&apos;
                </button>
                <button
                  type="submit"
                  className="w-full py-2 bg-[#0A5C43] hover:bg-[#084734] text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Verify & Sign In
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MY REGISTRATIONS & PROFILE DRAWER */}
      {showMyRegistrationsDrawer && signedInPlayer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-end p-0">
          <div className="bg-white h-full max-w-md w-full p-6 shadow-2xl border-l border-gray-200 overflow-y-auto space-y-5">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <User size={18} className="text-[#0A5C43]" />
                <h3 className="text-base font-bold text-gray-900">Player Profile & Account</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowMyRegistrationsDrawer(false);
                  setIsEditingProfile(false);
                }}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Profile Details Card (View & Edit Modes) */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-base text-gray-900">{signedInPlayer.fullName}</h4>
                  <span className="text-xs text-gray-600">{signedInPlayer.email}</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-white font-mono text-xs font-bold text-[#0A5C43] border border-emerald-300">
                  {signedInPlayer.dinksterId}
                </span>
              </div>

              {!isEditingProfile ? (
                /* VIEW PROFILE MODE */
                <div className="space-y-2 pt-1 border-t text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Phone:</span>
                    <strong className="text-gray-900">{signedInPlayer.phone || 'Not provided'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Age:</span>
                    <strong className="text-gray-900">{signedInPlayer.age || '34'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Emergency Contact:</span>
                    <strong className="text-gray-900">{signedInPlayer.emergencyPhone || '(512) 555-0100'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>DUPR Rating:</span>
                    <strong className="text-emerald-800">{signedInPlayer.duprRating || '3.50'}</strong>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(true)}
                      className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Edit2 size={13} />
                      <span>Edit Profile Details</span>
                    </button>

                    {/* CONNECT WITH DUPR BUTTON */}
                    <button
                      type="button"
                      onClick={() => setShowDuprModal(true)}
                      className="px-3 py-1.5 bg-[#EF9F27] hover:bg-[#d88c1c] text-black rounded-lg text-xs font-bold flex items-center gap-1 transition shadow-2xs"
                    >
                      <Zap size={13} />
                      <span>Connect with DUPR</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* EDIT PROFILE MODE */
                <form onSubmit={handleSaveProfileUpdates} className="space-y-2.5 pt-2 border-t text-xs">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-0.5">Full Name</label>
                    <input
                      type="text"
                      required
                      value={editFullName}
                      onChange={(e) => setEditFullName(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-0.5">Mobile Phone</label>
                    <input
                      type="tel"
                      required
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-900"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-gray-700 block mb-0.5">Age</label>
                      <input
                        type="number"
                        value={editAge}
                        onChange={(e) => setEditAge(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-0.5">Emergency Phone</label>
                      <input
                        type="tel"
                        value={editEmergencyPhone}
                        onChange={(e) => setEditEmergencyPhone(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-900"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      className="flex-1 py-1.5 bg-[#0A5C43] text-white rounded font-bold text-xs hover:bg-[#084734]"
                    >
                      Save Updates
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded font-semibold text-xs hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Registered Divisions in this Event */}
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Your Registrations ({playerRegisteredInThisEvent.length})
              </h4>
              {playerRegisteredInThisEvent.length === 0 ? (
                <div className="p-4 text-center bg-gray-50 rounded-xl text-xs text-gray-500">
                  You are not registered in any divisions for this tournament yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {playerRegisteredInThisEvent.map((rd, i) => (
                    <div key={i} className="p-4 rounded-xl border border-gray-200 bg-white space-y-2 shadow-xs">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-sm text-gray-900">{rd.divisionName}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          Confirmed
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        <span>Team: <strong>{rd.teamName}</strong> ({rd.isCaptain ? 'Captain' : 'Partner'})</span>
                      </div>
                      {rd.teammateCode && (
                        <div className="p-2.5 bg-gray-50 rounded-lg text-xs flex justify-between items-center border">
                          <div>
                            <span className="font-mono font-bold text-gray-900">{rd.teammateCode}</span>
                            <span className="text-[10px] text-gray-500 block">
                              {rd.teammateCode.startsWith('TP-') ? 'Team Paid (Partner joins for $0)' : 'Team Unpaid (Partner pays upon joining)'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyTeammateCode(rd.teammateCode || '')}
                            className="text-[#0A5C43] font-semibold text-xs hover:underline flex items-center gap-1"
                          >
                            {copiedCodeSuccess ? <Check size={12} /> : <Copy size={12} />}
                            <span>{copiedCodeSuccess ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Smart Multi-Division Add-On Upsell in Drawer */}
            {eligibleAddonDivisions.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-600" />
                  Recommended Add-on Division
                </span>
                <p className="text-xs text-amber-900">
                  You qualify for <strong>{eligibleAddonDivisions[0].name}</strong> ({eligibleAddonDivisions[0].scheduleDay}) with no schedule conflict!
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowMyRegistrationsDrawer(false);
                    handleOpenRegistration(eligibleAddonDivisions[0]);
                  }}
                  className="w-full py-2 bg-[#0A5C43] text-white rounded-lg text-xs font-semibold hover:bg-[#084734]"
                >
                  Register for +${eligibleAddonDivisions[0].entryFee}
                </button>
              </div>
            )}

            {/* Dinkster Mobile App Access Callout */}
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-center gap-3">
              <Smartphone size={22} className="text-[#0A5C43] shrink-0" />
              <div>
                <strong className="block font-bold">Download Dinkster Mobile App</strong>
                <span className="text-[11px] text-emerald-900">
                  Sign in with <strong>{signedInPlayer.email}</strong> on iOS & Android to view live court numbers, get match push notifications, and enter scores.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              className="w-full py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
            >
              Sign Out of Dinkster
            </button>
          </div>
        </div>
      )}

      {/* DUPR UPCOMING FEATURE MODAL */}
      {showDuprModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EF9F27] text-black">
                  Upcoming Feature
                </span>
                <h3 className="text-sm font-bold text-gray-900">Connect with DUPR</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDuprModal(false)}
                className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-600 leading-relaxed">
              <p>
                <strong>Official DUPR API sync is under active development.</strong>
              </p>
              <p>
                Once live, connecting your DUPR profile will automatically sync your verified ratings and make DUPR-sanctioned division registration mandatory and seamless.
              </p>
              <p className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-[11px]">
                Currently, your scores are recorded and exported at tournament conclusion for manual DUPR rating submission.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowDuprModal(false)}
              className="w-full py-2 bg-gray-900 text-white rounded-xl text-xs font-semibold hover:bg-black"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {/* COMPREHENSIVE INDIVIDUAL PLAYER REGISTRATION MODAL */}
      {selectedDivision && (
        <TournamentRegistrationModal
          isOpen={showRegisterModal}
          onClose={() => {
            setShowRegisterModal(false);
            setTeammateCodeToJoin(null);
          }}
          event={INITIAL_EVENT}
          division={selectedDivision}
          eventSlug={params.slug}
          existingTeamCode={teammateCodeToJoin}
          onRegistrationSuccess={(record) => {
            handleRegistrationComplete(record);
          }}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 px-6 text-center text-xs text-gray-500">
        <p>&copy; {new Date().getFullYear()} Dinkster Pickleball Platform. All player profiles securely stored.</p>
      </footer>
    </div>
  );
}
