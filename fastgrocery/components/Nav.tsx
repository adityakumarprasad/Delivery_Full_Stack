"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  User,
  LogOut,
  PlusCircle,
  Eye,
  Settings,
  ClipboardList
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface NavProps {
  onSearch?: (query: string) => void;
}

export default function Nav({ onSearch }: NavProps) {
  const { data: session } = useSession();
  const cartData = useSelector((state: RootState) => state.cart.cartData);
  const cartCount = cartData.reduce((acc, item) => acc + item.quantity, 0);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  const role = session?.user?.role || "user";
  const userName = session?.user?.name || "Guest";

  return (
    <>
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 bg-linear-to-r from-green-600 to-green-800 text-white rounded-2xl shadow-xl px-4 py-3 md:px-6 flex items-center justify-between border border-green-500/20">
        {/* Left: Brand logo */}
        <Link href="/" className="flex items-center gap-2 select-none group">
          <span className="p-2 bg-white/10 rounded-xl group-hover:scale-105 transition-transform duration-200">
            🛒
          </span>
          <span className="font-black text-lg tracking-tight uppercase">
            FastGrocery
          </span>
        </Link>

        {/* Center: Search Bar (User / Customer Role Only) */}
        {role === "user" && onSearch && (
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center bg-white/10 hover:bg-white/15 focus-within:bg-white/20 rounded-xl px-3 py-1.5 w-80 transition-colors border border-white/10"
          >
            <Search size={16} className="text-white/70 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search groceries..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="bg-transparent text-white placeholder-white/60 text-xs font-semibold outline-none w-full"
            />
          </form>
        )}

        {/* Right Action panel */}
        <div className="flex items-center gap-4">
          {/* Admin Desktop Shortcut Navigation Links */}
          {role === "admin" && (
            <div className="hidden lg:flex items-center gap-3">
              <Link
                href="/admin/add-grocery"
                className="text-xs font-black uppercase tracking-wider hover:text-green-200 transition-colors flex items-center gap-1"
              >
                <PlusCircle size={14} />
                Add Item
              </Link>
              <Link
                href="/admin/view-grocery"
                className="text-xs font-black uppercase tracking-wider hover:text-green-200 transition-colors flex items-center gap-1"
              >
                <Eye size={14} />
                View Catalog
              </Link>
              <Link
                href="/admin/manage-orders"
                className="text-xs font-black uppercase tracking-wider hover:text-green-200 transition-colors flex items-center gap-1"
              >
                <Settings size={14} />
                Orders
              </Link>
            </div>
          )}

          {/* Cart Icon (Customer Role Only) */}
          {role === "user" && (
            <Link
              href="/user/cart"
              className="relative p-2 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center bg-red-500 text-white font-extrabold text-[9px] w-5 h-5 rounded-full ring-2 ring-green-600 animate-bounce">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
            >
              <User size={20} />
            </button>

            <AnimatePresence>
              {profileDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 mt-3 w-56 bg-white text-gray-800 rounded-2xl shadow-2xl border border-gray-100 overflow-hidden py-2"
                >
                  <div className="px-4 py-3 border-b border-gray-50">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-wider">
                      Signed in as
                    </p>
                    <p className="text-sm font-black text-gray-800 truncate">
                      {userName}
                    </p>
                    <span className="inline-block text-[9px] font-black uppercase bg-green-50 text-green-600 border border-green-150 px-2 py-0.5 rounded-full mt-1">
                      {role}
                    </span>
                  </div>

                  {role === "user" && (
                    <Link
                      href="/user/my-orders"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="w-full px-4 py-3 hover:bg-gray-50 text-xs font-bold text-gray-700 flex items-center gap-2 transition-colors"
                    >
                      <ClipboardList size={15} />
                      My Orders
                    </Link>
                  )}

                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full px-4 py-3 hover:bg-red-50 text-xs font-bold text-red-600 flex items-center gap-2 transition-colors text-left cursor-pointer"
                  >
                    <LogOut size={15} />
                    Log Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Admin Mobile Sidebar Menu Toggle */}
          {role === "admin" && (
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <Menu size={20} />
            </button>
          )}
        </div>
      </nav>

      {/* Admin Mobile Sidebar (Overlay) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-72 bg-white h-full shadow-2xl p-6 flex flex-col justify-between"
            >
              <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🛒</span>
                    <span className="font-black text-gray-900 tracking-tight">
                      ADMIN PANEL
                    </span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Navigation options */}
                <div className="flex flex-col gap-2">
                  <Link
                    href="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 text-xs font-bold text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-xl transition-all"
                  >
                    <Settings size={18} />
                    Overview Dashboard
                  </Link>
                  <Link
                    href="/admin/add-grocery"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 text-xs font-bold text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-xl transition-all"
                  >
                    <PlusCircle size={18} />
                    Add Grocery Item
                  </Link>
                  <Link
                    href="/admin/view-grocery"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 text-xs font-bold text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-xl transition-all"
                  >
                    <Eye size={18} />
                    View Catalog
                  </Link>
                  <Link
                    href="/admin/manage-orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 text-xs font-bold text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-xl transition-all"
                  >
                    <ClipboardList size={18} />
                    Manage Orders
                  </Link>
                </div>
              </div>

              {/* Sidebar footer info */}
              <div className="border-t border-gray-50 pt-4 text-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Admin session
                </span>
                <span className="text-xs font-black text-gray-800">
                  {userName}
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Spacer to push content down since Nav is fixed */}
      <div className="h-24" />
    </>
  );
}
