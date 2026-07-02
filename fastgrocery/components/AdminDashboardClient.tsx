"use client";

import React from "react";
import Link from "next/link";
import {
  ShoppingBag,
  TrendingUp,
  Users,
  Truck,
  DollarSign,
  PlusCircle,
  Eye,
  Settings,
  ArrowRight,
  ClipboardList
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { motion } from "framer-motion";

interface AdminDashboardClientProps {
  stats: {
    totalGroceries: number;
    totalOrders: number;
    totalCustomers: number;
    totalDeliveryBoys: number;
    totalRevenue: number;
    chartData: Array<{ date: string; Earnings: number; Orders: number }>;
  };
  recentOrders: Array<{
    _id: string;
    user: { name: string; email: string };
    totalAmount: number;
    paymentMethod: string;
    isPaid: boolean;
    status: string;
    createdAt: string;
  }>;
}

export default function AdminDashboardClient({
  stats,
  recentOrders,
}: AdminDashboardClientProps) {
  const statCards = [
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      change: "Store Sales",
      icon: DollarSign,
      color: "from-emerald-500 to-green-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toString(),
      change: "Placed Orders",
      icon: ClipboardList,
      color: "from-blue-500 to-indigo-600",
      bg: "bg-blue-50",
    },
    {
      title: "Catalog Items",
      value: stats.totalGroceries.toString(),
      change: "Listed Products",
      icon: ShoppingBag,
      color: "from-amber-500 to-orange-600",
      bg: "bg-amber-50",
    },
    {
      title: "Active Users",
      value: (stats.totalCustomers + stats.totalDeliveryBoys).toString(),
      change: `${stats.totalCustomers} Customers | ${stats.totalDeliveryBoys} Delivery Boys`,
      icon: Users,
      color: "from-purple-500 to-pink-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Store Overview
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Real-time catalog size, active sales, and delivery statistics.
          </p>
        </div>
        
        {/* Shortcut Quick Action Panel */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/add-grocery"
            className="flex items-center gap-2 px-5 py-3 bg-linear-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all cursor-pointer"
          >
            <PlusCircle size={16} />
            Add Grocery
          </Link>
          <Link
            href="/admin/view-grocery"
            className="flex items-center gap-2 px-5 py-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-bold text-xs uppercase tracking-wider rounded-2xl shadow-xs transition-all cursor-pointer"
          >
            <Eye size={16} />
            View Items
          </Link>
          <Link
            href="/admin/manage-orders"
            className="flex items-center gap-2 px-5 py-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-bold text-xs uppercase tracking-wider rounded-2xl shadow-xs transition-all cursor-pointer"
          >
            <Settings size={16} />
            Manage Orders
          </Link>
        </div>
      </div>

      {/* Grid of Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.4 }}
            whileHover={{ y: -4 }}
            className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md flex items-center gap-5 justify-between relative overflow-hidden"
          >
            {/* Ambient Background blur */}
            <div className={`absolute top-0 right-0 w-24 h-24 bg-linear-to-bl ${card.color} opacity-5 blur-2xl rounded-full`} />
            
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {card.title}
              </span>
              <div className="text-2xl font-black text-gray-900">
                {card.value}
              </div>
              <span className="text-[11px] font-bold text-gray-500 block leading-tight">
                {card.change}
              </span>
            </div>

            <div className={`p-4 rounded-2xl bg-linear-to-br ${card.color} text-white shadow-md shadow-green-100`}>
              <card.icon size={22} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Analytics Chart & Recent Orders Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Column */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md lg:col-span-2 space-y-6"
        >
          <div className="flex items-center justify-between border-b border-gray-50 pb-4">
            <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-2">
              <TrendingUp size={20} className="text-green-500" />
              Sales & Earnings History
            </h3>
            <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
              Last 7 Days
            </span>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} style={{ fontSize: "11px", fontWeight: "bold", fill: "#9ca3af" }} />
                <YAxis tickLine={false} axisLine={false} style={{ fontSize: "11px", fontWeight: "bold", fill: "#9ca3af" }} />
                <Tooltip
                  cursor={{ fill: "rgba(22, 163, 74, 0.04)" }}
                  contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #f3f4f6", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                />
                <Bar dataKey="Earnings" fill="#16a34a" radius={[6, 6, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Orders List Column */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md flex flex-col justify-between space-y-6"
        >
          <div className="flex items-center justify-between border-b border-gray-50 pb-4">
            <h3 className="font-extrabold text-gray-900 text-lg">
              Recent Orders
            </h3>
            <Link
              href="/admin/manage-orders"
              className="text-xs font-bold text-green-600 hover:text-green-700 flex items-center gap-1 hover:underline"
            >
              See All
              <ArrowRight size={14} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-6 text-gray-400">
              <ClipboardList size={36} className="stroke-1 mb-2" />
              <p className="text-xs font-semibold">No recent orders placed.</p>
            </div>
          ) : (
            <div className="flex-grow space-y-4 overflow-y-auto max-h-80 pr-1 scrollbar-hide">
              {recentOrders.map((order, idx) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors border border-gray-50"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-gray-800">
                      #{order._id.slice(-6).toUpperCase()}
                    </div>
                    <div className="text-[11px] font-bold text-gray-500 truncate max-w-[140px]">
                      {order.user?.name || "Deleted User"}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="text-xs font-extrabold text-gray-900 block">
                      ₹{order.totalAmount}
                    </span>
                    <span
                      className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        order.status === "delivered"
                          ? "bg-green-50 text-green-600 border border-green-100"
                          : order.status === "out of delivery"
                          ? "bg-blue-50 text-blue-600 border border-blue-100"
                          : "bg-amber-50 text-amber-600 border border-amber-100"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
