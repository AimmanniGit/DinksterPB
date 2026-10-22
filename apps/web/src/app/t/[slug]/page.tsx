'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Calendar,
  MapPin,
  Users,
  ShieldCheck,
  CheckCircle2,
  Tv,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  CreditCard,
  Medal,
} from 'lucide-react';
import {
  INITIAL_EVENT,
  INITIAL_DIVISIONS,
  INITIAL_SPONSORS,
  INITIAL_BRACKET_DATA,
} from '../../../constants/initialState';
import { Division } from '../../../types/organizer';
import { BracketsPlayoffsView } from '../../../components/brackets';

interface PublicTournamentPageProps {
  params: {
    slug: string;
  };
}

export default function PublicTournamentPage({ params }: PublicTournamentPageProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'divisions' | 'draw' | 'sponsors'>('info');
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Registration Form State
  const [teamName, setTeamName] = useState('');
  const [player1Name, setPlayer1Name] = useState('');
  const [player1Email, setPlayer1Email] = useState('');
  const [player1Dupr, setPlayer1Dupr] = useState('');
  const [player1DinkId, setPlayer1DinkId] = useState('DK-');
  const [player2Name, setPlayer2Name] = useState('');
  const [player2Email, setPlayer2Email] = useState('');
  const [player2Dupr, setPlayer2Dupr] = useState('');
  const [waiverAgreed, setWaiverAgreed] = useState(false);
  const [confirmedRegistrationId, setConfirmedRegistrationId] = useState<string | null>(null);

  const eventName = INITIAL_EVENT.name;
  const eventVenue = INITIAL_EVENT.venue;
  const eventDates = INITIAL_EVENT.dates;

  const handleOpenRegistration = (division: Division) => {
    setSelectedDivision(division);
    setShowRegisterModal(true);
    setConfirmedRegistrationId(null);
    setTeamName('');
  };

  const handleCompleteRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waiverAgreed) return;
    const refCode = `REG-${Math.floor(10000 + Math.random() * 90000)}`;
    setConfirmedRegistrationId(refCode);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-gray-900 font-sans flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2">
          <div className="font-display font-black text-2xl tracking-tight text-[#0A5C43]">
            dink<span className="text-[#EF9F27]">ster</span>
          </div>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-600">
            Tournaments
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/tv"
            target="_blank"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition flex items-center gap-1.5 shadow-sm"
          >
            <Tv size={14} className="text-emerald-400" />
            Live TV Jumbotron
          </Link>
          <button
            onClick={() => {
              setSelectedDivision(INITIAL_DIVISIONS[0]);
              setShowRegisterModal(true);
            }}
            className="px-4 py-2 bg-[#0A5C43] text-white rounded-xl text-xs font-extrabold hover:opacity-95 transition shadow-sm"
          >
            Register Team
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#0A5C43] to-[#0E3D2F] text-white py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#EF9F27] text-black shadow-sm">
              Official Tournament
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-emerald-300 border border-white/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Registration Open
            </span>
          </div>

          <h1 className="font-display font-black text-4xl md:text-5xl tracking-tight mb-4 text-white">
            {eventName}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-white/90">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-[#EF9F27]" />
              <span>{eventDates}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-[#EF9F27]" />
              <span>{eventVenue}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-400" />
              <span>DUPR Sanctioned &bull; 8 Dedicated Courts</span>
            </div>
          </div>
        </div>
      </section>

      {/* Segment Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-[65px] z-30 px-6">
        <div className="max-w-5xl mx-auto flex items-center gap-8 overflow-x-auto text-sm font-bold">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-3.5 border-b-2 transition whitespace-nowrap ${
              activeTab === 'info'
                ? 'border-[#0A5C43] text-[#0A5C43]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Overview & Divisions
          </button>
          <button
            onClick={() => setActiveTab('draw')}
            className={`py-3.5 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'draw'
                ? 'border-[#0A5C43] text-[#0A5C43]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Trophy size={15} />
            Live Draw & Brackets
          </button>
          <button
            onClick={() => setActiveTab('sponsors')}
            className={`py-3.5 border-b-2 transition whitespace-nowrap ${
              activeTab === 'sponsors'
                ? 'border-[#0A5C43] text-[#0A5C43]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Sponsors & Partners
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-6 py-8 flex-1 w-full">
        {/* TAB 1: OVERVIEW & DIVISIONS */}
        {activeTab === 'info' && (
          <div className="space-y-8">
            {/* Quick Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Format</span>
                <span className="font-extrabold text-lg text-gray-900">Round Robin &rarr; Playoffs</span>
                <p className="text-xs text-gray-600 mt-1">Guaranteed 4+ matches per team in pool play before medal brackets.</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">DUPR Rating</span>
                <span className="font-extrabold text-lg text-emerald-800">Verified Submission</span>
                <p className="text-xs text-gray-600 mt-1">All match results automatically sync to official DUPR accounts.</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Awards</span>
                <span className="font-extrabold text-lg text-amber-700">🥇 🥈 🥉 Medals</span>
                <p className="text-xs text-gray-600 mt-1">Custom medals awarded for 1st, 2nd, and 3rd place finishes.</p>
              </div>
            </div>

            {/* Division Selection Cards */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-2xl text-gray-900">Available Divisions</h2>
                <span className="text-xs text-gray-500 font-semibold">Select a division to register</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {INITIAL_DIVISIONS.map((div) => (
                  <div
                    key={div.id}
                    className="bg-white rounded-3xl border border-gray-200 p-6 flex flex-col justify-between shadow-sm hover:border-[#0A5C43] transition-all group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider bg-gray-100 text-gray-700">
                          {div.format}
                        </span>
                        <span className="text-xl font-black text-[#0A5C43]">
                          ${div.entryFee}
                          <span className="text-xs text-gray-500 font-medium">/team</span>
                        </span>
                      </div>

                      <h3 className="font-extrabold text-lg text-gray-900 mb-2 group-hover:text-[#0A5C43] transition">
                        {div.name}
                      </h3>

                      <div className="space-y-1.5 text-xs text-gray-600 mb-6">
                        <div className="flex items-center justify-between">
                          <span>Skill Level:</span>
                          <strong className="text-gray-900">
                            {div.minDupr === 0 ? 'Open' : `${div.minDupr} - ${div.maxDupr} DUPR`}
                          </strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Field Limit:</span>
                          <strong className="text-gray-900">{div.teamCap} Teams Max</strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Spots Filled:</span>
                          <span className="text-emerald-700 font-bold">14 / {div.teamCap} (2 Left)</span>
                        </div>
                      </div>

                      {/* Capacity Bar */}
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-6">
                        <div className="h-full bg-[#0A5C43] rounded-full w-[85%]" />
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenRegistration(div)}
                      className="w-full py-3 bg-[#0A5C43] hover:bg-[#0E3D2F] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
                    >
                      <span>Register for ${div.entryFee}</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LIVE DRAW & BRACKETS */}
        {activeTab === 'draw' && (
          <div className="space-y-6">
            <BracketsPlayoffsView />
          </div>
        )}

        {/* TAB 3: SPONSORS */}
        {activeTab === 'sponsors' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-gray-200 p-8 text-center">
              <h2 className="font-display font-bold text-2xl mb-2">Tournament Sponsors & Court Partners</h2>
              <p className="text-sm text-gray-600 max-w-xl mx-auto mb-8">
                Thank you to our premier sponsors providing tournament balls, court naming rights, and hydration stations.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {INITIAL_SPONSORS.map((s) => (
                  <div key={s.name} className="p-6 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col items-center">
                    <span className="w-12 h-12 rounded-2xl bg-emerald-600/10 text-[#0A5C43] flex items-center justify-center font-black text-xl mb-3">
                      {s.name[0]}
                    </span>
                    <h3 className="font-extrabold text-base text-gray-900">{s.name}</h3>
                    <span className="text-xs text-amber-700 font-bold uppercase tracking-wider mt-1">
                      {s.tier} Partner
                    </span>
                    {s.courtAssigned && (
                      <span className="text-xs text-gray-500 font-medium mt-2">
                        Official Court {s.courtAssigned} Naming Rights
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* REGISTRATION MODAL */}
      {showRegisterModal && selectedDivision && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            {!confirmedRegistrationId ? (
              <form onSubmit={handleCompleteRegistration} className="space-y-5">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div>
                    <span className="text-xs font-bold text-[#0A5C43] uppercase tracking-wider">
                      Registration Form
                    </span>
                    <h3 className="font-display font-bold text-2xl text-gray-900">
                      {selectedDivision.name}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowRegisterModal(false)}
                    className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center font-bold"
                  >
                    ✕
                  </button>
                </div>

                {/* Team Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Team Name (defaults to player initials if blank)
                  </label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder='e.g. "Miller & Smith" or "The Dinkers"'
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#0A5C43] outline-none"
                  />
                </div>

                {/* Player 1 Section */}
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                  <span className="text-xs font-extrabold uppercase text-[#0A5C43] tracking-wider block">
                    Player 1 (Team Captain)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      required
                      type="text"
                      placeholder="Full Name"
                      value={player1Name}
                      onChange={(e) => setPlayer1Name(e.target.value)}
                      className="px-3.5 py-2 rounded-xl border border-gray-300 text-xs outline-none bg-white"
                    />
                    <input
                      required
                      type="email"
                      placeholder="Email Address"
                      value={player1Email}
                      onChange={(e) => setPlayer1Email(e.target.value)}
                      className="px-3.5 py-2 rounded-xl border border-gray-300 text-xs outline-none bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="DUPR ID (e.g. 2A4B8)"
                      value={player1Dupr}
                      onChange={(e) => setPlayer1Dupr(e.target.value)}
                      className="px-3.5 py-2 rounded-xl border border-gray-300 text-xs outline-none bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Dinkster ID (e.g. DK-49281)"
                      value={player1DinkId}
                      onChange={(e) => setPlayer1DinkId(e.target.value)}
                      className="px-3.5 py-2 rounded-xl border border-gray-300 text-xs outline-none bg-white font-mono uppercase"
                    />
                  </div>
                </div>

                {/* Player 2 Section */}
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                  <span className="text-xs font-extrabold uppercase text-[#0A5C43] tracking-wider block">
                    Player 2 (Partner)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      required
                      type="text"
                      placeholder="Partner Full Name"
                      value={player2Name}
                      onChange={(e) => setPlayer2Name(e.target.value)}
                      className="px-3.5 py-2 rounded-xl border border-gray-300 text-xs outline-none bg-white"
                    />
                    <input
                      required
                      type="email"
                      placeholder="Partner Email"
                      value={player2Email}
                      onChange={(e) => setPlayer2Email(e.target.value)}
                      className="px-3.5 py-2 rounded-xl border border-gray-300 text-xs outline-none bg-white"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Partner DUPR ID"
                    value={player2Dupr}
                    onChange={(e) => setPlayer2Dupr(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs outline-none bg-white"
                  />
                </div>

                {/* Digital Liability Waiver Checkbox */}
                <label className="flex items-start gap-2.5 text-xs text-gray-600 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={waiverAgreed}
                    onChange={(e) => setWaiverAgreed(e.target.checked)}
                    className="mt-0.5 rounded text-[#0A5C43] focus:ring-[#0A5C43]"
                  />
                  <span>
                    I agree to the <strong>Dinkster Tournament Rules & Participant Waiver</strong>. I certify that my partner and I meet the DUPR rating criteria for this division.
                  </span>
                </label>

                {/* Pricing Summary & Checkout Button */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-500 block">Total Entry Fee:</span>
                    <span className="text-2xl font-black text-[#0A5C43]">${selectedDivision.entryFee}</span>
                  </div>
                  <button
                    type="submit"
                    disabled={!waiverAgreed}
                    className={`px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition ${
                      waiverAgreed
                        ? 'bg-[#0A5C43] hover:bg-[#0E3D2F] text-white'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <CreditCard size={16} />
                    <span>Pay with Stripe (${selectedDivision.entryFee})</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Confirmation Receipt View */
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#0A5C43] mx-auto flex items-center justify-center">
                  <CheckCircle2 size={36} />
                </div>
                <div>
                  <h3 className="font-display font-black text-2xl text-gray-900">Registration Confirmed!</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Your team is registered in <strong>{selectedDivision.name}</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 font-mono text-sm inline-block">
                  <span className="text-xs text-gray-500 uppercase block font-sans font-bold">Confirmation Reference</span>
                  <span className="text-xl font-black text-[#0A5C43]">{confirmedRegistrationId}</span>
                </div>

                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Confirmation emails with tournament arrival instructions have been dispatched to {player1Email || 'your email'}.
                </p>

                <div className="pt-4 flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setShowRegisterModal(false);
                      setActiveTab('draw');
                    }}
                    className="px-5 py-2.5 bg-[#0A5C43] text-white rounded-xl font-bold text-xs shadow-sm hover:opacity-95"
                  >
                    View Tournament Draw & Bracket
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
