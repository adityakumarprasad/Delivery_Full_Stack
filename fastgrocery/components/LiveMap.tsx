"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";

// Custom icons using flaticon images specified in the prompt
const houseIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/128/4821/4821951.png", // House marker
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

const bikeIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/128/9561/9561688.png", // Bike marker
  iconSize: [42, 42],
  iconAnchor: [21, 42],
  popupAnchor: [0, -42],
});

interface LiveMapProps {
  userCoords: [number, number]; // [latitude, longitude]
  deliveryBoyCoords: [number, number] | null; // [latitude, longitude]
}

// Sub-component to center the map when delivery boy coordinates update
function MapAutoCenter({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] !== 0 && center[1] !== 0) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

export default function LiveMap({
  userCoords,
  deliveryBoyCoords,
}: LiveMapProps) {
  // If deliveryBoyCoords are missing or uninitialized [0, 0], fall back to userCoords
  const hasDeliveryBoy =
    deliveryBoyCoords &&
    deliveryBoyCoords[0] !== 0 &&
    deliveryBoyCoords[1] !== 0;

  const activeCenter = hasDeliveryBoy ? deliveryBoyCoords : userCoords;

  const showPolyline =
    hasDeliveryBoy &&
    userCoords[0] !== 0 &&
    userCoords[1] !== 0;

  const polylinePositions = showPolyline ? [userCoords, deliveryBoyCoords!] : [];

  return (
    <div className="w-full h-96 rounded-3xl overflow-hidden border border-gray-150 shadow-inner relative z-10">
      <MapContainer
        center={activeCenter}
        zoom={15}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapAutoCenter center={activeCenter} />

        {/* User House Marker */}
        {userCoords[0] !== 0 && (
          <Marker position={userCoords} icon={houseIcon} />
        )}

        {/* Delivery Boy Bike Marker */}
        {hasDeliveryBoy && (
          <Marker position={deliveryBoyCoords!} icon={bikeIcon} />
        )}

        {/* Connecting Polyline */}
        {showPolyline && (
          <Polyline
            positions={polylinePositions}
            pathOptions={{ color: "#16a34a", weight: 4, dashArray: "5, 10" }}
          />
        )}
      </MapContainer>
    </div>
  );
}
