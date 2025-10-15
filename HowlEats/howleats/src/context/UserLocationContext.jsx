import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import { UserLocationContext } from './UserLocationContext';

const defaultOptions = {
  enableHighAccuracy: true,
  timeout: 10_000,
  maximumAge: 60_000,
};

const buildLocationPayload = (position) => ({
  latitude: position.coords.latitude,
  longitude: position.coords.longitude,
  accuracy: position.coords.accuracy,
  altitude: position.coords.altitude,
  altitudeAccuracy: position.coords.altitudeAccuracy,
  heading: position.coords.heading,
  speed: position.coords.speed,
  timestamp: position.timestamp,
});

export const UserLocationProvider = ({
  children,
  geolocationOptions = defaultOptions,
  autoRequest = false,
  autoWatch = false,
}) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const watchIdRef = useRef(null);

  const ensureSupported = useCallback(() => {
    if (!('geolocation' in navigator)) {
      const unsupportedError = new Error('Geolocation is not supported by this browser.');
      unsupportedError.code = 'GEOLOCATION_UNSUPPORTED';
      throw unsupportedError;
    }
  }, []);

  const handleSuccess = useCallback((position) => {
    setLocation(buildLocationPayload(position));
    setError(null);
    setIsLoading(false);
  }, []);

  const handleError = useCallback((geoError) => {
    const messages = {
      1: 'Permission to access location was denied.',
      2: 'Location information is unavailable.',
      3: 'Location request timed out.',
    };

    const err = new Error(messages[geoError.code] ?? 'Unable to retrieve your location.');
    err.code = geoError.code;
    setError(err);
    setIsLoading(false);
  }, []);

  const requestLocation = useCallback(
    (options = geolocationOptions) => {
      setIsLoading(true);
      try {
        ensureSupported();
      } catch (unsupportedError) {
        setIsLoading(false);
        setError(unsupportedError);
        return Promise.reject(unsupportedError);
      }

      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            handleSuccess(position);
            resolve(buildLocationPayload(position));
          },
          (geoError) => {
            handleError(geoError);
            reject(geoError);
          },
          options,
        );
      });
    },
    [ensureSupported, geolocationOptions, handleError, handleSuccess],
  );

  const clearWatch = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const startWatching = useCallback(
    (options = geolocationOptions) => {
      try {
        ensureSupported();
      } catch (unsupportedError) {
        setError(unsupportedError);
        return null;
      }

      if (watchIdRef.current !== null) {
        return watchIdRef.current;
      }

      const id = navigator.geolocation.watchPosition(handleSuccess, handleError, options);
      watchIdRef.current = id;
      return id;
    },
    [ensureSupported, geolocationOptions, handleError, handleSuccess],
  );

  const stopWatching = useCallback(() => {
    clearWatch();
  }, [clearWatch]);

  useEffect(() => {
    if (autoRequest) {
      requestLocation();
    }
  }, [autoRequest, requestLocation]);

  useEffect(() => {
    if (autoWatch) {
      startWatching();
    }
    return () => {
      clearWatch();
    };
  }, [autoWatch, startWatching, clearWatch]);

  const value = useMemo(
    () => ({
      location,
      hasLocation: Boolean(location),
      error,
      isLoading,
      requestLocation,
      startWatching,
      stopWatching,
    }),
    [error, isLoading, location, requestLocation, startWatching, stopWatching],
  );

  return <UserLocationContext.Provider value={value}>{children}</UserLocationContext.Provider>;
};

export default UserLocationProvider;

UserLocationProvider.propTypes = {
  children: PropTypes.node.isRequired,
  geolocationOptions: PropTypes.shape({
    enableHighAccuracy: PropTypes.bool,
    timeout: PropTypes.number,
    maximumAge: PropTypes.number,
  }),
  autoRequest: PropTypes.bool,
  autoWatch: PropTypes.bool,
};
