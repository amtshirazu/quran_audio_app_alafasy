
import React from 'react';
import {
  ScrollView,
  View,
  Pressable,
  StyleSheet,
  Image,
  Linking,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BookOpen,
  Sun,
  Moon,
  Check,
  Headphones,
  Repeat2,
  Info,
  ExternalLink,
} from 'lucide-react-native';

import { useTheme } from '../context/ThemeContext';
import Text from '../components/AppText';
import type { ThemeMode } from '../theme/theme';
import { useLocalization } from '../context/LocalizationContext';

const THEME_OPTIONS: {
  value: ThemeMode;
  label: string;
  description: string;
  icon: typeof Sun;
}[] = [
  {
    value: 'light',
    label: 'Light',
    description: 'Ivory backgrounds and emerald accents',
    icon: Sun,
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'A calm, dark forest-green appearance',
    icon: Moon,
  },
];

export default function SettingsScreen() {
  const { mode, setMode, colors } = useTheme();
  const { language, setLanguage, t } = useLocalization();

  const styles = createStyles(colors);

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top']}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>ALAFASY QURAN</Text>
          <Text style={styles.title}>{t('Settings')}</Text>
          <Text style={styles.subtitle}>{t('Listening preferences and information about the reciter.')}</Text>
        </View>

        <View style={styles.sectionHeader}>
          <BookOpen size={17} color={colors.gold} strokeWidth={2} />
          <Text style={styles.sectionTitle}>{t('THE RECITER')}</Text>
        </View>

        <View style={styles.reciterCard}>
          <View style={styles.reciterProfile}>
          <Image
            source={require('../../assets/alafasy1.jpg')}
            style={styles.reciterPortrait}
            accessibilityLabel={t('Portrait of Mishary Rashid Alafasy')}
          />
          <View style={styles.reciterText}>
            <Text style={styles.reciterName}>Mishary Rashid Alafasy</Text>
            <Text style={styles.reciterRole}>{t('Quran reciter - Imam - Kuwait')}</Text>
          </View>
          </View>
          <Text style={styles.reciterBio}>{t('Born in Kuwait in 1976, Alafasy studied Quran and tafsir at the Islamic University of Madinah.')}</Text>
          <Pressable
            style={styles.sourceLink}
            onPress={() => Linking.openURL('https://quran.com/reciters/7')}
            accessibilityRole="link"
          >
            <Text style={styles.sourceLinkText}>{t('Reciter profile at Quran.com')}</Text>
            <ExternalLink size={15} color={colors.emeraldLight} />
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <Sun
            size={19}
            color={colors.gold}
            strokeWidth={2}
          />
          <Text style={styles.sectionTitle}>{t('APPEARANCE')}</Text>
        </View>

        <View style={styles.optionsCard}>
          {THEME_OPTIONS.map((option, index) => {
            const Icon = option.icon;
            const selected = mode === option.value;

            return (
              <React.Fragment key={option.value}>
                {index > 0 && (
                  <View style={styles.separator} />
                )}

                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => setMode(option.value)}
                  style={[
                    styles.option,
                    selected && styles.selectedOption,
                  ]}
                >
                  <View
                    style={[
                      styles.optionIcon,
                      selected && styles.selectedOptionIcon,
                    ]}
                  >
                    <Icon
                      size={21}
                      color={
                        selected
                          ? colors.emerald
                          : colors.secondaryText
                      }
                    />
                  </View>

                  <View style={styles.optionText}>
                    <Text style={styles.optionTitle}>
                      {t(option.label)}
                    </Text>
                    <Text style={styles.optionDescription}>
                      {t(option.description)}
                    </Text>
                  </View>

                  {selected && (
                    <View style={styles.checkCircle}>
                      <Check
                        size={16}
                        color={colors.white}
                        strokeWidth={2.5}
                      />
                    </View>
                  )}
                </Pressable>
              </React.Fragment>
            );
          })}
        </View>

        <View style={styles.sectionHeader}>
          <BookOpen size={17} color={colors.gold} strokeWidth={2} />
          <Text style={styles.sectionTitle}>{t('LANGUAGE')}</Text>
        </View>
        <View style={styles.optionsCard}>
          {(['ar', 'en', 'fr', 'tr'] as const).map((option, index) => (
            <React.Fragment key={option}>
              {index > 0 && <View style={styles.separator} />}
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected: language === option }}
                onPress={() => setLanguage(option)}
                style={[styles.option, language === option && styles.selectedOption]}
              >
                <View style={[styles.optionIcon, language === option && styles.selectedOptionIcon]}>
                  <BookOpen size={20} color={language === option ? colors.emerald : colors.secondaryText} />
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>{t(option === 'ar' ? 'Arabic' : option === 'fr' ? 'French' : option === 'tr' ? 'Turkish' : 'English')}</Text>
                </View>
                {language === option && <View style={styles.checkCircle}><Check size={16} color={colors.white} strokeWidth={2.5} /></View>}
              </Pressable>
            </React.Fragment>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Headphones
            size={19}
            color={colors.gold}
            strokeWidth={2}
          />
          <Text style={styles.sectionTitle}>{t('LISTENING')}</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Repeat2
              size={21}
              color={colors.emeraldLight}
            />
          </View>

          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>{t('Offline recitations')}</Text>
            <Text style={styles.infoDescription}>{t('All 114 surahs are available offline. Use the player to choose repeat and shuffle options.')}</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <BookOpen size={17} color={colors.gold} strokeWidth={2} />
          <Text style={styles.sectionTitle}>{t('AUDIO CREDITS')}</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Headphones size={21} color={colors.emeraldLight} />
          </View>
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>{t('Quran recitation')}</Text>
            <Text style={styles.infoDescription}>
              {t('Audio source: MP3Quran.net. Reciter: Mishary Rashid Alafasy. Available offline in the app.')}
            </Text>
            <Pressable
              style={styles.sourceLink}
              onPress={() => Linking.openURL('https://www.mp3quran.net/eng/afs')}
              accessibilityRole="link"
            >
              <Text style={styles.sourceLinkText}>{t('Open Mishary Alafasy on MP3Quran.net')}</Text>
              <ExternalLink size={15} color={colors.emeraldLight} />
            </Pressable>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Info
            size={19}
            color={colors.gold}
            strokeWidth={2}
          />
          <Text style={styles.sectionTitle}>{t('ABOUT THIS APP')}</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.brandMark}>
            <BookOpen
              size={25}
              color={colors.gold}
              strokeWidth={1.8}
            />
          </View>

          <View style={styles.infoText}>
            <Text style={styles.brandTitle}>
              Alafasy Quran
            </Text>
            <Text style={styles.infoDescription}>
              {t('An offline listening companion featuring Mishary Rashid Alafasy recitations.')}
            </Text>
            <Text style={styles.version}>
              Version 1.0.0
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Info size={19} color={colors.gold} strokeWidth={2} />
          <Text style={styles.sectionTitle}>{t('DEVELOPER')}</Text>
        </View>

        <View style={styles.developerCard}>
          <Image
            source={require('../../assets/amtilyst.jpg')}
            style={styles.developerLogo}
            resizeMode="contain"
            accessibilityLabel={t('AMTILYST developer logo')}
          />
          <View style={styles.infoText}>
            <Text style={styles.brandTitle}>AMTILYST</Text>
          </View>
        </View>

        <Text style={styles.footer}>{t('May the Quran bring reflection to your day.')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 15,
      paddingBottom: 36,
    },
    header: {
      marginBottom: 22,
    },
    eyebrow: {
      color: colors.gold,
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 2,
      marginBottom: 8,
    },
    title: {
      color: colors.text,
      fontSize: 28,
      fontWeight: '800',
      letterSpacing: -0.7,
    },
    subtitle: {
      color: colors.secondaryText,
      fontSize: 13,
      lineHeight: 19,
      marginTop: 6,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 9,
      marginBottom: 10,
      marginTop: 7,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 1.2,
    },
    optionsCard: {
      backgroundColor: colors.card,
      borderRadius: 18,
      paddingHorizontal: 11,
      paddingVertical: 4,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 22,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 6,
      borderRadius: 13,
      gap: 12,
    },
    selectedOption: {
      backgroundColor: colors.selectedBackground,
    },
    optionIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    selectedOptionIcon: {
      backgroundColor: colors.softGold,
    },
    optionText: {
      flex: 1,
    },
    optionTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '700',
    },
    optionDescription: {
      color: colors.secondaryText,
      fontSize: 12,
      lineHeight: 17,
      marginTop: 4,
    },
    separator: {
      height: 1,
      backgroundColor: colors.border,
      marginHorizontal: 7,
    },
    checkCircle: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.emerald,
    },
    infoCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 13,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      padding: 14,
      marginBottom: 22,
    },
    reciterCard: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      padding: 14,
      marginBottom: 22,
    },
    reciterProfile: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 13,
    },
    reciterPortrait: {
      width: 70,
      height: 78,
      borderRadius: 16,
      backgroundColor: colors.softGreen,
    },
    reciterText: {
      flex: 1,
    },
    reciterName: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '700',
    },
    reciterRole: {
      color: colors.secondaryText,
      fontSize: 12,
      marginTop: 5,
    },
    reciterBio: {
      color: colors.secondaryText,
      fontSize: 12,
      lineHeight: 18,
      marginTop: 13,
    },
    sourceLink: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      minHeight: 38,
      marginTop: 6,
    },
    sourceLinkText: {
      color: colors.emeraldLight,
      fontSize: 12,
      fontWeight: '700',
    },
    developerCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      padding: 13,
      marginBottom: 22,
    },
    developerLogo: {
      width: 52,
      height: 52,
      borderRadius: 14,
      backgroundColor: '#090A12',
    },
    infoIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.softGreen,
    },
    infoText: {
      flex: 1,
    },
    infoTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '700',
      marginBottom: 5,
    },
    infoDescription: {
      color: colors.secondaryText,
      fontSize: 12,
      lineHeight: 19,
    },
    brandMark: {
      width: 48,
      height: 48,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.emerald,
    },
    brandTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '800',
      marginBottom: 5,
    },
    version: {
      color: colors.muted,
      fontSize: 11,
      marginTop: 10,
    },
    footer: {
      color: colors.muted,
      textAlign: 'center',
      fontSize: 12,
      marginTop: 2,
    },
  });
}
