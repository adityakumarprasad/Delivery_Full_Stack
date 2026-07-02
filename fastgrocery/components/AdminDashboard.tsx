import React from "react";
import dbConnect from "@/lib/db";
import Grocery from "@/app/models/grocery.model";
import Order from "@/app/models/order.model";
import User from "@/app/models/user.model";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminDashboard() {
  await dbConnect();

  // 1. Fetch counts
  const totalGroceries = await Grocery.countDocuments();
  const totalOrders = await Order.countDocuments();
  const totalCustomers = await User.countDocuments({ role: "user" });
  const totalDeliveryBoys = await User.countDocuments({ role: "deliveryBoy" });

  // 2. Calculate revenue (sum totalAmount for paid orders)
  const paidOrdersRevenue = await Order.aggregate([
    { $match: { isPaid: true } },
    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
  ]);
  const totalRevenue = paidOrdersRevenue[0]?.total || 0;

  // 3. Fetch recent 5 orders for dashboard feed
  const recentOrders = await Order.find({})
    .populate("user", "name email mobile")
    .populate("assignedDeliveryBoy", "name mobile")
    .sort({ createdAt: -1 })
    .limit(5);

  // 4. Calculate monthly earnings structure for charts
  const salesHistory = await Order.aggregate([
    { $match: { isPaid: true } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        revenue: { $sum: "$totalAmount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 7 }, // Last 7 active days
  ]);

  const chartData = salesHistory.map((item) => ({
    date: item._id,
    Earnings: item.revenue,
    Orders: item.count,
  }));

  // Fallback default chart data if empty
  const defaultChartData = chartData.length > 0 ? chartData : [
    { date: "Mon", Earnings: 0, Orders: 0 },
    { date: "Tue", Earnings: 0, Orders: 0 },
    { date: "Wed", Earnings: 0, Orders: 0 },
    { date: "Thu", Earnings: 0, Orders: 0 },
    { date: "Fri", Earnings: 0, Orders: 0 },
    { date: "Sat", Earnings: 0, Orders: 0 },
    { date: "Sun", Earnings: 0, Orders: 0 },
  ];

  const stats = {
    totalGroceries,
    totalOrders,
    totalCustomers,
    totalDeliveryBoys,
    totalRevenue,
    chartData: defaultChartData,
  };

  // Convert raw Mongoose arrays to plain JSON for client component serialization
  const plainRecentOrders = JSON.parse(JSON.stringify(recentOrders));

  return (
    <AdminDashboardClient
      stats={stats}
      recentOrders={plainRecentOrders}
    />
  );
}
