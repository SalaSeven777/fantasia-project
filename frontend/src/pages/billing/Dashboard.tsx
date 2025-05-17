import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/api';
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

interface PaymentStats {
  totalRevenue: number;
  pendingInvoices: number;
  overdueInvoices: number;
  paidInvoices: number;
  revenueByMonth: { month: string; revenue: number }[];
  paymentMethods: { method: string; percentage: number }[];
  recentInvoices: {
    id: number;
    invoice_number: string;
    customer_name: string;
    amount: number;
    status: string;
    date: string;
    due_date: string;
  }[];
}

const BillingDashboard: React.FC = () => {
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        try {
          const response = await apiService.get<PaymentStats>('billing/dashboard-stats/');
          setStats(response);
        } catch (err) {
          console.log('API failed, using mock data');
          // Mock data as fallback
          setStats({
            totalRevenue: 428500,
            pendingInvoices: 12,
            overdueInvoices: 5,
            paidInvoices: 87,
            revenueByMonth: [
              { month: 'Jan', revenue: 32000 },
              { month: 'Feb', revenue: 38000 },
              { month: 'Mar', revenue: 42000 },
              { month: 'Apr', revenue: 35000 },
              { month: 'May', revenue: 40000 },
              { month: 'Jun', revenue: 46000 },
              { month: 'Jul', revenue: 58000 },
              { month: 'Aug', revenue: 51000 },
              { month: 'Sep', revenue: 45000 },
              { month: 'Oct', revenue: 39000 },
              { month: 'Nov', revenue: 42500 },
              { month: 'Dec', revenue: 0 },
            ],
            paymentMethods: [
              { method: 'Credit Card', percentage: 45 },
              { method: 'Bank Transfer', percentage: 30 },
              { method: 'Digital Wallet', percentage: 15 },
              { method: 'Invoice Payment', percentage: 10 }
            ],
            recentInvoices: [
              { 
                id: 1, 
                invoice_number: 'INV-2023-001', 
                customer_name: 'Acme Furniture', 
                amount: 4800, 
                status: 'paid', 
                date: '2023-10-15', 
                due_date: '2023-11-15'
              },
              { 
                id: 2, 
                invoice_number: 'INV-2023-002', 
                customer_name: 'Modern Interiors', 
                amount: 3200, 
                status: 'pending', 
                date: '2023-10-18', 
                due_date: '2023-11-18'
              },
              { 
                id: 3, 
                invoice_number: 'INV-2023-003', 
                customer_name: 'City Builders', 
                amount: 7600, 
                status: 'paid', 
                date: '2023-10-20', 
                due_date: '2023-11-20'
              },
              { 
                id: 4, 
                invoice_number: 'INV-2023-004', 
                customer_name: 'Dream Home Renovations', 
                amount: 3800, 
                status: 'overdue', 
                date: '2023-09-25', 
                due_date: '2023-10-25'
              },
              { 
                id: 5, 
                invoice_number: 'INV-2023-005', 
                customer_name: 'Premier Woodworks', 
                amount: 5900, 
                status: 'paid', 
                date: '2023-10-05', 
                due_date: '2023-11-05'
              },
            ]
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching billing data:', error);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Format currency helper
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Revenue by month chart data
  const revenueChartData = {
    labels: stats?.revenueByMonth.map(item => item.month) || [],
    datasets: [
      {
        label: 'Revenue',
        data: stats?.revenueByMonth.map(item => item.revenue) || [],
        backgroundColor: 'rgba(120, 79, 56, 0.2)',
        borderColor: 'rgba(120, 79, 56, 0.8)',
        borderWidth: 2,
        tension: 0.4,
      }
    ]
  };

  // Payment methods chart data
  const paymentMethodsData = {
    labels: stats?.paymentMethods.map(item => item.method) || [],
    datasets: [
      {
        data: stats?.paymentMethods.map(item => item.percentage) || [],
        backgroundColor: [
          'rgba(120, 79, 56, 0.8)',
          'rgba(159, 125, 79, 0.8)',
          'rgba(193, 154, 107, 0.8)',
          'rgba(219, 202, 155, 0.8)',
        ],
        borderWidth: 1,
      }
    ]
  };

  // Get status badge color
  const getStatusBadgeClass = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'wood-badge-success';
      case 'pending':
        return 'wood-badge-warning';
      case 'overdue':
        return 'wood-badge-danger';
      default:
        return 'wood-badge';
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="wood-page-header">
          <h1 className="wood-page-title">Billing Dashboard</h1>
          <div>
            <Link to="/billing/new-invoice" className="wood-button-primary">
              Create Invoice
            </Link>
          </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
              <div className="wood-card p-5">
                <h3 className="text-sm font-medium text-wood-neutral-500 mb-1">Total Revenue</h3>
                <p className="text-2xl font-bold text-wood-brown-800">{formatCurrency(stats?.totalRevenue || 0)}</p>
                <div className="mt-2 text-xs text-wood-green-600">+8.2% vs last year</div>
              </div>
              
              <div className="wood-card p-5">
                <h3 className="text-sm font-medium text-wood-neutral-500 mb-1">Pending Invoices</h3>
                <p className="text-2xl font-bold text-wood-brown-800">{stats?.pendingInvoices || 0}</p>
                <div className="mt-2 text-xs text-wood-neutral-500">
                  <Link to="/billing/invoices?status=pending" className="text-wood-brown-600 hover:text-wood-brown-800">
                    View pending
                  </Link>
                </div>
              </div>
              
              <div className="wood-card p-5">
                <h3 className="text-sm font-medium text-wood-neutral-500 mb-1">Overdue Invoices</h3>
                <p className="text-2xl font-bold text-wood-brown-800">{stats?.overdueInvoices || 0}</p>
                <div className="mt-2 text-xs text-wood-red-500">Requires attention</div>
              </div>
              
              <div className="wood-card p-5">
                <h3 className="text-sm font-medium text-wood-neutral-500 mb-1">Paid Invoices</h3>
                <p className="text-2xl font-bold text-wood-brown-800">{stats?.paidInvoices || 0}</p>
                <div className="mt-2 text-xs text-wood-neutral-500">This year</div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Revenue Chart */}
              <div className="lg:col-span-2 wood-card p-5">
                <h3 className="wood-card-title mb-4">Revenue Trend</h3>
                <div className="h-64">
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

              {/* Payment Methods */}
              <div className="wood-card p-5">
                <h3 className="wood-card-title mb-4">Payment Methods</h3>
                <div className="h-64 flex items-center justify-center">
                  <Doughnut
                    data={paymentMethodsData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            boxWidth: 12,
                            padding: 15
                          }
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return `${context.label}: ${context.parsed}%`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Recent Invoices */}
            <div className="wood-card">
              <div className="wood-card-header">
                <h3 className="wood-card-title">Recent Invoices</h3>
                <p className="wood-card-subtitle">Last 30 days of activity</p>
              </div>
              <div className="overflow-x-auto">
                <table className="wood-table">
                  <thead className="wood-table-header">
                    <tr>
                      <th className="px-6 py-3">Invoice #</th>
                      <th className="px-6 py-3">Customer</th>
                      <th className="px-6 py-3">Amount</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Due Date</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="wood-table-body">
                    {stats?.recentInvoices.map((invoice) => (
                      <tr key={invoice.id} className="wood-table-row">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-wood-brown-700">
                          {invoice.invoice_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-wood-brown-700">
                          {invoice.customer_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-wood-brown-700">
                          {formatCurrency(invoice.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-wood-neutral-600">
                          {new Date(invoice.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-wood-neutral-600">
                          {new Date(invoice.due_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={getStatusBadgeClass(invoice.status)}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Link 
                            to={`/billing/invoices/${invoice.id}`} 
                            className="wood-button-secondary-sm"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="wood-card-footer p-4 border-t border-wood-neutral-200">
                <Link to="/billing/invoices" className="text-sm text-wood-brown-700 hover:text-wood-brown-900">
                  View all invoices →
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BillingDashboard; 