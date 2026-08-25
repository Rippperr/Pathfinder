import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

jest.mock('./supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      })),
    })),
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
const SignupPage = require('./pages/SignupPage').default;
const { supabase } = require('./supabaseClient');

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

test('sends confirmation emails back to onboarding', async () => {
  supabase.auth.signUp.mockResolvedValue({ error: null });
  jest.spyOn(window, 'alert').mockImplementation(() => {});

  render(
    <MemoryRouter>
      <SignupPage />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByLabelText(/^email$/i), { target: { value: 'new.user@example.com' } });
  fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
  fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

  await waitFor(() => {
    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'new.user@example.com',
      password: 'password123',
      options: {
        emailRedirectTo: `${window.location.origin}/onboarding`,
      },
    });
  });

  window.alert.mockRestore();
});
