export interface Category {
  id?: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  is_active: boolean;
  average_rating: number;
  total_reviews: number;
  brand: string;
  category_id: string;
  category: Category;
  created_at: string;
  updated_at: string;
}

export interface PaginationMeta {
  current_page: number;
  limit: number;
  total_items: number;
  total_pages: number;
}

export interface PaginatedProductsResponse {
  meta: PaginationMeta;
  data: Product[];
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface UserRegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface ResetPasswordRequest {
  otp: string;
  email: string;
  password: string;
}

export interface OrderUser {
  id: string;
  name: string;
}

export interface OrderProductItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
}

export interface OrderListItem {
  id: string;
  user: OrderUser;
  total_amount: number;
  payment_status: string;
  payment_method: string;
  order_status: string;
  delivery_status: string;
  shipping_address: string;
  items: OrderProductItem[];
  created_at: string;
}

export interface Order {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  total_amount: number;
  payment_status: string;
  payment_method: string;
  order_status: string;
  delivery_status: string;
  shipping_address: string;
  items: {
    id: string;
    product_id: string;
    product_name: string;
    product_image?: string;
    quantity: number;
    price: number;
  }[];
  created_at: string;
}

export interface CreateOrderResponse {
  success: boolean;
  message: string;
  data: Order;
}

export interface OrderPaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface PaginatedOrdersResponse {
  success: boolean;
  message: string;
  data: {
    orders: OrderListItem[];
    pagination: OrderPaginationMeta;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  is_verified: boolean;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

export interface PaginatedUsersResponse {
  meta: PaginationMeta;
  data: User[];
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}
