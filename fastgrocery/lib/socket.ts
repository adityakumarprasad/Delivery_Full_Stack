import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = () => {
  if (typeof window === "undefined") {
    return null; // Return null on server-side rendering
  }

  if (!socket) {
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_SERVER || "http://localhost:4000";
    socket = io(socketUrl, {
      autoConnect: false, // Wait for manual connection after identification
    });
  }
  return socket;
};
