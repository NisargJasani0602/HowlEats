import { createContext } from 'react';

export const UserLocationContext = createContext({
  location: null,
  hasLocation: false,
  isLoading: false,
  error: null,
  requestLocation: async () => null,
  startWatching: () => null,
  stopWatching: () => {},
});
