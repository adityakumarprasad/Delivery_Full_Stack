"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import LinkComponent from "next/link";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ShieldAlert, Sparkles, Chrome } from "lucide-react";
import { motion } from "framer-motion";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccess("Account created successfully! Please log in.");
    }
    const err = searchParams.get("error");
    if (err) {
      if (err === "CredentialsSignin") {
        setError("Invalid email or password");
      } else {
        setError("An error occurred during authentication");
      }
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Please fill out all fields");
      return;
    }

    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl: "/",
        redirect: false, // Handle redirect manually to capture errors cleanly
      });

      if (result?.error) {
        setError(result.error.includes("CredentialsSignin") ? "Invalid email or password" : result.error);
        setLoading(false);
      } else {
        // Success
        setSuccess("Login successful! Redirecting...");
        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md bg-white rounded-3xl border border-gray-150 shadow-2xl p-8 relative overflow-hidden"
    >
      {/* Ambient gradient top-right glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-green-200 rounded-full blur-2xl opacity-45 pointer-events-none" />

      <div className="text-center mb-8">
        <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-2xl bg-green-100 text-green-600 mb-4">
          <Sparkles size={24} className="animate-pulse" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Welcome Back</h2>
        <p className="text-sm text-gray-500 mt-1">Sign in to manage your grocery shopping</p>
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

      {success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 bg-green-50 text-green-600 p-4 rounded-2xl text-xs font-semibold mb-6 border border-green-100"
        >
          <ShieldCheck size={16} className="shrink-0" />
          <span>{success}</span>
        </motion.div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        {/* Email Field */}
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
              className="w-full pl-11 pr-4 py-3.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-150 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-2xl outline-none transition-all text-sm font-semibold text-gray-800"
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-gray-700 block uppercase tracking-wider">Password</label>
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
              <Lock size={18} />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-12 py-3.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-150 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-2xl outline-none transition-all text-sm font-semibold text-gray-800"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-linear-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-bold text-sm tracking-wide rounded-2xl shadow-lg hover:shadow-xl transition-all duration-250 cursor-pointer flex justify-center items-center gap-2"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "Sign In"
          )}
        </motion.button>
      </form>

      {/* Divider */}
      <div className="flex items-center my-6">
        <div className="flex-grow border-t border-gray-150" />
        <span className="mx-3 text-xs text-gray-400 font-bold uppercase tracking-wider">Or login with</span>
        <div className="flex-grow border-t border-gray-150" />
      </div>

      {/* Google Sign In */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleGoogleSignIn}
        className="w-full py-3.5 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-sm tracking-wide rounded-2xl shadow-xs transition-all duration-200 cursor-pointer flex items-center justify-center gap-2.5"
      >
        <Chrome size={18} className="text-red-500" />
        Sign in with Google
      </motion.button>

      <div className="text-center mt-6">
        <p className="text-xs text-gray-500 font-medium">
          New to FastGrocery?{" "}
          <LinkComponent
            href="/register"
            className="text-green-600 hover:text-green-700 font-bold hover:underline transition-all"
          >
            Create Account
          </LinkComponent>
        </p>
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8">
      <Suspense fallback={<div className="text-center text-sm font-semibold text-gray-500">Loading...</div>}>
        <LoginFormContent />
      </Suspense>
    </div>
  );
}
