import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/app/models/user.model";

export async function POST(req: NextRequest) {
  try {
    const { userId, location } = await req.json();

    if (!userId || !location || !location.coordinates) {
      return NextResponse.json(
        { error: "UserId and valid location coordinates are required" },
        { status: 400 }
      );
    }

    await dbConnect();
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { location },
      { returnDocument: 'after' }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log(`[SOCKET API] User ${userId} location updated:`, location.coordinates);
    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error("POST /api/socket/update-location error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
