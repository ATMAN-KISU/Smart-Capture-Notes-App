export const Colors = {

  primary: '#FDB913',
  primaryLight: '#FFCE45',
  primaryDark: '#D89800',
  primaryMuted: 'rgba(253, 185, 19, 0.14)',
  primaryGlow: 'rgba(253, 185, 19, 0.28)',

  background: '#09090B',
  surface: '#131316',
  surfaceElevated: '#1C1C22',
  surfaceBorder: '#2A2A33',
  surfaceBorderActive: '#FDB913',
  surfaceHover: '#23232B',

  textPrimary: '#FDFDFD',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  textOnYellow: '#09090B',
  textGold: '#FDB913',

  accent: '#FDB913',
  accentMuted: 'rgba(253, 185, 19, 0.15)',
  success: '#22C55E',
  successMuted: 'rgba(34, 197, 94, 0.14)',
  warning: '#F59E0B',
  warningMuted: 'rgba(245, 158, 11, 0.14)',
  danger: '#EF4444',
  dangerDark: '#DC2626',
  dangerMuted: 'rgba(239, 68, 68, 0.15)',

  categories: {
    Work: {
      color: '#60A5FA',
      background: 'rgba(96, 165, 250, 0.12)',
      border: 'rgba(96, 165, 250, 0.35)',
      icon: 'briefcase-outline' as const,
    },
    Personal: {
      color: '#FDB913',
      background: 'rgba(253, 185, 19, 0.14)',
      border: 'rgba(253, 185, 19, 0.4)',
      icon: 'star-outline' as const,
    },
    Ideas: {
      color: '#FB923C',
      background: 'rgba(251, 146, 60, 0.12)',
      border: 'rgba(251, 146, 60, 0.35)',
      icon: 'bulb-outline' as const,
    },
    Receipts: {
      color: '#34D399',
      background: 'rgba(52, 211, 153, 0.12)',
      border: 'rgba(52, 211, 153, 0.35)',
      icon: 'receipt-outline' as const,
    },
    Other: {
      color: '#C084FC',
      background: 'rgba(192, 132, 252, 0.12)',
      border: 'rgba(192, 132, 252, 0.35)',
      icon: 'bookmark-outline' as const,
    },
  },
};

export type CategoryColorKey = keyof typeof Colors.categories;
