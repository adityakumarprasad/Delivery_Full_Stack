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

    // Find assignment where this delivery boy is active
    const activeAssignment = await DeliveryAssignment.findOne({
      assignedTo: session.user.id,
      status: "assigned",
    }).populate({
      path: "order",
      populate: { path: "user", select: "name email mobile location" },
    });

    if (!activeAssignment) {
      return NextResponse.json({ active: false });
    }

    return NextResponse.json({ active: true, assignment: activeAssignment });
  } catch (error: any) {
    console.error("GET /api/delivery/current-order error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
