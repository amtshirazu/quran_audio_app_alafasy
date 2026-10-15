import React from 'react';
import { StatusBar, View, Text, StyleSheet } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import {
  createBottomTabNavigator,
  BottomTabNavigationProp,
} from '@react-navigation/bottom-tabs';

import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  Home,
  BookOpen,
  Heart,
  Settings,
} from 'lucide-react-native';

import HomeScreen from './src/screens/HomeScreen';
import SurahsScreen from './src/screens/SurahsScreen';
import FavouritesScreen from './src/screens/FavouritesScreen';
import colors from './src/theme/colors';
import { FavouritesProvider } from './src/context/FavouritesContext';

type RootTabParamList = {
  Home: undefined;
  Surahs: undefined;
  Favourites: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

type PlaceholderProps = {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
};

function PlaceholderScreen({
  title,
  subtitle,
  icon,
}: PlaceholderProps) {
  return (
    <SafeAreaView style={styles.placeholderScreen}>
      <View style={styles.placeholderIcon}>
        {icon}
      </View>

      <Text style={styles.placeholderTitle}>
        {title}
      </Text>

      <Text style={styles.placeholderSubtitle}>
        {subtitle}
      </Text>
    </SafeAreaView>
  );
}

function SettingsScreen() {
  return (
    <PlaceholderScreen
      title="Settings"
      subtitle="Personalise your listening experience and appearance."
      icon={<Settings size={30} color={colors.gold} />}
    />
  );
}

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

export default function App() {
  return (
    <SafeAreaProvider>
      <FavouritesProvider>
        <StatusBar barStyle="dark-content" />

        <NavigationContainer>
          <Tab.Navigator
            initialRouteName="Home"
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarActiveTintColor: colors.emerald,
              tabBarInactiveTintColor: colors.muted,
              tabBarLabelStyle: {
                fontSize: 10,
                fontWeight: '600',
                marginTop: 2,
              },
              tabBarStyle: {
                backgroundColor: colors.ivory,
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
            <Tab.Screen name="Home" component={HomeTabScreen} />
            <Tab.Screen name="Surahs" component={SurahsScreen} />
            <Tab.Screen
              name="Favourites"
              component={FavouritesScreen}
            />
            <Tab.Screen name="Settings" component={SettingsScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </FavouritesProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  placeholderScreen: {
    flex: 1,
    backgroundColor: colors.ivory,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },

  placeholderIcon: {
    width: 76,
    height: 76,
    borderRadius: 25,
    backgroundColor: colors.emerald,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  placeholderTitle: {
    color: colors.emerald,
    fontSize: 23,
    fontWeight: '700',
    textAlign: 'center',
  },

  placeholderSubtitle: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 10,
  },
});