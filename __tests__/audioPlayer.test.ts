jest.mock('react-native', () => {
  return {
    NativeModules: {
      QuranAudioAssets: {
        copySurahToCache: jest.fn(),
      },
    },
  };
});

jest.mock('react-native-track-player', () => ({
  __esModule: true,
  default: {
    add: jest.fn(),
    getActiveTrack: jest.fn(),
    getPlaybackState: jest.fn(),
    getProgress: jest.fn(),
    play: jest.fn(),
    pause: jest.fn(),
    reset: jest.fn(),
    seekTo: jest.fn(),
    setRepeatMode: jest.fn(),
    setupPlayer: jest.fn(),
    updateOptions: jest.fn(),
  },
  Capability: {
    Pause: 'pause',
    Play: 'play',
    SeekTo: 'seek',
    SkipToNext: 'next',
    SkipToPrevious: 'previous',
    Stop: 'stop',
  },
  RepeatMode: {
    Off: 0,
    Track: 1,
  },
  State: {
    Ended: 'ended',
    Playing: 'playing',
  },
}));

import type { Track } from 'react-native-track-player';

import {
  getRepeatMode,
  getShuffleEnabled,
  playFollowingSurah,
  playSurah,
  restorePlaybackSession,
  setRepeatMode,
  setShuffleEnabled,
  skipToNextSurah,
  skipToPreviousSurah,
} from '../src/services/audioPlayer';

const trackPlayerMock = jest.requireMock('react-native-track-player')
  .default as {
    add: jest.Mock;
    getActiveTrack: jest.Mock;
    getPlaybackState: jest.Mock;
    getProgress: jest.Mock;
    play: jest.Mock;
    pause: jest.Mock;
    reset: jest.Mock;
    seekTo: jest.Mock;
    setRepeatMode: jest.Mock;
    setupPlayer: jest.Mock;
    updateOptions: jest.Mock;
  };
const mockCopySurahToCache = jest.requireMock('react-native')
  .NativeModules.QuranAudioAssets.copySurahToCache as jest.Mock;

type MockTrack = Track & { id: string };

let activeTrack: MockTrack | undefined;
let playbackState: string;

function trackFor(surahNumber: number): MockTrack {
  return {
    id: `alafasy-surah-${String(surahNumber).padStart(3, '0')}`,
    url: `file:///surah-${surahNumber}.mp3`,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  activeTrack = undefined;
  playbackState = 'playing';

  mockCopySurahToCache.mockImplementation(async (surahNumber: number) =>
    `file:///surah-${surahNumber}.mp3`,
  );
  trackPlayerMock.setupPlayer.mockResolvedValue(undefined);
  trackPlayerMock.updateOptions.mockResolvedValue(undefined);
  trackPlayerMock.setRepeatMode.mockResolvedValue(0);
  trackPlayerMock.getActiveTrack.mockImplementation(async () => activeTrack);
  trackPlayerMock.getPlaybackState.mockImplementation(async () => ({
    state: playbackState,
  }));
  trackPlayerMock.getProgress.mockResolvedValue({
    position: 1,
    duration: 50,
  });
  trackPlayerMock.reset.mockImplementation(async () => {
    activeTrack = undefined;
    playbackState = 'stopped';
  });
  trackPlayerMock.add.mockImplementation(async (tracks) => {
    const track = Array.isArray(tracks) ? tracks[0] : tracks;
    if (!track || typeof track.id !== 'string') {
      throw new Error('Expected a surah track to be added.');
    }
    activeTrack = { ...track, id: track.id };
  });
  trackPlayerMock.play.mockImplementation(async () => {
    playbackState = 'playing';
  });
  trackPlayerMock.pause.mockImplementation(async () => {
    playbackState = 'paused';
  });
});

test('Previous immediately selects the preceding surah regardless of playback position', async () => {
  activeTrack = trackFor(2);

  await skipToPreviousSurah();

  expect(trackPlayerMock.seekTo).not.toHaveBeenCalled();
  expect(trackPlayerMock.add).toHaveBeenCalledWith(
    expect.objectContaining({ id: 'alafasy-surah-001' }),
  );
});

test('shuffle and repeat modes are mutually exclusive', async () => {
  await setRepeatMode('all');
  await setShuffleEnabled(true, 1);

  expect(getRepeatMode()).toBe('off');
  expect(getShuffleEnabled()).toBe(true);

  await setRepeatMode('one');

  expect(getRepeatMode()).toBe('one');
  expect(getShuffleEnabled()).toBe(false);
});

test('shuffle automatically advances to a different surah on completion', async () => {
  await setShuffleEnabled(true, 1);
  activeTrack = trackFor(1);
  playbackState = 'ended';

  await playFollowingSurah();

  const nextTrack = trackPlayerMock.add.mock.calls.at(-1)?.[0] as
    | { id: string }
    | undefined;
  expect(nextTrack?.id).not.toBe('alafasy-surah-001');
  expect(trackPlayerMock.play).toHaveBeenCalled();
});

test('Previous follows shuffle history after a shuffled surah starts', async () => {
  await setShuffleEnabled(true, 1);
  activeTrack = trackFor(1);
  playbackState = 'ended';

  await playFollowingSurah();
  await skipToPreviousSurah();

  expect(trackPlayerMock.add).toHaveBeenLastCalledWith(
    expect.objectContaining({ id: 'alafasy-surah-001' }),
  );
});

test('Repeat Off keeps the ended surah selected and paused at the beginning', async () => {
  await setRepeatMode('off');
  activeTrack = trackFor(7);
  playbackState = 'ended';

  await playFollowingSurah();

  expect(trackPlayerMock.seekTo).toHaveBeenCalledWith(0);
  expect(trackPlayerMock.pause).toHaveBeenCalled();
  expect(trackPlayerMock.add).not.toHaveBeenCalled();
});

test('Repeat One replays the same surah on completion', async () => {
  await setRepeatMode('one');
  activeTrack = trackFor(7);
  playbackState = 'ended';

  await playFollowingSurah();

  expect(trackPlayerMock.add).toHaveBeenCalledWith(
    expect.objectContaining({ id: 'alafasy-surah-007' }),
  );
  expect(trackPlayerMock.play).toHaveBeenCalled();
});

test('Repeat All advances to the next surah and wraps after Surah 114', async () => {
  await setRepeatMode('all');
  activeTrack = trackFor(113);
  playbackState = 'ended';

  await playFollowingSurah();
  expect(trackPlayerMock.add).toHaveBeenLastCalledWith(
    expect.objectContaining({ id: 'alafasy-surah-114' }),
  );

  activeTrack = trackFor(114);
  playbackState = 'ended';
  await playFollowingSurah();

  expect(trackPlayerMock.add).toHaveBeenLastCalledWith(
    expect.objectContaining({ id: 'alafasy-surah-001' }),
  );
});

test('Repeat Off does not advance past Surah 114 when Next is pressed', async () => {
  await setRepeatMode('off');
  activeTrack = trackFor(114);

  await skipToNextSurah();

  expect(trackPlayerMock.add).not.toHaveBeenCalled();
});

test('selecting a surah loads it into the player', async () => {
  await playSurah(36);

  expect(mockCopySurahToCache).toHaveBeenCalledWith(36);
  expect(trackPlayerMock.add).toHaveBeenCalledWith(
    expect.objectContaining({ id: 'alafasy-surah-036' }),
  );
  expect(trackPlayerMock.play).toHaveBeenCalled();
});

test('restores a saved surah and position without starting playback', async () => {
  const session = {
    surahNumber: 42,
    position: 123.5,
    repeatMode: 'all',
    shuffleEnabled: false,
  } as const;

  const restored = await restorePlaybackSession(session);

  expect(trackPlayerMock.add).toHaveBeenCalledWith(
    expect.objectContaining({ id: 'alafasy-surah-042' }),
  );
  expect(trackPlayerMock.seekTo).toHaveBeenCalledWith(50);
  expect(trackPlayerMock.play).not.toHaveBeenCalled();
  expect(restored.surahNumber).toBe(42);
  expect(getRepeatMode()).toBe('all');
});

test('keeps the active native track and position when restoring the app', async () => {
  activeTrack = trackFor(12);
  playbackState = 'playing';
  trackPlayerMock.getProgress.mockResolvedValue({
    position: 88,
    duration: 240,
  });

  const restored = await restorePlaybackSession({
    surahNumber: 42,
    position: 123.5,
    repeatMode: 'off',
    shuffleEnabled: false,
  });

  expect(restored).toMatchObject({
    surahNumber: 12,
    position: 88,
    duration: 240,
    playbackState: 'playing',
  });
  expect(trackPlayerMock.reset).not.toHaveBeenCalled();
  expect(trackPlayerMock.seekTo).not.toHaveBeenCalled();
});
