import mongoose from "mongoose";
import type { Order } from "../type";

const orderSchema = new mongoose.Schema<Order>(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    trackingNumber: { type: String, required: true },
    shippingAddress: { type: String, required: true },
    totalPrice: { type: Number, required: true },
    orderDate: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

const OrderModel = mongoose.model<Order>("Order", orderSchema);
export default OrderModel;
