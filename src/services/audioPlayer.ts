import { NativeModules } from 'react-native';
import TrackPlayer, {
  Capability,
  RepeatMode,
  State,
} from 'react-native-track-player';
import type { Track } from 'react-native-track-player';

import { surahs } from '../data/surahs';
import type { PlaybackSession } from './playbackSession';

type QuranAudioAssetsModule = {
  copySurahToCache(surahNumber: number): Promise<string>;
};

const quranAudioAssets = NativeModules.QuranAudioAssets as
  QuranAudioAssetsModule | undefined;

let setupPromise: Promise<void> | null = null;
let trackChangeQueue: Promise<void> = Promise.resolve();
export type RepeatModeName = 'off' | 'one' | 'all';

let repeatMode: RepeatModeName = 'off';
let shuffleEnabled = false;
let shuffleBag: number[] = [];
let shuffleHistory: number[] = [];

function enqueueTrackChange(
  surahNumber: number,
  recordShuffleHistory = true,
  autoplay = true,
): Promise<void> {
  const operation = trackChangeQueue.then(async () => {
    if (recordShuffleHistory && shuffleEnabled) {
      const currentTrack = await TrackPlayer.getActiveTrack();
      const currentNumber = getSurahNumberFromTrack(currentTrack);
      if (currentNumber !== null && currentNumber !== surahNumber) {
        shuffleHistory.push(currentNumber);
      }
    }

    await replaceSurahTrack(surahNumber, autoplay);
  }, async () => {
    await replaceSurahTrack(surahNumber, autoplay);
  });
  trackChangeQueue = operation.then(
    () => undefined,
    () => undefined,
  );
  return operation;
}

export function setupAudioPlayer(): Promise<void> {
  if (!setupPromise) {
    setupPromise = (async () => {
      await TrackPlayer.setupPlayer();
      await TrackPlayer.updateOptions({
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.Stop,
          Capability.SeekTo,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
        ],
        compactCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
        ],
        progressUpdateEventInterval: 1,
      });
      await TrackPlayer.setRepeatMode(RepeatMode.Off);
    })().catch((error: unknown) => {
      setupPromise = null;
      throw error;
    });
  }

  return setupPromise;
}

export function getSurahNumberFromTrack(
  track: Track | undefined,
): number | null {
  const match = /^alafasy-surah-(\d{3})$/.exec(String(track?.id ?? ''));

  if (!match) {
    return null;
  }

  const number = Number(match[1]);
  return number >= 1 && number <= 114 ? number : null;
}

export function getRepeatMode(): RepeatModeName {
  return repeatMode;
}

export async function setRepeatMode(
  mode: RepeatModeName,
): Promise<void> {
  const nativeMode = mode === 'one' ? RepeatMode.Track : RepeatMode.Off;
  await setupAudioPlayer();
  await TrackPlayer.setRepeatMode(nativeMode);
  repeatMode = mode;
  shuffleEnabled = false;
  shuffleBag = [];
  shuffleHistory = [];
}

export function getShuffleEnabled(): boolean {
  return shuffleEnabled;
}

function createShuffleBag(excludedSurah: number | null): number[] {
  const bag = surahs
    .map((surah) => surah.number)
    .filter((number) => number !== excludedSurah);

  for (let index = bag.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [bag[index], bag[randomIndex]] = [bag[randomIndex], bag[index]];
  }

  return bag;
}

export async function setShuffleEnabled(
  enabled: boolean,
  currentSurahNumber: number | null,
): Promise<void> {
  if (enabled) {
    await setupAudioPlayer();
    await TrackPlayer.setRepeatMode(RepeatMode.Off);
    repeatMode = 'off';
  }
  shuffleEnabled = enabled;
  shuffleHistory = [];
  shuffleBag = enabled ? createShuffleBag(currentSurahNumber) : [];
}

function getNextSurahNumber(currentNumber: number): number | null {
  if (shuffleEnabled) {
    if (shuffleBag.length === 0) {
      shuffleBag = createShuffleBag(currentNumber);
    }
    return shuffleBag.shift() ?? null;
  }

  if (currentNumber < 114) {
    return currentNumber + 1;
  }

  return repeatMode === 'all' ? 1 : null;
}

export async function replaceSurahTrack(
  surahNumber: number,
  autoplay = true,
): Promise<void> {
  const surah = surahs.find((item) => item.number === surahNumber);

  if (!surah) {
    throw new RangeError('Surah number must be between 1 and 114.');
  }

  if (!quranAudioAssets) {
    throw new Error('Offline Quran playback is only available on Android.');
  }

  // Prepare the next file before touching the active track. This lets the
  // current notification and media session stay alive while audio is copied.
  const audioUri = await quranAudioAssets.copySurahToCache(surahNumber);

  await TrackPlayer.load({
    id: `alafasy-surah-${surahNumber.toString().padStart(3, '0')}`,
    url: audioUri,
    title: surah.name,
    artist: 'Mishary Rashid Alafasy',
    album: 'The Holy Quran',
    description: surah.translation,
  });
  await TrackPlayer.setRepeatMode(
    repeatMode === 'one' ? RepeatMode.Track : RepeatMode.Off,
  );

  if (autoplay) {
    await TrackPlayer.play();
  }
}

export async function playSurah(surahNumber: number): Promise<void> {
  if (!Number.isInteger(surahNumber)) {
    throw new RangeError('Surah number must be an integer.');
  }

  await setupAudioPlayer();
  shuffleHistory = [];
  if (shuffleEnabled) {
    shuffleBag = createShuffleBag(surahNumber);
  }
  await enqueueTrackChange(surahNumber, false);
}

export async function restorePlaybackSession(
  session: PlaybackSession | null,
): Promise<{
  surahNumber: number | null;
  position: number;
  duration: number;
  playbackState: State;
}> {
  await setupAudioPlayer();

  if (session) {
    await setRepeatMode(session.repeatMode);
    if (session.shuffleEnabled) {
      await setShuffleEnabled(true, session.surahNumber);
    }
  }

  const [activeTrack, state, progress] = await Promise.all([
    TrackPlayer.getActiveTrack(),
    TrackPlayer.getPlaybackState(),
    TrackPlayer.getProgress(),
  ]);
  const activeSurahNumber = getSurahNumberFromTrack(activeTrack);

  if (activeSurahNumber !== null) {
    return {
      surahNumber: activeSurahNumber,
      position: progress.position,
      duration: progress.duration,
      playbackState: state.state,
    };
  }

  if (!session) {
    return {
      surahNumber: null,
      position: 0,
      duration: 0,
      playbackState: state.state,
    };
  }

  await enqueueTrackChange(session.surahNumber, false, false);
  const loadedProgress = await TrackPlayer.getProgress();
  await TrackPlayer.seekTo(
    loadedProgress.duration > 0
      ? Math.min(session.position, loadedProgress.duration)
      : session.position,
  );
  const restoredProgress = await TrackPlayer.getProgress();
  const restoredState = await TrackPlayer.getPlaybackState();

  return {
    surahNumber: session.surahNumber,
    position: restoredProgress.position,
    duration: restoredProgress.duration,
    playbackState: restoredState.state,
  };
}

export async function skipToNextSurah(): Promise<void> {
  const currentTrack = await TrackPlayer.getActiveTrack();
  const currentNumber = getSurahNumberFromTrack(currentTrack);

  if (currentNumber !== null) {
    const nextNumber = getNextSurahNumber(currentNumber);
    if (nextNumber !== null) {
      await enqueueTrackChange(nextNumber);
    }
  }
}

export async function skipToPreviousSurah(): Promise<void> {
  const currentTrack = await TrackPlayer.getActiveTrack();
  const currentNumber = getSurahNumberFromTrack(currentTrack);

  if (currentNumber === null) {
    return;
  }

  if (shuffleEnabled && shuffleHistory.length > 0) {
    const previousNumber = shuffleHistory.pop();
    if (previousNumber !== undefined) {
      await enqueueTrackChange(previousNumber, false);
    }
  } else if (currentNumber > 1) {
    await enqueueTrackChange(currentNumber - 1);
  } else if (repeatMode === 'all') {
    await enqueueTrackChange(114);
  }
}

export async function playFollowingSurah(
  endedTrack?: Track,
): Promise<void> {
  const currentTrack = endedTrack ?? (await TrackPlayer.getActiveTrack());
  const currentNumber = getSurahNumberFromTrack(currentTrack);

  const state = await TrackPlayer.getPlaybackState();
  if (state.state !== State.Ended || currentNumber === null) {
    return;
  }

  if (repeatMode === 'off' && !shuffleEnabled) {
    await TrackPlayer.seekTo(0);
    await TrackPlayer.pause();
    return;
  }

  const nextNumber = repeatMode === 'one' && !shuffleEnabled
    ? currentNumber
    : getNextSurahNumber(currentNumber);
  if (nextNumber !== null) {
    await enqueueTrackChange(nextNumber);
  }
}

export function logPlaybackServiceError(
  action: string,
  error: unknown,
): void {
  console.error(`Could not ${action} in the playback service:`, error);
}
