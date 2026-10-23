'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UserRole, UserActorProfile } from '../../types/organizer';
import { INITIAL_ACTOR_PROFILES } from '../../constants/initialState';
import {
  ShieldCheck,
  ChevronDown,
  Crown,
  Trophy,
  Scale,
  ClipboardList,
  Check,
  Eye,
  EyeOff,
  Lock,
  Wrench,
} from 'lucide-react';

interface ActorRoleSwitcherProps {
  currentProfile: UserActorProfile;
  onSelectProfile: (profile: UserActorProfile) => void;
}

export const ROLE_ICONS: Record<UserRole, { icon: React.ReactNode; color: string; bg: string }> = {
  admin: {
    icon: <Wrench size={13} className="text-rose-700" />,
    color: 'text-rose-900',
    bg: 'bg-rose-100 border-rose-300',
  },
  founder: {
    icon: <Crown size={13} className="text-amber-600" />,
    color: 'text-amber-900',
    bg: 'bg-amber-100 border-amber-300',
  },
  director: {
    icon: <Trophy size={13} className="text-emerald-700" />,
    color: 'text-emerald-900',
    bg: 'bg-emerald-100 border-emerald-300',
  },
  marshall: {
    icon: <Scale size={13} className="text-purple-700" />,
    color: 'text-purple-900',
    bg: 'bg-purple-100 border-purple-300',
  },
  volunteer: {
    icon: <ClipboardList size={13} className="text-blue-700" />,
    color: 'text-blue-900',
    bg: 'bg-blue-100 border-blue-300',
  },
};

export const ActorRoleSwitcher: React.FC<ActorRoleSwitcherProps> = ({
  currentProfile,
  onSelectProfile,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen]);

  const activeMeta = ROLE_ICONS[currentProfile.role];

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Trigger Pill */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-800 transition shadow-2xs focus:outline-none"
        title="Role-Based Access Control (RBAC): Toggle between Founder, Director, Marshall, Volunteer"
      >
        <span className={`w-5 h-5 rounded-full flex items-center justify-center border ${activeMeta.bg}`}>
          {activeMeta.icon}
        </span>
        <span className="font-bold text-[11px] truncate max-w-[130px]">{currentProfile.name.split(' ')[0]}</span>
        <span className="text-[10px] text-gray-500 font-mono font-bold uppercase">
          [{currentProfile.role.slice(0, 3)}]
        </span>
        <ChevronDown size={12} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Role Selection Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white shadow-2xl border border-gray-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-2 space-y-1">
          <div className="px-3 py-2 border-b border-gray-100">
            <div className="font-black text-xs text-gray-900 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-[#0A5C43]" />
              <span>Organizer RBAC Role Permissions</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Simulate views for different tournament actors.
            </p>
          </div>

          <div className="space-y-1 pt-1">
            {Object.values(INITIAL_ACTOR_PROFILES).map((p) => {
              const meta = ROLE_ICONS[p.role];
              const isSelected = p.role === currentProfile.role;

              return (
                <button
                  key={p.role}
                  type="button"
                  onClick={() => {
                    onSelectProfile(p);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl transition flex items-start justify-between ${
                    isSelected
                      ? 'bg-emerald-50/80 border border-emerald-300'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border ${meta.bg}`}>
                      {meta.icon}
                    </span>
                    <div>
                      <div className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                        <span>{p.name}</span>
                        {p.permissions.canViewFinancials ? (
                          <span title="Financials Visible" className="text-emerald-700">
                            <Eye size={11} />
                          </span>
                        ) : (
                          <span title="Financials Hidden" className="text-gray-400">
                            <EyeOff size={11} />
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-500 font-medium mt-0.5">
                        {p.roleTitle}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-2">
                        {p.permissions.canViewFinancials ? (
                          <span className="text-emerald-700 font-semibold">&bull; Revenue & Payouts</span>
                        ) : (
                          <span className="text-gray-400 font-semibold">&bull; Financials Redacted</span>
                        )}
                        {p.permissions.canManageGlobalSponsors && (
                          <span className="text-blue-700 font-semibold">&bull; Global Sponsors</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {isSelected && <Check size={14} className="text-[#0A5C43] shrink-0 mt-1" />}
                </button>
              );
            })}
          </div>

          <div className="p-2 border-t border-gray-100 bg-gray-50 rounded-xl text-[10px] text-gray-500">
            <strong>Security Notice:</strong> In production, roles are assigned via secure JWT session and multi-factor auth.
          </div>
        </div>
      )}
    </div>
  );
};
