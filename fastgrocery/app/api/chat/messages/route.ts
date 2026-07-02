import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Message from "@/app/models/message.model";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId } = await req.json();
    if (!roomId) {
      return NextResponse.json({ error: "Room ID is required" }, { status: 400 });
    }

    await dbConnect();
    
    // Fetch messages for the room, sorted by oldest to newest
    const messages = await Message.find({ roomId }).sort({ createdAt: 1 });

    return NextResponse.json(messages);
  } catch (error: any) {
    console.error("POST /api/chat/messages error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
