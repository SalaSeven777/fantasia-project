import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { cartService } from '../services/cart.service';
import { CartItem } from '../types';
import { FaLock, FaCheck, FaCreditCard, FaPaypal, FaApplePay } from 'react-icons/fa';
import { orderService } from '../services/order.service';

type PaymentMethod = 'credit_card' | 'paypal' | 'apple_pay';
type DeliveryMethod = 'standard' | 'express' | 'pickup';

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  sameShipping: boolean;
  paymentMethod: PaymentMethod;
  deliveryMethod: DeliveryMethod;
  cardNumber: string;
  cardName: string;
  cardExpiry: string;
  cardCvc: string;
  saveCard: boolean;
}

const CheckoutPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [processingOrder, setProcessingOrder] = useState<boolean>(false);
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const navigate = useNavigate();

  const [formState, setFormState] = useState<FormState>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',

    country: 'Maroc',
    sameShipping: true,
    paymentMethod: 'credit_card',
    deliveryMethod: 'standard',
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvc: '',
    saveCard: false,
  });

  useEffect(() => {
    try {
      // Get cart items from local storage
      const items = cartService.getCart();
      
      if (items.length === 0) {
        // Redirect to cart if no items
        navigate('/cart');
        return;
      }
      
      setCartItems(items);
    } catch (err) {
      console.error('Error loading cart for checkout:', err);
      setError('Failed to load your cart. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    setFormState({
      ...formState,
      [name]: val,
    });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormState({
      ...formState,
      [name]: value,
    });
  };

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setFormState({
      ...formState,
      paymentMethod: method,
    });
  };

  const handleDeliveryMethodChange = (method: DeliveryMethod) => {
    setFormState({
      ...formState,
      deliveryMethod: method,
    });
  };

  const validateForm = (): boolean => {
    // Check required fields
    if (
      !formState.firstName ||
      !formState.lastName ||
      !formState.email ||
      !formState.phone ||
      !formState.address ||
      !formState.city ||
      !formState.state ||
      !formState.zipCode ||
      !formState.country
    ) {
      setError('Please fill in all required fields.');
      return false;
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formState.email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    
    // Validate payment information for credit card
    if (formState.paymentMethod === 'credit_card') {
      if (
        !formState.cardNumber ||
        !formState.cardName ||
        !formState.cardExpiry ||
        !formState.cardCvc
      ) {
        setError('Please fill in all payment details.');
        return false;
      }
      
      // Simple card number validation (16 digits, no spaces)
      if (!/^\d{16}$/.test(formState.cardNumber.replace(/\s/g, ''))) {
        setError('Please enter a valid card number.');
        return false;
      }
      
      // Simple expiry date validation (MM/YY)
      if (!/^\d{2}\/\d{2}$/.test(formState.cardExpiry)) {
        setError('Please enter a valid expiry date (MM/YY).');
        return false;
      }
      
      // Simple CVC validation (3-4 digits)
      if (!/^\d{3,4}$/.test(formState.cardCvc)) {
        setError('Please enter a valid CVC code.');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setProcessingOrder(true);
    
    // Prepare the order data
    const orderData = {
      items: cartItems.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity
      })),
      shipping_address: `${formState.address}, ${formState.city}, ${formState.state} ${formState.zipCode}, ${formState.country}`,
      delivery_notes: `Order placed by ${formState.firstName} ${formState.lastName}. Contact: ${formState.phone}, ${formState.email}. Payment method: ${formState.paymentMethod}. Delivery method: ${formState.deliveryMethod}.`,
      delivery_date: undefined // Leave as undefined to use default scheduling
    };
    
    // Call the order service to create the order
    orderService.createOrder(orderData)
      .then(response => {
        console.log('Order created successfully:', response);
        
        // Clear cart after successful order
        cartService.clearCart();
        
        // Show success message and redirect to confirmation after delay
        setOrderSuccess(true);
        setTimeout(() => {
          navigate('/order-confirmation');
        }, 3000);
      })
      .catch(err => {
        console.error('Error creating order:', err);
        setError('Failed to process your order. Please try again later.');
      })
      .finally(() => {
        setProcessingOrder(false);
      });
  };

  // Calculate totals
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product.finalPrice || item.product.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    
    switch (formState.deliveryMethod) {
      case 'express':
        return 15.00; // Express shipping $15
      case 'pickup':
        return 0; // Free pickup
      case 'standard':
      default:
        return subtotal > 100 ? 0 : 7.99; // Free standard shipping over $100
    }
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.08; // Assuming 8% tax rate
  };

  const calculateDiscount = () => {
    return couponDiscount > 0 ? (calculateSubtotal() * (couponDiscount / 100)) : 0;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping() + calculateTax() - calculateDiscount();
  };

  const formatCurrency = (amount: number) => {
    return amount.toFixed(2);
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading checkout...</span>
        </Spinner>
      </Container>
    );
  }
  
  if (orderSuccess) {
    return (
      <Container className="py-5 checkout-container">
        <Card className="text-center order-success-card">
          <Card.Body className="p-5">
            <div className="success-icon mb-4">
              <FaCheck size={50} />
            </div>
            <h1>Order Placed Successfully!</h1>
            <p className="lead mb-4">Thank you for your purchase.</p>
            <p>We've sent a confirmation email to {formState.email}.</p>
            <p>You will be redirected to the order confirmation page shortly...</p>
            <Spinner animation="border" className="mt-3" />
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-5 checkout-container">
      <h1 className="mb-4">Checkout</h1>
      
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col lg={8}>
            <Card className="mb-4 checkout-card">
              <Card.Header>
                <h4 className="mb-0">Shipping Information</h4>
              </Card.Header>
              <Card.Body>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="firstName">
                      <Form.Label>First Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="firstName"
                        value={formState.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="lastName">
                      <Form.Label>Last Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="lastName"
                        value={formState.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="email">
                      <Form.Label>Email Address *</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formState.email}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="phone">
                      <Form.Label>Phone Number *</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formState.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3" controlId="address">
                  <Form.Label>Address *</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={formState.address}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
                
                <Row className="mb-3">
                  <Col md={5}>
                    <Form.Group controlId="city">
                      <Form.Label>City *</Form.Label>
                      <Form.Control
                        type="text"
                        name="city"
                        value={formState.city}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group controlId="state">
                      <Form.Label>State *</Form.Label>
                      <Form.Control
                        type="text"
                        name="state"
                        value={formState.state}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId="zipCode">
                      <Form.Label>Zip Code *</Form.Label>
                      <Form.Control
                        type="text"
                        name="zipCode"
                        value={formState.zipCode}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3" controlId="country">
                  <Form.Label>Country *</Form.Label>
                  <Form.Select
                    name="country"
                    value={formState.country}
                    onChange={handleSelectChange}
                    required
                  >
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Australia">Australia</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="Maroc">Maroc</option>
                  </Form.Select>
                </Form.Group>
                
                <Form.Check
                  type="checkbox"
                  id="sameShipping"
                  name="sameShipping"
                  label="Billing address is the same as shipping address"
                  checked={formState.sameShipping}
                  onChange={handleInputChange}
                  className="mb-0"
                />
              </Card.Body>
            </Card>
            
            <Card className="mb-4 checkout-card">
              <Card.Header>
                <h4 className="mb-0">Delivery Method</h4>
              </Card.Header>
              <Card.Body>
                <div className="delivery-options">
                  <div 
                    className={`delivery-option ${formState.deliveryMethod === 'standard' ? 'active' : ''}`}
                    onClick={() => handleDeliveryMethodChange('standard')}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5>Standard Shipping   </h5>
                        <p className="mb-0">3-5 business days</p>
                      </div>
                      <div>
                        {calculateSubtotal() > 100 ? (
                          <span className="text-success fw-bold">FREE</span>
                        ) : (
                          <span className="fw-bold">${formatCurrency(7.99)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className={`delivery-option ${formState.deliveryMethod === 'express' ? 'active' : ''}`}
                    onClick={() => handleDeliveryMethodChange('express')}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5>Express Shipping</h5>
                        <p className="mb-0">1-2 business days</p>
                      </div>
                      <div>
                        <span className="fw-bold">${formatCurrency(15.00)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className={`delivery-option ${formState.deliveryMethod === 'pickup' ? 'active' : ''}`}
                    onClick={() => handleDeliveryMethodChange('pickup')}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5>Store Pickup</h5>
                        <p className="mb-0">Pick up in store</p>
                      </div>
                      <div>
                        <span className="text-success fw-bold">FREE</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
            
            <Card className="mb-4 checkout-card">
              <Card.Header>
                <h4 className="mb-0">Payment Method</h4>
              </Card.Header>
              <Card.Body>
                <div className="payment-methods mb-4">
                  <div 
                    className={`payment-method ${formState.paymentMethod === 'credit_card' ? 'active' : ''}`}
                    onClick={() => handlePaymentMethodChange('credit_card')}
                  >
                    <FaCreditCard />
                    <span>Credit Card</span>
                  </div>
                  
                  <div 
                    className={`payment-method ${formState.paymentMethod === 'paypal' ? 'active' : ''}`}
                    onClick={() => handlePaymentMethodChange('paypal')}
                  >
                    <FaPaypal />
                    <span>Aprés Livraison</span>
                  </div>
                  
                  <div 
                    className={`payment-method ${formState.paymentMethod === 'apple_pay' ? 'active' : ''}`}
                    onClick={() => handlePaymentMethodChange('apple_pay')}
                  >
                    <FaApplePay />
                    <span>Apple Pay</span>
                  </div>
                </div>
                
                {formState.paymentMethod === 'credit_card' && (
                  <div className="credit-card-form">
                    <Form.Group className="mb-3" controlId="cardNumber">
                      <Form.Label>Card Number *</Form.Label>
                      <Form.Control
                        type="text"
                        name="cardNumber"
                        value={formState.cardNumber}
                        onChange={handleInputChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        required
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3" controlId="cardName">
                      <Form.Label>Cardholder Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="cardName"
                        value={formState.cardName}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                    
                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Group controlId="cardExpiry">
                          <Form.Label>Expiry Date (MM/YY) *</Form.Label>
                          <Form.Control
                            type="text"
                            name="cardExpiry"
                            value={formState.cardExpiry}
                            onChange={handleInputChange}
                            placeholder="MM/YY"
                            maxLength={5}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group controlId="cardCvc">
                          <Form.Label>CVC *</Form.Label>
                          <Form.Control
                            type="text"
                            name="cardCvc"
                            value={formState.cardCvc}
                            onChange={handleInputChange}
                            placeholder="123"
                            maxLength={4}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Form.Check
                      type="checkbox"
                      id="saveCard"
                      name="saveCard"
                      label="Save card for future purchases"
                      checked={formState.saveCard}
                      onChange={handleInputChange}
                    />
                  </div>
                )}
                
                {formState.paymentMethod === 'paypal' && (
                  <div className="text-center py-4">
                    <p>You will be redirected to PayPal to complete your purchase.</p>
                  </div>
                )}
                
                {formState.paymentMethod === 'apple_pay' && (
                  <div className="text-center py-4">
                    <p>You will complete your purchase with Apple Pay.</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={4}>
            <Card className="order-summary-card sticky-top">
              <Card.Header>
                <h4 className="mb-0">Order Summary</h4>
              </Card.Header>
              <Card.Body>
                <div className="order-items mb-4">
                  {cartItems.map((item) => (
                    <div key={item.product.id} className="order-item d-flex justify-content-between align-items-center mb-3">
                      <div className="d-flex align-items-center">
                        <div className="order-item-image">
                          <img 
                            src={item.product.thumbnail} 
                            alt={item.product.title} 
                            className="img-thumbnail"
                          />
                        </div>
                        <div className="ms-3">
                          <h6 className="mb-0">{item.product.title}</h6>
                          <small className="text-muted">
                            Qty: {item.quantity}
                          </small>
                        </div>
                      </div>
                      <div className="order-item-price">
                        ${formatCurrency((item.product.finalPrice || item.product.price) * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
                
                <hr />
                
                <div className="order-totals">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal</span>
                    <span>${formatCurrency(calculateSubtotal())}</span>
                  </div>
                  
                  {couponDiscount > 0 && (
                    <div className="d-flex justify-content-between mb-2 text-success">
                      <span>Discount ({couponDiscount}%)</span>
                      <span>-${formatCurrency(calculateDiscount())}</span>
                    </div>
                  )}
                  
                  <div className="d-flex justify-content-between mb-2">
                    <span>Shipping</span>
                    <span>
                      {calculateShipping() === 0 ? (
                        <span className="text-success">FREE</span>
                      ) : (
                        `$${formatCurrency(calculateShipping())}`
                      )}
                    </span>
                  </div>
                  
                  <div className="d-flex justify-content-between mb-3">
                    <span>Estimated Tax</span>
                    <span>${formatCurrency(calculateTax())}</span>
                  </div>
                  
                  <hr />
                  
                  <div className="d-flex justify-content-between mb-4 total-row">
                    <h5>Total</h5>
                    <h5>${formatCurrency(calculateTotal())}</h5>
                  </div>
                </div>
                
                <Button 
                  variant="primary" 
                  type="submit" 
                  size="lg" 
                  className="w-100 checkout-button"
                  disabled={processingOrder}
                >
                  {processingOrder ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaLock className="me-2" />
                      Complete Order
                    </>
                  )}
                </Button>
                
                <div className="secure-checkout-note mt-3 text-center">
                  <small>
                    <FaLock className="me-1" />
                    Secure checkout. Your data is protected.
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default CheckoutPage; 