"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { getSocket } from "@/lib/socket";
import dynamic from "next/dynamic";
import DeliveryChat from "./DeliveryChat";
import {
  TrendingUp,
  Truck,
  MapPin,
  CheckCircle,
  Phone,
  Gift,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Key
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import axios from "axios";
import { motion } from "framer-motion";

// Lazy-load LiveMap client-side only
const LiveMap = dynamic(() => import("@/components/LiveMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 bg-gray-50 rounded-3xl border border-gray-150 flex items-center justify-center text-gray-400 text-xs font-semibold">
      Loading Leaflet GPS canvas...
    </div>
  ),
});

interface DeliveryBoyDashboardProps {
  initialEarning: number;
  chartData: Array<{ day: string; Deliveries: number; Earnings: number }>;
  userId: string;
}

export default function DeliveryBoyDashboard({
  initialEarning,
  chartData,
  userId,
}: DeliveryBoyDashboardProps) {
  const [earning, setEarning] = useState(initialEarning);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [activeAssignment, setActiveAssignment] = useState<any>(null);

  // OTP Verification state
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [otpError, setOtpError] = useState("");

  const [loading, setLoading] = useState(true);

  // Get active coordinates from Redux (GeoUpdater.tsx publishes this)
  const userData = useSelector((state: RootState) => state.user.userData);
  const deliveryBoyCoords: [number, number] | null =
    userData?.location?.coordinates && userData.location.coordinates[0] !== 0
      ? [userData.location.coordinates[1], userData.location.coordinates[0]]
      : null;

  const fetchActiveState = async () => {
    try {
      // 1. Fetch broadcasted assignments list
      const resAssignments = await axios.get("/api/delivery/get-assignments");
      setAssignments(resAssignments.data);

      // 2. Fetch current active order assignment
      const resCurrent = await axios.get("/api/delivery/current-order");
      if (resCurrent.data.active) {
        setActiveAssignment(resCurrent.data.assignment);
      } else {
        setActiveAssignment(null);
      }
    } catch (error) {
      console.error("Failed to load delivery state:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveState();

    const socket = getSocket();
    if (!socket) return;

    if (!socket.connected) {
      socket.connect();
    }

    // Join room with delivery boy's personal notifications channel if needed
    // Listen for new assignments broadcasted in real-time
    const handleNewAssignment = (newAssignment: any) => {
      console.log("[SOCKET] Delivery boy received new-assignment:", newAssignment._id);
      setAssignments((prev) => {
        if (prev.some((a) => a._id === newAssignment._id)) return prev;
        return [newAssignment, ...prev];
      });
    };

    const handleOrderAssigned = (data: any) => {
      console.log("[SOCKET] Delivery boy received order-assigned:", data.orderId);
      // Filter out this assignment since it has been taken by another delivery boy
      setAssignments((prev) => prev.filter((a) => a.order?._id !== data.orderId));
    };

    socket.on("new-assignment", handleNewAssignment);
    socket.on("order-assigned", handleOrderAssigned);

    return () => {
      socket.off("new-assignment", handleNewAssignment);
      socket.off("order-assigned", handleOrderAssigned);
    };
  }, []);

  const handleRefreshEarnings = () => {
    window.location.reload();
  };

  // Accept Order assignment
  const handleAcceptAssignment = async (id: string) => {
    try {
      await axios.get(`/api/delivery/assignment/${id}/accept-assignment`);
      // Reload state after acceptance
      fetchActiveState();
      setOtpSent(false);
      setOtpCode("");
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to accept order");
    }
  };

  // Reject/Dismiss Order assignment locally
  const handleRejectAssignment = (id: string) => {
    setAssignments((prev) => prev.filter((a) => a._id !== id));
  };

  // Trigger Nodemailer / Console OTP transmission
  const handleSendOtp = async () => {
    if (!activeAssignment) return;
    setVerifying(true);
    setOtpError("");
    try {
      await axios.post("/api/delivery/otp/send", {
        orderId: activeAssignment.order._id,
      });
      setOtpSent(true);
    } catch (error: any) {
      setOtpError(error.response?.data?.error || "Failed to send verification OTP.");
    } finally {
      setVerifying(false);
    }
  };

  // Verify OTP input code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssignment || !otpCode) return;
    setVerifying(true);
    setOtpError("");
    try {
      await axios.post("/api/delivery/otp/verify", {
        orderId: activeAssignment.order._id,
        otp: otpCode,
      });
      // Verification complete, refresh screen
      window.location.reload();
    } catch (error: any) {
      setOtpError(error.response?.data?.error || "Invalid OTP code entered.");
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-gray-400 space-y-4">
        <span className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold">Syncing delivery dashboard...</p>
      </div>
    );
  }

  // State 1: Has active delivery order
  if (activeAssignment) {
    const order = activeAssignment.order;
    const userCoords: [number, number] = [
      order.address.latitude,
      order.address.longitude,
    ];

    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <Truck className="text-green-600 animate-pulse" />
              Active Delivery
            </h1>
            <p className="text-gray-500 text-xs mt-0.5 uppercase font-bold tracking-wider">
              Order #{order._id.slice(-6).toUpperCase()}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-full flex items-center gap-1 shrink-0">
              <AlertCircle size={12} />
              In Progress
            </span>
            <span className="text-[10px] font-black uppercase bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-full shrink-0">
              COD Amount: ₹{order.totalAmount}
            </span>
          </div>
        </div>

        {/* Live track Map & Chat grids */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Map canvas */}
          <div className="lg:col-span-2 space-y-6">
            <LiveMap
              userCoords={userCoords}
              deliveryBoyCoords={deliveryBoyCoords}
            />

            {/* Customer Details & OTP box */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md space-y-6">
              <h3 className="font-extrabold text-gray-900 text-sm uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={16} className="text-green-600" />
                Customer Destination
              </h3>

              <div className="flex flex-col sm:flex-row justify-between gap-4 bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                <div className="space-y-1">
                  <p className="text-sm font-black text-gray-800">
                    {order.address.fullName}
                  </p>
                  <p className="text-xs font-bold text-gray-500">
                    Mobile: {order.address.mobile}
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed max-w-md">
                    {order.address.fullAddress}, {order.address.city}, {order.address.state} - {order.address.pincode}
                  </p>
                </div>
                
                <a
                  href={`tel:${order.address.mobile}`}
                  className="self-start p-3 bg-green-600 text-white hover:bg-green-700 rounded-2xl shadow-md transition-colors cursor-pointer"
                >
                  <Phone size={18} />
                </a>
              </div>

              {/* OTP Deliver Confirmations */}
              <div className="border-t border-gray-50 pt-6 space-y-4">
                {!otpSent ? (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                      💡 Click below to send a 4-digit verification OTP to the customer's email.
                    </p>
                    <button
                      disabled={verifying}
                      onClick={handleSendOtp}
                      className="w-full sm:w-auto px-6 py-3.5 bg-linear-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      Mark as Delivered
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    {otpError && (
                      <div className="flex items-center gap-2 bg-red-50 text-red-600 p-4 rounded-xl text-xs font-semibold border border-red-100">
                        <AlertCircle size={15} />
                        <span>{otpError}</span>
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <div className="relative flex-grow w-full">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                          <Key size={16} />
                        </span>
                        <input
                          type="text"
                          maxLength={4}
                          placeholder="Enter 4-digit OTP shared by customer..."
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-150 rounded-2xl outline-none text-xs font-semibold text-gray-800 focus:border-green-500 focus:bg-white"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={verifying || otpCode.length < 4}
                        className="w-full sm:w-auto px-6 py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        Verify & Complete
                      </button>
                    </div>
                    
                    <div className="flex justify-between items-center px-1">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        Didn't receive it?
                      </p>
                      <button
                        type="button"
                        disabled={verifying}
                        onClick={handleSendOtp}
                        className="text-[10px] text-green-600 hover:text-green-700 font-black uppercase tracking-wider hover:underline cursor-pointer disabled:opacity-50"
                      >
                        {verifying ? "Sending..." : "Resend OTP"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Room chat */}
          <div>
            <DeliveryChat
              orderId={order._id}
              currentUserId={userId}
              role="deliveryBoy"
            />
          </div>
        </div>
      </div>
    );
  }

  // State 2: Has pending assignments invitations
  if (assignments.length > 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Sparkles className="text-green-600 animate-pulse" />
            Delivery Assignments
          </h1>
          <p className="text-gray-500 text-xs mt-0.5 uppercase font-bold tracking-wider">
            Orders broadcasted to your area
          </p>
        </div>

        <div className="space-y-6">
          {assignments.map((assignment) => {
            const order = assignment.order;
            return (
              <motion.div
                key={assignment._id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md space-y-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                  <span className="text-xs font-black text-gray-800">
                    Order #{order._id.slice(-6).toUpperCase()}
                  </span>
                  <span className="text-xs font-black text-green-600">
                    Earning: ₹40
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-black text-gray-700 uppercase tracking-wider">
                    Address coordinates
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {order.address.fullName} &bull; {order.address.mobile} <br />
                    {order.address.fullAddress}, {order.address.city}, {order.address.state}
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handleAcceptAssignment(assignment._id)}
                    className="flex-grow py-3 bg-green-600 hover:bg-green-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer text-center"
                  >
                    Accept Deliver
                  </button>
                  <button
                    onClick={() => handleRejectAssignment(assignment._id)}
                    className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    Reject
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  // State 3: Idle (No active orders and no pending invitations)
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Overview header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Delivery Partner Portal
          </h1>
          <p className="text-gray-500 text-xs mt-0.5 uppercase font-bold tracking-wider">
            Track daily earnings and performance stats
          </p>
        </div>

        <button
          onClick={handleRefreshEarnings}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-150 hover:bg-gray-50 text-gray-700 hover:text-green-600 font-bold text-xs uppercase tracking-wider rounded-2xl shadow-xs transition-all cursor-pointer shrink-0"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Stats and Earnings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Earning */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md flex items-center gap-5 justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-200 opacity-20 blur-2xl rounded-full" />
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Today's Earnings
            </span>
            <div className="text-3xl font-black text-gray-900">
              ₹{earning}
            </div>
            <p className="text-[10px] text-gray-400 font-bold">
              Calculated at ₹40 per completion
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-green-600 text-white shadow-lg shadow-green-100">
            <Gift size={24} />
          </div>
        </div>

        {/* Empty deliveries state message banner */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md flex items-center gap-4 text-gray-400">
          <Truck size={36} className="stroke-1 text-gray-300" />
          <div>
            <h4 className="font-extrabold text-gray-800 text-sm">
              No Active Deliveries 🚛
            </h4>
            <p className="text-xs leading-relaxed">
              Waiting for orders to be dispatched... As soon as store items are out for delivery, assignments will prompt here.
            </p>
          </div>
        </div>
      </div>

      {/* Today's Performance chart */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md space-y-6">
        <h3 className="font-extrabold text-gray-900 text-sm uppercase tracking-wider flex items-center gap-1.5">
          <TrendingUp size={16} className="text-green-600" />
          Deliveries Performance
        </h3>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <XAxis dataKey="day" style={{ fontSize: "11px", fontWeight: "bold", fill: "#9ca3af" }} tickLine={false} axisLine={false} />
              <YAxis style={{ fontSize: "11px", fontWeight: "bold", fill: "#9ca3af" }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip cursor={{ fill: "rgba(22, 163, 74, 0.03)" }} />
              <Bar dataKey="Deliveries" fill="#16a34a" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
