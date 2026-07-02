import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import DeliveryAssignment from "@/app/models/deliveryAssignment.model";
import Order from "@/app/models/order.model";
import User from "@/app/models/user.model";
import { emitEventHandler } from "@/lib/emitEventHandler";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (session?.user?.role !== "deliveryBoy") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Assignment ID is required" }, { status: 400 });
    }

    await dbConnect();

    // 1. Ensure the delivery boy doesn't already have an active order
    const activeOrder = await DeliveryAssignment.findOne({
      assignedTo: session.user.id,
      status: "assigned",
    });

    if (activeOrder) {
      return NextResponse.json(
        { error: "You already have an active delivery assignment." },
        { status: 400 }
      );
    }

    // 2. Fetch and check availability of assignment
    const assignment = await DeliveryAssignment.findById(id);
    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    if (assignment.status !== "brodcasted") {
      return NextResponse.json(
        { error: "This order has already been taken by another delivery boy." },
        { status: 400 }
      );
    }

    // 3. Mark assignment as assigned to current delivery boy
    assignment.assignedTo = session.user.id as any;
    assignment.status = "assigned";
    assignment.acceptedAt = new Date();
    await assignment.save();

    // 4. Update the order with delivery boy reference
    const order = await Order.findById(assignment.order);
    if (!order) {
      return NextResponse.json({ error: "Associated order not found" }, { status: 404 });
    }

    order.assignedDeliveryBoy = session.user.id as any;
    await order.save();

    // Fetch user and delivery boy profile details
    const deliveryBoyUser = await User.findById(session.user.id).select(
      "name mobile image location isOnline"
    );

    // 5. Emit order-assigned socket notification to update customer/admin tracking pages
    await emitEventHandler("order-assigned", {
      orderId: order._id.toString(),
      assignedDeliveryBoy: deliveryBoyUser,
    });

    // 6. Pull this delivery boy from all other broadcasted assignment lists
    await DeliveryAssignment.updateMany(
      { status: "brodcasted", brodcastedTo: session.user.id },
      { $pull: { brodcastedTo: session.user.id } }
    );

    return NextResponse.json({
      message: "Assignment accepted successfully",
      assignment,
      order,
    });
  } catch (error: any) {
    console.error("GET /api/delivery/assignment/[id]/accept-assignment error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
