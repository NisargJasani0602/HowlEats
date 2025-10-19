/* eslint-env jest, browser */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StoreContextProvider from '../context/StoreContext.jsx';
import { StoreContext } from '../context/StoreContext.js';

// ---- Mock services the context calls ----
jest.mock('../service/foodService', () => ({
  fetchFoodList: jest.fn().mockResolvedValue([
    { id: 'f1', name: 'Paneer Tikka', price: 12 },
  ]),
}));

jest.mock('../service/cartService', () => ({
  getCartData: jest.fn().mockResolvedValue({ f1: 2, f2: 1 }),
  addToCart: jest.fn().mockResolvedValue({ status: 200 }),
  removeQtyFromCart: jest.fn().mockResolvedValue({ status: 200 }),
}));

// util helper if your context imports anything else—add mocks similarly
// jest.mock('../../service/orderService', ...)

const renderWithProvider = (ui) =>
  render(<StoreContextProvider>{ui}</StoreContextProvider>);

// A tiny consumer to poke the context
function TestConsumer() {
  const ctx = React.useContext(StoreContext);
  if (!ctx) return null;

  return (
    <div>
      <div data-testid="token">{ctx.token || ''}</div>
      <div data-testid="qty-f1">{ctx.quantities?.f1 ?? 0}</div>
      <button onClick={() => ctx.setToken('tkn-123')}>setToken</button>
      <button onClick={() => ctx.increaseQty('f1')}>incF1</button>
      <button onClick={() => ctx.decreaseQty('f1')}>decF1</button>
      <button onClick={() => ctx.removeFromCart('f1')}>removeF1</button>
      <button onClick={() => ctx.loadCartData('jwt')}>loadCart</button>
    </div>
  );
}

describe('StoreContext', () => {
  const origLocalStorage = global.localStorage;
  let store;

  beforeEach(() => {
    // clean module state between tests
    jest.resetModules();
    jest.clearAllMocks();

    // simple in-memory localStorage
    store = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (k) => (k in store ? store[k] : null),
        setItem: (k, v) => {
          store[k] = String(v);
        },
        removeItem: (k) => delete store[k],
        clear: () => {
          store = {};
        },
      },
      writable: true,
    });
  });

  afterAll(() => {
    Object.defineProperty(window, 'localStorage', { value: origLocalStorage });
  });

  test('exposes default values and renders without crashing', async () => {
    renderWithProvider(<TestConsumer />);
    await waitFor(() => {
      expect(screen.getByTestId('token')).toBeInTheDocument();
    });
    expect(screen.getByTestId('token').textContent).toBe('');
    expect(screen.getByTestId('qty-f1').textContent).toBe('0');
  });

  test('setToken updates state', async () => {
    renderWithProvider(<TestConsumer />);
    await waitFor(() => {
      expect(screen.getByTestId('token')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('setToken'));

    // state reflect
    expect(screen.getByTestId('token').textContent).toBe('tkn-123');
  });

  test('increaseQty / decreaseQty mutate quantities locally', async () => {
    renderWithProvider(<TestConsumer />);
    await waitFor(() => {
      expect(screen.getByTestId('qty-f1')).toBeInTheDocument();
    });
    // start 0
    expect(screen.getByTestId('qty-f1').textContent).toBe('0');

    fireEvent.click(screen.getByText('incF1'));
    expect(screen.getByTestId('qty-f1').textContent).toBe('1');

    fireEvent.click(screen.getByText('incF1'));
    expect(screen.getByTestId('qty-f1').textContent).toBe('2');

    fireEvent.click(screen.getByText('decF1'));
    expect(screen.getByTestId('qty-f1').textContent).toBe('1');
  });

  test('removeFromCart zeroes out the item', async () => {
    renderWithProvider(<TestConsumer />);
    await waitFor(() => {
      expect(screen.getByText('incF1')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('incF1'));
    fireEvent.click(screen.getByText('incF1'));
    expect(screen.getByTestId('qty-f1').textContent).toBe('2');

    fireEvent.click(screen.getByText('removeF1'));
    expect(screen.getByTestId('qty-f1').textContent).toBe('0');
  });

  test('loadCartData pulls server quantities and merges into state', async () => {
    renderWithProvider(<TestConsumer />);

    await waitFor(() => {
      expect(screen.getByText('loadCart')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('loadCart'));

    await waitFor(() => {
      expect(screen.getByTestId('qty-f1').textContent).toBe('2');
    });
  });
});
