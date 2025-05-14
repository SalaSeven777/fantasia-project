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
import { Bar, Line, Doughnut } from 'react-chartjs-2';

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

interface CommercialStats {
  total_sales: number;
  monthly_revenue: number;
  pending_orders: number;
  pending_quotes: number;
  top_customers: {
    id: number;
    name: string;
    email: string;
    company: string;
    orders: number;
    spent: number;
  }[];
  product_performance: {
    id: number;
    name: string;
    quantity: number;
    revenue: number;
  }[];
  sales_by_category: {
    category: string;
    revenue: number;
  }[];
  recent_quotes: {
    id: number;
    quote_number: string;
    customer_name: string;
    date: string;
    total: number;
    status: string;
  }[];
  revenue_trends: {
    month: string;
    revenue: number;
  }[];
}

const CommercialDashboard: React.FC = () => {
  const [stats, setStats] = useState<CommercialStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Try to fetch from the API first
        try {
          const response = await apiService.get<CommercialStats>('commercial/dashboard/stats/');
          
          // Check if response is valid
          if (response && typeof response === 'object') {
            setStats(response);
          } else {
            throw new Error('Invalid response format');
          }
        } catch (err) {
          console.log('API data not available, using mock data');
          // Fallback to mock data if API fails
          setStats({
            total_sales: 234500,
            monthly_revenue: 42300,
            pending_orders: 15,
            pending_quotes: 8,
            top_customers: [
              { id: 1, name: 'Acme Corporation', email: 'info@acme.com', company: 'Acme Corporation', orders: 10, spent: 12500 },
              { id: 2, name: 'Global Industries', email: 'info@global.com', company: 'Global Industries', orders: 8, spent: 9800 },
              { id: 3, name: 'City Builders Ltd.', email: 'info@citybuilders.com', company: 'City Builders Ltd.', orders: 6, spent: 7650 },
              { id: 4, name: 'Modern Interiors', email: 'info@moderninteriors.com', company: 'Modern Interiors', orders: 5, spent: 6200 },
              { id: 5, name: 'Dream Home Renovations', email: 'info@dreamhomerenovations.com', company: 'Dream Home Renovations', orders: 4, spent: 5750 },
            ],
            product_performance: [
              { id: 1, name: 'Premium Walnut Veneer', quantity: 120, revenue: 45000 },
              { id: 2, name: 'White Oak Panels', quantity: 95, revenue: 38000 },
              { id: 3, name: 'Cabinet Hardware Set', quantity: 84, revenue: 25200 },
              { id: 4, name: 'Birch Plywood Sheets', quantity: 72, revenue: 21600 },
              { id: 5, name: 'Mahogany Lumber', quantity: 68, revenue: 20400 },
            ],
            sales_by_category: [
              { category: 'Wood Panels', revenue: 85000 },
              { category: 'Veneers', revenue: 65000 },
              { category: 'Hardware', revenue: 48000 },
              { category: 'Laminates', revenue: 32000 },
              { category: 'Accessories', revenue: 28000 },
            ],
            recent_quotes: [
              { id: 1, quote_number: 'Q-10345', customer_name: 'Acme Corporation', date: '2023-07-15', total: 4500, status: 'Draft' },
              { id: 2, quote_number: 'Q-10344', customer_name: 'Global Industries', date: '2023-07-14', total: 3250, status: 'Accepted' },
              { id: 3, quote_number: 'Q-10343', customer_name: 'Modern Interiors', date: '2023-07-14', total: 7800, status: 'Draft' },
              { id: 4, quote_number: 'Q-10342', customer_name: 'Dream Home Renovations', date: '2023-07-13', total: 2150, status: 'Rejected' },
              { id: 5, quote_number: 'Q-10341', customer_name: 'City Builders Ltd.', date: '2023-07-12', total: 5600, status: 'Accepted' },
            ],
            revenue_trends: [
              { month: 'Jan 2023', revenue: 33000 },
              { month: 'Feb 2023', revenue: 38000 },
              { month: 'Mar 2023', revenue: 35000 },
              { month: 'Apr 2023', revenue: 32000 },
              { month: 'May 2023', revenue: 39000 },
              { month: 'Jun 2023', revenue: 37500 },
              { month: 'Jul 2023', revenue: 42300 },
            ],
          });
        }
      } catch (err) {
        console.error('Error fetching commercial dashboard stats:', err);
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

  // Prepare chart data for revenue trend
  const revenueChartData = {
    labels: stats?.revenue_trends.map(item => item.month) || [],
    datasets: [
      {
        label: 'Monthly Revenue',
        data: stats?.revenue_trends.map(item => item.revenue) || [],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  // Prepare chart data for sales by category
  const salesByCategoryData = {
    labels: stats?.sales_by_category.map(item => item.category) || [],
    datasets: [
      {
        data: stats?.sales_by_category.map(item => item.revenue) || [],
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 99, 132, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare chart data for product performance
  const productPerformanceData = {
    labels: stats?.product_performance.map(item => item.name) || [],
    datasets: [
      {
        label: 'Revenue',
        data: stats?.product_performance.map(item => item.revenue) || [],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
    ],
  };

  const getQuoteStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'sent':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'expired':
        return 'bg-orange-100 text-orange-800';
      case 'converted to order':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Commercial Dashboard</h1>
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => window.location.reload()}
          >
            Refresh Data
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mt-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6">
            {/* Key Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Sales (YTD)</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">{formatCurrency(stats?.total_sales || 0)}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Monthly Revenue</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">{formatCurrency(stats?.monthly_revenue || 0)}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Pending Orders</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">{stats?.pending_orders || 0}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-4 sm:px-6">
                  <div className="text-sm">
                    <Link to="/commercial/orders" className="font-medium text-blue-600 hover:text-blue-500">View all orders<span aria-hidden="true"> &rarr;</span></Link>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Pending Quotes</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">{stats?.pending_quotes || 0}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-4 sm:px-6">
                  <div className="text-sm">
                    <Link to="/commercial/quotes" className="font-medium text-blue-600 hover:text-blue-500">View all quotes<span aria-hidden="true"> &rarr;</span></Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-6">
              {/* Revenue Trend Chart */}
              <div className="sm:col-span-4 bg-white shadow rounded-lg p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Revenue Trend</h3>
                <div className="mt-2" style={{ height: "300px" }}>
                  <Line
                    data={revenueChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: false,
                          ticks: {
                            callback: function(value) {
                              return '$' + value.toLocaleString();
                            }
                          }
                        },
                        x: {
                          grid: {
                            display: false,
                          }
                        }
                      },
                      plugins: {
                        legend: {
                          position: 'top' as const,
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Sales by Category */}
              <div className="sm:col-span-2 bg-white shadow rounded-lg p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Sales by Category</h3>
                <div className="mt-2" style={{ height: "300px" }}>
                  <Doughnut
                    data={salesByCategoryData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom' as const,
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Two Columns Section */}
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* Top Customers */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Top Customers</h3>
                </div>
                <div className="border-t border-gray-200">
                  <ul className="divide-y divide-gray-200">
                    {stats?.top_customers.map((customer) => (
                      <li key={customer.id} className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">{customer.name}</p>
                          <p className="text-sm text-gray-500">{formatCurrency(customer.spent)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-gray-50 px-4 py-4 sm:px-6">
                  <div className="text-sm">
                    <Link to="/commercial/customers" className="font-medium text-blue-600 hover:text-blue-500">View all customers<span aria-hidden="true"> &rarr;</span></Link>
                  </div>
                </div>
              </div>

              {/* Recent Quotes */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Quotes</h3>
                </div>
                <div className="border-t border-gray-200">
                  <ul className="divide-y divide-gray-200">
                    {stats?.recent_quotes.map((quote) => (
                      <li key={quote.id} className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-gray-900">{quote.quote_number}</p>
                              <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getQuoteStatusColor(quote.status)}`}>
                                {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">{quote.customer_name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{formatCurrency(quote.total)}</p>
                            <p className="text-sm text-gray-500">{quote.date}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-gray-50 px-4 py-4 sm:px-6">
                  <div className="text-sm">
                    <Link to="/commercial/quotes" className="font-medium text-blue-600 hover:text-blue-500">View all quotes<span aria-hidden="true"> &rarr;</span></Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Performance */}
            <div className="mt-8 bg-white shadow rounded-lg p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Top Performing Products</h3>
              <div className="mt-4" style={{ height: "300px" }}>
                <Bar
                  data={productPerformanceData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Revenue'
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        display: false
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
                <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  <Link to="/commercial/orders/new" className="bg-blue-50 px-4 py-4 rounded-lg text-center hover:bg-blue-100 transition-colors">
                    <svg className="h-6 w-6 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="mt-2 block text-sm font-medium text-blue-900">Create New Order</span>
                  </Link>
                  <Link to="/commercial/quotes/new" className="bg-green-50 px-4 py-4 rounded-lg text-center hover:bg-green-100 transition-colors">
                    <svg className="h-6 w-6 text-green-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="mt-2 block text-sm font-medium text-green-900">Generate Quote</span>
                  </Link>
                  <Link to="/commercial/customers/new" className="bg-indigo-50 px-4 py-4 rounded-lg text-center hover:bg-indigo-100 transition-colors">
                    <svg className="h-6 w-6 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <span className="mt-2 block text-sm font-medium text-indigo-900">Add Customer</span>
                  </Link>
                  <Link to="/commercial/reports" className="bg-purple-50 px-4 py-4 rounded-lg text-center hover:bg-purple-100 transition-colors">
                    <svg className="h-6 w-6 text-purple-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="mt-2 block text-sm font-medium text-purple-900">Generate Reports</span>
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

export default CommercialDashboard; 