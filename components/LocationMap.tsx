'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    L?: any;
  }
}

export default function LocationMap({
  center,
  query,
  onPick,
  readonly = false,
}: {
  center: { lat: number; lng: number };
  query?: string; // "İlçe, İl, Türkiye" — verilirse Nominatim ile aranır
  onPick?: (lat: number, lng: number) => void;
  readonly?: boolean;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapObj = useRef<any>(null);
  const markerObj = useRef<any>(null);
  const lastQuery = useRef<string>('');

  // Haritayı kur (ilk yükleme)
  useEffect(() => {
    let cancelled = false;

    async function ensureLeaflet() {
      if (window.L) return;
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }
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
        mapObj.current = L.map(mapRef.current, { scrollWheelZoom: !readonly }).setView([center.lat, center.lng], readonly ? 15 : 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap',
        }).addTo(mapObj.current);
        markerObj.current = L.marker([center.lat, center.lng], { draggable: !readonly }).addTo(mapObj.current);
        if (!readonly) {
          markerObj.current.on('dragend', () => {
            const p = markerObj.current.getLatLng();
            onPick?.(p.lat, p.lng);
          });
          mapObj.current.on('click', (e: any) => {
            markerObj.current.setLatLng(e.latlng);
            onPick?.(e.latlng.lat, e.latlng.lng);
          });
          onPick?.(center.lat, center.lng);
        }
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // İl merkezi değişince oraya git (koordinat elimizde, anında)
  useEffect(() => {
    if (mapObj.current && markerObj.current) {
      mapObj.current.setView([center.lat, center.lng], 12);
      markerObj.current.setLatLng([center.lat, center.lng]);
      onPick?.(center.lat, center.lng);
    }
  }, [center.lat, center.lng]);

  // İlçe (query) değişince Nominatim ile bul, oraya uç
  useEffect(() => {
    if (!query || query === lastQuery.current) return;
    lastQuery.current = query;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=tr&q=${encodeURIComponent(query)}`,
          { headers: { 'Accept-Language': 'tr' } }
        );
        const data = await res.json();
        if (cancelled || !data || !data.length) return;
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        if (mapObj.current && markerObj.current) {
          mapObj.current.setView([lat, lng], 14);
          markerObj.current.setLatLng([lat, lng]);
          onPick?.(lat, lng);
        }
      } catch {
        // arama başarısızsa il merkezinde kalır
      }
    })();

    return () => { cancelled = true; };
  }, [query]);

  return (
    <div
      ref={mapRef}
      style={{ height: 280, borderRadius: 12, border: '1px solid var(--line)', overflow: 'hidden', zIndex: 1 }}
    />
  );
}
