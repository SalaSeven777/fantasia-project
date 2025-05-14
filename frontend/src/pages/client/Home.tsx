import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../services/product.service';
import { apiService } from '../../services/api';
import { Product, Category } from '../../types/product.types';
import ProductCard from '../../components/ProductCard';
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
const simulateDiscount = (product: Product) => {
  // If product doesn't have price, return original product
  if (!product.price) return product;
  
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
  const [dealOfTheDay, setDealOfTheDay] = useState<Product | null>(null);
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

  return (
    <div className="bg-white">
      {/* Hero Slider */}
      <div className="relative overflow-hidden">
        <div className="relative h-[500px] md:h-[600px] overflow-hidden">
          {/* Slider images */}
          <div
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 transform ${
              currentSlide === 0 ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src="/media/Background/HD-wallpaper-light-wooden-texture-wooden-light-brown-background-wood-texture-wooden-board-texture.jpg"
              alt="Premium Wood Collection"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-10"></div>
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-lg">
                  <p className="text-white font-medium text-lg mb-3">
                    Discover our high-quality wood products
                  </p>
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
                    Premium Wood Collection
                  </h1>
                  <p className="text-white text-lg mb-6">
                    Find your perfect match for your next project
                  </p>
                  <Link
                    to="/products"
                    className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-md transition-colors duration-300"
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 transform ${
              currentSlide === 1 ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src="/media/Background/HD-wallpaper-wood-logs-textures-macro-brown-wooden-texture-wooden-circles-brown-wooden-backgrounds-wooden-textures-wooden-logs-brown-backgrounds.jpg"
              alt="Custom Solutions"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-10"></div>
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-lg">
                  <p className="text-white font-medium text-lg mb-3">
                    Tailored for your specific needs
                  </p>
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
                    Custom Solutions
                  </h1>
                  <p className="text-white text-lg mb-6">
                    Professional wood panels with premium quality
                  </p>
                  <Link
                    to="/products"
                    className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-md transition-colors duration-300"
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 transform ${
              currentSlide === 2 ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src="/media/Background/HD-wallpaper-light-brown-wooden-texture-macro-wooden-structure-wooden-backgrounds-wooden-textures-brown-backgrounds-brown-wood.jpg"
              alt="Sustainable Materials"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-10"></div>
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-lg">
                  <p className="text-white font-medium text-lg mb-3">
                    Environmentally responsible choices
                  </p>
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
                    Sustainable Materials
                  </h1>
                  <p className="text-white text-lg mb-6">
                    Ethically sourced wood products for eco-conscious customers
                  </p>
                  <Link
                    to="/products"
                    className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-md transition-colors duration-300"
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 transform ${
              currentSlide === 3 ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
              src="/media/Background/HD-wallpaper-abstract-texture-wood.jpg"
              alt="Innovative Designs"
                className="absolute inset-0 w-full h-full object-cover"
              />
            <div className="absolute inset-0 bg-black bg-opacity-10"></div>
              <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-lg">
                  <p className="text-white font-medium text-lg mb-3">
                    Modern solutions for modern needs
                    </p>
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
                    Innovative Designs
                    </h1>
                  <p className="text-white text-lg mb-6">
                    Cutting-edge wood products with contemporary aesthetics
                    </p>
                    <Link
                    to="/products"
                    className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-md transition-colors duration-300"
                    >
                      Shop Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
        </div>
        
        {/* Slider Controls */}
        <div className="absolute inset-0 flex items-center justify-between px-4">
          <button
            onClick={prevSlide}
            className="bg-white bg-opacity-70 hover:bg-primary-600 hover:text-white text-gray-800 rounded-full p-2 transition-colors duration-300"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="bg-white bg-opacity-70 hover:bg-primary-600 hover:text-white text-gray-800 rounded-full p-2 transition-colors duration-300"
          >
            <ArrowRightIcon className="h-6 w-6" />
          </button>
        </div>
        
        {/* Slider Indicators */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
          {sliderImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 w-8 rounded-full transition-colors duration-300 ${
                index === currentSlide ? 'bg-primary-600' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Services Section */}
      <div className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center p-4 border border-gray-200 rounded-md transition-all duration-300 hover:shadow-lg hover:border-primary-300">
              <div className="mr-4 text-primary-600">
                <ShoppingCartIcon className="h-10 w-10" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Free Shipping</h3>
                <p className="text-sm text-gray-500">On all orders over $99</p>
              </div>
            </div>
            <div className="flex items-center p-4 border border-gray-200 rounded-md transition-all duration-300 hover:shadow-lg hover:border-primary-300">
              <div className="mr-4 text-primary-600">
                <TruckIcon className="h-10 w-10" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Fast Delivery</h3>
                <p className="text-sm text-gray-500">Nationwide shipping</p>
              </div>
            </div>
            <div className="flex items-center p-4 border border-gray-200 rounded-md transition-all duration-300 hover:shadow-lg hover:border-primary-300">
              <div className="mr-4 text-primary-600">
                <TagIcon className="h-10 w-10" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Best Quality</h3>
                <p className="text-sm text-gray-500">Premium materials</p>
              </div>
            </div>
            <div className="flex items-center p-4 border border-gray-200 rounded-md transition-all duration-300 hover:shadow-lg hover:border-primary-300">
              <div className="mr-4 text-primary-600">
                <PhoneIcon className="h-10 w-10" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">24/7 Support</h3>
                <p className="text-sm text-gray-500">Dedicated assistance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Shop by Category</h2>
            <p className="text-gray-600">Find exactly what you need for your project</p>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : error ? (
            <div className="mt-6 text-center text-red-500">{error}</div>
          ) : categories.length === 0 ? (
            <div className="mt-6 text-center text-gray-500">No categories available</div>
          ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.slice(0, 4).map((category) => (
                <Link key={category.id} to={`/products/category/${category.id}`}>
                  <div className="group relative overflow-hidden rounded-lg bg-primary-50 p-6">
                    <div className="flex flex-col justify-center items-center h-full">
                      <h3 className="text-primary-800 text-xl font-bold">{category.name}</h3>
                      <p className="text-primary-600 text-sm mt-2">
                        {category.calculatedProductCount} Products
                      </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          )}
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Products</h2>
            <p className="text-gray-600">Our most popular options chosen by customers</p>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : error ? (
            <div className="mt-6 text-center text-red-500">{error}</div>
          ) : featuredProducts.length === 0 ? (
            <div className="mt-6 text-center text-gray-500">No featured products available</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={(id) => console.log('Added to cart:', id)}
                  onToggleCompare={(id) => console.log('Added to compare:', id)}
                  isSelected={false}
                  compact={false}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Banners Section */}
      <div className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative overflow-hidden rounded-lg group">
              <img 
                src="/media/Background/HD-wallpaper-light-wooden-texture-wooden-light-brown-background-wood-texture-wooden-board-texture.jpg"
                alt="Premium Panels"
                className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center">
                <div className="p-8">
                  <h3 className="text-white text-2xl font-bold mb-2">Premium Panels</h3>
                  <p className="text-white text-sm mb-4">High-quality panels for your interior design</p>
                  <Link 
                    to="/products"
                    className="inline-block bg-white text-gray-900 hover:bg-primary-600 hover:text-white px-6 py-2 rounded-md transition-colors duration-300"
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="relative overflow-hidden rounded-lg group">
              <img 
                src="/media/Background/HD-wallpaper-light-brown-wooden-texture-macro-wooden-structure-wooden-backgrounds-wooden-textures-brown-backgrounds-brown-wood.jpg" 
                alt="Wood Collection"
                className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center">
                <div className="p-8">
                  <h3 className="text-white text-2xl font-bold mb-2">Flooring Collection</h3>
                  <p className="text-white text-sm mb-4">Discover our wide range of flooring products</p>
                  <Link 
                    to="/products"
                    className="inline-block bg-white text-gray-900 hover:bg-primary-600 hover:text-white px-6 py-2 rounded-md transition-colors duration-300"
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Arrivals */}
      <div className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">New Arrivals</h2>
            <p className="text-gray-600">The latest additions to our collection</p>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : error ? (
            <div className="mt-6 text-center text-red-500">{error}</div>
          ) : newArrivals.length === 0 ? (
            <div className="mt-6 text-center text-gray-500">No new products available</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {newArrivals.slice(0, 2).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={(id) => console.log('Added to cart:', id)}
                  onToggleCompare={(id) => console.log('Added to compare:', id)}
                  isSelected={false}
                  compact={false}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Deal of the Day */}
      <div className="py-12 bg-white">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : dealOfTheDay ? (
          <div className="bg-gray-100 rounded-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="relative overflow-hidden h-80 md:h-auto">
                <img 
                    src={getImageUrl(dealOfTheDay.image || null)} 
                    alt={dealOfTheDay.name}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      // Use a wood texture background as fallback for the deal of the day
                      target.src = '/media/Background/HD-wallpaper-abstract-texture-wood.jpg';
                    }}
                  />
                  
                  {/* Show discount badge */}
                <div className="absolute top-4 left-4 bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-md">
                    {(dealOfTheDay as any).discount_percentage ? 
                      `-${(dealOfTheDay as any).discount_percentage}%` : '-20%'}
                </div>
              </div>
              
              <div className="p-8 flex flex-col justify-center">
                <span className="text-primary-600 font-medium mb-2">Limited Time Offer</span>
                  <h3 className="text-3xl font-bold text-gray-900 mb-3">{dealOfTheDay.name}</h3>
                <p className="text-gray-600 mb-6">
                    {dealOfTheDay.description || 'High-quality wood product at a special price. Limited time offer, get it while supplies last!'}
                </p>
                <div className="mb-6">
                  <div className="flex items-center">
                      <span className="text-3xl font-bold text-gray-900 mr-3">${formatPrice(dealOfTheDay.price)}</span>
                      <span className="text-xl text-gray-500 line-through">
                        ${formatPrice((dealOfTheDay as any).original_price || (dealOfTheDay.price * 1.25))}
                      </span>
                  </div>
                </div>
                <Link
                    to={`/products/${dealOfTheDay.id}`}
                  className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-md transition-colors duration-300 w-full md:w-auto text-center"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          </div>
          ) : null}
        </div>
      </div>

      {/* Best Sellers */}
      <div className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Best Sellers</h2>
            <p className="text-gray-600">Our most popular products that customers love</p>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : error ? (
            <div className="mt-6 text-center text-red-500">{error}</div>
          ) : bestSellers.length === 0 ? (
            <div className="mt-6 text-center text-gray-500">No best sellers available</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {bestSellers.slice(0, 2).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={(id) => console.log('Added to cart:', id)}
                  onToggleCompare={(id) => console.log('Added to compare:', id)}
                  isSelected={false}
                  compact={false}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Newsletter */}
      <div className="py-16 bg-gray-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Subscribe to Our Newsletter</h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            Stay updated with our latest products, special offers, and discounts
          </p>
          <div className="max-w-lg mx-auto flex">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 py-3 px-4 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 transition-colors duration-300">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 