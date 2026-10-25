
import TrackPlayer, {
  Event,
} from 'react-native-track-player';

import {
  logPlaybackServiceError,
  queueFollowingSurah,
  recordAutomaticSurahChange,
  playFollowingSurah,
  skipToNextSurah,
  skipToPreviousSurah,
} from './audioPlayer';

async function runServiceAction(
  actionName: string,
  action: () => Promise<void>,
): Promise<void> {
  try {
    await action();
  } catch (error) {
    logPlaybackServiceError(actionName, error);
  }
}

export async function playbackService() {
  TrackPlayer.addEventListener(
    Event.RemotePlay,
    () => runServiceAction('resume playback', () => TrackPlayer.play()),
  );

  TrackPlayer.addEventListener(
    Event.RemotePause,
    () => runServiceAction('pause playback', () => TrackPlayer.pause()),
  );

  TrackPlayer.addEventListener(
    Event.RemoteStop,
    () => runServiceAction('stop playback', () => TrackPlayer.stop()),
  );

  TrackPlayer.addEventListener(
    Event.RemoteNext,
    () => {
      return runServiceAction('play the next surah', skipToNextSurah);
    },
  );

  TrackPlayer.addEventListener(
    Event.RemotePrevious,
    () => {
      return runServiceAction('play the previous surah', skipToPreviousSurah);
    },
  );

  TrackPlayer.addEventListener(
    Event.RemoteSeek,
    (event) => runServiceAction(
        'seek playback',
        () => TrackPlayer.seekTo(event.position),
      ),
  );

  TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, (event) => {
    recordAutomaticSurahChange(event.lastTrack);
    return runServiceAction(
      'prepare the next surah',
      () => queueFollowingSurah(event.track),
    );
  });

  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, (event) => {
    return runServiceAction(
      'apply the selected repeat mode',
      async () => {
        const endedTrack = await TrackPlayer.getTrack(event.track);
        await playFollowingSurah(endedTrack);
      },
    );
  });
}
