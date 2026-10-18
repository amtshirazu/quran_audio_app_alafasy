
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  darkTheme,
  lightTheme,
  type AppColors,
  type ThemeMode,
} from '../theme/theme';

const THEME_STORAGE_KEY = 'app_theme';

type ThemeContextType = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  colors: AppColors;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined,
);

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>('light');
  const [isLoaded, setIsLoaded] = useState(false);

  // Restore the saved preference when the app starts.
  useEffect(() => {
    async function loadTheme() {
      try {
        const savedTheme = await AsyncStorage.getItem(
          THEME_STORAGE_KEY,
        );

        if (
          savedTheme === 'light' ||
          savedTheme === 'dark'
        ) {
          setMode(savedTheme);
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
      } finally {
        setIsLoaded(true);
      }
    }

    loadTheme();
  }, []);

  // Save the preference whenever the user changes it.
  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    async function saveTheme() {
      try {
        await AsyncStorage.setItem(
          THEME_STORAGE_KEY,
          mode,
        );
      } catch (error) {
        console.error('Failed to save theme:', error);
      }
    }

    saveTheme();
  }, [mode, isLoaded]);

  const isDark = mode === 'dark';

  const colors = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider
      value={{ mode, setMode, colors, isDark }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error(
      'useTheme must be used inside ThemeProvider',
    );
  }

  return context;
}
