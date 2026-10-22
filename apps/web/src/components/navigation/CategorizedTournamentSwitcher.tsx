'use client';

import React, { useState, useRef, useEffect } from 'react';
import { TournamentEvent } from '../../types/organizer';
import {
  ChevronDown,
  Search,
  Plus,
  Layers,
  ArrowRight,
  Sparkles,
  Trophy,
  Calendar,
  MapPin,
  Check,
} from 'lucide-react';

interface CategorizedTournamentSwitcherProps {
  tournaments: TournamentEvent[];
  selectedTournamentId: string | null;
  onSelectTournament: (tournamentId: string) => void;
  onExitToFleet: () => void;
  onOpenCreateModal: () => void;
}

export const CategorizedTournamentSwitcher: React.FC<CategorizedTournamentSwitcherProps> = ({
  tournaments,
  selectedTournamentId,
  onSelectTournament,
  onExitToFleet,
  onOpenCreateModal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef<HTMLDivElement | null>(null);

  const currentTournament = tournaments.find((t) => t.id === selectedTournamentId) || tournaments[0];

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  // Group tournaments into status categories
  const liveTournaments = tournaments.filter(
    (t) =>
      t.status === 'Live' &&
      (t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.venue.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const upcomingTournaments = tournaments.filter(
    (t) =>
      t.status === 'Published' &&
      (t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.venue.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const draftTournaments = tournaments.filter(
    (t) =>
      t.status === 'Draft' &&
      (t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.venue.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const concludedTournaments = tournaments.filter(
    (t) =>
      t.status === 'Concluded' &&
      (t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.venue.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusBadge = (status: TournamentEvent['status']) => {
    switch (status) {
      case 'Live':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Now
          </span>
        );
      case 'Published':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-800 border border-blue-200">
            Upcoming
          </span>
        );
      case 'Draft':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-900 border border-amber-300">
            📝 Draft
          </span>
        );
      case 'Concluded':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
            🏁 Concluded
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200/90 text-xs font-bold text-gray-900 transition shadow-2xs focus:outline-none"
        title="Switch tournament workspace (Categories: Live, Upcoming, Drafts)"
      >
        <div className="flex items-center gap-1.5 truncate max-w-[200px] md:max-w-[280px]">
          <span className="truncate">{currentTournament?.name || 'Select Tournament'}</span>
        </div>

        {currentTournament && getStatusBadge(currentTournament.status)}

        <ChevronDown
          size={14}
          className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-96 rounded-2xl bg-white shadow-2xl border border-gray-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Search Input Bar */}
          <div className="p-3 bg-gray-50/80 border-b border-gray-200 flex items-center gap-2">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder="Search tournaments, cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-gray-400 hover:text-gray-600 text-xs font-bold"
              >
                &times;
              </button>
            )}
          </div>

          {/* Quick Fleet & Create Actions */}
          <div className="p-2 bg-white border-b border-gray-100 flex items-center justify-between text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onExitToFleet();
              }}
              className="px-2.5 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition flex items-center gap-1"
            >
              <Layers size={13} />
              <span>All Tournaments Fleet</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenCreateModal();
              }}
              className="px-2.5 py-1 bg-[#0A5C43] text-white hover:bg-[#084734] rounded-lg transition flex items-center gap-1 text-[11px] shadow-xs"
            >
              <Plus size={12} />
              <span>New Tournament</span>
            </button>
          </div>

          {/* Tournament Categories List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-100 p-2 space-y-3">
            {/* 🟢 Live Now */}
            {liveTournaments.length > 0 && (
              <div>
                <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Tournaments ({liveTournaments.length})
                  </span>
                </div>
                <div className="space-y-1 mt-1">
                  {liveTournaments.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        onSelectTournament(t.id);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl transition flex items-center justify-between ${
                        selectedTournamentId === t.id
                          ? 'bg-emerald-50/80 border border-emerald-300'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="font-bold text-xs text-gray-900 truncate">{t.name}</div>
                        <div className="text-[11px] text-gray-500 truncate mt-0.5">
                          {t.venue} &bull; {t.totalCourts || 8} Courts
                        </div>
                      </div>
                      {selectedTournamentId === t.id ? (
                        <Check size={14} className="text-[#0A5C43] shrink-0" />
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md shrink-0">
                          Active
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 🔵 Upcoming / Published */}
            {upcomingTournaments.length > 0 && (
              <div>
                <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-blue-800 flex items-center justify-between">
                  <span>Upcoming Tournaments ({upcomingTournaments.length})</span>
                </div>
                <div className="space-y-1 mt-1">
                  {upcomingTournaments.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        onSelectTournament(t.id);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl transition flex items-center justify-between ${
                        selectedTournamentId === t.id
                          ? 'bg-blue-50/80 border border-blue-300'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="font-bold text-xs text-gray-900 truncate">{t.name}</div>
                        <div className="text-[11px] text-gray-500 truncate mt-0.5">
                          {t.dates} &bull; {t.registeredCount || 0} Registered
                        </div>
                      </div>
                      {selectedTournamentId === t.id ? (
                        <Check size={14} className="text-blue-700 shrink-0" />
                      ) : (
                        <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md shrink-0">
                          Published
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 📝 Drafts */}
            {draftTournaments.length > 0 && (
              <div>
                <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-amber-900 flex items-center justify-between">
                  <span>Drafts in Progress ({draftTournaments.length})</span>
                </div>
                <div className="space-y-1 mt-1">
                  {draftTournaments.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        onSelectTournament(t.id);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl transition flex items-center justify-between ${
                        selectedTournamentId === t.id
                          ? 'bg-amber-50/80 border border-amber-300'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="font-bold text-xs text-gray-900 truncate">{t.name}</div>
                        <div className="text-[11px] text-amber-700 truncate mt-0.5">
                          Setup incomplete &bull; {t.city || 'Texas'}
                        </div>
                      </div>
                      {selectedTournamentId === t.id ? (
                        <Check size={14} className="text-amber-800 shrink-0" />
                      ) : (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md shrink-0">
                          Edit Draft &rarr;
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 🏁 Concluded */}
            {concludedTournaments.length > 0 && (
              <div>
                <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-gray-500 flex items-center justify-between">
                  <span>Concluded ({concludedTournaments.length})</span>
                </div>
                <div className="space-y-1 mt-1">
                  {concludedTournaments.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        onSelectTournament(t.id);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded-xl transition flex items-center justify-between ${
                        selectedTournamentId === t.id
                          ? 'bg-gray-100 border border-gray-300'
                          : 'hover:bg-gray-50 border border-transparent opacity-75'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="font-semibold text-xs text-gray-700 truncate">{t.name}</div>
                        <div className="text-[10px] text-gray-400 truncate">{t.dates}</div>
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono">Archive</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
