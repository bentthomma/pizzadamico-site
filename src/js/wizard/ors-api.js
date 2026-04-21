// OpenRouteService Wrapper fuer Adress-Autocomplete + Distanz-Berechnung
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

// Haversine fallback: Luftlinie in km. Multipliziert mit empirisch ermitteltem
// Road-Faktor (~1.35 für Schweizer Strassennetz) fuer Strassen-km Schaetzung.
function haversineKm(a, b) {
  const R = 6371;
  const toRad = (d) => d * Math.PI / 180;
  const [lon1, lat1] = a;
  const [lon2, lat2] = b;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

// Berechnet Strassen-km von Münsingen zur Ziel-Adresse.
// Strategie: POST mit grossem radiuses-Wert für entlegene Koordinaten,
// bei Fehler Haversine-Luftlinie × 1.35 als Fallback (gibt User immer ein
// Resultat, auch wenn ORS Routing fehlschlaegt).
export async function calculateDistance(destCoords) {
  try {
    const body = {
      coordinates: [ORIGIN_COORDS, destCoords],
      // radiuses 2km pro Punkt: snapped auch entlegene Adressen an Strassennetz.
      radiuses: [2000, 2000],
      units: 'km',
    };
    const res = await fetch(DIRECTIONS_URL, {
      method: 'POST',
      headers: {
        'Authorization': ORS_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const km = data.routes?.[0]?.summary?.distance;
    if (typeof km === 'number') {
      return Math.round(km * 10) / 10;
    }
    throw new Error('Invalid response shape');
  } catch (err) {
    console.warn('ORS Directions failed, using haversine fallback:', err.message);
    const airlineKm = haversineKm(ORIGIN_COORDS, destCoords);
    // 1.35× ist empirisch fuer Schweizer Strassennetz (Berg-/Kurvenfaktor).
    return Math.round(airlineKm * 1.35 * 10) / 10;
  }
}
