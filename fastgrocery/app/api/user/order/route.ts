import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Order from "@/app/models/order.model";
import { emitEventHandler } from "@/lib/emitEventHandler";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, items, paymentMethod, totalAmount, address } = await req.json();

    if (!userId || !items || !paymentMethod || !totalAmount || !address) {
      return NextResponse.json(
        { error: "Missing required order fields" },
        { status: 400 }
      );
    }

    await dbConnect();
    
    // Create the order document
    const order = await Order.create({
      user: userId,
      items,
      paymentMethod,
      isPaid: paymentMethod === "online" ? false : false, // online is handled by payment session / webhook
      totalAmount,
      address,
      status: "pending",
      deliveryOtp: null,
      deliveryOtpVerification: false,
    });

    // Populate user info so the admin panel displays the customer's name
    const populatedOrder = await order.populate("user", "name email mobile");

    // Emit socket event to notify admins in real-time
    await emitEventHandler("new-order", populatedOrder);

    return NextResponse.json(
      { message: "Order placed successfully", order: populatedOrder },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/user/order error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
