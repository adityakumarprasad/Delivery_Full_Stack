import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Grocery from "@/app/models/grocery.model";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    await dbConnect();

    let filter = {};
    if (query) {
      filter = {
        $or: [
          { name: { $regex: query, $options: "i" } },
          { category: { $regex: query, $options: "i" } },
        ],
      };
    }

    const groceries = await Grocery.find(filter).sort({ createdAt: -1 });
    return NextResponse.json(groceries);
  } catch (error: any) {
    console.error("GET /api/admin/get-groceries error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
