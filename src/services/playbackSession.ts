import AsyncStorage from '@react-native-async-storage/async-storage';

import type { RepeatModeName } from './audioPlayer';

const PLAYBACK_SESSION_KEY = 'alafasy_playback_session';

export type PlaybackSession = {
  surahNumber: number;
  position: number;
  repeatMode: RepeatModeName;
  shuffleEnabled: boolean;
};

function isPlaybackSession(value: unknown): value is PlaybackSession {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const session = value as Record<string, unknown>;
  return (
    typeof session.surahNumber === 'number' &&
    Number.isInteger(session.surahNumber) &&
    session.surahNumber >= 1 &&
    session.surahNumber <= 114 &&
    typeof session.position === 'number' &&
    Number.isFinite(session.position) &&
    session.position >= 0 &&
    (session.repeatMode === 'off' ||
      session.repeatMode === 'one' ||
      session.repeatMode === 'all') &&
    typeof session.shuffleEnabled === 'boolean'
  );
}

export function parsePlaybackSession(
  value: string | null,
): PlaybackSession | null {
  if (value === null) {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch (error) {
    console.warn('Ignoring invalid saved Quran playback session:', error);
    return null;
  }

  if (!isPlaybackSession(parsed)) {
    console.warn('Ignoring malformed saved Quran playback session.');
    return null;
  }

  return parsed;
}

export async function readPlaybackSession(): Promise<PlaybackSession | null> {
  return parsePlaybackSession(
    await AsyncStorage.getItem(PLAYBACK_SESSION_KEY),
  );
}

export async function writePlaybackSession(
  session: PlaybackSession,
): Promise<void> {
  await AsyncStorage.setItem(
    PLAYBACK_SESSION_KEY,
    JSON.stringify(session),
  );
}
