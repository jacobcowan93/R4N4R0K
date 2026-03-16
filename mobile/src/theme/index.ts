export const Colors = {
  // Background
  bg: '#0a0a0a',
  bgElevated: '#141414',
  bgCard: '#1a1a1a',
  bgInput: '#1e1e1e',

  // Brand
  primary: '#e8a020',       // amber/gold — ARC Raiders feel
  primaryDark: '#b87a10',
  primaryLight: '#ffc04d',

  // Accents
  danger: '#e84040',
  success: '#2ecc71',
  info: '#3498db',

  // Text
  textPrimary: '#f0f0f0',
  textSecondary: '#9a9a9a',
  textMuted: '#555555',

  // Borders
  border: '#2a2a2a',
  borderFocus: '#e8a020',

  // Rarity tiers (ARC-style)
  rarityCommon: '#9a9a9a',
  rarityUncommon: '#2ecc71',
  rarityRare: '#3498db',
  rarityEpic: '#9b59b6',
  rarityLegendary: '#e8a020',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  xxl: 28,
  hero: 36,
} as const;

export const Radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 20,
  full: 9999,
} as const;

export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  glow: {
    shadowColor: '#e8a020',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
} as const;
