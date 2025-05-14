import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types/product.types';
import { productService } from '../../services/product.service';
import { useAppSelector } from '../../store/hooks';
import ProductCard from '../../components/ProductCard';
import {
  ShoppingCartIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

const Products: React.FC = () => {
  // State for products and loading
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [inStock, setInStock] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  
  // UI states
  const [showCompareBar, setShowCompareBar] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 8;
  
  // Get categories from backend
  const [categories, setCategories] = useState<{id: string, name: string, subcategories?: {id: string, name: string}[]}[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  // Get max price for range slider
  const [maxAvailablePrice, setMaxAvailablePrice] = useState(1000);
  
  // UI states for filter panel
  const [showFilters, setShowFilters] = useState(false);
  // Track which filter group is expanded (for accordion behavior)
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null);
  
  // Mock subcategories (in a real app, these would come from the API)
  const subcategories = useMemo(() => {
    return {
      '1': [
        { id: '101', name: 'Kitchen Cabinets' },
        { id: '102', name: 'Kitchen Islands' },
        { id: '103', name: 'Countertops' },
      ],
      '2': [
        { id: '201', name: 'Vanity Cabinets' },
        { id: '202', name: 'Shower Units' },
        { id: '203', name: 'Bathroom Storage' },
      ],
      '3': [
        { id: '301', name: 'Office Desks' },
        { id: '302', name: 'Bookcases' },
        { id: '303', name: 'Filing Cabinets' },
      ],
      '4': [
        { id: '401', name: 'Coffee Tables' },
        { id: '402', name: 'TV Stands' },
        { id: '403', name: 'Sofas' },
      ],
      '5': [
        { id: '501', name: 'Bed Frames' },
        { id: '502', name: 'Wardrobes' },
        { id: '503', name: 'Nightstands' },
      ],
    } as Record<string, { id: string; name: string }[]>;
  }, []);

  // Format price to 2 decimal places
  const formatPrice = (price: number | string): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  };

  // Get image URL with fallback
  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath) return '/placeholder-product.jpg';
    
    // Directly use images in /public/media folder to avoid CORS issues
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // If the path starts with /media, use it directly from public folder
    if (imagePath.startsWith('/media')) {
      return imagePath;
    }
    
    // For paths coming from backend that might not have /media prefix
    if (imagePath.includes('products/')) {
      return `/media/${imagePath}`;
    }
    
    // Default case: use the path as is, assuming it's in public
    return imagePath;
  };
  
  // Process product to ensure image paths are correct - memoize to prevent recreation on every render
  const processProduct = useCallback((product: Product): Product => {
    return {
      ...product,
      _processedImagePath: getImageUrl(product.image)
    };
  }, []);

  // Fetch products and categories on component mount
  useEffect(() => {
    const fetchProductsAndCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching categories and products...");
        
        // Fetch categories
        try {
          const categoriesResponse = await productService.getCategories();
          console.log('Categories loaded:', categoriesResponse);
          
          // Add subcategories to categories if available
          const enhancedCategories = categoriesResponse.map(cat => ({
            id: cat.id.toString(),
            name: cat.name,
            subcategories: subcategories[cat.id.toString()]
          }));
          
          setCategories(enhancedCategories);
        } catch (categoryError) {
          console.error('Error fetching categories:', categoryError);
          // We'll continue even if categories fail to load
        } finally {
          setLoadingCategories(false);
        }
        
        // Fetch products with default parameters
        console.log('Fetching products...');
        const result = await productService.getProducts(1, undefined, undefined, undefined, pageSize);
        console.log('Products loaded:', result.products);
        
        // Preload images to prevent black images
        if (result.products && result.products.length > 0) {
          // Create a copy of products with properly processed image paths
          const processedProducts = result.products.map(product => processProduct(product));
          
          setProducts(processedProducts);
        } else {
          setProducts([]);
        }
        
        setTotalPages(result.totalPages || 1);
        
        // Find max price for range slider
        if (result.products && result.products.length > 0) {
          const maxPrice = Math.max(...result.products.map(p => p.price));
          const roundedMaxPrice = Math.ceil(maxPrice / 100) * 100; // Round up to nearest 100
          setMaxAvailablePrice(roundedMaxPrice);
          setPriceRange({ min: 0, max: roundedMaxPrice });
        } else {
          console.log('No products returned from API, using default max price');
          setMaxAvailablePrice(1000);
          setPriceRange({ min: 0, max: 1000 });
        }
        
        setLoading(false);
      } catch (err: any) {
        console.error('Error in fetchProductsAndCategories:', err);
        setError('Failed to load products. Please try again later.');
        setLoading(false);
      }
    };

    fetchProductsAndCategories();
    // Remove processProduct from dependencies, now it's memoized and stable
  }, [pageSize, subcategories]);
  
  // Fetch products when filters change - with proper debouncing
  useEffect(() => {
    // Don't fetch if this is the initial mount
    if (loading && products.length === 0) return;
    
    const fetchFilteredProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Convert selectedCategory to number if it exists
        const categoryId = selectedCategory ? parseInt(selectedCategory) : undefined;
        
        // Build filter options
        const options: { min_price?: number, max_price?: number, in_stock?: boolean } = {};
        
        // Add price range if it's been adjusted
        if (priceRange.min > 0 || priceRange.max < maxAvailablePrice) {
          options.min_price = priceRange.min;
          options.max_price = priceRange.max;
        }
        
        // Add in_stock filter if selected
        if (inStock) {
          options.in_stock = true;
        }
        
        console.log('Fetching filtered products with:', {
          currentPage, categoryId, searchQuery, sortBy, pageSize, options
        });
        
        const result = await productService.getProducts(
          currentPage,
          categoryId,
          searchQuery || undefined,
          sortBy || undefined,
          pageSize,
          options
        );
        
        // Process products to ensure images display correctly
        const processedProducts = result.products?.map(product => processProduct(product)) || [];
        
        setProducts(processedProducts);
        setTotalPages(result.totalPages || 1);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching filtered products:', err);
        setError('Failed to apply filters. Please try again.');
        setProducts([]); // Empty products rather than keeping stale data
        setLoading(false);
      }
    };
    
    // Using a longer debounce to prevent too many API calls
    const handler = setTimeout(() => {
      fetchFilteredProducts();
    }, 800);
    
    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, selectedCategory, selectedSubcategory, priceRange, inStock, sortBy, currentPage, maxAvailablePrice, processProduct]);

  // Toggle product comparison
  const toggleProductComparison = (productId: number) => {
    setSelectedProducts((prev) => {
      const newSelection = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : prev.length < 3
          ? [...prev, productId]
          : prev;
          
      // Show compare bar if we have selected products
      setShowCompareBar(newSelection.length > 0);
      return newSelection;
    });
  };
  
  // Add to cart handler
  const handleAddToCart = async (productId: number) => {
    try {
      // Find the product object from our products list
      const product = products.find(p => p.id === productId);
      
      if (!product) {
        console.error('Product not found:', productId);
        return;
      }
      
      // Use the cartService to add the product to cart
      const { cartService } = await import('../../services/cart.service');
      
      // Create a compatible product object for cartService
      const cartProduct = {
        ...product,
        // Add any missing properties required by cartService
        title: product.name,
        thumbnail: product.image || '',
      };
      
      cartService.addToCart(cartProduct as any, 1);
      
      // Optional: show a success message
      console.log('Product added to cart:', product.name);
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0); // Scroll to top when changing page
  };

  // Toggle filter expansion
  const toggleFilter = (filter: string) => {
    setExpandedFilter(expandedFilter === filter ? null : filter);
  };

  return (
    <div className="bg-white">
      {/* Breadcrumbs */}
      <div className="bg-neutral-50 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto py-2 px-4 sm:px-6 lg:px-8">
          <nav className="flex text-sm">
            <Link to="/" className="text-primary-600 hover:text-primary-800">
              Home
            </Link>
            <span className="mx-2 text-neutral-500">/</span>
            <span className="text-neutral-500">Products</span>
            {selectedCategory && categories.find(c => c.id === selectedCategory) && (
              <>
                <span className="mx-2 text-neutral-500">/</span>
                <span className="text-neutral-500">
                  {categories.find(c => c.id === selectedCategory)?.name}
                </span>
              </>
            )}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="border-b border-neutral-200 pb-6 mb-6">
          <h1 className="text-2xl sm:text-3xl font-primary font-bold text-gray-900 mb-2">
            Wood Products Collection
          </h1>
          <p className="text-neutral-600 text-sm sm:text-base">
            Browse our extensive collection of premium wood products. Each item is crafted with precision and 
            attention to detail using the finest materials.
          </p>
          
          {/* Mobile Filter and Sort Controls */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <span className="mr-2">Filters</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="name">Sort by Name</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
              
              <div className="flex rounded-md overflow-hidden border border-gray-300">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 sm:p-2 ${viewMode === 'grid' ? 'bg-primary-100 text-primary-800' : 'bg-white text-gray-500'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 sm:p-2 ${viewMode === 'list' ? 'bg-primary-100 text-primary-800' : 'bg-white text-gray-500'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        )}
        
        <div className="pt-6 pb-8">
          {/* Filter Bar - Mobile (Overlay) */}
          <div 
            className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${
              showFilters ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowFilters(false)}></div>
            <div className="absolute right-0 top-0 bottom-0 w-full max-w-xs bg-white overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                <button onClick={() => setShowFilters(false)} className="text-gray-500 hover:text-gray-700">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              {/* Mobile Filter Content */}
              <div className="space-y-6">
                {/* Search */}
          <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Search</h4>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                    <svg 
                      className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                {/* Categories */}
              <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Categories</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        id="category-all-mobile"
                        type="radio"
                        checked={selectedCategory === ''}
                        onChange={() => {
                          setSelectedCategory('');
                          setSelectedSubcategory('');
                        }}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <label htmlFor="category-all-mobile" className="ml-3 text-sm text-gray-600">
                        All Categories
                      </label>
              </div>
                    
                    {categories.map((category) => (
                      <div key={category.id} className="space-y-2">
                        <div className="flex items-center">
                          <input
                            id={`category-${category.id}-mobile`}
                            type="radio"
                            checked={selectedCategory === category.id}
                            onChange={() => {
                              setSelectedCategory(category.id);
                              setSelectedSubcategory('');
                            }}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                          />
                          <label htmlFor={`category-${category.id}-mobile`} className="ml-3 text-sm text-gray-600">
                            {category.name}
                          </label>
            </div>

                        {/* Subcategories */}
                        {selectedCategory === category.id && category.subcategories && (
                          <div className="pl-6 space-y-2">
                            {category.subcategories.map((subcategory) => (
                              <div key={subcategory.id} className="flex items-center">
                                <input
                                  id={`subcategory-${subcategory.id}-mobile`}
                                  type="radio"
                                  checked={selectedSubcategory === subcategory.id}
                                  onChange={() => setSelectedSubcategory(subcategory.id)}
                                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                />
                                <label htmlFor={`subcategory-${subcategory.id}-mobile`} className="ml-3 text-sm text-gray-600">
                                  {subcategory.name}
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Price Range */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Price Range</h4>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div>
                        <label htmlFor="min-price-mobile" className="sr-only">Minimum Price</label>
                        <input
                          type="number"
                          id="min-price-mobile"
                          value={priceRange.min}
                          onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) || 0 })}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                          placeholder="Min"
                        />
                      </div>
                      <span className="text-gray-500">-</span>
                      <div>
                        <label htmlFor="max-price-mobile" className="sr-only">Maximum Price</label>
                        <input
                          type="number"
                          id="max-price-mobile"
                          value={priceRange.max}
                          onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) || 0 })}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                          placeholder="Max"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Availability */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Availability</h4>
                  <div className="flex items-center">
                    <input
                      id="in-stock-mobile"
                      type="checkbox"
                      checked={inStock}
                      onChange={(e) => setInStock(e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="in-stock-mobile" className="ml-3 text-sm text-gray-600">
                      In Stock Only
                    </label>
                  </div>
                </div>
                
                {/* Apply/Reset Buttons */}
                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      // Reset all filters
                      setSelectedCategory('');
                      setSelectedSubcategory('');
                      setPriceRange({ min: 0, max: maxAvailablePrice });
                      setSearchQuery('');
                      setInStock(false);
                      setSortBy('name');
                      setCurrentPage(1);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex-1"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="px-4 py-2 bg-primary-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-primary-700 flex-1"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        
          {/* Horizontal Filter Bar - Desktop */}
          <div className="mb-8">
            <div className="bg-white p-4 border border-gray-200 rounded-lg">
              {/* Filter Section */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Search */}
                <div className="w-full md:w-auto relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full md:w-60 p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                  <svg 
                    className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                
                {/* Categories Dropdown */}
                <div className="w-full md:w-auto">
                  <div className="relative">
                    <button
                      onClick={() => toggleFilter('category')}
                      className="flex items-center justify-between w-full md:w-48 p-2 border border-gray-300 rounded-md bg-white text-left text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      <span className="block truncate">
                        {selectedCategory 
                          ? categories.find(c => c.id === selectedCategory)?.name 
                          : 'All Categories'}
                      </span>
                      <span className="pointer-events-none">
                        {expandedFilter === 'category' ? (
                          <ChevronUpIcon className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                        )}
                      </span>
                    </button>
                    
                    {expandedFilter === 'category' && (
                      <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 py-1 max-h-60 overflow-auto">
                        <div 
                          className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                          onClick={() => {
                            setSelectedCategory('');
                            setSelectedSubcategory('');
                            setExpandedFilter(null);
                          }}
                        >
                          All Categories
                        </div>
                        {categories.map(category => (
                          <div key={category.id}>
                            <div 
                              className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                              onClick={() => {
                                setSelectedCategory(category.id);
                                setSelectedSubcategory('');
                                setExpandedFilter(null);
                              }}
                            >
                              {category.name}
                            </div>
                            
                            {category.subcategories && selectedCategory === category.id && (
                              <div className="pl-6">
                                {category.subcategories.map(subcategory => (
                                  <div 
                                    key={subcategory.id}
                                    className="px-3 py-1 cursor-pointer hover:bg-gray-100 text-sm"
                                    onClick={() => {
                                      setSelectedSubcategory(subcategory.id);
                                      setExpandedFilter(null);
                                    }}
                                  >
                                    {subcategory.name}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Price Range */}
                <div className="w-full md:w-auto">
                  <div className="relative">
                    <button
                      onClick={() => toggleFilter('price')}
                      className="flex items-center justify-between w-full md:w-48 p-2 border border-gray-300 rounded-md bg-white text-left text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      <span className="block truncate">
                        {priceRange.min > 0 || priceRange.max < maxAvailablePrice 
                          ? `$${priceRange.min} - $${priceRange.max}` 
                          : 'Price Range'}
                      </span>
                      <span className="pointer-events-none">
                        {expandedFilter === 'price' ? (
                          <ChevronUpIcon className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                        )}
                      </span>
                    </button>
                    
                    {expandedFilter === 'price' && (
                      <div className="absolute z-10 mt-1 w-full md:w-60 bg-white shadow-lg rounded-md border border-gray-200 p-4">
                        <div className="flex items-center space-x-4">
                          <div>
                            <label htmlFor="min-price" className="block text-sm font-medium text-gray-700 mb-1">Min</label>
                            <input
                              type="number"
                              id="min-price"
                              value={priceRange.min}
                              onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) || 0 })}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                              placeholder="Min"
                            />
                          </div>
                          <span className="text-gray-500 mt-6">-</span>
                          <div>
                            <label htmlFor="max-price" className="block text-sm font-medium text-gray-700 mb-1">Max</label>
                            <input
                              type="number"
                              id="max-price"
                              value={priceRange.max}
                              onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) || 0 })}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                              placeholder="Max"
                            />
                          </div>
                        </div>
                        <div className="mt-4">
                          <button
                            onClick={() => setExpandedFilter(null)}
                            className="w-full p-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Availability */}
                <div className="w-full md:w-auto flex items-center">
                  <input
                    id="in-stock"
                    type="checkbox"
                    checked={inStock}
                    onChange={(e) => setInStock(e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="in-stock" className="ml-2 text-sm text-gray-600">
                    In Stock Only
                  </label>
                </div>
                
                {/* Sort By */}
                <div className="w-full md:w-auto ml-auto">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full md:w-48 p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 text-sm"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="newest">Newest First</option>
                  </select>
                </div>
              </div>
              
              {/* Active Filters */}
              <div className={`mt-4 flex items-center flex-wrap gap-2 ${searchQuery || selectedCategory || (priceRange.min > 0 || priceRange.max < maxAvailablePrice) || inStock ? 'block' : 'hidden'}`}>
                <span className="text-sm text-gray-700">Active filters:</span>
                
                {searchQuery && (
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100">
                    {`Search: "${searchQuery}"`}
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </div>
                )}
                
                {selectedCategory && (
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100">
                    {`Category: ${categories.find(c => c.id === selectedCategory)?.name}`}
                    <button 
                      onClick={() => {
                        setSelectedCategory('');
                        setSelectedSubcategory('');
                      }}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </div>
                )}
                
                {selectedSubcategory && (
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100">
                    {`Subcategory: ${categories.find(c => c.id === selectedCategory)?.subcategories?.find(s => s.id === selectedSubcategory)?.name}`}
                    <button 
                      onClick={() => setSelectedSubcategory('')}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </div>
                )}
                
                {(priceRange.min > 0 || priceRange.max < maxAvailablePrice) && (
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100">
                    {`Price: $${priceRange.min} - $${priceRange.max}`}
                    <button 
                      onClick={() => setPriceRange({ min: 0, max: maxAvailablePrice })}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </div>
                )}
                
                {inStock && (
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100">
                    In Stock Only
                    <button 
                      onClick={() => setInStock(false)}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </div>
                )}
                
                <button
                  onClick={() => {
                    // Reset all filters
                    setSelectedCategory('');
                    setSelectedSubcategory('');
                    setPriceRange({ min: 0, max: maxAvailablePrice });
                    setSearchQuery('');
                    setInStock(false);
                    setSortBy('name');
                    setCurrentPage(1);
                  }}
                  className="text-xs text-primary-600 hover:text-primary-800 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          </div>
            
          {/* Product Grid */}
          <div>
            {/* Loading State */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                <h3 className="text-xl font-semibold text-gray-800 mb-1">No Products Found</h3>
                <p className="text-gray-600 mb-4">We couldn't find any products matching your criteria.</p>
                <button 
                  onClick={() => {
                    // Reset all filters
                    setSelectedCategory('');
                    setSelectedSubcategory('');
                    setPriceRange({ min: 0, max: maxAvailablePrice });
                    setSearchQuery('');
                    setInStock(false);
                    setSortBy('');
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              // Product Grid
              <div className={
                viewMode === 'grid' 
                ? "grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
                : "space-y-8"
              }>
                {products.map((product) => (
                  viewMode === 'grid' ? (
                    <ProductCard
                      key={product.id}
                      product={{
                        ...product,
                        // Force image to use properly processed URL
                        image: product._processedImagePath || getImageUrl(product.image)
                      }}
                      onAddToCart={handleAddToCart}
                      onToggleCompare={toggleProductComparison}
                      isSelected={selectedProducts.includes(product.id)}
                      compact={false}
                    />
                  ) : (
                    <div key={product.id} className="flex flex-col sm:flex-row bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow duration-200">
                      <div className="sm:w-1/3 relative">
                        <Link to={`/products/${product.id}`}>
                          <img
                            src={getImageUrl(product.image)}
                            alt={product.name}
                            className="w-full h-64 sm:h-full object-cover object-center"
                            onError={(e) => {
                              console.log(`Image failed to load for product ${product.id}`, product.image);
                              (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                            }}
                          />
                        </Link>
                        <button
                          onClick={() => toggleProductComparison(product.id)}
                          className={`absolute top-4 right-4 p-2 rounded-full ${
                            selectedProducts.includes(product.id)
                              ? 'bg-primary-600 text-white'
                              : 'bg-white text-gray-600 border border-gray-200 hover:bg-primary-50 hover:text-primary-600'
                          }`}
                          title="Compare"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                      
                      <div className="sm:w-2/3 p-4 flex flex-col">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          <Link to={`/products/${product.id}`}>
                            {product.name}
                          </Link>
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 flex-grow">
                          {product.description.substring(0, 150)}
                          {product.description.length > 150 ? '...' : ''}
                        </p>
                        
                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-lg font-semibold text-gray-900">
                            ${formatPrice(product.price)}
                          </span>
                          <button
                            onClick={() => handleAddToCart(product.id)}
                            className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md flex items-center"
                          >
                            <ShoppingCartIcon className="h-5 w-5 mr-1" />
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}
            
            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex justify-center pt-6 mt-8">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${
                      currentPage === 1
                        ? 'border-gray-300 bg-white text-gray-300 cursor-not-allowed'
                        : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* Page Numbers */}
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    // Show limited page numbers to prevent overwhelming UI
                    // Always show first, last, current and pages close to current
                    if (
                      pageNumber === 1 || 
                      pageNumber === totalPages || 
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2 border ${
                            currentPage === pageNumber
                              ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    }
                    
                    // Show ellipsis for skipped pages
                    if (
                      (pageNumber === 2 && currentPage > 3) || 
                      (pageNumber === totalPages - 1 && currentPage < totalPages - 2)
                    ) {
                      return (
                        <span
                          key={pageNumber}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-700"
                        >
                          ...
                        </span>
                      );
                    }
                    
                    return null;
                  })}
                  
                  {/* Next Page Button */}
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${
                      currentPage === totalPages
                        ? 'border-gray-300 bg-white text-gray-300 cursor-not-allowed'
                        : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>

        {/* Compare Products Bar */}
        {showCompareBar && (
          <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 shadow-lg z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-gray-700 font-medium mr-4">
                    Compare Products ({selectedProducts.length}/3)
                  </span>
                  <div className="flex space-x-4">
                    {selectedProducts.map(id => {
                      const product = products.find(p => p.id === id);
                      return product ? (
                        <div key={id} className="relative flex items-center">
                          <img
                            src={product._processedImagePath || getImageUrl(product.image)}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                            onError={(e) => {
                              console.log(`Compare bar image failed to load for product ${id}`, product.image);
                              (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                            }}
                          />
                          <button
                            onClick={() => toggleProductComparison(id)}
                            className="absolute -top-2 -right-2 bg-gray-200 rounded-full p-1 text-gray-500 hover:text-gray-700"
                          >
                            <XMarkIcon className="h-3 w-3" />
                          </button>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedProducts([])}
                    className="px-3 py-1.5 border border-gray-300 rounded text-gray-600 text-sm hover:bg-gray-50"
                  >
                    Clear All
                  </button>
                  <Link
                    to={`/compare?ids=${selectedProducts.join(',')}`}
                    className={`px-3 py-1.5 rounded text-sm font-medium ${
                      selectedProducts.length < 2
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                    onClick={(e) => {
                      if (selectedProducts.length < 2) {
                        e.preventDefault();
                      }
                    }}
                  >
                    Compare Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products; 