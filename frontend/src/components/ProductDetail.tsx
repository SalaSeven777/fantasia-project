import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaStar, FaStarHalfAlt, FaRegStar, FaShoppingCart } from 'react-icons/fa';
import { toast } from 'react-toastify';
import productService, { ReviewSubmission } from '../services/product.service';
import { Product, ProductReview } from '../types/product.types';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

// Helper function to calculate average rating from reviews
const getAverageRating = (product: Product): number => {
  if (!product.reviews || product.reviews.length === 0) return 0;
  const sum = product.reviews.reduce((total, review) => total + review.rating, 0);
  return sum / product.reviews.length;
};

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProductData = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const productId = parseInt(id);
        const [productData, relatedData] = await Promise.all([
          productService.getProductById(productId),
          productService.getRelatedProducts(productId)
        ]);
        
        // Process product to add computed frontend properties
        const processedProduct = {
          ...productData,
          inStock: productData.stock_quantity > 0,
          rating: getAverageRating(productData),
          reviewCount: productData.reviews?.length || 0
        };
        
        setProduct(processedProduct);
        setRelatedProducts(relatedData.map((p: Product) => ({
          ...p,
          inStock: p.stock_quantity > 0,
          rating: getAverageRating(p)
        })));
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to load product details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductData();
  }, [id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id || !isAuthenticated) return;
    
    const reviewData: ReviewSubmission = {
      rating: reviewRating,
      comment: reviewComment
    };
    
    setSubmittingReview(true);
    
    try {
      const newReview = await productService.submitReview(parseInt(id), reviewData);
      
      // Update the product with the new review
      if (product) {
        const updatedReviews = [...(product.reviews || []), newReview];
        setProduct({
          ...product,
          reviews: updatedReviews,
          rating: updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length
        });
      }
      
      setReviewComment('');
      toast.success('Review submitted successfully!');
    } catch (err) {
      console.error('Error submitting review:', err);
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product || !isAuthenticated) {
      toast.error('Please log in to add items to your cart');
      return;
    }
    
    try {
      await productService.addToCart(product.id, quantity);
      toast.success(`Added ${quantity} ${product.name} to your cart!`);
    } catch (error) {
      toast.error('Failed to add product to cart. Please try again.');
    }
  };

  const renderRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-warning" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-warning" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-warning" />);
      }
    }
    
    return stars;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !product) {
    return <ErrorMessage message={error || 'Product not found'} />;
  }

  return (
    <div className="container my-4">
      <div className="row">
        <div className="col-md-5">
          <img 
            src={product.image || '/placeholder-image.jpg'} 
            alt={product.name} 
            className="img-fluid product-image rounded"
          />
          {product.additional_images && product.additional_images.length > 0 && (
            <div className="row mt-2">
              {product.additional_images.map(img => (
                <div key={img.id} className="col-3">
                  <img
                    src={img.image}
                    alt={product.name}
                    className="img-fluid thumbnail"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="col-md-7">
          <h1 className="product-title">{product.name}</h1>
          
          <div className="d-flex align-items-center mb-3">
            <div className="me-2">
              {renderRatingStars(product.rating || 0)}
            </div>
            <span>({(product.rating || 0).toFixed(1)})</span>
            {product.reviewCount && (
              <span className="ms-1 text-muted">from {product.reviewCount} reviews</span>
            )}
          </div>
          
          <div className="mb-3">
            {product.discount ? (
              <>
                <span className="text-muted text-decoration-line-through me-2">
                  ${product.price.toFixed(2)}
                </span>
                <span className="fs-4 fw-bold text-danger">
                  ${product.finalPrice?.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="fs-4 fw-bold">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>
          
          <div className="mb-3">
            <span className={`badge ${product.inStock ? 'bg-success' : 'bg-danger'}`}>
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </span>
            <span className="ms-2 badge bg-info">{product.category_name}</span>
            <span className="ms-2 badge bg-secondary">{product.panel_type_display}</span>
          </div>
          
          <p className="mb-4">{product.description}</p>
          
          {product.technical_specs && Object.keys(product.technical_specs).length > 0 && (
            <div className="mb-4">
              <h5>Specifications:</h5>
              <ul className="list-group">
                {Object.entries(product.technical_specs).map(([key, value]) => (
                  <li key={key} className="list-group-item">
                    <strong>{key}:</strong> {value}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {product.inStock && (
            <div className="d-flex align-items-center mb-4">
              <div className="input-group me-3" style={{ width: "120px" }}>
                <button 
                  className="btn btn-outline-secondary" 
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >-</button>
                <input 
                  type="number" 
                  className="form-control text-center" 
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                />
                <button 
                  className="btn btn-outline-secondary" 
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                >+</button>
              </div>
              
              <button 
                className="btn btn-primary d-flex align-items-center btn-add-to-cart"
                onClick={handleAddToCart}
                disabled={!product.inStock}
                style={{
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  padding: '12px 20px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  width: '100%'
                }}
              >
                <FaShoppingCart className="me-2" />
                Add to Cart
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Reviews Section */}
      <div className="row mt-5">
        <div className="col-12">
          <h3 className="border-bottom pb-2">Customer Reviews</h3>
          
          {isAuthenticated ? (
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Write a Review</h5>
                <form onSubmit={handleReviewSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Rating</label>
                    <div>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span 
                          key={star}
                          className="fs-4 cursor-pointer me-1"
                          onClick={() => setReviewRating(star)}
                          style={{ cursor: 'pointer' }}
                        >
                          {star <= reviewRating ? (
                            <FaStar className="text-warning" />
                          ) : (
                            <FaRegStar className="text-warning" />
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="reviewComment" className="form-label">Your Review</label>
                    <textarea
                      id="reviewComment"
                      className="form-control"
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={submittingReview}
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="alert alert-info">
              Please <Link to="/login">log in</Link> to write a review.
            </div>
          )}
          
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map((review) => (
              <div key={review.id} className="card mb-3">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="card-title mb-0">{review.user_username}</h5>
                    <div className="d-flex align-items-center">
                      {renderRatingStars(review.rating)}
                    </div>
                  </div>
                  <p className="card-text">{review.comment}</p>
                  <div className="text-muted small">
                    {new Date(review.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="alert alert-light">
              No reviews yet. Be the first to review this product!
            </div>
          )}
        </div>
      </div>
      
      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="row mt-5">
          <div className="col-12">
            <h3 className="border-bottom pb-2 mb-4">Related Products</h3>
            <div className="row">
              {relatedProducts.map((relProduct) => (
                <div key={relProduct.id} className="col-lg-3 col-md-6 mb-4">
                  <Link to={`/products/${relProduct.id}`} className="text-decoration-none text-dark">
                    <div className="card h-100">
                      <img 
                        src={relProduct.image || '/placeholder-image.jpg'} 
                        alt={relProduct.name} 
                        className="card-img-top"
                      />
                      <div className="card-body">
                        <h5 className="card-title text-truncate">{relProduct.name}</h5>
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center">
                            <FaStar className="text-warning me-1" />
                            <span>{(relProduct.rating || 0).toFixed(1)}</span>
                          </div>
                          <span className="fw-bold">
                            ${relProduct.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail; 