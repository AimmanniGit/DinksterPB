import { ThemeName } from '../types';

export interface ThemeTokens {
  name: string;
  category: 'Default' | 'Gen Z' | 'Millennial';
  primary: string;       // --g
  primaryMid: string;    // --gm
  primaryLight: string;  // --gl
  primaryDark: string;   // --gd
  amber: string;         // --am
  amberLight: string;    // --al
  amberMid: string;      // --aml
  danger: string;        // --rd
  dangerLight: string;   // --rl
  blue: string;          // --bl
  ink: string;           // --ink
  surface: string;       // --sf
  cardBg: string;        // --cd
  bodyBg: string;        // --body-bg
  borderRadius: number;  // --r in px
}

export const THEMES: Record<ThemeName, ThemeTokens> = {
  default: {
    name: 'Green Court',
    category: 'Default',
    primary: '#1D9E75',
    primaryMid: '#5DCAA5',
    primaryLight: '#E8F7F1',
    primaryDark: '#0A5C43',
    amber: '#EF9F27',
    amberLight: '#FEF3E2',
    amberMid: '#FAC775',
    danger: '#E24B4A',
    dangerLight: '#FEF0F0',
    blue: '#3B82F6',
    ink: '#111111',
    surface: '#F8F7F3',
    cardBg: '#FFFFFF',
    bodyBg: '#DEDAD2',
    borderRadius: 16,
  },
  genz1: {
    name: 'Neon Rave',
    category: 'Gen Z',
    primary: '#A855F7',
    primaryMid: '#C084FC',
    primaryLight: '#F5F0FF',
    primaryDark: '#6B21A8',
    amber: '#F43F8E',
    amberLight: '#FFF0F7',
    amberMid: '#F9A8D4',
    danger: '#EF4444',
    dangerLight: '#FEF2F2',
    blue: '#06B6D4',
    ink: '#0F0A1E',
    surface: '#FAF8FF',
    cardBg: '#FFFFFF',
    bodyBg: '#1A0533',
    borderRadius: 20,
  },
  genz2: {
    name: 'Y2K Pastel',
    category: 'Gen Z',
    primary: '#10B981',
    primaryMid: '#34D399',
    primaryLight: '#ECFDF5',
    primaryDark: '#065F46',
    amber: '#F59E0B',
    amberLight: '#FFFBEB',
    amberMid: '#FDE68A',
    danger: '#F43F5E',
    dangerLight: '#FFF1F2',
    blue: '#38BDF8',
    ink: '#111827',
    surface: '#FAFFFE',
    cardBg: '#FFFFFF',
    bodyBg: '#D1FAE5',
    borderRadius: 24,
  },
  mil1: {
    name: 'Clean Slate',
    category: 'Millennial',
    primary: '#1E40AF',
    primaryMid: '#3B82F6',
    primaryLight: '#EFF6FF',
    primaryDark: '#1E3A8A',
    amber: '#D97706',
    amberLight: '#FFFBEB',
    amberMid: '#FCD34D',
    danger: '#DC2626',
    dangerLight: '#FEF2F2',
    blue: '#0891B2',
    ink: '#0F172A',
    surface: '#F8FAFC',
    cardBg: '#FFFFFF',
    bodyBg: '#E2E8F0',
    borderRadius: 12,
  },
  mil2: {
    name: 'Warm Studio',
    category: 'Millennial',
    primary: '#6B7C5E',
    primaryMid: '#8FA07E',
    primaryLight: '#F2F5EE',
    primaryDark: '#3D4F33',
    amber: '#C0714A',
    amberLight: '#FBF0EA',
    amberMid: '#E4A882',
    danger: '#B94040',
    dangerLight: '#FBF0F0',
    blue: '#5B7FA6',
    ink: '#1C1917',
    surface: '#FAFAF9',
    cardBg: '#FFFFFF',
    bodyBg: '#E7E4DD',
    borderRadius: 14,
  },
};
