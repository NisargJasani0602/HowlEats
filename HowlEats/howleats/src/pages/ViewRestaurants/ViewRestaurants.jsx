// src/pages/ViewRestaurants/ViewRestaurants.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { GoogleMap, LoadScript, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { fetchNearbyRestaurants } from '../../service/restaurantService';
import { UserLocationContext } from '../../context/UserLocationContext';
import { StoreContext } from '../../context/StoreContext';
import './ViewRestaurants.css';

function formatDistance(meters) {
  if (meters == null) return '—';
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;
}

const containerStyle = { width: '100%', height: '60vh' };
const defaultCenter = { lat: 41.8781, lng: -87.6298 }; // fallback (Chicago)

const CATEGORIES = [
  'coffee', 'indian', 'japanese', 'burrito', 'sandwich', 'acai', 'mexican', 'pizza', 'burger',
];

const ViewRestaurants = ({ initialCategory = 'coffee' }) => {
  const { location, hasLocation, isLoading, error, requestLocation } = useContext(UserLocationContext);
  const { token } = useContext(StoreContext);
  const [category, setCategory] = useState(initialCategory);
  const [restaurants, setRestaurants] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [activePlaceId, setActivePlaceId] = useState(null);
  const mapRef = useRef(null);

  const center = useMemo(() => {
    if (hasLocation && location) return { lat: location.latitude, lng: location.longitude };
    return defaultCenter;
  }, [hasLocation, location]);

  const onLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  const handleUseMyLocation = async () => {
    try {
      await requestLocation();
    } catch {
      // provider already sets an error state
    }
  };

  const carouselRef = useRef(null);

  const slideLeft = () => {
    if (carouselRef.current) carouselRef.current.scrollLeft -= 500;
  };
  const slideRight = () => {
    if (carouselRef.current) carouselRef.current.scrollLeft += 500;
  };


  const loadNearby = useCallback(async () => {
    if (!center) return;
    setLoadingResults(true);
    setFetchError(null);
    try {
      const data = await fetchNearbyRestaurants({
        category,
        latitude: center.lat,
        longitude: center.lng,
        token,
      });
      setRestaurants(data ?? []);
      if (mapRef.current) {
        mapRef.current.panTo(center);
      }
    } catch (e) {
      setFetchError(e?.message ?? 'Failed to load restaurants.');
    } finally {
      setLoadingResults(false);
    }
  }, [category, center, token]);

  useEffect(() => {
    // auto-load when we have a location
    if (center) loadNearby();
  }, [center, loadNearby]);


  return (
    <div className="vr-page">
      <div className="vr-toolbar">
        <div className="vr-row">
          <label htmlFor="category" className="vr-label">Category</label>
          <select
            id="category"
            className="vr-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>

          <button className="vr-btn" onClick={loadNearby} disabled={loadingResults}>
            {loadingResults ? 'Searching…' : 'Search Nearby'}
          </button>

          <button className="vr-btn-secondary" onClick={handleUseMyLocation} disabled={isLoading}>
            {isLoading ? 'Locating…' : 'Use My Location'}
          </button>

          {error && <span className="vr-error">{error.message}</span>}
          {fetchError && <span className="vr-error">{fetchError}</span>}
        </div>
      </div>

      <LoadScript
        googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
        // optional: mapIds to apply a custom cloud style you created before
        // mapIds={['91fb84aaae6bba29736e9304']}
      >
        <div className="vr-map-wrapper">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={13}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{ streetViewControl: false, mapTypeControl: false }}
        >
          {/* User pin */}
          {hasLocation && location && window.google?.maps && (
            <MarkerF
              position={{ lat: location.latitude, lng: location.longitude }}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 6,
                fillColor: '#1a73e8',
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: '#ffffff',
              }}
              title="You are here"
            />
          )}

          {/* Restaurant markers */}
          {restaurants.map((r) => (
            <MarkerF
              key={r.placeId}
              position={{ lat: r.latitude, lng: r.longitude }}
              onClick={() => setActivePlaceId(r.placeId)}
              title={r.name}
            />
          ))}

          {/* Info window */}
          {activePlaceId && (() => {
            const active = restaurants.find((x) => x.placeId === activePlaceId);
            if (!active) return null;
            return (
              <InfoWindowF
                position={{ lat: active.latitude, lng: active.longitude }}
                onCloseClick={() => setActivePlaceId(null)}
              >
                <div className="vr-infowindow">
                  <div className="vr-title">{active.name}</div>
                  <div className="vr-sub">{active.address}</div>
                  <div className="vr-meta">
                    <span>Category: {active.category}</span>
                    <span>⭐ {active.rating ?? 'N/A'}</span>
                    <span>{formatDistance(active.distanceMeters)}</span>
                  </div>
                </div>
              </InfoWindowF>
            );
          })()}
        </GoogleMap>
        </div>
      </LoadScript>

      {/* ===== Nearby Restaurants Carousel ===== */}
        {restaurants?.length > 0 && (
          <div className="vr-carousel-wrap">
            {/* Left arrow */}
            <button className="vr-arrow vr-arrow-left" onClick={slideLeft} aria-label="Scroll left">
              ‹
            </button>

            {/* Cards row */}
            <div className="vr-carousel" ref={carouselRef}>
              {restaurants.map((r) => (
                <div
                  key={r.placeId}
                  className={`vr-card ${activePlaceId === r.placeId ? 'vr-card-active' : ''}`}
                  onClick={() => {
                    setActivePlaceId(r.placeId);
                    if (mapRef.current) {
                      mapRef.current.panTo({ lat: r.latitude, lng: r.longitude });
                      mapRef.current.setZoom(14);
                    }
                  }}
                  title={r.name}
                >
                  {r.photoReference ? (
                  <img className="vr-card-img" src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${r.photoReference}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`} alt={r.name} />
                ) : ( <div className="vr-card-placeholder">No image</div>
                )}
                  <div className="vr-card-body">
                    <div className="vr-card-title">{r.name}</div>
                    <div className="vr-card-meta">
                      <span>⭐ {r.rating ?? 'N/A'}</span>
                      <span className="vr-card-cat">{r.category}</span>
                      <span className="vr-card-dist">{formatDistance(r.distanceMeters)}</span>
                    </div>
                    <div className="vr-card-sub">{r.address}</div>
                    {hasLocation && (
                      <div className="vr-directions-chip" onClick={(e) => {
                          e.stopPropagation(); // prevent map panning
                          const origin = `${location.latitude},${location.longitude}`;
                          const destination = `${r.latitude},${r.longitude}`;
                          const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
                          window.open(url, '_blank');
                        }}>
                        <i className="bi bi-geo-alt-fill"></i>
                        <span>Get Directions</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Right arrow */}
            <button className="vr-arrow vr-arrow-right" onClick={slideRight} aria-label="Scroll right">
              ›
            </button>
          </div>
        )}

    </div>
  );
};

ViewRestaurants.propTypes = {
  initialCategory: PropTypes.string,
};

export default ViewRestaurants;
