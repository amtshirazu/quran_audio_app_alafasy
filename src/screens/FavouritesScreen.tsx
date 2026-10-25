
import React from 'react';
import {
  Alert,
  View,
  Pressable,
  FlatList,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Pause, Play, BookOpen } from 'lucide-react-native';

import { surahs } from '../data/surahs';
import { useFavourites } from '../context/FavouritesContext';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { useTheme } from '../context/ThemeContext';
import type { AppColors } from '../theme/theme';
import Text from '../components/AppText';
import { useLocalization } from '../context/LocalizationContext';

export default function FavouritesScreen() {
  const { favourites, toggleFavourite } = useFavourites();
  const { t } = useLocalization();
  const audioPlayer = useAudioPlayer();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const favouriteSurahs = favourites.flatMap((number) => {
    const surah = surahs.find((item) => item.number === number);
    return surah ? [surah] : [];
  });

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'left', 'right']}
    >
      <View style={styles.header}>
        <View style={styles.headingIcon}>
          <Heart size={23} color={colors.gold} />
        </View>

        <View style={styles.headingText}>
          <Text style={styles.eyebrow}>{t('YOUR COLLECTION')}</Text>
          <Text style={styles.title}>{t('Favourites')}</Text>
          <Text style={styles.subtitle}>{t('Your saved recitations, ready whenever you return.')}</Text>
        </View>
      </View>

      <View style={styles.listHeading}>
        <Text style={styles.listTitle}>{t('Saved Surahs')}</Text>
        <Text style={styles.count}>
          {favouriteSurahs.length} {t('saved')}
        </Text>
      </View>

      <FlatList
        data={favouriteSurahs}
        keyExtractor={(item) => String(item.number)}
        contentContainerStyle={[
          styles.listContent,
          favouriteSurahs.length === 0 && styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.surahRow}>
            <View style={styles.numberBox}>
              <Text style={styles.numberText}>
                {String(item.number).padStart(2, '0')}
              </Text>
            </View>

            <View style={styles.surahInfo}>
              <Text style={styles.surahName}>{item.name}</Text>
              <Text style={styles.surahMeta}>{t(item.translation)}</Text>
            </View>

            <Pressable
              style={styles.actionButton}
              onPress={() => toggleFavourite(item.number)}
              accessibilityRole="button"
              accessibilityLabel={`${t('Remove from favourites')}: ${item.name}`}
            >
              <Heart
                size={19}
                color={colors.gold}
                fill={colors.gold}
              />
            </Pressable>

            <Pressable
              style={styles.playButton}
              onPress={() => {
                const action =
                  audioPlayer.currentSurah?.number === item.number
                    ? audioPlayer.togglePlayback()
                    : audioPlayer.playSurah(item.number);
                action.catch((error: unknown) => {
                  Alert.alert(
                    t('Could not play this surah'),
                    error instanceof Error ? error.message : String(error),
                  );
                });
              }}
              accessibilityRole="button"
              accessibilityLabel={`${t('Play')} ${item.name}`}
              disabled={audioPlayer.isLoading}
            >
              {audioPlayer.currentSurah?.number === item.number &&
              audioPlayer.isPlaying ? (
                <Pause size={15} color={colors.white} fill={colors.white} />
              ) : (
                <Play size={15} color={colors.white} fill={colors.white} />
              )}
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <BookOpen size={30} color={colors.gold} />
            </View>

            <Text style={styles.emptyTitle}>{t('No saved surahs yet')}</Text>

            <Text style={styles.emptySubtitle}>{t('Tap the heart beside a surah in the library to save it for convenient listening.')}</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 20,
    gap: 14,
  },
  headingIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: colors.emerald,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingText: {
    flex: 1,
  },
  eyebrow: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  title: {
    color: colors.text,
    fontSize: 25,
    fontWeight: '700',
    marginTop: 2,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 4,
  },
  listHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 22,
    marginTop: 8,
    marginBottom: 12,
  },
  listTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  count: {
    color: colors.muted,
    fontSize: 12,
  },
  listContent: {
    paddingHorizontal: 22,
    paddingBottom: 150,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  surahRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 68,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 9,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 17,
    gap: 10,
  },
  numberBox: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: colors.softGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  surahInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  surahName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  surahMeta: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 4,
  },
  arabicName: {
    color: colors.text,
    fontSize: 15,
  },
  actionButton: {
    width: 32,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.emerald,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 50,
  },
  emptyIcon: {
    width: 76,
    height: 76,
    borderRadius: 25,
    backgroundColor: colors.emerald,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 10,
  },
  });
}
