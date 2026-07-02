"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  Phone,
  CheckCircle,
  Clock,
  Truck,
  CreditCard,
  Package,
  MapPin
} from "lucide-react";
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
    items: OrderItem[];
    paymentMethod: "cod" | "online";
    isPaid: boolean;
    totalAmount: number;
    assignedDeliveryBoy?: { _id: string; name: string; mobile: string };
    status: "pending" | "out of delivery" | "delivered";
    createdAt: string;
  };
}

export default function UserOrderCard({ order: initialOrder }: OrderProps) {
  const [order, setOrder] = useState(initialOrder);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setOrder(initialOrder);
  }, [initialOrder]);

  // Connect socket listener to synchronize live order assignments and status updates
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    if (!socket.connected) {
      socket.connect();
    }

    const handleOrderUpdate = (updatedOrder: any) => {
      if (updatedOrder && updatedOrder._id === order._id) {
        console.log(`[SOCKET] User card updated for Order ${order._id}:`, updatedOrder.status);
        setOrder(updatedOrder);
      }
    };

    const handleOrderAssigned = (data: any) => {
      if (data && data.orderId === order._id) {
        console.log(`[SOCKET] User card assigned boy for Order ${order._id}:`, data.assignedDeliveryBoy.name);
        setOrder((prev) => ({
          ...prev,
          assignedDeliveryBoy: data.assignedDeliveryBoy,
        }));
      }
    };

    socket.on("order-status-update", handleOrderUpdate);
    socket.on("order-assigned", handleOrderAssigned);

    return () => {
      socket.off("order-status-update", handleOrderUpdate);
      socket.off("order-assigned", handleOrderAssigned);
    };
  }, [order._id]);

  return (
    <motion.div
      layout
      className="bg-white rounded-3xl border border-gray-100 shadow-md hover:shadow-lg transition-shadow overflow-hidden"
    >
      {/* Header section */}
      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-gray-900 uppercase">
              Order #{order._id.slice(-6).toUpperCase()}
            </span>
            <span className="text-[10px] text-gray-400 font-bold">
              {new Date(order.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-black text-green-600">
            ₹{order.totalAmount}
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              ({order.items.length} items)
            </span>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Badge */}
          <span
            className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border flex items-center gap-1 ${
              order.status === "delivered"
                ? "bg-green-50 text-green-700 border-green-150"
                : order.status === "out of delivery"
                ? "bg-blue-50 text-blue-700 border-blue-150"
                : "bg-amber-50 text-amber-700 border-amber-150"
            }`}
          >
            {order.status === "delivered" ? (
              <CheckCircle size={10} />
            ) : order.status === "out of delivery" ? (
              <Truck size={10} />
            ) : (
              <Clock size={10} />
            )}
            {order.status}
          </span>

          {/* Paid / Unpaid */}
          <span
            className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${
              order.isPaid
                ? "bg-green-50 text-green-600 border-green-150"
                : "bg-red-50 text-red-600 border-red-155"
            }`}
          >
            {order.isPaid ? "Paid" : "COD / Unpaid"}
          </span>

          {/* Track order link */}
          {order.status !== "delivered" && (
            <Link
              href={`/user/track-order/${order._id}`}
              className="px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-1"
            >
              <MapPin size={11} />
              Track
            </Link>
          )}

          {/* Expand */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 hover:bg-gray-50 text-gray-400 hover:text-gray-700 rounded-full transition-colors cursor-pointer"
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Expanded item details list */}
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="p-5 bg-gray-50/50 border-t border-gray-50 space-y-4"
        >
          {/* Delivery Boy Details */}
          {order.assignedDeliveryBoy && (
            <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 font-extrabold text-sm">
                  {order.assignedDeliveryBoy.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Assigned Delivery Boy
                  </p>
                  <p className="text-xs font-black text-gray-800">
                    {order.assignedDeliveryBoy.name}
                  </p>
                </div>
              </div>
              
              <a
                href={`tel:${order.assignedDeliveryBoy.mobile}`}
                className="p-2.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-xl transition-all cursor-pointer"
              >
                <Phone size={16} />
              </a>
            </div>
          )}

          {/* Products breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
            {order.items.map((item, idx) => (
              <div key={idx} className="p-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-gray-800 leading-tight">
                      {item.name}
                    </h4>
                    <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                      ₹{item.price} / {item.unit}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-gray-700">
                    Qty: {item.quantity}
                  </span>
                  <p className="text-[11px] font-black text-green-600 mt-0.5">
                    ₹{parseFloat(item.price) * item.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
