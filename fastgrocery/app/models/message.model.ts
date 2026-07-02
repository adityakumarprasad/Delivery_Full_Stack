import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMessage extends Document {
  roomId: mongoose.Types.ObjectId; // orderId is the chat room
  text: string;
  senderId: mongoose.Types.ObjectId;
  time: string; // e.g. "02:30 PM"
  createdAt?: Date;
  updatedAt?: Date;
}

const MessageSchema: Schema<IMessage> = new Schema(
  {
    roomId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    text: { type: String, required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    time: { type: String, required: true },
  },
  { timestamps: true }
);

const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);

export default Message;
