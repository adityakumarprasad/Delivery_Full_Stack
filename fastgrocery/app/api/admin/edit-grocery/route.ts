import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Grocery from "@/app/models/grocery.model";
import { uploadOnCloudinary } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const formData = await req.formData();
    const groceryId = formData.get("groceryId") as string;
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const unit = formData.get("unit") as string;
    const price = formData.get("price") as string;
    const imageFile = formData.get("image"); // can be File, string, or null

    if (!groceryId || !name || !category || !unit || !price) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await dbConnect();
    const existingGrocery = await Grocery.findById(groceryId);
    if (!existingGrocery) {
      return NextResponse.json({ error: "Grocery item not found" }, { status: 404 });
    }

    let imageUrl = existingGrocery.image;

    // Check if image is a File (user uploaded a new image)
    if (imageFile && typeof imageFile !== "string" && (imageFile as File).size > 0) {
      const newImageUrl = await uploadOnCloudinary(imageFile as File);
      if (newImageUrl) {
        imageUrl = newImageUrl;
      } else {
        return NextResponse.json(
          { error: "New image upload failed" },
          { status: 500 }
        );
      }
    }

    const updatedGrocery = await Grocery.findByIdAndUpdate(
      groceryId,
      {
        name,
        category: category as any,
        price,
        unit: unit as any,
        image: imageUrl,
      },
      { returnDocument: 'after' }
    );

    return NextResponse.json({
      message: "Grocery item updated successfully",
      grocery: updatedGrocery,
    });
  } catch (error: any) {
    console.error("POST /api/admin/edit-grocery error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
