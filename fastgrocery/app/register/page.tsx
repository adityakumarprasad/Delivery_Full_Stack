"use client";

import React, { useState } from "react";
import Link from "next/navigation";
import LinkComponent from "next/link";
import Welcome from "@/components/Welcome";
import RegisterForm from "@/components/registerForm";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const [step, setStep] = useState(1);

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-3xl border border-gray-150 shadow-2xl p-8 relative overflow-hidden"
      >
        {/* Ambient top right glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-green-200 rounded-full blur-2xl opacity-40 pointer-events-none" />

        {step === 1 ? (
          <Welcome onNext={() => setStep(2)} />
        ) : (
          <RegisterForm onBack={() => setStep(1)} />
        )}

        <div className="text-center mt-6">
          <p className="text-xs text-gray-500 font-medium">
            Already have an account?{" "}
            <LinkComponent
              href="/login"
              className="text-green-600 hover:text-green-700 font-bold hover:underline transition-all"
            >
              Sign In
            </LinkComponent>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
