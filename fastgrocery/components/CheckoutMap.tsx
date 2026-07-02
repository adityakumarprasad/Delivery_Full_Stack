"use client";

import React, { useEffect, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";

// Leaflet default marker fix for Next.js bundler
const markerIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/128/684/684908.png", // standard red pin icon
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

interface CheckoutMapProps {
  position: [number, number]; // [latitude, longitude]
  onPositionChange: (latitude: number, longitude: number) => void;
}

// Sub-component to center the map when parent coordinates update
function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);
  return null;
}

export default function CheckoutMap({
  position,
  onPositionChange,
}: CheckoutMapProps) {
  const markerRef = useRef<any>(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latLng = marker.getLatLng();
          onPositionChange(latLng.lat, latLng.lng);
        }
      },
    }),
    [onPositionChange]
  );

  return (
    <div className="w-full h-80 rounded-3xl overflow-hidden border border-gray-150 shadow-inner relative z-10">
      <MapContainer
        center={position}
        zoom={15}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapRecenter center={position} />
        <Marker
          draggable={true}
          eventHandlers={eventHandlers}
          position={position}
          icon={markerIcon}
          ref={markerRef}
        />
      </MapContainer>
    </div>
  );
}
