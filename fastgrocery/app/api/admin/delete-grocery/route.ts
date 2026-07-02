import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Grocery from "@/app/models/grocery.model";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const { groceryId } = await req.json();
    if (!groceryId) {
      return NextResponse.json({ error: "Grocery ID is required" }, { status: 400 });
    }

    await dbConnect();
    const deletedGrocery = await Grocery.findByIdAndDelete(groceryId);

    if (!deletedGrocery) {
      return NextResponse.json({ error: "Grocery item not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Grocery item deleted successfully",
      id: groceryId,
    });
  } catch (error: any) {
    console.error("POST /api/admin/delete-grocery error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
