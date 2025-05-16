
// Mock implementation of expo-camera
export default {
  Camera: {
    Constants: {},
    requestCameraPermissionsAsync: async () => ({ status: 'granted' }),
  },
};
