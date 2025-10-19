/* eslint-env jest, browser */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from '../components/Register/Register.jsx';

// --- Mocks ---
jest.mock('../service/authService', () => ({
  registerUser: jest.fn(),
}));
import { registerUser } from '../service/authService';

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderWithRouter(ui) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe('Register.jsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders required fields and submit button', () => {
    renderWithRouter(<Register />);
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();

    // ensure required flags are present
    expect(screen.getByLabelText(/username/i)).toBeRequired();
    expect(screen.getByLabelText(/email address/i)).toBeRequired();
    expect(screen.getByLabelText(/password/i)).toBeRequired();
  });

  test('controlled inputs: typing updates values', () => {
    renderWithRouter(<Register />);
    const name = screen.getByLabelText(/username/i);
    const email = screen.getByLabelText(/email address/i);
    const password = screen.getByLabelText(/password/i);

    fireEvent.change(name, { target: { value: 'Nisarg' } });
    fireEvent.change(email, { target: { value: 'wolf@ncsu.edu' } });
    fireEvent.change(password, { target: { value: 'Secr3t!' } });

    expect(name).toHaveValue('Nisarg');
    expect(email).toHaveValue('wolf@ncsu.edu');
    expect(password).toHaveValue('Secr3t!');
  });

  test('successful registration: shows success toast and navigates to /login', async () => {
    registerUser.mockResolvedValueOnce({ status: 201, data: {} });
    renderWithRouter(<Register />);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'Nisarg' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'wolf@ncsu.edu' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Secr3t!' } });

    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      const { toast } = require('react-toastify');
      expect(registerUser).toHaveBeenCalledWith({
        name: 'Nisarg',
        email: 'wolf@ncsu.edu',
        password: 'Secr3t!',
      });
      expect(toast.success).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  test('non-201 response: shows error toast and does not navigate', async () => {
    registerUser.mockResolvedValueOnce({ status: 400, data: {} });
    renderWithRouter(<Register />);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'Nisarg' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'wolf@ncsu.edu' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'oops' } });

    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      const { toast } = require('react-toastify');
      expect(toast.error).toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  test('exception path: shows error toast', async () => {
    registerUser.mockRejectedValueOnce(new Error('network down'));
    renderWithRouter(<Register />);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'Nisarg' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'wolf@ncsu.edu' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Secr3t!' } });

    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      const { toast } = require('react-toastify');
      expect(toast.error).toHaveBeenCalled();
    });
  });

  test('link to Sign In is present', () => {
    renderWithRouter(<Register />);
    // It’s a link, not a button
    expect(screen.getByRole('link', { name: /have an account\? sign in/i })).toBeInTheDocument();
  });
});
