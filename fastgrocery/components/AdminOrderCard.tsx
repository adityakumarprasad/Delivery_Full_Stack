"use client";

import React, { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Phone,
  CheckCircle,
  Clock,
  Truck,
  CreditCard,
  User,
  ShoppingBag,
  ExternalLink
} from "lucide-react";
import axios from "axios";
import { getSocket } from "@/lib/socket";
import { motion } from "framer-motion";

interface OrderItem {
  grocery: string;
  name: string;
  price: string;
  unit: string;
  image: string;
  quantity: number;
}

interface OrderProps {
  order: {
    _id: string;
    user: { _id: string; name: string; email: string; mobile: string };
    items: OrderItem[];
    paymentMethod: "cod" | "online";
    isPaid: boolean;
    totalAmount: number;
    address: {
      fullName: string;
      mobile: string;
      city: string;
      state: string;
      pincode: string;
      fullAddress: string;
      latitude: number;
      longitude: number;
    };
    assignedDeliveryBoy?: { _id: string; name: string; mobile: string };
    status: "pending" | "out of delivery" | "delivered";
    createdAt: string;
  };
  onStatusUpdated?: () => void;
}

export default function AdminOrderCard({ order: initialOrder, onStatusUpdated }: OrderProps) {
  const [order, setOrder] = useState(initialOrder);
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Sync state if initialOrder changes
  useEffect(() => {
    setOrder(initialOrder);
  }, [initialOrder]);

  // Socket listener to auto-sync this order card state if updated elsewhere (e.g. delivery boy verifies delivery)
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleOrderUpdate = (updatedOrder: any) => {
      if (updatedOrder && updatedOrder._id === order._id) {
        console.log(`[SOCKET] Live status sync for Order ${order._id}:`, updatedOrder.status);
        setOrder(updatedOrder);
        if (onStatusUpdated) onStatusUpdated();
      }
    };

    socket.on("order-status-update", handleOrderUpdate);
    // Listen for order-assigned event
    socket.on("order-assigned", (data: any) => {
      if (data && data.orderId === order._id) {
        setOrder((prev) => ({
          ...prev,
          assignedDeliveryBoy: data.assignedDeliveryBoy,
        }));
      }
    });

    return () => {
      socket.off("order-status-update", handleOrderUpdate);
      socket.off("order-assigned");
    };
  }, [order._id, onStatusUpdated]);

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await axios.post(`/api/admin/update-order-status/${order._id}`, {
        status: newStatus,
      });
      setOrder(res.data.order);
      if (onStatusUpdated) onStatusUpdated();
    } catch (error: any) {
      console.error("Failed to update status:", error.response?.data?.error || error.message);
      alert(error.response?.data?.error || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <motion.div
      layout
      className="bg-white rounded-3xl border border-gray-100 shadow-md hover:shadow-lg transition-shadow overflow-hidden"
    >
      {/* Header section */}
      <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-50">
        <div className="flex items-center gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-gray-900 tracking-tight">
                Order #{order._id.slice(-6).toUpperCase()}
              </span>
              <span className="text-xs text-gray-400 font-semibold">
                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-semibold flex items-center gap-1.5">
              <User size={13} className="text-gray-400" />
              {order.user?.name || "Deleted User"} ({order.user?.mobile || "No Mobile"})
            </p>
          </div>
        </div>

        {/* Dropdown status update & badges */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Pay badge */}
          <span
            className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
              order.isPaid
                ? "bg-green-50 text-green-600 border-green-150"
                : "bg-red-50 text-red-600 border-red-150"
            }`}
          >
            {order.isPaid ? "Paid" : "Unpaid"}
          </span>

          {/* Payment Method Badge */}
          <span className="text-[10px] font-black uppercase px-2.5 py-1 bg-gray-50 text-gray-600 border border-gray-200 rounded-full flex items-center gap-1">
            <CreditCard size={11} />
            {order.paymentMethod}
          </span>

          {/* Status Dropdown / Badge */}
          {order.status === "delivered" ? (
            <span className="text-xs font-black uppercase px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-full flex items-center gap-1">
              <CheckCircle size={14} />
              Delivered
            </span>
          ) : (
            <div className="relative">
              <select
                disabled={updating}
                value={order.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className={`text-xs font-black uppercase pl-3 pr-8 py-1.5 rounded-full border outline-none cursor-pointer appearance-none transition-all ${
                  order.status === "out of delivery"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                <option value="pending">Pending</option>
                <option value="out of delivery">Out for Delivery</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <ChevronDown size={14} />
              </div>
            </div>
          )}

          {/* Expand Details Trigger */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 hover:bg-gray-50 text-gray-400 hover:text-gray-700 rounded-full transition-colors cursor-pointer"
          >
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {/* Expanded content details */}
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="p-6 bg-gray-50/50 border-t border-gray-50 space-y-6"
        >
          {/* Details Row: Customer Details & Items list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shipping Info Column */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Shipping Address
              </h4>
              <div className="bg-white p-5 rounded-2xl border border-gray-100 space-y-2">
                <p className="text-sm font-black text-gray-800">
                  {order.address.fullName}
                </p>
                <p className="text-xs font-bold text-gray-500">
                  Phone: {order.address.mobile}
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {order.address.fullAddress}, {order.address.city}, {order.address.state} - {order.address.pincode}
                </p>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${order.address.latitude}&mlon=${order.address.longitude}#map=17/${order.address.latitude}/${order.address.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-green-600 hover:text-green-700 hover:underline pt-2"
                >
                  <ExternalLink size={12} />
                  Open coordinates map
                </a>
              </div>
            </div>

            {/* Delivery Assignment Column */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Delivery Boy
              </h4>
              <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center justify-between">
                {order.assignedDeliveryBoy ? (
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-extrabold text-sm">
                      {order.assignedDeliveryBoy.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-800">
                        {order.assignedDeliveryBoy.name}
                      </p>
                      <p className="text-xs font-bold text-gray-500">
                        Mobile: {order.assignedDeliveryBoy.mobile}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-gray-400">
                    <Truck size={20} className="stroke-1" />
                    <p className="text-xs font-semibold">
                      {order.status === "pending"
                        ? "Pending status update to out for delivery..."
                        : "Broadcasting to nearby delivery boys..."}
                    </p>
                  </div>
                )}

                {order.assignedDeliveryBoy && (
                  <a
                    href={`tel:${order.assignedDeliveryBoy.mobile}`}
                    className="p-3 bg-green-50 text-green-600 hover:bg-green-100 rounded-2xl transition-colors cursor-pointer"
                  >
                    <Phone size={18} />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Grocery items catalog row */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingBag size={14} />
              Ordered Items ({order.items.length})
            </h4>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl relative overflow-hidden flex-shrink-0 border border-gray-100">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-800 leading-tight">
                        {item.name}
                      </p>
                      <p className="text-xs font-semibold text-gray-400">
                        ₹{item.price} / {item.unit}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-black text-gray-800">
                      Qty: {item.quantity}
                    </p>
                    <p className="text-xs font-black text-green-600 mt-0.5">
                      ₹{parseFloat(item.price) * item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Amount Row */}
          <div className="flex justify-between items-center bg-green-50/50 p-5 rounded-2xl border border-green-100/50">
            <span className="text-sm font-bold text-gray-700">Total Amount:</span>
            <span className="text-lg font-black text-green-700">
              ₹{order.totalAmount}
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
