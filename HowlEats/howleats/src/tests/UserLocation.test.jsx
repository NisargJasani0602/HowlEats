/* eslint-env jest, browser */
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import UserLocationProvider from '../context/UserLocationContext.jsx';
import { UserLocationContext } from '../context/UserLocationContext.js';

describe('UserLocationProvider', () => {
  const originalGeolocation = navigator.geolocation;

  beforeEach(() => {
    jest.clearAllMocks();
    global.navigator.geolocation = {
      getCurrentPosition: jest.fn(),
      watchPosition: jest.fn(),
      clearWatch: jest.fn(),
    };
  });

  afterEach(() => {
    navigator.geolocation = originalGeolocation;
  });

  test('requests and sets location successfully', async () => {
    const fakePos = { coords: { latitude: 35, longitude: -78, accuracy: 10 }, timestamp: Date.now() };
    navigator.geolocation.getCurrentPosition.mockImplementationOnce((success) => success(fakePos));

    const wrapper = ({ children }) => <UserLocationProvider>{children}</UserLocationProvider>;
    const { result } = renderHook(() => React.useContext(UserLocationContext), { wrapper });

    await act(async () => {
      await result.current.requestLocation();
    });

    expect(result.current.location.latitude).toBe(35);
    expect(result.current.hasLocation).toBe(true);
    expect(result.current.error).toBeNull();
  });

  test('handles permission denied error', async () => {
    navigator.geolocation.getCurrentPosition.mockImplementationOnce((_, fail) =>
      fail({ code: 1 })
    );

    const wrapper = ({ children }) => <UserLocationProvider>{children}</UserLocationProvider>;
    const { result } = renderHook(() => React.useContext(UserLocationContext), { wrapper });

    await act(async () => {
      try {
        await result.current.requestLocation();
      } catch {
        // Intentionally ignored
      }
    });

    expect(result.current.error.message).toMatch(/denied/i);
  });

  test('autoWatch starts watchPosition and cleans up on unmount', () => {
    const clearSpy = jest.spyOn(navigator.geolocation, 'clearWatch');
    const watchSpy = jest.spyOn(navigator.geolocation, 'watchPosition').mockReturnValue(123);

    const { unmount } = renderHook(
      () => React.useContext(UserLocationContext),
      { wrapper: ({ children }) => <UserLocationProvider autoWatch>{children}</UserLocationProvider> }
    );

    expect(watchSpy).toHaveBeenCalled();
    unmount();
    expect(clearSpy).toHaveBeenCalledWith(123);
  });
});
