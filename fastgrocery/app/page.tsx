import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import User from "@/app/models/user.model";
import Nav from "@/components/Nav";
import GeoUpdater from "@/components/GeoUpdater";
import EditRoleMobile from "@/components/EditRoleMobile";
import UserDashboard from "@/components/UserDashboard";
import AdminDashboard from "@/components/AdminDashboard";
import DeliveryBoy from "@/components/DeliveryBoy";
import Footer from "@/components/Footer";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const session = await auth();

  // 1. Redirect if not authenticated
  if (!session || !session.user) {
    redirect("/login");
  }

  await dbConnect();
  const dbUser = await User.findOne({ email: session.user.email });

  if (!dbUser) {
    redirect("/login");
  }

  // 2. Onboarding check: Force role and mobile entry if missing
  if (!dbUser.role || !dbUser.mobile) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <EditRoleMobile />
      </main>
    );
  }

  const { q } = await searchParams;
  const searchQuery = q || "";

  // 3. Render appropriate dashboard based on user role
  return (
    <main className="min-h-screen">
      {/* Geolocation updater runs across roles for background synchronization */}
      <GeoUpdater />

      {dbUser.role === "user" ? (
        <>
          <Nav />
          <UserDashboard searchQuery={searchQuery} />
          <Footer />
        </>
      ) : dbUser.role === "admin" ? (
        <>
          <Nav />
          <AdminDashboard />
          <Footer />
        </>
      ) : dbUser.role === "deliveryBoy" ? (
        <>
          <Nav />
          {/* Render server component wrapper for delivery boy analytics */}
          <DeliveryBoy />
          <Footer />
        </>
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <p className="font-semibold text-gray-500">Invalid account role configuration.</p>
        </div>
      )}
    </main>
  );
}
