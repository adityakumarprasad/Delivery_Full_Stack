"use client";

import React, { useState } from "react";
import { Plus, ShoppingCart, Check } from "lucide-react";
import { useDispatch } from "react-redux";
import { addToCart } from "@/redux/cartSlice";
import { motion } from "framer-motion";

interface GroceryItemCardProps {
  item: {
    _id: string;
    name: string;
    category: string;
    price: string;
    unit: string;
    image: string;
  };
}

export default function GroceryItemCard({ item }: GroceryItemCardProps) {
  const dispatch = useDispatch();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        _id: item._id,
        name: item.name,
        price: item.price,
        unit: item.unit,
        image: item.image,
      })
    );

    // Toggle added state for feedback animation
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
    }, 1000);
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-3xl p-4 border border-gray-100 shadow-md hover:shadow-xl flex flex-col justify-between group overflow-hidden relative"
    >
      {/* Category Tag overlay */}
      <div className="absolute top-6 left-6 z-10">
        <span className="px-2.5 py-0.5 bg-white/95 backdrop-blur-xs text-[9px] font-black text-gray-800 rounded-full border border-gray-100 shadow-xs uppercase tracking-wider">
          {item.category}
        </span>
      </div>

      <div className="space-y-4">
        {/* Card Image */}
        <div className="w-full h-40 bg-gray-50 rounded-2xl overflow-hidden relative border border-gray-100">
          <img
            src={item.image}
            alt={item.name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Content */}
        <div className="space-y-1">
          <h3 className="text-sm font-black text-gray-900 leading-snug tracking-tight truncate">
            {item.name}
          </h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            Per {item.unit}
          </p>
        </div>
      </div>

      {/* Price & Add to Cart button */}
      <div className="flex items-center justify-between mt-4">
        <div className="space-y-0.5">
          <span className="text-lg font-black text-gray-900">
            ₹{item.price}
          </span>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleAddToCart}
          className={`p-3 rounded-2xl shadow-md transition-all flex items-center justify-center cursor-pointer ${
            added
              ? "bg-emerald-500 text-white shadow-emerald-100"
              : "bg-green-600 hover:bg-green-700 text-white hover:shadow-lg shadow-green-150"
          }`}
        >
          {added ? <Check size={16} /> : <Plus size={16} />}
        </motion.button>
      </div>
    </motion.div>
  );
}
