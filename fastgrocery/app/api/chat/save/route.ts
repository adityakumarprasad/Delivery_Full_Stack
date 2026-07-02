import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Message from "@/app/models/message.model";
import Order from "@/app/models/order.model";

export async function POST(req: NextRequest) {
  try {
    const { senderId, text, roomId, time } = await req.json();

    if (!senderId || !text || !roomId || !time) {
      return NextResponse.json(
        { error: "Missing required message parameters" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Validate if the chat room (corresponding to the orderId) exists
    const order = await Order.findById(roomId);
    if (!order) {
      return NextResponse.json({ error: "Order room does not exist" }, { status: 404 });
    }

    // Persist the message document
    const message = await Message.create({
      roomId,
      text,
      senderId,
      time,
    });

    return NextResponse.json(
      { message: "Chat message persisted successfully", data: message },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/chat/save error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
