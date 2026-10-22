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

export const TournamentRegistrationModal: React.FC<TournamentRegistrationModalProps> = ({
  isOpen,
  onClose,
  event,
  division,
  eventSlug,
  existingTeamCode,
  onRegistrationSuccess,
}) => {
  // Modal step sequence: 1 = Email/OTP, 2 = Player Profile, 3 = Team & Payment Option, 4 = Waiver, 5 = Checkout, 6 = Success Hub
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Email & One-Time Code Verification
  const [email, setEmail] = useState('');
  const [duprEmailOrId, setDuprEmailOrId] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [generatedDemoOtp, setGeneratedDemoOtp] = useState('842910');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Step 2: Player Profile Details (Captured for database & marketing)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [dinksterId, setDinksterId] = useState(() => `DK-${Math.floor(10000 + Math.random() * 90000)}`);
  const [duprRating, setDuprRating] = useState<string>(division.minDupr ? String(division.minDupr) : '3.5');
  const [duprId, setDuprId] = useState('');
  const [age, setAge] = useState('32');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  // Step 3: Team Configuration
  const [isTeammateJoining, setIsTeammateJoining] = useState(Boolean(existingTeamCode));
  const [teammateCodeInput, setTeammateCodeInput] = useState(existingTeamCode || '');
  const [teamName, setTeamName] = useState('');
  const [paymentChoice, setPaymentChoice] = useState<'self' | 'entire-team'>('self');

  // Step 4: Waiver Agreement
  const [waiverAgreed, setWaiverAgreed] = useState(false);
  const [signatureName, setSignatureName] = useState('');

  // Step 5 & 6: Outcome
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [registeredRecord, setRegisteredRecord] = useState<RegisteredPlayerRecord | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Calculate fees per person
  const isDoubles = !division.format.toLowerCase().includes('singles');
  const pricePerPlayer = division.entryFee;
  const isCoveredByCaptain = isTeammateJoining && teammateCodeInput.startsWith('TM-PAID');
  
  const totalAmountDue = isTeammateJoining
    ? (isCoveredByCaptain ? 0 : pricePerPlayer)
    : paymentChoice === 'entire-team' && isDoubles
    ? pricePerPlayer * 2
    : pricePerPlayer;

  useEffect(() => {
    if (existingTeamCode) {
      setIsTeammateJoining(true);
      setTeammateCodeInput(existingTeamCode);
      setTeamName('Team ' + existingTeamCode);
    }
  }, [existingTeamCode]);

  if (!isOpen) return null;

  // Handler: Send One-Time Code
  const handleSendOtp = () => {
    if (!email.trim() || !email.includes('@')) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    setAuthError(null);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedDemoOtp(code);
    setOtpSent(true);
  };

  // Handler: Verify Code
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.trim() === generatedDemoOtp || otpCode.trim() === '123456') {
      setIsEmailVerified(true);
      setAuthError(null);
      setCurrentStep(2);
    } else {
      setAuthError('Invalid verification code. Please check and try again.');
    }
  };

  // Handler: Save Profile & Advance to Team Setup
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
      setAuthError('Please fill in your name and phone number.');
      return;
    }
    setAuthError(null);
    if (!teamName) {
      setTeamName(`${lastName} & Partner`);
    }
    setCurrentStep(3);
  };

  // Handler: Advance from Team Setup to Waiver
  const handleAdvanceToWaiver = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setSignatureName(`${firstName} ${lastName}`);
    setCurrentStep(4);
  };

  // Handler: Advance from Waiver to Checkout
  const handleAdvanceToCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waiverAgreed) {
      setAuthError('You must review and agree to the waiver terms.');
      return;
    }
    if (!signatureName.trim()) {
      setAuthError('Please type your full legal name to electronically sign.');
      return;
    }
    setAuthError(null);
    setCurrentStep(5);
  };

  // Handler: Execute Checkout & Registration
  const handleFinalizeRegistration = () => {
    setIsProcessingPayment(true);

    setTimeout(() => {
      setIsProcessingPayment(false);

      const generatedTeamCode = isTeammateJoining
        ? teammateCodeInput
        : paymentChoice === 'entire-team'
        ? `TM-PAID-${Math.floor(1000 + Math.random() * 9000)}`
        : `TM-${Math.floor(1000 + Math.random() * 9000)}`;

      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://dinkster.app';
      const inviteUrl = `${baseUrl}/t/${eventSlug}?join=${generatedTeamCode}`;

      const record: RegisteredPlayerRecord = {
        id: `PL-${Date.now().toString().slice(-5)}`,
        email,
        fullName: `${firstName} ${lastName}`,
        phone,
        dinksterId,
        duprRating: parseFloat(duprRating) || undefined,
        duprId: duprId.trim() || undefined,
        age: parseInt(age, 10) || undefined,
        emergencyName,
        emergencyPhone,
        divisionId: division.id,
        divisionName: division.name,
        teamId: `TEAM-${generatedTeamCode}`,
        teamName: teamName || `${lastName} Team`,
        isCaptain: !isTeammateJoining,
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
    }, 900);
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-gray-200 overflow-hidden my-6 animate-fade-in flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                {isTeammateJoining ? 'Teammate Registration' : 'Player Registration'}
              </span>
              <span className="text-xs text-gray-500 font-medium">
                Step {currentStep} of {currentStep === 6 ? '6 (Complete)' : '5'}
              </span>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mt-1">
              {division.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-gray-200 text-gray-600 font-bold flex items-center justify-center border border-gray-200 transition"
          >
            ✕
          </button>
        </div>

        {/* Error Alert Bar */}
        {authError && (
          <div className="px-6 py-2.5 bg-red-50 border-b border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {/* Modal Body Container */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-sm text-gray-700">

          {/* ========================================================
              STEP 1: EMAIL SIGN-IN & ONE-TIME CODE
              ======================================================== */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Sign in with Email or DUPR</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  We verify your email with a one-time code to link your match history and ratings to your permanent player profile.
                </p>
              </div>

              {!otpSent ? (
                <div className="space-y-3.5">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">
                      Email Address
                    </label>
                    <div className="flex items-center bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 focus-within:border-[#0A5C43] focus-within:bg-white transition">
                      <Mail size={16} className="text-gray-400 mr-2 shrink-0" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@domain.com"
                        className="w-full bg-transparent text-sm text-gray-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">
                      DUPR Profile Email or Profile ID <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={duprEmailOrId}
                      onChange={(e) => setDuprEmailOrId(e.target.value)}
                      placeholder="e.g. dupr.com/profile/12345 or DUPR email"
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#0A5C43] focus:bg-white"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="w-full py-2.5 bg-[#0A5C43] hover:bg-[#084734] text-white rounded-xl text-sm font-semibold transition shadow-xs flex items-center justify-center gap-2"
                  >
                    <span>Send One-Time Verification Code</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
                    <div>
                      <span>Code sent to <strong>{email}</strong></span>
                      <p className="text-[11px] text-emerald-600 mt-0.5">Check your inbox or use the test code below.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-xs text-emerald-900 underline font-semibold ml-2"
                    >
                      Change
                    </button>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">
                      Enter 6-Digit One-Time Code
                    </label>
                    <div className="flex items-center bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 focus-within:border-[#0A5C43] focus-within:bg-white transition">
                      <KeyRound size={16} className="text-gray-400 mr-2 shrink-0" />
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="e.g. 842910"
                        className="w-full bg-transparent text-base font-mono tracking-widest text-gray-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Fast Helper for Test Verification */}
                  <div className="text-xs text-gray-500 flex items-center justify-between">
                    <span>Demo shortcut:</span>
                    <button
                      type="button"
                      onClick={() => setOtpCode(generatedDemoOtp)}
                      className="text-[#0A5C43] font-semibold hover:underline"
                    >
                      Fill Code ({generatedDemoOtp})
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#0A5C43] hover:bg-[#084734] text-white rounded-xl text-sm font-semibold transition shadow-xs"
                  >
                    Verify & Continue to Profile
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ========================================================
              STEP 2: PLAYER PROFILE INFORMATION (DATABASE COLLECTION)
              ======================================================== */}
          {currentStep === 2 && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Your Player Profile Details</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Complete your details once. This information is saved in your Dinkster profile for this and future tournaments.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#0A5C43]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#0A5C43]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Mobile Phone (for Court SMS)</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 000-0000"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#0A5C43]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Dinkster Player ID</label>
                  <input
                    type="text"
                    readOnly
                    value={dinksterId}
                    className="w-full bg-gray-100 border border-gray-300 rounded-xl px-3 py-2 text-sm font-mono text-gray-700 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">DUPR Rating</label>
                  <input
                    type="number"
                    step={0.01}
                    min={2.0}
                    max={8.0}
                    value={duprRating}
                    onChange={(e) => setDuprRating(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm font-semibold text-gray-900 focus:outline-none focus:border-[#0A5C43]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">DUPR ID</label>
                  <input
                    type="text"
                    value={duprId}
                    onChange={(e) => setDuprId(e.target.value)}
                    placeholder="Optional"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#0A5C43]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Age</label>
                  <input
                    type="number"
                    min={12}
                    max={99}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#0A5C43]"
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                <span className="text-xs font-semibold text-gray-700 block">Emergency Contact</span>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Contact Name"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900 focus:outline-none"
                  />
                  <input
                    type="tel"
                    placeholder="Emergency Phone"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-800"
                >
                  &larr; Back
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0A5C43] hover:bg-[#084734] text-white rounded-xl text-sm font-semibold transition shadow-xs"
                >
                  Continue to Team Setup
                </button>
              </div>
            </form>
          )}

          {/* ========================================================
              STEP 3: TEAM CONFIGURATION & PAYMENT OPTIONS
              ======================================================== */}
          {currentStep === 3 && (
            <form onSubmit={handleAdvanceToWaiver} className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {isTeammateJoining ? 'Join Existing Team' : 'Team Setup & Captain Roles'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Registration fee is <strong>${pricePerPlayer} per person</strong>.
                </p>
              </div>

              {/* Teammate Join vs Captain Switch */}
              {!existingTeamCode && isDoubles && (
                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setIsTeammateJoining(false)}
                    className={`py-2 text-xs font-semibold rounded-lg transition ${
                      !isTeammateJoining ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Register as Team Captain
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsTeammateJoining(true)}
                    className={`py-2 text-xs font-semibold rounded-lg transition ${
                      isTeammateJoining ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    I Have a Teammate Code
                  </button>
                </div>
              )}

              {isTeammateJoining ? (
                /* Teammate Joining Existing Team */
                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-3">
                  <span className="text-xs font-bold text-emerald-900 block">
                    Enter Teammate Invite Code
                  </span>
                  <input
                    type="text"
                    required
                    value={teammateCodeInput}
                    onChange={(e) => setTeammateCodeInput(e.target.value.toUpperCase())}
                    placeholder="e.g. TM-8429"
                    className="w-full bg-white border border-emerald-300 rounded-xl px-3.5 py-2 font-mono text-sm font-bold uppercase text-emerald-950 focus:outline-none"
                  />
                  {isCoveredByCaptain ? (
                    <div className="p-2.5 bg-emerald-100 text-emerald-900 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                      <Sparkles size={14} className="text-emerald-700 shrink-0" />
                      <span>Great news! Your Team Captain has already covered your registration fee. Your amount due is <strong>$0.00</strong>.</span>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-600">
                      Your captain registered the team. You are paying your player entry fee of <strong>${pricePerPlayer}.00</strong>.
                    </p>
                  )}
                </div>
              ) : (
                /* Captain Registering New Team */
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">
                      Team Name
                    </label>
                    <input
                      type="text"
                      required
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder='e.g. "Austin DTA" or "Miller / Partner"'
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#0A5C43]"
                    />
                    <span className="text-[11px] text-gray-400 mt-0.5 block">
                      You are the Team Captain. You will receive a unique partner invite link after registration.
                    </span>
                  </div>

                  {isDoubles && (
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-gray-700 block">
                        Payment Responsibility Choice
                      </span>
                      
                      <div className="space-y-2">
                        {/* Option 1: Self Only */}
                        <label
                          className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
                            paymentChoice === 'self'
                              ? 'border-[#0A5C43] bg-emerald-50/40 text-gray-900'
                              : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentOption"
                            checked={paymentChoice === 'self'}
                            onChange={() => setPaymentChoice('self')}
                            className="mt-1 accent-[#0A5C43]"
                          />
                          <div>
                            <span className="text-sm font-bold text-gray-900 block">
                              Pay for Myself Only (${pricePerPlayer}.00)
                            </span>
                            <span className="text-xs text-gray-500 mt-0.5 block">
                              My partner will pay their own ${pricePerPlayer}.00 fee when they register using the invite link.
                            </span>
                          </div>
                        </label>

                        {/* Option 2: Entire Team */}
                        <label
                          className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
                            paymentChoice === 'entire-team'
                              ? 'border-[#0A5C43] bg-emerald-50/40 text-gray-900'
                              : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentOption"
                            checked={paymentChoice === 'entire-team'}
                            onChange={() => setPaymentChoice('entire-team')}
                            className="mt-1 accent-[#0A5C43]"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-gray-900">
                                Pay for Entire Team (${pricePerPlayer * 2}.00)
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                                Popular for Captains
                              </span>
                            </div>
                            <span className="text-xs text-gray-500 mt-0.5 block">
                              Cover your partner's fee now. Your partner joins for $0 simply by completing their player profile & waiver.
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-800"
                >
                  &larr; Back
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0A5C43] hover:bg-[#084734] text-white rounded-xl text-sm font-semibold transition shadow-xs"
                >
                  Continue to Waiver & Terms
                </button>
              </div>
            </form>
          )}

          {/* ========================================================
              STEP 4: INDUSTRY-STANDARD LIABILITY WAIVER & TERMS
              ======================================================== */}
          {currentStep === 4 && (
            <form onSubmit={handleAdvanceToCheckout} className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Tournament Liability Waiver & Terms</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Please review the participant agreement and electronically sign below.
                </p>
              </div>

              {/* Scrollable Legal Waiver Text Container */}
              <div className="h-44 overflow-y-auto p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600 space-y-3 leading-relaxed font-sans select-none">
                <p className="font-bold text-gray-900">
                  DINKSTER OFFICIAL TOURNAMENT PARTICIPANT RELEASE, ASSUMPTION OF RISK & CODE OF CONDUCT
                </p>
                <p>
                  <strong>1. Assumption of Risk:</strong> I understand that participation in competitive pickleball tournaments involves physical activity, including rapid lateral movements, potential collisions, trips, falls, equipment impact, and cardiovascular exertion. I voluntarily assume all risks of injury, illness, damage, or loss associated with my participation.
                </p>
                <p>
                  <strong>2. Release and Waiver:</strong> I hereby release, waive, discharge, and covenant not to sue Dinkster, the tournament organizers, venue hosts, sponsors, referees, and associated staff from any and all liability, claims, or demands arising from negligence or ordinary tournament participation.
                </p>
                <p>
                  <strong>3. Emergency Medical Authorization:</strong> In the event of injury or medical emergency during the event, I authorize tournament officials and medical personnel to administer emergency first aid, CPR, and transport to the nearest medical care facility as deemed necessary.
                </p>
                <p>
                  <strong>4. Media and Broadcast Consent:</strong> I grant Dinkster and event organizers the irrevocable right to photograph, film, and broadcast my likeness, voice, and match results across web streams, live TV feeds, and tournament marketing without compensation.
                </p>
                <p>
                  <strong>5. DUPR Integrity & Sportsmanship:</strong> I affirm that my entered rating accurately reflects my skill level and agree to USA Pickleball rules of sportsmanship and court conduct.
                </p>
              </div>

              {/* Electronic Signature Box */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Electronic Signature <span className="text-gray-400 font-normal">(Type Full Legal Name)</span>
                </label>
                <div className="flex items-center bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2">
                  <FileText size={16} className="text-gray-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    required
                    value={signatureName}
                    onChange={(e) => setSignatureName(e.target.value)}
                    placeholder="Full Legal Name"
                    className="w-full bg-transparent text-sm font-semibold text-gray-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Mandatory Agreement Checkbox */}
              <label className="flex items-start gap-2.5 text-xs text-gray-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={waiverAgreed}
                  onChange={(e) => setWaiverAgreed(e.target.checked)}
                  className="mt-0.5 rounded accent-[#0A5C43]"
                />
                <span>
                  I have read, understood, and accept the <strong>Dinkster Tournament Waiver, Assumption of Risk, and Terms of Participation</strong>.
                </span>
              </label>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-800"
                >
                  &larr; Back
                </button>
                <button
                  type="submit"
                  disabled={!waiverAgreed || !signatureName.trim()}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-xs ${
                    waiverAgreed && signatureName.trim()
                      ? 'bg-[#0A5C43] hover:bg-[#084734] text-white'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Proceed to Payment
                </button>
              </div>
            </form>
          )}

          {/* ========================================================
              STEP 5: SUMMARY & SECURE PAYMENT CHECKOUT
              ======================================================== */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Registration Summary & Payment</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Review your details before completing registration.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2.5 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                  <span className="text-gray-500 font-medium">Tournament</span>
                  <span className="font-semibold text-gray-900">{event.name}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                  <span className="text-gray-500 font-medium">Division</span>
                  <span className="font-semibold text-gray-900">{division.name}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                  <span className="text-gray-500 font-medium">Player</span>
                  <span className="font-semibold text-gray-900">{firstName} {lastName} ({email})</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                  <span className="text-gray-500 font-medium">Role</span>
                  <span className="font-semibold text-gray-900">
                    {isTeammateJoining ? 'Teammate / Partner' : 'Team Captain'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                  <span className="text-gray-500 font-medium">Team Name</span>
                  <span className="font-semibold text-gray-900">{teamName}</span>
                </div>
                <div className="flex justify-between items-center pt-1 text-sm font-bold text-gray-900">
                  <span>Total Due Today:</span>
                  <span className="text-xl text-[#0A5C43]">
                    {totalAmountDue === 0 ? '$0.00 (Covered by Captain)' : `$${totalAmountDue}.00`}
                  </span>
                </div>
              </div>

              {/* Payment Processing Button */}
              <div className="space-y-2">
                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={handleFinalizeRegistration}
                  className="w-full py-3 bg-[#0A5C43] hover:bg-[#084734] text-white rounded-xl text-sm font-semibold transition shadow-sm flex items-center justify-center gap-2"
                >
                  {isProcessingPayment ? (
                    <span>Processing Registration...</span>
                  ) : (
                    <>
                      <Lock size={15} />
                      <span>
                        {totalAmountDue === 0
                          ? 'Confirm & Finalize Registration ($0.00)'
                          : `Complete & Pay $${totalAmountDue}.00`}
                      </span>
                    </>
                  )}
                </button>
                <div className="text-center text-[11px] text-gray-400 flex items-center justify-center gap-1">
                  <ShieldCheck size={13} className="text-gray-400" />
                  <span>256-bit encrypted secure checkout. Instant receipt sent to {email}.</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="text-xs font-semibold text-gray-500 hover:text-gray-800"
              >
                &larr; Back to Waiver
              </button>
            </div>
          )}

          {/* ========================================================
              STEP 6: REGISTRATION CONFIRMED & TEAMMATE INVITE HUB
              ======================================================== */}
          {currentStep === 6 && registeredRecord && (
            <div className="space-y-5 text-center py-2">
              <div className="w-14 h-14 bg-emerald-100 text-[#0A5C43] rounded-full flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 size={32} />
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900">You're Registered!</h3>
                <p className="text-xs text-gray-600 mt-1">
                  Registration confirmed in <strong>{division.name}</strong>.
                </p>
              </div>

              {/* Teammate Invite Link Card (For Captains) */}
              {!isTeammateJoining && isDoubles && registeredRecord.teammateInviteUrl && (
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-left space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                      <Users size={15} className="text-[#0A5C43]" />
                      Teammate Invite Link & Code
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-emerald-800 border border-emerald-200">
                      Partner Pending
                    </span>
                  </div>

                  <p className="text-xs text-emerald-900">
                    Send this link to your partner so they can self-register their player details and join your team:
                  </p>

                  {/* Shareable Link Box */}
                  <div className="flex items-center gap-2 bg-white border border-emerald-300 rounded-xl p-2 font-mono text-xs">
                    <span className="text-emerald-900 font-medium truncate flex-1 pl-1">
                      {registeredRecord.teammateInviteUrl}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyText(registeredRecord.teammateInviteUrl!, 'link')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-[#0A5C43] font-bold text-xs flex items-center gap-1 transition shrink-0"
                    >
                      {copiedLink ? <Check size={13} /> : <Copy size={13} />}
                      <span>{copiedLink ? 'Copied Link' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Partner Code Box */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-gray-600">Teammate Code: <strong className="font-mono text-gray-900">{registeredRecord.teammateCode}</strong></span>
                    <button
                      type="button"
                      onClick={() => copyText(registeredRecord.teammateCode!, 'code')}
                      className="text-xs font-bold text-[#0A5C43] hover:underline"
                    >
                      {copiedCode ? 'Copied Code!' : 'Copy Code'}
                    </button>
                  </div>

                  {paymentChoice === 'entire-team' && (
                    <div className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/60 p-2 rounded-lg">
                      ✓ You have already paid for your partner. Your partner will not be asked to pay when joining.
                    </div>
                  )}
                </div>
              )}

              {/* Roster Confirmation for Teammates */}
              {isTeammateJoining && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-1">
                  <span className="font-bold block text-sm">Team Roster Complete!</span>
                  <p>You have successfully joined <strong>{teamName}</strong>. Match schedules and court calls will be sent via SMS to {phone}.</p>
                </div>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-[#0A5C43] hover:bg-[#084734] text-white rounded-xl text-sm font-semibold transition"
              >
                Close & Return to Tournament
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
