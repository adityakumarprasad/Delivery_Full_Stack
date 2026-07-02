"use client";

import React from "react";
import { ShoppingBasket, Bike, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface WelcomeProps {
  onNext: () => void;
}

export default function Welcome({ onNext }: WelcomeProps) {
  return (
    <div className="flex flex-col items-center text-center justify-center py-6 min-h-[480px]">
      {/* Floating Animated Icons container */}
      <div className="relative w-48 h-48 mb-8 flex justify-center items-center">
        {/* Ambient background pulse */}
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-4 bg-green-150 rounded-full blur-xl opacity-60"
        />

        {/* Shopping Basket Icon */}
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-4 left-4 p-4 bg-white shadow-xl rounded-2xl text-green-600 border border-green-50/50"
        >
          <ShoppingBasket size={32} />
        </motion.div>

        {/* Bike Icon */}
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          className="absolute bottom-4 right-4 p-4 bg-white shadow-xl rounded-2xl text-green-600 border border-green-50/50"
        >
          <Bike size={32} />
        </motion.div>
      </div>

      <motion.h1
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="text-4xl font-black text-gray-900 tracking-tight leading-none mb-4"
      >
        Freshness <br />
        <span className="bg-linear-to-r from-green-500 to-green-700 bg-clip-text text-transparent">
          Delivered Fast
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="text-sm text-gray-500 max-w-xs leading-relaxed mb-10"
      >
        Welcome to FastGrocery. Order your daily essentials, fruits, vegetables, and beverages, and track them in real-time.
      </motion.p>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onNext}
        className="px-8 py-4 bg-linear-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-bold text-sm tracking-wide rounded-2xl shadow-lg hover:shadow-xl transition-all duration-250 cursor-pointer flex items-center gap-2"
      >
        Get Started
        <ArrowRight size={18} />
      </motion.button>
    </div>
  );
}
