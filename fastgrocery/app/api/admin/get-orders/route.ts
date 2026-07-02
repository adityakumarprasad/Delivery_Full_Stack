import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Order from "@/app/models/order.model";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    await dbConnect();

    const orders = await Order.find({})
      .populate("user", "name email mobile image")
      .populate("assignedDeliveryBoy", "name mobile image location isOnline")
      .sort({ createdAt: -1 });

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error("GET /api/admin/get-orders error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
