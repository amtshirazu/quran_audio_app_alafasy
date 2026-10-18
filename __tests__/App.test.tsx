/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('react-native-track-player', () => ({
  __esModule: true,
  default: {
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    getActiveTrack: jest.fn(async () => undefined),
    getPlaybackState: jest.fn(async () => ({ state: 'none' })),
    getProgress: jest.fn(async () => ({
      position: 0,
      duration: 0,
    })),
    setRepeatMode: jest.fn(async () => 0),
    setupPlayer: jest.fn(async () => undefined),
    updateOptions: jest.fn(async () => undefined),
  },
  Event: {
    PlaybackActiveTrackChanged: 'playback-active-track-changed',
    PlaybackError: 'playback-error',
    PlaybackProgressUpdated: 'playback-progress-updated',
    PlaybackQueueEnded: 'playback-queue-ended',
    PlaybackState: 'playback-state',
  },
  State: {
    Buffering: 'buffering',
    Error: 'error',
    Loading: 'loading',
    None: 'none',
    Playing: 'playing',
    Stopped: 'stopped',
  },
}));

jest.mock('lucide-react-native', () => new Proxy({}, {
  get: (_target, property) =>
    property === '__esModule' ? false : () => null,
}));

import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
