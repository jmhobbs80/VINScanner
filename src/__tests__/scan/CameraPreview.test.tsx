
import { render, screen } from '@testing-library/react';
import CameraPreview from '@/components/scan/CameraPreview';
import '@testing-library/jest-native/extend-expect';
import '@testing-library/jest-dom';

// Mock camera-related functionality
jest.mock('expo-camera', () => ({
  Camera: () => null,
  requestCameraPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
}));

describe('CameraPreview', () => {
  const mockOnFrame = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders camera placeholder when not active', () => {
    render(
      <CameraPreview
        cameraActive={false}
        onFrame={mockOnFrame}
        scanned={false}
        detectedText=""
      />
    );

    expect(screen.getByTestId('camera-placeholder')).toBeInTheDocument();
    expect(screen.queryByTestId('camera-video')).not.toBeInTheDocument();
  });

  test('renders video when camera is active', () => {
    // Mock MediaDevices API
    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: {
        getUserMedia: jest.fn().mockResolvedValue({}),
      },
      writable: true,
    });

    render(
      <CameraPreview
        cameraActive={true}
        onFrame={mockOnFrame}
        scanned={false}
        detectedText=""
      />
    );

    expect(screen.getByTestId('camera-video')).toBeInTheDocument();
    expect(screen.queryByTestId('camera-placeholder')).not.toBeInTheDocument();
  });

  test('displays detected VIN when scanned', () => {
    const testVin = "1HGCM82633A123456";
    
    render(
      <CameraPreview
        cameraActive={true}
        onFrame={mockOnFrame}
        scanned={true}
        detectedText={testVin}
      />
    );

    expect(screen.getByTestId('vin-detected')).toBeInTheDocument();
    expect(screen.getByText(`VIN Detected: ${testVin}`)).toBeInTheDocument();
  });
});
