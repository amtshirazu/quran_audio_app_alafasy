
import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Clock3,
  Headphones,
  Heart,
  Music2,
  Pause,
  Play,
  Search,
  Sparkles,
} from 'lucide-react-native';

import colors from '../theme/colors';

type Surah = {
  number: number;
  name: string;
  arabic: string;
  duration: string;
};

const featuredSurahs: Surah[] = [
  { number: 1, name: 'Al-Fatihah', arabic: 'الفاتحة', duration: '01:05' },
  { number: 36, name: 'Ya-Sin', arabic: 'يس', duration: '13:42' },
  { number: 55, name: 'Ar-Rahman', arabic: 'الرحمن', duration: '11:18' },
];

type HomeScreenProps = {
  onOpenSurahs: () => void;
};

export default function HomeScreen({
  onOpenSurahs,
}: HomeScreenProps) {
  const [currentSurah, setCurrentSurah] = useState<Surah>({
    number: 55,
    name: 'Ar-Rahman',
    arabic: 'الرحمن',
    duration: '11:18',
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [favourites, setFavourites] = useState<number[]>([]);

  function toggleFavourite(surahNumber: number) {
    setFavourites((previous) =>
      previous.includes(surahNumber)
        ? previous.filter((number) => number !== surahNumber)
        : [...previous, surahNumber],
    );
  }

  function selectSurah(surah: Surah) {
    setCurrentSurah(surah);
    setIsPlaying(true);
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
              <Text style={styles.brandSubtitle}>
                A moment of tranquillity
              </Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Search surahs"
            style={styles.iconButton}
            onPress={onOpenSurahs}
          >
            <Search size={21} color={colors.emerald} />
          </Pressable>
        </View>

        <View style={styles.greeting}>
          <Text style={styles.eyebrow}>YOUR DAILY LISTENING</Text>
          <Text style={styles.heading}>Peace begins here.</Text>
          <Text style={styles.description}>
            Take a moment. Listen, reflect, and find your calm.
          </Text>
        </View>

        {/* 2. Featured recitation */}
        <View style={styles.heroCard}>
          <View style={styles.heroDecoration} />
          <View style={styles.heroDecorationSmall} />

          <View style={styles.heroTopRow}>
            <View style={styles.reciterBadge}>
              <Headphones size={14} color={colors.gold} />
              <Text style={styles.reciterBadgeText}>
                THE RECITER
              </Text>
            </View>

            <Sparkles size={21} color={colors.gold} />
          </View>

          <View style={styles.heroArtwork}>
            <View style={styles.artRingOuter}>
              <View style={styles.artRingInner}>
                <BookOpen size={40} color={colors.gold} strokeWidth={1.4} />
              </View>
            </View>
          </View>

          <Text style={styles.reciterName}>Mishary Rashid</Text>
          <Text style={styles.reciterSurname}>Alafasy</Text>
          <Text style={styles.heroDescription}>
            Experience the beauty of Quran recitation.
          </Text>

          <Pressable
            style={styles.heroButton}
            onPress={() => selectSurah(featuredSurahs[2])}
            accessibilityRole="button"
          >
            <Play size={17} color={colors.emerald} fill={colors.emerald} />
            <Text style={styles.heroButtonText}>Listen now</Text>
            <ArrowRight size={17} color={colors.emerald} />
          </Pressable>
        </View>

        {/* 3. Continue listening */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Continue listening</Text>
            <Text style={styles.sectionSubtitle}>
              Pick up where you left off
            </Text>
          </View>

          <View style={styles.clockIcon}>
            <Clock3 size={19} color={colors.emerald} />
          </View>
        </View>

        <Pressable
          style={styles.continueCard}
          onPress={() => selectSurah(currentSurah)}
          accessibilityRole="button"
        >
          <View style={styles.surahArtwork}>
            <Music2 size={27} color={colors.gold} />
          </View>

          <View style={styles.continueInfo}>
            <Text style={styles.arabicName}>{currentSurah.arabic}</Text>
            <Text style={styles.continueName}>
              {currentSurah.name}
            </Text>
            <Text style={styles.continueMeta}>
              Surah {currentSurah.number} · {currentSurah.duration}
            </Text>

            <View style={styles.progressTrack}>
              <View style={styles.progressFill} />
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

        {/* 4. Surah shortcuts */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Made for your moment</Text>
            <Text style={styles.sectionSubtitle}>
              A few beautiful recitations to explore
            </Text>
          </View>

          <Pressable
            onPress={onOpenSurahs}
            style={styles.seeAllButton}
            accessibilityRole="button"
          >
            <Text style={styles.seeAllText}>See all</Text>
            <ChevronRight size={17} color={colors.emerald} />
          </Pressable>
        </View>

        <View style={styles.surahList}>
          {featuredSurahs.map((surah) => {
            const isFavourite = favourites.includes(surah.number);

            return (
              <View key={surah.number} style={styles.surahRow}>
                <Pressable
                  style={styles.surahNumberBox}
                  onPress={() => selectSurah(surah)}
                  accessibilityRole="button"
                  accessibilityLabel={`Play ${surah.name}`}
                >
                  <Text style={styles.surahNumber}>
                    {String(surah.number).padStart(2, '0')}
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.surahDetails}
                  onPress={() => selectSurah(surah)}
                  accessibilityRole="button"
                >
                  <Text style={styles.surahArabic}>{surah.arabic}</Text>
                  <Text style={styles.surahName}>{surah.name}</Text>
                  <Text style={styles.surahDuration}>
                    {surah.duration}
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.favouriteButton}
                  onPress={() => toggleFavourite(surah.number)}
                  accessibilityRole="button"
                  accessibilityLabel={
                    isFavourite
                      ? `Remove ${surah.name} from favourites`
                      : `Add ${surah.name} to favourites`
                  }
                >
                  <Heart
                    size={19}
                    color={isFavourite ? colors.emerald : colors.muted}
                    fill={isFavourite ? colors.emerald : 'transparent'}
                  />
                </Pressable>

                <Pressable
                  style={styles.rowPlayButton}
                  onPress={() => selectSurah(surah)}
                  accessibilityRole="button"
                  accessibilityLabel={`Play ${surah.name}`}
                >
                  <Play
                    size={16}
                    color={colors.emerald}
                    fill={colors.emerald}
                  />
                </Pressable>
              </View>
            );
          })}
        </View>

        {/* 5. Mini player */}
        <Pressable
          style={styles.miniPlayer}
          onPress={() => setIsPlaying((playing) => !playing)}
          accessibilityRole="button"
          accessibilityLabel="Toggle playback preview"
        >
          <View style={styles.miniArtwork}>
            <Music2 size={21} color={colors.gold} />
          </View>

          <View style={styles.miniInfo}>
            <Text style={styles.miniTitle}>{currentSurah.name}</Text>
            <Text style={styles.miniSubtitle}>
              Mishary Rashid Alafasy
            </Text>
          </View>

          <Pressable
            style={styles.miniPlayButton}
            onPress={() => setIsPlaying((playing) => !playing)}
            accessibilityRole="button"
            accessibilityLabel={isPlaying ? 'Pause preview' : 'Play preview'}
          >
            {isPlaying ? (
              <Pause size={21} color={colors.emerald} />
            ) : (
              <Play size={21} color={colors.emerald} fill={colors.emerald} />
            )}
          </Pressable>
        </Pressable>

        <Text style={styles.footerText}>
          Made for moments of reflection
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.ivory,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 24,
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
    color: colors.emerald,
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
    backgroundColor: colors.white,
  },
  greeting: {
    marginTop: 30,
    marginBottom: 20,
  },
  eyebrow: {
    color: colors.emeraldLight,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
  },
  heading: {
    color: colors.text,
    fontSize: 29,
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
    borderRadius: 26,
    padding: 22,
    overflow: 'hidden',
    minHeight: 345,
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
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  reciterSurname: {
    color: colors.gold,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 1,
  },
  heroDescription: {
    color: '#D7E2D9',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  heroButton: {
    marginTop: 19,
    minHeight: 48,
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
    gap: 12,
    padding: 13,
    backgroundColor: colors.white,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: colors.border,
  },
  surahArtwork: {
    width: 66,
    height: 76,
    borderRadius: 15,
    backgroundColor: colors.emerald,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueInfo: {
    flex: 1,
  },
  arabicName: {
    color: colors.gold,
    fontSize: 19,
    fontWeight: '600',
    marginBottom: 2,
  },
  continueName: {
    color: colors.text,
    fontSize: 14,
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
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: {
    width: '38%',
    height: '100%',
    backgroundColor: colors.gold,
    borderRadius: 2,
  },
  roundPlayButton: {
    width: 39,
    height: 39,
    borderRadius: 20,
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
    color: colors.emerald,
    fontSize: 12,
    fontWeight: '700',
  },
  surahList: {
    backgroundColor: colors.white,
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
    color: colors.emerald,
    fontSize: 12,
    fontWeight: '700',
  },
  surahDetails: {
    flex: 1,
    paddingVertical: 9,
  },
  surahArabic: {
    color: colors.emerald,
    fontSize: 16,
    fontWeight: '600',
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
    marginTop: 3,
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
  miniPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#EEE9DC',
    borderRadius: 18,
    padding: 12,
    marginTop: 25,
  },
  miniArtwork: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: colors.emerald,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniInfo: {
    flex: 1,
  },
  miniTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  miniSubtitle: {
    color: colors.muted,
    fontSize: 10,
    marginTop: 4,
  },
  miniPlayButton: {
    width: 39,
    height: 39,
    borderRadius: 14,
    backgroundColor: colors.ivory,
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
