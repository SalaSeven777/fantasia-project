import { Product as ProductIndex } from '../types';
import { Product as ProductTypes } from '../types/product.types';

/**
 * Convert a Product from product.types.ts to the format expected in index.ts
 * This is useful when we need to work with components that expect the index.ts Product format
 */
export function adaptProductFromTypesToIndex(product: ProductTypes): ProductIndex {
  return {
    id: product.id,
    title: product.name,
    description: product.description,
    price: product.price,
    thumbnail: product.image || '',
    image_url: product.image || '',
    category: product.category,
    created_at: product.created_at,
    updated_at: product.updated_at,
    images: product.image ? [product.image] : [],
    discountPercentage: product.discount,
    finalPrice: product.sale_price || product.price,
    rating: product.rating,
    stock: product.stock_quantity || 0,
    brand: 'Generic',
  };
}

/**
 * Convert a Product from index.ts to the format expected in product.types.ts
 * This is useful when we need to work with the API service that expects the product.types.ts format
 */
export function adaptProductFromIndexToTypes(product: ProductIndex): ProductTypes {
  return {
    id: product.id,
    name: product.title,
    description: product.description,
    price: product.price,
    image: product.thumbnail || null,
    category: typeof product.category === 'number' ? product.category : 1,
    created_at: product.created_at,
    updated_at: product.updated_at,
    // Backend required fields
    panel_type: 'LP',
    technical_specs: {},
    stock_quantity: product.stock || 0,
    min_stock_threshold: 10,
    is_active: true,
    // Frontend computed properties
    inStock: product.stock !== undefined ? product.stock > 0 : true,
    discount: product.discountPercentage,
    rating: product.rating,
  };
}

/**
 * Batch convert an array of products from one type to another
 */
export function adaptProductsFromTypesToIndex(products: ProductTypes[]): ProductIndex[] {
  return products.map(adaptProductFromTypesToIndex);
}

export function adaptProductsFromIndexToTypes(products: ProductIndex[]): ProductTypes[] {
  return products.map(adaptProductFromIndexToTypes);
} 