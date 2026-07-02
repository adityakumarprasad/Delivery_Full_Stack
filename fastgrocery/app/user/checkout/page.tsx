"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { clearCart } from "@/redux/cartSlice";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import dynamic from "next/dynamic";
import { MapPin, Search, CreditCard, ShieldCheck, Sparkles, AlertCircle } from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";

// Lazy-load CheckoutMap (with Leaflet dependencies) client-side only
const CheckoutMap = dynamic(() => import("@/components/CheckoutMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 bg-gray-50 rounded-3xl border border-gray-150 flex items-center justify-center text-gray-400 text-xs font-semibold">
      Loading interactive map canvas...
    </div>
  ),
});

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const { cartData, subTotal, deliveryFee, finalTotal } = useSelector(
    (state: RootState) => state.cart
  );
  const userData = useSelector((state: RootState) => state.user.userData);

  // Form fields state
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [pincode, setPincode] = useState("");

  // Map state [lat, lon] - defaulting to New Delhi coordinates
  const [mapPosition, setMapPosition] = useState<[number, number]>([28.6139, 77.209]);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill user information from Redux state on mount
  useEffect(() => {
    if (userData) {
      setFullName(userData.name || "");
      setMobile(userData.mobile || "");
      if (userData.location && userData.location.coordinates && userData.location.coordinates[0] !== 0) {
        // coordinates are [lng, lat] in GeoJSON -> mapping wants [lat, lng]
        setMapPosition([userData.location.coordinates[1], userData.location.coordinates[0]]);
        reverseGeocode(userData.location.coordinates[1], userData.location.coordinates[0]);
      }
    }
  }, [userData]);

  // If cart is empty, redirect user back to home
  useEffect(() => {
    if (cartData.length === 0 && !loading) {
      router.push("/");
    }
  }, [cartData, loading, router]);

  // Reverse geocodes coords to text details
  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );
      if (res.data) {
        const addr = res.data.address;
        setFullAddress(res.data.display_name || "");
        setCity(addr.city || addr.town || addr.village || addr.suburb || "");
        setStateName(addr.state || "");
        setPincode(addr.postcode || "");
      }
    } catch (err) {
      console.error("Nominatim Reverse geocoding failed:", err);
    }
  };

  const handlePositionChange = (lat: number, lon: number) => {
    setMapPosition([lat, lon]);
    reverseGeocode(lat, lon);
  };

  // Draggable marker geolocation search
  const handleSearchAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          searchQuery
        )}&format=json&limit=1`
      );

      if (res.data && res.data.length > 0) {
        const { lat, lon, display_name } = res.data[0];
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);
        setMapPosition([latitude, longitude]);
        reverseGeocode(latitude, longitude);
      } else {
        alert("Location search query returned no results.");
      }
    } catch (err) {
      console.error("Nominatim address search failed:", err);
    }
  };

  // Browser navigator geolocation search
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapPosition([latitude, longitude]);
          reverseGeocode(latitude, longitude);
        },
        (err) => {
          console.error("Failed to get current location:", err.message);
          alert(`Geolocation lookup failed: ${err.message}`);
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName || !mobile || !fullAddress || !city || !stateName || !pincode) {
      setError("Please complete all delivery address fields.");
      return;
    }

    setLoading(true);

    const orderPayload = {
      userId: userData?.id,
      items: cartData,
      paymentMethod,
      totalAmount: finalTotal,
      address: {
        fullName,
        mobile,
        city,
        state: stateName,
        pincode,
        fullAddress,
        latitude: mapPosition[0],
        longitude: mapPosition[1],
      },
    };

    try {
      if (paymentMethod === "cod") {
        // Place COD order directly
        await axios.post("/api/user/order", orderPayload);
        dispatch(clearCart());
        router.push("/user/order-success");
      } else {
        // Create Stripe checkout session
        const res = await axios.post("/api/user/payment", orderPayload);
        dispatch(clearCart());
        if (res.data?.url) {
          window.location.href = res.data.url;
        } else {
          throw new Error("Stripe checkout session redirect URL was not returned.");
        }
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Failed to process order. Please try again."
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        <Nav />
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Checkout
            </h1>
            <p className="text-gray-500 text-xs mt-0.5 uppercase font-bold tracking-wider">
              Verify your address and select payment options
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-semibold border border-red-100">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Delivery address & map input (Left Columns) */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-md space-y-6">
              <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-2">
                <MapPin className="text-green-600" />
                Delivery Address Coordinates
              </h3>

              {/* Geolocation Search Form */}
              <form onSubmit={handleSearchAddress} className="flex gap-2">
                <div className="relative flex-grow">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                    <Search size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="Search area (e.g. Connaught Place, New Delhi)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-150 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-2xl outline-none transition-all text-xs font-semibold text-gray-800"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-3 bg-green-600 hover:bg-green-700 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all cursor-pointer shrink-0"
                >
                  Locate
                </button>
              </form>

              {/* Leaflet Draggable Map */}
              <div className="relative">
                <CheckoutMap
                  position={mapPosition}
                  onPositionChange={handlePositionChange}
                />
                
                {/* Floating GPS center button */}
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  className="absolute bottom-4 right-4 z-20 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-150 text-gray-700 font-bold text-[10px] uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1"
                >
                  🎯 Current Location
                </button>
              </div>

              {/* Onboarding text inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                    Recipient Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-150 focus:border-green-500 rounded-2xl outline-none text-xs font-semibold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                    className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-150 focus:border-green-500 rounded-2xl outline-none text-xs font-semibold"
                    required
                  />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                    Full Address Details
                  </label>
                  <textarea
                    rows={2}
                    value={fullAddress}
                    onChange={(e) => setFullAddress(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-150 focus:border-green-500 rounded-2xl outline-none text-xs font-semibold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-150 focus:border-green-500 rounded-2xl outline-none text-xs font-semibold"
                    required
                  />
                </div>

                {/* Grid for State and Pincode */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                      State
                    </label>
                    <input
                      type="text"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      className="w-full px-3 py-3 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-150 focus:border-green-500 rounded-2xl outline-none text-xs font-semibold"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                      Pincode
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                      className="w-full px-3 py-3 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-150 focus:border-green-500 rounded-2xl outline-none text-xs font-semibold"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Order summary sidebar (Right Column) */}
            <div className="space-y-6 lg:sticky lg:top-24">
              {/* Payment selector card */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md space-y-6">
                <h3 className="font-extrabold text-gray-900 text-lg border-b border-gray-50 pb-4">
                  Payment Method
                </h3>

                <div className="space-y-3">
                  {/* Cash on Delivery option */}
                  <label
                    className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === "cod"
                        ? "bg-green-50 border-green-500 text-green-700"
                        : "bg-white border-gray-150 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="hidden"
                    />
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${paymentMethod === "cod" ? "border-green-500" : "border-gray-300"}`}>
                      {paymentMethod === "cod" && <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />}
                    </div>
                    <div>
                      <p className="text-xs font-black">Cash on Delivery</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Pay at your doorstep</p>
                    </div>
                  </label>

                  {/* Online payment option */}
                  <label
                    className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === "online"
                        ? "bg-green-50 border-green-500 text-green-700"
                        : "bg-white border-gray-150 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "online"}
                      onChange={() => setPaymentMethod("online")}
                      className="hidden"
                    />
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${paymentMethod === "online" ? "border-green-500" : "border-gray-300"}`}>
                      {paymentMethod === "online" && <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />}
                    </div>
                    <div>
                      <p className="text-xs font-black">Pay Online (Stripe)</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Secure card checkout</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Total Order Summary breakdown */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md space-y-6">
                <h3 className="font-extrabold text-gray-900 text-sm border-b border-gray-50 pb-4 uppercase tracking-wider">
                  Summary Breakdown
                </h3>

                <div className="space-y-4 text-xs font-semibold text-gray-600">
                  <div className="flex justify-between">
                    <span>Items count</span>
                    <span className="font-bold text-gray-900">{cartData.length} items</span>
                  </div>
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
                  <div className="border-t border-gray-50 pt-4 flex justify-between text-sm font-black text-gray-900">
                    <span>Final Amount</span>
                    <span className="text-green-700">₹{finalTotal}</span>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  onClick={handlePlaceOrder}
                  className="w-full py-4 bg-linear-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg hover:shadow-xl transition-all duration-250 cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : paymentMethod === "cod" ? (
                    "Place Order (COD)"
                  ) : (
                    "Pay & Place Order"
                  )}
                </motion.button>

                <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                  <ShieldCheck size={14} className="text-green-600" />
                  Secure Connection
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
