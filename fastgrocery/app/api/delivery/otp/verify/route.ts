import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Order from "@/app/models/order.model";
import DeliveryAssignment from "@/app/models/deliveryAssignment.model";
import { emitEventHandler } from "@/lib/emitEventHandler";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== "deliveryBoy") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId, otp } = await req.json();
    if (!orderId || !otp) {
      return NextResponse.json(
        { error: "Order ID and OTP code are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Verify OTP code
    if (order.deliveryOtp !== otp) {
      return NextResponse.json({ error: "Invalid OTP code" }, { status: 400 });
    }

    // Update order status
    order.status = "delivered";
    order.deliveryOtpVerification = true;
    order.deliveredAt = new Date();
    order.isPaid = true; // Mark as paid upon successful delivery (important for COD)
    await order.save();

    // Complete the delivery assignment
    const assignment = await DeliveryAssignment.findOne({
      order: orderId,
      assignedTo: session.user.id,
      status: "assigned",
    });

    if (assignment) {
      assignment.status = "completed";
      assignment.assignedTo = null; // Free up delivery boy
      await assignment.save();
    }

    const populatedOrder = await Order.findById(orderId)
      .populate("user", "name email mobile")
      .populate("assignedDeliveryBoy", "name mobile image location");

    // Emit order-status-update event for real-time customer and admin notification
    await emitEventHandler("order-status-update", populatedOrder);

    return NextResponse.json({
      message: "Delivery verified and completed successfully",
      order: populatedOrder,
    });
  } catch (error: any) {
    console.error("POST /api/delivery/otp/verify error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
