import React, { useEffect, useState, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Form, Pagination } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { Product, Category } from '../types/product.types';
import { ProductService } from '../services/product.service';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>('');

  const navigate = useNavigate();
  const location = useLocation();
  const productService = new ProductService();

  const loadCategories = useCallback(async () => {
    try {
      // Only load categories if not already loaded
      if (categories.length === 0) {
        const categoriesData = await productService.getCategories();
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError('Failed to load categories. Please try again later.');
      setCategories([]);
    }
  }, [categories.length]);

  const loadProducts = useCallback(async (
    page: number = 1,
    categoryId?: number,
    query: string = '',
    sort: string = ''
  ) => {
    if (loading) return; // Prevent concurrent requests
    
    setLoading(true);
    setError(null);
    
    try {
      const { products: productsData, totalPages: pages } = await productService.getProducts(
        page, 
        categoryId,
        query,
        sort
      );
      
      setProducts(Array.isArray(productsData) ? productsData : []);
      setTotalPages(pages);
    } catch (err) {
      console.error('Failed to load products:', err);
      setError('Failed to load products. Please try again later.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    // Parse query parameters
    const queryParams = new URLSearchParams(location.search);
    const pageParam = queryParams.get('page');
    const categoryParam = queryParams.get('category');
    const searchParam = queryParams.get('search');
    const sortParam = queryParams.get('sort');

    if (pageParam) setCurrentPage(parseInt(pageParam));
    if (categoryParam) setSelectedCategory(parseInt(categoryParam));
    if (searchParam) setSearchQuery(searchParam);
    if (sortParam) setSortBy(sortParam);

    // Load categories
    loadCategories();
    
    // Load products with the parsed parameters
    loadProducts(
      pageParam ? parseInt(pageParam) : 1,
      categoryParam ? parseInt(categoryParam) : undefined,
      searchParam || '',
      sortParam || ''
    );
  }, [location.search, productService, loadCategories, loadProducts]);

  const handlePageChange = (page: number) => {
    updateQueryParams({ page });
  };

  const handleCategoryChange = (categoryId: number | undefined) => {
    updateQueryParams({ category: categoryId, page: 1 });
  };

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    // Debounce search to prevent excessive API calls
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    searchTimeout.current = setTimeout(() => {
      updateQueryParams({ search: searchQuery, page: 1 });
    }, 500);
  }, [searchQuery]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateQueryParams({ sort: e.target.value, page: 1 });
  };

  const updateQueryParams = (params: Record<string, any>) => {
    const queryParams = new URLSearchParams(location.search);
    
    // Update the query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.set(key, String(value));
      } else {
        queryParams.delete(key);
      }
    });
    
    // Navigate to the new URL with updated query parameters
    navigate({
      pathname: location.pathname,
      search: queryParams.toString()
    });
  };

  const renderPagination = () => {
    const items = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    // Previous button
    items.push(
      <Pagination.Prev 
        key="prev" 
        disabled={currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
      />
    );
    
    // First page
    if (startPage > 1) {
      items.push(
        <Pagination.Item key={1} onClick={() => handlePageChange(1)}>
          1
        </Pagination.Item>
      );
      if (startPage > 2) items.push(<Pagination.Ellipsis key="ellipsis1" />);
    }
    
    // Page numbers
    for (let page = startPage; page <= endPage; page++) {
      items.push(
        <Pagination.Item 
          key={page} 
          active={page === currentPage}
          onClick={() => handlePageChange(page)}
        >
          {page}
        </Pagination.Item>
      );
    }
    
    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) items.push(<Pagination.Ellipsis key="ellipsis2" />);
      items.push(
        <Pagination.Item key={totalPages} onClick={() => handlePageChange(totalPages)}>
          {totalPages}
        </Pagination.Item>
      );
    }
    
    // Next button
    items.push(
      <Pagination.Next 
        key="next" 
        disabled={currentPage === totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
      />
    );
    
    return <Pagination>{items}</Pagination>;
  };

  const formatPrice = (price: string | number): string => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return !isNaN(numericPrice) ? numericPrice.toFixed(2) : '0.00';
  };

  // Add search timeout ref
  const searchTimeout = React.useRef<NodeJS.Timeout>();

  return (
    <Container className="py-4">
      <h1 className="mb-4">Products</h1>
      
      <Row className="mb-4">
        <Col md={3}>
          <h4>Categories</h4>
          <div className="list-group">
            <Button 
              variant="link" 
              className={`list-group-item list-group-item-action ${!selectedCategory ? 'active' : ''}`}
              onClick={() => handleCategoryChange(undefined)}
            >
              All Categories
            </Button>
            {Array.isArray(categories) && categories.map(category => (
              <Button 
                key={category.id}
                variant="link" 
                className={`list-group-item list-group-item-action ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => handleCategoryChange(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
          
          <h4 className="mt-4">Filter</h4>
          <Form onSubmit={handleSearchSubmit}>
            <Form.Group className="mb-3">
              <Form.Control 
                type="text" 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Form.Group>
            <Button variant="primary" type="submit">Search</Button>
          </Form>
          
          <h4 className="mt-4">Sort By</h4>
          <Form.Select 
            value={sortBy} 
            onChange={handleSortChange}
            className="mb-3"
          >
            <option value="">Default</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A-Z</option>
            <option value="name_desc">Name: Z-A</option>
            <option value="created_desc">Newest</option>
          </Form.Select>
        </Col>
        
        <Col md={9}>
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <ErrorMessage message={error} />
          ) : (
            <>
              <Row xs={1} md={2} lg={3} className="g-4">
                {products.length > 0 ? (
                  products.map(product => (
                    <Col key={product.id}>
                      <Card className="h-100">
                        <Card.Img 
                          variant="top" 
                          src={product.image || '/placeholder.png'} 
                          alt={product.name}
                          style={{ height: '200px', objectFit: 'cover' }}
                        />
                        <Card.Body className="d-flex flex-column">
                          <Card.Title>{product.name}</Card.Title>
                          <Card.Text className="text-truncate">{product.description}</Card.Text>
                          <div className="mt-auto">
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="fw-bold">${formatPrice(product.price)}</span>
                              <div>
                                <span className="me-1">⭐ {product.rating ? product.rating.toFixed(1) : 'N/A'}</span>
                                <span className="text-muted">({product.reviewCount || 0})</span>
                              </div>
                            </div>
                            <div className="d-flex justify-content-between mt-2">
                              <Button 
                                variant="outline-primary" 
                                size="sm"
                                onClick={() => navigate(`/products/${product.id}`)}
                              >
                                View Details
                              </Button>
                              <Button variant="primary" size="sm">Add to Cart</Button>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))
                ) : (
                  <Col xs={12}>
                    <div className="text-center py-5">
                      <h4>No products found</h4>
                      <p>Try adjusting your search or filter criteria</p>
                    </div>
                  </Col>
                )}
              </Row>
              
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  {renderPagination()}
                </div>
              )}
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ProductsPage; 