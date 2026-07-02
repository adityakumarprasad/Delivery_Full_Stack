"use client";

import { useEffect } from "react";
import { useGetMe } from "@/hooks/useGetMe";
import { getSocket } from "@/lib/socket";

export default function InitUser() {
  const { userData } = useGetMe();

  useEffect(() => {
    if (userData && userData.id) {
      const socket = getSocket();
      if (socket) {
        if (!socket.connected) {
          socket.connect();
        }
        // Emit identity to register socket mapping in database
        socket.emit("identity", { userId: userData.id });
        console.log(`[SOCKET CLIENT] Connected & registered identity for: ${userData.name} (${userData.id})`);
      }
    }
  }, [userData?.id]);

  return null;
}
