import React from 'react';
import { Registration } from '../../types/organizer';

interface RegistrationsViewProps {
  registrations: Registration[];
  onAutoSeed: () => void;
  onRefund: (regId: string) => void;
  canViewFinancials?: boolean;
}

export const RegistrationsView: React.FC<RegistrationsViewProps> = ({
  registrations,
  onAutoSeed,
  onRefund,
  canViewFinancials = true,
}) => {
  const paidCount = registrations.filter((r) => r.paymentStatus === 'Paid').length;
  const gross = paidCount * 60;
  const fee = Math.round(gross * 0.10);
  const net = gross - fee;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Registrations</h1>
          <p className="text-sm text-gray-600">
            Mixed Doubles 3.5 to 4.0 &bull; {registrations.length} teams registered &bull; DUPR-verified seeding
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onAutoSeed}
            className="py-2.5 px-4 bg-[#0A5C43] text-white rounded-xl text-xs font-bold hover:opacity-95 shadow-sm"
          >
            ⚡ Auto-Seed by DUPR
          </button>
          <button
            onClick={() => alert('Registrations CSV exported to downloads.')}
            className="py-2.5 px-4 bg-white border border-black/10 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards: Financials (Founder/Director) vs Roster Readiness (Ref/Volunteer) */}
      {canViewFinancials ? (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-sm">
            <span className="text-xs font-bold text-gray-500 uppercase">Gross Entries</span>
            <div className="font-extrabold text-3xl text-gray-900 my-1 font-mono tracking-tight">${gross}</div>
            <span className="text-xs text-gray-500">{paidCount} teams paid ($60/team)</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-sm">
            <span className="text-xs font-bold text-gray-500 uppercase">Dinkster Platform Fee</span>
            <div className="font-extrabold text-3xl text-[#EF9F27] my-1 font-mono tracking-tight">${fee}</div>
            <span className="text-xs text-gray-500">10% standard tournament fee</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-sm">
            <span className="text-xs font-bold text-gray-500 uppercase">Organizer Net Revenue</span>
            <div className="font-extrabold text-3xl text-[#0A5C43] my-1 font-mono tracking-tight">${net}</div>
            <span className="text-xs text-gray-500">Instant Stripe Connect payout</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-sm">
            <span className="text-xs font-bold text-gray-500 uppercase">Registered Teams</span>
            <div className="font-extrabold text-3xl text-gray-900 my-1 tracking-tight">{registrations.length} Teams</div>
            <span className="text-xs text-emerald-700 font-semibold">{paidCount} confirmed rosters</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-sm">
            <span className="text-xs font-bold text-gray-500 uppercase">Digital Waivers</span>
            <div className="font-extrabold text-3xl text-[#0A5C43] my-1 tracking-tight">
              {registrations.filter((r) => r.waiverSigned).length} / {registrations.length}
            </div>
            <span className="text-xs text-gray-500">100% legal compliance</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-sm">
            <span className="text-xs font-bold text-gray-500 uppercase">Court Readiness</span>
            <div className="font-extrabold text-3xl text-[#EF9F27] my-1 tracking-tight">Ready</div>
            <span className="text-xs text-gray-500">Bracket & pool seeds assigned</span>
          </div>
        </div>
      )}

      {/* Registrations Table */}
      <div className="bg-white p-6 rounded-2xl border border-black/10 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-xs font-bold text-gray-500 uppercase">
              <th className="pb-3">Seed</th>
              <th className="pb-3">Team Name</th>
              <th className="pb-3">Avg DUPR</th>
              <th className="pb-3">Digital Waiver</th>
              <th className="pb-3">Stripe Status</th>
              <th className="pb-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((reg) => (
              <tr key={reg.id} className="border-b last:border-0 hover:bg-gray-50/50">
                <td className="py-3 font-mono font-bold text-gray-700">
                  {reg.seed ? `#${reg.seed}` : '—'}
                </td>
                <td className="py-3 font-bold text-gray-900">{reg.teamName}</td>
                <td className="py-3 font-semibold text-gray-700">{reg.avgDupr.toFixed(2)}</td>
                <td className="py-3">
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      reg.waiverSigned
                        ? 'bg-green-100 text-[#0A5C43]'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {reg.waiverSigned ? 'Signed' : 'Missing'}
                  </span>
                </td>
                <td className="py-3">
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      reg.paymentStatus === 'Paid'
                        ? 'bg-green-100 text-[#0A5C43]'
                        : reg.paymentStatus === 'Refunded'
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {reg.paymentStatus}
                  </span>
                </td>
                <td className="py-3 text-right">
                  {reg.paymentStatus === 'Paid' ? (
                    <button
                      onClick={() => onRefund(reg.id)}
                      className="px-2.5 py-1 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      Refund
                    </button>
                  ) : reg.paymentStatus === 'Pending' ? (
                    <button
                      onClick={() => alert(`Payment reminder email sent to ${reg.teamName}.`)}
                      className="px-2.5 py-1 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                    >
                      Remind
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
