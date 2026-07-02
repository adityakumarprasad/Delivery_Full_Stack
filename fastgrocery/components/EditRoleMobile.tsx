"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Phone, UserCheck, ShieldAlert, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function EditRoleMobile() {
  const { data: session, update } = useSession();
  const [role, setRole] = useState<"user" | "deliveryBoy" | "admin">("user");
  const [mobile, setMobile] = useState("");
  const [adminExists, setAdminExists] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await axios.get("/api/check-for-admin");
        setAdminExists(res.data.adminExist);
      } catch (err) {
        console.error("Failed to check if admin exists", err);
      }
    };
    checkAdmin();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!mobile || mobile.trim().length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);

    try {
      // POST onboarding data to API
      const res = await axios.post("/api/user/edit-role-mobile", {
        role,
        mobile,
      });

      // Update the NextAuth session JWT to reflect the updated role
      await update({ role });

      // Reload the page to trigger SSR role checks and routing
      window.location.reload();
    } catch (err: any) {
      setError(err.response?.data?.error || "Onboarding failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-white rounded-3xl border border-gray-100 shadow-2xl p-8 relative overflow-hidden"
      >
        {/* Decorative ambient gradients */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-green-200 rounded-full blur-2xl opacity-55 pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-green-100 rounded-full blur-2xl opacity-50 pointer-events-none" />

        <div className="text-center mb-8 relative">
          <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-2xl bg-green-100 text-green-600 mb-4">
            <Sparkles size={24} className="animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Complete Onboarding
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Choose your role and set your mobile number to get started.
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-semibold mb-6 border border-red-100"
          >
            <ShieldAlert size={16} className="shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mobile Number Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 block uppercase tracking-wider">
              Mobile Number
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                <Phone size={18} />
              </span>
              <input
                type="tel"
                placeholder="Enter 10-digit mobile"
                value={mobile}
                maxLength={10}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-150 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-2xl outline-none transition-all text-sm font-semibold text-gray-800"
                required
              />
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 block uppercase tracking-wider">
              Account Role
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                <UserCheck size={18} />
              </span>
              <select
                value={role}
                onChange={(e) =>
                  setRole(e.target.value as "user" | "deliveryBoy" | "admin")
                }
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-150 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-2xl outline-none appearance-none transition-all text-sm font-semibold text-gray-800"
                required
              >
                <option value="user">Customer (Order Groceries)</option>
                <option value="deliveryBoy">Delivery Partner</option>
                {!adminExists && <option value="admin">Administrator (Manage Store)</option>}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-linear-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-bold text-sm tracking-wide rounded-2xl shadow-lg hover:shadow-xl transition-all duration-250 cursor-pointer flex justify-center items-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Save & Continue"
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
