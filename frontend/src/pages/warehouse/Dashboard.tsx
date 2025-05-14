import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { inventoryService, StockMovement, Supplier, PurchaseOrder } from '../../services/inventory.service';
import { productService } from '../../services/product.service';
import { Product } from '../../types/product.types';
import { 
  ArchiveBoxIcon, 
  TruckIcon, 
  DocumentTextIcon, 
  ShoppingCartIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

const WarehouseDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    totalSuppliers: 0,
    pendingOrders: 0,
    recentMovements: [] as StockMovement[],
    upcomingDeliveries: [] as PurchaseOrder[]
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get product stats
      const productsData = await productService.getProducts();
      const products = productsData.products || [];
      
      // Get suppliers
      const suppliers = await inventoryService.getSuppliers();
      
      // Get purchase orders
      const purchaseOrders = await inventoryService.getPurchaseOrders(undefined, 'AP'); // Approved but not received
      
      // Get recent stock movements
      const stockMovements = await inventoryService.getStockMovements();
      
      // Calculate low stock products (assuming below 10 is low)
      const lowStock = products.filter((product: Product) => 
        (product.stock_quantity !== undefined && product.stock_quantity < 10) || 
        (product.stock_quantity === undefined && (product as any).stock !== undefined && (product as any).stock < 10)
      ).length;
      
      setStatistics({
        totalProducts: products.length,
        lowStockProducts: lowStock,
        totalSuppliers: suppliers.length,
        pendingOrders: purchaseOrders.length,
        recentMovements: stockMovements.slice(0, 5), // Only show latest 5
        upcomingDeliveries: purchaseOrders.slice(0, 3) // Only show latest 3
      });
      
      setError(null);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load warehouse dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Warehouse Dashboard</h1>
        
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="mt-6 text-center">
            <p className="text-gray-500">Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {/* Stats overview */}
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ArchiveBoxIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Products</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">{statistics.totalProducts}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <Link to="/warehouse/stock" className="font-medium text-indigo-600 hover:text-indigo-900">
                      View all
                    </Link>
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
                        <dt className="text-sm font-medium text-gray-500 truncate">Low Stock Products</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">{statistics.lowStockProducts}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <Link to="/warehouse/reports" className="font-medium text-indigo-600 hover:text-indigo-900">
                      View details
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <TruckIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Active Suppliers</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">{statistics.totalSuppliers}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <Link to="/warehouse/supply-chain" className="font-medium text-indigo-600 hover:text-indigo-900">
                      Manage suppliers
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <DocumentTextIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Pending Orders</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">{statistics.pendingOrders}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <Link to="/warehouse/supply-chain" className="font-medium text-indigo-600 hover:text-indigo-900">
                      View orders
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent stock movements */}
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900">Recent Stock Movements</h2>
              <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
                {statistics.recentMovements.length === 0 ? (
                  <p className="py-5 px-4 text-center text-gray-500">No recent stock movements found.</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {statistics.recentMovements.map((movement) => (
                      <li key={movement.id}>
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              {movement.quantity > 0 ? (
                                <ArrowTrendingUpIcon className="h-5 w-5 text-green-500 mr-2" />
                              ) : (
                                <ArrowTrendingDownIcon className="h-5 w-5 text-red-500 mr-2" />
                              )}
                              <p className="text-sm font-medium text-indigo-600 truncate">
                                {movement.product_details.name}
                              </p>
                            </div>
                            <div className="ml-2 flex-shrink-0 flex">
                              <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${movement.quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {movement.movement_type_display} ({movement.quantity > 0 ? '+' : ''}{movement.quantity})
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <p className="flex items-center text-sm text-gray-500">
                                {movement.reference_number && `Ref: ${movement.reference_number}`}
                              </p>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                              <p>
                                {new Date(movement.created_at).toLocaleDateString()} by {movement.performed_by_username}
                              </p>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="mt-4 text-sm">
                <Link to="/warehouse/stock" className="font-medium text-indigo-600 hover:text-indigo-900">
                  View all stock movements →
                </Link>
              </div>
            </div>
            
            {/* Upcoming deliveries */}
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900">Upcoming Deliveries</h2>
              <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
                {statistics.upcomingDeliveries.length === 0 ? (
                  <p className="py-5 px-4 text-center text-gray-500">No upcoming deliveries scheduled.</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {statistics.upcomingDeliveries.map((order) => (
                      <li key={order.id}>
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <ShoppingCartIcon className="h-5 w-5 text-gray-400 mr-2" />
                              <p className="text-sm font-medium text-indigo-600 truncate">
                                {order.order_number} - {order.supplier_details.name}
                              </p>
                            </div>
                            <div className="ml-2 flex-shrink-0 flex">
                              <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                {order.status_display}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <p className="flex items-center text-sm text-gray-500">
                                {order.items.length} items
                              </p>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                              <p>
                                Expected: {formatDate(order.expected_delivery_date)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="mt-4 text-sm">
                <Link to="/warehouse/supply-chain" className="font-medium text-indigo-600 hover:text-indigo-900">
                  View all purchase orders →
                </Link>
              </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WarehouseDashboard; 