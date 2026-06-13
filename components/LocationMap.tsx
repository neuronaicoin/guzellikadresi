'use client';

import { useEffect, useRef } from 'react';

// Leaflet'i CDN'den dinamik yükler (bundle'ı şişirmez, hızlı).
declare global {
  interface Window {
    L?: any;
  }
}

export default function LocationMap({
  center,
  onPick,
}: {
  center: { lat: number; lng: number };
  onPick: (lat: number, lng: number) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapObj = useRef<any>(null);
  const markerObj = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;

    async function ensureLeaflet() {
      if (window.L) return;
      // CSS
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }
      // JS
      await new Promise<void>((resolve) => {
        const s = document.createElement('script');
        s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        s.onload = () => resolve();
        document.body.appendChild(s);
      });
    }

    (async () => {
      await ensureLeaflet();
      if (cancelled || !mapRef.current || !window.L) return;
      const L = window.L;

      if (!mapObj.current) {
        mapObj.current = L.map(mapRef.current).setView([center.lat, center.lng], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap',
        }).addTo(mapObj.current);

        markerObj.current = L.marker([center.lat, center.lng], { draggable: true }).addTo(mapObj.current);
        markerObj.current.on('dragend', () => {
          const p = markerObj.current.getLatLng();
          onPick(p.lat, p.lng);
        });
        // haritaya tıklayınca pin oraya gitsin
        mapObj.current.on('click', (e: any) => {
          markerObj.current.setLatLng(e.latlng);
          onPick(e.latlng.lat, e.latlng.lng);
        });
        onPick(center.lat, center.lng);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // center değişince (il/ilçe seçimi) haritayı oraya taşı
  useEffect(() => {
    if (mapObj.current && markerObj.current) {
      mapObj.current.setView([center.lat, center.lng], 13);
      markerObj.current.setLatLng([center.lat, center.lng]);
      onPick(center.lat, center.lng);
    }
  }, [center.lat, center.lng]);

  return (
    <div
      ref={mapRef}
      style={{ height: 280, borderRadius: 12, border: '1px solid var(--line)', overflow: 'hidden', zIndex: 1 }}
    />
  );
}
