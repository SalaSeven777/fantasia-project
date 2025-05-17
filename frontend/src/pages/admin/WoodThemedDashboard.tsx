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
import '../../styles/wood-client-theme.css';

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

const WoodThemedDashboard: React.FC = () => {
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
        // Try to fetch from API first
        try {
          const dashboardStats = await apiService.get<DashboardStats>('admin/dashboard/stats/');
          setStats(dashboardStats);
        } catch (err) {
          console.log('API data not available, using mock data');
          // Fallback to mock data if API fails
          setStats({
            total_users: 234,
            total_products: 1267,
            total_orders: 4856,
            pending_orders: 42,
            total_revenue: 825600,
            low_stock_products: 18
          });
        }

        // Try to fetch sales data from the API
        try {
          const sales = await apiService.get<SalesData>('admin/dashboard/sales/');
          setSalesData(sales);
        } catch (err) {
          console.log('Sales data not available, using mock data');
          // Mock data if API fails
          setSalesData({
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
            amounts: [42000, 48500, 52000, 48000, 63000, 72000, 68500]
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
            { id: 1, order_number: 'ORD-10345', customer_name: 'Acme Corporation', date: '2023-07-15', amount: 4500, status: 'completed' },
            { id: 2, order_number: 'ORD-10344', customer_name: 'Global Industries', date: '2023-07-14', amount: 3250, status: 'processing' },
            { id: 3, order_number: 'ORD-10343', customer_name: 'Modern Interiors', date: '2023-07-14', amount: 7800, status: 'pending' },
            { id: 4, order_number: 'ORD-10342', customer_name: 'Dream Home Renovations', date: '2023-07-13', amount: 2150, status: 'completed' },
            { id: 5, order_number: 'ORD-10341', customer_name: 'City Builders Ltd.', date: '2023-07-12', amount: 5600, status: 'completed' }
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
        setError('Failed to load dashboard data. Please try again later.');
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

  // Format date for better display
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format timestamp for better display
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${formatDate(timestamp)} at ${hours}:${minutes}`;
  };

  // Prepare chart data for sales trend with wood theme colors
  const salesChartData = {
    labels: salesData?.labels || [],
    datasets: [
      {
        label: 'Monthly Revenue',
        data: salesData?.amounts || [],
        backgroundColor: 'rgba(120, 79, 56, 0.2)',
        borderColor: 'rgba(120, 79, 56, 0.8)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Prepare chart data for product categories with wood theme colors
  const productCategoryData = {
    labels: ['Wood Panels', 'Laminates', 'Hardware', 'Veneers', 'Accessories'],
    datasets: [
      {
        data: [35, 25, 20, 15, 5],
        backgroundColor: [
          'rgba(120, 79, 56, 0.8)',
          'rgba(159, 125, 79, 0.8)',
          'rgba(193, 154, 107, 0.8)',
          'rgba(219, 202, 155, 0.8)',
          'rgba(238, 232, 170, 0.8)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Get status badge class based on order status
  const getStatusBadgeClass = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'wood-badge-success';
      case 'processing':
        return 'wood-badge-info';
      case 'pending':
        return 'wood-badge-warning';
      case 'cancelled':
        return 'wood-badge-danger';
      default:
        return 'wood-badge';
    }
  };

  // Get activity icon based on activity type
  const getActivityIcon = (icon: string): JSX.Element => {
    switch (icon) {
      case 'user-plus':
        return (
          <div className="wood-icon-circle wood-icon-info">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
        );
      case 'shopping-cart':
        return (
          <div className="wood-icon-circle wood-icon-success">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        );
      case 'package':
        return (
          <div className="wood-icon-circle wood-icon-warning">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        );
      case 'database':
        return (
          <div className="wood-icon-circle wood-icon-purple">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
          </div>
        );
      case 'refresh-cw':
        return (
          <div className="wood-icon-circle wood-icon-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="wood-icon-circle">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="py-4 sm:py-6">
      <div className="w-full px-3 sm:px-4 md:px-6">
        <div className="wood-page-header flex-wrap gap-3">
          <h1 className="wood-page-title">Admin Dashboard</h1>
          <button
            className="wood-button-primary"
            onClick={() => window.location.reload()}
          >
            Refresh Data
          </button>
        </div>

        {loading ? (
          <div className="wood-spinner">
            <div className="wood-spinner-icon"></div>
          </div>
        ) : error ? (
          <div className="wood-alert-error">
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5 mb-4 sm:mb-6">
              <div className="wood-card p-4 sm:p-5">
                <div className="flex items-center">
                  <div className="wood-icon-circle wood-icon-primary mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-wood-neutral-500 mb-1">Total Users</h3>
                    <p className="text-xl sm:text-2xl font-bold text-wood-brown-800">{stats?.total_users || 0}</p>
                  </div>
                </div>
                <div className="mt-3 text-xs">
                  <Link to="/admin/users" className="text-wood-brown-600 hover:text-wood-brown-800">Manage users →</Link>
                </div>
              </div>

              <div className="wood-card p-4 sm:p-5">
                <div className="flex items-center">
                  <div className="wood-icon-circle wood-icon-success mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-wood-neutral-500 mb-1">Total Orders</h3>
                    <p className="text-xl sm:text-2xl font-bold text-wood-brown-800">{stats?.total_orders || 0}</p>
                  </div>
                </div>
                <div className="mt-3 text-xs">
                  <Link to="/admin/orders" className="text-wood-brown-600 hover:text-wood-brown-800">View all orders →</Link>
                </div>
              </div>

              <div className="wood-card p-4 sm:p-5">
                <div className="flex items-center">
                  <div className="wood-icon-circle wood-icon-warning mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-wood-neutral-500 mb-1">Total Revenue</h3>
                    <p className="text-xl sm:text-2xl font-bold text-wood-brown-800 truncate">{formatCurrency(stats?.total_revenue || 0)}</p>
                  </div>
                </div>
                <div className="mt-3 text-xs">
                  <Link to="/admin/reports" className="text-wood-brown-600 hover:text-wood-brown-800">View detailed reports →</Link>
                </div>
              </div>

              <div className="wood-card p-4 sm:p-5">
                <div className="flex items-center">
                  <div className="wood-icon-circle wood-icon-danger mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-wood-neutral-500 mb-1">Low Stock Products</h3>
                    <p className="text-xl sm:text-2xl font-bold text-wood-brown-800">{stats?.low_stock_products || 0}</p>
                  </div>
                </div>
                <div className="mt-3 text-xs">
                  <Link to="/admin/inventory" className="text-wood-brown-600 hover:text-wood-brown-800">View inventory →</Link>
                </div>
              </div>

              <div className="wood-card p-4 sm:p-5">
                <div className="flex items-center">
                  <div className="wood-icon-circle wood-icon-info mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-wood-neutral-500 mb-1">Total Products</h3>
                    <p className="text-xl sm:text-2xl font-bold text-wood-brown-800">{stats?.total_products || 0}</p>
                  </div>
                </div>
                <div className="mt-3 text-xs">
                  <Link to="/admin/products" className="text-wood-brown-600 hover:text-wood-brown-800">Manage products →</Link>
                </div>
              </div>

              <div className="wood-card p-4 sm:p-5">
                <div className="flex items-center">
                  <div className="wood-icon-circle wood-icon-warning mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-wood-neutral-500 mb-1">Pending Orders</h3>
                    <p className="text-xl sm:text-2xl font-bold text-wood-brown-800">{stats?.pending_orders || 0}</p>
                  </div>
                </div>
                <div className="mt-3 text-xs">
                  <Link to="/admin/orders/pending" className="text-wood-brown-600 hover:text-wood-brown-800">Process orders →</Link>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-8">
              {/* Sales Chart */}
              <div className="wood-card">
                <div className="wood-card-header">
                  <h3 className="wood-card-title">Monthly Revenue</h3>
                  <p className="wood-card-subtitle">Revenue trends over time</p>
                </div>
                <div className="p-3 sm:p-5">
                  <div className="h-56 sm:h-64">
                    <Line
                      data={salesChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: function(value) {
                                return formatCurrency(value as number).replace('.00', '');
                              }
                            }
                          },
                          x: {
                            ticks: {
                              maxRotation: 45,
                              minRotation: 45
                            }
                          }
                        },
                        plugins: {
                          legend: {
                            display: false
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                return formatCurrency(context.parsed.y);
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Product Categories */}
              <div className="wood-card">
                <div className="wood-card-header">
                  <h3 className="wood-card-title">Product Categories</h3>
                  <p className="wood-card-subtitle">Product distribution by category</p>
                </div>
                <div className="p-3 sm:p-5">
                  <div className="h-56 sm:h-64 flex items-center justify-center">
                    <Doughnut
                      data={productCategoryData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: {
                              boxWidth: 12,
                              padding: 15,
                              font: {
                                size: 11
                              },
                              generateLabels: function(chart) {
                                // Get the default legend items
                                const original = ChartJS.defaults.plugins.legend.labels.generateLabels(chart);
                                
                                // Shorten the labels for mobile
                                if (window.innerWidth < 640) {
                                  original.forEach((label: { text: string }) => {
                                    if (typeof label.text === 'string' && label.text.length > 12) {
                                      label.text = label.text.substring(0, 10) + '...';
                                    }
                                  });
                                }
                                
                                return original;
                              }
                            }
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                const label = context.label || '';
                                const value = formatCurrency(context.parsed);
                                return `${label}: ${value}`;
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tables Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Recent Orders */}
              <div className="wood-card">
                <div className="wood-card-header">
                  <h3 className="wood-card-title">Recent Orders</h3>
                  <p className="wood-card-subtitle">Latest transactions in the system</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="wood-table">
                    <thead className="wood-table-header">
                      <tr>
                        <th className="px-4 sm:px-6 py-3">Order #</th>
                        <th className="px-4 sm:px-6 py-3">Customer</th>
                        <th className="px-4 sm:px-6 py-3">Amount</th>
                        <th className="px-4 sm:px-6 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="wood-table-body">
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="wood-table-row">
                          <td className="px-4 sm:px-6 py-4 font-medium text-wood-brown-700 whitespace-nowrap">{order.order_number}</td>
                          <td className="px-4 sm:px-6 py-4 text-wood-brown-700 truncate max-w-[150px]">{order.customer_name}</td>
                          <td className="px-4 sm:px-6 py-4 text-wood-brown-700 whitespace-nowrap">{formatCurrency(order.amount)}</td>
                          <td className="px-4 sm:px-6 py-4">
                            <span className={getStatusBadgeClass(order.status)}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="wood-card-footer p-3 sm:p-4 border-t border-wood-neutral-200">
                  <Link to="/admin/orders" className="text-sm text-wood-brown-700 hover:text-wood-brown-900">
                    View all orders →
                  </Link>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="wood-card">
                <div className="wood-card-header">
                  <h3 className="wood-card-title">Recent Activity</h3>
                  <p className="wood-card-subtitle">Latest system activities</p>
                </div>
                <div className="overflow-hidden">
                  <ul className="divide-y divide-wood-neutral-200">
                    {recentActivities.map((activity) => (
                      <li key={activity.id} className="p-4 sm:p-5 flex items-start">
                        <div className="flex-shrink-0 mr-3">
                          {getActivityIcon(activity.icon)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-wood-brown-800">
                            {activity.description}
                          </div>
                          <div className="mt-1 flex text-xs text-wood-neutral-500">
                            <span>{activity.user}</span>
                            <span className="mx-1.5">•</span>
                            <span>{formatTimestamp(activity.timestamp)}</span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="wood-card-footer p-3 sm:p-4 border-t border-wood-neutral-200">
                  <Link to="/admin/audit" className="text-sm text-wood-brown-700 hover:text-wood-brown-900">
                    View all activity →
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WoodThemedDashboard; 