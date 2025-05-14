import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardStats {
  total_users: number;
  total_products: number;
  total_orders: number;
  pending_orders: number;
  total_revenue: number;
  low_stock_products: number;
}

interface SalesData {
  labels: string[];
  amounts: number[];
}

interface RecentOrder {
  id: number;
  order_number: string;
  customer_name: string;
  date: string;
  amount: number;
  status: string;
}

interface RecentActivity {
  id: number;
  type: string;
  description: string;
  timestamp: string;
  user: string;
  icon: string;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const dashboardStats = await apiService.get<DashboardStats>('admin/dashboard/stats/');
        setStats(dashboardStats);

        // Try to fetch sales data from the API
        try {
          const sales = await apiService.get<SalesData>('admin/dashboard/sales/');
          setSalesData(sales);
        } catch (err) {
          console.log('Sales data not available, using mock data');
          // Mock data if API fails
          setSalesData({
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            amounts: [3000, 4500, 5200, 4800, 6000, 7200]
          });
        }

        // Try to fetch recent orders
        try {
          const orders = await apiService.get<RecentOrder[]>('admin/dashboard/recent-orders/');
          setRecentOrders(orders);
        } catch (err) {
          console.log('Recent orders not available, using mock data');
          // Mock data
          setRecentOrders([
            { id: 1, order_number: 'ORD-001', customer_name: 'John Smith', date: '2023-07-15', amount: 245.99, status: 'completed' },
            { id: 2, order_number: 'ORD-002', customer_name: 'Maria Garcia', date: '2023-07-14', amount: 532.50, status: 'processing' },
            { id: 3, order_number: 'ORD-003', customer_name: 'David Johnson', date: '2023-07-13', amount: 178.25, status: 'pending' },
            { id: 4, order_number: 'ORD-004', customer_name: 'Sarah Williams', date: '2023-07-12', amount: 347.80, status: 'completed' },
            { id: 5, order_number: 'ORD-005', customer_name: 'Michael Brown', date: '2023-07-11', amount: 612.30, status: 'completed' }
          ]);
        }

        // Set mock recent activities (typically would come from an API)
        setRecentActivities([
          { id: 1, type: 'user', description: 'New user registered', timestamp: '2023-07-15T14:32:00', user: 'Sophie Taylor', icon: 'user-plus' },
          { id: 2, type: 'order', description: 'New order placed', timestamp: '2023-07-15T13:45:00', user: 'John Smith', icon: 'shopping-cart' },
          { id: 3, type: 'product', description: 'Product stock updated', timestamp: '2023-07-15T11:20:00', user: 'Admin User', icon: 'package' },
          { id: 4, type: 'system', description: 'System backup completed', timestamp: '2023-07-15T10:00:00', user: 'System', icon: 'database' },
          { id: 5, type: 'order', description: 'Order status updated', timestamp: '2023-07-15T09:15:00', user: 'Admin User', icon: 'refresh-cw' }
        ]);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Failed to load dashboard statistics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Helper function to format currency
  const formatCurrency = (amount: number | string): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return numAmount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    });
  };

  // Prepare chart data
  const salesChartData = {
    labels: salesData?.labels || [],
    datasets: [
      {
        label: 'Sales',
        data: salesData?.amounts || [],
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const salesChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Monthly Sales',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Prepare doughnut chart data for product categories
  const productCategoryData = {
    labels: ['Wood Panels', 'Laminates', 'Hardware', 'Veneers', 'Accessories'],
    datasets: [
      {
        data: [35, 25, 20, 15, 5],
        backgroundColor: [
          'rgba(79, 70, 229, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(239, 68, 68, 0.7)',
          'rgba(107, 114, 128, 0.7)'
        ],
        borderWidth: 1,
      },
    ],
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (icon: string): JSX.Element => {
    switch (icon) {
      case 'user-plus':
        return (
          <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        );
      case 'shopping-cart':
        return (
          <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'package':
        return (
          <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
      case 'database':
        return (
          <svg className="h-5 w-5 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
          </svg>
        );
      case 'refresh-cw':
        return (
          <svg className="h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
          <div>
            <button
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => window.location.reload()}
            >
              Refresh Data
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="mt-6 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="mt-6 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6">
            {/* Key Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                        <dd>
                          <div className="text-lg font-semibold text-gray-900">{stats?.total_users || 0}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-4 sm:px-6">
                  <div className="text-sm">
                    <Link to="/admin/users" className="font-medium text-indigo-600 hover:text-indigo-500">
                      View all users
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                        <dd>
                          <div className="text-lg font-semibold text-gray-900">{stats?.total_orders || 0}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-4 sm:px-6">
                  <div className="text-sm">
                    <Link to="/admin/orders" className="font-medium text-indigo-600 hover:text-indigo-500">
                      View all orders
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                        <dd>
                          <div className="text-lg font-semibold text-gray-900">{formatCurrency(stats?.total_revenue || 0)}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-4 sm:px-6">
                  <div className="text-sm">
                    <Link to="/admin/reports" className="font-medium text-indigo-600 hover:text-indigo-500">
                      View detailed reports
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Products</dt>
                        <dd>
                          <div className="text-lg font-semibold text-gray-900">{stats?.total_products || 0}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-4 sm:px-6">
                  <div className="text-sm">
                    <Link to="/admin/products" className="font-medium text-indigo-600 hover:text-indigo-500">
                      Manage products
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Low Stock Products</dt>
                        <dd>
                          <div className="text-lg font-semibold text-gray-900">{stats?.low_stock_products || 0}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-4 sm:px-6">
                  <div className="text-sm">
                    <Link to="/admin/inventory" className="font-medium text-indigo-600 hover:text-indigo-500">
                      View inventory
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-orange-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Pending Orders</dt>
                        <dd>
                          <div className="text-lg font-semibold text-gray-900">{stats?.pending_orders || 0}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-4 sm:px-6">
                  <div className="text-sm">
                    <Link to="/admin/orders/pending" className="font-medium text-indigo-600 hover:text-indigo-500">
                      Process pending orders
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Sales Charts and Product Categories */}
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-1 lg:grid-cols-2">
              {/* Sales Chart */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Monthly Sales
                  </h3>
                  <div className="mt-2 h-64">
                    {salesData && <Line options={salesChartOptions} data={salesChartData} />}
                  </div>
                </div>
              </div>

              {/* Product Categories */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Product Categories
                  </h3>
                  <div className="mt-2 h-64 flex items-center justify-center">
                    <div style={{ width: '75%', height: '75%' }}>
                      <Doughnut data={productCategoryData} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders and Activity */}
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-1 lg:grid-cols-2">
              {/* Recent Orders */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Recent Orders
                    </h3>
                    <Link to="/admin/orders" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                      View all
                    </Link>
                  </div>
                  <div className="mt-2 max-h-96 overflow-y-auto">
                    <ul className="divide-y divide-gray-200">
                      {recentOrders.map((order) => (
                        <li key={order.id} className="py-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">
                                  {order.order_number}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {order.customer_name}
                                </p>
                              </div>
                            </div>
                            <div className="ml-4 flex flex-col items-end">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                              <p className="text-sm text-gray-500 mt-1">
                                {formatCurrency(order.amount)}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Recent Activity
                    </h3>
                    <Link to="/admin/activity" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                      View all
                    </Link>
                  </div>
                  <div className="mt-2 max-h-96 overflow-y-auto">
                    <ul className="divide-y divide-gray-200">
                      {recentActivities.map((activity) => (
                        <li key={activity.id} className="py-3">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              {getActivityIcon(activity.icon)}
                            </div>
                            <div className="ml-3 flex-1">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900">
                                  {activity.description}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {new Date(activity.timestamp).toLocaleTimeString()}
                                </p>
                              </div>
                              <p className="text-sm text-gray-500">
                                {activity.user}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Quick Actions
                </h3>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Link to="/admin/products/new" className="bg-indigo-50 px-6 py-4 rounded-lg text-center hover:bg-indigo-100 transition-colors">
                    <svg className="h-6 w-6 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="mt-2 block text-sm font-medium text-indigo-900">Add Product</span>
                  </Link>
                  <Link to="/admin/users/new" className="bg-green-50 px-6 py-4 rounded-lg text-center hover:bg-green-100 transition-colors">
                    <svg className="h-6 w-6 text-green-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <span className="mt-2 block text-sm font-medium text-green-900">Add User</span>
                  </Link>
                  <Link to="/admin/reports/generate" className="bg-blue-50 px-6 py-4 rounded-lg text-center hover:bg-blue-100 transition-colors">
                    <svg className="h-6 w-6 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="mt-2 block text-sm font-medium text-blue-900">Generate Report</span>
                  </Link>
                  <Link to="/admin/settings" className="bg-yellow-50 px-6 py-4 rounded-lg text-center hover:bg-yellow-100 transition-colors">
                    <svg className="h-6 w-6 text-yellow-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="mt-2 block text-sm font-medium text-yellow-900">Settings</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 