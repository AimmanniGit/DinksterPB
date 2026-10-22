import React, { useState } from 'react';
import { Sponsor } from '../../types/organizer';

interface SponsorsViewProps {
  sponsors: Sponsor[];
  totalCourts?: number;
  onAddSponsor: (sponsor: Sponsor) => void;
  onAssignCourt: (sponsorIndex: number, courtNumber: number | null) => void;
}

export const SponsorsView: React.FC<SponsorsViewProps> = ({
  sponsors,
  totalCourts = 8,
  onAddSponsor,
  onAssignCourt,
}) => {
  const [newSponsorName, setNewSponsorName] = useState('');
  const [newSponsorTier, setNewSponsorTier] = useState<'Title' | 'Gold' | 'Community'>('Gold');

  const handleAdd = () => {
    if (!newSponsorName.trim()) return;
    onAddSponsor({
      name: newSponsorName.trim(),
      tier: newSponsorTier,
      courtAssigned: null,
    });
    setNewSponsorName('');
  };

  const assignedSponsors = sponsors.filter((s) => s.courtAssigned !== null);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-display font-bold text-3xl">Tournament Sponsors</h1>
          <p className="text-sm text-gray-600">
            Sponsor banners appear across the player app, event page, and desk board. Assign court naming rights to sponsor specific courts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left: Sponsors Table & Form */}
        <div className="bg-white p-6 rounded-2xl border border-black/10 shadow-sm flex flex-col gap-4">
          <h2 className="font-display font-bold text-lg">Partner Roster & Naming Rights</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-xs font-bold text-gray-500 uppercase">
                  <th className="pb-2">Sponsor Name</th>
                  <th className="pb-2">Tier</th>
                  <th className="pb-2">Court Naming</th>
                </tr>
              </thead>
              <tbody>
                {sponsors.map((s, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="py-3 font-bold text-gray-900">{s.name}</td>
                    <td className="py-3">
                      <span className="text-[11px] font-bold px-2 py-0.5 bg-gray-100 rounded text-gray-700">
                        {s.tier}
                      </span>
                    </td>
                    <td className="py-3">
                      <select
                        value={s.courtAssigned ?? ''}
                        onChange={(e) =>
                          onAssignCourt(idx, e.target.value ? Number(e.target.value) : null)
                        }
                        className="bg-[#FAF8F3] border border-black/10 rounded-lg px-2.5 py-1 text-xs font-semibold"
                      >
                        <option value="">None (General)</option>
                        {Array.from({ length: totalCourts }, (_, i) => i + 1).map((c) => (
                          <option key={c} value={c}>
                            Court {c}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Sponsor Form */}
          <div className="bg-[#FAF8F3] p-3 rounded-xl border border-black/10 flex gap-2 items-center mt-2">
            <input
              type="text"
              placeholder="Brand name"
              value={newSponsorName}
              onChange={(e) => setNewSponsorName(e.target.value)}
              className="flex-1 bg-white border border-black/10 rounded-lg px-3 py-1.5 text-xs font-semibold"
            />
            <select
              value={newSponsorTier}
              onChange={(e) => setNewSponsorTier(e.target.value as any)}
              className="bg-white border border-black/10 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
            >
              <option value="Title">Title Sponsor</option>
              <option value="Gold">Gold Partner</option>
              <option value="Community">Community</option>
            </select>
            <button
              onClick={handleAdd}
              className="px-3.5 py-1.5 bg-[#0A5C43] text-white text-xs font-bold rounded-lg hover:opacity-90"
            >
              Add Sponsor
            </button>
          </div>
        </div>

        {/* Right: Live Preview of Court Calls */}
        <div className="bg-white p-6 rounded-2xl border border-black/10 shadow-sm flex flex-col gap-4">
          <h2 className="font-display font-bold text-lg">How Players See It</h2>
          <p className="text-xs text-gray-500">
            When court calls are broadcast to player devices via push notifications or displayed on the public kiosk, court sponsor names are prominently displayed:
          </p>

          <div className="flex flex-col gap-3">
            {assignedSponsors.length > 0 ? (
              assignedSponsors.map((s, idx) => (
                <div
                  key={idx}
                  className="bg-[#E8F7F1] border border-[#5DCAA5]/40 rounded-xl p-4"
                >
                  <div className="font-display font-extrabold text-base text-[#0A5C43]">
                    Court {s.courtAssigned}, presented by {s.name}
                  </div>
                  <p className="text-xs text-gray-700 mt-1">
                    <span className="font-bold">Player Push Notification:</span> "Report to Court {s.courtAssigned}, presented by {s.name} for your match."
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-xs text-gray-400 italic">
                Assign a court in the dropdown to preview live branded court calls.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
