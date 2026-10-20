'use client';

import React, { useState } from 'react';
import {
  Trophy,
  LayoutDashboard,
  Calendar,
  Users,
  Award,
  Sparkles,
  ClipboardList,
  Flame,
  AlertCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export default function OrganizerDashboard() {
  const [role, setRole] = useState<'org' | 'desk' | 'ref'>('org');
  const [activeTab, setActiveTab] = useState('dash');

  return (
    <div className="min-h-screen grid grid-cols-[260px_1fr]">
      {/* Sidebar */}
      <aside className="bg-[#0A5C43] text-white p-5 flex flex-col gap-3 sticky top-0 h-screen">
        <div className="font-display font-extrabold text-2xl tracking-tight mb-2">
          dink<span className="text-[#EF9F27]">ster</span>
          <span className="text-xs font-mono font-normal ml-2 opacity-70">web v5</span>
        </div>

        {/* Role Selector */}
        <div className="grid grid-cols-3 gap-1 bg-white/10 rounded-xl p-1 mb-3">
          {(['org', 'desk', 'ref'] as const).map((r) => (
            <button
              key={r}
              onClick={() => {
                setRole(r);
                setActiveTab(r === 'org' ? 'dash' : r === 'desk' ? 'board' : 'card');
              }}
              className={`py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                role === r ? 'bg-[#EF9F27] text-black' : 'text-white/80 hover:bg-white/10'
              }`}
            >
              {r === 'org' ? 'Organizer' : r === 'desk' ? 'Desk' : 'Ref'}
            </button>
          ))}
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1">
          {role === 'org' && (
            <>
              <NavItem
                icon={<LayoutDashboard size={18} />}
                label="Dashboard"
                active={activeTab === 'dash'}
                onClick={() => setActiveTab('dash')}
              />
              <NavItem
                icon={<Calendar size={18} />}
                label="Event Setup"
                active={activeTab === 'setup'}
                onClick={() => setActiveTab('setup')}
              />
              <NavItem
                icon={<Users size={18} />}
                label="Registrations"
                active={activeTab === 'regs'}
                badge="16/16"
                onClick={() => setActiveTab('regs')}
              />
              <NavItem
                icon={<Award size={18} />}
                label="Sponsors"
                active={activeTab === 'sponsors'}
                onClick={() => setActiveTab('sponsors')}
              />
              <NavItem
                icon={<Sparkles size={18} />}
                label="Copilot AI"
                active={activeTab === 'copilot'}
                onClick={() => setActiveTab('copilot')}
              />
              <NavItem
                icon={<ClipboardList size={18} />}
                label="Change Log"
                active={activeTab === 'log'}
                onClick={() => setActiveTab('log')}
              />
            </>
          )}

          {role === 'desk' && (
            <>
              <NavItem
                icon={<Trophy size={18} />}
                label="Court Board"
                active={activeTab === 'board'}
                onClick={() => setActiveTab('board')}
              />
              <NavItem
                icon={<AlertCircle size={18} />}
                label="Disputes"
                active={activeTab === 'disputes'}
                badge="2"
                onClick={() => setActiveTab('disputes')}
              />
              <NavItem
                icon={<Flame size={18} />}
                label="Incidents"
                active={activeTab === 'incidents'}
                onClick={() => setActiveTab('incidents')}
              />
              <NavItem
                icon={<Sparkles size={18} />}
                label="Desk Copilot"
                active={activeTab === 'copilot'}
                onClick={() => setActiveTab('copilot')}
              />
            </>
          )}

          {role === 'ref' && (
            <NavItem
              icon={<Trophy size={18} />}
              label="Referee Scorecard"
              active={activeTab === 'card'}
              onClick={() => setActiveTab('card')}
            />
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className="mt-auto text-xs opacity-70 flex items-center gap-2">
          <Clock size={14} />
          <span>Tournament Clock: 1:42 PM</span>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="font-display font-bold text-3xl">Dink Masters Open</h1>
            <p className="text-sm text-gray-600">Nov 7-8, 2026 &bull; Barton Springs Pickleball, Austin</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-green-100 text-[#0A5C43] rounded-full text-xs font-bold border border-green-300">
              Draft
            </span>
            <button className="px-4 py-2 bg-[#0A5C43] text-white rounded-xl font-bold text-sm hover:opacity-95">
              Publish Event
            </button>
          </div>
        </header>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <KpiCard label="Teams Paid" value="15 of 16" subtext="Mixed 3.5 to 4.0" />
          <KpiCard label="Gross Revenue" value="$3,630" subtext="10% platform fee: $363" />
          <KpiCard label="Matches Completed" value="6 of 24" subtext="Pool play in progress" />
          <KpiCard label="Open Disputes" value="2" subtext="1 line call, 1 score diff" />
        </div>

        {/* Dual Column Content */}
        <div className="grid grid-cols-[1.4fr_1fr] gap-6">
          <section className="bg-white p-6 rounded-2xl border border-black/10 shadow-sm">
            <h2 className="font-display font-bold text-xl mb-4">Projected Finish by Division</h2>
            
            <DivisionProgress
              title="Mixed Doubles 3.5 to 4.0"
              planned="6:10 PM"
              projected="6:28 PM"
              status="Behind"
            />
            <DivisionProgress
              title="Men's Doubles 4.0 and up"
              planned="5:25 PM"
              projected="5:25 PM"
              status="On plan"
            />
            <DivisionProgress
              title="Singles Open"
              planned="4:30 PM"
              projected="4:30 PM"
              status="On plan"
            />

            <div className="mt-6 p-4 bg-[#FEF3E2] border border-[#FAC775] rounded-xl flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-[#7A4A00]">Mixed 3.5 to 4.0 is running 18m behind</p>
                <p className="text-xs text-[#7A4A00]">Shortening 14 upcoming pool matches to games to 9 win by 2 will save 22 mins.</p>
              </div>
              <button className="px-3 py-1.5 bg-[#EF9F27] text-black font-bold text-xs rounded-lg shadow-sm">
                Ask Copilot
              </button>
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-black/10 shadow-sm">
            <h2 className="font-display font-bold text-xl mb-4">Courts Status</h2>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((c) => (
                <div key={c} className="p-3 border rounded-xl text-center">
                  <div className="font-bold text-sm">Court {c}</div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    c <= 5 ? 'bg-green-100 text-green-800' : c === 8 ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {c <= 5 ? 'Live' : c === 8 ? 'Called' : 'Open'}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500">Court 2 presented by Volt Paddles &bull; Court 8 called for Johnson / Rivera</p>
          </section>
        </div>
      </main>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active,
  badge,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between p-2.5 rounded-xl text-sm font-semibold transition-colors ${
        active ? 'bg-white/20 text-white shadow-sm' : 'text-white/70 hover:bg-white/10 hover:text-white'
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>
      {badge && (
        <span className="text-[11px] font-bold px-1.5 py-0.5 bg-[#EF9F27] text-black rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}

function KpiCard({ label, value, subtext }: { label: string; value: string; subtext: string }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-sm">
      <div className="text-xs font-bold text-gray-500 uppercase">{label}</div>
      <div className="font-display font-extrabold text-3xl my-1">{value}</div>
      <div className="text-xs text-gray-500">{subtext}</div>
    </div>
  );
}

function DivisionProgress({
  title,
  planned,
  projected,
  status,
}: {
  title: string;
  planned: string;
  projected: string;
  status: string;
}) {
  const isBehind = status === 'Behind';
  return (
    <div className="py-3 border-b last:border-0 flex justify-between items-center">
      <div>
        <div className="font-bold text-sm">{title}</div>
        <div className="text-xs text-gray-500">
          Planned finish: {planned} &bull; Projected: {projected}
        </div>
      </div>
      <span
        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
          isBehind ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}
      >
        {status}
      </span>
    </div>
  );
}
