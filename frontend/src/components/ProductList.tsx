import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaSearch, FaSort, FaFilter } from 'react-icons/fa';
import { apiService } from '../services/api'; 
import productService from '../services/product.service';
import { Product, Category } from '../types/product.types';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

// Helper function to safely get category name
const getCategoryName = (product: Product): string => {
  return product.category_name || String(product.category);
};

// Calculate average rating from reviews
const getAverageRating = (product: Product): number => {
  if (!product.reviews || !Array.isArray(product.reviews) || product.reviews.length === 0) return 0;
  const sum = product.reviews.reduce((total, review) => total + review.rating, 0);
  return sum / product.reviews.length;
};

// Process products to add computed frontend properties
const processProducts = (products: any[]): Product[] => {
  return products.map(product => {
    // Basic product properties that are always required
    const processedProduct: Product = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      category: product.category,
      panel_type: product.panel_type,
      technical_specs: product.technical_specs || {},
      stock_quantity: product.stock_quantity || 0,
      min_stock_threshold: product.min_stock_threshold || 0,
      is_active: product.is_active !== false,
      created_at: product.created_at || new Date().toISOString(),
      updated_at: product.updated_at || new Date().toISOString(),
      
      // Add computed properties
      inStock: product.stock_quantity > 0,
      
      // Optional properties
      category_name: product.category_name,
      panel_type_display: product.panel_type_display,
      sale_price: product.sale_price,
      additional_images: product.additional_images
    };
    
    // Calculate rating if reviews exist
    let rating = 0;
    let reviewCount = 0;
    
    if (product.reviews && Array.isArray(product.reviews) && product.reviews.length > 0) {
      const sum = product.reviews.reduce((total: number, review: any) => total + (review.rating || 0), 0);
      rating = sum / product.reviews.length;
      reviewCount = product.reviews.length;
      processedProduct.reviews = product.reviews;
    }
    
    processedProduct.rating = rating;
    processedProduct.reviewCount = reviewCount;
    
    // Calculate finalPrice and discount
    if (product.sale_price && product.sale_price < product.price) {
      processedProduct.finalPrice = product.sale_price;
      processedProduct.discount = Math.round(((product.price - product.sale_price) / product.price) * 100);
    } else {
      processedProduct.finalPrice = product.price;
      processedProduct.discount = 0;
    }
    
    return processedProduct;
  });
};

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('name');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [lastLoaded, setLastLoaded] = useState<number>(0);

  const processProductsMemoized = useCallback((rawProducts: any[]): Product[] => {
    return processProducts(rawProducts);
  }, []);

  useEffect(() => {
    const fetchProductsAndCategories = async () => {
      const now = Date.now();
      if (products.length > 0 && now - lastLoaded < 60000) {
        console.log('Using cached product data');
        return;
      }
      
      setLoading(true);
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          productService.getProducts(),
          productService.getCategories()
        ]);
        
        const processedProducts = processProductsMemoized(productsResponse.products);
        
        setProducts(processedProducts);
        setCategories(categoriesResponse);
        setLastLoaded(now);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductsAndCategories();
  }, [processProductsMemoized, lastLoaded, products.length]);

  useEffect(() => {
    const filterAndSortProducts = () => {
      let result = [...products];

      if (categoryFilter !== 'all') {
        result = result.filter(product => product.category === Number(categoryFilter));
      }

      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        result = result.filter(
          product => 
            product.name.toLowerCase().includes(searchLower) ||
            product.description.toLowerCase().includes(searchLower)
        );
      }

      result.sort((a, b) => {
        switch (sortOption) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'price-low':
            return ((a.finalPrice || a.price) - 
                  (b.finalPrice || b.price));
          case 'price-high':
            return ((b.finalPrice || b.price) - 
                  (a.finalPrice || a.price));
          case 'rating':
            return (b.rating || 0) - (a.rating || 0);
          default:
            return 0;
        }
      });

      setFilteredProducts(result);
    };
    
    filterAndSortProducts();
  }, [products, searchTerm, sortOption, categoryFilter]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="container my-4">
      <h1 className="mb-4">Wood Crafted Collection</h1>
      
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="input-group">
            <span className="input-group-text">
              <FaSearch />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="col-md-4 mb-3">
          <div className="input-group">
            <span className="input-group-text">
              <FaFilter />
            </span>
            <select 
              className="form-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="col-md-4 mb-3">
          <div className="input-group">
            <span className="input-group-text">
              <FaSort />
            </span>
            <select 
              className="form-select"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="name">Name (A-Z)</option>
              <option value="price-low">Price (Low to High)</option>
              <option value="price-high">Price (High to Low)</option>
              <option value="rating">Rating (Highest)</option>
            </select>
          </div>
        </div>
      </div>
      
      {filteredProducts.length === 0 ? (
        <div className="alert alert-info">
          No products found matching your criteria.
        </div>
      ) : (
        <div className="row">
          {filteredProducts.map((product) => (
            <div key={product.id} className="col-lg-3 col-md-4 col-sm-6 mb-4">
              <Link 
                to={`/products/${product.id}`} 
                className="text-decoration-none text-dark"
              >
                <div className="card product-card h-100">
                  <div className="position-relative">
                    <img 
                      src={product.image || '/placeholder-image.jpg'} 
                      alt={product.name} 
                      className="card-img-top product-thumbnail"
                    />
                    {product.finalPrice && product.finalPrice < product.price && (
                      <span className="position-absolute top-0 end-0 bg-danger text-white p-1 m-2 rounded">
                        Sale
                      </span>
                    )}
                  </div>
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title product-card-title">{product.name}</h5>
                    <p className="card-text text-truncate small text-muted">{product.description}</p>
                    
                    <div className="mt-auto">
                      <div className="d-flex align-items-center mb-2">
                        <div className="me-1">
                          <FaStar className="text-warning" />
                        </div>
                        <span>{(product.rating || 0).toFixed(1)}</span>
                      </div>
                      
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="badge bg-info">
                          {getCategoryName(product)}
                        </span>
                        
                        <div>
                          {product.finalPrice && product.finalPrice < product.price ? (
                            <div>
                              <span className="text-muted text-decoration-line-through small">
                                ${product.price.toFixed(2)}
                              </span>
                              <span className="ms-1 fw-bold text-danger">
                                ${(product.finalPrice).toFixed(2)}
                              </span>
                            </div>
                          ) : (
                            <span className="fw-bold">
                              ${product.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList; 