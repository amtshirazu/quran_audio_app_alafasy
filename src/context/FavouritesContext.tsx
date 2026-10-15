
import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';

type FavouritesContextType = {
  favourites: number[];
  toggleFavourite: (number: number) => void;
  isFavourite: (number: number) => boolean;
};

const FavouritesContext = createContext<
  FavouritesContextType | undefined
>(undefined);

type FavouritesProviderProps = {
  children: ReactNode;
};

export function FavouritesProvider({
  children,
}: FavouritesProviderProps) {
  const [favourites, setFavourites] = useState<number[]>([]);
const [isLoaded, setIsLoaded] = useState(false);

useEffect(() => {
  async function loadFavourites() {
    try {
      const savedValue = await AsyncStorage.getItem('alafasy_favourites');

      if (savedValue !== null) {
        const parsed: unknown = JSON.parse(savedValue);

        if (
          Array.isArray(parsed) &&
          parsed.every(
            (item) => typeof item === 'number' && Number.isInteger(item),
          )
        ) {
          setFavourites(parsed);
        }
      }
    } catch (error) {
      console.error('Failed to load favourites:', error);
    } finally {
      setIsLoaded(true);
    }
  }

  loadFavourites();
}, []);


useEffect(() => {
  if (!isLoaded) {
    return;
  }

  async function saveFavourites() {
    try {
      await AsyncStorage.setItem(
        'alafasy_favourites',
        JSON.stringify(favourites),
      );
    } catch (error) {
      console.error('Failed to save favourites:', error);
    }
  }

  saveFavourites();
}, [favourites, isLoaded]);

  function toggleFavourite(number: number) {
    setFavourites((previous) =>
      previous.includes(number)
        ? previous.filter((item) => item !== number)
        : [...previous, number],
    );
  }

  function isFavourite(number: number) {
    return favourites.includes(number);
  }

  return (
    <FavouritesContext.Provider
      value={{ favourites, toggleFavourite, isFavourite }}
    >
      {children}
    </FavouritesContext.Provider>
  );
}

export function useFavourites() {
  const context = useContext(FavouritesContext);

  if (context === undefined) {
    throw new Error(
      'useFavourites must be used inside FavouritesProvider',
    );
  }

  return context;
}
