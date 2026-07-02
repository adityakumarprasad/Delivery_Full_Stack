"use client";

import React, { useEffect, useState } from "react";
import HeroSection from "./HeroSection";
import CategorySlider from "./CategorySlider";
import GroceryItemCard from "./GroceryItemCard";
import { Sparkles, ShoppingBag } from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";

interface GroceryItem {
  _id: string;
  name: string;
  category: string;
  price: string;
  unit: string;
  image: string;
}

interface UserDashboardProps {
  searchQuery: string;
}

export default function UserDashboard({ searchQuery }: UserDashboardProps) {
  const [groceries, setGroceries] = useState<GroceryItem[]>([]);
  const [filteredGroceries, setFilteredGroceries] = useState<GroceryItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch groceries when search query changes
  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const url = searchQuery
          ? `/api/admin/get-groceries?q=${encodeURIComponent(searchQuery)}`
          : "/api/admin/get-groceries";
        const res = await axios.get(url);
        setGroceries(res.data);
      } catch (error) {
        console.error("Failed to load catalog in UserDashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    
    // Simple debounce/delay if searching to prevent spam
    const delayDebounceFn = setTimeout(() => {
      fetchCatalog();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Client-side category filtering
  useEffect(() => {
    if (!activeCategory) {
      setFilteredGroceries(groceries);
    } else {
      const filtered = groceries.filter(
        (item) => item.category === activeCategory
      );
      setFilteredGroceries(filtered);
    }
  }, [activeCategory, groceries]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* 1. Carousel Slider banner */}
      <HeroSection />

      {/* 2. Horizontal category filters */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-1.5">
            <Sparkles size={18} className="text-green-600" />
            Browse Categories
          </h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
            Quick filter by category
          </p>
        </div>
        <CategorySlider
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />
      </div>

      {/* 3. Catalog grid */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-1.5">
            <ShoppingBag size={18} className="text-green-600" />
            {activeCategory ? activeCategory : "All Products"}
          </h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
            Quality groceries delivered fresh
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-4">
            <span className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold">Loading grocery shelf...</p>
          </div>
        ) : filteredGroceries.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-md text-gray-400 p-8">
            <ShoppingBag size={48} className="mx-auto stroke-1 text-gray-300 mb-2" />
            <h4 className="font-extrabold text-gray-800 mb-0.5">No products available</h4>
            <p className="text-xs">
              No products found matching your search criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredGroceries.map((item) => (
              <GroceryItemCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
