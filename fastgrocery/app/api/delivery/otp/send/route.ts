import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Order from "@/app/models/order.model";
import { sendMail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== "deliveryBoy") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    await dbConnect();

    const order = await Order.findById(orderId).populate("user", "name email");
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Generate random 4-digit OTP code
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    order.deliveryOtp = otp;
    await order.save();

    const customerEmail = (order.user as any).email;
    const customerName = (order.user as any).name;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; max-width: 500px; margin: 0 auto; background-color: #fafafa;">
        <h2 style="color: #16a34a; text-align: center; margin-bottom: 24px;">🛒 FastGrocery Verification OTP</h2>
        <p>Dear <strong>${customerName}</strong>,</p>
        <p>Your grocery order is ready for delivery! Please share the following One-Time Password (OTP) with the delivery boy to confirm safe receipt of your package:</p>
        <div style="background-color: #f0fdf4; border: 1px dashed #16a34a; border-radius: 8px; font-size: 28px; font-weight: bold; text-align: center; padding: 12px; margin: 20px 0; color: #15803d; letter-spacing: 4px;">
          ${otp}
        </div>
        <p style="font-size: 12px; color: #6b7280; text-align: center; margin-top: 24px;">If you did not request this order, please disregard this email.</p>
      </div>
    `;

    // Send the email
    await sendMail(
      customerEmail,
      `Delivery OTP for Order #${order._id.toString().slice(-6)}`,
      emailHtml
    );

    return NextResponse.json({
      message: "Delivery verification OTP sent to customer's email",
    });
  } catch (error: any) {
    console.error("POST /api/delivery/otp/send error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
