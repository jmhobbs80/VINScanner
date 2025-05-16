
// Mock implementation of expo-location
export default {
  requestForegroundPermissionsAsync: async () => ({ status: 'granted' }),
  getCurrentPositionAsync: async () => ({
    coords: { latitude: 37.7749, longitude: -122.4194 }
  }),
};
