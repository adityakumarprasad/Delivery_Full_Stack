import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import DeliveryAssignment from "@/app/models/deliveryAssignment.model";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== "deliveryBoy") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Fetch assignments where current user is in broadcast list and status is broadcasted
    const assignments = await DeliveryAssignment.find({
      brodcastedTo: session.user.id,
      status: "brodcasted",
    })
      .populate({
        path: "order",
        populate: { path: "user", select: "name email mobile" },
      })
      .sort({ createdAt: -1 });

    return NextResponse.json(assignments);
  } catch (error: any) {
    console.error("GET /api/delivery/get-assignments error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
