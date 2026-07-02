import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Grocery from "@/app/models/grocery.model";
import { uploadOnCloudinary } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    // Role check in API layer as defense-in-depth
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const formData = await req.formData();
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const unit = formData.get("unit") as string;
    const price = formData.get("price") as string;
    const imageFile = formData.get("image") as File;

    if (!name || !category || !unit || !price || !imageFile) {
      return NextResponse.json(
        { error: "All fields are required, including the image file" },
        { status: 400 }
      );
    }

    // Upload to Cloudinary
    const imageUrl = await uploadOnCloudinary(imageFile);
    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image upload failed" },
        { status: 500 }
      );
    }

    await dbConnect();
    const grocery = await Grocery.create({
      name,
      category: category as any,
      price,
      unit: unit as any,
      image: imageUrl,
    });

    return NextResponse.json(
      { message: "Grocery item created successfully", grocery },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/admin/add-grocery error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
