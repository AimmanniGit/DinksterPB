'use client';

import React, { useState, useEffect } from 'react';
import { Division, TournamentEvent } from '../../types/organizer';
import {
  Mail,
  KeyRound,
  User,
  Phone,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Copy,
  Check,
  Share2,
  Users,
  AlertCircle,
  FileText,
  Lock,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Zap,
} from 'lucide-react';

export interface RegisteredPlayerRecord {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  dinksterId: string;
  duprRating?: number;
  duprId?: string;
  age?: number;
  emergencyName?: string;
  emergencyPhone?: string;
  divisionId: string;
  divisionName: string;
  teamId: string;
  teamName: string;
  isCaptain: boolean;
  waiverSigned: boolean;
  waiverSignatureName: string;
  waiverSignedAt: string;
  paymentOption: 'self' | 'entire-team' | 'covered-by-captain';
  amountPaid: number;
  teammateCode?: string;
  teammateInviteUrl?: string;
  partnerRegistered?: boolean;
}

interface TournamentRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: TournamentEvent;
  division: Division;
  eventSlug: string;
  existingTeamCode?: string | null;
  onRegistrationSuccess?: (record: RegisteredPlayerRecord) => void;
}

// Preset known player accounts for instant sign-in recognition
const KNOWN_PLAYERS: Record<string, { fullName: string; phone: string; dinksterId: string; duprRating: number; age: number }> = {
  'alex@example.com': {
    fullName: 'Alex Miller',
    phone: '(512) 555-0199',
    dinksterId: 'DK-84920',
    duprRating: 3.82,
    age: 34,
  },
  'sarah@example.com': {
    fullName: 'Sarah Jenkins',
    phone: '(512) 555-0144',
    dinksterId: 'DK-39211',
    duprRating: 4.15,
    age: 29,
  },
};

export const TournamentRegistrationModal: React.FC<TournamentRegistrationModalProps> = ({
  isOpen,
  onClose,
  event,
  division,
  eventSlug,
  existingTeamCode,
  onRegistrationSuccess,
}) => {
  // Steps:
  // 1 = Email & OTP Sign-in / Register
  // 2 = Complete Profile (New players only)
  // 3 = Division & Teammate Setup (Assumes captain unless joining with code)
  // 4 = Waiver & Agreement
  // 5 = Review & Checkout
  // 6 = Success Hub (Invite code & share link)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Authentication State
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isReturningPlayer, setIsReturningPlayer] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Player Profile State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [dinksterId, setDinksterId] = useState(() => `DK-${Math.floor(10000 + Math.random() * 90000)}`);
  const [duprRating, setDuprRating] = useState<string>(division.minDupr ? String(division.minDupr) : '3.5');
  const [age, setAge] = useState('32');
  const [emergencyPhone, setEmergencyPhone] = useState('(512) 555-0100');

  // Teammate & Team State
  const isTeammateJoining = Boolean(existingTeamCode);
  const isCaptain = !isTeammateJoining; // Assumed captain if not joining with partner code!
  const [teamName, setTeamName] = useState('');
  const [paymentChoice, setPaymentChoice] = useState<'self' | 'entire-team'>('self');

  // Waiver State
  const [waiverAgreed, setWaiverAgreed] = useState(true);
  const [signatureName, setSignatureName] = useState('');

  // Outcome & Loading
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [registeredRecord, setRegisteredRecord] = useState<RegisteredPlayerRecord | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Calculate pricing per person
  const isDoubles = !division.format.toLowerCase().includes('singles');
  const pricePerPlayer = division.entryFee;
  // Code prefixes: TP = Team Paid (entire team covered), TU = Team Unpaid (partner pays self)
  const isCoveredByCaptain = isTeammateJoining && (
    existingTeamCode?.startsWith('TP-') ||
    existingTeamCode?.startsWith('TMP-') ||
    existingTeamCode?.startsWith('TM-PAID')
  );

  const totalAmountDue = isTeammateJoining
    ? (isCoveredByCaptain ? 0 : pricePerPlayer)
    : paymentChoice === 'entire-team' && isDoubles
    ? pricePerPlayer * 2
    : pricePerPlayer;

  useEffect(() => {
    // Check if player is already logged into localStorage session
    try {
      const stored = localStorage.getItem('dinkster_player_session');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.email) {
          setEmail(parsed.email);
          const parts = (parsed.fullName || '').split(' ');
          setFirstName(parts[0] || 'Alex');
          setLastName(parts.slice(1).join(' ') || 'Player');
          setPhone(parsed.phone || '(512) 555-0199');
          setDinksterId(parsed.dinksterId || 'DK-84920');
          setDuprRating(parsed.duprRating ? String(parsed.duprRating) : '3.5');
          setTeamName(`${parts.slice(1).join(' ') || 'Player'} & Partner`);
          setSignatureName(parsed.fullName || 'Alex Player');
          setIsReturningPlayer(true);
        }
      }
    } catch (e) {}
  }, []);

  if (!isOpen) return null;

  // Step 1: Send OTP
  const handleSendOtp = () => {
    if (!email.trim() || !email.includes('@')) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    setAuthError(null);
    setOtpSent(true);

    // Check if known player
    const lowerEmail = email.toLowerCase().trim();
    if (KNOWN_PLAYERS[lowerEmail]) {
      const known = KNOWN_PLAYERS[lowerEmail];
      const parts = known.fullName.split(' ');
      setFirstName(parts[0]);
      setLastName(parts.slice(1).join(' '));
      setPhone(known.phone);
      setDinksterId(known.dinksterId);
      setDuprRating(String(known.duprRating));
      setAge(String(known.age));
      setTeamName(`${parts.slice(1).join(' ')} & Partner`);
      setSignatureName(known.fullName);
      setIsReturningPlayer(true);
    } else {
      setIsReturningPlayer(false);
    }
  };

  // Step 1: Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || (otpCode.trim() !== '123456' && otpCode.length < 4)) {
      setAuthError('Invalid code. For instant testing, use demo code: 123456');
      return;
    }

    setAuthError(null);

    // If player profile already exists, skip profile setup directly to division setup!
    if (isReturningPlayer || firstName) {
      setCurrentStep(3);
    } else {
      // New player: ask for basic profile details
      setCurrentStep(2);
    }
  };

  // Step 2: Save Profile (New Players)
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
      setAuthError('Please enter your full name and mobile number.');
      return;
    }
    setAuthError(null);
    if (!teamName) {
      setTeamName(`${lastName} & Partner`);
    }
    setSignatureName(`${firstName} ${lastName}`);
    setCurrentStep(3);
  };

  // Step 3: Advance to Waiver
  const handleAdvanceToWaiver = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setCurrentStep(4);
  };

  // Step 4: Advance to Review & Checkout
  const handleAdvanceToCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waiverAgreed) {
      setAuthError('Please accept the waiver agreement to continue.');
      return;
    }
    if (!signatureName.trim()) {
      setAuthError('Please type your legal name to sign the waiver.');
      return;
    }
    setAuthError(null);
    setCurrentStep(5);
  };

  // Step 5: Finalize Registration
  const handleFinalizeRegistration = () => {
    setIsProcessingPayment(true);

    setTimeout(() => {
      setIsProcessingPayment(false);

      // Generate Code: TP-XXXX = Team Paid, TU-XXXX = Team Unpaid
      const generatedTeamCode = isTeammateJoining
        ? existingTeamCode || `TU-${Math.floor(1000 + Math.random() * 9000)}`
        : paymentChoice === 'entire-team'
        ? `TP-${Math.floor(1000 + Math.random() * 9000)}`
        : `TU-${Math.floor(1000 + Math.random() * 9000)}`;

      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://dinkster.app';
      const inviteUrl = `${baseUrl}/t/${eventSlug}?join=${generatedTeamCode}`;

      const record: RegisteredPlayerRecord = {
        id: `PL-${Date.now().toString().slice(-5)}`,
        email,
        fullName: `${firstName} ${lastName}`.trim() || 'Alex Miller',
        phone: phone || '(512) 555-0199',
        dinksterId,
        duprRating: parseFloat(duprRating) || undefined,
        age: parseInt(age, 10) || undefined,
        emergencyPhone,
        divisionId: division.id,
        divisionName: division.name,
        teamId: `TEAM-${generatedTeamCode}`,
        teamName: isTeammateJoining ? `Team ${existingTeamCode}` : teamName || `${lastName || 'Player'} Team`,
        isCaptain,
        waiverSigned: true,
        waiverSignatureName: signatureName,
        waiverSignedAt: new Date().toISOString(),
        paymentOption: isTeammateJoining ? (isCoveredByCaptain ? 'covered-by-captain' : 'self') : paymentChoice,
        amountPaid: totalAmountDue,
        teammateCode: generatedTeamCode,
        teammateInviteUrl: inviteUrl,
        partnerRegistered: isTeammateJoining,
      };

      setRegisteredRecord(record);
      if (onRegistrationSuccess) {
        onRegistrationSuccess(record);
      }
      setCurrentStep(6);
    }, 800);
  };

  const copyText = (txt: string, type: 'link' | 'code') => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(txt);
      if (type === 'link') {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 3000);
      } else {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 3000);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-[#0A5C43] px-2 py-0.5 rounded">
                {isTeammateJoining ? 'Join Team Registration' : 'Player Registration'}
              </span>
              <span className="text-xs text-gray-400">&bull;</span>
              <span className="text-xs font-semibold text-gray-600">{division.name}</span>
            </div>
            <h3 className="text-base font-bold text-gray-900 mt-0.5">
              {currentStep === 1
                ? 'Sign In or Register'
                : currentStep === 2
                ? 'Create Your Player Profile'
                : currentStep === 3
                ? isTeammateJoining
                  ? 'Confirm Your Team Spot'
                  : 'Team & Captain Setup'
                : currentStep === 4
                ? 'Player Liability Waiver'
                : currentStep === 5
                ? 'Review & Confirm'
                : 'Registration Confirmed!'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* Progress Indicator */}
        {currentStep < 6 && (
          <div className="flex items-center justify-between mb-5 px-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex items-center gap-1">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition ${
                    currentStep === s
                      ? 'bg-[#0A5C43] text-white'
                      : currentStep > s
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {currentStep > s ? '✓' : s}
                </div>
                {s < 5 && <div className={`w-8 h-0.5 ${currentStep > s ? 'bg-[#0A5C43]' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
        )}

        {/* Error Notification */}
        {authError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 1: EMAIL & ONE-TIME CODE (Sign In / Register) */}
        {/* ============================================================== */}
        {currentStep === 1 && (
          <div className="space-y-4 text-xs">
            <p className="text-gray-600 leading-relaxed">
              Enter your email to sign in or create your free <strong>Dinkster Account</strong>. We authenticate instantly with a one-time code.
            </p>

            <div>
              <label className="font-semibold text-gray-700 block mb-1">Email Address</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="e.g. alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#0A5C43]"
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="px-3.5 py-2 bg-gray-900 hover:bg-black text-white rounded-lg font-semibold text-xs transition whitespace-nowrap"
                >
                  {otpSent ? 'Resend Code' : 'Send Code'}
                </button>
              </div>
            </div>

            {/* Quick Demo Fill Helper */}
            <div className="flex items-center gap-2 text-[11px] text-gray-500">
              <span>Quick Demo fill:</span>
              <button
                type="button"
                onClick={() => {
                  setEmail('alex@example.com');
                  setOtpSent(true);
                  setOtpCode('123456');
                  const known = KNOWN_PLAYERS['alex@example.com'];
                  setFirstName('Alex');
                  setLastName('Miller');
                  setPhone(known.phone);
                  setDinksterId(known.dinksterId);
                  setDuprRating(String(known.duprRating));
                  setTeamName('Miller & Partner');
                  setSignatureName('Alex Miller');
                  setIsReturningPlayer(true);
                }}
                className="text-[#0A5C43] font-semibold hover:underline"
              >
                Returning Player (Alex)
              </button>
              <span>&bull;</span>
              <button
                type="button"
                onClick={() => {
                  setEmail(`player${Math.floor(100 + Math.random() * 900)}@test.com`);
                  setOtpSent(true);
                  setOtpCode('123456');
                  setIsReturningPlayer(false);
                }}
                className="text-[#0A5C43] font-semibold hover:underline"
              >
                New Player
              </button>
            </div>

            {otpSent && (
              <form onSubmit={handleVerifyOtp} className="space-y-3 pt-2 border-t">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-semibold text-gray-700">Enter 6-Digit Code</label>
                    <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      Use Demo Code: 123456
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="123456"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-center text-lg font-mono tracking-widest text-gray-900 focus:outline-none focus:border-[#0A5C43]"
                  />
                </div>

                {isReturningPlayer && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                    <span>Welcome back, {firstName || 'Returning Player'}! Dinkster ID: <strong>{dinksterId}</strong></span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#0A5C43] hover:bg-[#084734] text-white rounded-lg font-semibold shadow-xs transition"
                >
                  Verify & Continue &rarr;
                </button>
              </form>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 2: CREATE PLAYER PROFILE (New Players Only) */}
        {/* ============================================================== */}
        {currentStep === 2 && (
          <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
            <p className="text-gray-600 leading-relaxed">
              Create your player profile. You will receive a permanent Dinkster ID (<strong>{dinksterId}</strong>) to track tournaments and rankings.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">First Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#0A5C43]"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Reed"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#0A5C43]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Mobile Phone (Match alerts)</label>
                <input
                  type="tel"
                  required
                  placeholder="(512) 555-0199"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#0A5C43]"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">DUPR Rating (Optional)</label>
                <input
                  type="number"
                  step="0.01"
                  min="2.0"
                  max="6.0"
                  value={duprRating}
                  onChange={(e) => setDuprRating(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#0A5C43]"
                />
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-600 flex items-center justify-between">
              <span>Your Dinkster ID:</span>
              <strong className="font-mono text-emerald-800 text-sm">{dinksterId}</strong>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#0A5C43] hover:bg-[#084734] text-white rounded-lg font-semibold shadow-xs transition"
            >
              Save Profile & Continue &rarr;
            </button>
          </form>
        )}

        {/* ============================================================== */}
        {/* STEP 3: DIVISION & TEAM SETUP (Assumes Captain unless code) */}
        {/* ============================================================== */}
        {currentStep === 3 && (
          <form onSubmit={handleAdvanceToWaiver} className="space-y-4 text-xs">
            {/* Context Badge */}
            {isTeammateJoining ? (
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-900">
                <div className="font-bold text-xs flex items-center gap-1.5 mb-1">
                  <Users size={14} className="text-blue-700" />
                  <span>Joining Partner with Code: {existingTeamCode}</span>
                </div>
                <p className="text-[11px] text-blue-800">
                  {isCoveredByCaptain
                    ? '✓ Your registration fee was already pre-paid by your team captain. Your cost is $0.'
                    : `You are joining this team. Your registration fee is $${pricePerPlayer}.`}
                </p>
              </div>
            ) : (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950">
                <div className="font-bold text-xs flex items-center gap-1.5 mb-1">
                  <Sparkles size={14} className="text-[#0A5C43]" />
                  <span>Team Captain Registration</span>
                </div>
                <p className="text-[11px] text-emerald-900">
                  As the first player registering, you are designated as <strong>Team Captain</strong>. After checkout, you will receive a <strong>Teammate Invite Link & Code</strong> to invite your partner with 1 click.
                </p>
              </div>
            )}

            {/* Team Name Field */}
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Team Display Name</label>
              <input
                type="text"
                required
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. Miller & Partner"
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#0A5C43]"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">
                Shown on court scoreboards, TV broadcast jumbotron, and brackets.
              </span>
            </div>

            {/* Payment Choice (Captain Doubles only) */}
            {isCaptain && isDoubles && (
              <div className="space-y-2">
                <label className="font-semibold text-gray-700 block">Payment Option</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div
                    onClick={() => setPaymentChoice('self')}
                    className={`p-3 rounded-xl border cursor-pointer transition ${
                      paymentChoice === 'self'
                        ? 'border-[#0A5C43] bg-emerald-50/60 ring-1 ring-[#0A5C43]'
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-bold text-xs text-gray-900 mb-0.5">Pay for Self Only</div>
                    <div className="text-sm font-extrabold text-[#0A5C43]">${pricePerPlayer}</div>
                    <p className="text-[10px] text-gray-500 mt-1">
                      Your partner pays their own ${pricePerPlayer} when joining with your code.
                    </p>
                  </div>

                  <div
                    onClick={() => setPaymentChoice('entire-team')}
                    className={`p-3 rounded-xl border cursor-pointer transition ${
                      paymentChoice === 'entire-team'
                        ? 'border-[#0A5C43] bg-emerald-50/60 ring-1 ring-[#0A5C43]'
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-bold text-xs text-gray-900 mb-0.5">Pay for Entire Team</div>
                    <div className="text-sm font-extrabold text-[#0A5C43]">${pricePerPlayer * 2}</div>
                    <p className="text-[10px] text-gray-500 mt-1">
                      Cover both spots now. Your teammate joins for <strong>$0 with 1 click</strong>.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-[#0A5C43] hover:bg-[#084734] text-white rounded-lg font-semibold shadow-xs transition"
            >
              Continue to Waiver &rarr;
            </button>
          </form>
        )}

        {/* ============================================================== */}
        {/* STEP 4: WAIVER & LIABILITY RELEASE */}
        {/* ============================================================== */}
        {currentStep === 4 && (
          <form onSubmit={handleAdvanceToCheckout} className="space-y-4 text-xs">
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl max-h-40 overflow-y-auto text-[11px] text-gray-600 leading-relaxed space-y-2">
              <p className="font-bold text-gray-800">Dinkster & USA Pickleball Official Tournament Participant Waiver</p>
              <p>
                1. <strong>Assumption of Risk:</strong> I acknowledge that pickleball involves physical exertion and inherent risks of injury, dehydration, and equipment contact. I freely accept all risks.
              </p>
              <p>
                2. <strong>Release of Liability:</strong> I hereby release Dinkster Platform, tournament organizers, referees, and host facility from all claims arising from participation.
              </p>
              <p>
                3. <strong>Photo & Video Consent:</strong> I grant permission for photographic and video broadcast recording on TV jumbotrons and streaming.
              </p>
            </div>

            <label className="flex items-start gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                checked={waiverAgreed}
                onChange={(e) => setWaiverAgreed(e.target.checked)}
                className="mt-0.5 rounded text-[#0A5C43] focus:ring-[#0A5C43]"
              />
              <span className="text-xs text-gray-800 font-semibold">
                I have read and agree to the tournament liability waiver and rules.
              </span>
            </label>

            <div>
              <label className="font-semibold text-gray-700 block mb-1">Electronic Signature (Full Legal Name)</label>
              <input
                type="text"
                required
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                placeholder="e.g. Alex Miller"
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 font-medium focus:outline-none focus:border-[#0A5C43]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#0A5C43] hover:bg-[#084734] text-white rounded-lg font-semibold shadow-xs transition"
            >
              Continue to Review &rarr;
            </button>
          </form>
        )}

        {/* ============================================================== */}
        {/* STEP 5: REVIEW & CHECKOUT */}
        {/* ============================================================== */}
        {currentStep === 5 && (
          <div className="space-y-4 text-xs">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-2.5">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-500">Player</span>
                <span className="font-bold text-gray-900">{firstName} {lastName} ({dinksterId})</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-500">Division</span>
                <span className="font-bold text-gray-900">{division.name}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-500">Team</span>
                <span className="font-bold text-gray-900">{teamName || `${lastName} & Partner`}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-500">Role</span>
                <span className="font-bold text-emerald-800">{isCaptain ? 'Team Captain' : 'Teammate'}</span>
              </div>
              <div className="flex justify-between items-center pt-1 text-sm">
                <span className="font-bold text-gray-800">Total Amount Due</span>
                <span className="font-extrabold text-[#0A5C43] text-base">
                  {totalAmountDue === 0 ? 'FREE ($0.00)' : `$${totalAmountDue}.00`}
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={isProcessingPayment}
              onClick={handleFinalizeRegistration}
              className="w-full py-3 bg-[#0A5C43] hover:bg-[#084734] text-white rounded-xl font-bold text-xs shadow-xs transition flex items-center justify-center gap-2"
            >
              {isProcessingPayment ? (
                <>
                  <Sparkles size={14} className="animate-spin text-[#EF9F27]" />
                  <span>Confirming Registration...</span>
                </>
              ) : (
                <>
                  <CreditCard size={15} />
                  <span>
                    {totalAmountDue === 0
                      ? 'Confirm & Complete Registration'
                      : `Pay $${totalAmountDue}.00 & Confirm Spot`}
                  </span>
                </>
              )}
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 6: REGISTRATION SUCCESS HUB (Share Code & Link) */}
        {/* ============================================================== */}
        {currentStep === 6 && registeredRecord && (
          <div className="space-y-4 text-xs text-center py-2">
            <div className="w-12 h-12 bg-emerald-100 text-[#0A5C43] rounded-full flex items-center justify-center mx-auto mb-1">
              <CheckCircle2 size={28} />
            </div>

            <div>
              <h4 className="text-lg font-bold text-gray-900">You&apos;re Officially Registered!</h4>
              <p className="text-xs text-gray-600 mt-0.5">
                Spot confirmed for <strong>{registeredRecord.divisionName}</strong>.
              </p>
            </div>

            {/* Captain Partner Invite Box */}
            {registeredRecord.isCaptain && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl text-left space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-gray-700 uppercase block">Teammate Invite Code</span>
                    <span className="text-[10px] text-gray-500">
                      {registeredRecord.teammateCode?.startsWith('TP-')
                        ? 'Code Prefix TP: Team Paid (Partner joins for $0)'
                        : 'Code Prefix TU: Team Unpaid (Partner pays upon joining)'}
                    </span>
                  </div>
                  <span className={`font-mono font-bold text-sm px-2.5 py-1 rounded border ${
                    registeredRecord.teammateCode?.startsWith('TP-')
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                      : 'bg-amber-50 text-amber-900 border-amber-300'
                  }`}>
                    {registeredRecord.teammateCode}
                  </span>
                </div>

                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Send this link to your partner. When they open it, they will join your team with 1 click:
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={registeredRecord.teammateInviteUrl}
                    className="flex-1 bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-gray-600 truncate"
                  />
                  <button
                    type="button"
                    onClick={() => copyText(registeredRecord.teammateInviteUrl || '', 'link')}
                    className="px-3 py-1.5 bg-[#0A5C43] hover:bg-[#084734] text-white rounded-lg font-semibold text-xs transition whitespace-nowrap flex items-center gap-1"
                  >
                    {copiedLink ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl font-semibold text-xs shadow-xs transition"
            >
              Done & Return to Tournament
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
