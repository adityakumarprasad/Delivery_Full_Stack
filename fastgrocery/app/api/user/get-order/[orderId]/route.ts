import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Order from "@/app/models/order.model";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await params;
    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    await dbConnect();
    
    const order = await Order.findById(orderId)
      .populate("user", "name email mobile location")
      .populate("assignedDeliveryBoy", "name mobile image location isOnline");

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Security check: only allow the ordering user, an admin, or the assigned delivery boy to track it
    const isCustomer = order.user._id.toString() === session.user.id;
    const isAdmin = session.user.role === "admin";
    const isAssignedDeliveryBoy =
      order.assignedDeliveryBoy?._id.toString() === session.user.id;

    if (!isCustomer && !isAdmin && !isAssignedDeliveryBoy) {
      return NextResponse.json({ error: "Forbidden: Access denied" }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("GET /api/user/get-order/[orderId] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
