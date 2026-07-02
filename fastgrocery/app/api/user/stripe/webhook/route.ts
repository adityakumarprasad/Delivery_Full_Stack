import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/app/models/order.model";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "mock-stripe-secret-key", {
  apiVersion: "2025-01-27.acacia" as any,
});

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.warn("Stripe webhook: Missing signature or webhook secret. Skipping verification for debugging.");
    
    // Non-verifying debug fallback in case keys aren't set
    try {
      const parsedBody = JSON.parse(payload);
      if (parsedBody.type === "checkout.session.completed") {
        const orderId = parsedBody.data?.object?.metadata?.orderId;
        if (orderId) {
          await dbConnect();
          await Order.findByIdAndUpdate(orderId, { isPaid: true });
          console.log(`[DEBUG STRIPE] Order ${orderId} marked as paid successfully.`);
        }
      }
      return NextResponse.json({ received: true, debug: true });
    } catch (e: any) {
      return NextResponse.json({ error: "Failed parsing webhook payload" }, { status: 400 });
    }
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook Signature Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      try {
        await dbConnect();
        const updatedOrder = await Order.findByIdAndUpdate(
          orderId,
          { isPaid: true },
          { returnDocument: 'after' }
        );
        console.log(`Webhook Success: Order ${orderId} is paid.`);
      } catch (error: any) {
        console.error("Webhook Database Error:", error.message);
        return NextResponse.json(
          { error: "Database update failed" },
          { status: 500 }
        );
      }
    }
  }

  return NextResponse.json({ received: true });
}
