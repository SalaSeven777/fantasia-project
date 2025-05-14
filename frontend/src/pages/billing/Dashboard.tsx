import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { billingService, PaginatedResponse } from '../../services/billing.service';
import { Invoice, InvoiceStatistics } from '../../types';
import { 
  DocumentTextIcon, 
  CurrencyDollarIcon, 
  ArrowDownIcon, 
  ArrowUpIcon,
  ExclamationCircleIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const BillingDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<InvoiceStatistics | null>(null);
  const [filter, setFilter] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBillingData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch invoices from API
        try {
          const invoicesData = await billingService.getInvoices();
          console.log('API response for invoices:', invoicesData);
          
          // Handle different API response formats
          if (Array.isArray(invoicesData) && invoicesData.length > 0) {
            console.log('Setting invoices from array:', invoicesData);
            setInvoices(invoicesData);
          } else if ('results' in invoicesData && Array.isArray(invoicesData.results)) {
            // Handle paginated response
            console.log('Setting invoices from paginated response:', invoicesData.results);
            setInvoices(invoicesData.results);
          } else {
            console.warn('API returned no invoice data');
            setInvoices([]);
          }
        } catch (error) {
          console.error('Failed to fetch invoices from API:', error);
          setError('Failed to load invoices. Please try again later.');
          setInvoices([]);
        }
        
        // Fetch statistics from API
        try {
          const statsData = await billingService.getInvoiceStats();
          if (statsData) {
            setStats(statsData);
          } else {
            // If API returns no stats, calculate from invoices
            setStats(generateStatsFromInvoices(invoices));
          }
        } catch (statsError) {
          console.warn('Statistics endpoint not available:', statsError);
          // Generate stats from invoices if we couldn't get from API
          setStats(generateStatsFromInvoices(invoices));
        }
        
      } catch (err) {
        console.error('Error in overall billing data loading process:', err);
        setError('Failed to load billing data');
      } finally {
        // Ensure loading indicator disappears after everything is done
        setIsLoading(false);
      }
    };

    loadBillingData();
    
    // Clean up function (optional)
    return () => {
      console.log('Billing dashboard unmounting');
    };
  }, []);

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

  // Get display name for status codes
  const getStatusDisplayName = (status: string): string => {
    switch (status) {
      case 'DR': return 'Draft';
      case 'PE': return 'Pending';
      case 'PA': return 'Paid';
      case 'PP': return 'Partially Paid';
      case 'OV': return 'Overdue';
      case 'CA': return 'Cancelled';
      default: return status;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PA':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="mr-1 h-4 w-4" />
            Paid
          </span>
        );
      case 'PE':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <ClockIcon className="mr-1 h-4 w-4" />
            Pending
          </span>
        );
      case 'PP':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="mr-1 h-4 w-4" />
            Partially Paid
          </span>
        );
      case 'OV':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <ExclamationCircleIcon className="mr-1 h-4 w-4" />
            Overdue
          </span>
        );
      case 'DR':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <DocumentTextIcon className="mr-1 h-4 w-4" />
            Draft
          </span>
        );
      case 'CA':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <ExclamationCircleIcon className="mr-1 h-4 w-4" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const filteredInvoices = invoices.filter(invoice => {
    if (!filter) return true;
    
    switch (filter) {
      case 'paid':
        return invoice.status === 'PA';
      case 'pending':
        return invoice.status === 'PE' || invoice.status === 'PP';
      case 'overdue':
        return invoice.status === 'OV';
      case 'draft':
        return invoice.status === 'DR';
      default:
        return true;
    }
  });
  
  // Debug log to check if we have invoices and filtered invoices
  console.log('Current invoices state:', invoices);
  console.log('Filtered invoices:', filteredInvoices);
  console.log('Current filter:', filter);

  if (isLoading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mt-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Billing Dashboard</h1>
          <div className="mt-4 md:mt-0">
            <Link
              to="/billing/new-invoice"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <DocumentTextIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              New Invoice
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Invoiced */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DocumentTextIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Invoiced</dt>
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
                    {stats.total_invoices} invoices
                  </span>
                </div>
              </div>
            </div>

            {/* Paid */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-6 w-6 text-green-400" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Paid</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{formatCurrency(stats.paid_amount)}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <span className="font-medium text-green-600 truncate">
                    {stats.by_status.paid} invoices
                  </span>
                </div>
              </div>
            </div>

            {/* Pending */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-6 w-6 text-yellow-400" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{formatCurrency(stats.pending_amount)}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <span className="font-medium text-yellow-600 truncate">
                    {stats.by_status.pending + stats.by_status.partially_paid} invoices
                  </span>
                </div>
              </div>
            </div>

            {/* Overdue */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ExclamationCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Overdue</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{formatCurrency(stats.overdue_amount)}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <span className="font-medium text-red-600 truncate">
                    {stats.by_status.overdue} invoices
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mt-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setFilter('')}
              className={`${
                filter === ''
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('paid')}
              className={`${
                filter === 'paid'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
            >
              Paid
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`${
                filter === 'pending'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('overdue')}
              className={`${
                filter === 'overdue'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
            >
              Overdue
            </button>
            <button
              onClick={() => setFilter('draft')}
              className={`${
                filter === 'draft'
                  ? 'border-gray-500 text-gray-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
            >
              Draft
            </button>
          </nav>
        </div>

        {/* Invoices Table */}
        <div className="mt-6">
          <div className="flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Invoice
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Client
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Amount
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Date
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredInvoices.length > 0 ? (
                        filteredInvoices.map((invoice) => (
                          <tr key={invoice.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              <div className="flex items-center">
                                <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                                {invoice.invoice_number}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {invoice.client_username || 'Client #' + invoice.client}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(invoice.total_amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex flex-col">
                                <span>Issued: {formatDate(invoice.issue_date)}</span>
                                <span>Due: {formatDate(invoice.due_date)}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(invoice.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex space-x-3 justify-end">
                                <Link
                                  to={`/billing/invoices/${invoice.id}`}
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  View
                                </Link>
                                {(invoice.status === 'PE' || invoice.status === 'PP' || invoice.status === 'OV') && (
                                  <Link
                                    to={`/billing/invoices/${invoice.id}/payment`}
                                    className="text-green-600 hover:text-green-900"
                                  >
                                    Record Payment
                                  </Link>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                            No invoices found matching the selected filter.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingDashboard; 