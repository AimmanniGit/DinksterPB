'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import {
  INITIAL_EVENT,
  INITIAL_DIVISIONS,
  INITIAL_SPONSORS,
  INITIAL_BRACKET_DATA,
} from '../../../constants/initialState';
import { Division } from '../../../types/organizer';
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

  // Confirmation banner state
  const [lastRegisteredPlayer, setLastRegisteredPlayer] = useState<RegisteredPlayerRecord | null>(null);

  const eventName = INITIAL_EVENT.name;
  const eventVenue = INITIAL_EVENT.venue;
  const eventDates = INITIAL_EVENT.dates;
  const totalCourts = INITIAL_EVENT.totalCourts || 8;
  const courtSurface = INITIAL_EVENT.courtSurface || 'Outdoor Acrylic Hardcourt';

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

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-gray-900 font-sans flex flex-col antialiased">
      {/* Top Header - Player-Centric (TV View removed) */}
      <header className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2">
          <div className="text-xl font-bold tracking-tight text-[#0A5C43]">
            dink<span className="text-[#EF9F27]">ster</span>
          </div>
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-600">
            Player Registration Portal
          </span>
        </Link>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleOpenJoinCodeDialog}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 transition flex items-center gap-1.5 border border-gray-200"
          >
            <KeyRound size={13} className="text-gray-500" />
            <span>Have a Teammate Code?</span>
          </button>

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
                <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">Medal Ceremony</span>
                <span className="font-bold text-base text-amber-800">🥇 Gold, 🥈 Silver, 🥉 Bronze</span>
                <p className="text-xs text-gray-600 mt-1">Custom medals awarded at the conclusion of finals matches.</p>
              </div>
            </div>

            {/* Division Selection Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Available Divisions</h2>
                  <p className="text-xs text-gray-500">
                    Registration fee is <strong>per person</strong>. Register individually and invite your partner with a unique code.
                  </p>
                </div>
                <span className="text-xs text-gray-500 font-medium">{INITIAL_DIVISIONS.length} Divisions</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {INITIAL_DIVISIONS.map((div) => (
                  <div
                    key={div.id}
                    className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs hover:border-[#0A5C43]/50 transition flex flex-col justify-between"
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

                      <h3 className="text-base font-bold text-gray-900 mb-2">
                        {div.name}
                      </h3>

                      <div className="space-y-1.5 text-xs text-gray-600 mb-5">
                        <div className="flex justify-between">
                          <span>Skill Level:</span>
                          <strong className="text-gray-900">
                            {div.minDupr === 0 ? 'Open Rating' : `${div.minDupr} - ${div.maxDupr} DUPR`}
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Age Bracket:</span>
                          <span className="text-gray-900 font-medium">All Ages</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Field Limit:</span>
                          <span className="text-gray-900 font-medium">{div.teamCap} Teams Max</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => handleOpenRegistration(div)}
                        className="w-full py-2 bg-[#0A5C43] hover:bg-[#084734] text-white rounded-lg text-xs font-semibold transition shadow-xs"
                      >
                        {div.format.toLowerCase().includes('singles') ? 'Register as Player' : 'Register as Captain'}
                      </button>
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
                    </div>
                  </div>
                ))}
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
            setLastRegisteredPlayer(record);
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
