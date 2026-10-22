import React, { useState } from 'react';
import { TournamentEvent, Division, Sponsor } from '../../types/organizer';

interface EventSetupViewProps {
  event: TournamentEvent;
  divisions: Division[];
  sponsors: Sponsor[];
  onUpdateEvent: (updated: TournamentEvent) => void;
  onAddDivision: (div: Division) => void;
  onPublish: () => void;
}

export const EventSetupView: React.FC<EventSetupViewProps> = ({
  event,
  divisions,
  sponsors,
  onUpdateEvent,
  onAddDivision,
  onPublish,
}) => {
  const [newDivName, setNewDivName] = useState('');
  const [newDivFormat, setNewDivFormat] = useState('Doubles');
  const [newDivFee, setNewDivFee] = useState(50);
  const [newDivCap, setNewDivCap] = useState(16);

  const handleAdd = () => {
    if (!newDivName.trim()) return;
    onAddDivision({
      id: `DIV-${Date.now().toString().slice(-4)}`,
      name: newDivName.trim(),
      format: newDivFormat,
      minDupr: 0,
      maxDupr: 5.5,
      entryFee: newDivFee,
      teamCap: newDivCap,
      isPilot: newDivFormat.includes('Dink Battle'),
    });
    setNewDivName('');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-display font-bold text-3xl">Event Setup</h1>
          <p className="text-sm text-gray-600">
            Configure your tournament on the left. The player-facing public registration page updates in real-time on the right.
          </p>
        </div>
        <button
          onClick={onPublish}
          className="px-5 py-2.5 bg-[#0A5C43] text-white rounded-xl font-bold text-sm hover:opacity-95 shadow-sm"
        >
          {event.status === 'Draft' ? 'Publish Event Live' : 'Update Published Page'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left: Setup Forms */}
        <div className="flex flex-col gap-5">
          {/* Metadata Card */}
          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-sm">
            <h2 className="font-display font-bold text-lg mb-3">Event Details</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
                  Event Name
                </label>
                <input
                  type="text"
                  value={event.name}
                  onChange={(e) => onUpdateEvent({ ...event, name: e.target.value })}
                  className="w-full bg-[#FAF8F3] border border-black/10 rounded-xl px-3.5 py-2 text-sm font-semibold focus:outline-none focus:border-[#0A5C43]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
                  Dates
                </label>
                <input
                  type="text"
                  value={event.dates}
                  onChange={(e) => onUpdateEvent({ ...event, dates: e.target.value })}
                  className="w-full bg-[#FAF8F3] border border-black/10 rounded-xl px-3.5 py-2 text-sm font-semibold focus:outline-none focus:border-[#0A5C43]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
                  Venue & City
                </label>
                <input
                  type="text"
                  value={event.venue}
                  onChange={(e) => onUpdateEvent({ ...event, venue: e.target.value })}
                  className="w-full bg-[#FAF8F3] border border-black/10 rounded-xl px-3.5 py-2 text-sm font-semibold focus:outline-none focus:border-[#0A5C43]"
                />
              </div>

              <div className="flex items-center gap-6 mt-2 pt-2 border-t">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-gray-700">
                  <input
                    type="checkbox"
                    checked={event.requireWaiver}
                    onChange={(e) =>
                      onUpdateEvent({ ...event, requireWaiver: e.target.checked })
                    }
                    className="rounded accent-[#0A5C43]"
                  />
                  Require Digital Waiver
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-gray-700">
                  <input
                    type="checkbox"
                    checked={event.seedByDupr}
                    onChange={(e) =>
                      onUpdateEvent({ ...event, seedByDupr: e.target.checked })
                    }
                    className="rounded accent-[#0A5C43]"
                  />
                  Seed Pools by DUPR
                </label>
              </div>
            </div>
          </div>

          {/* Divisions Builder */}
          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-sm">
            <h2 className="font-display font-bold text-lg mb-3">Divisions</h2>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-xs font-bold text-gray-500">
                    <th className="pb-2">Name</th>
                    <th className="pb-2">Format</th>
                    <th className="pb-2">DUPR Range</th>
                    <th className="pb-2">Entry Fee</th>
                    <th className="pb-2">Cap</th>
                  </tr>
                </thead>
                <tbody>
                  {divisions.map((d) => (
                    <tr key={d.id} className="border-b last:border-0">
                      <td className="py-2.5 font-bold">
                        {d.name}
                        {d.isPilot && (
                          <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 bg-[#FEF3E2] text-[#7A4A00] rounded">
                            Pilot
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-gray-600">{d.format}</td>
                      <td className="py-2.5 text-gray-600">
                        {d.minDupr ? `${d.minDupr} - ${d.maxDupr}` : 'Open'}
                      </td>
                      <td className="py-2.5 font-semibold">${d.entryFee}</td>
                      <td className="py-2.5 text-gray-600">{d.teamCap} teams</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Division Form */}
            <div className="bg-[#FAF8F3] p-3 rounded-xl border border-black/10 flex flex-wrap gap-2 items-center">
              <input
                type="text"
                placeholder="Division name"
                value={newDivName}
                onChange={(e) => setNewDivName(e.target.value)}
                className="flex-1 min-w-[140px] bg-white border border-black/10 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
              />
              <select
                value={newDivFormat}
                onChange={(e) => setNewDivFormat(e.target.value)}
                className="bg-white border border-black/10 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
              >
                <option>Doubles</option>
                <option>Singles</option>
                <option>Mixed doubles</option>
                <option>Dink Battle (pilot)</option>
              </select>
              <input
                type="number"
                placeholder="Fee ($)"
                value={newDivFee}
                onChange={(e) => setNewDivFee(Number(e.target.value))}
                className="w-16 bg-white border border-black/10 rounded-lg px-2 py-1.5 text-xs font-semibold"
              />
              <button
                onClick={handleAdd}
                className="px-3 py-1.5 bg-[#0A5C43] text-white text-xs font-bold rounded-lg hover:opacity-90"
              >
                + Add
              </button>
            </div>
          </div>
        </div>

        {/* Right: Live Public Page Preview */}
        <div className="bg-white rounded-2xl border border-black/10 overflow-hidden shadow-sm flex flex-col">
          <div className="bg-[#0A5C43] text-white p-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#EF9F27] block mb-1">
              Public Event Preview
            </span>
            <h2 className="font-display font-extrabold text-2xl">{event.name}</h2>
            <p className="text-sm opacity-90 mt-1">{event.dates}</p>
            <p className="text-xs opacity-75 mt-0.5">{event.venue}</p>
          </div>

          <div className="p-6 flex flex-col gap-4 flex-1">
            <div>
              <h3 className="font-display font-bold text-base mb-2">Available Divisions</h3>
              <div className="divide-y border-y">
                {divisions.map((d) => (
                  <div key={d.id} className="py-2.5 flex justify-between items-center text-sm">
                    <div>
                      <div className="font-bold">
                        {d.name}
                        {d.isPilot && (
                          <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 bg-[#FEF3E2] text-[#7A4A00] rounded">
                            Pilot
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {d.format} &bull; Cap: {d.teamCap} teams
                      </div>
                    </div>
                    <div className="font-display font-bold text-base text-[#0A5C43]">
                      ${d.entryFee}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {sponsors.length > 0 && (
              <div className="text-xs text-gray-500">
                <span className="font-bold text-gray-700">Presented by:</span>{' '}
                {sponsors.map((s) => s.name).join(', ')}
              </div>
            )}

            {event.requireWaiver && (
              <div className="bg-[#E8F7F1] p-3 rounded-xl text-xs text-[#0A5C43] font-semibold">
                ✓ Digital liability waiver must be electronically signed upon entry.
              </div>
            )}

            <button className="w-full mt-auto py-3 bg-[#EF9F27] text-black font-bold text-sm rounded-xl shadow-sm hover:opacity-95">
              Register Team Now
            </button>
            <p className="text-[11px] text-gray-400 text-center">
              {event.status === 'Draft'
                ? 'Draft state: Only organizers can view this page.'
                : 'Published: Visible to players on the Dinkster mobile app.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
