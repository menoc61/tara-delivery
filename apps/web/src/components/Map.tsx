'use client';

import { useEffect, useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  label?: string;
  color?: string;
}

export interface MapProps {
  /** Initial map center [longitude, latitude] */
  center?: [number, number];
  /** Initial zoom level */
  zoom?: number;
  /** Array of markers to display */
  markers?: MapMarker[];
  /** Called when map is clicked */
  onClick?: (lngLat: [number, number]) => void;
  /** Called when a marker is clicked */
  onMarkerClick?: (marker: MapMarker) => void;
  /** CSS class for the map container */
  className?: string;
  /** Map style URL (defaults to OSM) */
  styleUrl?: string;
}

const DEFAULT_CENTER: [number, number] = [11.5023, 3.8480]; // Yaoundé, Cameroon
const DEFAULT_ZOOM = 12;

// Modern OpenStreetMap style using CartoDB Positron (clean and professional)
const MODERN_STYLE = {
  version: 8,
  sources: {
    'carto-positron': {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        'https://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
      ],
      tileSize: 256,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }
  },
  layers: [{
    id: 'carto-positron',
    type: 'raster',
    source: 'carto-positron'
  }]
};

export function Map({
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  markers = [],
  onClick,
  onMarkerClick,
  className = 'w-full h-full min-h-[400px]',
  styleUrl
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Record<string, maplibregl.Marker>>({});

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: styleUrl || MODERN_STYLE as any,
      center,
      zoom,
      antialias: true
    });

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Add scale control
    map.current.addControl(new maplibregl.ScaleControl());

    // Handle click
    if (onClick) {
      map.current.on('click', (e) => {
        onClick([e.lngLat.lng, e.lngLat.lat]);
      });
    }

    return () => {
      // Cleanup markers
      Object.values(markersRef.current).forEach((marker) => marker.remove());
      markersRef.current = {};
      map.current?.remove();
    };
  }, []);

  // Update center
  useEffect(() => {
    if (!map.current) return;
    map.current.setCenter(center);
  }, [center]);

  // Update markers
  useEffect(() => {
    if (!map.current) return;

    const currentMarkers = markersRef.current;
    const newMarkerIds = new Set(markers.map(m => m.id));

    // Remove markers that no longer exist
    Object.keys(currentMarkers).forEach((id) => {
      if (!newMarkerIds.has(id)) {
        currentMarkers[id].remove();
        delete currentMarkers[id];
      }
    });

    // Add or update markers
    markers.forEach((markerData) => {
      const existingMarker = currentMarkers[markerData.id];

      if (existingMarker) {
        // Update position
        existingMarker.setLngLat([markerData.lng, markerData.lat]);
      } else {
        // Create new marker with a more professional look
        const el = document.createElement('div');
        el.className = 'map-marker-container';

        const markerPin = document.createElement('div');
        markerPin.style.width = '32px';
        markerPin.style.height = '32px';
        markerPin.style.backgroundColor = markerData.color || '#FF6B2C'; // Brand color
        markerPin.style.borderRadius = '50% 50% 50% 0';
        markerPin.style.transform = 'rotate(-45deg)';
        markerPin.style.border = '2px solid white';
        markerPin.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
        markerPin.style.cursor = 'pointer';
        markerPin.style.display = 'flex';
        markerPin.style.alignItems = 'center';
        markerPin.style.justifyContent = 'center';

        // Add a small dot in the middle
        const dot = document.createElement('div');
        dot.style.width = '8px';
        dot.style.height = '8px';
        dot.style.backgroundColor = 'white';
        dot.style.borderRadius = '50%';
        markerPin.appendChild(dot);

        el.appendChild(markerPin);

        const marker = new maplibregl.Marker(el)
          .setLngLat([markerData.lng, markerData.lat])
          .setOffset([0, -16]);

        if (markerData.label) {
          marker.setPopup(
            new maplibregl.Popup({ offset: 25 }).setText(markerData.label)
          );
        }

        if (onMarkerClick) {
          el.addEventListener('click', () => onMarkerClick(markerData));
        }

        marker.addTo(map.current!);
        currentMarkers[markerData.id] = marker;
      }
    });
  }, [markers]);

  return (
    <div
      ref={mapContainer}
      className={className}
      style={{ borderRadius: 'inherit' }}
    />
  );
}

export default Map;
