import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { billingService } from '../../services/billing.service';
import { Invoice } from '../../types';
import { 
  DocumentTextIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  PlusIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  ExclamationCircleIcon,
  ClockIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

const InvoiceManagement: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Call the billing service to get invoices
      const response = await billingService.getInvoices();
      
      if (Array.isArray(response)) {
        setInvoices(response);
      } else if ('results' in response) {
        setInvoices(response.results);
      } else {
        setInvoices([]);
      }
    } catch (err) {
      console.error("Error fetching invoices:", err);
      setError("Failed to load invoices. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field: string) => {
    // If clicking the same field, toggle direction
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Filter and sort invoices
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.client_username && invoice.client_username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (invoice.notes && invoice.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = !statusFilter || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    const fieldA = a[sortField as keyof Invoice];
    const fieldB = b[sortField as keyof Invoice];
    
    if (fieldA === undefined || fieldB === undefined) return 0;
    
    let comparison = 0;
    if (typeof fieldA === 'string' && typeof fieldB === 'string') {
      comparison = fieldA.localeCompare(fieldB);
    } else if (typeof fieldA === 'number' && typeof fieldB === 'number') {
      comparison = fieldA - fieldB;
    } else if (fieldA instanceof Date && fieldB instanceof Date) {
      comparison = fieldA.getTime() - fieldB.getTime();
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInvoices = filteredInvoices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

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

  if (isLoading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Invoice Management</h1>
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
          <h1 className="text-2xl font-semibold text-gray-900">Invoice Management</h1>
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
                    onClick={fetchInvoices}
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

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Invoice Management</h1>
          <div className="mt-4 md:mt-0">
            <Link
              to="/billing/new-invoice"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              New Invoice
            </Link>
          </div>
        </div>

        <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
          {/* Filters and Search */}
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
              <div className="relative rounded-md shadow-sm max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              
              <div className="flex items-center">
                <span className="mr-2 text-sm text-gray-500">Filter by status:</span>
                <div className="relative inline-block text-left">
                  <select
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={statusFilter}
                    onChange={(e) => handleStatusFilterChange(e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="DR">Draft</option>
                    <option value="PE">Pending</option>
                    <option value="PA">Paid</option>
                    <option value="PP">Partially Paid</option>
                    <option value="OV">Overdue</option>
                    <option value="CA">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('invoice_number')}
                  >
                    <div className="flex items-center">
                      <span>Invoice #</span>
                      {sortField === 'invoice_number' && (
                        sortDirection === 'asc' ? 
                        <ArrowUpIcon className="ml-1 h-4 w-4" /> : 
                        <ArrowDownIcon className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('client_username')}
                  >
                    <div className="flex items-center">
                      <span>Client</span>
                      {sortField === 'client_username' && (
                        sortDirection === 'asc' ? 
                        <ArrowUpIcon className="ml-1 h-4 w-4" /> : 
                        <ArrowDownIcon className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('issue_date')}
                  >
                    <div className="flex items-center">
                      <span>Issue Date</span>
                      {sortField === 'issue_date' && (
                        sortDirection === 'asc' ? 
                        <ArrowUpIcon className="ml-1 h-4 w-4" /> : 
                        <ArrowDownIcon className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('due_date')}
                  >
                    <div className="flex items-center">
                      <span>Due Date</span>
                      {sortField === 'due_date' && (
                        sortDirection === 'asc' ? 
                        <ArrowUpIcon className="ml-1 h-4 w-4" /> : 
                        <ArrowDownIcon className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('total_amount')}
                  >
                    <div className="flex items-center">
                      <span>Amount</span>
                      {sortField === 'total_amount' && (
                        sortDirection === 'asc' ? 
                        <ArrowUpIcon className="ml-1 h-4 w-4" /> : 
                        <ArrowDownIcon className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentInvoices.length > 0 ? (
                  currentInvoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {invoice.invoice_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {invoice.client_username || `Client ID: ${invoice.client}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(invoice.issue_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(invoice.due_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(invoice.total_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(invoice.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/billing/invoices/${invoice.id}`}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          <EyeIcon className="h-5 w-5 inline" aria-hidden="true" />
                        </Link>
                        <Link
                          to={`/billing/invoices/${invoice.id}/edit`}
                          className="text-yellow-600 hover:text-yellow-900 mr-3"
                        >
                          <PencilIcon className="h-5 w-5 inline" aria-hidden="true" />
                        </Link>
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete invoice ${invoice.invoice_number}?`)) {
                              // Add delete functionality here
                              console.log('Delete invoice:', invoice.id);
                            }
                          }}
                        >
                          <TrashIcon className="h-5 w-5 inline" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      No invoices found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredInvoices.length > 0 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(indexOfLastItem, filteredInvoices.length)}
                    </span>{' '}
                    of <span className="font-medium">{filteredInvoices.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceManagement; 