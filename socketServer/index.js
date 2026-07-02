import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4000;
const NEXT_BASE_URL = process.env.NEXT_BASE_URL || "http://localhost:3000";

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: NEXT_BASE_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// REST endpoint for Next.js server to trigger real-time updates to sockets
app.post("/notify", (req, res) => {
  const { event, data, socketId } = req.body;
  if (!event) {
    return res.status(400).json({ error: "Event name is required" });
  }

  try {
    if (socketId) {
      io.to(socketId).emit(event, data);
    } else {
      io.emit(event, data);
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error in /notify:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

// Socket.IO event mapping
io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // 1. Identity event - associates a user ID with this socket ID in database
  socket.on("identity", async (data) => {
    try {
      const { userId } = data;
      if (!userId) return;

      console.log(`Identity registered for user: ${userId} -> socket: ${socket.id}`);
      await axios.post(`${NEXT_BASE_URL}/api/socket/connect`, {
        userId,
        socketId: socket.id,
      });
    } catch (error) {
      console.error("Error registering identity:", error.message);
    }
  });

  // 2. Update location event - persists geo position and broadcasts to all listeners
  socket.on("update-location", async (data) => {
    try {
      const { userId, location } = data; // location: { type: "Point", coordinates: [lng, lat] }
      if (!userId || !location) return;

      console.log(`Location update for user ${userId}:`, location.coordinates);
      
      // Persist in MongoDB via Next.js API
      await axios.post(`${NEXT_BASE_URL}/api/socket/update-location`, {
        userId,
        location,
      });

      // Broadcast new location to all clients (e.g. for real-time tracking)
      io.emit("update-deliveryBoy-location", { userId, location });
    } catch (error) {
      console.error("Error updating location:", error.message);
    }
  });

  // 3. Join room event - join chat room for an order
  socket.on("join-room", (roomId) => {
    if (!roomId) return;
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room (Order ID): ${roomId}`);
  });

  // 4. Send message event - save and broadcast message within a room
  socket.on("send-message", async (data) => {
    try {
      const { senderId, text, roomId, time } = data;
      if (!senderId || !text || !roomId || !time) return;

      console.log(`Chat message in room ${roomId} from ${senderId}: ${text}`);

      // Save to database via Next.js API
      await axios.post(`${NEXT_BASE_URL}/api/chat/save`, {
        senderId,
        text,
        roomId,
        time,
      });

      // Broadcast message to all room participants
      io.to(roomId).emit("send-message", { senderId, text, roomId, time });
    } catch (error) {
      console.error("Error saving/sending chat message:", error.message);
    }
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Socket.IO Server is running on port ${PORT}`);
});
