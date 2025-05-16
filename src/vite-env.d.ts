
/// <reference types="vite/client" />
/// <reference types="@testing-library/jest-dom" />

// Add declarations for mocked modules
declare module 'expo-camera' {
  const Camera: {
    Constants: any;
    requestCameraPermissionsAsync: () => Promise<{ status: string }>;
  };
  export { Camera };
}

declare module 'expo-location' {
  export function requestForegroundPermissionsAsync(): Promise<{ status: string }>;
  export function getCurrentPositionAsync(): Promise<{ coords: { latitude: number; longitude: number } }>;
}

declare module 'vision-camera-ocr' {
  export function detectVin(): { vin: string };
}
