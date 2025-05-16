
// Extend Jest expect() with React-Native Testing Library matchers
import '@testing-library/jest-native/extend-expect';
// Add Jest DOM matchers for browser testing
import '@testing-library/jest-dom';

// Mock React Native modules for testing
jest.mock('react-native', () => ({
  // Add any React Native API you need to mock for tests
}));

jest.mock('expo-camera', () => ({
  Camera: {
    Constants: {},
    requestCameraPermissionsAsync: async () => ({ status: 'granted' }),
  },
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: async () => ({ status: 'granted' }),
  getCurrentPositionAsync: async () => ({
    coords: { latitude: 37.7749, longitude: -122.4194 }
  }),
}));

jest.mock('vision-camera-ocr', () => ({
  detectVin: () => ({ vin: 'MOCK1234567890123' }),
}));
