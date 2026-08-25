import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

jest.mock('./supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
    },
    from: jest.fn(),
  },
}));

jest.mock('./contexts/UserContext', () => ({
  useUser: () => ({
    session: { user: { id: 'test-user-id' } },
    profile: { name: 'Test User' },
    refetchProfile: jest.fn(),
  }),
}));

const LoginPage = require('./pages/LoginPage').default;
const OnboardingPage = require('./pages/OnboardingPage').default;

test('renders the login form', () => {
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );

  expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
});

test('renders the onboarding form for a new user', () => {
  render(
    <MemoryRouter>
      <OnboardingPage />
    </MemoryRouter>
  );

  expect(screen.getByRole('heading', { name: /build your career starting point/i })).toBeInTheDocument();
  expect(screen.getByLabelText(/experience/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /continue to my dashboard/i })).toBeInTheDocument();
});
