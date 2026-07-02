import mongoose, { Schema, Document, Model } from "mongoose";
import { GroceryCategories, GroceryUnits } from "./grocery.constants";

export interface IGrocery extends Document {
  name: string;
  category: typeof GroceryCategories[number];
  price: string;
  unit: typeof GroceryUnits[number];
  image: string; // Cloudinary URL
  createdAt?: Date;
  updatedAt?: Date;
}

const GrocerySchema: Schema<IGrocery> = new Schema(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      enum: GroceryCategories,
      required: true,
    },
    price: { type: String, required: true },
    unit: {
      type: String,
      enum: GroceryUnits,
      required: true,
    },
    image: { type: String, required: true },
  },
  { timestamps: true }
);

const Grocery: Model<IGrocery> =
  mongoose.models.Grocery || mongoose.model<IGrocery>("Grocery", GrocerySchema);

export default Grocery;
