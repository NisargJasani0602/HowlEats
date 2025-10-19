/* eslint-env jest, browser */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext.js';
import Login from '../components/Login/Login.jsx';

// --- Mocks ---
jest.mock('../service/authService', () => ({
  loginUser: jest.fn(),
}));
import { loginUser } from '../service/authService';

// mock toast
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// helper to render with a fake StoreContext
function renderWithProviders(ui, { setToken = jest.fn(), loadCartData = jest.fn() } = {}) {
  return {
    setToken,
    loadCartData,
    ...render(
      <BrowserRouter>
        <StoreContext.Provider value={{ setToken, loadCartData }}>
          {ui}
        </StoreContext.Provider>
      </BrowserRouter>
    ),
  };
}

describe('Login.jsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // keep a clean localStorage per test
    const store = {};
    jest.spyOn(window.localStorage.__proto__, 'setItem').mockImplementation((k, v) => { store[k] = String(v); });
    jest.spyOn(window.localStorage.__proto__, 'getItem').mockImplementation((k) => store[k] || null);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders email & password fields with labels', () => {
    renderWithProviders(<Login />);
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('allows typing into controlled inputs', () => {
    renderWithProviders(<Login />);
    const email = screen.getByLabelText(/email address/i);
    const password = screen.getByLabelText(/password/i);

    fireEvent.change(email, { target: { value: 'wolf@ncsu.edu' } });
    fireEvent.change(password, { target: { value: 'secret123' } });

    expect(email).toHaveValue('wolf@ncsu.edu');
    expect(password).toHaveValue('secret123');
  });

  test('successful login: sets token, loads cart, toasts, navigates home', async () => {
    loginUser.mockResolvedValueOnce({
      status: 200,
      data: { token: 'jwt-abc' },
    });

    const setToken = jest.fn();
    const loadCartData = jest.fn().mockResolvedValueOnce();
    renderWithProviders(<Login />, { setToken, loadCartData });

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'wolf@ncsu.edu' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret123' } });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith({ email: 'wolf@ncsu.edu', password: 'secret123' });
      expect(setToken).toHaveBeenCalledWith('jwt-abc');
      expect(window.localStorage.setItem).toHaveBeenCalledWith('token', 'jwt-abc');
      expect(loadCartData).toHaveBeenCalledWith('jwt-abc');
      // toast + navigate
      const { toast } = require('react-toastify');
      expect(toast.success).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('unsuccessful login (non-200): shows error toast, no navigate', async () => {
    loginUser.mockResolvedValueOnce({ status: 401, data: {} });

    renderWithProviders(<Login />);

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'wolf@ncsu.edu' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'badpass' } });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      const { toast } = require('react-toastify');
      expect(toast.error).toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  test('exception path: shows error toast', async () => {
    loginUser.mockRejectedValueOnce(new Error('network down'));

    renderWithProviders(<Login />);

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'wolf@ncsu.edu' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'whatever' } });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      const { toast } = require('react-toastify');
      expect(toast.error).toHaveBeenCalled();
    });
  });

  test('reset button currently does not clear controlled inputs (documents current behavior)', () => {
    renderWithProviders(<Login />);
    const email = screen.getByLabelText(/email address/i);
    const password = screen.getByLabelText(/password/i);

    fireEvent.change(email, { target: { value: 'wolf@ncsu.edu' } });
    fireEvent.change(password, { target: { value: 'secret123' } });

    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));
    // Because state is controlled by React and there is no onReset handler,
    // inputs remain unchanged. This test documents the behavior.
    expect(email).toHaveValue('wolf@ncsu.edu');
    expect(password).toHaveValue('secret123');
  });
});
