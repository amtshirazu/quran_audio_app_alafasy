module.exports = {
  preset: '@react-native/jest-preset',
  transform: {
    '^.+\\.mjs$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-native-async-storage|@react-navigation|lucide-react-native|react-native-track-player)/)',
  ],
};
