export type Role = "customer" | "admin" | "superadmin";

export type ProductCategory = "Dog" | "Cat" | "Fish" | "Hamster" | "Rabbit" | "Birds";

export type DisplaySection = "Home" | ProductCategory;

export type ProductTag = "recommended" | "trending" | "popular";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  approved: boolean;
};

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  displaySection: DisplaySection;
  position: number;
  tags?: ProductTag[];
  brand: string;
  image: string;
  gallery?: string[];
  description: string;
  quantity: number;
  price: number;
  discount?: number;
  manufactureDate: string;
  expiryDate: string;
  soldCount: number;
  revenue: number;
  rating: number;
};

export type AdminRecord = {
  id: string;
  name: string;
  email: string;
  status: "Approved" | "Active" | "Pending" | "Rejected" | "Revoked";
  leaveDays: number;
  lastLogin: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type SignupRole = "customer" | "admin";

export type SignupPayload = {
  name: string;
  email: string;
  password: string;
  role: SignupRole;
};

export type SignupResult = {
  user: User | null;
  requiresEmailVerification: boolean;
  message?: string;
};

export type CartItem = {
  productId: string;
  quantity: number;
};
