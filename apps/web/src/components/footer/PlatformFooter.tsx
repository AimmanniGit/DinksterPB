'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  Phone,
  Mail,
  ShieldCheck,
  FileText,
  Globe,
  Sparkles,
  ExternalLink,
  MessageCircle,
  Clock,
  Tv,
  Keyboard,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const PlatformFooter: React.FC = () => {
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpSubmitted, setHelpSubmitted] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketMessage.trim()) return;
    setHelpSubmitted(true);
    setTimeout(() => {
      setHelpSubmitted(false);
      setShowHelpModal(false);
      setTicketSubject('');
      setTicketMessage('');
    }, 2500);
  };

  return (
    <>
      {/* ========================================================
          FULL RICH MULTI-TIER PLATFORM FOOTER
          ======================================================== */}
      <footer className="bg-white border-t border-gray-200 mt-16 text-gray-600 text-xs transition">
        {/* Top Tier: Emergency Support & Status Ribbon */}
        <div className="bg-[#FAF8F3] border-b border-gray-200/80 px-6 py-3">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 font-bold text-gray-900">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Dinkster Engine: Operational
              </span>
              <span className="text-gray-300">&bull;</span>
              <span className="text-gray-500 font-medium">US-Central Austin Server (14ms latency)</span>
              <span className="text-gray-300">&bull;</span>
              <span className="text-gray-500 font-medium">DUPR Real-time API Sync Active</span>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="text-gray-500">Tournament Day Hotline:</span>
              <a
                href="tel:18003465776"
                className="font-bold text-[#0A5C43] hover:underline flex items-center gap-1"
              >
                <Phone size={12} />
                <span>1-800-DINK-PRO</span>
              </a>
              <span className="text-gray-300">&bull;</span>
              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                className="text-gray-700 hover:text-[#0A5C43] transition flex items-center gap-1"
              >
                <HelpCircle size={13} className="text-[#EF9F27]" />
                <span>Help & Quick Desk Support</span>
              </button>
            </div>
          </div>
        </div>

        {/* Middle Tier: 4-Column Navigation & Resource Links */}
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Platform & Identity */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xl tracking-tight text-[#0A5C43]">
                dink<span className="text-[#EF9F27]">ster</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-gray-100 text-gray-600 font-bold border border-gray-200">
                v2.4
              </span>
            </div>
            <p className="text-gray-500 leading-relaxed text-xs">
              The modern tournament operating system for pickleball founders, directors, referees, and athletes. Powering club championships and national opens.
            </p>
            <div className="text-[11px] text-gray-400 font-mono">
              Player ID: <code className="text-gray-600 font-bold">DK-XXXXX</code> &bull; Join: <code className="text-gray-600 font-bold">D-XXXX</code>
            </div>
          </div>

          {/* Column 2: Organizer Desk & Hotline */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
              <Phone size={13} className="text-[#0A5C43]" />
              <span>Organizer Support</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => setShowHelpModal(true)}
                  className="hover:text-[#0A5C43] transition flex items-center gap-1.5"
                >
                  <MessageCircle size={12} className="text-gray-400" />
                  <span>24/7 Match Desk Live Dispatch</span>
                </button>
              </li>
              <li>
                <a
                  href="mailto:support@dinkster.app"
                  className="hover:text-[#0A5C43] transition flex items-center gap-1.5"
                >
                  <Mail size={12} className="text-gray-400" />
                  <span>support@dinkster.app</span>
                </a>
              </li>
              <li>
                <Link href="/tv" target="_blank" className="hover:text-[#0A5C43] transition flex items-center gap-1.5">
                  <Tv size={12} className="text-gray-400" />
                  <span>JumboTV Stadium Cast View</span>
                </Link>
              </li>
              <li>
                <span className="text-gray-400 text-[11px]">Direct Founder Line: Priority Response</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Rules & Sanctioning */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-[#0A5C43]" />
              <span>Rules & Governance</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://usapickleball.org/what-is-pickleball/official-rules/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#0A5C43] transition flex items-center gap-1.5"
                >
                  <span>USA Pickleball 2026 Rulebook</span>
                  <ExternalLink size={10} className="text-gray-400" />
                </a>
              </li>
              <li>
                <span className="text-gray-600">Silent Host Override Resolution</span>
              </li>
              <li>
                <span className="text-gray-600">DUPR 0.05 Half-Life Algorithm</span>
              </li>
              <li>
                <span className="text-gray-600">Dink Battle Pilot (Half-Court Rule)</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Compliance & Waivers */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
              <FileText size={13} className="text-[#0A5C43]" />
              <span>Legal & Athlete Terms</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="text-gray-600">Digital Liability Waiver Standards</span>
              </li>
              <li>
                <span className="text-gray-600">Stripe Connect & Payout Terms</span>
              </li>
              <li>
                <span className="text-gray-600">Partner Code Rules (TP / TU Standard)</span>
              </li>
              <li>
                <span className="text-gray-600">Privacy Policy & Athlete Data</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Tier: Copyright, Production Release Version & Server Info */}
        <div className="border-t border-gray-200 py-4 px-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-gray-400">
            <div>
              &copy; {new Date().getFullYear()} Dinkster Technologies Inc. All rights reserved. Built for competitive pickleball worldwide.
            </div>
            <div className="flex items-center gap-2.5 text-gray-500 font-mono text-[10px]">
              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-bold border border-gray-200">
                v2.4.2 Production
              </span>
              <span>&bull;</span>
              <span>US-Central Cluster</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ========================================================
          FLOATING QUICK HELP & EMERGENCY DESK BUTTON (?)
          ======================================================== */}
      <button
        type="button"
        onClick={() => setShowHelpModal(true)}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-[#0A5C43] hover:bg-[#084734] text-white flex items-center justify-center shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 group border-2 border-white/20"
        title="Help & Contact Desk Support (?)"
      >
        <HelpCircle size={22} className="group-hover:rotate-12 transition-transform" />
      </button>

      {/* ========================================================
          HELP & CONTACT DESK MODAL
          ======================================================== */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-5 my-8">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#0A5C43] flex items-center justify-center font-bold">
                  ?
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900">Desk Help & Emergency Support</h3>
                  <p className="text-xs text-gray-500">Live assistance for organizers, referees, and founders.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-xs"
              >
                &times;
              </button>
            </div>

            {helpSubmitted ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 size={36} className="text-emerald-600 mx-auto" />
                <h4 className="font-bold text-gray-900 text-sm">Support Ticket Dispatched!</h4>
                <p className="text-xs text-gray-500">
                  Our platform desk team has received your inquiry and will respond within 5 minutes.
                </p>
              </div>
            ) : (
              <>
                {/* Emergency Hotlines Strip */}
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Phone size={18} className="text-[#0A5C43]" />
                    <div>
                      <div className="font-black text-xs text-gray-900">Tournament Day Emergency Hotline</div>
                      <div className="text-[11px] text-[#0A5C43] font-bold">1-800-DINK-PRO (1-800-346-5776)</div>
                    </div>
                  </div>
                  <a
                    href="tel:18003465776"
                    className="px-3 py-1.5 bg-[#0A5C43] text-white rounded-lg text-xs font-bold shadow-xs hover:bg-[#084734]"
                  >
                    Call Now
                  </a>
                </div>

                {/* Keyboard Shortcuts Cheat Sheet */}
                <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-gray-800">
                    <Keyboard size={14} className="text-gray-500" />
                    <span>Organizer Hotkeys Cheat Sheet</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600">
                    <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-gray-200">
                      <span>Pause / Resume TV:</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-gray-100 font-mono font-bold text-gray-800 text-[10px]">
                        SPACE
                      </kbd>
                    </div>
                    <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-gray-200">
                      <span>Toggle Fullscreen:</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-gray-100 font-mono font-bold text-gray-800 text-[10px]">
                        F
                      </kbd>
                    </div>
                    <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-gray-200">
                      <span>TV Settings Drawer:</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-gray-100 font-mono font-bold text-gray-800 text-[10px]">
                        C
                      </kbd>
                    </div>
                    <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-gray-200">
                      <span>Step Screens:</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-gray-100 font-mono font-bold text-gray-800 text-[10px]">
                        &larr; &rarr;
                      </kbd>
                    </div>
                  </div>
                </div>

                {/* Quick Message Form */}
                <form onSubmit={handleSubmitTicket} className="space-y-3">
                  <div className="font-bold text-xs text-gray-800">Direct Message to Dinkster Desk</div>
                  <div>
                    <input
                      type="text"
                      placeholder="Subject (e.g. Court 3 line dispute, bracket seeding help)"
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      className="w-full bg-[#FAF8F3] border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:bg-white"
                    />
                  </div>
                  <div>
                    <textarea
                      rows={3}
                      required
                      placeholder="Describe what you need assistance with..."
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      className="w-full bg-[#FAF8F3] border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:bg-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowHelpModal(false)}
                      className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-bold text-xs"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#0A5C43] hover:bg-[#084734] text-white font-bold text-xs shadow-xs"
                    >
                      Send Message to Desk
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
