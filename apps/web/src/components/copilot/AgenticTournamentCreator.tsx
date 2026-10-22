'use client';

import React, { useState } from 'react';
import { TournamentEvent, Division } from '../../types/organizer';
import {
  Sparkles,
  Bot,
  Send,
  Calendar,
  MapPin,
  Layers,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Zap,
  ArrowRight,
  HelpCircle,
  X,
  FileText,
  Flame,
} from 'lucide-react';
import { VoiceInputButton } from './VoiceInputButton';

interface AgenticTournamentCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (tournament: TournamentEvent, divisions: Division[], autoPublish: boolean) => void;
}

interface AgentMessage {
  id: string;
  sender: 'agent' | 'user';
  text: string;
  preview?: {
    event: Partial<TournamentEvent>;
    divisions: Division[];
    projectedRevenue: number;
    projectedCapacity: number;
  };
  suggestedAnswers?: string[];
}

export const AgenticTournamentCreator: React.FC<AgenticTournamentCreatorProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: '1',
      sender: 'agent',
      text: `Hello! I am your **Autonomous Tournament Architect**.\n\nJust talk to me in plain English. Tell me about the event you want to run (e.g. city, dates, number of courts, division types, entry fees, or DUPR sanctioning).\n\nI will calculate court schedules, configure non-conflicting division brackets, forecast revenue, and generate the complete tournament setup for you.`,
      suggestedAnswers: [
        'Dallas weekend open with 12 courts, $75 fee, DUPR sanctioned',
        'Austin Dink Battle pilot slam, 8 courts, $50 fee',
        'Houston 50+ Senior classic, 16 courts, round robin pools',
        '1-day beginner scramble, 6 courts, $40 fee, Franklin balls',
      ],
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isAgentThinking, setIsAgentThinking] = useState(false);

  if (!isOpen) return null;

  // The Agentic Reasoning Engine: parses conversational briefs into complete mathematical tournament structures
  const handleSendMessage = (textToSend?: string) => {
    const prompt = (textToSend || inputText).trim();
    if (!prompt) return;

    const userMsgId = Date.now().toString();
    const newMessages: AgentMessage[] = [
      ...messages,
      { id: userMsgId, sender: 'user', text: prompt },
    ];
    setMessages(newMessages);
    setInputText('');
    setIsAgentThinking(true);

    setTimeout(() => {
      setIsAgentThinking(false);
      const lower = prompt.toLowerCase();

      // 1. City & Venue Resolution
      let city = 'Dallas';
      let state = 'TX';
      if (lower.includes('austin')) city = 'Austin';
      else if (lower.includes('houston')) city = 'Houston';
      else if (lower.includes('san antonio')) city = 'San Antonio';
      else if (lower.includes('denver')) { city = 'Denver'; state = 'CO'; }
      else if (lower.includes('chicago')) { city = 'Chicago'; state = 'IL'; }
      else if (lower.includes('phoenix')) { city = 'Phoenix'; state = 'AZ'; }

      // 2. Court Count & Capacity Calculation
      let courtsCount = 12;
      const courtMatch = prompt.match(/(\d+)\s*courts?/i);
      if (courtMatch) courtsCount = parseInt(courtMatch[1], 10);
      else if (lower.includes('8')) courtsCount = 8;
      else if (lower.includes('16')) courtsCount = 16;
      else if (lower.includes('6')) courtsCount = 6;
      else if (lower.includes('24')) courtsCount = 24;

      // 3. Entry Fee Resolution
      const feeMatch = prompt.match(/\$(\d+)/);
      const feePerPlayer = feeMatch ? parseInt(feeMatch[1], 10) : lower.includes('dink') ? 50 : 75;

      // 4. Sanctioning & Rules
      const isDupr = lower.includes('dupr') || !lower.includes('unsanctioned');
      const isDinkBattle = lower.includes('dink battle');
      const isSenior = lower.includes('senior') || lower.includes('50+');

      // 5. Title & Slug
      const title = isDinkBattle
        ? `${city} Dink Battle Pilot Slam 2026`
        : isSenior
        ? `${city} 50+ Senior Masters Classic 2026`
        : isDupr
        ? `${city} DUPR Open Championship 2026`
        : `${city} Pickleball Open 2026`;

      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const joinCode = `D-${Math.floor(1000 + Math.random() * 9000)}`;

      // 6. Generate Mathematical Divisions Schedule (Non-conflicting days for multi-division upsell)
      let generatedDivisions: Division[] = [];

      if (isDinkBattle) {
        generatedDivisions = [
          {
            id: `div-db-open`,
            name: 'Dink Battle Open (Half-Court Pilot)',
            format: 'Dink Battle (Pilot)',
            minDupr: 0,
            maxDupr: 5.5,
            entryFee: feePerPlayer,
            teamCap: courtsCount * 2,
            isPilot: true,
            scheduleDay: 'Saturday',
            timeSlot: '9:00 AM - 1:00 PM',
          },
          {
            id: `div-db-mixed`,
            name: 'Dink Battle Mixed Doubles Pilot',
            format: 'Dink Battle (Pilot)',
            minDupr: 0,
            maxDupr: 5.0,
            entryFee: feePerPlayer,
            teamCap: courtsCount * 2,
            isPilot: true,
            scheduleDay: 'Sunday',
            timeSlot: '1:00 PM - 5:00 PM',
          },
        ];
      } else if (isSenior) {
        generatedDivisions = [
          {
            id: `div-sen-men`,
            name: "Senior Men's Doubles 50+ (3.5 & 4.0)",
            format: 'Round Robin Pools to Playoffs',
            minDupr: 3.25,
            maxDupr: 4.25,
            entryFee: feePerPlayer,
            teamCap: 16,
            scheduleDay: 'Saturday',
            timeSlot: '8:30 AM - 1:00 PM',
          },
          {
            id: `div-sen-women`,
            name: "Senior Women's Doubles 50+ (3.5 & 4.0)",
            format: 'Round Robin Pools to Playoffs',
            minDupr: 3.25,
            maxDupr: 4.25,
            entryFee: feePerPlayer,
            teamCap: 16,
            scheduleDay: 'Saturday',
            timeSlot: '1:30 PM - 6:00 PM',
          },
          {
            id: `div-sen-mix`,
            name: "Senior Mixed Doubles 50+ Open",
            format: 'Round Robin Pools to Playoffs',
            minDupr: 0,
            maxDupr: 5.0,
            entryFee: feePerPlayer,
            teamCap: 16,
            scheduleDay: 'Sunday',
            timeSlot: '9:00 AM - 2:00 PM',
          },
        ];
      } else {
        generatedDivisions = [
          {
            id: `div-mixed-35`,
            name: 'Mixed Doubles 3.5 to 4.0',
            format: 'Round Robin Pools to Playoffs',
            minDupr: 3.25,
            maxDupr: 4.15,
            entryFee: feePerPlayer,
            teamCap: 16,
            scheduleDay: 'Saturday',
            timeSlot: '8:30 AM - 1:30 PM',
          },
          {
            id: `div-mens-40`,
            name: "Men's Doubles 4.0 and Above",
            format: 'Round Robin Pools to Playoffs',
            minDupr: 4.0,
            maxDupr: 5.5,
            entryFee: feePerPlayer,
            teamCap: 16,
            scheduleDay: 'Sunday',
            timeSlot: '8:30 AM - 1:30 PM',
          },
          {
            id: `div-womens-open`,
            name: "Women's Doubles Open",
            format: 'Round Robin Pools to Playoffs',
            minDupr: 0,
            maxDupr: 5.0,
            entryFee: feePerPlayer,
            teamCap: 16,
            scheduleDay: 'Saturday',
            timeSlot: '1:30 PM - 6:30 PM',
          },
          {
            id: `div-singles-open`,
            name: 'Singles Open Championship',
            format: 'Single Elimination with Bronze',
            minDupr: 0,
            maxDupr: 5.5,
            entryFee: feePerPlayer - 10,
            teamCap: 16,
            scheduleDay: 'Sunday',
            timeSlot: '2:00 PM - 6:30 PM',
          },
        ];
      }

      const totalTeams = generatedDivisions.reduce((acc, d) => acc + d.teamCap, 0);
      const totalPlayersCapacity = totalTeams * 2;
      const projectedRevenue = totalPlayersCapacity * feePerPlayer;

      const eventPayload: Partial<TournamentEvent> = {
        id: `tourn-${slug.slice(0, 8)}-${Date.now().toString().slice(-4)}`,
        name: title,
        slug,
        joinCode,
        dates: 'Sat Jun 20 - Sun Jun 21, 2026',
        venue: `${city} Premier Pickleball & Tennis Center`,
        city,
        state,
        status: 'Draft',
        requireWaiver: true,
        seedByDupr: isDupr,
        totalCourts: courtsCount,
        courtSurface: 'Outdoor Acrylic Hardcourt (PPA Standard)',
        ballType: 'Franklin X-40 (Outdoor Yellow)',
        tournamentFormat: 'Round Robin Pools to Single Elimination Playoffs',
        divisionsCount: generatedDivisions.length,
        registeredCount: 0,
        maxCapacity: totalPlayersCapacity,
        revenue: 0,
      };

      const agentReply: AgentMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: `I have architected **${title}** with **${courtsCount} dedicated competition courts**.\n\n• **Schedule Strategy**: I scheduled Mixed Doubles on Saturday and Gender Doubles on Sunday. This allows players to double-register without timing conflicts, maximizing revenue per player.\n• **Sanctioning**: ${isDupr ? 'Official DUPR Sanctioned (auto-rating export)' : 'Standard Invitational'}.\n• **Projected Revenue**: Up to **$${projectedRevenue.toLocaleString()}** at full capacity.\n\nReview the live tournament preview below. You can save as a Draft to fine-tune, or Launch Live immediately to start player registrations.`,
        preview: {
          event: eventPayload,
          divisions: generatedDivisions,
          projectedRevenue,
          projectedCapacity: totalPlayersCapacity,
        },
      };

      setMessages((prev) => [...prev, agentReply]);
    }, 750);
  };

  const handleExecuteCreation = (preview: AgentMessage['preview'], autoPublish: boolean) => {
    if (!preview) return;

    const finalEvent: TournamentEvent = {
      id: preview.event.id || `tourn-${Date.now().toString().slice(-5)}`,
      name: preview.event.name || 'New Tournament',
      slug: preview.event.slug || 'new-tournament',
      joinCode: preview.event.joinCode || 'D-8421',
      dates: preview.event.dates || 'Sat Jun 20 - Sun Jun 21, 2026',
      venue: preview.event.venue || 'Premier Pickleball Center',
      city: preview.event.city || 'Dallas',
      state: preview.event.state || 'TX',
      status: autoPublish ? 'Published' : 'Draft',
      requireWaiver: true,
      seedByDupr: true,
      totalCourts: preview.event.totalCourts || 12,
      courtSurface: preview.event.courtSurface || 'Outdoor Acrylic Hardcourt (PPA Standard)',
      ballType: preview.event.ballType || 'Franklin X-40 (Outdoor Yellow)',
      tournamentFormat: preview.event.tournamentFormat || 'Round Robin Pools to Single Elimination Playoffs',
      divisionsCount: preview.divisions.length,
      registeredCount: 0,
      maxCapacity: preview.projectedCapacity,
      revenue: 0,
    };

    onCreated(finalEvent, preview.divisions, autoPublish);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-gray-200 flex flex-col h-[85vh] animate-in fade-in duration-200">
        
        {/* Top Header */}
        <div className="flex justify-between items-center pb-4 border-b shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0A5C43] to-[#043324] text-white flex items-center justify-center shadow-xs">
              <Sparkles size={20} className="text-[#EF9F27]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-900">Copilot Autonomous Architect</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EF9F27]/20 text-[#8F5200]">
                  Agentic V2
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Conversational tournament provisioning & schedule math engine.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* Chat Stream Area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'agent' && (
                <div className="w-7 h-7 rounded-full bg-[#0A5C43] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Bot size={14} />
                </div>
              )}

              <div
                className={`max-w-[85%] p-4 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                  msg.sender === 'user'
                    ? 'bg-[#0A5C43] text-white font-medium rounded-br-xs'
                    : 'bg-gray-50 border border-gray-200 text-gray-800 shadow-2xs rounded-bl-xs'
                }`}
              >
                <div>{msg.text}</div>

                {/* Suggested Answer Chips */}
                {msg.suggestedAnswers && (
                  <div className="mt-3 pt-3 border-t border-gray-200/80 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-gray-500 block">
                      Quick Suggestions (Click to generate)
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestedAnswers.map((suggestion, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendMessage(suggestion)}
                          className="px-2.5 py-1.5 bg-white hover:bg-emerald-50 border border-gray-200 hover:border-emerald-300 rounded-lg text-[11px] text-gray-700 hover:text-emerald-950 font-medium transition text-left shadow-2xs"
                        >
                          &ldquo;{suggestion}&rdquo;
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Generated Tournament Executable Preview Card */}
                {msg.preview && (
                  <div className="mt-4 p-4 bg-white rounded-2xl border-2 border-[#0A5C43] shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider bg-emerald-100 px-2 py-0.5 rounded">
                          Architected Tournament
                        </span>
                        <h4 className="text-base font-bold text-gray-900 mt-1">
                          {msg.preview.event.name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {msg.preview.event.dates} &bull; {msg.preview.event.venue}
                        </p>
                      </div>
                      <span className="font-mono text-xs font-bold px-2 py-1 bg-gray-100 rounded border text-gray-700">
                        Join Code: {msg.preview.event.joinCode}
                      </span>
                    </div>

                    {/* Metric Badges */}
                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-gray-100 text-center">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-gray-400 block">Courts</span>
                        <strong className="text-sm text-gray-900">{msg.preview.event.totalCourts} Courts</strong>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-gray-400 block">Capacity</span>
                        <strong className="text-sm text-gray-900">{msg.preview.projectedCapacity} Players</strong>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-gray-400 block">Est. Revenue</span>
                        <strong className="text-sm text-[#0A5C43]">${msg.preview.projectedRevenue.toLocaleString()}</strong>
                      </div>
                    </div>

                    {/* Divisions Breakdown */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">
                        Calculated Division Schedule ({msg.preview.divisions.length})
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {msg.preview.divisions.map((d) => (
                          <div key={d.id} className="p-2.5 rounded-lg border border-gray-200 bg-gray-50 text-[11px] space-y-0.5">
                            <div className="font-bold text-gray-900 flex justify-between">
                              <span className="truncate">{d.name}</span>
                              <span className="text-[#0A5C43] font-mono">${d.entryFee}</span>
                            </div>
                            <div className="text-gray-500 flex justify-between text-[10px]">
                              <span>{d.scheduleDay}</span>
                              <span>Cap: {d.teamCap} teams</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Execution Buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => handleExecuteCreation(msg.preview, false)}
                        className="flex-1 py-2 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-xs transition shadow-2xs"
                      >
                        Save as Draft & Open Workspace
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExecuteCreation(msg.preview, true)}
                        className="flex-1 py-2 bg-[#0A5C43] hover:bg-[#084734] text-white rounded-xl font-bold text-xs transition shadow-2xs flex items-center justify-center gap-1.5"
                      >
                        <Zap size={14} className="text-[#EF9F27]" />
                        <span>Launch & Publish Live</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isAgentThinking && (
            <div className="flex items-center gap-2.5 text-gray-500 italic text-xs pl-10">
              <Sparkles size={16} className="animate-spin text-[#EF9F27]" />
              <span>Analyzing court math, scheduling division slots, and forecasting capacity...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="pt-3 border-t shrink-0 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type or speak instructions (e.g. '16 courts Dallas with 4 divisions and Franklin balls')..."
            className="flex-1 bg-gray-50 border border-gray-300 rounded-2xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#0A5C43]"
          />
          {/* Hands-free Voice Input (Driving / Walking) */}
          <VoiceInputButton
            onTranscript={(transcript) => setInputText(transcript)}
            onAutoSend={(transcript) => handleSendMessage(transcript)}
            autoSendEnabled={true}
          />
          <button
            type="button"
            onClick={() => handleSendMessage()}
            className="px-5 py-2.5 bg-[#0A5C43] hover:bg-[#084734] text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
          >
            <span>Ask Copilot</span>
            <Send size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
