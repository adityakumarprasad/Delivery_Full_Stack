import axios from "axios";

export async function emitEventHandler(
  event: string,
  data: any,
  socketId?: string
) {
  try {
    const socketServer =
      process.env.NEXT_PUBLIC_SOCKET_SERVER || "http://localhost:4000";
    await axios.post(`${socketServer}/notify`, {
      socketId,
      event,
      data,
    });
  } catch (error: any) {
    console.error(`Failed to emit socket event ${event} via notify API:`, error.message);
  }
}
