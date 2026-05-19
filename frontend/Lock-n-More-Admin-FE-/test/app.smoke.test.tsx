import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '../App';

describe('App Smoke Tests', () => {
  it('renders login route for unauthenticated users', () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('toto_backend_session');

    render(<App />);

    expect(screen.getByText('Authorized Entry')).toBeInTheDocument();
    expect(screen.getByText('Authorize Entry')).toBeInTheDocument();
  });
});
