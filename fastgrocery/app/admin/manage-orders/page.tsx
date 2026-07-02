"use client";

import React, { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import AdminOrderCard from "@/components/AdminOrderCard";
import { getSocket } from "@/lib/socket";
import { ClipboardList, Sparkles } from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";

export default function ManageOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await axios.get("/api/admin/get-orders");
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Listen to Socket events for real-time order lifecycle updates
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // Connect socket if not already connected
    if (!socket.connected) {
      socket.connect();
    }

    // 1. Listen for new orders placed in real-time
    const handleNewOrder = (newOrder: any) => {
      console.log("[SOCKET] Admin received new-order event:", newOrder._id);
      setOrders((prevOrders) => {
        // Prevent duplicate appending
        if (prevOrders.some((o) => o._id === newOrder._id)) return prevOrders;
        return [newOrder, ...prevOrders];
      });
    };

    // 2. Listen for delivery boy assignment completions
    const handleOrderAssigned = (data: any) => {
      console.log("[SOCKET] Admin received order-assigned event:", data.orderId);
      setOrders((prevOrders) =>
        prevOrders.map((o) =>
          o._id === data.orderId
            ? { ...o, assignedDeliveryBoy: data.assignedDeliveryBoy }
            : o
        )
      );
    };

    // 3. Listen for general status updates (e.g. delivery boy marks order as delivered)
    const handleOrderStatusUpdate = (updatedOrder: any) => {
      console.log("[SOCKET] Admin received status update event:", updatedOrder._id, updatedOrder.status);
      setOrders((prevOrders) =>
        prevOrders.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
      );
    };

    socket.on("new-order", handleNewOrder);
    socket.on("order-assigned", handleOrderAssigned);
    socket.on("order-status-update", handleOrderStatusUpdate);

    return () => {
      socket.off("new-order", handleNewOrder);
      socket.off("order-assigned", handleOrderAssigned);
      socket.off("order-status-update", handleOrderStatusUpdate);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        <Nav />
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Manage Orders
            </h1>
            <p className="text-gray-500 text-xs mt-0.5 uppercase font-bold tracking-wider">
              Monitor customer orders and dispatch assignments
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-4">
              <span className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-semibold">Loading orders data...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-md text-gray-400 p-8">
              <ClipboardList size={48} className="mx-auto stroke-1 text-gray-300 mb-2" />
              <h3 className="font-extrabold text-gray-800 mb-1">No orders yet</h3>
              <p className="text-xs">
                As soon as customers purchase items, orders will list here in real-time.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <AdminOrderCard
                  key={order._id}
                  order={order}
                  onStatusUpdated={fetchOrders}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
