import React, { useState } from 'react';
import { Dispute, Incident } from '../../types/organizer';

interface DisputesViewProps {
  disputes: Dispute[];
  incidents: Incident[];
  onDraftSummary: (disputeId: string) => void;
  onEscalate: (disputeId: string) => void;
  onResolveDispute: (disputeId: string, decision: string) => void;
  onAddIncident: (incident: Incident) => void;
}

export const DisputesView: React.FC<DisputesViewProps> = ({
  disputes,
  incidents,
  onDraftSummary,
  onEscalate,
  onResolveDispute,
  onAddIncident,
}) => {
  const [incCourt, setIncCourt] = useState(1);
  const [incType, setIncType] = useState<'Injury' | 'Equipment' | 'Conduct' | 'Other'>('Injury');
  const [incNotes, setIncNotes] = useState('');

  const handleSaveIncident = () => {
    if (!incNotes.trim()) return;
    onAddIncident({
      time: '1:45 PM',
      courtNumber: incCourt,
      type: incType,
      notes: incNotes.trim(),
    });
    setIncNotes('');
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Disputes Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Court Disputes</h1>
            <p className="text-sm text-gray-600">
              The court desk makes all binding decisions. Dinkster Copilot drafts impartial incident summaries.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {disputes.map((d) => (
            <div
              key={d.id}
              className="bg-white p-5 rounded-2xl border border-black/10 shadow-sm flex flex-col gap-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-base text-gray-900 tracking-tight">
                    {d.matchId} &bull; Court {d.courtNumber}
                  </h3>
                  <p className="text-sm text-gray-700 mt-0.5">
                    {d.issue} &bull; <span className="text-xs text-gray-500">Raised by {d.raisedBy}</span>
                  </p>
                </div>
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    d.status === 'Resolved'
                      ? 'bg-green-100 text-[#0A5C43]'
                      : d.status === 'Escalated'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {d.status}
                </span>
              </div>

              {/* AI Draft Summary Box */}
              {d.copilotSummary && (
                <div className="bg-[#E8F7F1] border border-[#5DCAA5]/40 rounded-xl p-3.5">
                  <div className="text-[11px] font-bold text-[#0A5C43] uppercase tracking-wider mb-1">
                    ✨ Copilot Draft Summary
                  </div>
                  <p className="text-xs text-gray-800 leading-relaxed">{d.copilotSummary}</p>
                </div>
              )}

              {/* Resolution Decision or Action Buttons */}
              {d.decision ? (
                <div className="pt-2 border-t text-xs font-bold text-gray-700">
                  <span className="text-[#0A5C43]">Final Decision:</span> {d.decision}
                </div>
              ) : (
                <div className="pt-2 border-t flex flex-wrap gap-2 items-center">
                  <button
                    onClick={() => onDraftSummary(d.id)}
                    className="py-1.5 px-3 bg-gray-100 text-gray-800 text-xs font-bold rounded-lg hover:bg-gray-200"
                  >
                    ✨ Draft Summary
                  </button>

                  {d.status === 'Open' && (
                    <button
                      onClick={() => onEscalate(d.id)}
                      className="py-1.5 px-3 bg-red-50 text-red-700 text-xs font-bold rounded-lg hover:bg-red-100"
                    >
                      Escalate
                    </button>
                  )}

                  {d.resolutionOptions.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => onResolveDispute(d.id, opt)}
                      className="py-1.5 px-3 bg-[#0A5C43] text-white text-xs font-bold rounded-lg hover:opacity-90"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Incidents Section */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Incident Log</h2>
          <p className="text-sm text-gray-600">Track court injuries, equipment repairs, or conduct flags.</p>
        </div>

        <div className="grid grid-cols-[1.5fr_1fr] gap-6">
          {/* Table */}
          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-sm overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-xs font-bold text-gray-500">
                  <th className="pb-2">Time</th>
                  <th className="pb-2">Court</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((inc, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="py-2.5 font-mono text-xs">{inc.time}</td>
                    <td className="py-2.5 font-bold">Court {inc.courtNumber}</td>
                    <td className="py-2.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 rounded text-gray-700">
                        {inc.type}
                      </span>
                    </td>
                    <td className="py-2.5 text-xs text-gray-600">{inc.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Form */}
          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-sm flex flex-col gap-3">
            <h3 className="font-bold text-base text-gray-900 tracking-tight">Log New Incident</h3>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
                Court
              </label>
              <select
                value={incCourt}
                onChange={(e) => setIncCourt(Number(e.target.value))}
                className="w-full bg-[#FAF8F3] border border-black/10 rounded-xl px-3 py-2 text-xs font-semibold"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((c) => (
                  <option key={c} value={c}>
                    Court {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
                Incident Type
              </label>
              <select
                value={incType}
                onChange={(e) => setIncType(e.target.value as any)}
                className="w-full bg-[#FAF8F3] border border-black/10 rounded-xl px-3 py-2 text-xs font-semibold"
              >
                <option>Injury</option>
                <option>Equipment</option>
                <option>Conduct</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
                Notes
              </label>
              <textarea
                rows={3}
                value={incNotes}
                onChange={(e) => setIncNotes(e.target.value)}
                placeholder="Describe details and outcome..."
                className="w-full bg-[#FAF8F3] border border-black/10 rounded-xl px-3 py-2 text-xs font-semibold"
              />
            </div>

            <button
              onClick={handleSaveIncident}
              className="w-full py-2 bg-[#0A5C43] text-white rounded-xl text-xs font-bold hover:opacity-90"
            >
              Save Incident
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
