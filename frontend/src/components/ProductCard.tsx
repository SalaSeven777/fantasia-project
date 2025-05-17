import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCartIcon, 
  ArrowsRightLeftIcon,
  HeartIcon,
  StarIcon,
  EyeIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { Product } from '../types/product.types';
import { useAppSelector } from '../store/hooks';
import '../styles/wood-client-theme.css'; // Import the wood client theme

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: number) => void;
  onToggleCompare: (productId: number) => void;
  isSelected: boolean;
  compact?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAddToCart, 
  onToggleCompare, 
  isSelected,
  compact = false
}) => {
  const [imageError, setImageError] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  
  // Helper function to get the full image URL
  const getImageUrl = (imagePath: string | null): string => {
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

  // Format price to 2 decimal places
  const formatPrice = (price: number | string): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  };

  // Calculate discount percentage if not provided
  const calculateDiscountPercentage = (): number => {
    if (product.discount) return product.discount;
    if (product.sale_price && product.price && product.sale_price < product.price) {
      return Math.round(((product.price - product.sale_price) / product.price) * 100);
    }
    return 0;
  };

  // Truncate description
  const truncateDescription = (text: string, maxLength: number) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  // Handle image loading error
  const handleImageError = () => {
    console.log(`Image failed to load for product ${product.id}`, product.image);
    setImageError(true);
  };
  
  // Use a more reliable method to determine the image source with fallback
  let productImageSrc = '/placeholder-product.jpg';
  
  if (!imageError && product.image) {
    productImageSrc = getImageUrl(product.image);
  }

  // Handle add to cart with navigation
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent any parent link navigation
    e.stopPropagation(); // Stop event bubbling
    
    try {
      // First, add the product to cart directly using cartService
      const { cartService } = await import('../services/cart.service');
      
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
        finalPrice: product.finalPrice || product.sale_price || product.price,
        // Additional fields for compatibility
        discountPercentage: product.discount || 0,
        stock: product.stock_quantity || 10,
        images: [product.image || ''],
        brand: 'Generic',
        // Pass these as separate properties for the cart service
        _name: product.name,
        _sale_price: product.sale_price || product.price,
        _stock_quantity: product.stock_quantity || 10,
        _panel_type: product.panel_type || '',
        _is_active: true
      };
      
      console.log('Adding normalized product to cart:', normalizedProduct);
      cartService.addToCart(normalizedProduct, 1);
      
      // Then, call the parent component's onAddToCart function for any additional logic
      onAddToCart(product.id);
      
      // Show success indicator
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
      
      // Navigate to cart page after a short delay
      setTimeout(() => {
        navigate('/cart');
      }, 800);
    } catch (error) {
      console.error('Error adding product to cart:', error);
    }
  };

  // Calculate the rating display
  const renderRating = () => {
    // Get average rating or use custom rating
    const ratingValue = product.rating || 0;
    const fullStars = Math.floor(ratingValue);
    const hasHalfStar = ratingValue - fullStars >= 0.5;
    
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, index) => {
          if (index < fullStars) {
            return <StarIconSolid key={index} className="h-4 w-4 text-amber-400" />;
          } else if (index === fullStars && hasHalfStar) {
            return <StarIconSolid key={index} className="h-4 w-4 text-amber-400" />;
          } else {
            return <StarIcon key={index} className="h-4 w-4 text-neutral-300" />;
          }
        })}
        <span className="ml-1 text-xs text-neutral-500">
          {ratingValue.toFixed(1)}
        </span>
      </div>
    );
  };

  const discountPercentage = calculateDiscountPercentage();

  return (
    <div 
      className="wood-product-card"
    >
      {/* Product Image */}
      <div className="wood-product-image-container">
        <Link to={`/products/${product.id}`}>
          <img 
            src={productImageSrc}
            alt={product.name}
            className="wood-product-image"
            onError={handleImageError}
          />
        </Link>
        
        {/* Product labels */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {discountPercentage > 0 && (
            <span className="wood-product-badge">
              -{discountPercentage}%
            </span>
          )}
          
          {/* Stock status badge */}
          {product.stock_quantity <= 0 ? (
            <span className="wood-product-badge bg-red-500">
              Out of Stock
            </span>
          ) : product.stock_quantity <= 5 ? (
            <span className="wood-product-badge bg-amber-500">
              Only {product.stock_quantity} Left
            </span>
          ) : null}
        </div>
      </div>
      
      {/* Product Info */}
      <div className="wood-product-content">
        <Link to={`/products/${product.id}`}>
          <h3 className="wood-product-title">
            {product.name}
          </h3>
        </Link>
        
        {renderRating()}
        
        <div className="mt-2 flex items-center gap-2">
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
        
        {!compact && (
          <p className="wood-product-description">
            {truncateDescription(product.description || '', 100)}
          </p>
        )}
        
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={handleAddToCart}
            disabled={product.stock_quantity <= 0}
            className="wood-product-button"
          >
            {addedToCart ? (
              <>
                <CheckIcon className="h-5 w-5" />
                Added to Cart
              </>
            ) : (
              <>
                <ShoppingCartIcon className="h-5 w-5" />
                Add to Cart
              </>
            )}
          </button>
          
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleCompare(product.id);
            }}
            className={`wood-product-button wood-btn-outline p-2 flex-shrink-0 ${
              isSelected ? 'bg-primary-100 border-primary-600' : ''
            }`}
          >
            <ArrowsRightLeftIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 