import mongoose from "mongoose";
import type { Customer } from "../type";

const customerSchema = new mongoose.Schema<Customer>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

const CustomerModel = mongoose.model<Customer>("Customer", customerSchema);
export default CustomerModel;
