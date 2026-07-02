import React from "react";
import dbConnect from "@/lib/db";
import Order from "@/app/models/order.model";
import { auth } from "@/auth";
import DeliveryBoyDashboard from "./DeliveryBoyDashboard";
import mongoose from "mongoose";

export default async function DeliveryBoy() {
  const session = await auth();
  if (!session?.user) {
    return (
      <div className="text-center py-20 text-gray-500 font-semibold">
        Unauthorized delivery session.
      </div>
    );
  }

  await dbConnect();

  // Get timestamp for start of today (local time)
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  // 1. Fetch completed orders delivered today
  const completedToday = await Order.find({
    assignedDeliveryBoy: session.user.id,
    status: "delivered",
    deliveryOtpVerification: true,
    deliveredAt: { $gte: startOfToday },
  });

  const todaysEarning = completedToday.length * 40;

  // 2. Fetch past 7 days order count to build performance chart
  const startOfPastWeek = new Date();
  startOfPastWeek.setDate(startOfPastWeek.getDate() - 6);
  startOfPastWeek.setHours(0, 0, 0, 0);

  const deliveryHistory = await Order.aggregate([
    {
      $match: {
        assignedDeliveryBoy: new mongoose.Types.ObjectId(session.user.id),
        status: "delivered",
        deliveryOtpVerification: true,
        deliveredAt: { $gte: startOfPastWeek },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$deliveredAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Transform data for Recharts rendering
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const match = deliveryHistory.find((item) => item._id === dateStr);
    
    chartData.push({
      day: d.toLocaleDateString([], { weekday: "short" }),
      Deliveries: match ? match.count : 0,
      Earnings: match ? match.count * 40 : 0,
    });
  }

  return (
    <DeliveryBoyDashboard
      initialEarning={todaysEarning}
      chartData={chartData}
      userId={session.user.id}
    />
  );
}
