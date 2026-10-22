import React, { useState } from 'react';
import { CopilotProposal, TournamentMatch } from '../../types/organizer';

interface CopilotViewProps {
  role: 'org' | 'desk';
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
        role === 'org'
          ? 'I can draft a tournament from a sentence, pivot rules live, seed divisions, and alert players. I propose first and change nothing until you confirm.'
          : 'I can suggest court moves, draft dispute summaries, and flag delays. The desk makes every final decision.',
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

    // 1. Guardrail test: Completed matches
    if (
      /(finished|completed|already played)/.test(qLower) &&
      /(change|edit|rule|score|modify)/.test(qLower)
    ) {
      newMsgs.push({
        fromBot: true,
        text: `⚠️ REJECTED BY GUARDRAIL:\n${completedMatches.length} matches (${completedMatches[0]?.id} to ${completedMatches[completedMatches.length - 1]?.id}) are COMPLETED.\n\nCompleted match results are locked and immutable for every user and for Copilot. If a result was entered incorrectly, the desk must open a formal dispute inquiry.`,
      });
      setMessages(newMsgs);
      return;
    }

    // 2. Rule Pivot: To 9 win by 2
    if (/(to 9|pivot|behind|shorten)/.test(qLower)) {
      const affected = scheduledMatches.filter((m) => m.rules !== 'To 9, win by 2');
      if (affected.length === 0) {
        newMsgs.push({
          fromBot: true,
          text: 'All remaining Mixed Doubles matches already play to 9. No changes needed.',
        });
      } else {
        const savedMinutes = Math.round((affected.length * 5) / 4) + 10;
        const prop: CopilotProposal = {
          id: proposalCounter,
          type: 'pivot',
          title: 'Apply Mid-Tournament Rule Pivot',
          toolName: 'apply_mid_tournament_rule_pivot',
          body: `Apply "To 9, win by 2" to ${affected.length} Mixed Doubles matches (${affected.length - 2} scheduled, 2 pending).\n• Skipped: ${completedMatches.length} completed (locked), 2 in-progress (rules stay as started).\n• Projected finish: 6:28 PM → 6:06 PM (${savedMinutes} minutes sooner)`,
          status: 'proposed',
          data: {
            matchIds: affected.map((m) => m.id),
            savedMinutes,
          },
        };
        setProposalCounter((prev) => prev + 1);

        newMsgs.push({
          fromBot: true,
          text: 'This proposal only touches matches that have not started. Review the time impact below:',
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
        title: 'Add Pilot Division',
        toolName: 'add_division',
        body: `Add "Dink Battle Pilot, Open" as a pilot division: doubles, 16 teams, $40 entry.\nRule: After 5th shot of a rally, court shrinks to half-court. Dinks decide the point; lobs and hard shots land out.`,
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
        text: 'Pilot division drafted. Nothing is published until you confirm.',
        proposal: prop,
      });
      setMessages(newMsgs);
      return;
    }

    // 4. Move matches for wet spot
    if (/wet|move|court 3/i.test(qLower)) {
      const prop: CopilotProposal = {
        id: proposalCounter,
        type: 'move',
        title: 'Reassign Court Schedule',
        toolName: 'reassign_court',
        body: `Block Court 3 after current match M107 concludes. Move upcoming matches M110 and M111 to Courts 6 and 7. Players receive an instant court call update.`,
        status: 'proposed',
        data: {
          courtToBlock: 3,
        },
      };
      setProposalCounter((prev) => prev + 1);

      newMsgs.push({
        fromBot: true,
        text: 'Court 3 currently has an in-progress match, so it will remain active until M107 finishes, then block.',
        proposal: prop,
      });
      setMessages(newMsgs);
      return;
    }

    // 5. Default reply
    newMsgs.push({
      fromBot: true,
      text: 'I can pivot tournament rules live, draft divisions, seed pools by DUPR, or reschedule courts during rain/surface delays.',
    });
    setMessages(newMsgs);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-display font-bold text-3xl">Dinkster Copilot AI</h1>
          <p className="text-sm text-gray-600">
            {role === 'org' ? 'Organizer Copilot' : 'Desk Copilot'} &bull; Always proposes first and changes nothing until confirmed.
          </p>
        </div>
        <div className="bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full text-xs font-bold">
          🛡️ Completed matches locked by guardrails
        </div>
      </div>

      <div className="grid grid-cols-[1.5fr_1fr] gap-6">
        {/* Chat Pane */}
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-sm flex flex-col h-[560px]">
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.fromBot ? 'items-start' : 'items-end'}`}
              >
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed max-w-[85%] ${
                    m.fromBot
                      ? 'bg-[#FAF8F3] border border-black/10 text-gray-800'
                      : 'bg-[#0A5C43] text-white'
                  }`}
                >
                  <div className="whitespace-pre-line">{m.text}</div>

                  {/* Proposal Card */}
                  {m.proposal && (
                    <div className="mt-3 p-3.5 bg-white rounded-xl border-2 border-[#0A5C43] text-gray-900 shadow-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-xs uppercase text-[#0A5C43]">
                          Proposal
                        </span>
                        <code className="text-[11px] font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                          {m.proposal.toolName}
                        </code>
                      </div>
                      <p className="text-xs text-gray-700 whitespace-pre-line my-2">
                        {m.proposal.body}
                      </p>

                      {m.proposal.status === 'proposed' ? (
                        <div className="flex gap-2 pt-2 border-t">
                          <button
                            onClick={() => onConfirmProposal(m.proposal!)}
                            className="flex-1 py-1.5 bg-[#0A5C43] text-white rounded-lg text-xs font-bold hover:opacity-90 shadow-sm"
                          >
                            Confirm & Execute
                          </button>
                          <button
                            onClick={() => onRejectProposal(m.proposal!.id)}
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <div className="pt-2 border-t text-xs font-bold text-[#0A5C43]">
                          ✓ {m.proposal.status === 'executed' ? 'Executed & Logged' : 'Rejected'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input Row */}
          <div className="flex gap-2 pt-4 border-t mt-2">
            <input
              type="text"
              placeholder="Describe tournament change or query..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-[#FAF8F3] border border-black/10 rounded-xl px-4 py-2.5 text-sm font-semibold"
            />
            <button
              onClick={() => handleSend()}
              className="px-5 py-2.5 bg-[#0A5C43] text-white rounded-xl font-bold text-sm hover:opacity-90"
            >
              Send
            </button>
          </div>
        </div>

        {/* Guardrails & Quick Prompts Pane */}
        <div className="flex flex-col gap-5">
          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-sm">
            <h3 className="font-display font-bold text-base mb-3">Try Quick Commands</h3>
            <div className="flex flex-col gap-2">
              {[
                'Courts are running behind. Switch the remaining pool matches in Mixed Doubles 3.5 to 4.0 to games to 9, win by 2.',
                'Add a Dink Battle pilot division',
                'Change the rules on the finished matches',
                'Court 3 has a wet spot. Move its upcoming matches to other courts.',
              ].map((cmd, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(cmd)}
                  className="text-left p-3 rounded-xl bg-[#FAF8F3] hover:bg-[#E8F7F1] border border-black/10 text-xs font-semibold text-gray-800 transition-colors"
                >
                  {cmd}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-sm">
            <h3 className="font-display font-bold text-base mb-2">Autonomous Guardrails</h3>
            <ul className="text-xs text-gray-600 space-y-2 leading-relaxed">
              <li>
                <span className="font-bold text-gray-800">• Immutability:</span> Finished/COMPLETED matches can never be edited by Copilot.
              </li>
              <li>
                <span className="font-bold text-gray-800">• In-Progress Stability:</span> Matches currently being played maintain their initial rules.
              </li>
              <li>
                <span className="font-bold text-gray-800">• Human-in-the-Loop:</span> Every rule shift requires one-click organizer approval.
              </li>
              <li>
                <span className="font-bold text-gray-800">• Full Audit Trail:</span> All modifications are recorded in the Change Log with rollbacks.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
