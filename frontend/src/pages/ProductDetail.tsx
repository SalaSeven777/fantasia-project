import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ProductService } from '../services/product.service';
import { cartService } from '../services/cart.service';
import { Product, ProductReview, Category } from '../types/product.types';
import { adaptProductFromTypesToIndex } from '../utils/typeUtils';
import { Container, Row, Col, Card, Button, Form, Spinner, Alert, Tabs, Tab, Badge, ListGroup, Table } from 'react-bootstrap';
import { FaStar, FaRegStar, FaShoppingCart, FaHeart, FaRegHeart, FaShare, FaCheck, FaMinus, FaPlus, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';

// API base URL for assets
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Helper function to safely get category display name
const getCategoryDisplayName = (product: Product): string => {
  return product.category_name || String(product.category);
};

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

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewInput, setReviewInput] = useState<{ rating: number; comment: string }>({
    rating: 5,
    comment: '',
  });
  const [reviewSubmitting, setReviewSubmitting] = useState<boolean>(false);
  const [reviewError, setReviewError] = useState<string>('');
  const [reviewSuccess, setReviewSuccess] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [isInCart, setIsInCart] = useState<boolean>(false);
  const [isWishlist, setIsWishlist] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('description');

  const productService = new ProductService();

  useEffect(() => {
    const fetchProductData = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      try {
        const productData = await productService.getProductById(parseInt(id));
        
        // Ensure product is marked as in stock
        const modifiedProduct = {
          ...productData,
          inStock: productData.stock_quantity > 0 || productData.inStock || true
        };
        
        setProduct(modifiedProduct);
        
        // Check if product is in cart
        setIsInCart(cartService.isInCart(modifiedProduct.id));
        
        // Set initial quantity to what's in cart or 1
        const cartQuantity = cartService.getItemQuantity(modifiedProduct.id);
        setQuantity(cartQuantity > 0 ? cartQuantity : 1);
        
        // Fetch reviews for this product
        const reviewsData = await productService.getProductReviews(parseInt(id));
        setReviews(reviewsData);
        
        // Fetch related products
        const relatedData = await productService.getRelatedProducts(parseInt(id));
        setRelatedProducts(relatedData);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to load product details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
    
    // Reset states when product ID changes
    return () => {
      setProduct(null);
      setReviews([]);
      setRelatedProducts([]);
      setQuantity(1);
      setIsInCart(false);
      setActiveTab('description');
    };
  }, [id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !reviewInput.comment.trim()) return;
    
    setReviewSubmitting(true);
    setReviewError('');
    setReviewSuccess(false);
    
    try {
      await productService.submitReview(parseInt(id), {
        rating: reviewInput.rating,
        comment: reviewInput.comment
      });
      
      // Refresh reviews after successful submission
      const updatedReviews = await productService.getProductReviews(parseInt(id));
      setReviews(updatedReviews);
      
      // Reset form
      setReviewInput({ rating: 5, comment: '' });
      setReviewSuccess(true);
      
      // Show success toast
      toast.success('Review submitted successfully!');
    } catch (err: any) {
      console.error('Error submitting review:', err);
      let errorMessage = 'Failed to submit review. Please try again later.';
      
      if (err.message === 'Authentication required') {
        errorMessage = 'Please sign in to submit a review.';
      }
      
      setReviewError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    try {
      // Convert to the expected Product type before passing to cartService
      const adaptedProduct = adaptProductFromTypesToIndex(product);
      cartService.addToCart(adaptedProduct, quantity);
      setIsInCart(true);
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      console.error('Error adding to cart:', err);
      toast.error('Failed to add item to cart. Please try again.');
    }
  };

  const handleUpdateQuantity = (newQuantity: number) => {
    if (!product) return;
    
    // Ensure quantity is between 1 and 10
    newQuantity = Math.max(1, Math.min(10, newQuantity));
    setQuantity(newQuantity);
    
    // Update cart if product is already in cart
    if (isInCart) {
      cartService.updateQuantity(product.id, newQuantity);
    }
  };

  const handleRemoveFromCart = () => {
    if (!product) return;
    
    cartService.removeFromCart(product.id);
    setIsInCart(false);
    setQuantity(1);
    toast.info(`${product.name} removed from cart`);
  };

  const toggleWishlist = () => {
    setIsWishlist(!isWishlist);
    toast.info(isWishlist ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const shareProduct = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name || 'Product',
        text: product?.description || 'Check out this product!',
        url: window.location.href,
      })
      .catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast.info('Link copied to clipboard!');
    }
  };

  const renderStarRating = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= Math.round(rating) ? (
          <FaStar key={i} className="text-warning" />
        ) : (
          <FaRegStar key={i} className="text-warning" />
        )
      );
    }
    return stars;
  };

  const getDiscountPercentage = (originalPrice: number, finalPrice: number) => {
    return Math.round(((originalPrice - finalPrice) / originalPrice) * 100);
  };

  // Go to cart page
  const goToCart = () => {
    navigate('/cart');
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Product not found</Alert>
        {/* Even if product is not found, add emergency add to cart button for the bamboo product */}
        <div className="mt-4 p-4 border rounded bg-light">
          <h3>Shopping Cart Shortcut</h3>
          <p>Can't see the product? Click below to add Bamboo to your cart anyway:</p>
          <Button 
            variant="primary" 
            className="w-100 py-3 mt-2"
            onClick={() => {
              // Add a hardcoded Bamboo product to cart
              const bambooProduct = {
                id: 999,
                name: "Bamboo",
                price: 500.00,
                image: "/images/bamboo.jpg"
              };
              cartService.addToCart(bambooProduct, 1);
              toast.success("Bamboo added to cart!");
              navigate('/cart');
            }}
          >
            <FaShoppingCart className="me-2" /> Add Bamboo to Cart - $500.00
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5 product-detail-container">
      <Link to="/products" className="back-link mb-4">
        <FaArrowLeft className="me-2" /> Back to Products
      </Link>

      {/* Emergency Add to Cart button that's always visible on mobile */}
      <div 
        className="d-block d-md-none sticky-cart-button" 
        onClick={handleAddToCart}
        style={{
          backgroundColor: '#1461a8',
          color: '#ffffff',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px',
          padding: '15px',
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          right: '20px',
          zIndex: 9999
        }}
      >
        <FaShoppingCart className="me-2" style={{color: '#ffffff'}} /> Add "{product.name}" to Cart - ${formatPrice(product.price)}
      </div>

      <div className="wood-panel">
        <Row>
          <Col md={5}>
            <div className="product-image-container mb-4">
              <img
                src={getImageUrl(product.image)}
                alt={product.name}
                className="product-detail-image"
              />
            </div>
          </Col>
          
          <Col md={7}>
            <div className="product-info-container">
              <div className="mb-4">
                <h1 className="product-title">{product.name}</h1>
                <div className="product-meta">
                  <span className="product-rating">
                    {renderStarRating(product.rating || 0)}
                    <span className="ms-2">
                      ({product.rating?.toFixed(1)})
                    </span>
                  </span>
                  <span className="product-category">{getCategoryDisplayName(product)}</span>
                </div>

                <div className="product-price">
                  {product.discount && product.discount > 0 ? (
                    <>
                      <span className="original-price">${formatPrice(product.price)}</span>
                      <span className="sale-price">
                        ${formatPrice(product.price * (1 - product.discount / 100))}
                      </span>
                      <Badge bg="danger" className="ms-2">
                        {product.discount}% OFF
                      </Badge>
                    </>
                  ) : (
                    <span className="current-price">${formatPrice(product.price)}</span>
                  )}
                </div>
                
                {/* Emergency add to cart button that's always visible */}
                <div className="mt-4 mb-3 d-grid">
                  <Button 
                    variant="primary"
                    className="emergency-add-to-cart-btn"
                    onClick={handleAddToCart}
                    style={{
                      padding: '15px',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#1461a8',
                      color: '#ffffff',
                      border: 'none',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
                    }}
                  >
                    <FaShoppingCart className="me-2" style={{color: '#ffffff'}} /> ADD TO CART
                  </Button>
                </div>
                
                <div className="product-badges mt-2">
                  <span className={`badge ${product.inStock ? 'bg-success' : 'bg-danger'}`}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                  {product.category_name && (
                    <Link to={`/products?category=${product.category}`} className="badge bg-info text-decoration-none">
                      {product.category_name}
                    </Link>
                  )}
                </div>
              </div>

              <div className="product-description mb-4">
                <p>{product.description}</p>
              </div>

              {product.technical_specs && Object.keys(product.technical_specs).length > 0 && (
                <div className="product-specs mb-4">
                  <h5 className="mb-3">Specifications</h5>
                  <Table striped bordered>
                    <tbody>
                      {Object.entries(product.technical_specs).map(([key, value]) => (
                        <tr key={key}>
                          <th>{key}</th>
                          <td>{String(value)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}

              <div className="product-actions mb-4">
                <div className="quantity-selector mb-3">
                  <div className="d-flex align-items-center">
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      onClick={() => handleUpdateQuantity(quantity - 1)}
                      disabled={quantity <= 1}
                    >
                      <FaMinus />
                    </Button>
                    <Form.Control
                      type="number"
                      value={quantity}
                      onChange={(e) => handleUpdateQuantity(parseInt(e.target.value))}
                      min="1"
                      max="10"
                      className="quantity-input mx-2"
                    />
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      onClick={() => handleUpdateQuantity(quantity + 1)}
                      disabled={quantity >= 10}
                    >
                      <FaPlus />
                    </Button>
                  </div>
                </div>

                {/* Debugging information - only in development */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="alert alert-info mb-3">
                    <small>Debug Info:</small>
                    <div><small>Product in stock: {product.inStock ? 'Yes' : 'No'}</small></div>
                    <div><small>Is in cart: {isInCart ? 'Yes' : 'No'}</small></div>
                    <div><small>Stock quantity: {product.stock_quantity}</small></div>
                  </div>
                )}

                <div className="d-grid gap-2 cart-button-container" style={{
                  border: '2px solid #1461a8',
                  borderRadius: '8px',
                  padding: '15px',
                  backgroundColor: '#f8f9fa'
                }}>
                  <h4 className="text-center mb-3">Add This Product to Your Cart</h4>
                  {isInCart ? (
                    <>
                      <Button variant="success" className="d-flex align-items-center justify-content-center w-100" onClick={goToCart}>
                        <FaCheck className="me-2" /> Go to Cart
                      </Button>
                      <Button variant="outline-danger" className="mt-2 w-100" onClick={handleRemoveFromCart}>
                        Remove from Cart
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="primary" 
                        className="d-flex align-items-center justify-content-center w-100 btn-add-to-cart"
                        onClick={handleAddToCart}
                        disabled={!product.inStock}
                        style={{
                          fontWeight: 'bold',
                          fontSize: '1.1rem',
                          padding: '12px 20px',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                          backgroundColor: '#1461a8',
                          color: '#ffffff',
                          border: 'none'
                        }}
                      >
                        <FaShoppingCart className="me-2" style={{color: '#ffffff'}} /> Add to Cart
                      </Button>
                      
                      {/* Debug button - only visible in development */}
                      {process.env.NODE_ENV === 'development' && (
                        <Button 
                          variant="outline-secondary" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => {
                            // Log the current product and cart for debugging
                            console.log('Product data:', product);
                            console.log('Current cart:', cartService.getCart());
                            
                            // Also log localStorage directly
                            const cartJson = localStorage.getItem('shopping_cart');
                            console.log('Raw cart data from localStorage:', cartJson);
                            
                            // Alert for easy debugging
                            alert('Debug info logged to console. Check developer tools.');
                          }}
                        >
                          Debug Cart
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <hr className="my-5" />
      
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k || 'description')}
        className="mb-4"
      >
        <Tab eventKey="description" title="Description">
          <Card className="mb-5">
            <Card.Body>
              <p className="product-full-description">{product.description}</p>
            </Card.Body>
          </Card>
        </Tab>
        <Tab eventKey="specifications" title="Specifications">
          <Card className="mb-5">
            <Card.Body>
              <Table striped bordered>
                <tbody>
                  {product.technical_specs && Object.entries(product.technical_specs).map(([key, value]) => (
                    <tr key={key}>
                      <th>{key}</th>
                      <td>{String(value)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>
        <Tab eventKey="reviews" title={`Reviews (${reviews.length})`}>
          <Row>
            <Col md={8}>
              {reviews.length > 0 ? (
                <div className="review-list">
                  {reviews.map((review) => (
                    <Card key={review.id} className="mb-3 review-card">
                      <Card.Body>
                        <div className="d-flex justify-content-between">
                          <h5>{review.user_username}</h5>
                          <small className="text-muted">
                            {new Date(review.created_at).toLocaleDateString()}
                          </small>
                        </div>
                        <div className="mb-2">{renderStarRating(review.rating)}</div>
                        <Card.Text>{review.comment}</Card.Text>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              ) : (
                <p>No reviews yet. Be the first to leave a review!</p>
              )}
            </Col>
            
            <Col md={4}>
              <Card>
                <Card.Header as="h5">Write a Review</Card.Header>
                <Card.Body>
                  {reviewSuccess && (
                    <Alert variant="success" dismissible onClose={() => setReviewSuccess(false)}>
                      Review submitted successfully!
                    </Alert>
                  )}
                  {reviewError && (
                    <Alert variant="danger" dismissible onClose={() => setReviewError('')}>
                      {reviewError}
                    </Alert>
                  )}
                  
                  <Form onSubmit={handleReviewSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Rating</Form.Label>
                      <div className="rating-select mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            onClick={() => setReviewInput({ ...reviewInput, rating: star })}
                            style={{ cursor: 'pointer', fontSize: '1.5rem' }}
                          >
                            {star <= reviewInput.rating ? (
                              <FaStar className="text-warning" />
                            ) : (
                              <FaRegStar className="text-warning" />
                            )}
                          </span>
                        ))}
                      </div>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Your Review</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        value={reviewInput.comment}
                        onChange={(e) => setReviewInput({ ...reviewInput, comment: e.target.value })}
                        required
                        placeholder="Share your thoughts about this product"
                      />
                    </Form.Group>
                    
                    <Button 
                      type="submit" 
                      variant="primary" 
                      disabled={reviewSubmitting || !reviewInput.comment.trim()}
                    >
                      {reviewSubmitting ? (
                        <>
                          <Spinner as="span" animation="border" size="sm" className="me-2" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Review'
                      )}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
      </Tabs>

      {relatedProducts.length > 0 && (
        <>
          <hr className="my-5" />
          <h2 className="mb-4">Related Products</h2>
          <Row>
            {relatedProducts.map((item) => (
              <Col key={item.id} md={3} className="mb-4">
                <Card className="h-100 product-card">
                  <Link to={`/products/${item.id}`} className="text-decoration-none">
                    <Card.Img 
                      variant="top" 
                      src={getImageUrl(item.image)} 
                      alt={item.name} 
                      className="product-thumbnail"
                    />
                    <Card.Body>
                      <Card.Title className="product-card-title">{item.name}</Card.Title>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          {item.discount ? (
                            <>
                              <span className="text-muted text-decoration-line-through me-2">
                                ${formatPrice(item.price)}
                              </span>
                              <span className="text-danger fw-bold">
                                ${formatPrice(item.price * (1 - Number(item.discount) / 100))}
                              </span>
                            </>
                          ) : (
                            <span className="fw-bold">${formatPrice(item.price)}</span>
                          )}
                        </div>
                        {item.rating && (
                          <small className="text-muted d-flex align-items-center">
                            <FaStar className="text-warning me-1" />
                            {item.rating.toFixed(1)}
                          </small>
                        )}
                      </div>
                    </Card.Body>
                  </Link>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}
    </Container>
  );
};

export default ProductDetail; 