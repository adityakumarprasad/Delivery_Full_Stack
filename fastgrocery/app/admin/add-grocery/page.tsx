"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { GroceryCategories, GroceryUnits } from "@/app/models/grocery.constants";
import { PlusCircle, Image as ImageIcon, UploadCloud, CheckCircle, ShieldAlert } from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";

export default function AddGroceryPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>(GroceryCategories[0]);
  const [unit, setUnit] = useState<string>(GroceryUnits[0]);
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !price || !imageFile) {
      setError("Please fill out all fields and upload an item image.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("category", category);
    formData.append("unit", unit);
    formData.append("price", price);
    formData.append("image", imageFile);

    try {
      await axios.post("/api/admin/add-grocery", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Grocery item added to catalog successfully!");
      // Reset form
      setName("");
      setPrice("");
      setImageFile(null);
      setImagePreview(null);
      setCategory(GroceryCategories[0]);
      setUnit(GroceryUnits[0]);

      // Redirect back to dashboard after brief delay
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Failed to add grocery item. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        <Nav />
        <div className="max-w-3xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-3xl border border-gray-150 shadow-2xl p-6 md:p-8 space-y-8"
          >
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <PlusCircle className="text-green-600 animate-pulse" />
                Add Grocery Item
              </h1>
              <p className="text-gray-500 text-xs mt-1 uppercase font-bold tracking-wider">
                Catalog Management
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-semibold border border-red-100"
              >
                <ShieldAlert size={16} className="shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 bg-green-50 text-green-600 p-4 rounded-2xl text-xs font-semibold border border-green-150"
              >
                <CheckCircle size={16} className="shrink-0" />
                <span>{success}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Form details */}
              <div className="space-y-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                    Product Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Fresh Red Apples"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-150 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-2xl outline-none transition-all text-sm font-semibold text-gray-800"
                    required
                  />
                </div>

                {/* Category Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full pl-4 pr-10 py-3 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-150 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-2xl outline-none appearance-none transition-all text-sm font-semibold text-gray-800"
                      required
                    >
                      {GroceryCategories.map((cat, idx) => (
                        <option key={idx} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Grid for Price and Unit */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Price */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 150"
                      value={price}
                      min="0"
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-150 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-2xl outline-none transition-all text-sm font-semibold text-gray-800"
                      required
                    />
                  </div>

                  {/* Unit Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                      Unit
                    </label>
                    <div className="relative">
                      <select
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        className="w-full pl-4 pr-10 py-3 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-150 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-2xl outline-none appearance-none transition-all text-sm font-semibold text-gray-800"
                        required
                      >
                        {GroceryUnits.map((uni, idx) => (
                          <option key={idx} value={uni}>
                            {uni}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Image uploading */}
              <div className="space-y-4 flex flex-col justify-between">
                <div className="space-y-1.5 flex-grow">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                    Product Image
                  </label>
                  
                  {imagePreview ? (
                    <div className="relative w-full h-48 border border-gray-150 rounded-2xl overflow-hidden shadow-inner group">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <label className="px-4 py-2 bg-white/95 text-gray-800 rounded-xl text-xs font-bold shadow-md cursor-pointer hover:bg-white transition-colors">
                          Change Image
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-green-400 bg-gray-50 hover:bg-green-50/20 rounded-2xl p-8 h-48 cursor-pointer transition-all">
                      <UploadCloud size={36} className="text-gray-400 mb-2 animate-bounce" />
                      <span className="text-xs font-bold text-gray-600">
                        Upload grocery image
                      </span>
                      <span className="text-[10px] text-gray-400 mt-1">
                        PNG, JPG or WEBP (Max 5MB)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        required
                      />
                    </label>
                  )}
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
                    "Save Product"
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
