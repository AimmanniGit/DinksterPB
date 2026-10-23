import React, { useState } from 'react';
import { CopilotProposal, TournamentMatch } from '../../types/organizer';
import { Sparkles, Bot, ShieldCheck, CheckCircle2, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { VoiceInputButton } from './VoiceInputButton';

interface CopilotViewProps {
  role: 'org' | 'desk' | 'admin';
  matches: TournamentMatch[];
  onConfirmProposal: (proposal: CopilotProposal) => void;
  onRejectProposal: (proposalId: number) => void;
  initialPrompt?: string;
}

export const CopilotView: React.FC<CopilotViewProps> = ({
  role,
  matches,
  onConfirmProposal,
  onRejectProposal,
  initialPrompt,
}) => {
  const [messages, setMessages] = useState<Array<{ fromBot: boolean; text: string; proposal?: CopilotProposal }>>([
    {
      fromBot: true,
      text:
        role === 'admin'
          ? 'Hello Sloan! I am your Dinkster Platform SuperAdmin Copilot. I have elevated write access to system lookup tables and tournament format templates. You can ask me to register new court surfaces, ball types, sanctioning bodies, division packages, or new tournament formats like MLP Team Dual or Compass Draw. I will stage the schema change for your 1-click confirmation.'
          : role === 'org'
          ? 'Hello! I am your Dinkster Tournament Copilot. I can draft tournaments, analyze schedule pace, simulate weather and wet-court pivots, recommend DUPR seeding, and optimize division revenue. I propose first and change nothing until you approve.'
          : 'Hello! I am your Desk Copilot. I can suggest court moves, draft line-call dispute summaries, and alert you to schedule bottlenecks.',
    },
  ]);
  const [inputText, setInputText] = useState(initialPrompt || '');
  const [proposalCounter, setProposalCounter] = useState(1);

  const completedMatches = matches.filter((m) => m.status === 'COMPLETED');
  const scheduledMatches = matches.filter((m) => m.status === 'SCHEDULED' || m.status === 'PENDING');

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const newMsgs = [...messages, { fromBot: false, text: query }];
    setInputText('');
    const qLower = query.toLowerCase();

    // ADMIN DIRECTIVE 1: Register New Ball Type in Lookups
    if (role === 'admin' && (/(ball|vulcan|dura|penn|onix)/.test(qLower) || /(add|new|register).*ball/.test(qLower))) {
      const isVulcan = /vulcan/i.test(qLower);
      const ballLabel = isVulcan
        ? 'Vulcan VPRO Flight (Official PPA)'
        : 'Pro Competition Tour Ball 40';
      const ballKey = isVulcan ? 'vulcan_vpro_flight' : 'pro_comp_tour_40';

      const prop: CopilotProposal = {
        id: proposalCounter,
        type: 'admin_lookup',
        title: `Register System Ball Option: ${ballLabel}`,
        toolName: 'add_system_lookup_option',
        body: `Register "${ballLabel}" into the platform lookup tables:\n• Category: BALL_TYPE\n• Key: ${ballKey}\n• Combobox Impact: Immediately available in Event Setup dropdowns across all Texas tournaments.\n• Specification: Approved for sanctioned DUPR and PPA tour competition.`,
        status: 'proposed',
        data: {
          category: 'BALL_TYPE',
          key: ballKey,
          label: ballLabel,
          description: 'Official tournament competition ball configured by SuperAdmin.',
        },
      };
      setProposalCounter((prev) => prev + 1);

      newMsgs.push({
        fromBot: true,
        text: `I have prepared the schema update for official tournament balls. Confirming this will write directly to the platform lookup registry:`,
        proposal: prop,
      });
      setMessages(newMsgs);
      return;
    }

    // ADMIN DIRECTIVE 2: Register New Court Surface in Lookups
    if (role === 'admin' && (/(surface|decoturf|cushion|modular|acrylic|clay)/.test(qLower) || /(add|new|register).*surface/.test(qLower))) {
      const surfaceLabel = /decoturf/i.test(qLower)
        ? 'Cushioned Pro Acrylic (DecoTurf)'
        : 'Hydro-Cushion Polyurethane Modular Tile';
      const surfaceKey = /decoturf/i.test(qLower) ? 'cushioned_decoturf_pro' : 'hydro_cushion_modular';

      const prop: CopilotProposal = {
        id: proposalCounter,
        type: 'admin_lookup',
        title: `Register Court Surface Option: ${surfaceLabel}`,
        toolName: 'add_system_lookup_option',
        body: `Register "${surfaceLabel}" into the platform lookup tables:\n• Category: COURT_SURFACE\n• Key: ${surfaceKey}\n• Combobox Impact: Organizers can immediately select this in Event Setup and fleet facility profiles.\n• Surface Spec: Multi-layer rubberized cushion meeting official US Open / PPA standards.`,
        status: 'proposed',
        data: {
          category: 'COURT_SURFACE',
          key: surfaceKey,
          label: surfaceLabel,
          description: 'Championship multi-layer cushioned surface standard configured by Admin.',
        },
      };
      setProposalCounter((prev) => prev + 1);

      newMsgs.push({
        fromBot: true,
        text: `Here is the court surface lookup proposal. Review and confirm to commit to the dropdown registry:`,
        proposal: prop,
      });
      setMessages(newMsgs);
      return;
    }

    // ADMIN DIRECTIVE 3: Register New Tournament Format Template
    if (role === 'admin' && (/(format|mlp|dual|waterfall|compass|template)/.test(qLower) || /(add|new|create).*format/.test(qLower))) {
      const isMlp = /mlp|dual/i.test(qLower);
      const fmtName = isMlp
        ? 'MLP Team Dual-Match (4-Player Coed Teams)'
        : 'Waterfall Pool Play with Crossover Playoffs';
      const fmtCode = isMlp ? 'mlp_dual_match' : 'waterfall_crossover';

      const prop: CopilotProposal = {
        id: proposalCounter,
        type: 'admin_format',
        title: `Register Tournament Format Template: ${fmtName}`,
        toolName: 'add_tournament_format_template',
        body: `Register new tournament format template in the platform schema:\n• Code: ${fmtCode}\n• Bracket Type: ${isMlp ? 'dual_match' : 'waterfall'}\n• Default Scoring: ${isMlp ? 'Rally scoring to 21 (Dreambreaker 1v1)' : 'Standard to 11 win by 2'}\n• Minimum Courts Recommended: 2 Match Courts\n• Combobox Impact: Organizers can immediately pick this format in Event Setup.`,
        status: 'proposed',
        data: {
          code: fmtCode,
          name: fmtName,
          bracketType: isMlp ? 'dual_match' : 'waterfall',
          description: isMlp
            ? '4-player coed teams play 1 WD, 1 MD, 2 XD games to 21 with singles Dreambreaker tiebreaker.'
            : 'Waterfall seeding where early match winners cascade into Championship flights.',
          minCourtsRecommended: 2,
          isPilot: false,
        },
      };
      setProposalCounter((prev) => prev + 1);

      newMsgs.push({
        fromBot: true,
        text: `Tournament format template drafted for the platform engine. Confirm to publish to all organizer dropdowns:`,
        proposal: prop,
      });
      setMessages(newMsgs);
      return;
    }

    // 1. Guardrail test: Completed matches immutability
    if (
      /(finished|completed|already played)/.test(qLower) &&
      /(change|edit|rule|score|modify)/.test(qLower)
    ) {
      newMsgs.push({
        fromBot: true,
        text: `⚠️ GUARDRAIL ENFORCED:\n${completedMatches.length} matches are locked as COMPLETED.\n\nCompleted match scores and rules are immutable to prevent tampering. If an official score was recorded incorrectly, the Tournament Director must file an inquiry in the Silent Host Disputes desk.`,
      });
      setMessages(newMsgs);
      return;
    }

    // 2. Schedule Pacing & Time Pivot
    if (/(to 9|pivot|behind|shorten|schedule|late|pace|finish time)/.test(qLower)) {
      const affected = scheduledMatches.filter((m) => m.rules !== 'To 9, win by 2');
      if (affected.length === 0) {
        newMsgs.push({
          fromBot: true,
          text: 'All remaining pool play matches are already playing to 9 points, win by 2. All courts are on target for on-time completion.',
        });
      } else {
        const savedMinutes = Math.round((affected.length * 5) / 4) + 10;
        const prop: CopilotProposal = {
          id: proposalCounter,
          type: 'pivot',
          title: 'Apply Mid-Tournament Rule Pivot',
          toolName: 'apply_mid_tournament_rule_pivot',
          body: `Switch ${affected.length} upcoming pool matches to "To 9, win by 2".\n• Preserves: ${completedMatches.length} completed matches and 2 live in-progress matches.\n• Pacing Impact: Projected finish shifts from 6:28 PM → 6:06 PM (saves ${savedMinutes} minutes).\n• Push notifications automatically dispatched to player phones.`,
          status: 'proposed',
          data: {
            matchIds: affected.map((m) => m.id),
            savedMinutes,
          },
        };
        setProposalCounter((prev) => prev + 1);

        newMsgs.push({
          fromBot: true,
          text: `I analyzed your active match schedule. Mixed Doubles is running ~18 minutes behind. Here is a recommended rule pivot:`,
          proposal: prop,
        });
      }
      setMessages(newMsgs);
      return;
    }

    // 3. Add Dink Battle Pilot
    if (/dink battle/i.test(qLower)) {
      const prop: CopilotProposal = {
        id: proposalCounter,
        type: 'dink',
        title: 'Add Pilot Division: Dink Battle Open',
        toolName: 'add_division',
        body: `Add "Dink Battle Pilot, Open" as an official pilot division:\n• Format: Doubles, 16 teams, $40/player entry.\n• Pilot Court Rule: After 5th shot of each rally, court shrinks to kitchen half-court. Dinks decide the point; drives & hard hits land out.\n• Projected Revenue: +$1,280 gross entry fees.`,
        status: 'proposed',
        data: {
          name: 'Dink Battle Pilot, Open',
          format: 'Dink Battle (pilot)',
          fee: 40,
        },
      };
      setProposalCounter((prev) => prev + 1);

      newMsgs.push({
        fromBot: true,
        text: 'Dink Battle Pilot division drafted! Review the structure below and confirm to add it to your live tournament.',
        proposal: prop,
      });
      setMessages(newMsgs);
      return;
    }

    // 4. Move matches for wet spot / Court Reassignment
    if (/wet|move|court 3|delay|rain/i.test(qLower)) {
      const prop: CopilotProposal = {
        id: proposalCounter,
        type: 'move',
        title: 'Reassign Court Schedule for Surface Maintenance',
        toolName: 'reassign_court',
        body: `Block Court 3 once active match M107 finishes.\n• Reassign upcoming matches M110 and M111 to Courts 6 and 7.\n• Send automated court call notifications to players via SMS/Push.\n• Zero disruption to in-progress matches.`,
        status: 'proposed',
        data: {
          courtToBlock: 3,
        },
      };
      setProposalCounter((prev) => prev + 1);

      newMsgs.push({
        fromBot: true,
        text: 'Court 3 currently has an active match (M107). I will let it complete safely, then immediately reassign subsequent matches.',
        proposal: prop,
      });
      setMessages(newMsgs);
      return;
    }

    // 5. Executive Analytics: Multi-Division Cross-Registration Rate
    if (/cross|multi|double|upsell|retention/i.test(qLower)) {
      newMsgs.push({
        fromBot: true,
        text: `📈 **Multi-Division Cross-Registration Analytics**:\n\n• **Cross-Registration Rate**: **38.4%** of registered players entered 2+ divisions.\n• **Incremental Revenue Generated**: **+$1,440.00** gross player intake without acquiring new leads.\n• **Top Cross-Pairing**: Players who registered for *Mixed Doubles 3.5* also registered for *Men's/Women's Doubles 3.5* on opposite schedule days.\n• **Strategic Recommendation**: By scheduling Mixed Doubles on Saturday and Gender Doubles on Sunday, you eliminate court timing conflicts and maximize double-entry revenue.`,
      });
      setMessages(newMsgs);
      return;
    }

    // 6. Executive Analytics: Financial Audit & Margin Analysis
    if (/financial|audit|revenue|profit|margin|stripe|payout|p&l/i.test(qLower)) {
      newMsgs.push({
        fromBot: true,
        text: `💰 **Executive Financial & Margin Audit**:\n\n• **Gross Player Entry Fees**: **$3,630.00** (16 of 16 teams confirmed).\n• **Sponsorship & Commercial Yield**: **$46,500.00** (Across 7 global and court-level brand deals).\n• **Total Portfolio Commercial Value**: **$50,130.00**.\n• **Dinkster Platform Take-Rate (10%)**: **$5,013.00**.\n• **Net Tournament Director Payout**: **$45,117.00**.\n• **Payout Settlement Engine**: Stripe Connect Express (Instant direct deposit settled).`,
      });
      setMessages(newMsgs);
      return;
    }

    // 7. Executive Analytics: Court Utilization Bottlenecks & Pacing
    if (/utilization|bottleneck|pacing|duration|throughput|heat/i.test(qLower)) {
      newMsgs.push({
        fromBot: true,
        text: `⚡ **Court Operations & Throughput Velocity Audit**:\n\n• **Active Court Utilization**: **92.4%** across 8 competition hardcourts.\n• **Average Match Length**: **33.5 minutes** (Fastest: Court 1 at 24m; Longest: Court 3 at 44m).\n• **Turnover Latency**: **3.8 minutes** between match called and first serve.\n• **Peak Congestion Window**: 10:00 AM – 2:30 PM (Pool play round 2).\n• **Pacing Recommendation**: All courts are currently on schedule to conclude at 6:06 PM with zero match backlogs.`,
      });
      setMessages(newMsgs);
      return;
    }

    // 8. General Analytics & Portfolio Overview
    if (/analytics|report|kpi|overview|metrics|performance/i.test(qLower)) {
      newMsgs.push({
        fromBot: true,
        text: `📊 **Executive Analytics Summary**:\n\n• **Portfolio Status**: 4 Tournaments tracked (1 Live, 1 Upcoming, 1 Draft, 1 Concluded).\n• **Total Portfolio Intake**: **$50,130.00** gross invoiced.\n• **Player Roster Fill**: **100%** capacity filled on live event.\n• **Court Efficiency**: **92.4%** active utilization rate.\n• **Sponsor Deliverables**: 7 of 7 partner assets verified (Jumbo TV, Court Banners, Portal Badges).\n\n💡 *Tip: You can open the dedicated **Executive Analytics** tab on your top navigation bar for visual charts and interactive heatmaps.*`,
      });
      setMessages(newMsgs);
      return;
    }

    // 9. Seeding & DUPR analytics
    if (/seed|dupr|rating/i.test(qLower)) {
      newMsgs.push({
        fromBot: true,
        text: `📊 **DUPR Seeding Analysis**:\n• 16 teams are registered across 4 round-robin pools.\n• Team average DUPR ranges from 3.42 to 3.98.\n• Recommended seeding: Snake seeding (Pool A: Seeds 1, 8, 9, 16; Pool B: Seeds 2, 7, 10, 15).\n• You can execute Auto-Seed with 1-click in the **Registrations** tab.`,
      });
      setMessages(newMsgs);
      return;
    }

    // 6. Dispute Resolution
    if (/dispute|line call|referee/i.test(qLower)) {
      newMsgs.push({
        fromBot: true,
        text: `⚖️ **Dispute Desk Recommendation**:\n• Dispute D1 on Court 2 (baseline line call): Referee R. Gill called the shot IN on game point. Player T. Lowe requested review. In the absence of multi-camera replay, USA Pickleball rules dictate the certified on-court referee call stands.\n• Recommendation: Confirm referee ruling via Silent Host Override to keep tournament flow on schedule.`,
      });
      setMessages(newMsgs);
      return;
    }

    // 7. General Assistant Response
    newMsgs.push({
      fromBot: true,
      text: `I've analyzed your tournament data. Here are recommended actions you can trigger:\n\n1. **Rule Pivots**: Say "Shorten pool matches to games to 9" if courts are running behind.\n2. **Pilot Divisions**: Say "Add Dink Battle pilot" to create a half-court pilot division.\n3. **Court Management**: Say "Move matches from Court 3" to reroute around wet spots.\n4. **Seeding**: Say "Analyze DUPR seeds" to review pool fairness.`,
    });
    setMessages(newMsgs);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
              Autonomous Copilot AI
            </span>
            <span className="text-[11px] text-gray-500 font-medium">
              Human-in-the-Loop Architecture
            </span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            {role === 'org' ? 'Tournament Director Copilot' : 'Desk Operations Copilot'}
          </h1>
          <p className="text-xs text-gray-600 mt-0.5">
            Real-time schedule pacing, rule pivots, court reassignments, and dispute intelligence. Copilot proposes first and executes only upon your approval.
          </p>
        </div>
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>Completed matches immutable</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-5">
        {/* Chat Pane */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col h-[560px]">
          <div className="flex-1 overflow-y-auto pr-1 space-y-3.5 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.fromBot ? 'items-start' : 'items-end'}`}
              >
                <div
                  className={`p-3.5 rounded-2xl leading-relaxed max-w-[88%] ${
                    m.fromBot
                      ? 'bg-gray-50 border border-gray-200 text-gray-800'
                      : 'bg-[#0A5C43] text-white font-medium'
                  }`}
                >
                  <div className="whitespace-pre-line">{m.text}</div>

                  {/* Proposal Card */}
                  {m.proposal && (
                    <div className="mt-3 p-3 bg-white rounded-xl border border-[#0A5C43] text-gray-900 shadow-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-[11px] uppercase text-[#0A5C43] flex items-center gap-1">
                          <Zap size={12} className="text-[#EF9F27]" />
                          <span>AI Proposal</span>
                        </span>
                        <code className="text-[10px] font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">
                          {m.proposal.toolName}
                        </code>
                      </div>
                      <p className="text-xs text-gray-700 whitespace-pre-line my-2 leading-relaxed">
                        {m.proposal.body}
                      </p>

                      {m.proposal.status === 'proposed' ? (
                        <div className="flex gap-2 pt-2 border-t border-gray-100">
                          <button
                            type="button"
                            onClick={() => onConfirmProposal(m.proposal!)}
                            className="flex-1 py-1.5 bg-[#0A5C43] text-white rounded-lg text-xs font-semibold hover:bg-[#084734] shadow-xs transition"
                          >
                            Confirm & Execute
                          </button>
                          <button
                            type="button"
                            onClick={() => onRejectProposal(m.proposal!.id)}
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 transition"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <div className="pt-2 border-t border-gray-100 text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                          <CheckCircle2 size={13} />
                          <span>{m.proposal.status === 'executed' ? 'Executed & Logged in Audit Trail' : 'Proposal Dismissed'}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input Row */}
          <div className="flex items-center gap-2 pt-3 border-t border-gray-100 mt-2">
            <input
              type="text"
              placeholder="Ask Copilot or use voice (e.g. 'Are courts on schedule?', 'Move wet court matches')..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-[#0A5C43]"
            />
            {/* Hands-free Voice Input Button (Drive / Walk Dictation) */}
            <VoiceInputButton
              onTranscript={(transcript) => setInputText(transcript)}
              onAutoSend={(transcript) => handleSend(transcript)}
              autoSendEnabled={true}
            />
            <button
              type="button"
              onClick={() => handleSend()}
              className="px-4 py-2 bg-[#0A5C43] text-white rounded-xl font-semibold text-xs hover:bg-[#084734] transition shadow-xs"
            >
              Send
            </button>
          </div>
        </div>

        {/* Quick Commands & Guardrails Pane */}
        <div className="flex flex-col gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2.5">
              Instant AI Directives
            </h3>
            <div className="flex flex-col gap-2">
              {(role === 'admin'
                ? [
                    'Add Vulcan VPRO Flight (Official PPA) to official ball dropdown',
                    'Add Cushioned Pro Acrylic (DecoTurf) to court surfaces lookup',
                    'Add MLP Team Dual-Match (4-Player Coed) tournament format template',
                    'Register new pilot scoring rule with 5th shot kitchen shrink',
                    'Analyze schema lookup tables feeding tournament comboboxes',
                  ]
                : [
                    'Analyze multi-division cross-registration revenue rate',
                    'Perform financial audit of gross revenue and director net payouts',
                    'Analyze court throughput bottlenecks and match duration pacing',
                    'Courts are running behind. Switch the remaining pool matches in Mixed Doubles 3.5 to 4.0 to games to 9, win by 2.',
                    'Add a Dink Battle pilot division',
                    'Court 3 has a wet spot. Move its upcoming matches to other courts.',
                  ]
              ).map((cmd, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSend(cmd)}
                  className="text-left p-2.5 rounded-xl bg-gray-50 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-200 text-xs text-gray-700 hover:text-emerald-950 transition"
                >
                  {cmd}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
              Autonomous Governance
            </h3>
            <ul className="text-xs text-gray-600 space-y-2 leading-relaxed">
              <li>
                <strong className="text-gray-800">• Immutability:</strong> Completed matches are locked forever against alterations.
              </li>
              <li>
                <strong className="text-gray-800">• In-Progress Stability:</strong> Live matches finish under the rules they started with.
              </li>
              <li>
                <strong className="text-gray-800">• Human Approval:</strong> Copilot recommends rule shifts; the director decides with 1-click.
              </li>
              <li>
                <strong className="text-gray-800">• Change Log:</strong> Every action is time-stamped and reversible via rollback.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
