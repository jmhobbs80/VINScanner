
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ScanVIN from '@/pages/ScanVIN';
import { AuthProvider } from '@/contexts/AuthContext';
import * as supabaseLib from '@/lib/supabase';
import '@testing-library/jest-native/extend-expect';
import '@testing-library/jest-dom';

// Mock the navigation
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Mock Location API
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(() => 
    Promise.resolve({
      coords: { latitude: 37.7749, longitude: -122.4194 }
    })
  ),
}));

// Mock Supabase functions
jest.mock('@/lib/supabase', () => ({
  uploadVinPhoto: jest.fn().mockResolvedValue('https://example.com/photo.jpg'),
  saveVinScan: jest.fn().mockResolvedValue({ success: true }),
}));

// Mock premium services
jest.mock('@/services/premium', () => ({
  getBuildSheet: jest.fn().mockResolvedValue({ data: 'build sheet data' }),
  getVehicleHistory: jest.fn().mockResolvedValue({ data: 'vehicle history data' }),
  reverseGeocode: jest.fn().mockResolvedValue({ address: '123 Main St' }),
}));

// Mock vehicle data service
jest.mock('@/services/vehicleData', () => ({
  decodeVin: jest.fn().mockResolvedValue({
    make: 'Toyota',
    model: 'Camry',
    year: '2020',
  }),
}));

// Mock AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  ...jest.requireActual('@/contexts/AuthContext'),
  useAuth: () => ({
    user: { 
      id: '123', 
      email: 'test@example.com', 
      role: 'user',
      tenant_id: '456'
    },
    hasPremium: true,
  }),
}));

describe('ScanVIN', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the ScanVIN page with premium badge', async () => {
    render(
      <MemoryRouter>
        <ScanVIN />
      </MemoryRouter>
    );

    expect(screen.getByText('Scan VIN')).toBeInTheDocument();
    expect(screen.getByText('Premium 🚀')).toBeInTheDocument();
  });

  test('starts camera when start scan is clicked', async () => {
    // Mock getUserMedia
    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: {
        getUserMedia: jest.fn().mockResolvedValue({}),
      },
      writable: true,
    });

    render(
      <MemoryRouter>
        <ScanVIN />
      </MemoryRouter>
    );

    const startScanButton = screen.getByText('Start Scan');
    fireEvent.click(startScanButton);

    await waitFor(() => {
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled();
    });
  });

  test('saves scan when VIN is detected and save is clicked', async () => {
    // Setup mocks
    const saveVinScanMock = jest.spyOn(supabaseLib, 'saveVinScan');
    
    // Mock canvas toDataURL
    HTMLCanvasElement.prototype.toDataURL = jest.fn().mockReturnValue('data:image/jpeg;base64,abc123');

    render(
      <MemoryRouter>
        <ScanVIN />
      </MemoryRouter>
    );

    // Simulate starting scan and detecting VIN
    const startScanButton = screen.getByText('Start Scan');
    fireEvent.click(startScanButton);

    // Wait for the mock VIN detection (happens after 2000ms in the component)
    await waitFor(() => {
      // Once the scan is complete, the Save Scan button should appear
      const saveButton = screen.queryByText('Save Scan');
      if (saveButton) {
        fireEvent.click(saveButton);
      }
    }, { timeout: 3000 });

    // Verify saveVinScan was called
    await waitFor(() => {
      expect(saveVinScanMock).toHaveBeenCalled();
    });
  });
});
