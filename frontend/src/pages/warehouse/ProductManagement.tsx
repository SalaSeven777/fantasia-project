import React, { useState, useEffect } from 'react';
import { productService } from '../../services/product.service';
import { Product, Category } from '../../types/product.types';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

// Define form data interfaces
interface ProductFormData {
  id?: number;
  name: string;
  description: string;
  category: number;
  price: number;
  stock_quantity: number;
  min_stock_threshold: number;
  panel_type: string;
  technical_specs: Record<string, any>;
  is_active: boolean;
}

interface CategoryFormData {
  id?: number;
  name: string;
  description: string;
}

const initialProductForm: ProductFormData = {
  name: '',
  description: '',
  category: 0,
  price: 0,
  stock_quantity: 0,
  min_stock_threshold: 10,
  panel_type: 'LP',
  technical_specs: {},
  is_active: true
};

const initialCategoryForm: CategoryFormData = {
  name: '',
  description: ''
};

const ProductManagement: React.FC = () => {
  // Product state
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productFormData, setProductFormData] = useState<ProductFormData>(initialProductForm);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(false);
  
  // Image upload state
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [mediaImages, setMediaImages] = useState<File[]>([]);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([]);
  const [mediaImagePreviews, setMediaImagePreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  
  // Category state
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryFormData, setCategoryFormData] = useState<CategoryFormData>(initialCategoryForm);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(false);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<number | 'all'>('all');
  
  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);
  
  // Filter products when search term, filter category, or products list changes
  useEffect(() => {
    filterProducts();
  }, [searchTerm, filterCategory, products]);
  
  // Load product and category data
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load categories first
      const categoriesData = await productService.getCategories();
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      
      // Then load products
      const productsData = await productService.getProducts();
      setProducts(productsData.products || []);
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load products and categories. Please try again.');
      setLoading(false);
    }
  };
  
  // Filter products based on search term and category
  const filterProducts = () => {
    let filtered = [...products];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(product => {
        if (typeof product.category === 'object') {
          return product.category.id === filterCategory;
        }
        return product.category === filterCategory;
      });
    }
    
    setFilteredProducts(filtered);
  };
  
  // Product form handlers
  const handleProductFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle numeric values
    if (type === 'number') {
      setProductFormData({
        ...productFormData,
        [name]: parseFloat(value)
      });
    } else {
      setProductFormData({
        ...productFormData,
        [name]: value
      });
    }
  };
  
  const handleProductCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setProductFormData({
      ...productFormData,
      [name]: checked
    });
  };
  
  const handleProductFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setUploadingImages(true);
      
      let productId: number;
      
      if (editingProduct) {
        // Update existing product
        await productService.updateProduct(productFormData.id!, {
          name: productFormData.name,
          description: productFormData.description,
          category: String(productFormData.category),
          price: productFormData.price,
          stock: productFormData.stock_quantity,
          specifications: productFormData.technical_specs
        });
        
        productId = productFormData.id!;
        setSuccessMessage('Product updated successfully!');
      } else {
        // Create new product
        const newProduct = await productService.createProduct({
          name: productFormData.name,
          description: productFormData.description,
          category: String(productFormData.category),
          price: productFormData.price,
          stock: productFormData.stock_quantity,
          materials: [],
          specifications: productFormData.technical_specs
        });
        
        productId = newProduct.id;
        setSuccessMessage('Product created successfully!');
      }
      
      // Upload main image if selected
      if (mainImage) {
        try {
          await productService.uploadProductImage(productId, mainImage);
          console.log('Main product image uploaded successfully');
        } catch (imageError) {
          console.error('Error uploading main product image:', imageError);
          setError('Product saved but error uploading main image. Please try again.');
        }
      }
      
      // Upload additional images if selected
      if (additionalImages.length > 0) {
        try {
          const uploadPromises = additionalImages.map(image => 
            productService.uploadProductImage(productId, image)
          );
          await Promise.all(uploadPromises);
          console.log('Additional product images uploaded successfully');
        } catch (imageError) {
          console.error('Error uploading additional product images:', imageError);
          setError('Product saved but error uploading some additional images. Please try again.');
        }
      }
      
      // Upload media images if selected
      if (mediaImages.length > 0) {
        try {
          // For media images, we'll use a different API endpoint or parameter
          // This example assumes your API supports a 'type' parameter to differentiate 
          // between product images and media images
          const uploadMediaPromises = mediaImages.map(image => 
            productService.uploadProductImage(productId, image, 'media')
          );
          await Promise.all(uploadMediaPromises);
          console.log('Media images uploaded successfully');
        } catch (mediaError) {
          console.error('Error uploading media images:', mediaError);
          setError('Product saved but error uploading some media images. Please try again.');
        }
      }
      
      // Reset form and reload data
      setProductFormData(initialProductForm);
      setShowProductForm(false);
      setEditingProduct(false);
      resetImageState();
      loadData();
    } catch (err) {
      console.error('Error saving product:', err);
      setError(`Failed to ${editingProduct ? 'update' : 'create'} product. Please try again.`);
    } finally {
      setLoading(false);
      setUploadingImages(false);
    }
  };
  
  const handleEditProduct = (product: Product) => {
    const formData: ProductFormData = {
      id: product.id,
      name: product.name,
      description: product.description,
      category: typeof product.category === 'object' ? product.category.id : product.category,
      price: product.price,
      stock_quantity: product.stock_quantity,
      min_stock_threshold: product.min_stock_threshold,
      panel_type: product.panel_type,
      technical_specs: product.technical_specs,
      is_active: product.is_active
    };
    
    setProductFormData(formData);
    
    // Reset image state before setting up for editing
    resetImageState();
    
    // Show existing main image if available
    if (product.image) {
      // Create a preview from the existing URL
      setMainImagePreview(product.image);
    }
    
    // Show existing additional images if available
    if (product.additional_images && product.additional_images.length > 0) {
      const previews = product.additional_images.map(img => img.image);
      setAdditionalImagePreviews(previews);
    }
    
    // Show existing media images if available
    if (product.media_images && product.media_images.length > 0) {
      const previews = product.media_images.map(img => img.image);
      setMediaImagePreviews(previews);
    }
    
    setEditingProduct(true);
    setShowProductForm(true);
  };
  
  const handleDeleteProduct = async (productId: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    try {
      setLoading(true);
      await productService.deleteProduct(productId);
      setSuccessMessage('Product deleted successfully!');
      loadData();
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Failed to delete product. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Category form handlers
  const handleCategoryFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCategoryFormData({
      ...categoryFormData,
      [name]: value
    });
  };
  
  const handleCategoryFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (editingCategory) {
        // Update existing category
        await productService.updateCategory(categoryFormData.id!, categoryFormData);
        setSuccessMessage('Category updated successfully!');
      } else {
        // Create new category
        await productService.createCategory(categoryFormData);
        setSuccessMessage('Category created successfully!');
      }
      
      // Reset form and reload data
      setCategoryFormData(initialCategoryForm);
      setShowCategoryForm(false);
      setEditingCategory(false);
      loadData();
    } catch (err) {
      console.error('Error saving category:', err);
      setError(`Failed to ${editingCategory ? 'update' : 'create'} category. Please try again.`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditCategory = (category: Category) => {
    setCategoryFormData({
      id: category.id,
      name: category.name,
      description: category.description || ''
    });
    setEditingCategory(true);
    setShowCategoryForm(true);
  };
  
  const handleDeleteCategory = async (categoryId: number) => {
    if (!window.confirm('Are you sure you want to delete this category? All products in this category will also be deleted!')) {
      return;
    }
    
    try {
      setLoading(true);
      await productService.deleteCategory(categoryId);
      setSuccessMessage('Category deleted successfully!');
      loadData();
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Failed to delete category. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Helper for formatting currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Get category name by id
  const getCategoryName = (categoryId: number | Category): string => {
    if (typeof categoryId === 'object') {
      return categoryId.name;
    }
    
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  };
  
  // Clear messages after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [successMessage]);
  
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error]);
  
  // Clean up image preview URLs when component unmounts
  useEffect(() => {
    return () => {
      cleanupPreviews();
    };
  }, []);
  
  // Handler for main image upload
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMainImage(file);
      
      // Create preview URL for display
      const previewUrl = URL.createObjectURL(file);
      setMainImagePreview(previewUrl);
    }
  };
  
  // Handler for additional images upload
  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileList = Array.from(e.target.files);
      setAdditionalImages([...additionalImages, ...fileList]);
      
      // Create preview URLs for display
      const newPreviews = fileList.map(file => URL.createObjectURL(file));
      setAdditionalImagePreviews([...additionalImagePreviews, ...newPreviews]);
    }
  };
  
  // Remove an additional image
  const removeAdditionalImage = (index: number) => {
    setAdditionalImages(additionalImages.filter((_, i) => i !== index));
    
    // Also remove the preview and revoke the object URL to prevent memory leaks
    const previewToRemove = additionalImagePreviews[index];
    URL.revokeObjectURL(previewToRemove);
    setAdditionalImagePreviews(additionalImagePreviews.filter((_, i) => i !== index));
  };
  
  // Clean up preview URLs when component unmounts or form is closed
  const cleanupPreviews = () => {
    if (mainImagePreview) {
      URL.revokeObjectURL(mainImagePreview);
      setMainImagePreview(null);
    }
    
    additionalImagePreviews.forEach(preview => URL.revokeObjectURL(preview));
    setAdditionalImagePreviews([]);
    
    mediaImagePreviews.forEach(preview => URL.revokeObjectURL(preview));
    setMediaImagePreviews([]);
  };
  
  // Reset all image state
  const resetImageState = () => {
    cleanupPreviews();
    setMainImage(null);
    setAdditionalImages([]);
    setMediaImages([]);
  };
  
  // Handler for media images upload
  const handleMediaImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileList = Array.from(e.target.files);
      setMediaImages([...mediaImages, ...fileList]);
      
      // Create preview URLs for display
      const newPreviews = fileList.map(file => URL.createObjectURL(file));
      setMediaImagePreviews([...mediaImagePreviews, ...newPreviews]);
    }
  };
  
  // Remove a media image
  const removeMediaImage = (index: number) => {
    setMediaImages(mediaImages.filter((_, i) => i !== index));
    
    // Also remove the preview and revoke the object URL to prevent memory leaks
    const previewToRemove = mediaImagePreviews[index];
    URL.revokeObjectURL(previewToRemove);
    setMediaImagePreviews(mediaImagePreviews.filter((_, i) => i !== index));
  };
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Product Management</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setShowCategoryForm(true);
                setEditingCategory(false);
                setCategoryFormData(initialCategoryForm);
              }}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              <PlusIcon className="h-4 w-4 mr-2" aria-hidden="true" />
              Add Category
            </button>
            <button
              onClick={() => {
                setShowProductForm(true);
                setEditingProduct(false);
                setProductFormData(initialProductForm);
              }}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
            >
              <PlusIcon className="h-4 w-4 mr-2" aria-hidden="true" />
              Add Product
            </button>
          </div>
        </div>
        
        {/* Messages */}
        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <XMarkIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}
        
        {successMessage && (
          <div className="rounded-md bg-green-50 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">{successMessage}</h3>
              </div>
            </div>
          </div>
        )}
        
        {/* Product management section */}
        <div className="bg-white shadow-sm rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Products</h2>
          </div>
          
          {/* Search and filters */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="w-full sm:w-64">
                <select
                  value={filterCategory === 'all' ? 'all' : filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <button
                  onClick={loadData}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-2" aria-hidden="true" />
                  Refresh
                </button>
              </div>
            </div>
          </div>
          
          {/* Products table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      Loading products...
                    </td>
                  </tr>
                )}
                {!loading && filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      No products found. Try a different search or add a new product.
                    </td>
                  </tr>
                )}
                {!loading && filteredProducts.map(product => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getCategoryName(product.category)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        product.stock_quantity <= 0 
                          ? 'bg-red-100 text-red-800' 
                          : product.stock_quantity < product.min_stock_threshold 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-green-100 text-green-800'
                      }`}>
                        {product.stock_quantity} in stock
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <PencilIcon className="h-5 w-5" aria-hidden="true" />
                        <span className="sr-only">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" aria-hidden="true" />
                        <span className="sr-only">Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Categories section */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Categories</h2>
          </div>
          
          {/* Categories table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product Count
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                      Loading categories...
                    </td>
                  </tr>
                )}
                {!loading && categories.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                      No categories found. Add a new category to get started.
                    </td>
                  </tr>
                )}
                {!loading && categories.map(category => (
                  <tr key={category.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {category.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {products.filter(p => 
                        typeof p.category === 'object' 
                          ? p.category.id === category.id 
                          : p.category === category.id
                      ).length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <PencilIcon className="h-5 w-5" aria-hidden="true" />
                        <span className="sr-only">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" aria-hidden="true" />
                        <span className="sr-only">Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Product Form Modal */}
        {showProductForm && (
          <div className="fixed inset-0 overflow-y-auto z-10">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {editingProduct ? 'Edit Product' : 'Add New Product'}
                      </h3>
                      <div className="mt-2">
                        <form onSubmit={handleProductFormSubmit}>
                          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                            <div className="sm:col-span-6">
                              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Product Name
                              </label>
                              <div className="mt-1">
                                <input
                                  type="text"
                                  name="name"
                                  id="name"
                                  required
                                  value={productFormData.name}
                                  onChange={handleProductFormChange}
                                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                />
                              </div>
                            </div>

                            <div className="sm:col-span-6">
                              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                Description
                              </label>
                              <div className="mt-1">
                                <textarea
                                  id="description"
                                  name="description"
                                  rows={3}
                                  value={productFormData.description}
                                  onChange={handleProductFormChange}
                                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                ></textarea>
                              </div>
                            </div>

                            <div className="sm:col-span-3">
                              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                                Category
                              </label>
                              <div className="mt-1">
                                <select
                                  id="category"
                                  name="category"
                                  required
                                  value={productFormData.category || ''}
                                  onChange={handleProductFormChange}
                                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                >
                                  <option value="">Select a category</option>
                                  {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                      {category.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="sm:col-span-3">
                              <label htmlFor="panel_type" className="block text-sm font-medium text-gray-700">
                                Panel Type
                              </label>
                              <div className="mt-1">
                                <select
                                  id="panel_type"
                                  name="panel_type"
                                  required
                                  value={productFormData.panel_type}
                                  onChange={handleProductFormChange}
                                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                >
                                  <option value="LP">LATTÉ PLAQUAGE: PEUPLIER+FORMICA</option>
                                  <option value="MF">MDF+FORMICA</option>
                                  <option value="MH">MDF HYDROFUGE MÉLAMINÉ</option>
                                </select>
                              </div>
                            </div>

                            <div className="sm:col-span-3">
                              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                                Price
                              </label>
                              <div className="mt-1">
                                <input
                                  type="number"
                                  name="price"
                                  id="price"
                                  required
                                  min="0"
                                  step="0.01"
                                  value={productFormData.price}
                                  onChange={handleProductFormChange}
                                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                />
                              </div>
                            </div>

                            <div className="sm:col-span-3">
                              <label htmlFor="stock_quantity" className="block text-sm font-medium text-gray-700">
                                Stock Quantity
                              </label>
                              <div className="mt-1">
                                <input
                                  type="number"
                                  name="stock_quantity"
                                  id="stock_quantity"
                                  required
                                  min="0"
                                  step="1"
                                  value={productFormData.stock_quantity}
                                  onChange={handleProductFormChange}
                                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                />
                              </div>
                            </div>

                            <div className="sm:col-span-3">
                              <label htmlFor="min_stock_threshold" className="block text-sm font-medium text-gray-700">
                                Min Stock Threshold
                              </label>
                              <div className="mt-1">
                                <input
                                  type="number"
                                  name="min_stock_threshold"
                                  id="min_stock_threshold"
                                  required
                                  min="0"
                                  step="1"
                                  value={productFormData.min_stock_threshold}
                                  onChange={handleProductFormChange}
                                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                />
                              </div>
                            </div>

                            <div className="sm:col-span-3">
                              <div className="flex items-center h-5 mt-6">
                                <input
                                  id="is_active"
                                  name="is_active"
                                  type="checkbox"
                                  checked={productFormData.is_active}
                                  onChange={handleProductCheckboxChange}
                                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                />
                                <label htmlFor="is_active" className="ml-3 block text-sm font-medium text-gray-700">
                                  Active
                                </label>
                              </div>
                            </div>

                            <div className="sm:col-span-6 mt-4">
                              <h4 className="text-sm font-medium text-gray-700 mb-3">Product Images</h4>
                              
                              {/* Main product image */}
                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Main Product Image
                                </label>
                                <div className="flex items-start space-x-4">
                                  <div className="flex-shrink-0">
                                    {mainImagePreview ? (
                                      <div className="relative w-32 h-32 border rounded-md overflow-hidden">
                                        <img 
                                          src={mainImagePreview} 
                                          alt="Product preview" 
                                          className="w-full h-full object-cover"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (mainImagePreview) URL.revokeObjectURL(mainImagePreview);
                                            setMainImagePreview(null);
                                            setMainImage(null);
                                          }}
                                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                                        >
                                          <XMarkIcon className="h-4 w-4" />
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center">
                                        <span className="text-gray-500 text-sm">No image</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-grow">
                                    <input
                                      type="file"
                                      id="main-image"
                                      accept="image/*"
                                      onChange={handleMainImageChange}
                                      className="sr-only"
                                    />
                                    <label
                                      htmlFor="main-image"
                                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer"
                                    >
                                      {mainImage ? "Change Image" : "Upload Image"}
                                    </label>
                                    <p className="mt-1 text-xs text-gray-500">
                                      JPG, PNG or GIF. Maximum file size 5MB.
                                    </p>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Additional product images */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Additional Product Images (up to 5)
                                </label>
                                
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-3">
                                  {/* Preview of additional images */}
                                  {additionalImagePreviews.map((preview, index) => (
                                    <div key={index} className="relative w-full pt-[100%] border rounded-md overflow-hidden">
                                      <img 
                                        src={preview} 
                                        alt={`Additional image ${index + 1}`} 
                                        className="absolute inset-0 w-full h-full object-cover"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => removeAdditionalImage(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                                      >
                                        <XMarkIcon className="h-4 w-4" />
                                      </button>
                                    </div>
                                  ))}
                                  
                                  {/* Upload button for additional images */}
                                  {additionalImagePreviews.length < 5 && (
                                    <div className="w-full pt-[100%] relative border-2 border-dashed border-gray-300 rounded-md">
                                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <input
                                          type="file"
                                          id="additional-images"
                                          accept="image/*"
                                          multiple
                                          onChange={handleAdditionalImagesChange}
                                          className="sr-only"
                                        />
                                        <label
                                          htmlFor="additional-images"
                                          className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
                                        >
                                          <PlusIcon className="h-6 w-6 text-gray-400" />
                                          <span className="text-xs text-gray-500 mt-1">Add image</span>
                                        </label>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                
                                <p className="text-xs text-gray-500">
                                  Add up to 5 additional images to showcase your product from different angles.
                                </p>
                              </div>
                              
                              {/* Media Images */}
                              <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Media Images (for marketing, catalogs, etc.)
                                </label>
                                
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-3">
                                  {/* Preview of media images */}
                                  {mediaImagePreviews.map((preview, index) => (
                                    <div key={index} className="relative w-full pt-[100%] border rounded-md overflow-hidden">
                                      <img 
                                        src={preview} 
                                        alt={`Media image ${index + 1}`} 
                                        className="absolute inset-0 w-full h-full object-cover"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => removeMediaImage(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                                      >
                                        <XMarkIcon className="h-4 w-4" />
                                      </button>
                                    </div>
                                  ))}
                                  
                                  {/* Upload button for media images */}
                                  <div className="w-full pt-[100%] relative border-2 border-dashed border-gray-300 rounded-md bg-gray-50">
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                      <input
                                        type="file"
                                        id="media-images"
                                        accept="image/*"
                                        multiple
                                        onChange={handleMediaImagesChange}
                                        className="sr-only"
                                      />
                                      <label
                                        htmlFor="media-images"
                                        className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
                                      >
                                        <PlusIcon className="h-6 w-6 text-gray-400" />
                                        <span className="text-xs text-gray-500 mt-1">Add media</span>
                                      </label>
                                    </div>
                                  </div>
                                </div>
                                
                                <p className="text-xs text-gray-500">
                                  Upload media images for marketing materials, catalogs, brochures, and other promotional content.
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="pt-5">
                            <div className="flex justify-end">
                              <button
                                type="button"
                                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                onClick={() => setShowProductForm(false)}
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                disabled={loading}
                              >
                                {loading ? (
                                  <>
                                    {uploadingImages ? 'Uploading Images...' : 'Saving...'}
                                    <ArrowPathIcon className="ml-2 h-4 w-4 animate-spin" />
                                  </>
                                ) : 'Save'}
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Category Form Modal */}
        {showCategoryForm && (
          <div className="fixed inset-0 overflow-y-auto z-10">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {editingCategory ? 'Edit Category' : 'Add New Category'}
                      </h3>
                      <div className="mt-2">
                        <form onSubmit={handleCategoryFormSubmit}>
                          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                            <div className="sm:col-span-6">
                              <label htmlFor="category-name" className="block text-sm font-medium text-gray-700">
                                Category Name
                              </label>
                              <div className="mt-1">
                                <input
                                  type="text"
                                  name="name"
                                  id="category-name"
                                  required
                                  value={categoryFormData.name}
                                  onChange={handleCategoryFormChange}
                                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                />
                              </div>
                            </div>

                            <div className="sm:col-span-6">
                              <label htmlFor="category-description" className="block text-sm font-medium text-gray-700">
                                Description
                              </label>
                              <div className="mt-1">
                                <textarea
                                  id="category-description"
                                  name="description"
                                  rows={3}
                                  value={categoryFormData.description}
                                  onChange={handleCategoryFormChange}
                                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                ></textarea>
                              </div>
                            </div>
                          </div>
                          
                          <div className="pt-5">
                            <div className="flex justify-end">
                              <button
                                type="button"
                                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                onClick={() => setShowCategoryForm(false)}
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                disabled={loading}
                              >
                                {loading ? 'Saving...' : 'Save'}
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManagement; 