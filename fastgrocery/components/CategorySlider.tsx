"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Apple,
  Cookie,
  CupSoda,
  Droplet,
  Flower2,
  Home,
  Soup,
  Heart,
  ChevronLeft,
  ChevronRight,
  Sprout,
  Flame
} from "lucide-react";

interface CategorySliderProps {
  activeCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

const CATEGORIES = [
  { name: "Fruits & Vegetables", icon: Apple, color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  { name: "Dairy & Eggs", icon: Droplet, color: "bg-blue-50 text-blue-600 border-blue-100" },
  { name: "Rice, Atta & Grains", icon: Sprout, color: "bg-amber-50 text-amber-600 border-amber-100" },
  { name: "Snacks & Biscuits", icon: Cookie, color: "bg-orange-50 text-orange-600 border-orange-100" },
  { name: "Spices & Masalas", icon: Flame, color: "bg-red-50 text-red-600 border-red-100" },
  { name: "Beverages & Drinks", icon: CupSoda, color: "bg-purple-50 text-purple-600 border-purple-100" },
  { name: "Personal Care", icon: Flower2, color: "bg-pink-50 text-pink-600 border-pink-100" },
  { name: "Household Essentials", icon: Home, color: "bg-indigo-50 text-indigo-600 border-indigo-100" },
  { name: "Instant & Packaged Food", icon: Soup, color: "bg-rose-50 text-rose-600 border-rose-100" },
  { name: "Baby & Pet Care", icon: Heart, color: "bg-teal-50 text-teal-600 border-teal-100" },
];

export default function CategorySlider({
  activeCategory,
  onSelectCategory,
}: CategorySliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  // Check scroll positions to show/hide scroll arrows
  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeft(scrollLeft > 5);
      setShowRight(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmt = clientWidth * 0.6;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmt : scrollAmt,
        behavior: "smooth",
      });
      // Short timeout to wait for smooth scroll to finish before updating arrows
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <div className="relative w-full group">
      {/* Left Scroll Button */}
      {showLeft && (
        <button
          onClick={() => handleScroll("left")}
          className="absolute left-[-15px] top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white border border-gray-150 rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-green-600 hover:scale-105 transition-all cursor-pointer"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      {/* Categories Horizontal scroll Wrapper */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="w-full flex items-center gap-4 overflow-x-auto py-2 pr-4 scrollbar-hide select-none"
      >
        {/* "All" Category option */}
        <button
          onClick={() => onSelectCategory(null)}
          className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider shrink-0 transition-all border cursor-pointer ${
            activeCategory === null
              ? "bg-green-600 border-green-600 text-white shadow-md shadow-green-100"
              : "bg-white border-gray-150 text-gray-700 hover:bg-gray-50 shadow-xs"
          }`}
        >
          All Items
        </button>

        {CATEGORIES.map((cat, idx) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.name;
          return (
            <button
              key={idx}
              onClick={() => onSelectCategory(cat.name)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider shrink-0 transition-all border cursor-pointer ${
                isActive
                  ? "bg-green-600 border-green-600 text-white shadow-md shadow-green-100"
                  : `bg-white border-gray-150 text-gray-700 hover:bg-gray-50 shadow-xs`
              }`}
            >
              <span className={`p-1.5 rounded-xl ${isActive ? "bg-white/20 text-white" : cat.color}`}>
                <Icon size={14} />
              </span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Right Scroll Button */}
      {showRight && (
        <button
          onClick={() => handleScroll("right")}
          className="absolute right-[-15px] top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white border border-gray-150 rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-green-600 hover:scale-105 transition-all cursor-pointer"
        >
          <ChevronRight size={20} />
        </button>
      )}
    </div>
  );
}
