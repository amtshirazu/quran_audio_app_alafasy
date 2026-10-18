
import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Pressable,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Clock3,
  Heart,
  Music2,
  Pause,
  Play,
  Search,
} from 'lucide-react-native';

import { useTheme } from '../context/ThemeContext';
import Text from '../components/AppText';
import { useFavourites } from '../context/FavouritesContext';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { surahs } from '../data/surahs';
import { surahDurations } from '../data/surahDurations';
import type { AppColors } from '../theme/theme';
import { useLocalization } from '../context/LocalizationContext';

type HomeScreenProps = {
  onOpenSurahs: () => void;
};

function chooseFeaturedSurahs() {
  const pool = [...surahs];
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }
  return pool.slice(0, 3);
}

export default function HomeScreen({
  onOpenSurahs,
}: HomeScreenProps) {
  const { colors } = useTheme();
  const { t } = useLocalization();
  const [featuredSurahs] = useState(chooseFeaturedSurahs);
  const styles = createStyles(colors);
  const { toggleFavourite, isFavourite } = useFavourites();
  const audioPlayer = useAudioPlayer();
  const isPlaying = audioPlayer.isPlaying;
  const currentSurah = audioPlayer.currentSurah ?? surahs[0];
  const hasCurrentSurah = audioPlayer.currentSurah !== null;
  const progressWidth =
    audioPlayer.duration > 0
      ? `${Math.min(audioPlayer.position / audioPlayer.duration, 1) * 100}%`
      : '0%';

  function selectSurah(surahNumber: number) {
    audioPlayer.playSurah(surahNumber).catch((error: unknown) => {
      Alert.alert(
        t('Could not play this surah'),
        error instanceof Error ? error.message : String(error),
      );
    });
  }

  function toggleCurrentPlayback() {
    const action = audioPlayer.currentSurah
      ? audioPlayer.togglePlayback()
      : audioPlayer.playSurah(currentSurah.number);
    action.catch((error: unknown) => {
      Alert.alert(
        t('Playback control failed'),
        error instanceof Error ? error.message : String(error),
      );
    });
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'left', 'right']}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 1. Welcome header */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.brandIcon}>
              <BookOpen size={22} color={colors.gold} />
            </View>

            <View>
              <Text style={styles.brandName}>ALAFASY QURAN</Text>
              <Text style={styles.brandSubtitle}>{t('A moment of tranquillity')}</Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('Search surahs')}
            style={styles.iconButton}
            onPress={onOpenSurahs}
          >
            <Search size={21} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.greeting}>
          <Text style={styles.eyebrow}>{t('LISTEN WITH PRESENCE')}</Text>
          <Text style={styles.heading}>{t('A moment for reflection.')}</Text>
          <Text style={styles.description}>
            {t('Set aside a moment for Quran recitation.')}
          </Text>
        </View>

        {/* 1. Reciter introduction */}
        <View style={styles.heroCard}>
          <View style={styles.reciterProfileRow}>
            <Image
              source={require('../../assets/alafasy2.jpg')}
              style={styles.reciterPortrait}
              accessibilityLabel={t('Portrait of Mishary Rashid Alafasy')}
            />
            <View style={styles.reciterProfileText}>
              <Text style={styles.eyebrow}>{t('FEATURED RECITER')}</Text>
              <Text style={styles.reciterName}>Mishary Rashid</Text>
              <Text style={styles.reciterSurname}>Alafasy</Text>
              <Text style={styles.heroDescription}>{t('Quran reciter - Kuwait')}</Text>
            </View>
          </View>
          <Pressable
            style={styles.heroButton}
            onPress={() => onOpenSurahs()}
            accessibilityRole="button"
            accessibilityLabel={t('Browse all surahs to listen')}
          >
            <BookOpen size={17} color={colors.emerald} />
            <Text style={styles.heroButtonText}>{t('Browse all surahs')}</Text>
            <ArrowRight size={17} color={colors.emerald} />
          </Pressable>
        </View>

        {/* 2. Primary listening action */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>{t(hasCurrentSurah ? 'Continue listening' : 'Begin listening')}</Text>
            <Text style={styles.sectionSubtitle}>{t(hasCurrentSurah ? 'Pick up where you left off' : 'Begin with Al-Fatihah or choose any surah')}</Text>
          </View>

          <View style={styles.clockIcon}>
            <Clock3 size={19} color={colors.text} />
          </View>
        </View>

        <Pressable
          style={styles.continueCard}
          onPress={toggleCurrentPlayback}
          accessibilityRole="button"
          accessibilityLabel={
            isPlaying
              ? `${t('Pause')} ${currentSurah.name}`
              : `${t('Play')} ${currentSurah.name}`
          }
        >
          <View style={styles.surahArtwork}>
            <Music2 size={22} color={colors.gold} />
          </View>

          <View style={styles.continueInfo}>
            <Text style={styles.continueName}>
              {currentSurah.name}
            </Text>
            <Text style={styles.continueMeta}>
              {t('Surah')} {currentSurah.number} · {surahDurations[currentSurah.number]}
            </Text>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: progressWidth },
                ]}
              />
            </View>
          </View>

          <View style={styles.roundPlayButton}>
            {isPlaying ? (
              <Pause size={19} color={colors.white} fill={colors.white} />
            ) : (
              <Play size={19} color={colors.white} fill={colors.white} />
            )}
          </View>
        </Pressable>

        {/* 3. Surah shortcuts */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>{t('Explore the Quran')}</Text>
            <Text style={styles.sectionSubtitle}>
              {t('Selected recitations by Mishary Alafasy')}
            </Text>
          </View>

          <Pressable
            onPress={onOpenSurahs}
            style={styles.seeAllButton}
            accessibilityRole="button"
          >
            <Text style={styles.seeAllText}>{t('See all')}</Text>
            <ChevronRight size={17} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.surahList}>
          {featuredSurahs.map((surah) => {
            const favourite = isFavourite(surah.number);
            const isCurrent = audioPlayer.currentSurah?.number === surah.number;

            return (
              <View key={surah.number} style={styles.surahRow}>
                <Pressable
                  style={styles.surahNumberBox}
                  onPress={() => selectSurah(surah.number)}
                  accessibilityRole="button"
                  accessibilityLabel={`${t('Play')} ${surah.name}`}
                >
                  <Text style={styles.surahNumber}>
                    {String(surah.number).padStart(2, '0')}
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.surahDetails}
                  onPress={() => selectSurah(surah.number)}
                  accessibilityRole="button"
                >
                  <Text style={styles.surahName}>{surah.name}</Text>
                  <Text style={styles.surahDuration}>
                    {surahDurations[surah.number]}
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.favouriteButton}
                  onPress={() => toggleFavourite(surah.number)}
                  accessibilityRole="button"
                  accessibilityLabel={
                    favourite
                      ? `${t('Remove from favourites')}: ${surah.name}`
                      : `${t('Add to favourites')}: ${surah.name}`
                  }
                >
                  <Heart
                    size={19}
                    color={favourite ? colors.gold : colors.muted}
                    fill={favourite ? colors.gold : 'transparent'}
                  />
                </Pressable>

                <Pressable
                  style={styles.rowPlayButton}
                  onPress={() =>
                    isCurrent && isPlaying
                      ? toggleCurrentPlayback()
                      : selectSurah(surah.number)
                  }
                  accessibilityRole="button"
                  accessibilityLabel={
                    isCurrent && isPlaying
                      ? `${t('Pause')} ${surah.name}`
                      : `${t('Play')} ${surah.name}`
                  }
                >
                  {isCurrent && isPlaying ? (
                    <Pause size={16} color={colors.text} />
                  ) : (
                    <Play
                      size={16}
                      color={colors.text}
                      fill={colors.text}
                    />
                  )}
                </Pressable>
              </View>
            );
          })}
        </View>

        <Text style={styles.footerText}>{t('May your listening bring reflection and peace.')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}



function createStyles(colors: AppColors) {
  return StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 112,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  brandIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: colors.emerald,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  brandSubtitle: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 4,
  },
  iconButton: {
    width: 43,
    height: 43,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  greeting: {
    marginTop: 30,
    marginBottom: 20,
  },
  eyebrow: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
  },
  heading: {
    color: colors.text,
    fontSize: 27,
    fontWeight: '700',
    letterSpacing: -0.7,
    marginTop: 8,
  },
  description: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 7,
  },
  heroCard: {
    backgroundColor: colors.emerald,
    borderRadius: 22,
    padding: 18,
    overflow: 'hidden',
  },
  reciterProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  reciterPortrait: {
    width: 78,
    height: 88,
    borderRadius: 18,
  },
  reciterProfileText: {
    flex: 1,
  },
  heroDecoration: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 1,
    borderColor: 'rgba(198,161,91,0.24)',
    top: 55,
    right: -75,
  },
  heroDecorationSmall: {
    position: 'absolute',
    width: 145,
    height: 145,
    borderRadius: 73,
    borderWidth: 1,
    borderColor: 'rgba(198,161,91,0.20)',
    top: 87,
    right: -42,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reciterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderWidth: 1,
    borderColor: 'rgba(198,161,91,0.4)',
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  reciterBadgeText: {
    color: colors.ivory,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.3,
  },
  heroArtwork: {
    alignSelf: 'center',
    marginTop: 19,
    marginBottom: 15,
  },
  artRingOuter: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 1,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artRingInner: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(248,245,236,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(198,161,91,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reciterName: {
    color: colors.ivory,
    fontSize: 17,
    fontWeight: '700',
    marginTop: 7,
  },
  reciterSurname: {
    color: colors.gold,
    fontSize: 17,
    fontWeight: '700',
    marginTop: 1,
  },
  heroDescription: {
    color: '#D7E2D9',
    fontSize: 12,
    marginTop: 5,
  },
  heroButton: {
    marginTop: 16,
    minHeight: 44,
    backgroundColor: colors.ivory,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  heroButtonText: {
    color: colors.emerald,
    fontSize: 13,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 29,
    marginBottom: 15,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  sectionSubtitle: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 5,
  },
  clockIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    backgroundColor: colors.softGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 10,
    backgroundColor: colors.card,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: colors.border,
  },
  surahArtwork: {
    width: 56,
    height: 60,
    borderRadius: 14,
    backgroundColor: colors.emerald,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueInfo: {
    flex: 1,
  },
  continueName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  continueMeta: {
    color: colors.muted,
    fontSize: 10,
    marginTop: 4,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    width: '38%',
    height: '100%',
    backgroundColor: colors.gold,
    borderRadius: 2,
  },
  roundPlayButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.emerald,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  surahList: {
    backgroundColor: colors.card,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 13,
  },
  surahRow: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 11,
  },
  surahNumberBox: {
    width: 39,
    height: 39,
    borderRadius: 13,
    backgroundColor: colors.softGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  surahNumber: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  surahDetails: {
    flex: 1,
    paddingVertical: 9,
  },
  surahName: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  surahDuration: {
    color: colors.muted,
    fontSize: 10,
    marginTop: 4,
  },
  favouriteButton: {
    width: 32,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowPlayButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.softGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    color: colors.muted,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 5,
  },
  });
}
