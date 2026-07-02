"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import UserOrderCard from "@/components/UserOrderCard";
import { Package, ArrowLeft, PackageSearch } from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get("/api/user/my-orders");
        setOrders(res.data);
      } catch (err) {
        console.error("Failed to fetch user orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        <Nav />
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          {/* Header section with back button */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2.5 bg-white hover:bg-gray-50 border border-gray-150 rounded-2xl shadow-xs transition-colors cursor-pointer text-gray-500 hover:text-gray-800"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                Order History
              </h1>
              <p className="text-gray-500 text-xs mt-0.5 uppercase font-bold tracking-wider">
                Track your active and previous grocery deliveries
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-4">
              <span className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-semibold">Loading your purchases...</p>
            </div>
          ) : orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-md p-8"
            >
              <PackageSearch size={64} className="mx-auto text-gray-300 stroke-1 mb-4" />
              <h3 className="text-lg font-black text-gray-800 mb-1">No orders found</h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto mb-8">
                You haven't placed any grocery orders yet. Start shopping to place your first order.
              </p>
              <Link
                href="/"
                className="px-6 py-3 bg-linear-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all"
              >
                Go to Catalog
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <UserOrderCard key={order._id} order={order} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
