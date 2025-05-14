import React, { useState, useEffect } from 'react';
import { productService } from '../../services/product.service';
import { Product } from '../../types/product.types';
import { 
  ExclamationTriangleIcon, 
  ChartBarIcon, 
  CurrencyDollarIcon 
} from '@heroicons/react/24/outline';

interface ProductWithValue extends Product {
  totalValue: number;
}

interface InventoryStats {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  stockByCategory: Record<string, { count: number; value: number }>;
}

const InventoryReports: React.FC = () => {
  const [products, setProducts] = useState<ProductWithValue[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<ProductWithValue[]>([]);
  const [stats, setStats] = useState<InventoryStats>({
    totalProducts: 0,
    totalValue: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    stockByCategory: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Low stock threshold
  const LOW_STOCK_THRESHOLD = 10;

  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      
      // Get all products
      const productsData = await productService.getProducts();
      const productsWithStock = (productsData.products || []).map((product: Product) => {
        // Calculate total value for each product
        const stockQuantity = product.stock_quantity || 0;
        const price = product.price || 0;
        const totalValue = stockQuantity * price;
        
        return {
          ...product,
          totalValue
        };
      });
      
      setProducts(productsWithStock);
      
      // Get low stock products
      const lowStock = productsWithStock.filter((product: ProductWithValue) => {
        const stockQuantity = product.stock_quantity || 0;
        return stockQuantity > 0 && stockQuantity < LOW_STOCK_THRESHOLD;
      });
      
      setLowStockProducts(lowStock);
      
      // Calculate inventory stats
      const totalValue = productsWithStock.reduce((sum: number, product: ProductWithValue) => sum + product.totalValue, 0);
      const outOfStock = productsWithStock.filter((product: ProductWithValue) => {
        const stockQuantity = product.stock_quantity || 0;
        return stockQuantity === 0;
      });
      
      // Get stock by category
      const stockByCategory: Record<string, { count: number; value: number }> = {};
      
      productsWithStock.forEach((product: ProductWithValue) => {
        const category = typeof product.category === 'object' 
          ? (product.category as any).name 
          : product.category_name || String(product.category);
          
        if (!stockByCategory[category]) {
          stockByCategory[category] = { count: 0, value: 0 };
        }
        
        stockByCategory[category].count += 1;
        stockByCategory[category].value += product.totalValue;
      });
      
      setStats({
        totalProducts: productsWithStock.length,
        totalValue,
        lowStockCount: lowStock.length,
        outOfStockCount: outOfStock.length,
        stockByCategory
      });
      
      setError(null);
    } catch (err) {
      console.error('Error loading inventory data:', err);
      setError('Failed to load inventory reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Get category name
  const getCategoryName = (category: any): string => {
    if (typeof category === 'object' && category !== null) {
      return category.name || 'Unknown';
    } else if (typeof category === 'string') {
      return category;
    } else if (typeof category === 'number') {
      return String(category);
    }
    return 'Unknown';
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Inventory Reports</h1>
        
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="mt-6 text-center">
            <p className="text-gray-500">Loading inventory data...</p>
          </div>
        ) : (
          <>
            {/* Inventory summary stats */}
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ChartBarIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Inventory</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">{stats.totalProducts} products</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Stock Status</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">
                            {stats.lowStockCount} low / {stats.outOfStockCount} out
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CurrencyDollarIcon className="h-6 w-6 text-green-500" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Inventory Value</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">{formatCurrency(stats.totalValue)}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Low stock products */}
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900">Low Stock Items</h2>
              <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Current Stock
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unit Price
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Value
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {lowStockProducts.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                            No low stock products found.
                          </td>
                        </tr>
                      ) : (
                        lowStockProducts.map((product) => (
                          <tr key={product.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {product.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {getCategoryName(product.category)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                {product.stock_quantity}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(product.price)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(product.totalValue)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            {/* Inventory by Category */}
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900">Inventory by Category</h2>
              <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Number of Products
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Value
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Object.keys(stats.stockByCategory).length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                            No category data available.
                          </td>
                        </tr>
                      ) : (
                        Object.entries(stats.stockByCategory).map(([category, data]) => (
                          <tr key={category}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {category}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {data.count}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(data.value)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InventoryReports; 