'use client';

import React, { useState } from 'react';
import { Sponsor, SponsorCategory, SponsorScope, Division } from '../../types/organizer';
import {
  Trophy,
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  CheckCircle2,
  Tv,
  Globe,
  Smartphone,
  ShieldCheck,
  Sparkles,
  Calendar,
  Layers,
  ChevronDown,
  Tag,
  Building,
} from 'lucide-react';

interface SponsorsManagementHubProps {
  sponsors: Sponsor[];
  totalCourts?: number;
  divisions?: Division[];
  onAddSponsor: (sponsor: Sponsor) => void;
  onUpdateSponsor?: (index: number, updated: Sponsor) => void;
  onDeleteSponsor?: (index: number) => void;
  onAssignCourt?: (sponsorIndex: number, courtNumber: number | null) => void;
  isCompact?: boolean;
  canViewFinancials?: boolean;
  canManageSponsors?: boolean;
}

export const CATEGORY_INFO: Record<
  SponsorCategory,
  { label: string; icon: string; badgeColor: string; description: string }
> = {
  title: {
    label: 'Title / Presenting Partner',
    icon: '🏆',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    description: 'Headline branding across tournament title, TV broadcasts, and player portal.',
  },
  court: {
    label: 'Court Naming Rights',
    icon: '🏟️',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    description: 'Naming rights for dedicated court (e.g. Center Stadium Court, Court 2).',
  },
  division_medal: {
    label: 'Division & Medal Sponsor',
    icon: '🥇',
    badgeColor: 'bg-yellow-100 text-yellow-900 border-yellow-300',
    description: 'Gold, Silver, Bronze medal ceremony and division podium naming sponsor.',
  },
  hydration: {
    label: 'Hydration & Nutrition',
    icon: '💧',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
    description: 'Official tournament hydration, beverage stations, and player towels.',
  },
  finance: {
    label: 'Financial / Cash Prize Partner',
    icon: '💳',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
    description: 'Official banking partner, cash prize presentations, and financial sponsor.',
  },
  paddles_gear: {
    label: 'Paddles & Equipment',
    icon: '🏓',
    badgeColor: 'bg-orange-100 text-orange-900 border-orange-300',
    description: 'Official tournament paddle, ball provider, and demo equipment.',
  },
  scorecards: {
    label: 'Scorecards & Desk Assets',
    icon: '📋',
    badgeColor: 'bg-teal-100 text-teal-900 border-teal-300',
    description: 'Logo on digital scoreboards, referee clipboards, and desk verification stamps.',
  },
  apparel: {
    label: 'Apparel & Merchandise',
    icon: '👕',
    badgeColor: 'bg-pink-100 text-pink-900 border-pink-300',
    description: 'Tournament player shirts, volunteer vests, and podium hats.',
  },
  vendor_village: {
    label: 'Vendor Village Booth',
    icon: '🎪',
    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    description: 'On-site physical retail booth and community sampling zone.',
  },
};

export const SponsorsManagementHub: React.FC<SponsorsManagementHubProps> = ({
  sponsors,
  totalCourts = 8,
  divisions = [],
  onAddSponsor,
  onUpdateSponsor,
  onDeleteSponsor,
  onAssignCourt,
  isCompact = false,
  canViewFinancials = true,
  canManageSponsors = true,
}) => {
  // Scope filter: 'all' | 'global' | 'event'
  const [scopeFilter, setScopeFilter] = useState<'all' | 'global' | 'event'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Add / Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [tier, setTier] = useState<Sponsor['tier']>('Official Gold');
  const [scope, setScope] = useState<SponsorScope>('event');
  const [category, setCategory] = useState<SponsorCategory>('court');
  const [courtAssigned, setCourtAssigned] = useState<number | null>(1);
  const [divisionAssigned, setDivisionAssigned] = useState<string | null>(null);
  const [assetDescription, setAssetDescription] = useState('');
  const [amountPaid, setAmountPaid] = useState<number>(1500);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [jumboTv, setJumboTv] = useState(true);
  const [playerPortal, setPlayerPortal] = useState(true);
  const [courtBanners, setCourtBanners] = useState(true);
  const [mobileShoutout, setMobileShoutout] = useState(true);

  // Filtered List
  const filteredSponsors = sponsors.filter((s) => {
    const sScope = s.scope || 'event';
    const sCat = s.category || 'court';
    if (scopeFilter !== 'all' && sScope !== scopeFilter) return false;
    if (categoryFilter !== 'all' && sCat !== categoryFilter) return false;
    return true;
  });

  // Calculate Metrics
  const totalSponsorRevenue = sponsors.reduce((acc, s) => acc + (s.amountPaid || 0), 0);
  const globalSponsorsCount = sponsors.filter((s) => s.scope === 'global').length;
  const eventSponsorsCount = sponsors.filter((s) => s.scope !== 'global').length;
  const courtSponsorsCount = sponsors.filter((s) => s.courtAssigned !== null).length;

  const handleOpenAdd = () => {
    setEditingIndex(null);
    setName('');
    setTier('Official Gold');
    setScope('event');
    setCategory('court');
    setCourtAssigned(1);
    setDivisionAssigned(divisions[0]?.id || null);
    setAssetDescription('');
    setAmountPaid(1500);
    setStartDate('Nov 1, 2026');
    setEndDate('Nov 30, 2026');
    setWebsiteUrl('');
    setJumboTv(true);
    setPlayerPortal(true);
    setCourtBanners(true);
    setMobileShoutout(true);
    setShowModal(true);
  };

  const handleOpenEdit = (index: number) => {
    const s = sponsors[index];
    if (!s) return;
    setEditingIndex(index);
    setName(s.name);
    setTier(s.tier);
    setScope(s.scope || 'event');
    setCategory(s.category || 'court');
    setCourtAssigned(s.courtAssigned ?? null);
    setDivisionAssigned(s.divisionAssigned || null);
    setAssetDescription(s.assetDescription || '');
    setAmountPaid(s.amountPaid || 0);
    setStartDate(s.startDate || '');
    setEndDate(s.endDate || '');
    setWebsiteUrl(s.websiteUrl || '');
    setJumboTv(s.deliverables?.jumboTvDisplay ?? true);
    setPlayerPortal(s.deliverables?.playerPortalBanner ?? true);
    setCourtBanners(s.deliverables?.courtBanners ?? true);
    setMobileShoutout(s.deliverables?.mobileAppShoutout ?? true);
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload: Sponsor = {
      id: editingIndex !== null ? sponsors[editingIndex]?.id || `sp-${Date.now()}` : `sp-${Date.now()}`,
      name: name.trim(),
      tier,
      scope,
      category,
      categoryLabel: CATEGORY_INFO[category].label,
      courtAssigned: category === 'court' ? courtAssigned : null,
      divisionAssigned: category === 'division_medal' ? divisionAssigned : null,
      assetDescription: assetDescription.trim(),
      amountPaid: Math.max(0, amountPaid),
      startDate: startDate.trim() || undefined,
      endDate: endDate.trim() || undefined,
      websiteUrl: websiteUrl.trim() || undefined,
      deliverables: {
        jumboTvDisplay: jumboTv,
        playerPortalBanner: playerPortal,
        courtBanners: courtBanners,
        mobileAppShoutout: mobileShoutout,
      },
    };

    if (editingIndex !== null && onUpdateSponsor) {
      onUpdateSponsor(editingIndex, payload);
    } else {
      onAddSponsor(payload);
    }

    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & KPI Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase text-[#0A5C43] tracking-wider">Commercial Revenue</span>
            <span>&bull;</span>
            <span className="text-xs text-gray-500 font-semibold">Global & Event Partner Engine</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <span>Sponsorship & Partner Hub</span>
          </h2>
        </div>

        {canManageSponsors && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-[#0A5C43] hover:bg-[#084734] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs shrink-0 self-start md:self-auto"
          >
            <Plus size={15} />
            <span>Add New Sponsor</span>
          </button>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {canViewFinancials ? (
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-1">
              <span>Sponsorship Revenue</span>
              <DollarSign size={15} className="text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-gray-900">
              ${totalSponsorRevenue.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-700 font-bold mt-1">
              {sponsors.length} Active Partners Contracted
            </div>
          </div>
        ) : (
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-1">
              <span>Courts Sponsored</span>
              <Trophy size={15} className="text-[#0A5C43]" />
            </div>
            <div className="text-2xl font-black text-gray-900">
              {courtSponsorsCount} Courts Branded
            </div>
            <div className="text-[11px] text-emerald-700 font-bold mt-1">
              {sponsors.length} Active Partner Activations
            </div>
          </div>
        )}

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-1">
            <span>Global Fleet Deals</span>
            <Globe size={15} className="text-blue-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">{globalSponsorsCount}</div>
          <div className="text-[11px] text-gray-500 font-semibold mt-1">Multi-event annual contracts</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-1">
            <span>Event-Level Sponsors</span>
            <Trophy size={15} className="text-amber-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">{eventSponsorsCount}</div>
          <div className="text-[11px] text-gray-500 font-semibold mt-1">Single-tournament activations</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-1">
            <span>Court Naming Rights</span>
            <Layers size={15} className="text-purple-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">
            {courtSponsorsCount} / {totalCourts}
          </div>
          <div className="text-[11px] text-purple-700 font-bold mt-1">
            {totalCourts - courtSponsorsCount} Open Courts Available
          </div>
        </div>
      </div>

      {/* Scope and Category Navigation Pills */}
      <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Scope Toggle */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setScopeFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition ${
              scopeFilter === 'all' ? 'bg-white text-gray-900 font-bold shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Partners ({sponsors.length})
          </button>
          <button
            type="button"
            onClick={() => setScopeFilter('global')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
              scopeFilter === 'global' ? 'bg-white text-blue-700 font-bold shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Globe size={13} />
            <span>Global Fleet ({globalSponsorsCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setScopeFilter('event')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
              scopeFilter === 'event' ? 'bg-white text-[#0A5C43] font-bold shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Trophy size={13} />
            <span>Event Specific ({eventSponsorsCount})</span>
          </button>
        </div>

        {/* Category Filter Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs font-bold bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-800 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {Object.entries(CATEGORY_INFO).map(([key, info]) => (
              <option key={key} value={key}>
                {info.icon} {info.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sponsors Table / Cards Grid */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {filteredSponsors.length === 0 ? (
          <div className="py-16 text-center">
            <Building size={32} className="mx-auto text-gray-300 mb-2" />
            <h4 className="text-sm font-bold text-gray-800">No sponsors found in this view.</h4>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Add sponsors for court naming, presentation assets, hydration, medals, or global fleet deals.
            </p>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="mt-4 px-3.5 py-1.5 bg-[#0A5C43] text-white text-xs font-bold rounded-lg shadow-xs"
            >
              Add Sponsor
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase font-black tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Partner & Tier</th>
                  <th className="py-3 px-3">Scope</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Activation & Asset</th>
                  <th className="py-3 px-3 text-right">
                    {canViewFinancials ? 'Contract Value' : 'Partner Status'}
                  </th>
                  <th className="py-3 px-3 text-center">Deliverables</th>
                  <th className="py-3 px-4 text-right">
                    {canManageSponsors ? 'Actions' : 'Permissions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredSponsors.map((s, idx) => {
                  const cat = s.category || 'court';
                  const catMeta = CATEGORY_INFO[cat];
                  const isGlobal = s.scope === 'global';

                  return (
                    <tr key={s.id || idx} className="hover:bg-gray-50/80 transition-colors">
                      {/* Name & Tier */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-sm text-gray-900">{s.name}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                            {s.tier}
                          </span>
                          {s.websiteUrl && (
                            <a
                              href={s.websiteUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-gray-400 hover:text-gray-700 flex items-center gap-0.5"
                            >
                              <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Scope Badge */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            isGlobal
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {isGlobal ? <Globe size={11} /> : <Trophy size={11} />}
                          <span>{isGlobal ? 'Global Fleet' : 'Event Only'}</span>
                        </span>
                        {s.endDate && (
                          <div className="text-[10px] text-gray-400 font-mono mt-1">Through {s.endDate}</div>
                        )}
                      </td>

                      {/* Category Pill */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${catMeta.badgeColor}`}
                        >
                          <span>{catMeta.icon}</span>
                          <span>{catMeta.label}</span>
                        </span>
                      </td>

                      {/* Activation / Assigned Asset */}
                      <td className="py-3.5 px-3 max-w-[220px]">
                        {s.courtAssigned !== null && s.courtAssigned !== undefined ? (
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-black bg-purple-100 text-purple-900 border border-purple-300">
                              Court {s.courtAssigned}
                            </span>
                            <span className="text-gray-600 text-xs truncate">Stadium Naming</span>
                          </div>
                        ) : s.divisionAssigned ? (
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-black bg-yellow-100 text-yellow-900 border border-yellow-300">
                              Division {s.divisionAssigned}
                            </span>
                            <span className="text-gray-600 text-xs truncate">Medal Ceremony</span>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-600 truncate" title={s.assetDescription}>
                            {s.assetDescription || 'General branding & welcome kit'}
                          </div>
                        )}
                      </td>

                      {/* Contract Cash Value (Redacted for non-financial roles) */}
                      {canViewFinancials ? (
                        <td className="py-3.5 px-3 text-right font-mono font-black text-sm text-gray-900">
                          ${(s.amountPaid || 0).toLocaleString()}
                        </td>
                      ) : (
                        <td className="py-3.5 px-3 text-right">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Active Partner
                          </span>
                        </td>
                      )}

                      {/* Deliverables Active */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="inline-flex items-center gap-1.5 text-gray-400">
                          <span
                            title="TV Jumbotron Scoreboard Banner"
                            className={`p-1 rounded ${
                              s.deliverables?.jumboTvDisplay ? 'bg-emerald-100 text-emerald-800' : 'opacity-25'
                            }`}
                          >
                            <Tv size={13} />
                          </span>
                          <span
                            title="Player Registration Portal Logo"
                            className={`p-1 rounded ${
                              s.deliverables?.playerPortalBanner ? 'bg-blue-100 text-blue-800' : 'opacity-25'
                            }`}
                          >
                            <Globe size={13} />
                          </span>
                          <span
                            title="Physical Court Banners"
                            className={`p-1 rounded ${
                              s.deliverables?.courtBanners ? 'bg-purple-100 text-purple-800' : 'opacity-25'
                            }`}
                          >
                            <Layers size={13} />
                          </span>
                          <span
                            title="Dinkster Mobile App Shoutout"
                            className={`p-1 rounded ${
                              s.deliverables?.mobileAppShoutout ? 'bg-amber-100 text-amber-800' : 'opacity-25'
                            }`}
                          >
                            <Smartphone size={13} />
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {canManageSponsors ? (
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(sponsors.indexOf(s))}
                              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition"
                              title="Edit Sponsor Deal"
                            >
                              <Edit2 size={13} />
                            </button>
                            {onDeleteSponsor && (
                              <button
                                type="button"
                                onClick={() => onDeleteSponsor(sponsors.indexOf(s))}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition"
                                title="Delete Sponsor"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-400 font-medium">Read Only</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================
          ADD / EDIT SPONSOR MODAL
          ======================================================== */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 space-y-5 my-8">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-gray-900">
                  {editingIndex !== null ? 'Edit Sponsor Contract' : 'Add New Sponsor Partner'}
                </h3>
                <p className="text-xs text-gray-500">
                  Configure naming rights, category, scope, and activation deliverables.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-semibold">
              {/* Partner Name & Tier */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-black uppercase text-gray-600 block mb-1">
                    Sponsor / Brand Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Selkirk Sport, Electrolit, Frost Bank"
                    className="w-full bg-[#FAF8F3] focus:bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm font-bold text-gray-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase text-gray-600 block mb-1">
                    Sponsorship Tier
                  </label>
                  <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value as any)}
                    className="w-full bg-[#FAF8F3] focus:bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm font-bold text-gray-900 focus:outline-none"
                  >
                    <option value="Title Presenting">Title Presenting</option>
                    <option value="Premier Diamond">Premier Diamond</option>
                    <option value="Official Gold">Official Gold</option>
                    <option value="Supporting Silver">Supporting Silver</option>
                    <option value="Community">Local Community</option>
                  </select>
                </div>
              </div>

              {/* Scope & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-black uppercase text-gray-600 block mb-1">
                    Sponsorship Scope
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setScope('event')}
                      className={`py-2 px-3 rounded-xl border text-center transition ${
                        scope === 'event'
                          ? 'bg-[#0A5C43] text-white border-[#0A5C43] font-bold shadow-xs'
                          : 'bg-gray-50 border-gray-200 text-gray-700'
                      }`}
                    >
                      🏆 Event Only
                    </button>
                    <button
                      type="button"
                      onClick={() => setScope('global')}
                      className={`py-2 px-3 rounded-xl border text-center transition ${
                        scope === 'global'
                          ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                          : 'bg-gray-50 border-gray-200 text-gray-700'
                      }`}
                    >
                      🌐 Global Fleet
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase text-gray-600 block mb-1">
                    Category Type
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as SponsorCategory)}
                    className="w-full bg-[#FAF8F3] focus:bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm font-bold text-gray-900 focus:outline-none"
                  >
                    {Object.entries(CATEGORY_INFO).map(([key, info]) => (
                      <option key={key} value={key}>
                        {info.icon} {info.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Conditional Court or Division Assignment */}
              {category === 'court' && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                  <label className="text-[11px] font-black uppercase text-emerald-900 block">
                    🏟️ Assign to Competition Court
                  </label>
                  <select
                    value={courtAssigned ?? ''}
                    onChange={(e) => setCourtAssigned(e.target.value ? Number(e.target.value) : null)}
                    className="w-full bg-white border border-emerald-300 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-900 focus:outline-none"
                  >
                    <option value="">None (General Court Naming)</option>
                    {Array.from({ length: totalCourts }, (_, i) => i + 1).map((c) => (
                      <option key={c} value={c}>
                        Court {c} {c === 1 ? '(★ Center Stadium Court)' : ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-emerald-700">
                    This sponsor's name will appear on Court {courtAssigned || 'X'} on the TV broadcast scoreboard and match desk dispatch.
                  </p>
                </div>
              )}

              {category === 'division_medal' && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl space-y-2">
                  <label className="text-[11px] font-black uppercase text-yellow-900 block">
                    🥇 Assign to Division Medal Ceremony
                  </label>
                  <select
                    value={divisionAssigned ?? ''}
                    onChange={(e) => setDivisionAssigned(e.target.value || null)}
                    className="w-full bg-white border border-yellow-300 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-900 focus:outline-none"
                  >
                    <option value="">All Tournament Divisions</option>
                    {divisions.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.format})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Asset Description & Contract Cash Amount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-black uppercase text-gray-600 block mb-1">
                    Contract Value ($ USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-400 font-bold">$</span>
                    <input
                      type="number"
                      min={0}
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(Number(e.target.value))}
                      className="w-full bg-[#FAF8F3] focus:bg-white border border-gray-300 rounded-xl pl-7 pr-3 py-2 text-sm font-mono font-bold text-gray-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase text-gray-600 block mb-1">
                    Brand Website URL
                  </label>
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://brand.com"
                    className="w-full bg-[#FAF8F3] focus:bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm font-semibold text-gray-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black uppercase text-gray-600 block mb-1">
                  Asset & Deliverable Description
                </label>
                <input
                  type="text"
                  value={assetDescription}
                  onChange={(e) => setAssetDescription(e.target.value)}
                  placeholder="e.g. Logo on player scorecards, clipboards, and center court banners"
                  className="w-full bg-[#FAF8F3] focus:bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none"
                />
              </div>

              {/* Time-bound Dates for Global / Season Deals */}
              {scope === 'global' && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase text-blue-900 block mb-1">
                      Contract Start Date
                    </label>
                    <input
                      type="text"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      placeholder="e.g. Jan 1, 2026"
                      className="w-full bg-white border border-blue-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-blue-900 block mb-1">
                      Contract End Date (Time-Bound)
                    </label>
                    <input
                      type="text"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      placeholder="e.g. Dec 31, 2026"
                      className="w-full bg-white border border-blue-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Deliverable Checkbox Toggles */}
              <div className="pt-2 border-t">
                <label className="text-[11px] font-black uppercase text-gray-600 block mb-2">
                  Included Activation Deliverables
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={jumboTv}
                      onChange={(e) => setJumboTv(e.target.checked)}
                      className="w-4 h-4 rounded accent-[#0A5C43]"
                    />
                    <span>TV Jumbotron Scoreboard</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={playerPortal}
                      onChange={(e) => setPlayerPortal(e.target.checked)}
                      className="w-4 h-4 rounded accent-[#0A5C43]"
                    />
                    <span>Player Registration Portal</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={courtBanners}
                      onChange={(e) => setCourtBanners(e.target.checked)}
                      className="w-4 h-4 rounded accent-[#0A5C43]"
                    />
                    <span>Physical Court Banners</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mobileShoutout}
                      onChange={(e) => setMobileShoutout(e.target.checked)}
                      className="w-4 h-4 rounded accent-[#0A5C43]"
                    />
                    <span>Dinkster App Shoutout</span>
                  </label>
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex justify-end items-center gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0A5C43] hover:bg-[#084734] text-white font-bold text-xs shadow-xs"
                >
                  {editingIndex !== null ? 'Save Sponsor Changes' : 'Confirm & Activate Sponsor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
