import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type GestureResponderEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BookOpen,
  ChevronDown,
  Music2,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
} from 'lucide-react-native';

import { useAudioPlayer } from '../context/AudioPlayerContext';
import { useTheme } from '../context/ThemeContext';
import type { AppColors } from '../theme/theme';
import Text from './AppText';
import { useLocalization } from '../context/LocalizationContext';

export default function AudioPlayerOverlay() {
  const player = useAudioPlayer();
  const { t } = useLocalization();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [seekBarWidth, setSeekBarWidth] = useState(0);

  function runAction(
    action: () => Promise<void>,
    title: string,
  ) {
    action().catch((error: unknown) => {
      Alert.alert(
        title,
        error instanceof Error ? error.message : String(error),
      );
    });
  }

  function updateSeekBarLayout(event: LayoutChangeEvent) {
    setSeekBarWidth(event.nativeEvent.layout.width);
  }

  function seekToPosition(event: GestureResponderEvent) {
    if (seekBarWidth <= 0 || player.duration <= 0) {
      return;
    }

    const fraction = Math.min(
      Math.max(event.nativeEvent.locationX / seekBarWidth, 0),
      1,
    );
    runAction(
      () => player.seekTo(fraction * player.duration),
      t('Could not seek in this surah'),
    );
  }

  if (!player.currentSurah) {
    return null;
  }

  const progress =
    player.duration > 0
      ? Math.min(player.position / player.duration, 1)
      : 0;

  return (
    <>
      <View style={styles.miniPlayer}>
        <Pressable
          style={styles.miniInfo}
          onPress={player.openPlayer}
          accessibilityRole="button"
          accessibilityLabel={`${t('Open player')}: ${player.currentSurah.name}`}
        >
          <View style={styles.miniArtwork}>
            <Music2 size={20} color={colors.gold} />
          </View>
          <View style={styles.miniText}>
            <Text style={styles.miniTitle} numberOfLines={1}>
              {player.currentSurah.name}
            </Text>
            <Text style={styles.miniSubtitle} numberOfLines={1}>
              Mishary Rashid Alafasy
            </Text>
          </View>
        </Pressable>

        <Pressable
          style={styles.miniControl}
          onPress={() =>
            runAction(player.togglePlayback, t('Playback control failed'))
          }
          disabled={player.isLoading}
          accessibilityRole="button"
          accessibilityLabel={player.isPlaying ? t('Pause audio') : t('Play audio')}
        >
          {player.isLoading ? (
            <ActivityIndicator color={colors.text} />
          ) : player.isPlaying ? (
            <Pause size={22} color={colors.text} fill={colors.text} />
          ) : (
            <Play size={22} color={colors.text} fill={colors.text} />
          )}
        </Pressable>
      </View>

      <Modal
        visible={player.isPlayerVisible}
        animationType="slide"
        onRequestClose={player.closePlayer}
      >
        <SafeAreaView
          style={styles.playerScreen}
          edges={['top', 'bottom', 'left', 'right']}
        >
          <View style={styles.modalHeader}>
            <Pressable
              style={styles.closeButton}
              onPress={player.closePlayer}
              accessibilityRole="button"
              accessibilityLabel={t('Close player')}
            >
              <ChevronDown size={24} color={colors.text} />
            </Pressable>
            <Text style={styles.modalHeaderTitle}>{t('NOW PLAYING')}</Text>
            <View style={styles.closeButtonSpacer} />
          </View>

          <View style={styles.playerContent}>
            <View style={styles.coverArtwork}>
              <View style={styles.coverRing}>
                <BookOpen size={62} color={colors.gold} strokeWidth={1.4} />
              </View>
            </View>

            <Text style={styles.arabicName}>
              {player.currentSurah.arabic}
            </Text>
            <Text style={styles.surahName}>
              {player.currentSurah.name}
            </Text>
            <Text style={styles.translation}>
              {t('Surah')} {player.currentSurah.number} ·{' '}
              {t(player.currentSurah.translation)}
            </Text>
            <Text style={styles.reciter}>Mishary Rashid Alafasy</Text>

            {player.playbackError ? (
              <Text style={styles.errorText}>{player.playbackError}</Text>
            ) : null}

            <View style={styles.progressSection}>
              <Pressable
                style={styles.progressTrack}
                onLayout={updateSeekBarLayout}
                onPress={seekToPosition}
                accessibilityRole="button"
                accessibilityLabel={t('Seek playback')}
              >
                <View
                  style={[
                    styles.progressFill,
                    { width: `${progress * 100}%` },
                  ]}
                />
              </Pressable>
              <View style={styles.timeLabels}>
                <Text style={styles.timeText}>
                  {formatTime(player.position)}
                </Text>
                <Text style={styles.timeText}>
                  {formatTime(player.duration)}
                </Text>
              </View>
            </View>

            <View style={styles.controls}>
              <Pressable
                style={styles.skipButton}
                onPress={() =>
                  runAction(
                    player.skipToPreviousSurah,
                    t('Could not play the previous surah'),
                  )
                }
                disabled={player.isLoading}
                accessibilityRole="button"
                accessibilityLabel={t('Previous surah')}
              >
                <SkipBack size={25} color={colors.text} fill={colors.text} />
              </Pressable>

              <Pressable
                style={styles.mainControl}
                onPress={() =>
                  runAction(player.togglePlayback, t('Playback control failed'))
                }
                disabled={player.isLoading}
                accessibilityRole="button"
                accessibilityLabel={
                  player.isPlaying ? t('Pause playback') : t('Start playback')
                }
              >
                {player.isLoading ? (
                  <ActivityIndicator color={colors.white} size="large" />
                ) : player.isPlaying ? (
                  <Pause size={28} color={colors.white} fill={colors.white} />
                ) : (
                  <Play size={28} color={colors.white} fill={colors.white} />
                )}
              </Pressable>

              <Pressable
                style={styles.skipButton}
                onPress={() =>
                  runAction(
                    player.skipToNextSurah,
                    t('Could not play the next surah'),
                  )
                }
                disabled={player.isLoading}
                accessibilityRole="button"
                accessibilityLabel={t('Next surah')}
              >
                <SkipForward
                  size={25}
                  color={colors.text}
                  fill={colors.text}
                />
              </Pressable>
            </View>

            <View style={styles.modeControls}>
              <Pressable
                style={[
                  styles.modeButton,
                  player.shuffleEnabled && styles.modeButtonActive,
                ]}
                onPress={() =>
                  runAction(
                    () => player.setShuffleEnabled(!player.shuffleEnabled),
                    t('Could not change shuffle mode'),
                  )
                }
                accessibilityRole="button"
                accessibilityLabel={`${t('Shuffle')} ${t(player.shuffleEnabled ? 'on' : 'off')}`}
                accessibilityState={{ selected: player.shuffleEnabled }}
              >
                <Shuffle
                  size={18}
                  color={player.shuffleEnabled ? colors.emerald : colors.muted}
                />
                <Text
                  style={[
                    styles.modeButtonText,
                    player.shuffleEnabled && styles.modeButtonTextActive,
                  ]}
                >
                  {t('Shuffle')}
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.modeButton,
                  !player.shuffleEnabled && styles.modeButtonActive,
                ]}
                onPress={() => {
                  const nextMode = player.repeatMode === 'off'
                    ? 'one'
                    : player.repeatMode === 'one'
                      ? 'all'
                      : 'off';
                  runAction(
                    () => player.setRepeatMode(nextMode),
                    t('Could not change repeat mode'),
                  );
                }}
                accessibilityRole="button"
                accessibilityLabel={`${t('Repeat')} ${t(player.repeatMode)}`}
                accessibilityHint={t('Cycles between repeat off, repeat one, and repeat all')}
                accessibilityState={{
                  selected: !player.shuffleEnabled,
                }}
              >
                {player.repeatMode === 'one' ? (
                  <Repeat1
                    size={18}
                    color={player.shuffleEnabled ? colors.muted : colors.emerald}
                  />
                ) : (
                  <Repeat
                    size={18}
                    color={player.shuffleEnabled ? colors.muted : colors.emerald}
                  />
                )}
                <Text
                  style={[
                    styles.modeButtonText,
                    !player.shuffleEnabled && styles.modeButtonTextActive,
                  ]}
                >
                  {`${t('Repeat')} ${t(player.repeatMode)}`}
                </Text>
              </Pressable>
            </View>

          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }

  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainder = totalSeconds % 60;
  const formattedRemainder = String(remainder).padStart(2, '0');

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${formattedRemainder}`;
  }

  return `${minutes}:${formattedRemainder}`;
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    miniPlayer: {
      position: 'absolute',
      left: 14,
      right: 14,
      bottom: 72,
      minHeight: 64,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 18,
      elevation: 8,
      zIndex: 10,
    },
    miniInfo: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 11,
      paddingVertical: 8,
    },
    miniArtwork: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.emerald,
    },
    miniText: {
      flex: 1,
    },
    miniTitle: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '700',
    },
    miniSubtitle: {
      color: colors.muted,
      fontSize: 10,
      marginTop: 3,
    },
    miniControl: {
      width: 48,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
    },
    playerScreen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    modalHeader: {
      height: 54,
      paddingHorizontal: 22,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    closeButton: {
      width: 42,
      height: 42,
      alignItems: 'flex-start',
      justifyContent: 'center',
    },
    closeButtonSpacer: {
      width: 42,
    },
    modalHeaderTitle: {
      color: colors.muted,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1.7,
    },
    playerContent: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 30,
      paddingBottom: 24,
    },
    coverArtwork: {
      width: 230,
      height: 230,
      borderRadius: 36,
      backgroundColor: colors.emerald,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 34,
    },
    coverRing: {
      width: 150,
      height: 150,
      borderWidth: 1,
      borderColor: colors.gold,
      borderRadius: 75,
      alignItems: 'center',
      justifyContent: 'center',
    },
    arabicName: {
      color: colors.gold,
      fontSize: 30,
      marginBottom: 8,
    },
    surahName: {
      color: colors.text,
      fontSize: 25,
      fontWeight: '700',
      textAlign: 'center',
    },
    translation: {
      color: colors.muted,
      fontSize: 13,
      marginTop: 7,
      textAlign: 'center',
    },
    reciter: {
      color: colors.secondaryText,
      fontSize: 13,
      marginTop: 6,
    },
    errorText: {
      color: '#C53F3F',
      fontSize: 12,
      marginTop: 14,
      textAlign: 'center',
    },
    progressSection: {
      width: '100%',
      marginTop: 38,
    },
    progressTrack: {
      width: '100%',
      height: 6,
      borderRadius: 3,
      overflow: 'hidden',
      backgroundColor: colors.border,
    },
    progressFill: {
      height: '100%',
      borderRadius: 3,
      backgroundColor: colors.gold,
    },
    timeLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 9,
    },
    timeText: {
      color: colors.muted,
      fontSize: 11,
      fontVariant: ['tabular-nums'],
    },
    controls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 30,
      marginTop: 30,
    },
    modeControls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 14,
      marginTop: 20,
    },
    modeButton: {
      minWidth: 112,
      height: 38,
      paddingHorizontal: 12,
      borderRadius: 21,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
    },
    modeButtonActive: {
      backgroundColor: colors.softGreen,
      borderColor: colors.emeraldLight,
    },
    modeButtonText: {
      color: colors.muted,
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'capitalize',
    },
    modeButtonTextActive: {
      color: colors.emerald,
    },
    skipButton: {
      width: 48,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
    },
    mainControl: {
      width: 62,
      height: 62,
      borderRadius: 31,
      backgroundColor: colors.emerald,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
