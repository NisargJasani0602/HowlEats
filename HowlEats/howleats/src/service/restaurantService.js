import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export async function fetchNearbyRestaurants({ category, latitude, longitude, token }) {
  const headers = token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : undefined;

  const res = await axios.get(`${API_BASE_URL}/api/restaurants/nearby`, {
    params: { category, latitude, longitude },
    headers,
  });
  return res.data;
}
