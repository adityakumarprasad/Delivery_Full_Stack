import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-gray-50 border-t border-gray-150 py-8 px-4 mt-16">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <div>
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="text-lg">🛒</span>
            <span className="font-black text-gray-800 tracking-tight uppercase">
              FastGrocery
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1 font-semibold uppercase tracking-wider">
            Freshness delivered straight to your door.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-xs font-bold text-gray-500 hover:text-green-600 transition-colors"
          >
            Store
          </Link>
          <a
            href="#"
            className="text-xs font-bold text-gray-500 hover:text-green-600 transition-colors"
          >
            Terms of Service
          </a>
          <a
            href="#"
            className="text-xs font-bold text-gray-500 hover:text-green-600 transition-colors"
          >
            Privacy Policy
          </a>
        </div>

        <div>
          <p className="text-xs font-bold text-gray-400">
            &copy; {new Date().getFullYear()} FastGrocery. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
