// Database Types
export interface Product {
  id: number;
  productCode: string;
  name: string;
  price: number;
  category: string;
  stockQty: number;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: number;
  totalAmount: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  priceAtPurchase: number;
  product?: Product;
}

export interface User {
  id: number;
  email: string;
  password: string;
  role: UserRole;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// String literal types (instead of enums for SQLite compatibility)
export type OrderStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';
export type UserRole = 'ADMIN' | 'CASHIER';

// Constants for the string values
export const ORDER_STATUS = {
  PENDING: 'PENDING' as const,
  COMPLETED: 'COMPLETED' as const,
  CANCELLED: 'CANCELLED' as const
} as const;

export const USER_ROLE = {
  ADMIN: 'ADMIN' as const,
  CASHIER: 'CASHIER' as const
} as const;

// Frontend Types
export interface CartItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
}

// Alternative cart item for different use cases
export interface CartItemWithProduct {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form Types
export interface ProductFormData {
  name: string;
  price: number;
  category: string;
  stockQty: number;
  imageUrl?: string;
  isActive: boolean;
}

export interface LoginFormData {
  email: string;
  password: string;
}

// Categories
export const PRODUCT_CATEGORIES = [
  'Breads',
  'Pastries', 
  'Cakes',
  'Cookies',
  'Beverages',
  'Sandwiches',
  'Seasonal',
  'Other'
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number]; 