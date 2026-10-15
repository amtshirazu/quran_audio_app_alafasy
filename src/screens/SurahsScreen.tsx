import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
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
  X,
  BookOpen,
} from 'lucide-react-native';
import { surahs, type Surah } from '../data/surahs';

import colors from '../theme/colors';
import { useFavourites } from '../context/FavouritesContext';

export default function SurahsScreen() {
  const [search, setSearch] = useState('');
  const {
    toggleFavourite,
    isFavourite,
  } = useFavourites();
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);

  const filteredSurahs = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return surahs;
    }

    return surahs.filter(
      (surah) =>
        surah.name.toLowerCase().includes(query) ||
        surah.translation.toLowerCase().includes(query) ||
        surah.arabic.includes(search.trim()) ||
        String(surah.number) === query,
    );
  }, [search]);

  function handlePlay(number: number) {
    setSelectedSurah(number);
    // Audio playback will be connected in a later milestone.
  }

  function renderSurah({ item }: { item: Surah }) {
    const isFav = isFavourite(item.number);
    const isSelected = selectedSurah === item.number;

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
          <Text style={styles.surahMeta}>{item.translation}</Text>
        </Pressable>

        <Text style={styles.arabicName}>{item.arabic}</Text>

        <Pressable
          style={styles.actionButton}
          onPress={() => toggleFavourite(item.number)}
          accessibilityRole="button"
          accessibilityLabel={
            isFav
              ? `Remove ${item.name} from favourites`
              : `Add ${item.name} to favourites`
          }
        >
          <Heart
            size={19}
            color={isFav ? colors.emerald : colors.muted}
            fill={isFav ? colors.emerald : 'transparent'}
          />
        </Pressable>

        <Pressable
          style={styles.playButton}
          onPress={() => handlePlay(item.number)}
          accessibilityRole="button"
          accessibilityLabel={`Play ${item.name}`}
        >
          <Play size={15} color={colors.white} fill={colors.white} />
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
          <Text style={styles.eyebrow}>THE COLLECTION</Text>
          <Text style={styles.title}>Surah Library</Text>
          <Text style={styles.subtitle}>
            Every surah, ready for your listening journey.
          </Text>
        </View>
      </View>

      <View style={styles.searchBox}>
        <Search size={20} color={colors.muted} />

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search surah name, translation or number"
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
          returnKeyType="search"
          accessibilityLabel="Search surahs"
        />

        {search.length > 0 && (
          <Pressable
            onPress={() => setSearch('')}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <X size={19} color={colors.muted} />
          </Pressable>
        )}
      </View>

      <View style={styles.listHeading}>
        <Text style={styles.listTitle}>All Surahs</Text>
        <Text style={styles.count}>{filteredSurahs.length} surahs</Text>
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
            <Text style={styles.emptyTitle}>No surahs found</Text>
            <Text style={styles.emptySubtitle}>
              Try another name or surah number.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.ivory,
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
    color: colors.emerald,
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
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
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
    paddingBottom: 24,
  },
  surahRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 76,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 9,
    backgroundColor: colors.white,
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
    color: colors.emerald,
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
    color: colors.emerald,
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