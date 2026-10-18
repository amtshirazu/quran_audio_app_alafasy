# Alafasy Quran

Alafasy Quran is a React Native app for exploring Quran Surahs and saving favourites, with a listening-focused interface inspired by reciter Mishary Rashid Alafasy.

## Features

- Browse all 114 Surahs with Arabic names, transliterated names, and English translations.
- Search the Surah library by name, English translation, Arabic name, or Surah number.
- Save and remove favourite Surahs. Favourites are stored on-device between app sessions.
- Explore a home screen with featured recitations and listening controls.
- Play all 114 recitations offline through an install-time Play Asset Delivery pack.
- Control playback with shuffle, Repeat Off, Repeat One, and Repeat All.
- Resume the last surah and position after reopening the app; restoration stays paused unless native playback is already active.

Playback was verified on an Android emulator using the local-testing AAB,
including offline playback from the install-time audio pack.

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

## Android internal testing

Release builds must use a private upload key; they are never signed with the
debug key. Create and back up an upload keystore outside the repository:

```powershell
keytool -genkeypair -v -keystore "$env:USERPROFILE\alafasy-upload-key.jks" `
  -alias alafasy-upload -keyalg RSA -keysize 2048 -validity 10000
```

Configure these values in the local Gradle user properties file
(`$env:USERPROFILE\.gradle\gradle.properties`) or as environment variables.
Do not commit the keystore or passwords:

```properties
ALAFASY_UPLOAD_STORE_FILE=C:\\Users\\<you>\\alafasy-upload-key.jks
ALAFASY_UPLOAD_STORE_PASSWORD=<keystore-password>
ALAFASY_UPLOAD_KEY_ALIAS=alafasy-upload
ALAFASY_UPLOAD_KEY_PASSWORD=<key-password>
```

With signing configured, build the Play-uploadable Android App Bundle:

```powershell
Set-Location android
.\gradlew.bat bundleRelease
```

The task fails explicitly if the release signing values are missing. The
resulting AAB is written to
`android\app\build\outputs\bundle\release\app-release.aab`. Upload it to a
Google Play internal testing track and install it from the tester opt-in link
to verify Play-delivered install-time audio. Play Console access and the
upload are performed by an authorized account holder.

The install-time audio pack contains all 114 recitations; the complete audio
payload is approximately 322 MB before bundle compression. Local Bundletool
testing validates the AAB and split installation, but does not replace a
Play-distributed test.

## Project structure

```text
src/
  components/ Reusable player components
  context/  Shared favourites and audio-player state
  data/     Surah names, Arabic names, and English translations
  services/ TrackPlayer and playback-service integration
  screens/  Home, Surah library, favourites, and settings screens
  theme/    App colors and theme
```
