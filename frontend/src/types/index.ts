// User Types
export type UserRole = 'CL' | 'CO' | 'DA' | 'WM' | 'BM' | 'AD';

export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  isAuthenticated: boolean;
  date_joined: string;
  is_active: boolean;
  role: UserRole;
  language_preference?: string;
}

// Product Types
export type PanelType = 'LP' | 'MF' | 'MH';

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  finalPrice?: number;
  discountPercentage?: number;
  rating?: number;
  stock?: number;
  brand?: string;
  category: string | number | Category;
  thumbnail: string;
  images?: string[];
  discount_price?: number;
  stock_quantity?: number;
  image_url?: string;
  average_rating?: number;
  review_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
}

// Cart Types
export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  price: number;
  total_price: number;
}

// Order Types
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: number;
  order_number?: string;
  customer?: Customer;
  client?: User;
  client_username?: string;
  items: OrderItem[];
  total: number;
  total_amount?: number;
  status: OrderStatus;
  status_display?: string;
  shipping_address: Address;
  payment_method?: PaymentMethod;
  delivery_notes?: string;
  delivery_date?: string;
  created_at: string;
  updated_at: string;
}

// Customer Types
export interface Customer {
  id: number;
  user: User;
  company_name?: string;
  phone: string;
  addresses: Address[];
  payment_methods: PaymentMethod[];
}

// Delivery Types
export interface Delivery {
  id: number;
  order: Order;
  agent: User;
  status: DeliveryStatus;
  route: Route;
  scheduled_date: string;
  actual_date?: string;
  photos?: string[];
  signature?: string;
  notes?: string;
}

export type DeliveryStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

// Inventory Types
export interface InventoryItem {
  id: number;
  product: Product;
  quantity: number;
  location: string;
  supplier: Supplier;
  last_updated: string;
}

// Invoice Types
export interface Invoice {
  id: number;
  invoice_number: string;
  order: number | Order;
  order_details?: Order;
  client: number | User;
  client_username?: string;
  status: 'DR' | 'PE' | 'PA' | 'PP' | 'OV' | 'CA';
  status_display?: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  total_paid?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  payments?: Payment[];
  credit_notes?: CreditNote[];
}

export interface Payment {
  id: number;
  invoice: number | Invoice;
  amount: number;
  payment_method: 'BT' | 'CC' | 'CH' | 'CA';
  payment_method_display?: string;
  payment_date: string;
  transaction_id?: string;
  notes?: string;
  created_by: number | User;
  created_by_username?: string;
  created_at: string;
}

export interface CreditNote {
  id: number;
  credit_note_number: string;
  invoice: number | Invoice;
  amount: number;
  reason: string;
  issue_date: string;
  created_by: number | User;
  created_by_username?: string;
  created_at: string;
}

export interface InvoiceStatistics {
  total_invoices: number;
  total_amount: number;
  paid_amount: number;
  pending_amount: number;
  overdue_amount: number;
  payment_rate: number;
  by_status: {
    draft: number;
    pending: number;
    paid: number;
    partially_paid: number;
    overdue: number;
    cancelled: number;
  };
}

// Common Types
export interface Address {
  id: number;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export interface PaymentMethod {
  id: number;
  type: 'credit_card' | 'bank_transfer' | 'cash';
  details: Record<string, string>;
  is_default: boolean;
}

export interface Review {
  id: number;
  productId: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface OrderItem {
  id?: number;
  product: Product | number;
  product_name?: string;
  quantity: number;
  price: number;
  unit_price?: number;
  total_price?: number;
}

export interface Route {
  id: number;
  stops: RouteStop[];
  distance: number;
  estimated_duration: number;
}

export interface RouteStop {
  address: Address;
  order: number;
  estimated_time: string;
}

export interface Supplier {
  id: number;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: Address;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ProductImage {
  id: number;
  image: string;
  is_primary: boolean;
  created_at: string;
}

export interface ProductSpecifications {
  thickness: string;
  width: string;
  length: string;
  finish: string;
  core: string;
  grade: string;
  moisture_resistance: string;
  weight: string;
}

export interface ProductReview {
  id: number;
  product: number;
  user: number;
  rating: number;
  comment: string;
  created_at: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  errors?: Record<string, string[]>;
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  discount_price?: number;
  category: number;
  stock_quantity: number;
  image_url?: string;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  discount_price?: number;
  category?: number;
  stock_quantity?: number;
  image_url?: string;
}

export interface AuthToken {
  access: string;
  refresh: string;
} 