import { Product, ProductReview, Category } from '../types/product.types';
//import { ApiError } from '../types';
import { apiService } from './api';
import axios from 'axios';

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: number;
  search?: string;
  sort_by?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
}

export interface CreateProductData {
  name: string;
  category: string;
  description: string;
  price: number;
  materials: string[];
  specifications: Record<string, string>;
  stock: number;
}

export interface UpdateProductData {
  name?: string;
  category?: string;
  description?: string;
  price?: number;
  materials?: string[];
  specifications?: Record<string, string>;
  stock?: number;
}

export interface CategoryData {
  name: string;
  description?: string;
}

export interface ReviewSubmission {
  rating: number;
  comment: string;
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
}

export class ProductService {
  async getProducts(
    page?: number | ProductFilters, 
    category?: number, 
    search?: string, 
    sort_by?: string, 
    limit?: number,
    options?: { min_price?: number; max_price?: number; in_stock?: boolean }
  ): Promise<{ products: Product[], total: number, totalPages: number }> {
    try {
      // Check if first parameter is a filter object (new API style)
      if (page && typeof page === 'object') {
        return this._getProductsWithFilters(page);
      }
      
      // Handle legacy format with multiple parameters (old API style)
      const filters: ProductFilters = {};
      if (page) filters.page = page as number;
      if (category) filters.category = category;
      if (search) filters.search = search;
      if (sort_by) filters.sort_by = sort_by;
      if (limit) filters.limit = limit;
      
      // Add additional options
      if (options) {
        if (options.min_price !== undefined) filters.min_price = options.min_price;
        if (options.max_price !== undefined) filters.max_price = options.max_price;
        if (options.in_stock !== undefined) filters.in_stock = options.in_stock;
      }
      
      return this._getProductsWithFilters(filters);
    } catch (err) {
      console.error('Error fetching products:', err);
      // Return empty array as fallback
      return { products: [], total: 0, totalPages: 0 };
    }
  }
  
  // Private method to handle actual API calls with filters
  private async _getProductsWithFilters(filters?: ProductFilters): Promise<{ products: Product[], total: number, totalPages: number }> {
    try {
      // Build query parameters from filters
      let queryParams = '';
      if (filters) {
        const params = new URLSearchParams();
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.category) params.append('category', filters.category.toString());
        if (filters.search) params.append('search', filters.search);
        if (filters.sort_by) params.append('sort_by', filters.sort_by);
        if (filters.min_price) params.append('min_price', filters.min_price.toString());
        if (filters.max_price) params.append('max_price', filters.max_price.toString());
        if (filters.in_stock !== undefined) params.append('in_stock', filters.in_stock.toString());
        queryParams = `?${params.toString()}`;
      }

      // Try multiple API paths
      const paths = [
        `/products/products/${queryParams}`,
        `products/products/${queryParams}`,
        `/api/products/${queryParams}`,
        `/api/products/products/${queryParams}`
      ];

      let error = null;
      for (const path of paths) {
        try {
          const response = await apiService.get(path);
          
          if (response) {
            // Handle various response formats
            if (Array.isArray(response)) {
              const total = response.length;
              const limit = filters?.limit || 10;
              const totalPages = Math.ceil(total / limit);
              return { products: response, total, totalPages };
            } else if (response && typeof response === 'object') {
              if ('results' in response && Array.isArray(response.results)) {
                // Use type assertion to fix TypeScript error
                const responseObj = response as any;
                const total = responseObj.count || response.results.length;
                const limit = filters?.limit || 10;
                const totalPages = Math.ceil(total / limit);
                return { 
                  products: response.results,
                  total,
                  totalPages
                };
              } else if ('products' in response && Array.isArray(response.products)) {
                // Use type assertion to fix TypeScript error
                const responseObj = response as any;
                const total = responseObj.total || response.products.length;
                const limit = filters?.limit || 10;
                const totalPages = Math.ceil(total / limit);
                return { 
                  products: response.products,
                  total,
                  totalPages
                };
              }
            }
          }
        } catch (err) {
          error = err;
          console.error(`Error fetching products from ${path}:`, err);
        }
      }

      // If we reach here, all attempts failed
      throw error || new Error('Failed to fetch products from any API path');
    } catch (err) {
      console.error('Error fetching products:', err);
      // Return empty array as fallback
      return { products: [], total: 0, totalPages: 0 };
    }
  }

  async getProduct(id: number): Promise<Product> {
    try {
      const paths = [
        `/products/products/${id}/`,
        `products/products/${id}/`,
        `/api/products/${id}/`,
        `/api/products/products/${id}/`
      ];

      for (const path of paths) {
        try {
          const response = await apiService.get(path);
          if (response) return response as Product;
        } catch (err) {
          console.error(`Error fetching product from ${path}:`, err);
        }
      }

      throw new Error('Failed to fetch product from any API path');
    } catch (err) {
      console.error(`Error fetching product ${id}:`, err);
      throw err;
    }
  }

  // Alias for getProduct for backward compatibility
  async getProductById(id: number): Promise<Product> {
    return this.getProduct(id);
  }

  async createProduct(data: CreateProductData): Promise<Product> {
    try {
      const paths = [
        '/products/products/',
        'products/products/',
        '/api/products/',
        '/api/products/products/'
      ];

      for (const path of paths) {
        try {
          const response = await apiService.post(path, data);
          if (response) return response as Product;
        } catch (err) {
          console.error(`Error creating product at ${path}:`, err);
        }
      }

      throw new Error('Failed to create product using any API path');
    } catch (err) {
      console.error('Error creating product:', err);
      throw err;
    }
  }

  async updateProduct(id: number, data: UpdateProductData): Promise<Product> {
    try {
      const paths = [
        `/products/products/${id}/`,
        `products/products/${id}/`,
        `/api/products/${id}/`,
        `/api/products/products/${id}/`
      ];

      for (const path of paths) {
        try {
          const response = await apiService.patch(path, data);
          if (response) return response as Product;
        } catch (err) {
          console.error(`Error updating product at ${path}:`, err);
        }
      }

      throw new Error('Failed to update product using any API path');
    } catch (err) {
      console.error(`Error updating product ${id}:`, err);
      throw err;
    }
  }

  async deleteProduct(id: number): Promise<void> {
    try {
      const paths = [
        `/products/products/${id}/`,
        `products/products/${id}/`,
        `/api/products/${id}/`,
        `/api/products/products/${id}/`
      ];

      for (const path of paths) {
        try {
          await apiService.delete(path);
          return;
        } catch (err) {
          console.error(`Error deleting product at ${path}:`, err);
        }
      }

      throw new Error('Failed to delete product using any API path');
    } catch (err) {
      console.error(`Error deleting product ${id}:`, err);
      throw err;
    }
  }

  async getCategories(): Promise<Category[]> {
    try {
      const paths = [
        '/products/categories/',
        'products/categories/',
        '/api/products/categories/',
        '/api/categories/'
      ];

      for (const path of paths) {
        try {
          const response = await apiService.get(path);
          
          if (response) {
            // Handle various response formats
            if (Array.isArray(response)) {
              return response;
            } else if (response && typeof response === 'object') {
              if ('results' in response && Array.isArray(response.results)) {
                return response.results;
              } else if ('categories' in response && Array.isArray(response.categories)) {
                return response.categories;
              }
            }
          }
        } catch (err) {
          console.error(`Error fetching categories from ${path}:`, err);
        }
      }

      throw new Error('Failed to fetch categories from any API path');
    } catch (err) {
      console.error('Error fetching categories:', err);
      return [];
    }
  }

  async getCategory(id: number): Promise<Category> {
    try {
      const paths = [
        `/products/categories/${id}/`,
        `products/categories/${id}/`,
        `/api/products/categories/${id}/`,
        `/api/categories/${id}/`
      ];

      for (const path of paths) {
        try {
          const response = await apiService.get(path);
          if (response) return response as Category;
        } catch (err) {
          console.error(`Error fetching category from ${path}:`, err);
        }
      }

      throw new Error('Failed to fetch category from any API path');
    } catch (err) {
      console.error(`Error fetching category ${id}:`, err);
      throw err;
    }
  }

  async createCategory(data: CategoryData): Promise<Category> {
    try {
      const paths = [
        '/products/categories/',
        'products/categories/',
        '/api/products/categories/',
        '/api/categories/'
      ];

      for (const path of paths) {
        try {
          const response = await apiService.post(path, data);
          if (response) return response as Category;
        } catch (err) {
          console.error(`Error creating category at ${path}:`, err);
        }
      }

      throw new Error('Failed to create category using any API path');
    } catch (err) {
      console.error('Error creating category:', err);
      throw err;
    }
  }

  async updateCategory(id: number, data: CategoryData): Promise<Category> {
    try {
      const paths = [
        `/products/categories/${id}/`,
        `products/categories/${id}/`,
        `/api/products/categories/${id}/`,
        `/api/categories/${id}/`
      ];

      for (const path of paths) {
        try {
          const response = await apiService.patch(path, data);
          if (response) return response as Category;
        } catch (err) {
          console.error(`Error updating category at ${path}:`, err);
        }
      }

      throw new Error('Failed to update category using any API path');
    } catch (err) {
      console.error(`Error updating category ${id}:`, err);
      throw err;
    }
  }

  async deleteCategory(id: number): Promise<void> {
    try {
      const paths = [
        `/products/categories/${id}/`,
        `products/categories/${id}/`,
        `/api/products/categories/${id}/`,
        `/api/categories/${id}/`
      ];

      for (const path of paths) {
        try {
          await apiService.delete(path);
          return;
        } catch (err) {
          console.error(`Error deleting category at ${path}:`, err);
        }
      }

      throw new Error('Failed to delete category using any API path');
    } catch (err) {
      console.error(`Error deleting category ${id}:`, err);
      throw err;
    }
  }

  async getProductReviews(productId: number): Promise<ProductReview[]> {
    try {
      const paths = [
        `/products/products/${productId}/reviews/`,
        `products/products/${productId}/reviews/`,
        `/api/products/${productId}/reviews/`,
        `/api/reviews/?product=${productId}`
      ];

      for (const path of paths) {
        try {
          const response = await apiService.get(path);
          
          if (response) {
            // Handle various response formats
            if (Array.isArray(response)) {
              return response;
            } else if (response && typeof response === 'object') {
              if ('results' in response && Array.isArray(response.results)) {
                return response.results;
              } else if ('reviews' in response && Array.isArray(response.reviews)) {
                return response.reviews;
              }
            }
          }
        } catch (err) {
          console.error(`Error fetching product reviews from ${path}:`, err);
        }
      }

      throw new Error('Failed to fetch product reviews from any API path');
    } catch (err) {
      console.error(`Error fetching reviews for product ${productId}:`, err);
      return [];
    }
  }

  async getProductsForComparison(ids: number[]): Promise<Product[]> {
    try {
      return await apiService.get<Product[]>('products/compare/', { 
        params: { ids: ids.join(',') }
      });
    } catch (error: any) {
      throw new Error('Failed to fetch products for comparison: ' + error.message);
    }
  }

  async addToCart(productId: number, quantity: number): Promise<void> {
    try {
      await apiService.post('cart/items/', { product_id: productId, quantity });
    } catch (error: any) {
      throw new Error('Failed to add product to cart: ' + error.message);
    }
  }

  async getCartItems(): Promise<CartItem[]> {
    try {
      return await apiService.get<CartItem[]>('cart/items/');
    } catch (error: any) {
      throw new Error('Failed to fetch cart items: ' + error.message);
    }
  }

  async updateCartItem(itemId: number, quantity: number): Promise<void> {
    try {
      await apiService.patch(`cart/items/${itemId}/`, { quantity });
    } catch (error: any) {
      throw new Error('Failed to update cart item: ' + error.message);
    }
  }

  async removeFromCart(itemId: number): Promise<void> {
    try {
      await apiService.delete(`cart/items/${itemId}/`);
    } catch (error: any) {
      throw new Error('Failed to remove item from cart: ' + error.message);
    }
  }

  async uploadProductImage(productId: number, image: File, imageType: string = 'product'): Promise<{ url: string }> {
    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('type', imageType);
      
      // Use axios directly for multipart form data
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/products/products/${productId}/upload-image/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            // Include auth token if needed
            ...(localStorage.getItem('token') && {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            })
          }
        }
      );
      
      return response.data;
    } catch (error: any) {
      throw new Error('Failed to upload product image: ' + error.message);
    }
  }

  async getFeaturedProducts(limit: number = 4): Promise<Product[]> {
    try {
      return await apiService.get<Product[]>('products/featured/', { params: { limit } });
    } catch (error: any) {
      throw new Error('Failed to fetch featured products: ' + error.message);
    }
  }

  async getRelatedProducts(productId: number, limit: number = 4): Promise<Product[]> {
    try {
      return await apiService.get<Product[]>(`products/products/${productId}/related/`, {
        params: { limit }
      });
    } catch (error: any) {
      throw new Error('Failed to fetch related products: ' + error.message);
    }
  }

  async submitReview(productId: number, review: ReviewSubmission): Promise<ProductReview> {
    try {
      return await apiService.post<ProductReview>(
        `products/products/${productId}/reviews/`,
        review
      );
    } catch (error: any) {
      throw new Error('Failed to submit product review: ' + error.message);
    }
  }
}

// Create and export a singleton instance
export const productService = new ProductService();
export default productService; 