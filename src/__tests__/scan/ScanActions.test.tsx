
import { render, screen, fireEvent } from '@testing-library/react';
import ScanActions from '@/components/scan/ScanActions';
import '@testing-library/jest-native/extend-expect';
import '@testing-library/jest-dom';

describe('ScanActions', () => {
  const mockStartScan = jest.fn();
  const mockStopScan = jest.fn();
  const mockSaveScan = jest.fn();
  const mockManualEntry = jest.fn();
  const mockCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders Start Scan button when not scanning', () => {
    render(
      <ScanActions
        cameraActive={false}
        scanning={false}
        scanned={false}
        onStartScan={mockStartScan}
        onStopScan={mockStopScan}
        onSaveScan={mockSaveScan}
        onManualEntry={mockManualEntry}
        onCancel={mockCancel}
      />
    );

    const button = screen.getByTestId('toggle-scan-button');
    expect(button).toHaveTextContent('Start Scan');
    
    fireEvent.click(button);
    expect(mockStartScan).toHaveBeenCalledTimes(1);
  });

  test('renders Stop Scan button when camera is active', () => {
    render(
      <ScanActions
        cameraActive={true}
        scanning={false}
        scanned={false}
        onStartScan={mockStartScan}
        onStopScan={mockStopScan}
        onSaveScan={mockSaveScan}
        onManualEntry={mockManualEntry}
        onCancel={mockCancel}
      />
    );

    const button = screen.getByTestId('toggle-scan-button');
    expect(button).toHaveTextContent('Stop Scan');
    
    fireEvent.click(button);
    expect(mockStopScan).toHaveBeenCalledTimes(1);
  });

  test('renders Save Scan button when VIN is scanned', () => {
    render(
      <ScanActions
        cameraActive={true}
        scanning={false}
        scanned={true}
        onStartScan={mockStartScan}
        onStopScan={mockStopScan}
        onSaveScan={mockSaveScan}
        onManualEntry={mockManualEntry}
        onCancel={mockCancel}
      />
    );

    const button = screen.getByTestId('save-scan-button');
    expect(button).toHaveTextContent('Save Scan');
    
    fireEvent.click(button);
    expect(mockSaveScan).toHaveBeenCalledTimes(1);
  });

  test('manual entry button works', () => {
    render(
      <ScanActions
        cameraActive={true}
        scanning={false}
        scanned={false}
        onStartScan={mockStartScan}
        onStopScan={mockStopScan}
        onSaveScan={mockSaveScan}
        onManualEntry={mockManualEntry}
        onCancel={mockCancel}
      />
    );

    const button = screen.getByTestId('manual-entry-link');
    fireEvent.click(button);
    expect(mockManualEntry).toHaveBeenCalledTimes(1);
  });
});
