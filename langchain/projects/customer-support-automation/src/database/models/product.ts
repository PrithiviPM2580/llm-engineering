import mongoose from "mongoose";
import type { Product } from "../type";

const productSchema = new mongoose.Schema<Product>(
  {
    name: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    stock: { type: Number, required: true },
    warranty: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
  },
  {
    timestamps: true,
  },
);

const ProductModel = mongoose.model<Product>("Product", productSchema);
export default ProductModel;
