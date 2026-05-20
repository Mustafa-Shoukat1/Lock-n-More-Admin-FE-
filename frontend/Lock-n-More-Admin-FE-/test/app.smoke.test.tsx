import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import App from '../App';

// ─── App-level routing ─────────────────────────────────────────────────────────
describe('App routing (unauthenticated)', () => {
  beforeEach(() => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('toto_backend_session');
  });

  it('renders login page for unauthenticated users', () => {
    render(<App />);
    expect(screen.getByText('Authorized Entry')).toBeInTheDocument();
  });

  it('shows email and password inputs on login page', () => {
    render(<App />);
    expect(screen.getByPlaceholderText('name@company.com')).toBeInTheDocument();
    // password field is type="password"
    const inputs = document.querySelectorAll('input');
    expect(inputs.length).toBeGreaterThanOrEqual(2);
  });

  it('shows submit button labelled "Authorize Entry"', () => {
    render(<App />);
    expect(screen.getByText('Authorize Entry')).toBeInTheDocument();
  });
});

// ─── Login form interaction ────────────────────────────────────────────────────
describe('Login form behaviour', () => {
  beforeEach(() => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('toto_backend_session');
    vi.clearAllMocks();
  });

  it('shows an error when login API fails', async () => {
    // Mock fetch to simulate backend 401
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => JSON.stringify({ error: 'Invalid credentials' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    render(<App />);

    fireEvent.change(screen.getByPlaceholderText('name@company.com'), {
      target: { value: 'bad@test.com' },
    });

    // Fill password input (second <input>)
    const inputs = document.querySelectorAll('input');
    const passwordInput = Array.from(inputs).find((i) => i.type === 'password');
    if (passwordInput) {
      fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    }

    fireEvent.click(screen.getByText('Authorize Entry'));

    await waitFor(() => {
      expect(screen.getByText(/Unauthorized Perimeter Entry/i)).toBeInTheDocument();
    });

    vi.unstubAllGlobals();
  });
});
