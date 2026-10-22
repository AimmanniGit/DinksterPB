'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Check, ChevronDown, Plus, Search, X } from 'lucide-react';

interface CreatableComboboxProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  allowCustom?: boolean;
  helpText?: string;
  className?: string;
}

export const CreatableCombobox: React.FC<CreatableComboboxProps> = ({
  label,
  value,
  onChange,
  options: initialOptions,
  placeholder = 'Select or type custom...',
  allowCustom = true,
  helpText,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customOptions, setCustomOptions] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Combine initial options with any dynamically created custom options
  const allOptions = useMemo(() => {
    const set = new Set([...initialOptions, ...customOptions]);
    if (value && !set.has(value)) {
      set.add(value);
    }
    return Array.from(set);
  }, [initialOptions, customOptions, value]);

  // Filter options based on user search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return allOptions;
    const q = searchQuery.toLowerCase().trim();
    return allOptions.filter((opt) => opt.toLowerCase().includes(q));
  }, [allOptions, searchQuery]);

  // Check if current search query already exists exactly in options
  const exactMatchExists = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allOptions.some((opt) => opt.toLowerCase() === q);
  }, [allOptions, searchQuery]);

  // Handle outside clicks to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const handleSelect = (selected: string) => {
    onChange(selected);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleCreateCustom = () => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    if (!allOptions.includes(trimmed)) {
      setCustomOptions((prev) => [...prev, trimmed]);
    }
    onChange(trimmed);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchQuery('');
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions.length === 1) {
        handleSelect(filteredOptions[0]);
      } else if (!exactMatchExists && allowCustom && searchQuery.trim()) {
        handleCreateCustom();
      } else if (filteredOptions.length > 0) {
        handleSelect(filteredOptions[0]);
      }
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="text-xs font-bold text-gray-600 uppercase block mb-1 tracking-wider">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full bg-[#FAF8F3] hover:bg-white border border-black/15 focus:border-[#0A5C43] rounded-xl px-3.5 py-2 text-sm font-semibold text-left flex items-center justify-between gap-2 shadow-xs transition"
      >
        <span className={`truncate ${value ? 'text-gray-900 font-bold' : 'text-gray-400'}`}>
          {value || placeholder}
        </span>
        <ChevronDown size={16} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Floating Searchable Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-black/15 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in">
          {/* Search Box */}
          <div className="p-2.5 border-b border-gray-100 flex items-center gap-2 bg-gray-50/80">
            <Search size={15} className="text-gray-400 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search or enter new option..."
              className="w-full bg-transparent text-xs font-semibold text-gray-900 placeholder-gray-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-gray-400 hover:text-gray-700 p-0.5"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto p-1.5 divide-y divide-gray-50">
            {/* Create new option banner if not an exact match */}
            {allowCustom && searchQuery.trim() && !exactMatchExists && (
              <button
                type="button"
                onClick={handleCreateCustom}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#0A5C43] bg-emerald-50 hover:bg-emerald-100/80 flex items-center gap-2 transition mb-1 border border-emerald-200/60"
              >
                <Plus size={14} className="text-[#0A5C43]" />
                <span>
                  Create new: <strong className="underline">"{searchQuery.trim()}"</strong>
                </span>
              </button>
            )}

            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = option === value;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 transition ${
                      isSelected
                        ? 'bg-[#0A5C43] text-white font-bold'
                        : 'text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    <span className="truncate">{option}</span>
                    {isSelected && <Check size={14} className="text-white shrink-0" />}
                  </button>
                );
              })
            ) : !allowCustom || !searchQuery.trim() ? (
              <div className="py-4 text-center text-xs text-gray-400">
                No matching options found.
              </div>
            ) : null}
          </div>
        </div>
      )}

      {helpText && <p className="text-[11px] text-gray-500 mt-1">{helpText}</p>}
    </div>
  );
};
