"use client";

import React, { useEffect, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200",
    title: "Fresh Vegetables & Fruits",
    subtitle: "Organic produce sourced directly from local farms. Handpicked for quality.",
    badge: "100% Organic",
  },
  {
    image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=1200",
    title: "Daily Pantry Essentials",
    subtitle: "Stock up on grains, dairy, snacks, and personal household products at discount rates.",
    badge: "Super Savings",
  },
  {
    image: "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?q=80&w=1200",
    title: "Fast Delivery to Your Door",
    subtitle: "No more long supermarket lines. Get groceries delivered at your home in minutes.",
    badge: "Lightning Fast",
  },
];

export default function HeroSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full h-[360px] rounded-3xl overflow-hidden relative shadow-xl border border-gray-100">
      {SLIDES.map((slide, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            idx === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center scale-102 transition-transform duration-[4000ms]"
            style={{
              backgroundImage: `url(${slide.image})`,
              transform: idx === current ? "scale(1)" : "scale(1.05)",
            }}
          />

          {/* Dark Overlay with subtle backdrop blur */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

          {/* Slide Text Content */}
          <div className="absolute inset-0 flex flex-col justify-center items-start px-6 md:px-12 text-white max-w-xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-600/90 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-full shadow-md backdrop-blur-xs">
              <Sparkles size={11} />
              {slide.badge}
            </span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
              {slide.title}
            </h2>
            <p className="text-xs md:text-sm text-gray-200/95 leading-relaxed font-medium">
              {slide.subtitle}
            </p>
            <button className="flex items-center gap-2 px-5 py-3 bg-white hover:bg-green-50 text-green-700 font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all cursor-pointer">
              Shop Catalog
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      ))}

      {/* Dot Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
              idx === current ? "w-6 bg-green-500" : "w-2.5 bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
