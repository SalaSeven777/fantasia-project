import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ProductReview } from '../../types';
import { Product } from '../../types/product.types';
import { productService } from '../../services/product.service';

// API base URL for assets
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

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

// Create a custom review type that includes a user object rather than just user ID
interface ExtendedReview {
  id: number;
  product: number;
  rating: number;
  comment: string;
  created_at: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    date_joined: string;
    is_active: boolean;
    role: string;
  };
}

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [imageError, setImageError] = useState<boolean>(false);

  // Handle image error
  const handleImageError = () => {
    console.log('Image failed to load, using placeholder');
    setImageError(true);
  };

  // Fetch product data when component mounts
  useEffect(() => {
    const fetchProductData = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const productId = parseInt(id);
        const productData = await productService.getProductById(productId);
        
        // Add computed properties
        const processedProduct = {
          ...productData,
          inStock: productData.stock_quantity > 0,
        };
        
        setProduct(processedProduct);
        
        // Fetch reviews if needed
        if (productData.id) {
          try {
            const reviewsData = await productService.getProductReviews(productData.id);
            setReviews(reviewsData);
          } catch (reviewError) {
            console.error('Error fetching reviews:', reviewError);
            // Don't set main error as this is not critical
          }
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to load product details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductData();
  }, [id]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      // Import cart service
      const { cartService } = await import('../../services/cart.service');
      
      // Create a normalized product object with all required fields
      const normalizedProduct = {
        id: product.id,
        title: product.name, // Use name as title for cart service
        description: product.description || '',
        price: typeof product.price === 'number' ? product.price : 0,
        image: product.image || '',
        thumbnail: product.image || '', // Add thumbnail for cart service
        category: product.category || '',
        created_at: product.created_at || new Date().toISOString(),
        updated_at: product.updated_at || new Date().toISOString(),
        finalPrice: product.sale_price || product.price,
        // Additional fields for compatibility
        discountPercentage: product.discount || 0,
        stock: product.stock_quantity || 10,
        images: product.additional_images?.map(img => img.image) || [product.image || ''],
        brand: 'Generic',
        // Pass these as separate properties for the cart service
        _name: product.name,
        _sale_price: product.sale_price || product.price,
        _stock_quantity: product.stock_quantity || 10,
        _panel_type: product.panel_type || '',
        _is_active: true
      };
      
      console.log(`Adding ${quantity} of ${product.name} to cart`, normalizedProduct);
      cartService.addToCart(normalizedProduct, quantity);
      
      // Show success message
      alert(`${quantity} ${product.name}${quantity > 1 ? 's' : ''} added to cart`);
      
      // Optionally, navigate to cart page
      window.location.href = '/cart';
    } catch (error) {
      console.error('Error adding product to cart:', error);
      alert('Failed to add product to cart. Please try again.');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
        </div>
        <p className="mt-4 text-gray-600">Loading product details...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  // Not found state
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Product not found.</strong>
          <span className="block sm:inline"> The requested product could not be found.</span>
        </div>
      </div>
    );
  }

  // Images array for the UI - use product.additional_images if available
  const productImages = product.additional_images 
    ? [product.image, ...product.additional_images.map(img => img.image)].filter(Boolean) as string[]
    : product.image ? [product.image] : [];

  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-w-1 aspect-h-1 w-full bg-white">
            <img
              src={imageError ? '/placeholder-product.jpg' : getImageUrl(productImages[selectedImage] || product.image)}
              alt={product.name}
              className="object-contain rounded-lg product-image"
              onError={handleImageError}
            />
          </div>
          {productImages.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`border-2 rounded bg-white ${
                    selectedImage === index ? 'border-primary-500' : 'border-gray-200'
                  }`}
                >
                  <img 
                    src={getImageUrl(image)} 
                    alt={`${product.name} ${index + 1}`} 
                    className="object-contain h-16 w-full product-image"
                    onError={(e) => (e.target as HTMLImageElement).src = '/placeholder-product.jpg'}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, index) => (
                <span
                  key={index}
                  className={`text-2xl ${
                    index < (averageRating || 0) ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-gray-600">
              ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
            </span>
          </div>
          <p className="text-2xl font-bold text-blue-600">${formatPrice(product.price)}</p>
          <p className="text-gray-600">{product.description}</p>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label htmlFor="quantity" className="font-medium">Quantity:</label>
              <input
                type="number"
                id="quantity"
                value={quantity}
                onChange={handleQuantityChange}
                min="1"
                max={product.stock_quantity || 1}
                className="border rounded px-3 py-2 w-20"
              />
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                product.stock_quantity > 10 
                  ? 'bg-green-100 text-green-800' 
                  : product.stock_quantity > 0 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-red-100 text-red-800'
              }`}>
                {product.stock_quantity > 10 
                  ? 'In Stock' 
                  : product.stock_quantity > 0 
                    ? `Low Stock (${product.stock_quantity} left)` 
                    : 'Out of Stock'}
              </span>
            </div>
            <button
              onClick={handleAddToCart}
              className={`w-full py-3 rounded-lg flex items-center justify-center ${
                product.stock_quantity > 0
                  ? 'bg-primary-600 text-white hover:bg-primary-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              } transition`}
              disabled={product.stock_quantity <= 0}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Specifications, Materials, and Reviews */}
      <div className="mt-12">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button className="border-b-2 border-blue-500 py-4 px-1 text-blue-600 font-medium">
              Product Details
            </button>
            <button className="border-b-2 border-transparent py-4 px-1 text-gray-500 hover:text-gray-700 font-medium">
              Brand
            </button>
            <button className="border-b-2 border-transparent py-4 px-1 text-gray-500 hover:text-gray-700 font-medium">
              Reviews
            </button>
          </nav>
        </div>

        {/* Product Details Content */}
        <div className="py-6">
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
            <div className="border-b pb-4">
              <dt className="text-gray-600">Category</dt>
              <dd className="mt-1 text-gray-900 font-medium">
                {product.category_name || (typeof product.category === 'object' && 'name' in product.category ? product.category.name : product.category.toString())}
              </dd>
            </div>
            <div className="border-b pb-4">
              <dt className="text-gray-600">Panel Type</dt>
              <dd className="mt-1 text-gray-900 font-medium">{product.panel_type_display || product.panel_type}</dd>
            </div>
            <div className="border-b pb-4">
              <dt className="text-gray-600">Availability</dt>
              <dd className="mt-1 text-gray-900 font-medium">
                {product.stock_quantity > 10 
                  ? 'In Stock' 
                  : product.stock_quantity > 0 
                    ? `Low Stock (${product.stock_quantity} left)` 
                    : 'Out of Stock'}
                {product.stock_quantity > 0 && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {product.stock_quantity} in stock
                  </span>
                )}
              </dd>
            </div>
            <div className="border-b pb-4">
              <dt className="text-gray-600">Added</dt>
              <dd className="mt-1 text-gray-900 font-medium">
                {new Date(product.created_at).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails; 