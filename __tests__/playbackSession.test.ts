jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

import {
  parsePlaybackSession,
  readPlaybackSession,
  writePlaybackSession,
} from '../src/services/playbackSession';

const asyncStorageMock = jest.requireMock(
  '@react-native-async-storage/async-storage',
) as {
  getItem: jest.Mock;
  setItem: jest.Mock;
};

beforeEach(() => {
  jest.clearAllMocks();
});

test('round-trips a valid playback session', async () => {
  const session = {
    surahNumber: 18,
    position: 142.25,
    repeatMode: 'all',
    shuffleEnabled: false,
  } as const;

  asyncStorageMock.getItem.mockResolvedValue(JSON.stringify(session));

  await expect(readPlaybackSession()).resolves.toEqual(session);
  await writePlaybackSession(session);

  expect(asyncStorageMock.setItem).toHaveBeenCalledWith(
    'alafasy_playback_session',
    JSON.stringify(session),
  );
});

test('ignores out-of-range surah numbers and invalid playback positions', () => {
  const warning = jest.spyOn(console, 'warn').mockImplementation(() => {});

  expect(parsePlaybackSession(JSON.stringify({
    surahNumber: 115,
    position: 0,
    repeatMode: 'off',
    shuffleEnabled: false,
  }))).toBeNull();

  expect(parsePlaybackSession(JSON.stringify({
    surahNumber: 18,
    position: Number.NaN,
    repeatMode: 'off',
    shuffleEnabled: false,
  }))).toBeNull();

  expect(warning).toHaveBeenCalledTimes(2);
  warning.mockRestore();
});

test('ignores malformed persisted JSON with a warning', () => {
  const warning = jest.spyOn(console, 'warn').mockImplementation(() => {});

  expect(parsePlaybackSession('{')).toBeNull();
  expect(warning).toHaveBeenCalledWith(
    'Ignoring invalid saved Quran playback session:',
    expect.any(SyntaxError),
  );

  warning.mockRestore();
});
