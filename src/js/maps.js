import { patch } from './wizard/state.js';

const ORIGIN = { lat: 46.8734, lng: 7.5625 }; // Schlossstrasse 15, 3110 Münsingen

let loadPromise = null;

export function loadMaps() {
  if (loadPromise) return loadPromise;
  const key = import.meta.env.VITE_GOOGLE_MAPS_KEY;
  if (!key || key === 'REPLACE_ME') return Promise.reject(new Error('missing VITE_GOOGLE_MAPS_KEY'));

  loadPromise = new Promise((resolve, reject) => {
    const cb = `__gmapsCb_${Date.now()}`;
    window[cb] = () => { resolve(window.google); delete window[cb]; };
    const s = document.createElement('script');
    s.async = true;
    s.defer = true;
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places&callback=${cb}&language=de&region=CH`;
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return loadPromise;
}

export async function attachPlaces(inputEl) {
  if (!inputEl) return;
  const google = await loadMaps();
  const ac = new google.maps.places.Autocomplete(inputEl, {
    componentRestrictions: { country: ['ch', 'li'] },
    fields: ['place_id', 'formatted_address', 'geometry'],
    types: ['geocode'],
  });
  ac.addListener('place_changed', async () => {
    const place = ac.getPlace();
    if (!place.geometry) return;
    const dest = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
    const km = await distanceKm(dest);
    patch({ address: place.formatted_address, addressPlaceId: place.place_id, distanceKm: km });
    document.dispatchEvent(new CustomEvent('wizard:address-picked'));
  });
}

async function distanceKm(destination) {
  const google = await loadMaps();
  return new Promise((resolve) => {
    const svc = new google.maps.DistanceMatrixService();
    svc.getDistanceMatrix({
      origins: [ORIGIN],
      destinations: [destination],
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC,
    }, (res, status) => {
      if (status !== 'OK' || !res?.rows?.[0]?.elements?.[0]?.distance) return resolve(null);
      const meters = res.rows[0].elements[0].distance.value;
      resolve(Math.round(meters / 100) / 10);
    });
  });
}

export async function initAkt7Map() {
  const container = document.getElementById('akt7-map');
  if (!container) return;
  try {
    const google = await loadMaps();
    const map = new google.maps.Map(container, {
      center: ORIGIN,
      zoom: 13,
      disableDefaultUI: true,
      gestureHandling: 'cooperative',
      styles: DARK_STYLE,
    });
    new google.maps.Marker({ position: ORIGIN, map, title: 'Schlossstrasse 15, Münsingen' });
  } catch (e) {
    console.warn('[maps] init failed:', e);
  }
}

const DARK_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1A0F08' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1A0F08' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#C9A66B' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#8A7B6A' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a1e16' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#C9A66B' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#14100C' }] },
];
