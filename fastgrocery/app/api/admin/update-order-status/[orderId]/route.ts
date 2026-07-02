import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Order from "@/app/models/order.model";
import User from "@/app/models/user.model";
import DeliveryAssignment from "@/app/models/deliveryAssignment.model";
import { emitEventHandler } from "@/lib/emitEventHandler";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await auth();
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const { orderId } = await params;
    const { status } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "Order ID and status are required" },
        { status: 400 }
      );
    }

    await dbConnect();
    
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    order.status = status;
    await order.save();

    const populatedOrder = await Order.findById(orderId)
      .populate("user", "name email mobile")
      .populate("assignedDeliveryBoy", "name mobile image location");

    // 1. If "out of delivery" and no assignment exists, broadcast to delivery boys
    if (status === "out of delivery" && !order.assignment) {
      // Find all busy delivery boys (assigned to an active order)
      const activeAssignments = await DeliveryAssignment.find({
        status: "assigned",
      });
      const busyBoyIds = activeAssignments
        .map((a) => a.assignedTo?.toString())
        .filter((id): id is string => !!id);

      // Find all idle delivery boys
      const availableBoys = await User.find({
        role: "deliveryBoy",
        _id: { $nin: busyBoyIds },
      });

      if (availableBoys.length > 0) {
        // Create delivery assignment
        const assignment = await DeliveryAssignment.create({
          order: order._id,
          brodcastedTo: availableBoys.map((b) => b._id),
          assignedTo: null,
          status: "brodcasted",
        });

        // Link assignment to order
        order.assignment = assignment._id as any;
        await order.save();

        const populatedAssignment = await DeliveryAssignment.findById(assignment._id)
          .populate({
            path: "order",
            populate: { path: "user", select: "name email mobile" },
          });

        // Notify each available delivery boy in real-time
        for (const boy of availableBoys) {
          if (boy.socketId) {
            console.log(`Broadcasting new assignment to delivery boy: ${boy.name} (Socket: ${boy.socketId})`);
            await emitEventHandler(
              "new-assignment",
              populatedAssignment,
              boy.socketId
            );
          }
        }
      } else {
        console.warn("No idle delivery boys available to broadcast order assignment.");
      }
    }

    // 2. Emit order-status-update event for user tracking page & admin panel
    await emitEventHandler("order-status-update", populatedOrder);

    return NextResponse.json({
      message: `Order status updated to ${status}`,
      order: populatedOrder,
    });
  } catch (error: any) {
    console.error("POST /api/admin/update-order-status/[orderId] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
