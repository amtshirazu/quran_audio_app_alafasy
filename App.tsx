
import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import {
  createBottomTabNavigator,
  type BottomTabNavigationProp,
} from '@react-navigation/bottom-tabs';

import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
  Home,
  BookOpen,
  Heart,
  Settings,
} from 'lucide-react-native';

import HomeScreen from './src/screens/HomeScreen';
import SurahsScreen from './src/screens/SurahsScreen';
import FavouritesScreen from './src/screens/FavouritesScreen';
import SettingsScreen from './src/screens/SettingsScreen';

import { FavouritesProvider } from './src/context/FavouritesContext';
import { AudioPlayerProvider } from './src/context/AudioPlayerContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { LocalizationProvider, useLocalization } from './src/context/LocalizationContext';
import AudioPlayerOverlay from './src/components/AudioPlayerOverlay';
import { APP_FONT_FAMILY } from './src/components/AppText';

type RootTabParamList = {
  Home: undefined;
  Surahs: undefined;
  Favourites: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

function renderTabBarIcon(
  route: { name: keyof RootTabParamList },
  color: string,
  size: number,
) {
  const iconProps = {
    color,
    size,
    strokeWidth: 1.9,
  };

  switch (route.name) {
    case 'Home':
      return <Home {...iconProps} />;

    case 'Surahs':
      return <BookOpen {...iconProps} />;

    case 'Favourites':
      return <Heart {...iconProps} />;

    case 'Settings':
      return <Settings {...iconProps} />;

    default:
      return null;
  }
}

type HomeTabScreenProps = {
  navigation: BottomTabNavigationProp<
    RootTabParamList,
    'Home'
  >;
};

function HomeTabScreen({ navigation }: HomeTabScreenProps) {
  return (
    <HomeScreen
      onOpenSurahs={() => navigation.navigate('Surahs')}
    />
  );
}

function AppNavigation() {
  const { colors, isDark } = useTheme();
  const { t } = useLocalization();

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />

      <NavigationContainer>
        <View style={styles.navigation}>
          <Tab.Navigator
            initialRouteName="Home"
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarLabel: t(route.name),
              tabBarActiveTintColor: isDark
                ? colors.gold
                : colors.emerald,
              tabBarInactiveTintColor: colors.muted,
              tabBarLabelStyle: {
                fontFamily: APP_FONT_FAMILY,
                fontSize: 9,
                fontWeight: '600',
                marginTop: 2,
              },
              tabBarStyle: {
                backgroundColor: colors.tabBar,
                borderTopColor: colors.border,
                borderTopWidth: 1,
                height: 64,
                paddingTop: 7,
                paddingBottom: 7,
                elevation: 0,
              },
              tabBarIcon: ({ color, size }) =>
                renderTabBarIcon(route, color, size),
            })}
          >
            <Tab.Screen
              name="Home"
              component={HomeTabScreen}
            />

            <Tab.Screen
              name="Surahs"
              component={SurahsScreen}
            />

            <Tab.Screen
              name="Favourites"
              component={FavouritesScreen}
            />

            <Tab.Screen
              name="Settings"
              component={SettingsScreen}
            />
          </Tab.Navigator>
          <AudioPlayerOverlay />
        </View>
      </NavigationContainer>
    </>
  );
}

const styles = StyleSheet.create({
  navigation: {
    flex: 1,
  },
});

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LocalizationProvider>
          <FavouritesProvider>
            <AudioPlayerProvider>
              <AppNavigation />
            </AudioPlayerProvider>
          </FavouritesProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
