import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../services/product.service';
import { apiService } from '../../services/api';
import { Product, Category } from '../../types/product.types';
import ProductCard from '../../components/ProductCard';
import '../../styles/wood-client-theme.css'; // Import the wood client theme
import { 
  ArrowLeftIcon, 
  ArrowRightIcon, 
  ShoppingCartIcon,
  TagIcon,
  TruckIcon,
  CurrencyDollarIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

// API base URL for assets
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Enhanced category with real count
interface EnhancedCategory extends Category {
  calculatedProductCount: number;
}

// Extended product interface with discount properties
interface ProductWithDiscount extends Product {
  original_price?: number;
  discount_percentage?: number;
}

// Helper function to get complete image URL
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

// Helper function to format price
const formatPrice = (price: any): string => {
  // Convert to number if it's a string or other type
  const numPrice = typeof price === 'string' ? parseFloat(price) : Number(price);
  
  // Check if it's a valid number
  return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
};

// Create a discount simulator for products
const simulateDiscount = (product: Product): ProductWithDiscount => {
  // If product doesn't have price, return original product
  if (!product.price) return product as ProductWithDiscount;
  
  // Calculate a simulated original price (25% higher)
  const originalPrice = product.price * 1.25;
  const discountPercentage = 20; // 20% discount
  
  return {
    ...product,
    original_price: originalPrice,
    discount_percentage: discountPercentage
  };
};

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [categories, setCategories] = useState<EnhancedCategory[]>([]);
  const [dealOfTheDay, setDealOfTheDay] = useState<ProductWithDiscount | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Real slider images using background images from the media folder
  const sliderImages = [
    {
      id: 1,
      image: "/media/Background/HD-wallpaper-light-wooden-texture-wooden-light-brown-background-wood-texture-wooden-board-texture.jpg",
      title: 'Premium Wood Collection',
      subtitle: 'Discover our high-quality wood products',
      description: 'Find your perfect match for your next project',
      link: '/products'
    },
    {
      id: 2,
      image: "/media/Background/HD-wallpaper-wood-logs-textures-macro-brown-wooden-texture-wooden-circles-brown-wooden-backgrounds-wooden-textures-wooden-logs-brown-backgrounds.jpg",
      title: 'Custom Solutions',
      subtitle: 'Tailored for your specific needs',
      description: 'Professional wood panels with premium quality',
      link: '/products'
    },
    {
      id: 3,
      image: "/media/Background/HD-wallpaper-light-brown-wooden-texture-macro-wooden-structure-wooden-backgrounds-wooden-textures-brown-backgrounds-brown-wood.jpg",
      title: 'Sustainable Materials',
      subtitle: 'Environmentally responsible choices',
      description: 'Ethically sourced wood products for eco-conscious customers',
      link: '/products'
    },
    {
      id: 4,
      image: "/media/Background/HD-wallpaper-abstract-texture-wood.jpg",
      title: 'Innovative Designs',
      subtitle: 'Modern solutions for modern needs',
      description: 'Cutting-edge wood products with contemporary aesthetics',
      link: '/products'
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // First fetch categories as they're needed for other displays
        try {
          console.log('Fetching categories...');
          const categoriesData = await productService.getCategories();
          console.log('Categories data:', categoriesData);
          
          // Fetch product counts for each category if not included
          const enhancedCategories = await Promise.all(
            categoriesData.map(async (category) => {
              try {
                // Try to get count from API response first (might be named differently)
                // Use type assertion to access possibly existing properties
                const categoryAny = category as any;
                let count = categoryAny.products_count || categoryAny.product_count;
                
                // If count is not available or is 0, fetch products for this category to count them
                if (!count) {
                  const productsResponse = await productService.getProducts({
                    category: category.id,
                    limit: 100 // Higher limit to get more accurate count
                  });
                  count = productsResponse.total || productsResponse.products.length;
                }
                
                return {
                  ...category,
                  calculatedProductCount: count || 0
                };
              } catch (err) {
                console.error(`Error getting product count for category ${category.id}:`, err);
                // Use type assertion for possible properties
                const categoryAny = category as any;
                return {
                  ...category,
                  calculatedProductCount: categoryAny.products_count || categoryAny.product_count || 0
                };
              }
            })
          );
          
          setCategories(enhancedCategories);
        } catch (err) {
          console.error('Error fetching categories:', err);
          // Not critical, continue with other data
        }
        
        // Fetch featured products
        try {
          console.log('Fetching featured products...');
        const featured = await productService.getFeaturedProducts(8);
          console.log('Featured products:', featured);
        setFeaturedProducts(featured);
          
          // Use the first featured product as deal of the day if nothing else is available
          if (featured.length > 0 && !dealOfTheDay) {
            // Find a product with the largest price difference for the deal of the day
            const productsWithPrice = featured.filter(p => p.price);
            if (productsWithPrice.length > 0) {
              // Use the first product as the deal of the day with simulated discount
              const dealProduct = simulateDiscount(productsWithPrice[0]);
              setDealOfTheDay(dealProduct);
            }
          }
        } catch (err) {
          console.error('Error fetching featured products:', err);
        }
        
        // Fetch newest products
        try {
          console.log('Fetching new arrivals...');
        const newest = await productService.getProducts(1, undefined, undefined, 'newest', 4);
          console.log('New arrivals:', newest);
          if (newest && newest.products) {
            setNewArrivals(newest.products);
          }
        } catch (err) {
          console.error('Error fetching new arrivals:', err);
        }
        
        // Fetch best sellers
        try {
          console.log('Fetching best sellers...');
          const bestSelling = await productService.getProducts(
            { page: 1, limit: 4, sort_by: 'bestselling' }
          );
          console.log('Best sellers:', bestSelling);
          if (bestSelling && bestSelling.products) {
            setBestSellers(bestSelling.products);
          }
        } catch (err) {
          console.error('Error fetching best sellers:', err);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load products');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto-advance slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [sliderImages.length]);

  // Slider navigation
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);
  };

  // Handle add to cart
  const onAddToCart = async (productId: number) => {
    try {
      const product = [...featuredProducts, ...newArrivals, ...bestSellers]
        .find(p => p.id === productId);
        
      if (!product) return;
      
      // Import cart service dynamically
      const { cartService } = await import('../../services/cart.service');
      
      // Create a normalized product object with all required fields
      const normalizedProduct = {
        id: product.id,
        title: product.name, 
        description: product.description || '',
        price: typeof product.price === 'number' ? product.price : 0,
        image: product.image || '',
        thumbnail: product.image || '',
        category: product.category || '',
        created_at: product.created_at || new Date().toISOString(),
        updated_at: product.updated_at || new Date().toISOString(),
        finalPrice: product.finalPrice || product.sale_price || product.price,
        discountPercentage: product.discount || 0,
        stock: product.stock_quantity || 10,
        images: [product.image || ''],
        brand: 'Generic',
        _name: product.name,
        _sale_price: product.sale_price || product.price,
        _stock_quantity: product.stock_quantity || 10,
        _panel_type: product.panel_type || '',
        _is_active: true
      };
      
      console.log('Adding product to cart:', normalizedProduct);
      cartService.addToCart(normalizedProduct, 1);
      
    } catch (error) {
      console.error('Error adding product to cart:', error);
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Slider with Wood Theme */}
      <div className="wood-hero-section relative overflow-hidden">
        <div className="relative h-[500px] md:h-[600px] overflow-hidden">
          {/* Slider images with wood theme */}
          <div
            className={`wood-hero-slide absolute inset-0 w-full h-full transition-opacity duration-1000 transform ${
              currentSlide === 0 ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src="/media/Background/HD-wallpaper-light-wooden-texture-wooden-light-brown-background-wood-texture-wooden-board-texture.jpg"
              alt="Premium Wood Collection"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="wood-hero-content">
                  <p className="wood-hero-subtitle">
                    Discover our high-quality wood products
                  </p>
                  <h1 className="wood-hero-title">
                    Premium Wood Collection
                  </h1>
                  <p className="wood-hero-description">
                    Find your perfect match for your next project
                  </p>
                  <Link
                    to="/products"
                    className="wood-hero-button inline-block"
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`wood-hero-slide absolute inset-0 w-full h-full transition-opacity duration-1000 transform ${
              currentSlide === 1 ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src="/media/Background/HD-wallpaper-wood-logs-textures-macro-brown-wooden-texture-wooden-circles-brown-wooden-backgrounds-wooden-textures-wooden-logs-brown-backgrounds.jpg"
              alt="Custom Solutions"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="wood-hero-content">
                  <p className="wood-hero-subtitle">
                    Tailored for your specific needs
                  </p>
                  <h1 className="wood-hero-title">
                    Custom Solutions
                  </h1>
                  <p className="wood-hero-description">
                    Professional wood panels with premium quality
                  </p>
                  <Link
                    to="/products"
                    className="wood-hero-button inline-block"
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`wood-hero-slide absolute inset-0 w-full h-full transition-opacity duration-1000 transform ${
              currentSlide === 2 ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src="/media/Background/HD-wallpaper-light-brown-wooden-texture-macro-wooden-structure-wooden-backgrounds-wooden-textures-brown-backgrounds-brown-wood.jpg"
              alt="Sustainable Materials"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="wood-hero-content">
                  <p className="wood-hero-subtitle">
                    Environmentally responsible choices
                  </p>
                  <h1 className="wood-hero-title">
                    Sustainable Materials
                  </h1>
                  <p className="wood-hero-description">
                    Ethically sourced wood products for eco-conscious customers
                  </p>
                  <Link
                    to="/products"
                    className="wood-hero-button inline-block"
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div
              className={`wood-hero-slide absolute inset-0 w-full h-full transition-opacity duration-1000 transform ${
              currentSlide === 3 ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
              src="/media/Background/HD-wallpaper-abstract-texture-wood.jpg"
              alt="Innovative Designs"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="wood-hero-content">
                    <p className="wood-hero-subtitle">
                      Modern solutions for modern needs
                    </p>
                    <h1 className="wood-hero-title">
                      Innovative Designs
                    </h1>
                    <p className="wood-hero-description">
                      Cutting-edge wood products with contemporary aesthetics
                    </p>
                    <Link
                      to="/products"
                      className="wood-hero-button inline-block"
                    >
                      Shop Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
        </div>
        
        {/* Slider Controls with Wood Theme */}
        <div className="absolute inset-0 flex items-center justify-between px-4">
          <button
            onClick={prevSlide}
            className="wood-slider-control"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="wood-slider-control"
          >
            <ArrowRightIcon className="h-6 w-6" />
          </button>
        </div>
        
        {/* Slider Indicators with Wood Theme */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
          {sliderImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`wood-slider-indicator ${
                index === currentSlide ? 'active' : ''
              }`}
            />
          ))}
        </div>
      </div>

      {/* Services Section with Wood Theme */}
      <div className="wood-services-section">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="wood-service-card">
              <div className="wood-service-icon">
                <ShoppingCartIcon className="h-10 w-10" />
              </div>
              <div className="wood-service-content">
                <h3 className="wood-service-title">Free Shipping</h3>
                <p className="wood-service-description">On all orders over $99</p>
              </div>
            </div>
            <div className="wood-service-card">
              <div className="wood-service-icon">
                <TruckIcon className="h-10 w-10" />
              </div>
              <div className="wood-service-content">
                <h3 className="wood-service-title">Fast Delivery</h3>
                <p className="wood-service-description">Nationwide shipping</p>
              </div>
            </div>
            <div className="wood-service-card">
              <div className="wood-service-icon">
                <TagIcon className="h-10 w-10" />
              </div>
              <div className="wood-service-content">
                <h3 className="wood-service-title">Best Quality</h3>
                <p className="wood-service-description">Premium materials</p>
              </div>
            </div>
            <div className="wood-service-card">
              <div className="wood-service-icon">
                <PhoneIcon className="h-10 w-10" />
              </div>
              <div className="wood-service-content">
                <h3 className="wood-service-title">24/7 Support</h3>
                <p className="wood-service-description">Dedicated assistance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section with Wood Theme */}
      <div className="wood-categories-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="wood-categories-title">Shop by Category</h2>
            <p className="wood-categories-subtitle">Find exactly what you need for your project</p>
          </div>
          
          {loading ? (
            <div className="wood-spinner">
              <div className="wood-spinner-icon"></div>
            </div>
          ) : error ? (
            <div className="wood-alert-error">{error}</div>
          ) : categories.length === 0 ? (
            <div className="wood-empty-state">No categories available</div>
          ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.slice(0, 4).map((category) => (
                <Link key={category.id} to={`/products/category/${category.id}`}>
                  <div className="wood-category-card">
                    <h3 className="wood-category-name">{category.name}</h3>
                    <p className="wood-category-count">
                      {category.calculatedProductCount} Products
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Deal of the Day with Wood Theme */}
      {dealOfTheDay && (
        <div className="py-12">
          <div className="container mx-auto px-4">
            <div className="wood-deal-section">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 p-4">
                  <img
                    src={getImageUrl(dealOfTheDay.image)}
                    alt={dealOfTheDay.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="lg:col-span-2">
                  <div className="wood-deal-content">
                    <h2 className="wood-deal-title">Deal of the Day</h2>
                    <p className="wood-deal-subtitle">Limited time offer</p>
                    
                    <div className="wood-deal-product">
                      <h3 className="wood-product-title text-xl">{dealOfTheDay.name}</h3>
                      
                      <div className="flex items-center">
                        <span className="wood-deal-price">
                          ${formatPrice(dealOfTheDay.sale_price || dealOfTheDay.price)}
                        </span>
                        {dealOfTheDay.original_price && (
                          <span className="wood-deal-original-price">
                            ${formatPrice(dealOfTheDay.original_price)}
                          </span>
                        )}
                        {dealOfTheDay.discount_percentage && (
                          <span className="wood-deal-discount">
                            -{dealOfTheDay.discount_percentage}%
                          </span>
                        )}
                      </div>
                      
                      <div className="wood-deal-timer">
                        <div className="wood-timer-unit">
                          <div className="wood-timer-number">24</div>
                          <div className="wood-timer-label">Hours</div>
                        </div>
                        <div className="wood-timer-unit">
                          <div className="wood-timer-number">00</div>
                          <div className="wood-timer-label">Minutes</div>
                        </div>
                        <div className="wood-timer-unit">
                          <div className="wood-timer-number">00</div>
                          <div className="wood-timer-label">Seconds</div>
                        </div>
                      </div>
                      
                      <Link
                        to={`/products/${dealOfTheDay.id}`}
                        className="wood-product-button"
                      >
                        Shop Now
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Featured Products with Wood Theme */}
      <div className="wood-products-section">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="wood-section-title">Featured Products</h2>
            <p className="wood-section-subtitle">Our selection of high-quality wood products</p>
          </div>
          
          {loading ? (
            <div className="wood-spinner">
              <div className="wood-spinner-icon"></div>
            </div>
          ) : error ? (
            <div className="wood-alert-error">{error}</div>
          ) : featuredProducts.length === 0 ? (
            <div className="wood-empty-state">No featured products available</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <div key={product.id} className="wood-product-card">
                  <div className="wood-product-image-container">
                    <Link to={`/products/${product.id}`}>
                      <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        className="wood-product-image"
                      />
                    </Link>
                    
                    {product.discount && (
                      <div className="wood-product-badge">
                        -{product.discount}%
                      </div>
                    )}
                  </div>
                  
                  <div className="wood-product-content">
                    <Link to={`/products/${product.id}`}>
                      <h3 className="wood-product-title">{product.name}</h3>
                    </Link>
                    
                    <div className="flex items-center">
                      {product.sale_price && product.sale_price < product.price ? (
                        <>
                          <span className="wood-product-price">
                            ${formatPrice(product.sale_price)}
                          </span>
                          <span className="wood-product-original-price">
                            ${formatPrice(product.price)}
                          </span>
                        </>
                      ) : (
                        <span className="wood-product-price">
                          ${formatPrice(product.price)}
                        </span>
                      )}
                    </div>
                    
                    <p className="wood-product-description">
                      {product.description ? product.description.substring(0, 100) + '...' : ''}
                    </p>
                    
                    <button
                      onClick={() => onAddToCart(product.id)}
                      disabled={product.stock_quantity <= 0}
                      className="wood-product-button"
                    >
                      <ShoppingCartIcon className="h-5 w-5" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Arrivals with Wood Theme */}
      <div className="wood-products-section">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="wood-section-title">New Arrivals</h2>
            <p className="wood-section-subtitle">The latest additions to our collection</p>
          </div>
          
          {loading ? (
            <div className="wood-spinner">
              <div className="wood-spinner-icon"></div>
            </div>
          ) : error ? (
            <div className="wood-alert-error">{error}</div>
          ) : newArrivals.length === 0 ? (
            <div className="wood-empty-state">No new arrivals available</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {newArrivals.slice(0, 2).map((product) => (
                <div key={product.id} className="wood-product-card">
                  <div className="wood-product-image-container">
                    <Link to={`/products/${product.id}`}>
                      <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        className="wood-product-image"
                      />
                    </Link>
                  </div>
                  
                  <div className="wood-product-content">
                    <Link to={`/products/${product.id}`}>
                      <h3 className="wood-product-title">{product.name}</h3>
                    </Link>
                    
                    <div className="flex items-center">
                      <span className="wood-product-price">
                        ${formatPrice(product.price)}
                      </span>
                    </div>
                    
                    <p className="wood-product-description">
                      {product.description ? product.description.substring(0, 100) + '...' : ''}
                    </p>
                    
                    <button
                      onClick={() => onAddToCart(product.id)}
                      disabled={product.stock_quantity <= 0}
                      className="wood-product-button"
                    >
                      <ShoppingCartIcon className="h-5 w-5" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Best Sellers */}
      <div className="wood-products-section">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="wood-section-title">Best Sellers</h2>
            <p className="wood-section-subtitle">Our most popular products that customers love</p>
          </div>
          
          {loading ? (
            <div className="wood-spinner">
              <div className="wood-spinner-icon"></div>
            </div>
          ) : error ? (
            <div className="wood-alert-error">{error}</div>
          ) : bestSellers.length === 0 ? (
            <div className="wood-empty-state">No best sellers available</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {bestSellers.slice(0, 2).map((product) => (
                <div key={product.id} className="wood-product-card">
                  <div className="wood-product-image-container">
                    <Link to={`/products/${product.id}`}>
                      <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        className="wood-product-image"
                      />
                    </Link>
                    
                    {product.discount && (
                      <div className="wood-product-badge">
                        -{product.discount}%
                      </div>
                    )}
                  </div>
                  
                  <div className="wood-product-content">
                    <Link to={`/products/${product.id}`}>
                      <h3 className="wood-product-title">{product.name}</h3>
                    </Link>
                    
                    <div className="flex items-center">
                      {product.sale_price && product.sale_price < product.price ? (
                        <>
                          <span className="wood-product-price">
                            ${formatPrice(product.sale_price)}
                          </span>
                          <span className="wood-product-original-price">
                            ${formatPrice(product.price)}
                          </span>
                        </>
                      ) : (
                        <span className="wood-product-price">
                          ${formatPrice(product.price)}
                        </span>
                      )}
                    </div>
                    
                    <p className="wood-product-description">
                      {product.description ? product.description.substring(0, 100) + '...' : ''}
                    </p>
                    
                    <button
                      onClick={() => onAddToCart(product.id)}
                      disabled={product.stock_quantity <= 0}
                      className="wood-product-button"
                    >
                      <ShoppingCartIcon className="h-5 w-5" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Newsletter with Wood Theme */}
      <div className="wood-categories-section py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="wood-categories-title">Subscribe to Our Newsletter</h2>
          <p className="wood-categories-subtitle mb-8 max-w-xl mx-auto">
            Stay updated with our latest products, special offers, and wooden treasures
          </p>
          <div className="max-w-lg mx-auto flex">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 py-3 px-4 border border-wood-brown-300 bg-white focus:outline-none focus:ring-2 focus:ring-wood-brown-500 focus:border-wood-brown-500"
            />
            <button className="wood-product-button px-6 py-3">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 