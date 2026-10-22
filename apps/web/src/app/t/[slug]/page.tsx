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
        setSignedInPlayer(JSON.parse(stored));
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
      fullName: signInEmail.split('@')[0].replace(/[^a-zA-Z]/g, ' ').toUpperCase() || 'ALEX MILLER',
      phone: '(512) 555-0199',
      duprRating: 3.82,
      duprId: '2B48A',
      age: 34,
      registeredDivisions: [
        {
          tournamentSlug: params.slug,
          tournamentName: eventName,
          divisionId: 'A',
          divisionName: "Men's Doubles 3.5 to 4.0",
          teamName: 'Miller & Partner',
          isCaptain: true,
          scheduleDay: 'Saturday',
          teammateCode: 'TM-8492',
          amountPaid: 60,
        },
      ],
    };
    setSignedInPlayer(demoAccount);
    try {
      localStorage.setItem('dinkster_player_session', JSON.stringify(demoAccount));
    } catch (e) {}
    setShowSignInModal(false);
    setSignInOtpSent(false);
    setSignInEmail('');
    setSignInOtp('');
  };

  const handleSignOut = () => {
    setSignedInPlayer(null);
    try {
      localStorage.removeItem('dinkster_player_session');
    } catch (e) {}
    setShowMyRegistrationsDrawer(false);
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
      {/* Top Header - Player-Centric Navigation */}
      <header className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2">
          <div className="text-xl font-bold tracking-tight text-[#0A5C43]">
            dink<span className="text-[#EF9F27]">ster</span>
          </div>
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-600">
            Player Portal
          </span>
        </Link>

        <div className="flex items-center gap-2.5">
          {/* Teammate Code button */}
          <button
            type="button"
            onClick={handleOpenJoinCodeDialog}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 transition flex items-center gap-1.5 border border-gray-200"
          >
            <KeyRound size={13} className="text-gray-500" />
            <span className="hidden sm:inline">Have a Teammate Code?</span>
            <span className="sm:hidden">Join Code</span>
          </button>

          {/* Player Account Sign-In / User Pill */}
          {signedInPlayer ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowMyRegistrationsDrawer(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-[#0A5C43] border border-emerald-200 transition flex items-center gap-1.5"
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
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200 transition flex items-center gap-1.5"
            >
              <LogIn size={13} />
              <span>Sign In / Free Dink Account</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleOpenRegistration(INITIAL_DIVISIONS[0])}
            className="px-4 py-1.5 bg-[#0A5C43] hover:bg-[#084734] text-white rounded-lg text-xs font-semibold transition shadow-xs"
          >
            Register Player
          </button>
        </div>
      </header>

      {/* Teammate Invite Alert Banner (when visiting via shared partner link) */}
      {teammateCodeToJoin && !showRegisterModal && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-[#0A5C43] shrink-0" />
            <span>
              You have an invitation to join team code <strong>{teammateCodeToJoin}</strong>.
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleOpenRegistration(INITIAL_DIVISIONS[0], teammateCodeToJoin)}
            className="px-3 py-1 bg-[#0A5C43] text-white font-semibold rounded-md hover:bg-[#084734]"
          >
            Complete Registration
          </button>
        </div>
      )}

      {/* Hero Section - Clean, Pleasant, Balanced Typography */}
      <section className="bg-gradient-to-b from-[#0A5C43] to-[#0E3D2F] text-white py-10 px-6">
        <div className="max-w-4xl mx-auto space-y-3">
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
              <Calendar size={16} className="text-[#EF9F27]" />
              <span>{eventDates}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin size={16} className="text-[#EF9F27]" />
              <span>{eventVenue}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-emerald-300" />
              <span>DUPR Sanctioned &bull; {courtSurface}</span>
            </div>
          </div>
        </div>
      </section>

      {/* SMART MULTI-DIVISION UPSELL RECOMMENDATION BANNER */}
      {signedInPlayer && eligibleAddonDivisions.length > 0 && playerRegisteredInThisEvent.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-transparent border-b border-amber-300/40 px-6 py-3">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <Sparkles size={16} className="text-[#EF9F27] shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-900 font-bold block">
                  You are eligible to play in multiple divisions!
                </strong>
                <span className="text-gray-600">
                  You are registered in <strong>{playerRegisteredInThisEvent[0].divisionName}</strong> ({playerRegisteredInThisEvent[0].scheduleDay}). You qualify for{' '}
                  <strong className="text-emerald-900">{eligibleAddonDivisions[0].name}</strong> ({eligibleAddonDivisions[0].scheduleDay}) with no schedule conflict.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleOpenRegistration(eligibleAddonDivisions[0])}
              className="px-3.5 py-1.5 bg-[#0A5C43] hover:bg-[#084734] text-white rounded-lg font-semibold shrink-0 shadow-xs flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Add for +${eligibleAddonDivisions[0].entryFee}</span>
              <ArrowRight size={13} />
            </button>
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
                <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">Free Dinkster Account</span>
                <span className="font-bold text-base text-amber-800">Player Profile & Mobile App</span>
                <p className="text-xs text-gray-600 mt-1">Automatic Dinkster ID (`DK-XXXXX`) for match scores & court calls.</p>
              </div>
            </div>

            {/* Division Selection Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Available Divisions</h2>
                  <p className="text-xs text-gray-500">
                    Registration fee is <strong>per person</strong>. Register for multiple divisions across Saturday and Sunday to maximize tournament play.
                  </p>
                </div>
                <span className="text-xs text-gray-500 font-medium">{INITIAL_DIVISIONS.length} Divisions</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {INITIAL_DIVISIONS.map((div) => {
                  const isAlreadyRegistered = playerRegisteredInThisEvent.some((rd) => rd.divisionId === div.id);

                  return (
                    <div
                      key={div.id}
                      className={`bg-white rounded-xl border p-5 shadow-xs transition flex flex-col justify-between ${
                        isAlreadyRegistered ? 'border-emerald-500 ring-1 ring-emerald-500/30' : 'border-gray-200 hover:border-[#0A5C43]/50'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                            {div.format}
                          </span>
                          {/* Fee per person */}
                          <div className="text-right">
                            <span className="text-lg font-bold text-[#0A5C43]">${div.entryFee}</span>
                            <span className="text-xs text-gray-500 font-normal"> / player</span>
                          </div>
                        </div>

                        <h3 className="text-base font-bold text-gray-900 mb-1">
                          {div.name}
                        </h3>

                        {div.scheduleDay && (
                          <div className="text-xs font-semibold text-amber-800 flex items-center gap-1 mb-2">
                            <Clock size={12} />
                            <span>{div.scheduleDay} {div.timeSlot ? `(${div.timeSlot})` : ''}</span>
                          </div>
                        )}

                        <div className="space-y-1 text-xs text-gray-600 mb-5">
                          <div className="flex justify-between">
                            <span>Skill Level:</span>
                            <strong className="text-gray-900">
                              {div.minDupr === 0 ? 'Open Rating' : `${div.minDupr} - ${div.maxDupr} DUPR`}
                            </strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Age Bracket:</span>
                            <span className="text-gray-900 font-medium">{div.ageBracket || 'All Ages'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Field Limit:</span>
                            <span className="text-gray-900 font-medium">{div.teamCap} Teams Max</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-gray-100">
                        {isAlreadyRegistered ? (
                          <div className="py-2 px-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 border border-emerald-200">
                            <Check size={14} className="text-emerald-700" />
                            <span>You are Registered!</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenRegistration(div)}
                            className="w-full py-2 bg-[#0A5C43] hover:bg-[#084734] text-white rounded-lg text-xs font-semibold transition shadow-xs"
                          >
                            {div.format.toLowerCase().includes('singles') ? 'Register Player' : 'Register as Captain'}
                          </button>
                        )}

                        {!isAlreadyRegistered && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDivision(div);
                              handleOpenJoinCodeDialog();
                            }}
                            className="w-full text-center text-[11px] text-[#0A5C43] hover:underline font-medium block"
                          >
                            Have a team code for this division?
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Electronic Waiver Notice */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600 flex items-start gap-3">
              <ShieldCheck size={18} className="text-[#0A5C43] shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-900 block font-semibold mb-0.5">Electronic Player Waiver Required</strong>
                <span>
                  All players must sign the digital liability waiver and concussion safety agreement upon individual registration.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LIVE DRAW & BRACKETS */}
        {activeTab === 'draw' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Live Brackets & Pool Play</h2>
                <p className="text-xs text-gray-500">View real-time match schedules, court assignments, and playoff progressions.</p>
              </div>
            </div>
            <BracketsPlayoffsView />
          </div>
        )}

        {/* TAB 3: SPONSORS */}
        {activeTab === 'sponsors' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Tournament Sponsors & Partners</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {INITIAL_SPONSORS.map((s, idx) => (
                <div key={idx} className="bg-white p-5 rounded-xl border border-gray-200 text-center shadow-xs">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                    {s.tier} Partner
                  </span>
                  <h3 className="text-base font-bold text-gray-900 mt-2">{s.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">Official Court {s.courtAssigned} Sponsor</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* QUICK JOIN CODE MODAL */}
      {showJoinCodeDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">Enter Teammate Invite Code</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                If your captain already registered the team, enter your unique invite code below to join:
              </p>
            </div>

            <form onSubmit={handleSubmitJoinCode} className="space-y-3.5">
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. TM-8429"
                value={inputTeammateCode}
                onChange={(e) => setInputTeammateCode(e.target.value.toUpperCase())}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2 font-mono text-sm font-bold uppercase text-gray-900 focus:outline-none focus:border-[#0A5C43]"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowJoinCodeDialog(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0A5C43] text-white text-xs font-semibold rounded-lg hover:bg-[#084734]"
                >
                  Join Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SIGN IN / FREE DINKSTER ACCOUNT MODAL */}
      {showSignInModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">Sign In to Player Account</h3>
                <p className="text-xs text-gray-500">Access your registrations, DUPR sync & Dinkster ID.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowSignInModal(false)}
                className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {!signInOtpSent ? (
              <form onSubmit={handleSendSignInOtp} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="you@domain.com"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#0A5C43]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-[#0A5C43] hover:bg-[#084734] text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Send One-Time Sign-In Code
                </button>
              </form>
            ) : (
              <form onSubmit={handleConfirmSignInOtp} className="space-y-3">
                <div className="text-xs text-gray-600">
                  Enter code sent to <strong>{signInEmail}</strong>:
                </div>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="e.g. 123456"
                  value={signInOtp}
                  onChange={(e) => setSignInOtp(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm font-mono tracking-widest text-gray-900 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setSignInOtp('123456')}
                  className="text-[11px] text-[#0A5C43] font-semibold hover:underline block"
                >
                  Demo Shortcut: Fill '123456'
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

      {/* MY REGISTRATIONS DRAWER / MODAL */}
      {showMyRegistrationsDrawer && signedInPlayer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-end p-0">
          <div className="bg-white h-full max-w-md w-full p-6 shadow-2xl border-l border-gray-200 overflow-y-auto space-y-5 animate-slide-left">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <User size={18} className="text-[#0A5C43]" />
                <h3 className="text-base font-bold text-gray-900">Player Account</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMyRegistrationsDrawer(false)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Profile Overview Card */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-base text-gray-900">{signedInPlayer.fullName}</h4>
                  <span className="text-xs text-gray-600">{signedInPlayer.email}</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-white font-mono text-xs font-bold text-[#0A5C43] border border-emerald-300">
                  {signedInPlayer.dinksterId}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-600 pt-1">
                <span>DUPR: <strong>{signedInPlayer.duprRating || '3.50'}</strong></span>
                <span>Phone: <strong>{signedInPlayer.phone}</strong></span>
              </div>
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
                      {rd.teammateCode && rd.isCaptain && (
                        <div className="p-2 bg-gray-50 rounded-lg text-xs font-mono flex justify-between items-center">
                          <span>Partner Code: <strong>{rd.teammateCode}</strong></span>
                          <span className="text-[11px] text-[#0A5C43] font-sans font-semibold">Share with partner</span>
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
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600 flex items-center gap-2.5">
              <Smartphone size={20} className="text-[#0A5C43] shrink-0" />
              <span>Use <strong>{signedInPlayer.email}</strong> on the Dinkster mobile app to view match courts, enter scores, and track tournament draws.</span>
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
