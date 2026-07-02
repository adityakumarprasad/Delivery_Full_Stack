import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/app/models/user.model";

export async function POST(req: NextRequest) {
  try {
    const { userId, socketId } = await req.json();

    if (!userId || !socketId) {
      return NextResponse.json(
        { error: "UserId and socketId are required" },
        { status: 400 }
      );
    }

    await dbConnect();
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { socketId, isOnline: true },
      { returnDocument: 'after' }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log(`[SOCKET API] User ${userId} marked online (Socket: ${socketId})`);
    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error("POST /api/socket/connect error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
