import React, { useMemo, useState } from 'react';
import {
  Alert,
  View,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search,
  Heart,
  Play,
  Pause,
  X,
  BookOpen,
} from 'lucide-react-native';
import { surahs, type Surah } from '../data/surahs';

import { useFavourites } from '../context/FavouritesContext';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { useTheme } from '../context/ThemeContext';
import type { AppColors } from '../theme/theme';
import Text, { APP_FONT_FAMILY } from '../components/AppText';
import { useLocalization } from '../context/LocalizationContext';

export default function SurahsScreen() {
  const [search, setSearch] = useState('');
  const { t, language } = useLocalization();
  const {
    toggleFavourite,
    isFavourite,
  } = useFavourites();
  const audioPlayer = useAudioPlayer();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const filteredSurahs = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return surahs;
    }

    return surahs.filter(
      (surah) =>
        surah.name.toLowerCase().includes(query) ||
        t(surah.translation).toLowerCase().includes(query) ||
        surah.arabic.includes(search.trim()) ||
        String(surah.number) === query,
    );
  }, [search, language, t]);

  function handlePlay(number: number) {
    const action =
      audioPlayer.currentSurah?.number === number
        ? audioPlayer.togglePlayback()
        : audioPlayer.playSurah(number);

    action.catch((error: unknown) => {
      Alert.alert(
        t('Could not play this surah'),
        error instanceof Error ? error.message : String(error),
      );
    });
  }

  function renderSurah({ item }: { item: Surah }) {
    const isFav = isFavourite(item.number);
    const isSelected = audioPlayer.currentSurah?.number === item.number;

    return (
      <View style={styles.surahRow}>
        <View style={[styles.numberBox, isSelected && styles.selectedNumberBox]}>
          <Text style={[styles.numberText, isSelected && styles.selectedNumberText]}>
            {String(item.number).padStart(2, '0')}
          </Text>
        </View>

        <Pressable
          style={styles.surahInfo}
          onPress={() => handlePlay(item.number)}
        >
          <Text style={styles.surahName}>{item.name}</Text>
          <Text style={styles.surahMeta}>{t(item.translation)}</Text>
        </Pressable>

        <Text style={styles.arabicName}>{item.arabic}</Text>

        <Pressable
          style={styles.actionButton}
          onPress={() => toggleFavourite(item.number)}
          accessibilityRole="button"
          accessibilityLabel={
            isFav
              ? `${t('Remove from favourites')}: ${item.name}`
              : `${t('Add to favourites')}: ${item.name}`
          }
        >
          <Heart
            size={19}
            color={isFav ? colors.gold : colors.muted}
            fill={isFav ? colors.gold : 'transparent'}
          />
        </Pressable>

        <Pressable
          style={styles.playButton}
          onPress={() => handlePlay(item.number)}
          accessibilityRole="button"
          accessibilityLabel={`${t('Play')} ${item.name}`}
          accessibilityState={{
            selected: isSelected,
            disabled: audioPlayer.isLoading,
          }}
          disabled={audioPlayer.isLoading}
        >
          {isSelected && audioPlayer.isPlaying ? (
            <Pause size={15} color={colors.white} fill={colors.white} />
          ) : (
            <Play size={15} color={colors.white} fill={colors.white} />
          )}
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.headingIcon}>
          <BookOpen size={23} color={colors.gold} />
        </View>

        <View style={styles.headingText}>
          <Text style={styles.eyebrow}>{t('RECITATION LIBRARY')}</Text>
          <Text style={styles.title}>{t('Surah Library')}</Text>
          <Text style={styles.subtitle}>{t('Browse Mishary Alafasy complete collection of surah recitations.')}</Text>
        </View>
      </View>

      <View style={styles.searchBox}>
        <Search size={20} color={colors.muted} />

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={t('Search surah name, translation or number')}
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
          returnKeyType="search"
          accessibilityLabel={t('Search surahs')}
        />

        {search.length > 0 && (
          <Pressable
            onPress={() => setSearch('')}
            accessibilityRole="button"
            accessibilityLabel={t('Clear search')}
          >
            <X size={19} color={colors.muted} />
          </Pressable>
        )}
      </View>

      <View style={styles.listHeading}>
        <Text style={styles.listTitle}>{t('All Surahs')}</Text>
        <Text style={styles.count}>{filteredSurahs.length} {t('surahs')}</Text>
      </View>

      <FlatList
        data={filteredSurahs}
        keyExtractor={(item) => String(item.number)}
        renderItem={renderSurah}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Search size={28} color={colors.muted} />
            <Text style={styles.emptyTitle}>{t('No surahs found')}</Text>
            <Text style={styles.emptySubtitle}>{t('Try another name or surah number.')}</Text>
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 22,
    paddingHorizontal: 14,
    height: 52,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    gap: 10,
  },
    searchInput: {
      flex: 1,
      color: colors.text,
      fontSize: 12,
      fontFamily: APP_FONT_FAMILY,
    paddingVertical: 0,
  },
  listHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 22,
    marginTop: 24,
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
  selectedNumberBox: {
    backgroundColor: colors.emerald,
  },
  numberText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  selectedNumberText: {
    color: colors.white,
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
    fontSize: 19,
    marginLeft: 2,
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
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    marginTop: 14,
  },
  emptySubtitle: {
    color: colors.muted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 7,
  },
  });
}
