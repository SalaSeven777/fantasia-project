import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartItem as ProductCartItem } from '../../types/product.types';
import { CartItem } from '../../types';
import { cartService } from '../../services/cart.service';
import { orderService } from '../../services/order.service';

interface ShippingAddress {
  firstName: string;
  lastName: string;
  company?: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

interface PaymentMethod {
  type: 'credit_card' | 'bank_transfer';
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  bankName?: string;
  accountNumber?: string;
}

interface FormErrors {
  shipping?: Record<string, string>;
  payment?: Record<string, string>;
  general?: Record<string, string>;
}

// Helper function to format price
const formatPrice = (price: any): string => {
  // Convert to number if it's a string or other type
  const numPrice = typeof price === 'string' ? parseFloat(price) : Number(price);
  
  // Check if it's a valid number
  return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
};

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  
  // Get real cart items instead of sample data
  const [cartItems, setCartItems] = useState<ProductCartItem[]>([]);
  
  useEffect(() => {
    // Load cart items from cart service
    const items = cartService.getCart();
    
    // Convert CartItem from types to CartItem from product.types if needed
    const convertedItems = items.map(item => {
      // Create a new product object with the required structure
      const convertedProduct = {
        id: item.product.id,
        name: item.product.title || '', // Using title from base Product
        description: item.product.description || '',
        price: item.product.price,
        image: item.product.thumbnail || '', // Using thumbnail from base Product
        category: item.product.category,
        panel_type: '', // Default empty string
        technical_specs: {}, // Default empty object
        stock_quantity: item.product.stock || 0,
        min_stock_threshold: 0,
        is_active: true,
        created_at: item.product.created_at,
        updated_at: item.product.updated_at,
        // Handle any optional fields
        finalPrice: item.product.finalPrice
      };
      
      return {
        id: item.id,
        product: convertedProduct,
        quantity: item.quantity,
        price: item.price
      } as ProductCartItem;
    });
    
    setCartItems(convertedItems);
    
    // Redirect to cart if there are no items
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [navigate]);

  // Form states
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>({
    type: 'credit_card',
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate totals
  const subtotal = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );
  const shipping = 25;
  const tax = subtotal * 0.2;
  const total = subtotal + shipping + tax;

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    // Validate shipping address
    const shippingErrors: Record<string, string> = {};
    if (!shippingAddress.firstName) shippingErrors.firstName = 'First name is required';
    if (!shippingAddress.lastName) shippingErrors.lastName = 'Last name is required';
    if (!shippingAddress.address) shippingErrors.address = 'Address is required';
    if (!shippingAddress.city) shippingErrors.city = 'City is required';
    if (!shippingAddress.state) shippingErrors.state = 'State is required';
    if (!shippingAddress.postalCode) shippingErrors.postalCode = 'Postal code is required';
    if (!shippingAddress.phone) shippingErrors.phone = 'Phone number is required';

    if (Object.keys(shippingErrors).length > 0) {
      errors.shipping = shippingErrors;
    }

    // Validate payment method
    const paymentErrors: Record<string, string> = {};
    if (paymentMethod.type === 'credit_card') {
      if (!paymentMethod.cardNumber) paymentErrors.cardNumber = 'Card number is required';
      if (!paymentMethod.expiryDate) paymentErrors.expiryDate = 'Expiry date is required';
      if (!paymentMethod.cvv) paymentErrors.cvv = 'CVV is required';
    } else if (paymentMethod.type === 'bank_transfer') {
      if (!paymentMethod.bankName) paymentErrors.bankName = 'Bank name is required';
      if (!paymentMethod.accountNumber) paymentErrors.accountNumber = 'Account number is required';
    }

    if (Object.keys(paymentErrors).length > 0) {
      errors.payment = paymentErrors;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Validate cart has items
    if (cartItems.length === 0) {
      setFormErrors({
        ...formErrors,
        general: { general: 'Your cart is empty. Please add items to your cart before checkout.' }
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare the order data
      const orderData = {
        items: cartItems.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity
        })),
        shipping_address: `${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}, ${shippingAddress.country}`,
        delivery_notes: `Order placed by ${shippingAddress.firstName} ${shippingAddress.lastName}. Contact: ${shippingAddress.phone}. Payment method: ${paymentMethod.type}.`,
        delivery_date: undefined // Let the backend assign a default delivery date
      };
      
      console.log('[ORDER] Sending order data:', JSON.stringify(orderData));
      
      // Create the order through the API
      try {
        const response = await orderService.createOrder(orderData);
        console.log('[ORDER] Order created successfully:', response);
        
        // Clear the cart after successful order
        cartService.clearCart();
        
        // Redirect to success page
        navigate('/checkout/success');
      } catch (error: any) {
        console.error('[ORDER] Order creation API error:', error);
        // Get more detailed error information if available
        if (error.response) {
          console.error('[ORDER] Response status:', error.response.status);
          console.error('[ORDER] Response data:', error.response.data);
        }
        throw error; // Re-throw to be caught by the outer catch
      }
    } catch (error: any) {
      console.error('[ORDER] Error submitting order:', error);
      // Set form error to display to user
      let errorMessage = 'Failed to create order. Please try again.';
      
      // Try to get a more specific error message
      if (error.response && error.response.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (typeof error.response.data === 'object') {
          // If response data is an object with validation errors
          const firstError = Object.entries(error.response.data)[0];
          if (firstError && firstError[1]) {
            errorMessage = `${firstError[0]}: ${Array.isArray(firstError[1]) ? firstError[1][0] : firstError[1]}`;
          }
        }
      }
      
      setFormErrors({
        ...formErrors,
        general: { general: errorMessage }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentMethodChange = (type: 'credit_card' | 'bank_transfer') => {
    setPaymentMethod({ type });
    // Clear any existing payment errors when switching methods
    setFormErrors(prev => ({ ...prev, payment: undefined }));
  };

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 pt-16 pb-24 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto lg:max-w-none">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Checkout
          </h1>

          <form className="mt-12 lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start" onSubmit={handleSubmit}>
            <div className="lg:col-span-7">
              {/* Shipping Information */}
              <div className="border-t border-gray-200 pt-10">
                <h2 className="text-lg font-medium text-gray-900">Shipping information</h2>

                <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={shippingAddress.firstName}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, firstName: e.target.value })
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={shippingAddress.lastName}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, lastName: e.target.value })
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                      Company (Optional)
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={shippingAddress.company}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, company: e.target.value })
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                      Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={shippingAddress.address}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, address: e.target.value })
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="apartment" className="block text-sm font-medium text-gray-700">
                      Apartment, suite, etc. (Optional)
                    </label>
                    <input
                      type="text"
                      id="apartment"
                      name="apartment"
                      value={shippingAddress.apartment}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, apartment: e.target.value })
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={shippingAddress.city}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, city: e.target.value })
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                      State / Province
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={shippingAddress.state}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, state: e.target.value })
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                      Postal code
                    </label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={shippingAddress.postalCode}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, postalCode: e.target.value })
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      value={shippingAddress.phone}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, phone: e.target.value })
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mt-10 border-t border-gray-200 pt-10">
                <h2 className="text-lg font-medium text-gray-900">Payment method</h2>

                <div className="mt-4">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        id="credit-card"
                        name="payment-type"
                        type="radio"
                        checked={paymentMethod.type === 'credit_card'}
                        onChange={() => handlePaymentMethodChange('credit_card')}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <label htmlFor="credit-card" className="ml-3 block text-sm font-medium text-gray-700">
                        Credit Card
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="bank-transfer"
                        name="payment-type"
                        type="radio"
                        checked={paymentMethod.type === 'bank_transfer'}
                        onChange={() => handlePaymentMethodChange('bank_transfer')}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <label htmlFor="bank-transfer" className="ml-3 block text-sm font-medium text-gray-700">
                        Bank Transfer
                      </label>
                    </div>
                  </div>

                  {paymentMethod.type === 'credit_card' && (
                    <div className="mt-6 grid grid-cols-4 gap-y-6 gap-x-4">
                      <div className="col-span-4">
                        <label htmlFor="card-number" className="block text-sm font-medium text-gray-700">
                          Card number
                        </label>
                        <input
                          type="text"
                          id="card-number"
                          name="card-number"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div className="col-span-3">
                        <label htmlFor="expiration-date" className="block text-sm font-medium text-gray-700">
                          Expiration date (MM/YY)
                        </label>
                        <input
                          type="text"
                          id="expiration-date"
                          name="expiration-date"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">
                          CVV
                        </label>
                        <input
                          type="text"
                          id="cvv"
                          name="cvv"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {paymentMethod.type === 'bank_transfer' && (
                    <div className="mt-6 grid grid-cols-1 gap-y-6">
                      <div>
                        <label htmlFor="bank-name" className="block text-sm font-medium text-gray-700">
                          Bank name
                        </label>
                        <input
                          type="text"
                          id="bank-name"
                          name="bank-name"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="account-number" className="block text-sm font-medium text-gray-700">
                          Account number
                        </label>
                        <input
                          type="text"
                          id="account-number"
                          name="account-number"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="mt-10 lg:mt-0 lg:col-span-5">
              <div className="bg-gray-50 rounded-lg px-4 py-6 sm:p-6 lg:p-8">
                <h2 className="text-lg font-medium text-gray-900">Order summary</h2>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">Subtotal</p>
                    <p className="text-sm font-medium text-gray-900">${formatPrice(subtotal)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">Shipping</p>
                    <p className="text-sm font-medium text-gray-900">${formatPrice(shipping)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">Tax</p>
                    <p className="text-sm font-medium text-gray-900">${formatPrice(tax)}</p>
                  </div>
                  <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                    <p className="text-base font-medium text-gray-900">Order total</p>
                    <p className="text-base font-medium text-gray-900">${formatPrice(total)}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full ${
                      isSubmitting 
                        ? 'bg-indigo-400 cursor-not-allowed' 
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    } border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                  >
                    {isSubmitting ? 'Processing...' : 'Confirm Order'}
                  </button>
                </div>

                {(formErrors.shipping || formErrors.payment || formErrors.general) && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">
                      Please fix the following errors before proceeding:
                    </p>
                    <ul className="mt-2 list-disc list-inside text-sm text-red-600">
                      {Object.values(formErrors.shipping || {}).map((error, index) => (
                        <li key={`shipping-${index}`}>{error}</li>
                      ))}
                      {Object.values(formErrors.payment || {}).map((error, index) => (
                        <li key={`payment-${index}`}>{error}</li>
                      ))}
                      {Object.values(formErrors.general || {}).map((error, index) => (
                        <li key={`general-${index}`}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mt-6 text-sm text-center">
                <p className="text-gray-600">
                  or{' '}
                  <Link
                    to="/cart"
                    className="text-indigo-600 font-medium hover:text-indigo-500"
                  >
                    Return to Cart
                    <span aria-hidden="true"> &rarr;</span>
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 