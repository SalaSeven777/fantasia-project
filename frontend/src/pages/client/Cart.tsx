import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types/product.types';

// API base URL for assets
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Helper function to get complete image URL
const getImageUrl = (imagePath: string | null) => {
  if (!imagePath) return '/placeholder-image.jpg';
  
  if (imagePath.startsWith('http') || imagePath.startsWith('/')) {
    return imagePath;
  }
  
  return `${API_BASE_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};

// Helper function to format price
const formatPrice = (price: any): string => {
  // Convert to number if it's a string or other type
  const numPrice = typeof price === 'string' ? parseFloat(price) : Number(price);
  
  // Check if it's a valid number
  return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
};

interface CartItem {
  product: Product;
  quantity: number;
}

const Cart: React.FC = () => {
  // Sample cart items
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      product: {
        id: 1,
        name: 'LATTÉ PLAQUAGE: PEUPLIER+FORMICA',
        category: 1,
        category_name: 'LATTE_PLAQUAGE_PEUPLIER',
        description: 'Premium quality poplar plywood with Formica finish',
        price: 299.99,
        image: '/images/products/product1.jpg',
        panel_type: 'LP',
        panel_type_display: 'LATTÉ PLAQUAGE: PEUPLIER+FORMICA',
        technical_specs: {},
        stock_quantity: 100,
        min_stock_threshold: 10,
        is_active: true,
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
        // Frontend computed properties
        inStock: true,
        rating: 4.5,
        discount: 10
      },
      quantity: 2,
    },
    // Add more cart items...
  ]);

  // Calculate totals
  const subtotal = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );
  const shipping = 25; // Sample shipping cost
  const tax = subtotal * 0.2; // Sample tax rate (20%)
  const total = subtotal + shipping + tax;

  // Update quantity
  const updateQuantity = (productId: number, newQuantity: number) => {
    setCartItems((items) =>
      items.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: Math.max(0, newQuantity) }
          : item
      )
    );
  };

  // Remove item
  const removeItem = (productId: number) => {
    setCartItems((items) => items.filter((item) => item.product.id !== productId));
  };

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Shopping Cart</h1>

        <div className="mt-12">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-medium text-gray-900">Your cart is empty</h2>
              <p className="mt-2 text-gray-500">
                Start shopping to add items to your cart.
              </p>
              <Link
                to="/products"
                className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
              <div className="lg:col-span-7">
                {/* Cart items */}
                <ul role="list" className="border-t border-b border-gray-200 divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <li key={item.product.id} className="flex py-6">
                      <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                        <img
                          src={getImageUrl(item.product.image)}
                          alt={item.product.name}
                          className="w-full h-full object-center object-cover"
                        />
                      </div>

                      <div className="ml-4 flex-1 flex flex-col">
                        <div>
                          <div className="flex justify-between text-base font-medium text-gray-900">
                            <h3>
                              <Link to={`/products/${item.product.id}`}>
                                {item.product.name}
                              </Link>
                            </h3>
                            <p className="ml-4">
                              ${formatPrice(item.product.price * item.quantity)}
                            </p>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">
                            {item.product.category_name || item.product.category.toString()}
                          </p>
                        </div>
                        <div className="flex-1 flex items-end justify-between text-sm">
                          <div className="flex items-center">
                            <label htmlFor={`quantity-${item.product.id}`} className="mr-2">
                              Qty
                            </label>
                            <input
                              type="number"
                              id={`quantity-${item.product.id}`}
                              className="w-16 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              value={item.quantity}
                              min="1"
                              onChange={(e) =>
                                updateQuantity(item.product.id, parseInt(e.target.value))
                              }
                            />
                          </div>
                          <button
                            type="button"
                            className="font-medium text-indigo-600 hover:text-indigo-500"
                            onClick={() => removeItem(item.product.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Order summary */}
              <div className="mt-16 lg:mt-0 lg:col-span-5">
                <div className="bg-gray-50 rounded-lg px-4 py-6 sm:p-6 lg:p-8">
                  <h2 className="text-lg font-medium text-gray-900">Order summary</h2>

                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">Subtotal</p>
                      <p className="text-sm font-medium text-gray-900">
                        ${formatPrice(subtotal)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">Shipping</p>
                      <p className="text-sm font-medium text-gray-900">
                        ${formatPrice(shipping)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">Tax</p>
                      <p className="text-sm font-medium text-gray-900">
                        ${formatPrice(tax)}
                      </p>
                    </div>
                    <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                      <p className="text-base font-medium text-gray-900">Order total</p>
                      <p className="text-base font-medium text-gray-900">
                        ${formatPrice(total)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Link
                      to="/checkout"
                      className="w-full bg-indigo-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Proceed to Checkout
                    </Link>
                  </div>
                </div>

                <div className="mt-6 text-sm text-center">
                  <p className="text-gray-600">
                    or{' '}
                    <Link
                      to="/products"
                      className="text-indigo-600 font-medium hover:text-indigo-500"
                    >
                      Continue Shopping
                      <span aria-hidden="true"> &rarr;</span>
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart; 