import React, { useState, useEffect } from 'react';
import { billingService } from '../../services/billing.service';
import { Invoice, InvoiceStatistics } from '../../types';
import { 
  ChartBarIcon, 
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  ExclamationCircleIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

const FinancialReports: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<InvoiceStatistics | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch invoice statistics
      try {
        const statsData = await billingService.getInvoiceStats();
        setStats(statsData);
      } catch (statsError) {
        console.warn('Statistics endpoint not available:', statsError);
      }
      
      // Fetch invoices for calculating more detailed reports
      const invoicesData = await billingService.getInvoices();
      
      if (Array.isArray(invoicesData)) {
        setInvoices(invoicesData);
      } else if ('results' in invoicesData) {
        setInvoices(invoicesData.results);
      } else {
        setInvoices([]);
      }
      
      // If we didn't get stats from the API, generate them from invoices
      if (!stats && invoices.length > 0) {
        setStats(generateStatsFromInvoices(invoices));
      }
      
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError('Failed to load financial data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to generate statistics if the API endpoint is not available
  const generateStatsFromInvoices = (invoices: Invoice[]): InvoiceStatistics => {
    if (!Array.isArray(invoices) || invoices.length === 0) {
      return {
        total_invoices: 0,
        total_amount: 0,
        paid_amount: 0,
        pending_amount: 0,
        overdue_amount: 0,
        payment_rate: 0,
        by_status: {
          draft: 0,
          pending: 0,
          paid: 0,
          partially_paid: 0,
          overdue: 0,
          cancelled: 0,
        }
      };
    }
    
    const total = invoices.length;
    const totalAmount = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    
    const byStatus = {
      draft: invoices.filter(inv => inv.status === 'DR').length,
      pending: invoices.filter(inv => inv.status === 'PE').length,
      paid: invoices.filter(inv => inv.status === 'PA').length,
      partially_paid: invoices.filter(inv => inv.status === 'PP').length,
      overdue: invoices.filter(inv => inv.status === 'OV').length,
      cancelled: invoices.filter(inv => inv.status === 'CA').length,
    };
    
    const paidAmount = invoices
      .filter(inv => inv.status === 'PA')
      .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
      
    const pendingAmount = invoices
      .filter(inv => ['PE', 'PP'].includes(inv.status))
      .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
      
    const overdueAmount = invoices
      .filter(inv => inv.status === 'OV')
      .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
      
    return {
      total_invoices: total,
      total_amount: totalAmount,
      paid_amount: paidAmount,
      pending_amount: pendingAmount,
      overdue_amount: overdueAmount,
      payment_rate: total > 0 ? (byStatus.paid / total) * 100 : 0,
      by_status: byStatus
    };
  };

  // Get monthly revenue data
  const getMonthlyRevenue = () => {
    const now = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize with zeros for the last 6 months
    const monthlyData: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${monthNames[month.getMonth()]} ${month.getFullYear()}`;
      monthlyData[key] = 0;
    }
    
    // Calculate revenue for each month
    invoices.forEach(invoice => {
      if (invoice.status === 'PA' || invoice.status === 'PP') {
        const date = new Date(invoice.issue_date);
        const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
        
        // Only include payments from the last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1); // First day of month
        
        if (date >= sixMonthsAgo && monthlyData[key] !== undefined) {
          monthlyData[key] += invoice.status === 'PA' ? invoice.total_amount : (invoice.total_paid || 0);
        }
      }
    });
    
    return Object.entries(monthlyData).map(([month, amount]) => ({
      month,
      amount
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Financial Reports</h1>
          <div className="mt-6 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Financial Reports</h1>
          <div className="mt-6 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  {error}
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={fetchReportData}
                    className="rounded-md bg-red-50 px-2 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const monthlyRevenue = getMonthlyRevenue();

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Financial Reports</h1>
          <div className="flex">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ArrowDownTrayIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" aria-hidden="true" />
              Export
            </button>
          </div>
        </div>

        {/* Report Period Selector */}
        <div className="mt-4 flex justify-end">
          <div className="inline-flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => setPeriod('month')}
              className={`relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                period === 'month' 
                  ? 'bg-indigo-100 text-indigo-700 z-10 border-indigo-500' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setPeriod('quarter')}
              className={`relative -ml-px inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                period === 'quarter' 
                  ? 'bg-indigo-100 text-indigo-700 z-10 border-indigo-500' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Quarterly
            </button>
            <button
              type="button"
              onClick={() => setPeriod('year')}
              className={`relative -ml-px inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                period === 'year' 
                  ? 'bg-indigo-100 text-indigo-700 z-10 border-indigo-500' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Total Revenue */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                    <BanknotesIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{formatCurrency(stats.total_amount)}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <span className="font-medium text-gray-500 truncate">
                    {stats.total_invoices} invoices issued
                  </span>
                </div>
              </div>
            </div>

            {/* Collected Revenue */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <ArrowTrendingUpIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Collected Revenue</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{formatCurrency(stats.paid_amount)}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <span className="font-medium text-gray-500 truncate">
                    {formatPercentage(stats.paid_amount / stats.total_amount * 100)} of total
                  </span>
                </div>
              </div>
            </div>

            {/* Outstanding Revenue */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                    <DocumentTextIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Outstanding Revenue</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {formatCurrency(stats.total_amount - stats.paid_amount)}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <span className="font-medium text-red-600 truncate">
                    {formatCurrency(stats.overdue_amount)} overdue
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Revenue Chart */}
        <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Revenue Over Time</h3>
          </div>
          <div className="px-5 py-6">
            <div className="h-72">
              {/* Revenue Chart will go here - in a real app, we'd use a chart library */}
              <div className="h-full flex flex-col">
                <div className="flex-1 flex items-end space-x-2">
                  {monthlyRevenue.map((item, index) => {
                    const maxValue = Math.max(...monthlyRevenue.map(d => d.amount));
                    const heightPercentage = maxValue > 0 ? (item.amount / maxValue) * 100 : 0;
                    
                    return (
                      <div key={index} className="flex flex-col items-center flex-1">
                        <div 
                          className="w-full bg-indigo-500 rounded-t"
                          style={{ height: `${heightPercentage}%` }}
                        ></div>
                        <div className="text-xs text-gray-500 mt-2">{item.month}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 flex justify-center text-sm text-gray-500">
                  Revenue for the last 6 months
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Status Distribution */}
        {stats && (
          <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Invoice Status Distribution</h3>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <span className="text-2xl font-semibold text-green-700">{stats.by_status.paid}</span>
                  <p className="text-sm text-green-600">Paid</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <span className="text-2xl font-semibold text-yellow-700">{stats.by_status.partially_paid}</span>
                  <p className="text-sm text-yellow-600">Partially Paid</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <span className="text-2xl font-semibold text-blue-700">{stats.by_status.pending}</span>
                  <p className="text-sm text-blue-600">Pending</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <span className="text-2xl font-semibold text-red-700">{stats.by_status.overdue}</span>
                  <p className="text-sm text-red-600">Overdue</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <span className="text-2xl font-semibold text-gray-700">{stats.by_status.draft}</span>
                  <p className="text-sm text-gray-600">Draft</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <span className="text-2xl font-semibold text-gray-700">{stats.by_status.cancelled}</span>
                  <p className="text-sm text-gray-600">Cancelled</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialReports; 