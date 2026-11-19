export type PlannerOrientation = 'portrait' | 'landscape';

export type PlannerTheme = 'linen' | 'slate' | 'charcoal' | 'sage' | 'terracotta';

export type PlannerYear = '2025' | '2026' | 'undated';

export type StartDay = 'monday' | 'sunday';

export type DailyLayout = 'structured' | 'minimal' | 'matrix';

export type WeeklyLayout = 'horizontal' | 'vertical' | 'checklist';

export interface PlannerModules {
  habits: boolean;
  finance: boolean;
  goals: boolean;
  notes: boolean;
}

export type PreviewTab = 'cover' | 'year' | 'month' | 'week' | 'day' | 'habits' | 'notes';

export interface PlannerConfig {
  orientation: PlannerOrientation;
  theme: PlannerTheme;
  year: PlannerYear;
  startDay: StartDay;
  dailyLayout: DailyLayout;
  weeklyLayout: WeeklyLayout;
  modules: PlannerModules;
  duration: 'full' | 'quarter' | 'sample'; // Full Year, Q1, or 1-Month Sample for ultra fast generation
}

export interface ThemeColors {
  id: PlannerTheme;
  name: string;
  description: string;
  paperHex: string;
  paperRgb: [number, number, number]; // 0-1 for pdf-lib
  tabHex: string;
  tabRgb: [number, number, number];
  textHex: string;
  textRgb: [number, number, number];
  mutedHex: string;
  mutedRgb: [number, number, number];
  accentHex: string;
  accentRgb: [number, number, number];
  borderHex: string;
  borderRgb: [number, number, number];
  isDark?: boolean;
}

export const THEME_PALETTES: Record<PlannerTheme, ThemeColors> = {
  linen: {
    id: 'linen',
    name: 'Warm Linen',
    description: 'Classic luxury archival paper with gentle warm ivory tones and espresso typography.',
    paperHex: '#FAF7F2',
    paperRgb: [0.98, 0.968, 0.949],
    tabHex: '#EDE6DD',
    tabRgb: [0.929, 0.902, 0.867],
    textHex: '#221F1B',
    textRgb: [0.133, 0.122, 0.106],
    mutedHex: '#8C8275',
    mutedRgb: [0.549, 0.51, 0.459],
    accentHex: '#A67C52',
    accentRgb: [0.651, 0.486, 0.322],
    borderHex: '#DFD8CC',
    borderRgb: [0.875, 0.847, 0.8],
    isDark: false,
  },
  slate: {
    id: 'slate',
    name: 'Modern Slate',
    description: 'Crisp minimalist white with architectural graphite rules and obsidian text.',
    paperHex: '#FFFFFF',
    paperRgb: [1, 1, 1],
    tabHex: '#F1F3F5',
    tabRgb: [0.945, 0.953, 0.961],
    textHex: '#111418',
    textRgb: [0.067, 0.078, 0.094],
    mutedHex: '#64748B',
    mutedRgb: [0.392, 0.455, 0.545],
    accentHex: '#0284C7',
    accentRgb: [0.008, 0.518, 0.78],
    borderHex: '#E2E8F0',
    borderRgb: [0.886, 0.91, 0.941],
    isDark: false,
  },
  charcoal: {
    id: 'charcoal',
    name: 'Quiet Obsidian',
    description: 'Deep matte dark mode for glare-free night planning on iPad OLED displays.',
    paperHex: '#17191E',
    paperRgb: [0.09, 0.098, 0.118],
    tabHex: '#232730',
    tabRgb: [0.137, 0.153, 0.188],
    textHex: '#F3F4F6',
    textRgb: [0.953, 0.957, 0.965],
    mutedHex: '#94A3B8',
    mutedRgb: [0.58, 0.639, 0.722],
    accentHex: '#D4AF37',
    accentRgb: [0.831, 0.686, 0.216],
    borderHex: '#2E3542',
    borderRgb: [0.18, 0.208, 0.259],
    isDark: true,
  },
  sage: {
    id: 'sage',
    name: 'Botanical Sage',
    description: 'Earthy organic matcha and eucalyptus tones for calm, mindful daily organization.',
    paperHex: '#F6F8F5',
    paperRgb: [0.965, 0.973, 0.961],
    tabHex: '#E8ECE6',
    tabRgb: [0.91, 0.925, 0.902],
    textHex: '#1E2B21',
    textRgb: [0.118, 0.169, 0.129],
    mutedHex: '#6E8172',
    mutedRgb: [0.431, 0.506, 0.447],
    accentHex: '#4E7356',
    accentRgb: [0.306, 0.451, 0.337],
    borderHex: '#D7DFD5',
    borderRgb: [0.843, 0.875, 0.835],
    isDark: false,
  },
  terracotta: {
    id: 'terracotta',
    name: 'Warm Clay',
    description: 'Mediterranean warmth with sun-baked terracotta accents and soft sand paper.',
    paperHex: '#FAF6F4',
    paperRgb: [0.98, 0.965, 0.957],
    tabHex: '#EFE6E1',
    tabRgb: [0.937, 0.902, 0.882],
    textHex: '#2B1E19',
    textRgb: [0.169, 0.118, 0.098],
    mutedHex: '#8C6F65',
    mutedRgb: [0.549, 0.435, 0.396],
    accentHex: '#B25D43',
    accentRgb: [0.698, 0.365, 0.263],
    borderHex: '#E2D5CF',
    borderRgb: [0.886, 0.835, 0.812],
    isDark: false,
  },
};

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const MONTH_SHORT = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
];
