import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState } from 'react-native';
import TrackPlayer, {
  Event,
  State,
} from 'react-native-track-player';

import { surahs, type Surah } from '../data/surahs';
import {
  getRepeatMode,
  getShuffleEnabled,
  getSurahNumberFromTrack,
  playSurah as loadAndPlaySurah,
  restorePlaybackSession as restorePlayerSession,
  setRepeatMode as updateRepeatMode,
  setShuffleEnabled as updateShuffleEnabled,
  setupAudioPlayer,
  skipToNextSurah as loadNextSurah,
  skipToPreviousSurah as loadPreviousSurah,
  type RepeatModeName,
} from '../services/audioPlayer';
import {
  readPlaybackSession,
  writePlaybackSession,
  type PlaybackSession,
} from '../services/playbackSession';

type AudioPlayerContextValue = {
  currentSurah: Surah | null;
  isPlaying: boolean;
  isLoading: boolean;
  isPlayerVisible: boolean;
  position: number;
  duration: number;
  playbackError: string | null;
  repeatMode: RepeatModeName;
  shuffleEnabled: boolean;
  playSurah: (surahNumber: number) => Promise<void>;
  togglePlayback: () => Promise<void>;
  setRepeatMode: (mode: RepeatModeName) => Promise<void>;
  setShuffleEnabled: (enabled: boolean) => Promise<void>;
  skipToNextSurah: () => Promise<void>;
  skipToPreviousSurah: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  openPlayer: () => void;
  closePlayer: () => void;
};

const AudioPlayerContext = createContext<
  AudioPlayerContextValue | undefined
>(undefined);

type AudioPlayerProviderProps = {
  children: ReactNode;
};

export function AudioPlayerProvider({
  children,
}: AudioPlayerProviderProps) {
  const [currentSurahNumber, setCurrentSurahNumber] = useState<
    number | null
  >(null);
  const [playbackState, setPlaybackState] = useState<State>(State.None);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [repeatMode, setRepeatModeState] = useState<RepeatModeName>(
    getRepeatMode(),
  );
  const [shuffleEnabled, setShuffleEnabledState] = useState(
    getShuffleEnabled(),
  );
  const [isSessionRestored, setIsSessionRestored] = useState(false);
  const sessionToPersistRef = useRef<PlaybackSession | null>(null);

  sessionToPersistRef.current = currentSurahNumber === null
    ? null
    : {
        surahNumber: currentSurahNumber,
        position,
        repeatMode,
        shuffleEnabled,
      };

  useEffect(() => {
    let mounted = true;
    let appState = AppState.currentState;
    const persistSession = () => {
      const session = sessionToPersistRef.current;
      if (session) {
        writePlaybackSession(session).catch((error: unknown) => {
          console.error('Could not save Quran playback session:', error);
        });
      }
    };
    const subscriptions = [
      TrackPlayer.addEventListener(Event.PlaybackState, (event) => {
        setPlaybackState(event.state);
        if (event.state === State.Ended) {
          setPosition(0);
        }
        if (event.state === State.Error) {
          setPlaybackError(event.error.message);
        }
      }),
      TrackPlayer.addEventListener(
        Event.PlaybackActiveTrackChanged,
        (event) => {
          const number = getSurahNumberFromTrack(event.track);
          if (number !== null) {
            setCurrentSurahNumber(number);
            setPosition(0);
            setDuration(0);
          }
        },
      ),
      TrackPlayer.addEventListener(
        Event.PlaybackProgressUpdated,
        (event) => {
          setPosition(event.position);
          setDuration(event.duration);
        },
      ),
      TrackPlayer.addEventListener(Event.PlaybackQueueEnded, () => {
        setPosition(0);
      }),
      TrackPlayer.addEventListener(Event.PlaybackError, (event) => {
        setPlaybackError(event.message);
      }),
    ];
    const appStateSubscription = AppState.addEventListener(
      'change',
      (nextAppState) => {
        if (appState === 'active' && nextAppState !== 'active') {
          persistSession();
        }
        appState = nextAppState;
      },
    );

    async function restorePlayerState() {
      const savedSession = await readPlaybackSession();
      const restored = await restorePlayerSession(savedSession);
      const restoredRepeatMode = getRepeatMode();
      const restoredShuffleEnabled = getShuffleEnabled();

      if (!mounted) {
        return;
      }

      setPlaybackState(restored.playbackState);
      setCurrentSurahNumber(restored.surahNumber);
      setPosition(restored.position);
      setDuration(restored.duration);
      setRepeatModeState(restoredRepeatMode);
      setShuffleEnabledState(restoredShuffleEnabled);

      setIsSessionRestored(true);
    }

    restorePlayerState().catch((error: unknown) => {
      console.error('Could not initialize Quran audio playback:', error);
      if (mounted) {
        setPlaybackError(
          error instanceof Error
            ? error.message
            : 'Could not initialize audio playback.',
        );
      }
    });

    return () => {
      mounted = false;
      subscriptions.forEach((subscription) => subscription.remove());
      appStateSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!isSessionRestored || currentSurahNumber === null) {
      return;
    }

    const timeout = setTimeout(() => {
      const session = sessionToPersistRef.current;
      if (session) {
        writePlaybackSession(session).catch((error: unknown) => {
          console.error('Could not save Quran playback session:', error);
        });
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [
    currentSurahNumber,
    isSessionRestored,
    position,
    repeatMode,
    shuffleEnabled,
  ]);

  async function playSurah(surahNumber: number): Promise<void> {
    if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) {
      throw new RangeError('Surah number must be between 1 and 114.');
    }

    setIsLoading(true);
    setPlaybackError(null);
    setCurrentSurahNumber(surahNumber);
    setPosition(0);
    setDuration(0);

    try {
      await loadAndPlaySurah(surahNumber);
      setIsPlayerVisible(true);
    } catch (error) {
      setPlaybackError(
        error instanceof Error
          ? error.message
          : 'Could not start this surah.',
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  async function togglePlayback(): Promise<void> {
    await setupAudioPlayer();

    if (currentSurahNumber === null) {
      await playSurah(1);
      return;
    }

    const state = await TrackPlayer.getPlaybackState();
    if (state.state === State.Playing) {
      await TrackPlayer.pause();
    } else {
      if (
        state.state === State.Ended ||
        state.state === State.Stopped
      ) {
        await TrackPlayer.seekTo(0);
      }
      await TrackPlayer.play();
    }
  }

  async function setRepeatMode(mode: RepeatModeName): Promise<void> {
    await updateRepeatMode(mode);
    setRepeatModeState(mode);
    setShuffleEnabledState(false);
  }

  async function setShuffleEnabled(enabled: boolean): Promise<void> {
    await updateShuffleEnabled(enabled, currentSurahNumber);
    setShuffleEnabledState(enabled);
    if (enabled) {
      setRepeatModeState('off');
    }
  }

  async function skipToNextSurah(): Promise<void> {
    await loadNextSurah();
  }

  async function skipToPreviousSurah(): Promise<void> {
    await loadPreviousSurah();
  }

  async function seekTo(nextPosition: number): Promise<void> {
    if (!Number.isFinite(nextPosition)) {
      throw new RangeError('Playback position must be a finite number.');
    }

    const targetPosition = Math.max(nextPosition, 0);
    await TrackPlayer.seekTo(
      duration > 0 ? Math.min(targetPosition, duration) : 0,
    );
  }

  const value: AudioPlayerContextValue = {
    currentSurah:
      surahs.find((item) => item.number === currentSurahNumber) ?? null,
    isPlaying: playbackState === State.Playing,
    isLoading:
      isLoading ||
      playbackState === State.Loading ||
      playbackState === State.Buffering,
    isPlayerVisible,
    position,
    duration,
    playbackError,
    repeatMode,
    shuffleEnabled,
    playSurah,
    togglePlayback,
    setRepeatMode,
    setShuffleEnabled,
    skipToNextSurah,
    skipToPreviousSurah,
    seekTo,
    openPlayer: () => setIsPlayerVisible(true),
    closePlayer: () => setIsPlayerVisible(false),
  };

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);

  if (context === undefined) {
    throw new Error(
      'useAudioPlayer must be used inside AudioPlayerProvider.',
    );
  }

  return context;
}
