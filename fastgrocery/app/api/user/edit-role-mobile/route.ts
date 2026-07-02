import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import User from "@/app/models/user.model";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role, mobile } = await req.json();
    if (!role || !mobile) {
      return NextResponse.json(
        { error: "Role and mobile number are required" },
        { status: 400 }
      );
    }

    if (role === "admin") {
      // Security check: only allow admin role if no other admin exists
      await dbConnect();
      const adminExist = await User.findOne({ role: "admin" });
      if (adminExist) {
        return NextResponse.json(
          { error: "An admin account already exists. You cannot onboard as admin." },
          { status: 400 }
        );
      }
    }

    await dbConnect();
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      { role, mobile },
      { returnDocument: 'after' }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Profile onboarding completed successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        mobile: updatedUser.mobile,
      },
    });
  } catch (error: any) {
    console.error("POST /api/user/edit-role-mobile error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
