import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Order from "@/app/models/order.model";
import Stripe from "stripe";
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

    // Create order document in DB first (marked unpaid by default)
    const order = await Order.create({
      user: userId,
      items,
      paymentMethod,
      isPaid: false,
      totalAmount,
      address,
      status: "pending",
      deliveryOtp: null,
      deliveryOtpVerification: false,
    });

    const populatedOrder = await order.populate("user", "name email mobile");

    // Check if Stripe Key is configured
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey || stripeKey.includes("<your-stripe-")) {
      console.log("Mock Stripe Mode: Stripe key is not configured. Simulating Stripe Checkout.");

      // In mock mode, we'll mark the order as paid immediately since webhook is skipped
      order.isPaid = true;
      await order.save();

      // Emit new-order event
      await emitEventHandler("new-order", populatedOrder);

      // Return local redirect URL directly to order-success page
      const successUrl = `${
        process.env.NEXT_BASE_URL || "http://localhost:3000"
      }/user/order-success`;
      return NextResponse.json({ url: successUrl });
    }

    // Initialize Stripe client
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-01-27.acacia" as any,
    });

    // Create Stripe checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "FastGrocery Order Payment",
              description: `Payment for Order #${order._id.toString().slice(-6)}`,
            },
            unit_amount: Math.round(totalAmount * 100), // Convert to paise
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${
        process.env.NEXT_BASE_URL || "http://localhost:3000"
      }/user/order-success`,
      cancel_url: `${
        process.env.NEXT_BASE_URL || "http://localhost:3000"
      }/user/cart`,
      metadata: {
        orderId: order._id.toString(),
      },
    });

    // Broadcast new-order socket notification (unpaid online order)
    await emitEventHandler("new-order", populatedOrder);

    return NextResponse.json({ url: stripeSession.url });
  } catch (error: any) {
    console.error("POST /api/user/payment error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
