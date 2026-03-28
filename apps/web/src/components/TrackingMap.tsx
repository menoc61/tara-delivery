"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";

const greenIcon = L.icon({
  iconUrl:
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNSIgaGVpZ2h0PSI0MSIgdmlld0JveD0iMCAwIDI1IDQxIj48cGF0aCBmaWxsPSIjMDA1MDNhIiBkPSJNMTIuMjUgNEM4LjM4NiA0IDUuNSA2Ljg4NiA1LjEgMTEuNTQ2YzUuNzAzLS45OTYgMTAuNzM3LTUuODQ4IDExLjcwNC0xMS4xNTZhMSAxIDAgMCAxIDEuNTk2LS40ODljLjU3MiAyLjY1OS0uNzM2IDUuMzM3LTIuNjEyIDcuNjk1QzE1Ljc4MyAzLjc4OSAxNC4xOTYgMy45OCAxMi4yNSA0em0tMi41MTctNi4yODFjLS45NDYuNDY3LTEuNjY3IDEuMDMxLTIuMDczIDEuNzEyYy0uMzEzLjUzOC0uNDcxIDEuMTYxLS40MzQgMS43OTMuMDM0LjY0Ni4yNDQgMS4yNjMuNTk1IDEuNzY4LjM1MS41MDQuODI1LjkzNCAxLjM5MSAxLjI1NnoiLz48L3N2Zz4=",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const goldIcon = L.icon({
  iconUrl:
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNSIgaGVpZ2h0PSI0MSIgdmlld0JveD0iMCAwIDI1IDQxIj48cGF0aCBmaWxsPSIjN2M1ODAwIiBkPSJNMTIuMjUgNEM4LjM4NiA0IDUuNSA2Ljg4NiA1LjEgMTEuNTQ2YzUuNzAzLS45OTYgMTAuNzM3LTUuODQ4IDExLjcwNC0xMS4xNTZhMSAxIDAgMCAxIDEuNTk2LS40ODljLjU3MiAyLjY1OS0uNzM2IDUuMzM3LTIuNjEyIDcuNjk1QzE1Ljc4MyAzLjc4OSAxNC4xOTYgMy45OCAxMi4yNSA0em0tMi41MTctNi4yODFjLS45NDYuNDY3LTEuNjY3IDEuMDMxLTIuMDczIDEuNzEyYy0uMzEzLjUzOC0uNDcxIDEuMTYxLS40MzQgMS43OTMuMDM0LjY0Ni4yNDQgMS4yNjMuNTk1IDEuNzY4LjM1MS41MDQuODI1LjkzNCAxLjM5MSAxLjI1NnoiLz48L3N2Zz4=",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface MapProps {
  pickupCoords: [number, number];
  dropoffCoords: [number, number];
  pickupAddress: string;
  dropoffAddress: string;
}

function MapUpdater({ pickupCoords, dropoffCoords }: MapProps) {
  const map = useMap();

  useEffect(() => {
    if (pickupCoords[0] !== 0 && dropoffCoords[0] !== 0) {
      const bounds = L.latLngBounds([pickupCoords, dropoffCoords]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (pickupCoords[0] !== 0) {
      map.setView(pickupCoords, 13);
    }
  }, [map, pickupCoords, dropoffCoords]);

  return null;
}

export default function TrackingMap({
  pickupCoords,
  dropoffCoords,
  pickupAddress,
  dropoffAddress,
}: MapProps) {
  const defaultCenter: [number, number] = [3.848, 11.5021];
  const center = pickupCoords[0] !== 0 ? pickupCoords : defaultCenter;

  const positions: [number, number][] = [];
  if (pickupCoords[0] !== 0) positions.push(pickupCoords);
  if (dropoffCoords[0] !== 0) positions.push(dropoffCoords);

  return (
    <MapContainer
      center={center}
      zoom={13}
      className="w-full h-full z-0"
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {pickupCoords[0] !== 0 && (
        <Marker position={pickupCoords} icon={greenIcon}>
          <Popup>
            <div className="text-sm p-1">
              <p className="font-bold text-green-700">Départ</p>
              <p>{pickupAddress}</p>
            </div>
          </Popup>
        </Marker>
      )}

      {dropoffCoords[0] !== 0 && (
        <Marker position={dropoffCoords} icon={goldIcon}>
          <Popup>
            <div className="text-sm p-1">
              <p className="font-bold text-amber-700">Arrivée</p>
              <p>{dropoffAddress}</p>
            </div>
          </Popup>
        </Marker>
      )}

      {positions.length > 1 && (
        <Polyline
          positions={positions}
          color="#00503a"
          weight={4}
          opacity={0.8}
          dashArray="12, 8"
        />
      )}

      <MapUpdater
        pickupCoords={pickupCoords}
        dropoffCoords={dropoffCoords}
        pickupAddress={pickupAddress}
        dropoffAddress={dropoffAddress}
      />
    </MapContainer>
  );
}
