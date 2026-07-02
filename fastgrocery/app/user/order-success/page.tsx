"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle, Package, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function OrderSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-white rounded-3xl border border-gray-100 shadow-2xl p-8 relative overflow-hidden flex flex-col items-center"
      >
        {/* Confetti-like ambient blur */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-green-200 rounded-full blur-2xl opacity-40 pointer-events-none animate-pulse" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-green-150 rounded-full blur-2xl opacity-45 pointer-events-none animate-pulse" />

        {/* Pulsing check circle */}
        <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-green-100 rounded-full"
          />
          <CheckCircle size={56} className="text-green-600 relative z-10" />
        </div>

        <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-2">
          Order Placed Successfully!
        </h1>
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-6">
          Thank you for shopping with us
        </p>

        {/* Bouncing package container */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="p-5 bg-gray-50 rounded-2xl border border-gray-100 mb-8 text-gray-600 flex items-center gap-3 w-full justify-center"
        >
          <Package size={20} className="text-green-600 shrink-0" />
          <span className="text-xs font-black text-gray-700">
            Order is being packed at store
          </span>
        </motion.div>

        {/* Redirection */}
        <Link
          href="/user/my-orders"
          className="w-full py-4 bg-linear-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg hover:shadow-xl transition-all duration-250 flex items-center justify-center gap-2"
        >
          Go to My Orders
          <ArrowRight size={15} />
        </Link>
      </motion.div>
    </div>
  );
}
