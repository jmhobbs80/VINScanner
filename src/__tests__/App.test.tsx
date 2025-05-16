
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

describe('App component', () => {
  test('renders without crashing', () => {
    // Mock necessary context providers
    jest.mock('../contexts/AuthContext', () => ({
      useAuth: () => ({
        user: null,
        loading: true,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
      }),
      AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    }));
    
    render(<App />);
    // App should render without throwing
    expect(true).toBeTruthy();
  });
});
