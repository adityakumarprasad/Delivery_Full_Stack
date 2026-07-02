"use client";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { updateUserLocation } from "@/redux/userSlice";
import { getSocket } from "@/lib/socket";

export default function GeoUpdater() {
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user.userData);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Only track if user is logged in, especially delivery partners
    if (!userData || !userData.id) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    const socket = getSocket();
    if (!socket) return;

    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by this browser.");
      return;
    }

    const handleSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      console.log(`[GEO UPDATER] GPS update received: [Lng: ${longitude}, Lat: ${latitude}]`);

      // 1. Sync coordinates to global Redux state
      dispatch(updateUserLocation([longitude, latitude]));

      // 2. Emit location update to the Socket.IO server
      if (socket.connected) {
        socket.emit("update-location", {
          userId: userData.id,
          location: {
            type: "Point",
            coordinates: [longitude, latitude], // GeoJSON order is [longitude, latitude]
          },
        });
      }
    };

    const handleError = (error: GeolocationPositionError) => {
      console.error("[GEO UPDATER] Geolocation error:", error.message);
    };

    // Begin watching coordinates continuously
    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [userData?.id, dispatch]);

  return null; // Side-effect only component
}
