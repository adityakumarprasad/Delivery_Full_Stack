"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import DeliveryChat from "@/components/DeliveryChat";
import { getSocket } from "@/lib/socket";
import { Phone, ArrowLeft, ShieldCheck, MapPin, Truck, HelpCircle } from "lucide-react";
import axios from "axios";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

// Lazy load LiveMap client-side only
const LiveMap = dynamic(() => import("@/components/LiveMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-gray-50 rounded-3xl border border-gray-150 flex items-center justify-center text-gray-400 text-xs font-semibold">
      Loading Leaflet GPS canvas...
    </div>
  ),
});

export default function TrackOrderPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deliveryBoyCoords, setDeliveryBoyCoords] = useState<[number, number] | null>(null);

  // Fetch initial order details
  const fetchOrderDetails = async () => {
    try {
      const res = await axios.get(`/api/user/get-order/${orderId}`);
      const data = res.data;
      setOrder(data);

      // Pre-fill delivery boy initial coordinates if assigned
      if (data.assignedDeliveryBoy?.location?.coordinates) {
        const coords = data.assignedDeliveryBoy.location.coordinates;
        if (coords[0] !== 0 || coords[1] !== 0) {
          // coordinates in GeoJSON are [lng, lat] -> map wants [lat, lng]
          setDeliveryBoyCoords([coords[1], coords[0]]);
        }
      }
    } catch (err: any) {
      console.error("Failed to load order track coordinates:", err);
      setError(
        err.response?.data?.error || "Failed to load order details for tracking."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  // Connect socket listeners to track live GPS changes
  useEffect(() => {
    if (!order?.assignedDeliveryBoy?._id) return;

    const socket = getSocket();
    if (!socket) return;

    if (!socket.connected) {
      socket.connect();
    }

    const deliveryBoyId = order.assignedDeliveryBoy._id;

    // Listen to coordinates updates from the socket server
    const handleLocationUpdate = (data: { userId: string; location: any }) => {
      if (data.userId === deliveryBoyId) {
        const coords = data.location.coordinates; // [lng, lat]
        console.log(`[SOCKET GPS] Live marker sync: [Lat: ${coords[1]}, Lng: ${coords[0]}]`);
        setDeliveryBoyCoords([coords[1], coords[0]]);
      }
    };

    // Listen to status updates (e.g. marked delivered)
    const handleStatusUpdate = (updatedOrder: any) => {
      if (updatedOrder._id === orderId) {
        setOrder(updatedOrder);
      }
    };

    socket.on("update-deliveryBoy-location", handleLocationUpdate);
    socket.on("order-status-update", handleStatusUpdate);

    return () => {
      socket.off("update-deliveryBoy-location", handleLocationUpdate);
      socket.off("order-status-update", handleStatusUpdate);
    };
  }, [order?.assignedDeliveryBoy?._id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-between">
        <div>
          <Nav />
          <div className="flex flex-col items-center justify-center py-40 text-gray-400 space-y-4">
            <span className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold">Loading live tracking details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col justify-between">
        <div>
          <Nav />
          <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-150 text-red-600 flex items-center justify-center">
              <HelpCircle size={24} />
            </div>
            <h3 className="font-extrabold text-gray-800">Tracking Error</h3>
            <p className="text-xs text-gray-500">{error || "This order is not accessible."}</p>
            <Link
              href="/"
              className="inline-block px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
            >
              Return Home
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // coordinates mapping in GeoJSON: [lng, lat] -> map wants [lat, lng]
  const userCoords: [number, number] = [
    order.address.latitude,
    order.address.longitude,
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        <Nav />
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Link
              href="/user/my-orders"
              className="p-2.5 bg-white hover:bg-gray-50 border border-gray-150 rounded-2xl shadow-xs transition-colors cursor-pointer text-gray-500 hover:text-gray-800"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                Live Tracking
              </h1>
              <p className="text-gray-500 text-xs mt-0.5 uppercase font-bold tracking-wider">
                Order #{order._id.slice(-6).toUpperCase()} &bull; Status: {order.status}
              </p>
            </div>
          </div>

          {/* Core Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Map Area */}
            <div className="lg:col-span-2 space-y-6">
              <LiveMap
                userCoords={userCoords}
                deliveryBoyCoords={deliveryBoyCoords}
              />

              {/* Delivery Boy card */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-extrabold text-lg shrink-0">
                    {order.assignedDeliveryBoy?.name?.charAt(0) || <Truck size={22} />}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-sm">
                      {order.assignedDeliveryBoy
                        ? order.assignedDeliveryBoy.name
                        : "Waiting for store dispatch..."}
                    </h3>
                    <p className="text-xs text-gray-500 font-semibold mt-0.5">
                      {order.assignedDeliveryBoy
                        ? `Mobile: ${order.assignedDeliveryBoy.mobile}`
                        : "Your order is being processed by the store. Once dispatched, a delivery boy will be assigned."}
                    </p>
                  </div>
                </div>

                {order.assignedDeliveryBoy && (
                  <a
                    href={`tel:${order.assignedDeliveryBoy.mobile}`}
                    className="w-full sm:w-auto px-5 py-3.5 bg-green-50 hover:bg-green-100 text-green-600 font-bold text-xs uppercase tracking-wider rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Phone size={16} />
                    Call Partner
                  </a>
                )}
              </div>
            </div>

            {/* Chat Area (Right Sidebar) */}
            <div>
              {order.assignedDeliveryBoy ? (
                <DeliveryChat
                  orderId={order._id}
                  currentUserId={order.user._id} // customer ID
                  role="user"
                />
              ) : (
                <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-md text-center py-20 text-gray-400">
                  <Truck size={36} className="mx-auto stroke-1 text-gray-300 mb-2 animate-bounce" />
                  <h4 className="font-extrabold text-gray-700 mb-1">Chat Unavailable</h4>
                  <p className="text-xs">
                    Chat will open once a delivery partner accepts the order assignment.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
