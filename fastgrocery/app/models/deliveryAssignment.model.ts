import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDeliveryAssignment extends Document {
  order: mongoose.Types.ObjectId;
  brodcastedTo: mongoose.Types.ObjectId[];
  assignedTo: mongoose.Types.ObjectId | null;
  status: "brodcasted" | "assigned" | "completed";
  acceptedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const DeliveryAssignmentSchema: Schema<IDeliveryAssignment> = new Schema(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    brodcastedTo: [{ type: Schema.Types.ObjectId, ref: "User" }],
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", default: null },
    status: {
      type: String,
      enum: ["brodcasted", "assigned", "completed"],
      default: "brodcasted",
    },
    acceptedAt: { type: Date },
  },
  { timestamps: true }
);

const DeliveryAssignment: Model<IDeliveryAssignment> =
  mongoose.models.DeliveryAssignment ||
  mongoose.model<IDeliveryAssignment>("DeliveryAssignment", DeliveryAssignmentSchema);

export default DeliveryAssignment;
