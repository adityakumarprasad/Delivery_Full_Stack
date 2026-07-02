"use client";

import React from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { updateQuantity, removeFromCart } from "@/redux/cartSlice";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { ShoppingBasket, Trash2, Plus, Minus, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function CartPage() {
  const dispatch = useDispatch();
  const { cartData, subTotal, deliveryFee, finalTotal } = useSelector(
    (state: RootState) => state.cart
  );

  const handleQtyChange = (groceryId: string, currentQty: number, change: number) => {
    dispatch(updateQuantity({ groceryId, quantity: currentQty + change }));
  };

  const handleRemove = (groceryId: string) => {
    dispatch(removeFromCart(groceryId));
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        <Nav />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-6">
            Shopping Cart
          </h1>

          {cartData.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-md p-8"
            >
              <ShoppingBasket size={64} className="mx-auto text-gray-300 stroke-1 mb-4" />
              <h3 className="text-lg font-black text-gray-800 mb-1">Your cart is empty</h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto mb-8">
                Looks like you haven't added any grocery items to your bag yet.
              </p>
              <Link
                href="/"
                className="px-6 py-3 bg-linear-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all"
              >
                Continue Shopping
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Items List Column (Left) */}
              <div className="lg:col-span-2 space-y-4">
                {cartData.map((item) => (
                  <motion.div
                    key={item.grocery}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-white rounded-3xl p-4 border border-gray-100 shadow-md flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      {/* Item Image */}
                      <div className="w-16 h-16 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Name / Price */}
                      <div>
                        <h3 className="text-sm font-black text-gray-900 leading-snug">
                          {item.name}
                        </h3>
                        <p className="text-xs font-semibold text-gray-400 mt-0.5">
                          ₹{item.price} / {item.unit}
                        </p>
                      </div>
                    </div>

                    {/* Quantity controls & removal */}
                    <div className="flex items-center gap-6">
                      <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl px-2 py-1">
                        <button
                          onClick={() => handleQtyChange(item.grocery, item.quantity, -1)}
                          className="p-1 hover:bg-gray-200 text-gray-500 rounded-lg transition-colors cursor-pointer"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-xs font-black text-gray-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQtyChange(item.grocery, item.quantity, 1)}
                          className="p-1 hover:bg-gray-200 text-gray-500 rounded-lg transition-colors cursor-pointer"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Computed Total Price */}
                      <div className="text-right w-20">
                        <span className="text-sm font-black text-gray-800">
                          ₹{parseFloat(item.price) * item.quantity}
                        </span>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => handleRemove(item.grocery)}
                        className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-xl transition-colors cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Order Summary Column (Right) */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md space-y-6 lg:sticky lg:top-24">
                <h3 className="font-extrabold text-gray-900 text-lg border-b border-gray-50 pb-4">
                  Order Summary
                </h3>

                <div className="space-y-4 text-xs font-semibold text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-gray-900">₹{subTotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className={`font-bold ${deliveryFee === 0 ? "text-green-600" : "text-gray-900"}`}>
                      {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                    </span>
                  </div>
                  
                  {deliveryFee > 0 && (
                    <p className="text-[10px] text-green-600 font-bold bg-green-50/50 p-2.5 rounded-xl">
                      💡 Add ₹{(101 - subTotal).toFixed(0)} more for FREE delivery!
                    </p>
                  )}
                  
                  <div className="border-t border-gray-50 pt-4 flex justify-between text-sm font-black text-gray-900">
                    <span>Total Amount</span>
                    <span className="text-green-700">₹{finalTotal}</span>
                  </div>
                </div>

                <Link
                  href="/user/checkout"
                  className="w-full py-4 bg-linear-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg hover:shadow-xl transition-all duration-250 flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                  <ArrowRight size={15} />
                </Link>

                <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                  <ShieldCheck size={14} className="text-green-600" />
                  Secure Checkout
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
