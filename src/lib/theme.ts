export type ThemeKey = 'dark' | 'synthwave' | 'emerald' | 'amber' | 'slate';

export interface ThemeConfig {
  id: ThemeKey;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  bgMain: string;
  bgCard: string;
  bgCardHover: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
}

export const THEMES: Record<ThemeKey, ThemeConfig> = {
  dark: {
    id: 'dark',
    name: 'Midnight Rez (Default)',
    primary: 'indigo-500',
    secondary: 'violet-600',
    accent: 'cyan-400',
    bgMain: '#0b0f19',
    bgCard: '#131c2e',
    bgCardHover: '#18243b',
    border: 'border-slate-800',
    textPrimary: 'text-slate-100',
    textSecondary: 'text-slate-400',
  },
  synthwave: {
    id: 'synthwave',
    name: 'Cyber Neon',
    primary: 'pink-500',
    secondary: 'purple-600',
    accent: 'yellow-400',
    bgMain: '#0f051d',
    bgCard: '#1d0b38',
    bgCardHover: '#2a1052',
    border: 'border-purple-900',
    textPrimary: 'text-pink-50',
    textSecondary: 'text-purple-300',
  },
  emerald: {
    id: 'emerald',
    name: 'Verdant Forest',
    primary: 'emerald-500',
    secondary: 'teal-600',
    accent: 'lime-400',
    bgMain: '#051b14',
    bgCard: '#0c2e23',
    bgCardHover: '#123f31',
    border: 'border-emerald-900',
    textPrimary: 'text-emerald-50',
    textSecondary: 'text-emerald-300',
  },
  amber: {
    id: 'amber',
    name: 'Solar Flare',
    primary: 'amber-500',
    secondary: 'orange-600',
    accent: 'yellow-300',
    bgMain: '#1a1005',
    bgCard: '#2d1c0b',
    bgCardHover: '#3e2710',
    border: 'border-amber-900',
    textPrimary: 'text-amber-50',
    textSecondary: 'text-amber-300',
  },
  slate: {
    id: 'slate',
    name: 'Deep Obsidian',
    primary: 'blue-500',
    secondary: 'slate-600',
    accent: 'sky-400',
    bgMain: '#080c14',
    bgCard: '#0f172a',
    bgCardHover: '#1e293b',
    border: 'border-slate-800',
    textPrimary: 'text-slate-100',
    textSecondary: 'text-slate-400',
  },
};
