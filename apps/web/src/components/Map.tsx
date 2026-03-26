"use client";

import { useEffect, useRef, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

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

const DEFAULT_CENTER: [number, number] = [11.5023, 3.848]; // Yaoundé, Cameroon
const DEFAULT_ZOOM = 12;

// OpenStreetMap raster style (free, no API key needed)
const OSM_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
  },
  layers: [
    {
      id: "osm",
      type: "raster",
      source: "osm",
    },
  ],
};

export function Map({
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  markers = [],
  onClick,
  onMarkerClick,
  className = "w-full h-full min-h-[400px]",
  styleUrl,
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Map<string, maplibregl.Marker>>(
    new globalThis.Map(),
  );

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: styleUrl || (OSM_STYLE as any),
      center,
      zoom,
    });

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), "top-right");

    // Add scale control
    map.current.addControl(new maplibregl.ScaleControl());

    // Handle click
    if (onClick) {
      map.current.on("click", (e) => {
        onClick([e.lngLat.lng, e.lngLat.lat]);
      });
    }

    return () => {
      // Cleanup markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();
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
    const newMarkerIds = new Set(markers.map((m) => m.id));

    // Remove markers that no longer exist
    currentMarkers.forEach((marker, id) => {
      if (!newMarkerIds.has(id)) {
        marker.remove();
        currentMarkers.delete(id);
      }
    });

    // Add or update markers
    markers.forEach((markerData) => {
      const existingMarker = currentMarkers.get(markerData.id);

      if (existingMarker) {
        // Update position
        existingMarker.setLngLat([markerData.lng, markerData.lat]);
      } else {
        // Create new marker
        const el = document.createElement("div");
        el.className = "map-marker";
        el.style.width = "30px";
        el.style.height = "30px";
        el.style.backgroundColor = markerData.color || "#ef4444";
        el.style.borderRadius = "50%";
        el.style.border = "3px solid white";
        el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";
        el.style.cursor = "pointer";

        const marker = new maplibregl.Marker(el).setLngLat([
          markerData.lng,
          markerData.lat,
        ]);

        if (markerData.label) {
          marker.setPopup(
            new maplibregl.Popup({ offset: 25 }).setText(markerData.label),
          );
        }

        if (onMarkerClick) {
          el.addEventListener("click", () => onMarkerClick(markerData));
        }

        marker.addTo(map.current!);
        currentMarkers.set(markerData.id, marker);
      }
    });
  }, [markers]);

  return (
    <div
      ref={mapContainer}
      className={className}
      style={{ borderRadius: "inherit" }}
    />
  );
}

export default Map;
