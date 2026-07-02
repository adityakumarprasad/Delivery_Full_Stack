import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/app/models/user.model";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const admin = await User.findOne({ role: "admin" });
    return NextResponse.json({ adminExist: !!admin });
  } catch (error: any) {
    console.error("GET /api/check-for-admin error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
