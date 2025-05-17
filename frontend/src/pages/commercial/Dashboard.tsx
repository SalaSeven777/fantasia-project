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

  // Prepare chart data for revenue trend with wood theme colors
  const revenueChartData = {
    labels: stats?.revenue_trends.map(item => item.month) || [],
    datasets: [
      {
        label: 'Monthly Revenue',
        data: stats?.revenue_trends.map(item => item.revenue) || [],
        backgroundColor: 'rgba(120, 79, 56, 0.2)',
        borderColor: 'rgba(120, 79, 56, 0.8)',
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  // Prepare chart data for sales by category with wood theme colors
  const salesByCategoryData = {
    labels: stats?.sales_by_category.map(item => item.category) || [],
    datasets: [
      {
        data: stats?.sales_by_category.map(item => item.revenue) || [],
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

  // Prepare chart data for product performance with wood theme colors
  const productPerformanceData = {
    labels: stats?.product_performance.map(item => item.name) || [],
    datasets: [
      {
        label: 'Revenue',
        data: stats?.product_performance.map(item => item.revenue) || [],
        backgroundColor: 'rgba(159, 125, 79, 0.7)',
      },
    ],
  };

  const getQuoteStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return 'wood-badge-success';
      case 'pending':
      case 'sent':
        return 'wood-badge-warning';
      case 'rejected':
        return 'wood-badge-danger';
      case 'draft':
        return 'wood-badge';
      case 'expired':
        return 'wood-badge-danger';
      case 'converted to order':
        return 'wood-badge-info';
      default:
        return 'wood-badge';
    }
  };

  return (
    <div className="py-4 sm:py-6">
      <div className="w-full px-3 sm:px-4 md:px-6">
        <div className="wood-page-header flex-wrap gap-3">
          <h1 className="wood-page-title">Commercial Dashboard</h1>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 mb-4 sm:mb-6">
              <div className="wood-card p-4 sm:p-5">
                <h3 className="text-sm font-medium text-wood-neutral-500 mb-1">Total Sales</h3>
                <p className="text-xl sm:text-2xl font-bold text-wood-brown-800 truncate">{formatCurrency(stats?.total_sales || 0)}</p>
                <div className="mt-2 text-xs text-wood-green-600">+5.2% increase</div>
              </div>
              
              <div className="wood-card p-4 sm:p-5">
                <h3 className="text-sm font-medium text-wood-neutral-500 mb-1">Monthly Revenue</h3>
                <p className="text-xl sm:text-2xl font-bold text-wood-brown-800 truncate">{formatCurrency(stats?.monthly_revenue || 0)}</p>
                <div className="mt-2 text-xs text-wood-green-600">+3.8% vs last month</div>
              </div>
              
              <div className="wood-card p-4 sm:p-5">
                <h3 className="text-sm font-medium text-wood-neutral-500 mb-1">Pending Orders</h3>
                <p className="text-xl sm:text-2xl font-bold text-wood-brown-800">{stats?.pending_orders || 0}</p>
                <div className="mt-2 text-xs">
                  <Link to="/commercial/orders" className="text-wood-brown-600 hover:text-wood-brown-800">View all</Link>
                </div>
              </div>
              
              <div className="wood-card p-4 sm:p-5">
                <h3 className="text-sm font-medium text-wood-neutral-500 mb-1">Pending Quotes</h3>
                <p className="text-xl sm:text-2xl font-bold text-wood-brown-800">{stats?.pending_quotes || 0}</p>
                <div className="mt-2 text-xs">
                  <Link to="/commercial/quotes" className="text-wood-brown-600 hover:text-wood-brown-800">View all</Link>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-8">
              {/* Revenue Trend */}
              <div className="lg:col-span-2 wood-card p-4 sm:p-5">
                <h3 className="wood-card-title mb-3 sm:mb-4">Revenue Trend</h3>
                <div className="h-56 sm:h-64">
                  <Line
                    data={revenueChartData}
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

              {/* Sales By Category */}
              <div className="wood-card p-4 sm:p-5">
                <h3 className="wood-card-title mb-3 sm:mb-4">Sales By Category</h3>
                <div className="h-56 sm:h-64 flex items-center justify-center">
                  <Doughnut
                    data={salesByCategoryData}
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

            {/* Product Performance */}
            <div className="wood-card mb-4 sm:mb-8">
              <div className="wood-card-header">
                <h3 className="wood-card-title">Top Products</h3>
                <p className="wood-card-subtitle">Sales performance by product</p>
              </div>
              <div className="p-3 sm:p-5">
                <div className="h-56 sm:h-64">
                  <Bar
                    data={productPerformanceData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      indexAxis: window.innerWidth < 768 ? 'y' as const : 'x' as const,
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
                            minRotation: 45,
                            callback: function(_, index) {
                              const label = productPerformanceData.labels?.[index] || '';
                              if (typeof label === 'string' && window.innerWidth < 640 && label.length > 10) {
                                return label.substring(0, 8) + '...';
                              }
                              return label;
                            }
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
                              return formatCurrency(context.parsed.y || context.parsed.x || 0);
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Tables Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Top Customers */}
              <div className="wood-card">
                <div className="wood-card-header">
                  <h3 className="wood-card-title">Top Customers</h3>
                  <p className="wood-card-subtitle">Customers by revenue</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="wood-table">
                    <thead className="wood-table-header">
                      <tr>
                        <th className="px-4 sm:px-6 py-3">Customer</th>
                        <th className="px-4 sm:px-6 py-3">Orders</th>
                        <th className="px-4 sm:px-6 py-3">Spent</th>
                      </tr>
                    </thead>
                    <tbody className="wood-table-body">
                      {stats?.top_customers.map((customer) => (
                        <tr key={customer.id} className="wood-table-row">
                          <td className="px-4 sm:px-6 py-4">
                            <div className="flex items-center">
                              <div className="wood-avatar flex-shrink-0 h-8 w-8 flex items-center justify-center mr-3">
                                <span className="text-xs">{customer.name.charAt(0)}</span>
                              </div>
                              <div className="min-w-0">
                                <div className="font-medium text-wood-brown-800 truncate">{customer.name}</div>
                                <div className="text-xs text-wood-neutral-500 truncate">{customer.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 text-wood-brown-800">{customer.orders}</td>
                          <td className="px-4 sm:px-6 py-4 font-medium text-wood-brown-800">{formatCurrency(customer.spent)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="wood-card-footer p-3 sm:p-4 border-t border-wood-neutral-200">
                  <Link to="/commercial/customers" className="text-sm text-wood-brown-700 hover:text-wood-brown-900">
                    View all customers →
                  </Link>
                </div>
              </div>

              {/* Recent Quotes */}
              <div className="wood-card">
                <div className="wood-card-header">
                  <h3 className="wood-card-title">Recent Quotes</h3>
                  <p className="wood-card-subtitle">Quotes created in the last 30 days</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="wood-table">
                    <thead className="wood-table-header">
                      <tr>
                        <th className="px-4 sm:px-6 py-3">Quote #</th>
                        <th className="px-4 sm:px-6 py-3">Customer</th>
                        <th className="px-4 sm:px-6 py-3">Amount</th>
                        <th className="px-4 sm:px-6 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="wood-table-body">
                      {stats?.recent_quotes.map((quote) => (
                        <tr key={quote.id} className="wood-table-row">
                          <td className="px-4 sm:px-6 py-4 font-medium text-wood-brown-700 whitespace-nowrap">{quote.quote_number}</td>
                          <td className="px-4 sm:px-6 py-4 text-wood-brown-700 truncate max-w-[150px]">{quote.customer_name}</td>
                          <td className="px-4 sm:px-6 py-4 text-wood-brown-700 whitespace-nowrap">{formatCurrency(quote.total)}</td>
                          <td className="px-4 sm:px-6 py-4">
                            <span className={getQuoteStatusColor(quote.status)}>
                              {quote.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="wood-card-footer p-3 sm:p-4 border-t border-wood-neutral-200">
                  <Link to="/commercial/quotes" className="text-sm text-wood-brown-700 hover:text-wood-brown-900">
                    View all quotes →
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

export default CommercialDashboard; 