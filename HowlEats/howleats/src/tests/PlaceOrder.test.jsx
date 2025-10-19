/* eslint-env jest, browser */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PlaceOrder from '../pages/PlaceOrder/PlaceOrder.jsx';
import { StoreContext } from '../context/StoreContext.js';
import axios from 'axios';

// --- Mocks ---
jest.mock('axios');
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));
jest.mock('../util/cartUtils', () => ({
  // make totals predictable; amount = Number(total.toFixed(2)) in onSubmitHandler
  calculateCartTotals: jest.fn(() => ({
    subtotal: 25,
    shipping: 5,
    tax: 2.5,
    total: 32.5,
  })),
}));

// mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

// helper to render with a fake StoreContext
function renderWithCtx(ctxValue) {
  return render(
    <BrowserRouter>
      <StoreContext.Provider value={ctxValue}>
        <PlaceOrder />
      </StoreContext.Provider>
    </BrowserRouter>
  );
}

describe('PlaceOrder.jsx', () => {
  const baseCtx = {
    token: 'jwt-123',
    setQuantities: jest.fn(),
    foodList: [
      { id: 'f1', name: 'Paneer', price: 10, category: 'indian', imageUrl: '', description: 'd', imageURL: '' },
      { id: 'f2', name: 'Miso Soup', price: 5, category: 'japanese', imageUrl: '', description: 'd2', imageURL: '' },
    ],
    quantities: { f1: 2, f2: 1 }, // cartItems derived from these quantities
  };

  beforeEach(() => {
    jest.clearAllMocks();
    axios.post.mockReset();
    axios.delete.mockReset();
    axios.delete.mockResolvedValue({ status: 200 });
    // default: have a Razorpay constructor on window
    global.window.Razorpay = jest.fn(function(options) {
      this.options = options;
      this.open = jest.fn();
    });
  });

  test('renders form fields and disabled submit when cart empty', () => {
    const ctx = { ...baseCtx, foodList: [], quantities: {} };
    renderWithCtx(ctx);

    // Billing address heading
    expect(screen.getByRole('heading', { name: /billing address/i })).toBeInTheDocument();

    // Button should be disabled when cartItems.length === 0
    const btn = screen.getByRole('button', { name: /continue to checkout/i });
    expect(btn).toBeDisabled();
  });

  test('successful order creation triggers Razorpay with expected options', async () => {
    const ctx = { ...baseCtx };

    // mock create order -> 201 + razorpayOrderId
    axios.post.mockResolvedValueOnce({
      status: 201,
      data: { id: 'order-123', amount: 32.5, currency: 'USD', razorpayOrderId: 'raz_abc' },
    });

    renderWithCtx(ctx);

    // fill required fields
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Nisarg' } });
    fireEvent.change(screen.getByLabelText(/last name/i),  { target: { value: 'Jasani' } });
    fireEvent.change(screen.getByLabelText(/^email$/i),    { target: { value: 'wolf@ncsu.edu' } });
    fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: '5555555555' } });
    fireEvent.change(screen.getByLabelText(/state/i),      { target: { value: 'NC' } });
    fireEvent.change(screen.getByLabelText(/city/i),       { target: { value: 'Raleigh' } });
    fireEvent.change(screen.getByLabelText(/zip/i),        { target: { value: '27606' } });
    fireEvent.change(screen.getByLabelText(/address/i),    { target: { value: '123 Hillsborough St' } });

    // submit
    fireEvent.click(screen.getByRole('button', { name: /continue to checkout/i }));

    // after submit, it posts to /api/orders/create with constructed orderData and amount (32.5)
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8080/api/orders/create',
        expect.objectContaining({
          email: 'wolf@ncsu.edu',
          phoneNumber: '5555555555',
          amount: 32.5, // Number(total.toFixed(2))
          orderedItems: expect.arrayContaining([
            expect.objectContaining({ foodId: 'f1', quantity: 2, price: 10 }),
            expect.objectContaining({ foodId: 'f2', quantity: 1, price: 5 }),
          ]),
        }),
        expect.objectContaining({ headers: { Authorization: `Bearer ${ctx.token}` } })
      );
    });

    // Razorpay should be initialized and opened
    expect(window.Razorpay).toHaveBeenCalled();
    const instance = window.Razorpay.mock.instances[0];
    expect(instance.open).toHaveBeenCalled();

    // options passed into Razorpay include order_id and currency
    const options = window.Razorpay.mock.calls[0][0];
    expect(options.order_id).toBe('raz_abc');
    expect(options.currency).toBe('USD');
    expect(options.handler).toEqual(expect.any(Function)); // will test handler below
  });

  test('handler verifies payment → clears cart and navigates to /myorders', async () => {
    const ctx = { ...baseCtx };
    // First call: create order
    axios.post.mockResolvedValueOnce({
      status: 201,
      data: { id: 'order-1', amount: 32.5, currency: 'USD', razorpayOrderId: 'raz_X' },
    });

    // Second call: verify payment
    axios.post.mockResolvedValueOnce({ status: 200 });

    renderWithCtx(ctx);

    // fill minimal required + submit (only fields used in request need to be filled)
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'N' } });
    fireEvent.change(screen.getByLabelText(/last name/i),  { target: { value: 'J' } });
    fireEvent.change(screen.getByLabelText(/^email$/i),    { target: { value: 'wolf@ncsu.edu' } });
    fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: '555' } });
    fireEvent.change(screen.getByLabelText(/address/i),    { target: { value: 'addr' } });
    fireEvent.change(screen.getByLabelText(/state/i),      { target: { value: 'NC' } });
    fireEvent.change(screen.getByLabelText(/city/i),       { target: { value: 'Raleigh' } });
    fireEvent.change(screen.getByLabelText(/zip/i),        { target: { value: '27606' } });

    fireEvent.click(screen.getByRole('button', { name: /continue to checkout/i }));

    // call the Razorpay handler with a fake provider response
    await waitFor(() => expect(window.Razorpay).toHaveBeenCalled());
    const instance = window.Razorpay.mock.instances[0];
    const { handler } = instance.options;
    await handler({
      razorpay_payment_id: 'pay_1',
      razorpay_order_id: 'raz_X',
      razorpay_signature: 'sig',
    });

    // verify endpoint called with token and payload
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8080/api/orders/verify',
        {
          razorpay_payment_id: 'pay_1',
          razorpay_order_id: 'raz_X',
          razorpay_signature: 'sig',
        },
        expect.objectContaining({ headers: { Authorization: `Bearer ${ctx.token}` } })
      );
    });

    // success: should clear cart and navigate to /myorders
    const { toast } = require('react-toastify');
    expect(toast.success).toHaveBeenCalled();
    expect(ctx.setQuantities).toHaveBeenCalledWith({});
    expect(mockNavigate).toHaveBeenCalledWith('/myorders');
  });

  test('modal dismiss cancels payment and deletes order', async () => {
    const ctx = { ...baseCtx };
    // create order returns id
    axios.post.mockResolvedValueOnce({
      status: 201,
      data: { id: 'order-9', amount: 32.5, currency: 'USD', razorpayOrderId: 'raz_9' },
    });
    // delete order succeeds
    axios.delete.mockResolvedValueOnce({ status: 204 });

    renderWithCtx(ctx);

    // minimal fill
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'N' } });
    fireEvent.change(screen.getByLabelText(/last name/i),  { target: { value: 'J' } });
    fireEvent.change(screen.getByLabelText(/^email$/i),    { target: { value: 'wolf@ncsu.edu' } });
    fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: '555' } });
    fireEvent.change(screen.getByLabelText(/address/i),    { target: { value: 'addr' } });
    fireEvent.change(screen.getByLabelText(/state/i),      { target: { value: 'NC' } });
    fireEvent.change(screen.getByLabelText(/city/i),       { target: { value: 'Raleigh' } });
    fireEvent.change(screen.getByLabelText(/zip/i),        { target: { value: '27606' } });

    fireEvent.click(screen.getByRole('button', { name: /continue to checkout/i }));

    await waitFor(() => expect(window.Razorpay).toHaveBeenCalled());
    const instance = window.Razorpay.mock.instances[0];

    // call modal ondismiss
    await instance.options.modal.ondismiss();

    const { toast } = require('react-toastify');
    expect(toast.error).toHaveBeenCalledWith('Payment Cancelled.');
    expect(axios.delete).toHaveBeenCalledWith(
      'http://localhost:8080/api/orders/order-9',
      expect.objectContaining({ headers: { Authorization: `Bearer ${ctx.token}` } })
    );
  });

  test('when gateway script is missing, shows toast error instead of opening payment', async () => {
    delete global.window.Razorpay; // simulate missing script

    const ctx = { ...baseCtx };
    axios.post.mockResolvedValueOnce({
      status: 201,
      data: { id: 'order-2', amount: 32.5, currency: 'USD', razorpayOrderId: 'raz_2' },
    });

    renderWithCtx(ctx);

    // fill minimal required + submit
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'N' } });
    fireEvent.change(screen.getByLabelText(/last name/i),  { target: { value: 'J' } });
    fireEvent.change(screen.getByLabelText(/^email$/i),    { target: { value: 'wolf@ncsu.edu' } });
    fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: '555' } });
    fireEvent.change(screen.getByLabelText(/address/i),    { target: { value: 'addr' } });
    fireEvent.change(screen.getByLabelText(/state/i),      { target: { value: 'NC' } });
    fireEvent.change(screen.getByLabelText(/city/i),       { target: { value: 'Raleigh' } });
    fireEvent.change(screen.getByLabelText(/zip/i),        { target: { value: '27606' } });

    fireEvent.click(screen.getByRole('button', { name: /continue to checkout/i }));

    const { toast } = require('react-toastify');
    // initiateRazorpayment returns early with error toast if !window.Razorpay
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Payment gateway is unavailable right now. Please try again later.'
      );
    });
  });
});
