'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  TournamentEvent,
  Division,
  Sponsor,
} from '../../types/organizer';
import { CreatableCombobox } from './CreatableCombobox';
import { SponsorsManagementHub } from '../sponsors';
import { DivisionInteractiveCard } from '../divisions';
import {
  Trophy,
  Calendar,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  Plus,
  Trash2,
  Edit2,
  CopyCheck,
  Globe,
  Smartphone,
  Tv,
  ShieldCheck,
  DollarSign,
  Users,
  CheckCircle2,
  Sparkles,
  QrCode,
  Share2,
  Layers,
  Flame,
} from 'lucide-react';

interface EventSetupViewProps {
  event: TournamentEvent;
  divisions: Division[];
  sponsors: Sponsor[];
  onUpdateEvent: (updated: TournamentEvent) => void;
  onAddDivision: (div: Division) => void;
  onUpdateDivision?: (id: string, updated: Division) => void;
  onDeleteDivision?: (id: string) => void;
  onPublish?: () => void;
  onAddSponsor?: (sponsor: Sponsor) => void;
  onUpdateSponsor?: (index: number, updated: Sponsor) => void;
  onDeleteSponsor?: (index: number) => void;
  onAssignCourt?: (sponsorIndex: number, courtNumber: number | null) => void;
  canViewFinancials?: boolean;
  canEditRules?: boolean;
}

// Preset options for searchable and creatable comboboxes
const PRESET_COURT_SURFACES = [
  'Outdoor Acrylic Hardcourt (PPA Standard)',
  'Indoor Cushioned Acrylic Hardcourt',
  'Dedicated Sport Court Modular Tile',
  'Indoor Polyurethane Wood Floor',
  'Clay Turf Blend',
  'Painted Asphalt Outdoor',
];

const PRESET_BALL_TYPES = [
  'Franklin X-40 (Outdoor Yellow)',
  'Dura Fast 40 (Outdoor Competition)',
  'Onix Fuse G2 (Indoor Orange)',
  'Vulcan VPRO Flight (Official PPA)',
  'Penn 40 (Recreational Outdoor)',
];

const PRESET_FORMATS = [
  'Round Robin Pools to Single Elimination Playoffs',
  'Single Elimination Bracket with Bronze Match',
  'Double Elimination Bracket',
  'Compass Draw (Guaranteed 4 Matches)',
  'Dink Battle Pilot (Court shrinks after 5th shot)',
  'Waterfall Pool Play',
];

const PRESET_SANCTIONING = [
  'DUPR Official Sanctioned',
  'USA Pickleball Sanctioned',
  'APP Tour Affiliate Event',
  'Club Invitational (Unsanctioned)',
];

const PRESET_DIVISION_FORMATS = [
  "Men's Doubles",
  "Women's Doubles",
  'Mixed Doubles',
  "Men's Singles",
  "Women's Singles",
  'Co-Ed Open Scramble',
  'Parent-Child Doubles',
  'Senior 50+ Doubles',
  'Dink Battle (Pilot)',
];

const PRESET_AGE_BRACKETS = [
  'All Ages (Open)',
  '19+',
  '30+',
  '35+',
  '40+',
  '50+',
  '60+',
  'Junior (Under 18)',
];

const PRESET_SCORING_FORMATS = [
  'Standard Rally to 11 (Win by 2)',
  'Best 2 of 3 to 11 (Win by 2)',
  'One Game to 15 (Win by 2)',
  'Timed 15-Minute Rally Scoring',
];

export const EventSetupView: React.FC<EventSetupViewProps> = ({
  event,
  divisions,
  sponsors,
  onUpdateEvent,
  onAddDivision,
  onUpdateDivision,
  onDeleteDivision,
  onPublish,
  onAddSponsor = () => {},
  onUpdateSponsor = () => {},
  onDeleteSponsor = () => {},
  onAssignCourt = () => {},
  canViewFinancials = true,
  canEditRules = true,
}) => {
  // Division Add / Edit State
  const [editingDivisionId, setEditingDivisionId] = useState<string | null>(null);
  const [divName, setDivName] = useState('');
  const [divFormat, setDivFormat] = useState("Men's Doubles");
  const [divAge, setDivAge] = useState('All Ages (Open)');
  const [divMinDupr, setDivMinDupr] = useState<number>(3.0);
  const [divMaxDupr, setDivMaxDupr] = useState<number>(3.5);
  const [divIsOpenDupr, setDivIsOpenDupr] = useState<boolean>(false);
  const [divFee, setDivFee] = useState<number>(60);
  const [divCap, setDivCap] = useState<number>(16);
  const [divScoring, setDivScoring] = useState('Standard Rally to 11 (Win by 2)');
  const [showDivModal, setShowDivModal] = useState(false);

  // Published Portal Hub Modal State
  const [showPublishedModal, setShowPublishedModal] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const eventSlug = event.slug || event.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'dink-masters-open-2026';
  const eventJoinCode = event.joinCode || 'D-8421';

  // Open modal to add a brand new division
  const handleOpenAddDivision = () => {
    setEditingDivisionId(null);
    setDivName('');
    setDivFormat("Men's Doubles");
    setDivAge('All Ages (Open)');
    setDivMinDupr(3.5);
    setDivMaxDupr(4.0);
    setDivIsOpenDupr(false);
    setDivFee(60);
    setDivCap(16);
    setDivScoring('Standard Rally to 11 (Win by 2)');
    setShowDivModal(true);
  };

  // Open modal to edit existing division
  const handleOpenEditDivision = (d: Division) => {
    setEditingDivisionId(d.id);
    setDivName(d.name);
    setDivFormat(d.format);
    setDivAge(d.ageBracket || 'All Ages (Open)');
    setDivMinDupr(d.minDupr || 0);
    setDivMaxDupr(d.maxDupr || 5.5);
    setDivIsOpenDupr(d.minDupr === 0 && d.maxDupr === 0);
    setDivFee(d.entryFee);
    setDivCap(d.teamCap);
    setDivScoring(d.scoringFormat || 'Standard Rally to 11 (Win by 2)');
    setShowDivModal(true);
  };

  // Save new or edited division
  const handleSaveDivision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!divName.trim()) return;

    const divPayload: Division = {
      id: editingDivisionId || `DIV-${Date.now().toString().slice(-4)}`,
      name: divName.trim(),
      format: divFormat,
      ageBracket: divAge,
      minDupr: divIsOpenDupr ? 0 : divMinDupr,
      maxDupr: divIsOpenDupr ? 0 : divMaxDupr,
      entryFee: Math.max(0, divFee),
      teamCap: Math.max(2, divCap),
      scoringFormat: divScoring,
      isPilot: divFormat.toLowerCase().includes('dink battle'),
    };

    if (editingDivisionId && onUpdateDivision) {
      onUpdateDivision(editingDivisionId, divPayload);
    } else {
      onAddDivision(divPayload);
    }

    setShowDivModal(false);
  };

  // Duplicate an existing division
  const handleDuplicateDivision = (d: Division) => {
    const clone: Division = {
      ...d,
      id: `DIV-${Date.now().toString().slice(-4)}`,
      name: `${d.name} (Copy)`,
    };
    onAddDivision(clone);
  };

  // Handle Event Creation / Publishing
  const handleCreateAndPublish = () => {
    const updated: TournamentEvent = {
      ...event,
      status: 'Published',
      slug: eventSlug,
      joinCode: eventJoinCode,
    };
    onUpdateEvent(updated);
    if (onPublish) onPublish();
    setShowPublishedModal(true);
  };

  const independentWebUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/t/${eventSlug}`
    : `https://dinkster.app/t/${eventSlug}`;

  const copyToClipboard = (text: string, type: 'url' | 'code') => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      if (type === 'url') {
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 3000);
      } else {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 3000);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Event Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-black/10 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#0A5C43] text-white">
              Event Management
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${
                event.status === 'Published'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${event.status === 'Published' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              Status: {event.status}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            Tournament Event Setup
          </h1>
          <p className="text-xs md:text-sm text-gray-600 mt-1 max-w-2xl leading-relaxed">
            Configure all tournament options with searchable custom inputs. Creating this event generates an independent public web portal for player registrations as well as syncs to the Dinkster mobile app.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <Link
            href={`/t/${eventSlug}`}
            target="_blank"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 transition flex items-center gap-1.5 border border-gray-200"
          >
            <Globe size={14} className="text-[#0A5C43]" />
            <span>Preview Web Portal</span>
            <ExternalLink size={12} className="text-gray-400" />
          </Link>

          <Link
            href="/tv"
            target="_blank"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition flex items-center gap-1.5 shadow-xs"
          >
            <Tv size={14} className="text-amber-400" />
            <span>TV Jumbotron</span>
          </Link>

          <button
            type="button"
            onClick={handleCreateAndPublish}
            className="px-4 py-2 bg-[#0A5C43] hover:bg-[#084734] text-white rounded-xl font-semibold text-xs shadow-xs transition flex items-center gap-1.5"
          >
            <Sparkles size={15} className="text-yellow-300" />
            <span>{event.status === 'Draft' ? 'Create & Publish Portals' : 'Update & Re-Publish'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Setup Forms | Right Real-time Independent Portal Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================
            LEFT COLUMN: FULL SETTINGS CONFIGURATION (7 COLS)
            ======================================================== */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Core Tournament Identity */}
          <div className="bg-white p-5 md:p-6 rounded-2xl border border-black/10 shadow-sm space-y-4">
            <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2 border-b pb-3">
              <Trophy size={18} className="text-[#0A5C43]" />
              <span>1. Tournament Identity & Schedule</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase block mb-1 tracking-wider">
                  Tournament Name
                </label>
                <input
                  type="text"
                  value={event.name}
                  onChange={(e) => onUpdateEvent({ ...event, name: e.target.value })}
                  placeholder="e.g. Austin Winter Open 2026"
                  className="w-full bg-[#FAF8F3] focus:bg-white border border-black/15 focus:border-[#0A5C43] rounded-xl px-3.5 py-2 text-sm font-bold text-gray-900 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 uppercase block mb-1 tracking-wider">
                  Independent Web URL Slug
                </label>
                <div className="flex items-center bg-[#FAF8F3] border border-black/15 rounded-xl px-3 py-2 text-sm">
                  <span className="text-gray-400 font-mono text-xs">/t/</span>
                  <input
                    type="text"
                    value={event.slug || eventSlug}
                    onChange={(e) => onUpdateEvent({ ...event, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '') })}
                    placeholder="austin-winter-open-2026"
                    className="w-full bg-transparent font-mono text-xs font-bold text-[#0A5C43] focus:outline-none ml-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 uppercase block mb-1 tracking-wider">
                  Tournament Dates
                </label>
                <input
                  type="text"
                  value={event.dates}
                  onChange={(e) => onUpdateEvent({ ...event, dates: e.target.value })}
                  placeholder="e.g. Sat Nov 7 - Sun Nov 8, 2026"
                  className="w-full bg-[#FAF8F3] focus:bg-white border border-black/15 focus:border-[#0A5C43] rounded-xl px-3.5 py-2 text-sm font-semibold text-gray-900 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 uppercase block mb-1 tracking-wider">
                  Registration Deadline
                </label>
                <input
                  type="text"
                  value={event.registrationDeadline || 'Friday Nov 6, 2026 at 11:59 PM CST'}
                  onChange={(e) => onUpdateEvent({ ...event, registrationDeadline: e.target.value })}
                  placeholder="e.g. Friday Nov 6, 2026 at 11:59 PM"
                  className="w-full bg-[#FAF8F3] focus:bg-white border border-black/15 focus:border-[#0A5C43] rounded-xl px-3.5 py-2 text-sm font-semibold text-gray-900 focus:outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Venue, Court Surface & Equipment (Searchable & Creatable Dropdowns) */}
          <div className="bg-white p-5 md:p-6 rounded-2xl border border-black/10 shadow-sm space-y-4">
            <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2 border-b pb-3">
              <MapPin size={18} className="text-[#0A5C43]" />
              <span>2. Venue, Court Surface & Equipment (Customizable)</span>
            </h2>

            <div>
              <label className="text-xs font-bold text-gray-600 uppercase block mb-1 tracking-wider">
                Venue Location & City
              </label>
              <input
                type="text"
                value={event.venue}
                onChange={(e) => onUpdateEvent({ ...event, venue: e.target.value })}
                placeholder="e.g. Barton Springs Pickleball Center, Austin, TX"
                className="w-full bg-[#FAF8F3] focus:bg-white border border-black/15 focus:border-[#0A5C43] rounded-xl px-3.5 py-2 text-sm font-semibold text-gray-900 focus:outline-none transition"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Searchable Court Surface */}
              <CreatableCombobox
                label="Court Surface / Material"
                value={event.courtSurface || 'Outdoor Acrylic Hardcourt (PPA Standard)'}
                onChange={(val) => onUpdateEvent({ ...event, courtSurface: val })}
                options={PRESET_COURT_SURFACES}
                placeholder="Select or enter custom court surface..."
                helpText="Custom court types (e.g. CushionX, Modular Sport Court) can be typed directly."
              />

              {/* Searchable Official Ball */}
              <CreatableCombobox
                label="Official Tournament Ball"
                value={event.ballType || 'Franklin X-40 (Outdoor Yellow)'}
                onChange={(val) => onUpdateEvent({ ...event, ballType: val })}
                options={PRESET_BALL_TYPES}
                placeholder="Select or enter custom ball..."
                helpText="Specify the official tournament game ball for players."
              />

              {/* Searchable Tournament Format */}
              <CreatableCombobox
                label="Competition Format"
                value={event.tournamentFormat || 'Round Robin Pools to Single Elimination Playoffs'}
                onChange={(val) => onUpdateEvent({ ...event, tournamentFormat: val })}
                options={PRESET_FORMATS}
                placeholder="Select or enter custom format..."
                helpText="Controls the stage progression engine (pools to playoffs)."
              />

              {/* Searchable Sanctioning */}
              <CreatableCombobox
                label="Sanctioning / Ratings Body"
                value={event.sanctioningBody || 'DUPR Official Sanctioned'}
                onChange={(val) => onUpdateEvent({ ...event, sanctioningBody: val })}
                options={PRESET_SANCTIONING}
                placeholder="Select or enter sanctioning..."
                helpText="Determines whether matches automatically export to DUPR."
              />
            </div>
          </div>

          {/* Card 3: Competition Courts Engine */}
          <div className="bg-white p-5 md:p-6 rounded-2xl border border-black/10 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <Layers size={18} className="text-[#0A5C43]" />
                <span>3. Active Competition Courts</span>
              </h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#0A5C43]">
                {event.totalCourts || 8} Active Courts
              </span>
            </div>

            <p className="text-xs text-gray-600">
              The number of courts set here is synchronized across the Tournament Court Desk, Live TV Scoreboard Jumbotron, and Match Call queues.
            </p>

            <div className="p-4 bg-[#FAF8F3] border border-black/10 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase text-gray-700 block">Total Courts</span>
                  <span className="text-[11px] text-gray-500">Stepper or manual number input (1 to 32)</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdateEvent({ ...event, totalCourts: Math.max(1, (event.totalCourts || 8) - 1) })}
                    className="w-8 h-8 rounded-lg bg-white border border-black/15 text-gray-800 font-bold hover:bg-gray-100 flex items-center justify-center shadow-xs"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={32}
                    value={event.totalCourts || 8}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) onUpdateEvent({ ...event, totalCourts: Math.max(1, Math.min(32, val)) });
                    }}
                    className="w-14 text-center font-bold text-lg bg-white border border-black/15 rounded-lg py-1 text-[#0A5C43]"
                  />
                  <button
                    type="button"
                    onClick={() => onUpdateEvent({ ...event, totalCourts: Math.min(32, (event.totalCourts || 8) + 1) })}
                    className="w-8 h-8 rounded-lg bg-white border border-black/15 text-gray-800 font-bold hover:bg-gray-100 flex items-center justify-center shadow-xs"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Court Quick Presets */}
              <div className="flex items-center gap-2 pt-2 border-t border-black/5">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Presets:</span>
                {[4, 6, 8, 12, 16, 24].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => onUpdateEvent({ ...event, totalCourts: count })}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition ${
                      (event.totalCourts || 8) === count
                        ? 'bg-[#0A5C43] text-white border-[#0A5C43]'
                        : 'bg-white text-gray-700 border-black/10 hover:bg-gray-50'
                    }`}
                  >
                    {count} Courts
                  </button>
                ))}
              </div>

              {/* Court Chips Visualization */}
              <div className="flex flex-wrap gap-1.5 p-2.5 bg-white rounded-xl border border-black/5 max-h-24 overflow-y-auto">
                {Array.from({ length: event.totalCourts || 8 }, (_, i) => i + 1).map((cNum) => (
                  <span
                    key={cNum}
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md ${
                      cNum === 1
                        ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold shadow-xs'
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}
                  >
                    {cNum === 1 ? '★ Stadium Court 1' : `Court ${cNum}`}
                  </span>
                ))}
              </div>
            </div>

            {/* Checkbox Toggles */}
            <div className="flex flex-wrap items-center gap-6 pt-2 border-t">
              <label className="flex items-center gap-2 cursor-pointer text-xs md:text-sm font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={event.requireWaiver}
                  onChange={(e) => onUpdateEvent({ ...event, requireWaiver: e.target.checked })}
                  className="w-4 h-4 rounded accent-[#0A5C43]"
                />
                Require Digital Liability Waiver
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs md:text-sm font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={event.seedByDupr}
                  onChange={(e) => onUpdateEvent({ ...event, seedByDupr: e.target.checked })}
                  className="w-4 h-4 rounded accent-[#0A5C43]"
                />
                Seed Pools by Verified DUPR Rating
              </label>
            </div>
          </div>

          {/* Card 4: Divisions Configuration (Fully Customizable, No Rigid Defaults) */}
          <div className="bg-white p-5 md:p-6 rounded-2xl border border-black/10 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
              <div>
                <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  <Users size={18} className="text-[#0A5C43]" />
                  <span>4. Tournament Divisions & Pricing</span>
                </h2>
                <p className="text-xs text-gray-500">
                  {divisions.length} active divisions configured. All pricing, DUPR brackets, and formats are 100% customizable.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddDivision}
                className="px-3.5 py-1.5 bg-[#0A5C43] hover:bg-[#084734] text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus size={14} />
                <span>Add Division</span>
              </button>
            </div>

            {/* Divisions List */}
            {divisions.length === 0 ? (
              <div className="py-10 text-center border-2 border-dashed border-gray-200 rounded-2xl">
                <p className="text-gray-500 text-xs font-medium">No divisions added yet.</p>
                <button
                  type="button"
                  onClick={handleOpenAddDivision}
                  className="mt-3 px-3.5 py-1.5 bg-[#0A5C43] text-white text-xs font-semibold rounded-lg"
                >
                  Create Your First Division
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {divisions.map((d) => (
                  <div key={d.id} className="space-y-2">
                    <DivisionInteractiveCard
                      division={d}
                      tournamentStatus={event.status || 'Live'}
                      tournamentName={event.name}
                      tournamentSlug={event.slug}
                      viewerRole="director"
                      defaultExpanded={false}
                    />

                    {/* Founder / Director Quick Action Bar for this Division */}
                    <div className="flex items-center justify-end gap-2 text-xs pr-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditDivision(d)}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 font-semibold flex items-center gap-1 transition shadow-2xs"
                        title="Edit Division Rules & Schedule"
                      >
                        <Edit2 size={12} />
                        <span>Edit Settings</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuplicateDivision(d)}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 font-semibold flex items-center gap-1 transition shadow-2xs"
                        title="Duplicate Division"
                      >
                        <Copy size={12} />
                        <span>Clone</span>
                      </button>
                      {onDeleteDivision && (
                        <button
                          type="button"
                          onClick={() => onDeleteDivision(d.id)}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-red-50 border border-gray-200 text-gray-500 hover:text-red-600 font-semibold flex items-center gap-1 transition shadow-2xs"
                          title="Delete Division"
                        >
                          <Trash2 size={12} />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 5: Sponsorship & Commercial Partners (Global & Event Naming Rights) */}
          <div className="bg-white p-5 md:p-6 rounded-2xl border border-black/10 shadow-sm space-y-4">
            <SponsorsManagementHub
              sponsors={sponsors}
              totalCourts={event.totalCourts || 8}
              divisions={divisions}
              onAddSponsor={onAddSponsor}
              onUpdateSponsor={onUpdateSponsor}
              onDeleteSponsor={onDeleteSponsor}
              onAssignCourt={onAssignCourt}
              canViewFinancials={canViewFinancials}
              canManageSponsors={canEditRules}
            />
          </div>
        </div>

        {/* ========================================================
            RIGHT COLUMN: REAL-TIME INDEPENDENT WEB PORTAL PREVIEW (5 COLS)
            ======================================================== */}
        <div className="lg:col-span-5 space-y-5 sticky top-6">
          <div className="bg-white rounded-2xl border border-black/10 overflow-hidden shadow-lg flex flex-col">
            {/* Browser Window Simulation Bar */}
            <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between text-xs border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
                <span className="font-mono text-[11px] text-slate-400 ml-2 truncate max-w-[200px]">
                  dinkster.app/t/{eventSlug}
                </span>
              </div>
              <Link
                href={`/t/${eventSlug}`}
                target="_blank"
                className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>Open Live</span>
                <ExternalLink size={12} />
              </Link>
            </div>

            {/* Public Page Hero Card */}
            <div className="bg-gradient-to-br from-[#0A5C43] to-[#0E3D2F] text-white p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EF9F27] text-black">
                  Public Tournament
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/20 text-emerald-200">
                  Join Code: {eventJoinCode}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">{event.name}</h3>
              <p className="text-xs opacity-90 mt-1">{event.dates}</p>
              <p className="text-xs opacity-75">{event.venue}</p>

              <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[10px] font-semibold">
                <span className="px-2 py-0.5 bg-white/20 rounded backdrop-blur">
                  🏟️ {event.totalCourts || 8} Courts
                </span>
                <span className="px-2 py-0.5 bg-white/10 rounded">
                  {event.courtSurface || 'Outdoor Hardcourt'}
                </span>
                <span className="px-2 py-0.5 bg-white/10 rounded">
                  {event.ballType || 'Franklin X-40'}
                </span>
              </div>
            </div>

            {/* Live Divisions Showcase */}
            <div className="p-4 flex flex-col gap-3 flex-1">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-sm text-gray-900">Available Divisions</h4>
                  <span className="text-[11px] text-gray-500">{divisions.length} Divisions</span>
                </div>
                <div className="divide-y border-y border-gray-200">
                  {divisions.map((d) => (
                    <div key={d.id} className="py-2 flex justify-between items-center text-xs">
                      <div>
                        <div className="font-semibold text-gray-900">{d.name}</div>
                        <div className="text-[11px] text-gray-500">
                          {d.format} &bull; Cap: {d.teamCap} teams
                        </div>
                      </div>
                      {canViewFinancials ? (
                        <div className="font-bold text-sm text-[#0A5C43]">
                          ${d.entryFee} <span className="text-[10px] font-normal text-gray-400">/ player</span>
                        </div>
                      ) : (
                        <div className="font-semibold text-xs text-gray-500">
                          {d.teamCap} teams cap
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {event.requireWaiver && (
                <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-xs text-[#0A5C43] font-medium flex items-center gap-2">
                  <ShieldCheck size={15} className="text-[#0A5C43] shrink-0" />
                  <span>Digital liability waiver required upon player entry.</span>
                </div>
              )}

              {/* Independent Registration CTA */}
              <Link
                href={`/t/${eventSlug}`}
                target="_blank"
                className="w-full py-2.5 bg-[#EF9F27] hover:bg-[#d98c1c] text-black font-semibold text-center text-xs rounded-xl shadow-xs transition block"
              >
                Register Player Online Now
              </Link>

              {/* Dual Landing Explanation */}
              <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl space-y-1.5 text-xs text-gray-600">
                <div className="flex items-center gap-2 font-bold text-gray-900">
                  <Globe size={14} className="text-[#0A5C43]" />
                  <span>Dual-Track Landing Portals:</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  <strong>1. Independent Web Portal:</strong> Universal registration & tournament hub accessible on any desktop or mobile browser.
                </p>
                <p className="text-[11px] leading-relaxed">
                  <strong>2. Dinkster App Sync:</strong> Players can check in, enter court scorecards, and track games using Join Code <strong>{eventJoinCode}</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          MODAL A: ADD / EDIT DIVISION MODAL (FULL CUSTOMIZATION)
          ======================================================== */}
      {showDivModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 animate-fade-in overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-xl text-gray-900 tracking-tight">
                {editingDivisionId ? 'Edit Division Settings' : 'Add Custom Division'}
              </h3>
              <button
                type="button"
                onClick={() => setShowDivModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDivision} className="space-y-4">
              {/* Division Name */}
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase block mb-1">
                  Division Title
                </label>
                <input
                  type="text"
                  required
                  value={divName}
                  onChange={(e) => setDivName(e.target.value)}
                  placeholder="e.g. Mixed Doubles 3.5 to 4.0"
                  className="w-full bg-[#FAF8F3] border border-black/15 rounded-xl px-3.5 py-2 text-sm font-bold text-gray-900 focus:outline-none focus:border-[#0A5C43]"
                />
              </div>

              {/* Format & Age Comboboxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CreatableCombobox
                  label="Play Format"
                  value={divFormat}
                  onChange={setDivFormat}
                  options={PRESET_DIVISION_FORMATS}
                  placeholder="Select or enter custom format..."
                />

                <CreatableCombobox
                  label="Age Bracket"
                  value={divAge}
                  onChange={setDivAge}
                  options={PRESET_AGE_BRACKETS}
                  placeholder="Select or enter age bracket..."
                />
              </div>

              {/* DUPR Range Customizer */}
              <div className="p-3.5 bg-[#FAF8F3] border border-black/10 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-700 uppercase">DUPR Rating Bracket</span>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={divIsOpenDupr}
                      onChange={(e) => setDivIsOpenDupr(e.target.checked)}
                      className="rounded accent-[#0A5C43]"
                    />
                    Open / All Ratings
                  </label>
                </div>

                {!divIsOpenDupr && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-[11px] text-gray-500 font-semibold block mb-1">Min DUPR</span>
                      <input
                        type="number"
                        step={0.1}
                        min={0}
                        max={8.0}
                        value={divMinDupr}
                        onChange={(e) => setDivMinDupr(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-black/15 rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-900"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-gray-500 font-semibold block mb-1">Max DUPR</span>
                      <input
                        type="number"
                        step={0.1}
                        min={0}
                        max={8.0}
                        value={divMaxDupr}
                        onChange={(e) => setDivMaxDupr(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-black/15 rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-900"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Dollar Amount & Team Cap */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Entry Fee ($ per player / person)
                  </label>
                  <div className="flex items-center bg-[#FAF8F3] border border-black/15 rounded-xl px-3 py-2">
                    <DollarSign size={16} className="text-gray-400 shrink-0" />
                    <input
                      type="number"
                      min={0}
                      value={divFee}
                      onChange={(e) => setDivFee(parseInt(e.target.value, 10) || 0)}
                      className="w-full bg-transparent font-bold text-base text-[#0A5C43] focus:outline-none ml-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase block mb-1">
                    Team Cap Limit
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={128}
                    value={divCap}
                    onChange={(e) => setDivCap(parseInt(e.target.value, 10) || 16)}
                    className="w-full bg-[#FAF8F3] border border-black/15 rounded-xl px-3.5 py-2 text-sm font-bold text-gray-900 focus:outline-none focus:border-[#0A5C43]"
                  />
                </div>
              </div>

              {/* Scoring Format */}
              <CreatableCombobox
                label="Division Match Scoring Format"
                value={divScoring}
                onChange={setDivScoring}
                options={PRESET_SCORING_FORMATS}
                placeholder="Select or enter scoring format..."
              />

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowDivModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0A5C43] hover:bg-[#084734] text-white rounded-xl text-xs font-black shadow-sm"
                >
                  {editingDivisionId ? 'Save Changes' : 'Add Division'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL B: TOURNAMENT PORTALS CREATED & LIVE HUB
          ======================================================== */}
      {showPublishedModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-gray-200 animate-fade-in space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-100 text-[#0A5C43] rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <Sparkles size={28} />
              </div>
              <h2 className="font-bold text-2xl text-gray-900 tracking-tight">
                Tournament Portals Created & Live!
              </h2>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                Your tournament is published. Share the independent web link with players everywhere, or provide the Dinkster join code.
              </p>
            </div>

            {/* Portal Option 1: Independent Web URL */}
            <div className="p-4 rounded-2xl border-2 border-[#0A5C43] bg-emerald-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe size={18} className="text-[#0A5C43]" />
                  <span className="font-bold text-base text-gray-900 tracking-tight">
                    1. Independent Web App Player & Registration Portal
                  </span>
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                  Primary Landing Zone
                </span>
              </div>
              <p className="text-xs text-gray-600">
                Any player on desktop or mobile can register their team, sign liability waivers, pay entry fees, and view live pool standings.
              </p>

              <div className="flex items-center gap-2 bg-white border border-emerald-300 rounded-xl p-2 font-mono text-xs">
                <span className="text-[#0A5C43] font-bold truncate flex-1 pl-2">
                  {independentWebUrl}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(independentWebUrl, 'url')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-[#0A5C43] font-bold text-xs flex items-center gap-1 transition shrink-0"
                >
                  {copiedUrl ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedUrl ? 'Copied!' : 'Copy URL'}</span>
                </button>
                <Link
                  href={`/t/${eventSlug}`}
                  target="_blank"
                  className="px-3 py-1.5 rounded-lg bg-[#0A5C43] hover:bg-[#084734] text-white font-bold text-xs flex items-center gap-1 transition shrink-0"
                >
                  <span>Open Page</span>
                  <ExternalLink size={13} />
                </Link>
              </div>
            </div>

            {/* Portal Option 2: Dinkster Mobile Player App */}
            <div className="p-4 rounded-2xl border border-gray-200 bg-[#FAF8F3] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone size={18} className="text-gray-700" />
                  <span className="font-bold text-base text-gray-900 tracking-tight">
                    2. Dinkster App Player Code
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-gray-200 text-gray-700">
                  Mobile App Sync
                </span>
              </div>
              <p className="text-xs text-gray-600">
                Players with the Dinkster app can enter this code to check in, view desk assignments, and enter match scores.
              </p>
              <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-2.5">
                <span className="font-mono font-black text-xl text-gray-900 tracking-wider pl-2">
                  {eventJoinCode}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(eventJoinCode, 'code')}
                  className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs flex items-center gap-1 transition"
                >
                  {copiedCode ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedCode ? 'Copied Code' : 'Copy Code'}</span>
                </button>
              </div>
            </div>

            {/* Additional Broadcaster / TV Links */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <Link
                href="/tv"
                target="_blank"
                className="p-3 rounded-xl border border-gray-200 hover:border-black/20 bg-white flex items-center gap-2 font-bold text-gray-800 transition"
              >
                <Tv size={16} className="text-amber-500" />
                <span>TV Jumbotron Cast</span>
              </Link>
              <Link
                href="/?tab=desk"
                onClick={() => setShowPublishedModal(false)}
                className="p-3 rounded-xl border border-gray-200 hover:border-black/20 bg-white flex items-center gap-2 font-bold text-gray-800 transition"
              >
                <Layers size={16} className="text-[#0A5C43]" />
                <span>Court Desk Operations</span>
              </Link>
            </div>

            {/* Close Button */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setShowPublishedModal(false)}
                className="w-full py-3 bg-gray-900 hover:bg-black text-white font-bold text-sm rounded-xl transition"
              >
                Done / Return to Event Management
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
