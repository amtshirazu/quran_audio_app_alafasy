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
  getSurahAssetUri(surahNumber: number): Promise<string>;
};

const quranAudioAssets = NativeModules.QuranAudioAssets as
  QuranAudioAssetsModule | undefined;

let setupPromise: Promise<void> | null = null;
let trackChangeQueue: Promise<void> = Promise.resolve();
let queuePreparation: Promise<void> = Promise.resolve();
let handlingQueueEnd = false;
let queuedNextForTrack: { currentId: string; nextNumber: number } | null = null;
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
  await TrackPlayer.removeUpcomingTracks();
  queuedNextForTrack = null;
  await TrackPlayer.setRepeatMode(nativeMode);
  repeatMode = mode;
  shuffleEnabled = false;
  shuffleBag = [];
  shuffleHistory = [];

  if (mode === 'all') {
    const currentTrack = await TrackPlayer.getActiveTrack();
    const currentNumber = getSurahNumberFromTrack(currentTrack);
    if (currentNumber !== null) {
      await queueFollowingSurah(currentTrack);
    }
  }
}

export function getShuffleEnabled(): boolean {
  return shuffleEnabled;
}

export function recordAutomaticSurahChange(previousTrack?: Track): void {
  if (!shuffleEnabled) {
    return;
  }

  const previousNumber = getSurahNumberFromTrack(previousTrack);
  if (
    previousNumber !== null &&
    shuffleHistory[shuffleHistory.length - 1] !== previousNumber
  ) {
    shuffleHistory.push(previousNumber);
  }
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
    await TrackPlayer.removeUpcomingTracks();
    queuedNextForTrack = null;
    await TrackPlayer.setRepeatMode(RepeatMode.Off);
    repeatMode = 'off';
  } else {
    await TrackPlayer.removeUpcomingTracks();
    queuedNextForTrack = null;
  }
  shuffleEnabled = enabled;
  shuffleHistory = [];
  shuffleBag = enabled ? createShuffleBag(currentSurahNumber) : [];

  if (enabled && currentSurahNumber !== null) {
    const currentTrack = await TrackPlayer.getActiveTrack();
    await queueFollowingSurah(currentTrack);
  }
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

function trackIdForSurah(surahNumber: number): string {
  return `alafasy-surah-${surahNumber.toString().padStart(3, '0')}`;
}

function createSurahTrack(surahNumber: number, audioUri: string): Track {
  const surah = surahs.find((item) => item.number === surahNumber);
  if (!surah) {
    throw new RangeError('Surah number must be between 1 and 114.');
  }

  return {
    id: trackIdForSurah(surahNumber),
    url: audioUri,
    title: surah.name,
    artist: 'Mishary Rashid Alafasy',
    album: 'The Holy Quran',
    description: surah.translation,
  };
}

/** Queue the upcoming Surah while the current one is still playing. */
export function queueFollowingSurah(currentTrack?: Track): Promise<void> {
  if (!currentTrack || (repeatMode !== 'all' && !shuffleEnabled)) {
    return Promise.resolve();
  }

  const currentNumber = getSurahNumberFromTrack(currentTrack);
  if (currentNumber === null) {
    return Promise.resolve();
  }

  const operation = queuePreparation.then(async () => {
    if (queuedNextForTrack?.currentId === String(currentTrack.id)) {
      return;
    }

    const activeTrack = await TrackPlayer.getActiveTrack();
    if (String(activeTrack?.id ?? '') !== String(currentTrack.id)) {
      return;
    }

    const nextNumber = getNextSurahNumber(currentNumber);
    if (nextNumber === null) {
      return;
    }

    const queue = await TrackPlayer.getQueue();
    const activeIndex = queue.findIndex(
      (track) => String(track.id) === String(currentTrack.id),
    );
    const nextTrackId = trackIdForSurah(nextNumber);
    if (
      activeIndex >= 0 &&
      queue.slice(activeIndex + 1).some(
        (track) => String(track.id) === nextTrackId,
      )
    ) {
      queuedNextForTrack = {
        currentId: String(currentTrack.id),
        nextNumber,
      };
      return;
    }

    if (!quranAudioAssets) {
      throw new Error('Offline Quran playback is only available on Android.');
    }

    const audioUri = await quranAudioAssets.getSurahAssetUri(nextNumber);
    await TrackPlayer.add(createSurahTrack(nextNumber, audioUri));
    queuedNextForTrack = {
      currentId: String(currentTrack.id),
      nextNumber,
    };
  });

  queuePreparation = operation.then(
    () => undefined,
    () => undefined,
  );
  return operation;
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

  // Read the install-time asset directly instead of copying a full MP3 into
  // the cache before every track change.
  const audioUri = await quranAudioAssets.getSurahAssetUri(surahNumber);

  queuedNextForTrack = null;
  await TrackPlayer.load(createSurahTrack(surahNumber, audioUri));
  await TrackPlayer.setRepeatMode(
    repeatMode === 'one' ? RepeatMode.Track : RepeatMode.Off,
  );

  if (autoplay) {
    await TrackPlayer.play();
  }

  const activeTrack = await TrackPlayer.getActiveTrack();
  queueFollowingSurah(activeTrack).catch((error: unknown) => {
    logPlaybackServiceError('prepare the next surah', error);
  });
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
    if (
      currentTrack &&
      queuedNextForTrack?.currentId === String(currentTrack.id)
    ) {
      await TrackPlayer.skipToNext();
      return;
    }

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
  if (handlingQueueEnd) {
    return;
  }

  handlingQueueEnd = true;
  try {
    // PlaybackQueueEnded is the authoritative signal that the active Surah
    // has ended. The native state may already have moved away from Ended by
    // the time this headless playback-service callback is handled.
    const currentTrack = endedTrack ?? (await TrackPlayer.getActiveTrack());
    const currentNumber = getSurahNumberFromTrack(currentTrack);

    if (currentNumber === null) {
      return;
    }

    if (repeatMode === 'off' && !shuffleEnabled) {
      await TrackPlayer.pause();
      await TrackPlayer.seekTo(0);
      return;
    }

    const nextNumber = repeatMode === 'one' && !shuffleEnabled
      ? currentNumber
      : getNextSurahNumber(currentNumber);
    if (nextNumber !== null) {
      await new Promise<void>((resolve) => setTimeout(resolve, 250));
      await enqueueTrackChange(nextNumber);
    }
  } finally {
    handlingQueueEnd = false;
  }
}

export function logPlaybackServiceError(
  action: string,
  error: unknown,
): void {
  console.error(`Could not ${action} in the playback service:`, error);
}
