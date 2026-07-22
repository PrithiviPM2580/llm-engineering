import { Types } from "mongoose";

export interface Customer {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  _id: Types.ObjectId;
  name: string;
  brand: string;
  category: string;
  stock: number;
  warranty: string;
  description: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  _id: Types.ObjectId;
  customerId: Types.ObjectId;
  products: { productId: Types.ObjectId; quantity: number }[];
  status: "pending" | "shipped" | "delivered" | "cancelled";
  trackingNumber: string;
  shippingAddress: string;
  totalPrice: number;
  orderDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Ticket {
  _id: Types.ObjectId;
  customerId: Types.ObjectId;
  orderId: Types.ObjectId;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  createdAt: Date;
  updatedAt: Date;
}
