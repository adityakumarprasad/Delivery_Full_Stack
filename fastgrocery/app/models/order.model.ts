import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrderItem {
  grocery: mongoose.Types.ObjectId;
  name: string;
  price: string;
  unit: string;
  image: string;
  quantity: number;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  paymentMethod: "cod" | "online";
  isPaid: boolean;
  totalAmount: number;
  address: {
    fullName: string;
    mobile: string;
    city: string;
    state: string;
    pincode: string;
    fullAddress: string;
    latitude: number;
    longitude: number;
  };
  assignment: mongoose.Types.ObjectId | null;
  assignedDeliveryBoy: mongoose.Types.ObjectId | null;
  status: "pending" | "out of delivery" | "delivered";
  deliveryOtp: string | null;
  deliveryOtpVerification: boolean;
  deliveredAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const OrderSchema: Schema<IOrder> = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        grocery: { type: Schema.Types.ObjectId, ref: "Grocery", required: true },
        name: { type: String, required: true },
        price: { type: String, required: true },
        unit: { type: String, required: true },
        image: { type: String, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    paymentMethod: {
      type: String,
      enum: ["cod", "online"],
      default: "cod",
    },
    isPaid: { type: Boolean, default: false },
    totalAmount: { type: Number, required: true },
    address: {
      fullName: { type: String, required: true },
      mobile: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      fullAddress: { type: String, required: true },
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    assignment: {
      type: Schema.Types.ObjectId,
      ref: "DeliveryAssignment",
      default: null,
    },
    assignedDeliveryBoy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "out of delivery", "delivered"],
      default: "pending",
    },
    deliveryOtp: { type: String, default: null },
    deliveryOtpVerification: { type: Boolean, default: false },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
