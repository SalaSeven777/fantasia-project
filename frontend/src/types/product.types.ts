export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  sale_price?: number;
  image: string | null;
  category: number | Category;
  category_name?: string;
  panel_type: string;
  panel_type_display?: string;
  technical_specs: Record<string, any>;
  stock_quantity: number;
  min_stock_threshold: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  additional_images?: ProductImage[];
  media_images?: ProductImage[];
  reviews?: ProductReview[];
  
  // Frontend computed properties
  inStock?: boolean;
  rating?: number;
  reviewCount?: number;
  finalPrice?: number;
  discount?: number;
  
  // Image processing
  _processedImagePath?: string;
}

export interface ProductImage {
  id: number;
  image: string;
  is_primary: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductReview {
  id: number;
  product: number;
  user: number;
  user_username: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at?: string;
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  price: number;
} 