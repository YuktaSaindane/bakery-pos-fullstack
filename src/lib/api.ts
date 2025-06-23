import { ApiResponse, Product, Order, LoginFormData, ProductFormData, CartItem } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api';

// Helper function to get auth token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

// Helper function to make API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAuthToken();
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Auth API functions
export const authApi = {
  async login(credentials: LoginFormData): Promise<ApiResponse<{user: any, token: string}>> {
    const response = await apiRequest<{user: any, token: string}>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Store token in localStorage on successful login
    if (response.success && response.data?.token) {
      localStorage.setItem('auth_token', response.data.token);
    }

    return response;
  },

  async getCurrentUser(): Promise<ApiResponse<any>> {
    return apiRequest<any>('/auth/me');
  },

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  },

  async changePassword(passwords: {currentPassword: string, newPassword: string}): Promise<ApiResponse<any>> {
    return apiRequest<any>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(passwords),
    });
  },
};

// Products API functions
export const productsApi = {
  async getAll(params?: {category?: string, isActive?: boolean | 'all'}): Promise<ApiResponse<Product[]>> {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.isActive !== undefined && params?.isActive !== 'all') {
      queryParams.append('isActive', String(params.isActive));
    }
    
    const endpoint = `/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiRequest<Product[]>(endpoint);
  },

  async getById(id: string): Promise<ApiResponse<Product>> {
    return apiRequest<Product>(`/products/${id}`);
  },

  async create(productData: ProductFormData): Promise<ApiResponse<Product>> {
    return apiRequest<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  async update(id: string, productData: Partial<ProductFormData>): Promise<ApiResponse<Product>> {
    return apiRequest<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  },

  async delete(id: string, hardDelete: boolean = false): Promise<ApiResponse<any>> {
    const endpoint = `/products/${id}${hardDelete ? '?hardDelete=true' : ''}`;
    return apiRequest<any>(endpoint, {
      method: 'DELETE',
    });
  },

  async updateStock(id: string, quantity: number, operation: 'set' | 'add' | 'subtract' = 'set'): Promise<ApiResponse<Product>> {
    return apiRequest<Product>(`/products/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity, operation }),
    });
  },
};

// Orders API functions
export const ordersApi = {
  async getAll(params?: {
    page?: number,
    limit?: number,
    status?: string,
    startDate?: string,
    endDate?: string
  }): Promise<ApiResponse<{data: Order[], pagination: any}>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.status) queryParams.append('status', params.status);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    
    const endpoint = `/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiRequest<{data: Order[], pagination: any}>(endpoint);
  },

  async getById(id: string): Promise<ApiResponse<Order>> {
    return apiRequest<Order>(`/orders/${id}`);
  },

  async create(orderData: {items: {productId: string, quantity: number}[]}): Promise<ApiResponse<Order>> {
    return apiRequest<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  async updateStatus(id: string, status: string): Promise<ApiResponse<Order>> {
    return apiRequest<Order>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async getStats(period: string = 'today'): Promise<ApiResponse<any>> {
    return apiRequest<any>(`/orders/stats/summary?period=${period}`);
  },

  async getDashboardAnalytics(period: string = 'today'): Promise<ApiResponse<any>> {
    return apiRequest<any>(`/orders/analytics/dashboard?period=${period}`);
  },
};

// Helper function to process cart checkout
export const checkoutCart = async (cartItems: CartItem[]): Promise<ApiResponse<Order>> => {
  const orderItems = cartItems.map(item => ({
    productId: item.productId,
    quantity: item.quantity
  }));

  return ordersApi.create({ items: orderItems });
};

// Helper function to calculate cart total
export const calculateCartTotal = (cartItems: CartItem[]): number => {
  return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
};

// Helper function to get cart item count
export const getCartItemCount = (cartItems: CartItem[]): number => {
  return cartItems.reduce((count, item) => count + item.quantity, 0);
};

// Helper function to format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Helper function to format date
export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default {
  authApi,
  productsApi,
  ordersApi,
  checkoutCart,
  calculateCartTotal,
  getCartItemCount,
  formatCurrency,
  formatDate,
}; 