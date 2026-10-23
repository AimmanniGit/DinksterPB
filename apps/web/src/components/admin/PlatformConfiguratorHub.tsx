'use client';

import React, { useState, useMemo } from 'react';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  Check,
  Zap,
  Layers,
  Settings2,
  Trash2,
  Edit2,
  Sliders,
  Sparkles,
  ShieldCheck,
  Database,
  ArrowRight,
  ExternalLink,
  Info,
  Clock,
  Tag,
  CheckCircle2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import {
  SystemLookupOption,
  TournamentFormatTemplate,
  DivisionTemplate,
  ScoringRuleTemplate,
  LookupCategory,
} from '../../types/organizer';

interface PlatformConfiguratorHubProps {
  lookups: SystemLookupOption[];
  formatTemplates: TournamentFormatTemplate[];
  divisionTemplates: DivisionTemplate[];
  scoringTemplates: ScoringRuleTemplate[];
  onAddLookupOption: (option: SystemLookupOption) => void;
  onUpdateLookupOption: (id: string, updated: Partial<SystemLookupOption>) => void;
  onAddFormatTemplate: (template: TournamentFormatTemplate) => void;
  onUpdateFormatTemplate: (id: string, updated: Partial<TournamentFormatTemplate>) => void;
  onAddDivisionTemplate: (template: DivisionTemplate) => void;
  onUpdateDivisionTemplate: (id: string, updated: Partial<DivisionTemplate>) => void;
  onOpenAdminCopilot?: (initialPrompt?: string) => void;
}

export const PlatformConfiguratorHub: React.FC<PlatformConfiguratorHubProps> = ({
  lookups,
  formatTemplates,
  divisionTemplates,
  scoringTemplates,
  onAddLookupOption,
  onUpdateLookupOption,
  onAddFormatTemplate,
  onUpdateFormatTemplate,
  onAddDivisionTemplate,
  onUpdateDivisionTemplate,
  onOpenAdminCopilot,
}) => {
  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<'formats' | 'lookups' | 'divisions' | 'scoring'>('formats');

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<LookupCategory | 'ALL'>('ALL');

  // Add / Edit Modal States
  const [showAddLookupModal, setShowAddLookupModal] = useState(false);
  const [showAddFormatModal, setShowAddFormatModal] = useState(false);

  // New Lookup Form State
  const [newLookupCategory, setNewLookupCategory] = useState<LookupCategory>('COURT_SURFACE');
  const [newLookupKey, setNewLookupKey] = useState('');
  const [newLookupLabel, setNewLookupLabel] = useState('');
  const [newLookupDesc, setNewLookupDesc] = useState('');

  // New Format Form State
  const [newFormatCode, setNewFormatCode] = useState('');
  const [newFormatName, setNewFormatName] = useState('');
  const [newFormatDesc, setNewFormatDesc] = useState('');
  const [newFormatBracketType, setNewFormatBracketType] = useState('pools_to_playoffs');
  const [newFormatIsPilot, setNewFormatIsPilot] = useState(false);
  const [newFormatMinCourts, setNewFormatMinCourts] = useState('4');

  // Filtered Formats
  const filteredFormats = useMemo(() => {
    return formatTemplates.filter((f) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        f.name.toLowerCase().includes(q) ||
        f.code.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q)
      );
    });
  }, [formatTemplates, searchQuery]);

  // Filtered Lookups
  const filteredLookups = useMemo(() => {
    return lookups.filter((item) => {
      const matchCat = selectedCategory === 'ALL' || item.category === selectedCategory;
      const matchSearch =
        !searchQuery.trim() ||
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [lookups, selectedCategory, searchQuery]);

  const handleSaveLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLookupLabel.trim()) return;

    const key = newLookupKey.trim() || newLookupLabel.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const newOption: SystemLookupOption = {
      id: `opt-${Date.now().toString().slice(-5)}`,
      category: newLookupCategory,
      key,
      label: newLookupLabel.trim(),
      description: newLookupDesc.trim() || undefined,
      isActive: true,
      sortOrder: lookups.filter((l) => l.category === newLookupCategory).length + 1,
    };

    onAddLookupOption(newOption);
    setShowAddLookupModal(false);
    setNewLookupKey('');
    setNewLookupLabel('');
    setNewLookupDesc('');
  };

  const handleSaveFormat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFormatName.trim()) return;

    const code = newFormatCode.trim() || newFormatName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const newFmt: TournamentFormatTemplate = {
      id: `fmt-${Date.now().toString().slice(-5)}`,
      code,
      name: newFormatName.trim(),
      description: newFormatDesc.trim() || 'Custom tournament format configured by Platform Admin.',
      bracketType: newFormatBracketType,
      defaultScoringMode: newFormatIsPilot ? 'DINK_BATTLE' : 'STANDARD',
      isPilot: newFormatIsPilot,
      isActive: true,
      minCourtsRecommended: parseInt(newFormatMinCourts, 10) || 4,
      recommendedTeamCap: 16,
    };

    onAddFormatTemplate(newFmt);
    setShowAddFormatModal(false);
    setNewFormatCode('');
    setNewFormatName('');
    setNewFormatDesc('');
    setNewFormatIsPilot(false);
  };

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* 1. ADMIN HEADER & SYSTEM STATUS SUMMARY                        */}
      {/* ============================================================== */}
      <div className="bg-gradient-to-r from-rose-950 via-[#1A0B10] to-[#2B1019] text-white p-6 rounded-2xl border border-rose-900/40 shadow-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500 text-slate-950 flex items-center gap-1">
                <Database size={11} />
                <span>SuperAdmin Platform Registry</span>
              </span>
              <span className="text-xs text-rose-200/80 font-mono">
                Schema: Postgres / Prisma Registry Lookups
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Event Setup Template & Lookup Tables Engine</span>
            </h1>
            <p className="text-xs text-rose-200/90 max-w-2xl leading-relaxed">
              Configure tournament formats, court surfaces, ball types, scoring modes, and division packages. Every option configured here dynamically feeds the <strong>Event Setup dropdowns and Copilot creation tools</strong> across the entire Dinkster platform.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 bg-black/30 p-3 rounded-xl border border-white/10 shrink-0 text-center">
            <div className="px-3 py-1">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Lookups</span>
              <span className="text-lg font-black text-rose-400 font-mono">{lookups.length}</span>
              <span className="text-[10px] text-gray-400 block">5 Categories</span>
            </div>
            <div className="px-3 py-1 border-x border-white/10">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Formats</span>
              <span className="text-lg font-black text-white font-mono">{formatTemplates.length}</span>
              <span className="text-[10px] text-emerald-400 block">Active Engine</span>
            </div>
            <div className="px-3 py-1">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Divisions</span>
              <span className="text-lg font-black text-amber-300 font-mono">{divisionTemplates.length}</span>
              <span className="text-[10px] text-gray-400 block">Templates</span>
            </div>
          </div>
        </div>

        {/* Admin Copilot Prompt Callout Banner */}
        <div className="bg-rose-900/30 border border-rose-500/30 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Sparkles size={16} className="text-rose-400 shrink-0" />
            <span className="text-rose-100">
              <strong>Admin Copilot is online:</strong> Type or dictate schema commands like{' '}
              <em className="text-rose-300">&quot;Add Vulcan VPRO Flight to ball types&quot;</em> or{' '}
              <em className="text-rose-300">&quot;Create MLP Team Dual Match format&quot;</em>.
            </span>
          </div>

          {onOpenAdminCopilot && (
            <button
              type="button"
              onClick={() => onOpenAdminCopilot('Add a new tournament format or lookup table option')}
              className="px-3 py-1.5 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold rounded-lg text-xs transition shrink-0 flex items-center gap-1.5 shadow-xs"
            >
              <Sparkles size={13} />
              <span>Launch Admin Copilot</span>
            </button>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. SUB-NAVIGATION TABS & SEARCH CONTROLS                       */}
      {/* ============================================================== */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Sub-Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none]">
          <button
            type="button"
            onClick={() => setActiveTab('formats')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'formats'
                ? 'bg-gray-900 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Layers size={14} className={activeTab === 'formats' ? 'text-rose-400' : 'text-gray-400'} />
            <span>Tournament Formats</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-white/20 text-white">
              {formatTemplates.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('lookups')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'lookups'
                ? 'bg-gray-900 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Database size={14} className={activeTab === 'lookups' ? 'text-rose-400' : 'text-gray-400'} />
            <span>Combobox Lookup Tables</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-white/20 text-white">
              {lookups.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('divisions')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'divisions'
                ? 'bg-gray-900 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Tag size={14} className={activeTab === 'divisions' ? 'text-rose-400' : 'text-gray-400'} />
            <span>Division Packages</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-white/20 text-white">
              {divisionTemplates.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('scoring')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'scoring'
                ? 'bg-gray-900 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Clock size={14} className={activeTab === 'scoring' ? 'text-rose-400' : 'text-gray-400'} />
            <span>Scoring Presets</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-white/20 text-white">
              {scoringTemplates.length}
            </span>
          </button>
        </div>

        {/* Search & Add Action */}
        <div className="flex items-center gap-2.5">
          <div className="relative min-w-[200px] flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-rose-500 shadow-2xs"
            />
          </div>

          {activeTab === 'formats' && (
            <button
              type="button"
              onClick={() => setShowAddFormatModal(true)}
              className="px-3.5 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              <Plus size={13} />
              <span>Add Format</span>
            </button>
          )}

          {activeTab === 'lookups' && (
            <button
              type="button"
              onClick={() => setShowAddLookupModal(true)}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              <Plus size={13} />
              <span>Add Lookup Option</span>
            </button>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: TOURNAMENT FORMAT TEMPLATES                             */}
      {/* ============================================================== */}
      {activeTab === 'formats' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-500 px-1">
            <span>
              Showing <strong>{filteredFormats.length} Tournament Formats</strong> configured in platform registry
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold">
              Live in Event Setup &bull; Copilot Enabled
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFormats.map((fmt) => (
              <div
                key={fmt.id}
                className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs hover:border-gray-300 transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded border">
                          {fmt.code}
                        </span>

                        {fmt.isPilot && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                            <Zap size={11} className="text-amber-600" />
                            <span>Pilot Mode</span>
                          </span>
                        )}

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            fmt.isActive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {fmt.isActive ? 'Active in Dropdowns' : 'Disabled'}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-gray-900 leading-snug">
                        {fmt.name}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => onUpdateFormatTemplate(fmt.id, { isActive: !fmt.isActive })}
                      className="text-gray-400 hover:text-gray-900 p-1"
                      title={fmt.isActive ? 'Disable format in dropdowns' : 'Enable format in dropdowns'}
                    >
                      {fmt.isActive ? (
                        <ToggleRight size={24} className="text-emerald-600" />
                      ) : (
                        <ToggleLeft size={24} className="text-gray-300" />
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                    {fmt.description}
                  </p>

                  {fmt.rulesSummary && (
                    <div className="text-[11px] text-gray-500 font-medium">
                      <strong>Rules Spec:</strong> {fmt.rulesSummary}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-500 pt-1 flex-wrap">
                    <span>Bracket: <strong className="text-gray-800 font-mono">{fmt.bracketType}</strong></span>
                    <span>&bull;</span>
                    <span>Min Courts: <strong className="text-gray-800 font-mono">{fmt.minCourtsRecommended}</strong></span>
                    <span>&bull;</span>
                    <span>Rec. Cap: <strong className="text-gray-800 font-mono">{fmt.recommendedTeamCap} Teams</strong></span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
                  <span className="text-gray-400 text-[11px]">
                    Available in Event Setup: <strong>Competition Format Dropdown</strong>
                  </span>
                  <span className="text-emerald-700 font-bold font-mono">Synced ✓</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: SYSTEM LOOKUP TABLES (COURTS, BALLS, SANCTIONING, ETC.) */}
      {/* ============================================================== */}
      {activeTab === 'lookups' && (
        <div className="space-y-4">
          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold pb-1">
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                selectedCategory === 'ALL'
                  ? 'bg-rose-950 text-white font-bold'
                  : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
              }`}
            >
              All Categories ({lookups.length})
            </button>

            {(
              [
                'COURT_SURFACE',
                'BALL_TYPE',
                'SANCTIONING_BODY',
                'AGE_BRACKET',
                'DIVISION_FORMAT',
              ] as const
            ).map((cat) => {
              const count = lookups.filter((l) => l.category === cat).length;
              const labelMap: Record<string, string> = {
                COURT_SURFACE: 'Court Surfaces',
                BALL_TYPE: 'Official Balls',
                SANCTIONING_BODY: 'Sanctioning Bodies',
                AGE_BRACKET: 'Age Tiers',
                DIVISION_FORMAT: 'Division Formats',
              };

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-rose-950 text-white font-bold'
                      : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                  }`}
                >
                  {labelMap[cat]} ({count})
                </button>
              );
            })}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>
                Showing <strong>{filteredLookups.length} Lookup Options</strong> feeding comboboxes
              </span>
              <span className="text-gray-400">Sort by Category & Priority</span>
            </div>

            <div className="divide-y divide-gray-100">
              {filteredLookups.map((item) => (
                <div
                  key={item.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/60 transition text-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-900 border border-rose-200">
                        {item.category.replace('_', ' ')}
                      </span>
                      <span className="font-bold text-gray-900 text-sm">{item.label}</span>
                      <span className="font-mono text-[11px] text-gray-400 bg-gray-100 px-1.5 py-0.2 rounded">
                        key: {item.key}
                      </span>
                      {item.isDefault && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          System Default
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-gray-500 text-[11px] leading-relaxed">{item.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {item.isActive ? 'Active in Dropdowns' : 'Hidden'}
                    </span>

                    <button
                      type="button"
                      onClick={() => onUpdateLookupOption(item.id, { isActive: !item.isActive })}
                      className="text-gray-400 hover:text-gray-900"
                      title={item.isActive ? 'Hide option in dropdowns' : 'Activate option in dropdowns'}
                    >
                      {item.isActive ? (
                        <ToggleRight size={22} className="text-emerald-600" />
                      ) : (
                        <ToggleLeft size={22} className="text-gray-300" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: DIVISION PACKAGES                                       */}
      {/* ============================================================== */}
      {activeTab === 'divisions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-500 px-1">
            <span>
              Showing <strong>{divisionTemplates.length} Division Templates</strong> available for 1-click organizer setup
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {divisionTemplates.map((div) => (
              <div
                key={div.id}
                className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded border">
                    {div.code}
                  </span>
                  <span className="font-bold font-mono text-[#0A5C43] text-sm">
                    ${div.defaultFee} / Player
                  </span>
                </div>

                <h3 className="font-bold text-base text-gray-900">{div.name}</h3>

                <div className="space-y-1 text-xs text-gray-500">
                  <div>DUPR Range: <strong>{div.minDupr === 0 ? 'Open (All Levels)' : `${div.minDupr} - ${div.maxDupr}`}</strong></div>
                  <div>Format: <strong>{div.format}</strong></div>
                  <div>Default Team Cap: <strong>{div.defaultCap} Teams</strong></div>
                  {div.scoringFormat && <div>Scoring: <strong>{div.scoringFormat}</strong></div>}
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                  <span>Organizer Preset Package</span>
                  <span className="text-emerald-700 font-semibold">Active ✓</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: SCORING RULE PRESETS                                    */}
      {/* ============================================================== */}
      {activeTab === 'scoring' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-500 px-1">
            <span>
              Showing <strong>{scoringTemplates.length} Scoring Presets</strong> available in match engine and division setup
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scoringTemplates.map((scr) => (
              <div
                key={scr.id}
                className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded border">
                    {scr.code}
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Mode: {scr.scoringMode}
                  </span>
                </div>

                <h3 className="font-bold text-base text-gray-900">{scr.name}</h3>

                {scr.description && (
                  <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    {scr.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-500 pt-1 flex-wrap">
                  <span>Points to Win: <strong>{scr.pointsToWin}</strong></span>
                  <span>&bull;</span>
                  <span>Win By: <strong>{scr.winBy}</strong></span>
                  <span>&bull;</span>
                  <span>Sets: <strong>Best of {scr.bestOfSets}</strong></span>
                  {scr.shrinkCourtAfterShot && (
                    <>
                      <span>&bull;</span>
                      <span className="text-amber-700 font-bold">Shrinks after {scr.shrinkCourtAfterShot}th shot</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. MODAL: ADD NEW LOOKUP OPTION                                */}
      {/* ============================================================== */}
      {showAddLookupModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">Add Platform Lookup Option</h3>
                <p className="text-xs text-gray-500">Instantly appears in Event Setup comboboxes.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddLookupModal(false)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLookup} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Target Dropdown Category</label>
                <select
                  value={newLookupCategory}
                  onChange={(e) => setNewLookupCategory(e.target.value as LookupCategory)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-rose-500"
                >
                  <option value="COURT_SURFACE">Court Surface / Material</option>
                  <option value="BALL_TYPE">Official Tournament Ball</option>
                  <option value="SANCTIONING_BODY">Sanctioning Body</option>
                  <option value="AGE_BRACKET">Age Bracket / Tier</option>
                  <option value="DIVISION_FORMAT">Division Format</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Display Label (Shown in Dropdowns)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cushioned Pro Acrylic (DecoTurf)"
                  value={newLookupLabel}
                  onChange={(e) => setNewLookupLabel(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Unique Key (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. decoturf_pro"
                  value={newLookupKey}
                  onChange={(e) => setNewLookupKey(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Description / Spec Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Multi-layer rubberized acrylic meeting official US Open cushion standards."
                  value={newLookupDesc}
                  onChange={(e) => setNewLookupDesc(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddLookupModal(false)}
                  className="px-3.5 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Commit to Dropdowns
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. MODAL: ADD NEW FORMAT TEMPLATE                              */}
      {/* ============================================================== */}
      {showAddFormatModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">Add Tournament Format Template</h3>
                <p className="text-xs text-gray-500">Defines bracket progression for event setup.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddFormatModal(false)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFormat} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Format Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MLP Team Dual-Match (4-Player Coed)"
                  value={newFormatName}
                  onChange={(e) => setNewFormatName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Bracket Type</label>
                <select
                  value={newFormatBracketType}
                  onChange={(e) => setNewFormatBracketType(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-rose-500"
                >
                  <option value="pools_to_playoffs">Round Robin Pools to Playoffs</option>
                  <option value="double_elim">Double Elimination Bracket</option>
                  <option value="single_elim">Single Elimination with Bronze</option>
                  <option value="compass">Compass Draw (Guaranteed 4 Matches)</option>
                  <option value="dual_match">Team Dual Match (MLP Style)</option>
                  <option value="waterfall">Waterfall Pool Play</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. 4-player coed teams play 1 WD, 1 MD, 2 XD games to 21 with singles Dreambreaker tiebreaker."
                  value={newFormatDesc}
                  onChange={(e) => setNewFormatDesc(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Min Courts Rec.</label>
                  <input
                    type="number"
                    value={newFormatMinCourts}
                    onChange={(e) => setNewFormatMinCourts(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="pilotCheck"
                    checked={newFormatIsPilot}
                    onChange={(e) => setNewFormatIsPilot(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <label htmlFor="pilotCheck" className="font-semibold text-gray-700 cursor-pointer">
                    Flag as Pilot Format
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddFormatModal(false)}
                  className="px-3.5 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-lg font-semibold shadow-xs"
                >
                  Save Format Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
