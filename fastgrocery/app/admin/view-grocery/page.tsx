"use client";

import React, { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { GroceryCategories, GroceryUnits } from "@/app/models/grocery.constants";
import { Search, Edit3, Trash2, X, Upload, ShieldAlert, Sparkles } from "lucide-react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";

interface GroceryItem {
  _id: string;
  name: string;
  category: string;
  price: string;
  unit: string;
  image: string;
}

export default function ViewGroceryPage() {
  const [groceries, setGroceries] = useState<GroceryItem[]>([]);
  const [filteredGroceries, setFilteredGroceries] = useState<GroceryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchGroceries = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/get-groceries");
      setGroceries(res.data);
      setFilteredGroceries(res.data);
    } catch (err) {
      console.error("Failed to fetch groceries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroceries();
  }, []);

  // Filter items client-side
  useEffect(() => {
    if (!searchQuery) {
      setFilteredGroceries(groceries);
    } else {
      const q = searchQuery.toLowerCase();
      const filtered = groceries.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
      );
      setFilteredGroceries(filtered);
    }
  }, [searchQuery, groceries]);

  // Open Edit Modal
  const openEditModal = (item: GroceryItem) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditCategory(item.category);
    setEditPrice(item.price);
    setEditUnit(item.unit);
    setEditImagePreview(item.image);
    setEditImageFile(null);
    setError("");
  };

  // Close Edit Modal
  const closeEditModal = () => {
    setEditingItem(null);
    setEditImagePreview(null);
    setEditImageFile(null);
  };

  // Image selection helper
  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditImageFile(file);
      setEditImagePreview(URL.createObjectURL(file));
    }
  };

  // Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setActionLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("groceryId", editingItem._id);
    formData.append("name", editName);
    formData.append("category", editCategory);
    formData.append("price", editPrice);
    formData.append("unit", editUnit);
    if (editImageFile) {
      formData.append("image", editImageFile);
    }

    try {
      await axios.post("/api/admin/edit-grocery", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      closeEditModal();
      fetchGroceries();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update item");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Item
  const handleDeleteItem = async () => {
    if (!editingItem) return;
    if (!confirm(`Are you sure you want to delete "${editingItem.name}"?`)) return;

    setActionLoading(true);
    setError("");

    try {
      await axios.post("/api/admin/delete-grocery", {
        groceryId: editingItem._id,
      });
      closeEditModal();
      fetchGroceries();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete item");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        <Nav />
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                Grocery Catalog
              </h1>
              <p className="text-gray-500 text-xs mt-0.5 uppercase font-bold tracking-wider">
                View, search, edit and delete catalog products
              </p>
            </div>

            {/* Catalog search bar */}
            <div className="relative w-full md:w-80">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <Search size={18} />
              </span>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-150 rounded-2xl outline-none focus:border-green-500 text-sm font-semibold shadow-xs"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-4">
              <span className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-semibold">Loading catalog list...</p>
            </div>
          ) : filteredGroceries.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-md text-gray-400 p-8">
              <Sparkles size={48} className="mx-auto stroke-1 text-gray-300 mb-2" />
              <h3 className="font-extrabold text-gray-800 mb-1">No items found</h3>
              <p className="text-xs">
                Try searching for another product or add a new grocery.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredGroceries.map((item) => (
                <motion.div
                  key={item._id}
                  layout
                  className="bg-white rounded-3xl p-4 border border-gray-100 shadow-md flex flex-col justify-between group hover:shadow-lg transition-all"
                >
                  <div className="space-y-4">
                    {/* Card Image */}
                    <div className="w-full h-40 bg-gray-50 rounded-2xl overflow-hidden relative border border-gray-100">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2 left-2 px-2.5 py-0.5 bg-white/95 backdrop-blur-xs text-[10px] font-black text-gray-800 rounded-full shadow-xs">
                        {item.category}
                      </span>
                    </div>

                    {/* Card Content */}
                    <div className="space-y-1">
                      <h3 className="text-sm font-black text-gray-900 leading-snug">
                        {item.name}
                      </h3>
                      <p className="text-xs font-black text-green-600">
                        ₹{item.price}{" "}
                        <span className="text-[10px] text-gray-400 font-bold">
                          / {item.unit}
                        </span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => openEditModal(item)}
                    className="w-full mt-4 py-2.5 bg-gray-50 hover:bg-green-50 text-gray-700 hover:text-green-700 border border-gray-100 hover:border-green-150 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 size={14} />
                    Edit Details
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />

      {/* Edit Modal (Overlay & Dialog) */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeEditModal}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />

            {/* Modal Dialog card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden p-6 md:p-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-50 pb-4 mb-6">
                <div>
                  <h3 className="text-lg font-black text-gray-900">
                    Modify Product Details
                  </h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    Update or delete product item
                  </p>
                </div>
                <button
                  onClick={closeEditModal}
                  className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-semibold mb-6 border border-red-100">
                  <ShieldAlert size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form content */}
              <form onSubmit={handleEditSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Form fields */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-150 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-xl outline-none transition-all text-xs font-semibold text-gray-800"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                      Category
                    </label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-150 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-xl outline-none appearance-none transition-all text-xs font-semibold text-gray-800"
                      required
                    >
                      {GroceryCategories.map((cat, idx) => (
                        <option key={idx} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                        Price (₹)
                      </label>
                      <input
                        type="number"
                        value={editPrice}
                        min="0"
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-150 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-xl outline-none transition-all text-xs font-semibold text-gray-800"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                        Unit
                      </label>
                      <select
                        value={editUnit}
                        onChange={(e) => setEditUnit(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-150 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-xl outline-none appearance-none transition-all text-xs font-semibold text-gray-800"
                        required
                      >
                        {GroceryUnits.map((uni, idx) => (
                          <option key={idx} value={uni}>
                            {uni}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Image upload column */}
                <div className="space-y-4 flex flex-col justify-between">
                  <div className="space-y-1.5 flex-grow">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                      Product Image
                    </label>
                    <div className="relative w-full h-40 border border-gray-150 rounded-2xl overflow-hidden shadow-inner group">
                      {editImagePreview && (
                        <img
                          src={editImagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <label className="px-4 py-2 bg-white/95 text-gray-800 rounded-xl text-[10px] font-black shadow-md cursor-pointer hover:bg-white transition-colors">
                          Upload New Image
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleEditImageChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={handleDeleteItem}
                      className="px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shrink-0"
                    >
                      <Trash2 size={15} />
                    </button>
                    
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="w-full py-3 bg-linear-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {actionLoading ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        "Save Updates"
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
