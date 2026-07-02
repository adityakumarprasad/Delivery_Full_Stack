"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";
import axios from "axios";
import { User, Mail, Lock, ShieldAlert, ArrowLeft, ArrowRight, Chrome } from "lucide-react";
import { motion } from "framer-motion";

interface RegisterFormProps {
  onBack: () => void;
}

export default function RegisterForm({ onBack }: RegisterFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("Please fill out all fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      await axios.post("/api/auth/register", {
        name,
        email,
        password,
      });

      // Redirect to login page on success
      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="py-2">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-green-600 transition-colors uppercase tracking-wider cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <h2 className="text-xl font-black text-gray-900 tracking-tight">Create Account</h2>
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

      <form onSubmit={handleRegister} className="space-y-4">
        {/* Name input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 block uppercase tracking-wider">Full Name</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
              <User size={18} />
            </span>
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-150 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-2xl outline-none transition-all text-sm font-semibold text-gray-800"
              required
            />
          </div>
        </div>

        {/* Email input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 block uppercase tracking-wider">Email Address</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
              <Mail size={18} />
            </span>
            <input
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-150 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-2xl outline-none transition-all text-sm font-semibold text-gray-800"
              required
            />
          </div>
        </div>

        {/* Password input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 block uppercase tracking-wider">Password</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
              <Lock size={18} />
            </span>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-150 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-2xl outline-none transition-all text-sm font-semibold text-gray-800"
              required
            />
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3.5 bg-linear-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-bold text-sm tracking-wide rounded-2xl shadow-lg hover:shadow-xl transition-all duration-250 cursor-pointer flex justify-center items-center gap-2"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              Register
              <ArrowRight size={16} />
            </>
          )}
        </motion.button>
      </form>

      {/* Divider */}
      <div className="flex items-center my-6">
        <div className="flex-grow border-t border-gray-150" />
        <span className="mx-3 text-xs text-gray-400 font-bold uppercase tracking-wider">Or register with</span>
        <div className="flex-grow border-t border-gray-150" />
      </div>

      {/* Google OAuth Button */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleGoogleSignIn}
        className="w-full py-3.5 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-sm tracking-wide rounded-2xl shadow-xs transition-all duration-200 cursor-pointer flex items-center justify-center gap-2.5"
      >
        <Chrome size={18} className="text-red-500" />
        Sign up with Google
      </motion.button>
    </div>
  );
}
