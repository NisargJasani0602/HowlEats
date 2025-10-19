/* eslint-env jest, browser */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Cart from '../pages/Cart/Cart.jsx';
import { StoreContext } from '../context/StoreContext.js';

// Mock navigate so we can assert navigation to /order
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

// Mock the totals helper so numbers are predictable
jest.mock('../util/cartUtils', () => ({
  calculateCartTotals: jest.fn(() => ({
    subtotal: 25.0,
    shipping: 5.0,
    tax: 2.5,
    total: 32.5,
  })),
}));

// Helper to render cart with a mocked context
function renderWithCtx(ctxValue) {
  return render(
    <BrowserRouter>
      <StoreContext.Provider value={ctxValue}>
        <Cart />
      </StoreContext.Provider>
    </BrowserRouter>
  );
}

describe('Cart.jsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders “Your Shopping Cart” heading and the empty state', () => {
    const ctx = {
      foodList: [],                   // no items
      quantities: {},
      increaseQty: jest.fn(),
      decreaseQty: jest.fn(),
      removeFromCart: jest.fn(),
    };

    renderWithCtx(ctx);

    // Heading
    expect(screen.getByRole('heading', { name: /your shopping cart/i })).toBeInTheDocument();

    // Empty message
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();

    // “Proceed to Checkout” should be disabled when empty
    const cta = screen.getByRole('button', { name: /proceed to checkout/i });
    expect(cta).toBeDisabled();
  });

  test('renders cart items with per-item total and summary totals', () => {
    const ctx = {
      foodList: [
        { id: 'f1', name: 'Paneer Tikka', price: 10, category: 'indian', imageUrl: '' },
        { id: 'f2', name: 'Miso Soup',    price: 5,  category: 'japanese', imageUrl: '' },
      ],
      quantities: { f1: 2, f2: 1 }, // ensures cartItems.length > 0
      increaseQty: jest.fn(),
      decreaseQty: jest.fn(),
      removeFromCart: jest.fn(),
    };

    renderWithCtx(ctx);

    // Items show with names
    expect(screen.getByText('Paneer Tikka')).toBeInTheDocument();
    expect(screen.getByText('Miso Soup')).toBeInTheDocument();

    // Per-item totals shown as $price * qty  (component does toFixed(2)) 
    // e.g., f1: 10 * 2 = 20.00; f2: 5 * 1 = 5.00
    expect(screen.getByText('$20.00')).toBeInTheDocument();
    expect(screen.getAllByText('$5.00')[0]).toBeInTheDocument();

    // Summary totals — taken from our mock of calculateCartTotals
    expect(screen.getByText(/subtotal/i).nextSibling).toHaveTextContent('$25.00');
    expect(screen.getByText(/shipping/i).nextSibling).toHaveTextContent('$5.00');
    expect(screen.getByText(/tax/i).nextSibling).toHaveTextContent('$2.50');
    const totalLabel = screen.getByText('Total', { selector: 'strong' });
    expect(totalLabel.nextSibling).toHaveTextContent('$32.50');
  });

  test('clicking +/- calls decreaseQty / increaseQty with the food id', () => {
    const increaseQty = jest.fn();
    const decreaseQty = jest.fn();
    const removeFromCart = jest.fn();

    const ctx = {
      foodList: [{ id: 'f1', name: 'Paneer Tikka', price: 10, category: 'indian', imageUrl: '' }],
      quantities: { f1: 1 },
      increaseQty,
      decreaseQty,
      removeFromCart,
    };

    renderWithCtx(ctx);

    // The component renders buttons with “-” and “+” text in the quantity input group.
    const minus = screen.getAllByRole('button', { name: '-' })[0];
    const plus  = screen.getAllByRole('button', { name: '+' })[0];

    fireEvent.click(minus);
    expect(decreaseQty).toHaveBeenCalledWith('f1');

    fireEvent.click(plus);
    expect(increaseQty).toHaveBeenCalledWith('f1');
  });

  test('clicking the trash button calls removeFromCart with the food id', () => {
    const removeFromCart = jest.fn();

    const ctx = {
      foodList: [{ id: 'f2', name: 'Miso Soup', price: 5, category: 'japanese', imageUrl: '' }],
      quantities: { f2: 2 },
      increaseQty: jest.fn(),
      decreaseQty: jest.fn(),
      removeFromCart,
    };

    renderWithCtx(ctx);


    const trashBtn = screen.getByRole('button', { name: '' }); // icon-only button; no accessible name
    fireEvent.click(trashBtn);
    expect(removeFromCart).toHaveBeenCalledWith('f2');
  });

  test('Proceed to Checkout navigates to /order when cart has items', () => {
    const ctx = {
      foodList: [{ id: 'f1', name: 'Paneer Tikka', price: 10, category: 'indian', imageUrl: '' }],
      quantities: { f1: 1 },
      increaseQty: jest.fn(),
      decreaseQty: jest.fn(),
      removeFromCart: jest.fn(),
    };

    renderWithCtx(ctx);

    const cta = screen.getByRole('button', { name: /proceed to checkout/i });
    expect(cta).not.toBeDisabled();

    fireEvent.click(cta);
    expect(mockNavigate).toHaveBeenCalledWith('/order');
  });

  test('Continue Shopping link points to "/"', () => {
    const ctx = {
      foodList: [],
      quantities: {},
      increaseQty: jest.fn(),
      decreaseQty: jest.fn(),
      removeFromCart: jest.fn(),
    };

    renderWithCtx(ctx);


    const link = screen.getByRole('link', { name: /continue shopping/i });
    expect(link).toHaveAttribute('href', '/');
  });
});
