// OpenRouteService Wrapper für Adress-Autocomplete + Distanz-Berechnung
// Pizza D'Amico Standort: Schlossstrasse 15, 3110 Münsingen

const ORS_API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImQ0OTA0YzAwNWFkMDQzNjRhNjM3MTUzYWNmMWIxNTQyIiwiaCI6Im11cm11cjY0In0=';
const ORIGIN_COORDS = [7.5645, 46.8789];  // Münsingen Schlossstrasse 15 · [lon, lat]
const GEOCODE_URL = 'https://api.openrouteservice.org/geocode/autocomplete';
const DIRECTIONS_URL = 'https://api.openrouteservice.org/v2/directions/driving-car';

// Debounced autocomplete search
let searchTimer = null;
export function searchAddress(query, callback) {
  clearTimeout(searchTimer);
  if (!query || query.length < 3) {
    callback([]);
    return;
  }
  searchTimer = setTimeout(async () => {
    try {
      const params = new URLSearchParams({
        api_key: ORS_API_KEY,
        text: query,
        'boundary.country': 'CH',
        size: 5,
      });
      const res = await fetch(`${GEOCODE_URL}?${params}`);
      const data = await res.json();
      const suggestions = (data.features || []).map(f => ({
        label: f.properties.label,
        coords: f.geometry.coordinates,  // [lon, lat]
      }));
      callback(suggestions);
    } catch (err) {
      console.error('ORS Geocoding failed:', err);
      callback([]);
    }
  }, 300);
}

// Berechnet Strassen-km von Münsingen zur Ziel-Adresse
export async function calculateDistance(destCoords) {
  try {
    const params = new URLSearchParams({
      api_key: ORS_API_KEY,
      start: ORIGIN_COORDS.join(','),
      end: destCoords.join(','),
    });
    const res = await fetch(`${DIRECTIONS_URL}?${params}`);
    const data = await res.json();
    const meters = data.features?.[0]?.properties?.summary?.distance;
    if (typeof meters !== 'number') throw new Error('Invalid response');
    return Math.round(meters / 1000 * 10) / 10;  // km mit 1 Nachkommastelle
  } catch (err) {
    console.error('ORS Directions failed:', err);
    throw err;
  }
}
