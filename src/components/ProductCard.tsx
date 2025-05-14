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
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  
  // API base URL for assets
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  
  // Helper functions
  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath) return '/placeholder-image.jpg';
    
    if (imagePath.startsWith('http') || imagePath.startsWith('/')) {
      return imagePath;
    }
    
    return `${API_BASE_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };
  
  const formatPrice = (price: number): string => {
    return price.toFixed(2);
  };
  
  // Handle card click
  const handleCardClick = () => {
    navigate(`/products/${product.id}`);
  };
  
  // Handle add to cart
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product.id);
    
    // Show added to cart feedback
    setIsAddedToCart(true);
    setTimeout(() => {
      setIsAddedToCart(false);
    }, 2000);
  };
  
  // Handle toggle compare
  const handleToggleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleCompare(product.id);
  };
  
  // Calculate discount percentage if any
  const discountPercentage = product.discount;
  const hasDiscount = discountPercentage && discountPercentage > 0;
  const discountedPrice = hasDiscount 
    ? product.price * (1 - Number(discountPercentage) / 100) 
    : product.price;

  return (
    <div 
      className="group relative bg-white rounded-md shadow-sm overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <div className="relative pt-[100%] overflow-hidden">
        <Link to={`/products/${product.id}`} className="absolute inset-0">
          <img 
            src={getImageUrl(product.image)} 
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        
        {/* Product labels */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {hasDiscount && (
            <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded">
              -{discountPercentage}%
            </span>
          )}
          
          {product.is_new && (
            <span className="bg-primary-600 text-white text-xs font-medium px-2 py-1 rounded">
              NEW
            </span>
          )}
          
          {(product.stock_quantity && product.stock_quantity <= 5) && (
            <span className="bg-amber-500 text-white text-xs font-medium px-2 py-1 rounded">
              LOW STOCK
            </span>
          )}
        </div>
        
        {/* Product actions */}
        <div className={`absolute right-3 flex flex-col gap-2 transition-all duration-300 ${isHovered ? 'opacity-100 top-3' : 'opacity-0 top-6'}`}>
          <button 
            onClick={handleToggleCompare}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              isSelected 
                ? 'bg-primary-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-primary-50 hover:text-primary-600'
            } shadow-md`}
            title="Compare"
          >
            <ArrowsRightLeftIcon className="h-5 w-5" />
          </button>
          
          <button 
            className="w-9 h-9 rounded-full bg-white text-gray-600 hover:bg-primary-50 hover:text-primary-600 flex items-center justify-center shadow-md transition-colors"
            title="Add to wishlist"
          >
            <HeartIcon className="h-5 w-5" />
          </button>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowQuickView(true);
            }}
            className="w-9 h-9 rounded-full bg-white text-gray-600 hover:bg-primary-50 hover:text-primary-600 flex items-center justify-center shadow-md transition-colors"
            title="Quick view"
          >
            <EyeIcon className="h-5 w-5" />
          </button>
        </div>
        
        {/* Add to cart button overlay */}
        <div className={`absolute bottom-0 inset-x-0 bg-white bg-opacity-95 transition-all duration-300 flex justify-center ${isHovered ? 'translate-y-0' : 'translate-y-full'}`}>
          <button
            onClick={handleAddToCart}
            className={`w-full py-3 px-4 flex items-center justify-center transition-colors ${
              isAddedToCart
                ? 'bg-green-600 text-white'
                : 'bg-primary-600 hover:bg-primary-700 text-white'
            }`}
          >
            {isAddedToCart ? (
              <>
                <CheckIcon className="h-5 w-5 mr-2" />
                Added to cart
              </>
            ) : (
              <>
                <ShoppingCartIcon className="h-5 w-5 mr-2" />
                Add to cart
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Product Info */}
      <div className="p-4">
        <Link 
          to={`/products/${product.id}`}
          className="block text-gray-800 font-medium hover:text-primary-600 transition-colors text-sm sm:text-base line-clamp-2 min-h-[2.5rem]"
        >
          {product.name}
        </Link>
        
        {/* Price */}
        <div className="mt-2 flex items-center">
          {hasDiscount ? (
            <>
              <span className="text-red-600 font-semibold">${formatPrice(discountedPrice)}</span>
              <span className="ml-2 text-gray-500 text-sm line-through">${formatPrice(product.price)}</span>
            </>
          ) : (
            <span className="text-gray-800 font-semibold">${formatPrice(product.price)}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 