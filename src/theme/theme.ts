
import baseColors from './colors';

export type ThemeMode = 'light' | 'dark';

export type AppColors = {
  emerald: string;
  emeraldLight: string;
  ivory: string;
  gold: string;
  darkSurface: string;
  text: string;
  muted: string;
  border: string;
  white: string;
  softGreen: string;
  softGold: string;
  background: string;
  surface: string;
  card: string;
  secondaryText: string;
  tabBar: string;
  selectedBackground: string;
};

export const lightTheme: AppColors = {
  ...baseColors,
  background: baseColors.ivory,
  surface: baseColors.white,
  card: baseColors.white,
  secondaryText: baseColors.muted,
  tabBar: baseColors.ivory,
  selectedBackground: baseColors.softGreen,
};

export const darkTheme: AppColors = {
  ...baseColors,
  background: '#101C17',
  surface: '#172A24',
  card: '#1D332B',
  text: '#F8F5EC',
  secondaryText: '#B1BDB5',
  muted: '#A0ADA4',
  border: '#30463B',
  white: '#F8F5EC',
  softGreen: '#263F33',
  softGold: '#3D3424',
  tabBar: '#14241D',
  selectedBackground: '#263F33',
};
