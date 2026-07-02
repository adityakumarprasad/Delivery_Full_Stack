"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-red-100 shadow-2xl text-center"
      >
        <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-6">
          <ShieldAlert size={36} />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
          Access Denied 🚫
        </h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          You do not have the required permissions to view this page. If you believe this is an error, please log out and sign in with the appropriate account role.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="w-full py-3 bg-linear-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-semibold rounded-2xl shadow-lg transition-all duration-200 text-center"
          >
            Return Home
          </Link>
          <Link
            href="/login"
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-2xl transition-all duration-200 text-center"
          >
            Go to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
