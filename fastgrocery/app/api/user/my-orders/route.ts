import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Order from "@/app/models/order.model";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    
    // Fetch all orders for this user, populate the customer and delivery boy details, sort by newest
    const orders = await Order.find({ user: session.user.id })
      .populate("user", "name email mobile image")
      .populate("assignedDeliveryBoy", "name mobile image location isOnline")
      .sort({ createdAt: -1 });

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error("GET /api/user/my-orders error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
