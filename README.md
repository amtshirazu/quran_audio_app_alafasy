# Alafasy Quran

Alafasy Quran is a React Native app for exploring Quran Surahs and saving favourites, with a listening-focused interface inspired by reciter Mishary Rashid Alafasy.

## Features

- Browse all 114 Surahs with Arabic names, transliterated names, and English translations.
- Search the Surah library by name, English translation, Arabic name, or Surah number.
- Save and remove favourite Surahs. Favourites are stored on-device between app sessions.
- Explore a home screen with featured recitations and listening controls.

> **Note:** Audio playback is not connected yet. The player controls and listening screens are currently interface prototypes.

## Tech stack

- React Native with TypeScript
- React Navigation bottom tabs
- AsyncStorage for saving favourites locally
- Lucide icons

## Requirements

- Node.js `>= 22.11.0`
- npm
- Android Studio and an Android emulator/device for Android development
- Xcode and CocoaPods for iOS development (macOS required)

Follow the official [React Native environment setup](https://reactnative.dev/docs/set-up-your-environment) guide for your target platform before building.

## Getting started

Install the project dependencies:

```sh
npm install
```

Start Metro in one terminal:

```sh
npm start
```

In a second terminal, build and run the app:

```sh
# Android
npm run android

# iOS (macOS only)
npm run ios
```

For iOS, install CocoaPods dependencies before the first build and after native dependency changes:

```sh
bundle install
bundle exec pod install
```

## Development commands

```sh
npm start       # Start the Metro bundler
npm run android # Build and run on Android
npm run ios     # Build and run on iOS
npm run lint    # Run ESLint
npm test        # Run Jest tests
```

## Project structure

```text
src/
  context/  Shared favourites state
  data/     Surah names, Arabic names, and English translations
  screens/  Home, Surah library, favourites, and settings screens
  theme/    App colors and theme
```
