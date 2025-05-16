
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Add aliases for React Native packages
      "react-native": "react-native-web",
      "expo-camera": path.resolve(__dirname, "./src/mocks/expo-camera.js"),
      "expo-location": path.resolve(__dirname, "./src/mocks/expo-location.js"),
      "vision-camera-ocr": path.resolve(__dirname, "./src/mocks/vision-camera-ocr.js"),
    },
  },
  optimizeDeps: {
    exclude: ["react-native", "expo-camera", "expo-location", "vision-camera-ocr"],
  },
}));
