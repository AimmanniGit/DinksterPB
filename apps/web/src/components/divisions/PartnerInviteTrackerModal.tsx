'use client';

import React, { useState } from 'react';
import {
  X,
  Mail,
  Send,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  Share2,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  RefreshCw,
  MessageSquare,
} from 'lucide-react';

interface PartnerInviteTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamName: string;
  divisionName: string;
  tournamentName: string;
  tournamentSlug: string;
  teammateCode: string;
  isPrepaid?: boolean;
  initialPartner?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    status?: 'sent' | 'opened' | 'registered' | 'confirmed';
  };
}

export const PartnerInviteTrackerModal: React.FC<PartnerInviteTrackerModalProps> = ({
  isOpen,
  onClose,
  teamName,
  divisionName,
  tournamentName,
  tournamentSlug,
  teammateCode,
  isPrepaid = true,
  initialPartner,
}) => {
  const [firstName, setFirstName] = useState(initialPartner?.firstName || 'Morgan');
  const [lastName, setLastName] = useState(initialPartner?.lastName || 'Reyes');
  const [email, setEmail] = useState(initialPartner?.email || 'morgan.reyes@dinkster.app');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [inviteSentSuccess, setInviteSentSuccess] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Status Lifecycle Simulation (defaults to 'registered' for demo, can toggle)
  const [activeStage, setActiveStage] = useState<'sent' | 'opened' | 'registered' | 'confirmed'>(
    initialPartner?.status || 'registered'
  );

  if (!isOpen) return null;

  const inviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/t/${tournamentSlug}?join=${teammateCode}`
    : `https://dinkster.app/t/${tournamentSlug}?join=${teammateCode}`;

  const readyTemplate = `Hey ${firstName || 'Partner'}! I registered our team '${teamName}' for the ${divisionName} in the ${tournamentName}. ${
    isPrepaid ? 'Your entry fee has been pre-paid.' : 'You can complete your entry online.'
  } Join using team code: ${teammateCode} at ${inviteUrl}`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(inviteUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(teammateCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setInviteSentSuccess(true);
      setActiveStage('sent');
      setTimeout(() => setInviteSentSuccess(false), 3000);
    }, 600);
  };

  const stages = [
    {
      id: 'sent',
      title: '1. Invite Dispatched',
      desc: `Email sent to ${email}`,
      timestamp: 'Today, 2:15 PM',
      done: true,
    },
    {
      id: 'opened',
      title: '2. Link Opened',
      desc: 'Partner accessed team portal',
      timestamp: activeStage !== 'sent' ? 'Today, 2:24 PM' : 'Waiting for partner',
      done: activeStage === 'opened' || activeStage === 'registered' || activeStage === 'confirmed',
    },
    {
      id: 'registered',
      title: '3. Profile Registered',
      desc: 'Dinkster account & DUPR verified',
      timestamp: activeStage === 'registered' || activeStage === 'confirmed' ? 'Today, 2:28 PM' : 'Pending completion',
      done: activeStage === 'registered' || activeStage === 'confirmed',
    },
    {
      id: 'confirmed',
      title: '4. Ready for Court Dispatch',
      desc: isPrepaid ? 'Captain Pre-Paid ($0 Owed) • Desk Ready' : 'Self-Pay Settled',
      timestamp: activeStage === 'confirmed' || activeStage === 'registered' ? 'Confirmed & Checked In' : 'Awaiting payment',
      done: activeStage === 'confirmed' || activeStage === 'registered',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                Partner Registration Dispatcher
              </span>
              <span className="text-xs font-mono font-bold text-gray-700 bg-gray-100 px-1.5 py-0.2 rounded border">
                Code: {teammateCode}
              </span>
            </div>
            <h3 className="text-base font-bold text-gray-900">
              Team Partner Invite & Status Tracker
            </h3>
            <p className="text-xs text-gray-500">
              {teamName} &bull; {divisionName} &bull; {tournamentName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold flex items-center justify-center text-xs"
          >
            ✕
          </button>
        </div>

        {/* 4-Stage Lifecycle Progress Bar */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-gray-900 uppercase text-[10px] tracking-wider">
              Registration Lifecycle Progress
            </span>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {activeStage === 'registered' || activeStage === 'confirmed'
                ? '✓ Roster Completed'
                : 'Awaiting Partner Action'}
            </span>
          </div>

          <div className="space-y-2.5">
            {stages.map((stage, idx) => (
              <div
                key={stage.id}
                onClick={() => setActiveStage(stage.id as 'sent' | 'opened' | 'registered' | 'confirmed')}
                className="flex items-start gap-3 p-1.5 rounded-lg hover:bg-white/80 transition cursor-pointer"
                title="Click to simulate / preview this stage"
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                    stage.done
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {stage.done ? '✓' : idx + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-xs font-bold ${stage.done ? 'text-gray-900' : 'text-gray-500'}`}>
                      {stage.title}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">{stage.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-gray-500">{stage.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Send / Resend Form */}
        <form onSubmit={handleSendInvite} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Partner First Name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Morgan"
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#0A5C43]"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Partner Last Name</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Reyes"
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#0A5C43]"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-gray-700 block mb-1">Partner Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. partner@example.com"
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#0A5C43]"
            />
          </div>

          {/* Pre-populated Message Template */}
          <div>
            <label className="font-semibold text-gray-700 block mb-1">Invitation Message Template (Ready to Send)</label>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-gray-700 leading-relaxed text-[11px] whitespace-pre-wrap font-sans">
              {readyTemplate}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2 gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 font-semibold text-xs transition flex items-center gap-1.5"
              >
                {copiedLink ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Invite Link'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyCode}
                className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 font-semibold text-xs transition flex items-center gap-1.5"
              >
                {copiedCode ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                <span>{copiedCode ? 'Code Copied!' : 'Copy Code'}</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="px-4 py-2 bg-[#0A5C43] hover:bg-[#084734] text-white rounded-lg font-bold text-xs transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              {isSending ? (
                <span>Sending...</span>
              ) : (
                <>
                  <Send size={13} />
                  <span>Send Email Invite</span>
                </>
              )}
            </button>
          </div>

          {inviteSentSuccess && (
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 font-semibold flex items-center gap-2 text-xs">
              <CheckCircle2 size={15} className="text-emerald-700" />
              <span>Invitation dispatched! Your partner will receive direct registration instructions.</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
