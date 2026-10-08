export interface User {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
  email_verified: boolean;
  created_at?: string;
  order_count?: number;
  total_spent?: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  category: 'Shoes' | 'T-Shirts' | string;
  price: number;
  stock_quantity: number;
  size: string; // e.g. "40, 41, 42" or "S, M, L"
  color: string;
  image_url: string;
  additional_images?: string | string[];
  gallery?: string[];
  featured?: boolean;
  created_at?: string;
  updated_at?: string;
  stock_status?: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  imageUrl: string;
  maxStock: number;
}

export interface OrderItem {
  id?: number;
  order_id?: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  size: string;
  color: string;
  image_url?: string;
}

export interface Order {
  id: number;
  order_number: string;
  user_id?: number | null;
  customer_name: string;
  customer_email: string;
  phone: string;
  shipping_address: string;
  city?: string;
  state?: string;
  country?: string;
  total_amount: number;
  delivery_fee: number;
  payment_reference: string;
  payment_status: 'Pending' | 'Paid' | 'Failed';
  order_status: 'Pending' | 'Paid' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface PaymentRecord {
  id: number;
  user_id?: number;
  order_id: number;
  reference: string;
  amount: number;
  currency: string;
  status: 'successful' | 'pending' | 'failed';
  paid_at?: string;
  created_at: string;
  order_number?: string;
  customer_name?: string;
  customer_email?: string;
  gateway_response?: any;
}

export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  lowStockCount: number;
  lowStockProducts: Product[];
  recentOrders: Order[];
  bestSellers: {
    id: number;
    name: string;
    category: string;
    price: number;
    image_url: string;
    units_sold: number;
    total_sales: number;
  }[];
  salesOverTime: {
    name: string;
    revenue: number;
    orders: number;
  }[];
}
