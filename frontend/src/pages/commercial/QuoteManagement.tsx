import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { Link } from 'react-router-dom';

interface QuoteItem {
  id: number;
  product: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount: number;
  total: number;
}

interface Quote {
  id: number;
  quote_number: string;
  customer_name: string;
  customer_email: string;
  customer_company: string;
  date_created: string;
  valid_until: string;
  status: string;
  status_display: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  notes: string;
  items: QuoteItem[];
  created_at: string;
  updated_at: string;
}

// Interface for paginated API response
interface ApiResponse {
  results: Quote[];
  count: number;
  next: string | null;
  previous: string | null;
}

const QuoteManagement: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

  // Fetch quotes from API
  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const response = await apiService.get<ApiResponse>('commercial/quotes/');
        
        // Check if response is an object with results property (paginated response)
        if (response && typeof response === 'object') {
          const quoteData = response.results ? response.results : 
                           (Array.isArray(response) ? response : []);
          setQuotes(quoteData);
          setFilteredQuotes(quoteData);
        } else {
          // Fallback to empty array if response is invalid
          setQuotes([]);
          setFilteredQuotes([]);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching quotes:', err);
        setError('Failed to load quotes. Please try again later.');
        setLoading(false);
        // Initialize with empty arrays to prevent errors
        setQuotes([]);
        setFilteredQuotes([]);
      }
    };

    fetchQuotes();
  }, []);

  // Filter quotes based on search term and status filter
  useEffect(() => {
    let result = quotes;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(quote => 
        quote.quote_number.toLowerCase().includes(term) || 
        quote.customer_name.toLowerCase().includes(term)
      );
    }
    
    if (statusFilter) {
      result = result.filter(quote => quote.status === statusFilter);
    }
    
    setFilteredQuotes(result);
  }, [quotes, searchTerm, statusFilter]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch(status) {
      case 'DR': return 'bg-gray-100 text-gray-800';
      case 'SE': return 'bg-blue-100 text-blue-800';
      case 'AC': return 'bg-green-100 text-green-800';
      case 'RE': return 'bg-red-100 text-red-800';
      case 'EX': return 'bg-yellow-100 text-yellow-800';
      case 'CO': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // View quote details
  const viewQuoteDetails = (quote: Quote) => {
    setSelectedQuote(quote);
    setViewMode('detail');
  };

  // Back to list view
  const backToList = () => {
    setViewMode('list');
    setSelectedQuote(null);
  };

  // Update quote status
  const updateQuoteStatus = async (quoteId: number, newStatus: string) => {
    try {
      await apiService.post(`commercial/quotes/${quoteId}/update_status/`, { status: newStatus });
      
      // Update local state
      const updatedQuotes = quotes.map(quote => {
        if (quote.id === quoteId) {
          const statusMap: Record<string, string> = {
            'DR': 'Draft',
            'SE': 'Sent',
            'AC': 'Accepted',
            'RE': 'Rejected',
            'EX': 'Expired',
            'CO': 'Converted to Order'
          };
          
          return {
            ...quote,
            status: newStatus,
            status_display: statusMap[newStatus] || newStatus
          };
        }
        return quote;
      });
      
      setQuotes(updatedQuotes);
      
      // If we're viewing the selected quote, update it
      if (selectedQuote && selectedQuote.id === quoteId) {
        const updatedQuote = updatedQuotes.find(q => q.id === quoteId);
        if (updatedQuote) {
          setSelectedQuote(updatedQuote);
        }
      }
    } catch (err) {
      console.error('Error updating quote status:', err);
      setError('Failed to update quote status. Please try again.');
    }
  };

  // Convert quote to order
  const convertToOrder = async (quoteId: number) => {
    try {
      await apiService.post(`commercial/quotes/${quoteId}/create_order/`, {});
      
      // Update local state - mark as converted
      const updatedQuotes = quotes.map(quote => {
        if (quote.id === quoteId) {
          return {
            ...quote,
            status: 'CO',
            status_display: 'Converted to Order'
          };
        }
        return quote;
      });
      
      setQuotes(updatedQuotes);
      
      // If we're viewing the selected quote, update it
      if (selectedQuote && selectedQuote.id === quoteId) {
        const updatedQuote = updatedQuotes.find(q => q.id === quoteId);
        if (updatedQuote) {
          setSelectedQuote(updatedQuote);
        }
      }
    } catch (err) {
      console.error('Error converting quote to order:', err);
      setError('Failed to convert quote to order. Please try again.');
    }
  };

  // Send quote to customer
  const sendQuote = async (quoteId: number) => {
    try {
      await apiService.post(`commercial/quotes/${quoteId}/send/`, {});
      
      // Update local state
      const updatedQuotes = quotes.map(quote => {
        if (quote.id === quoteId) {
          return {
            ...quote,
            status: 'SE',
            status_display: 'Sent'
          };
        }
        return quote;
      });
      
      setQuotes(updatedQuotes);
      
      // If we're viewing the selected quote, update it
      if (selectedQuote && selectedQuote.id === quoteId) {
        const updatedQuote = updatedQuotes.find(q => q.id === quoteId);
        if (updatedQuote) {
          setSelectedQuote(updatedQuote);
        }
      }
    } catch (err) {
      console.error('Error sending quote:', err);
      setError('Failed to send quote. Please try again.');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg">
        <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
        <p className="text-red-600">{error}</p>
        <button 
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          onClick={() => window.location.reload()}
        >
          Reload
        </button>
      </div>
    );
  }

  // Quote list view
  if (viewMode === 'list') {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Quote Management</h1>
        
        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search quotes..."
              className="px-4 py-2 border rounded-lg w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          
          <select
            className="px-4 py-2 border rounded-lg"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="DR">Draft</option>
            <option value="SE">Sent</option>
            <option value="AC">Accepted</option>
            <option value="RE">Rejected</option>
            <option value="EX">Expired</option>
            <option value="CO">Converted to Order</option>
          </select>
        </div>
        
        {/* Quote Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quote #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valid Until
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQuotes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      No quotes found
                    </td>
                  </tr>
                ) : (
                  filteredQuotes.map((quote) => (
                    <tr key={quote.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-blue-600 cursor-pointer"
                             onClick={() => viewQuoteDetails(quote)}>
                          {quote.quote_number}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{quote.customer_name}</div>
                        {quote.customer_company && (
                          <div className="text-sm text-gray-500">{quote.customer_company}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(quote.date_created)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(quote.valid_until)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(quote.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(quote.status)}`}>
                          {quote.status_display}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => viewQuoteDetails(quote)}
                          className="text-indigo-600 hover:text-indigo-900 mr-2"
                        >
                          View
                        </button>
                        
                        {quote.status === 'DR' && (
                          <button
                            onClick={() => sendQuote(quote.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Send
                          </button>
                        )}
                        
                        {quote.status === 'AC' && (
                          <button
                            onClick={() => convertToOrder(quote.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Convert
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Quote detail view
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={backToList}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg
            className="h-5 w-5 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Quotes
        </button>
        
        <div className="flex gap-2">
          {selectedQuote?.status === 'DR' && (
            <button
              onClick={() => sendQuote(selectedQuote.id)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Send Quote
            </button>
          )}
          
          {selectedQuote?.status === 'AC' && (
            <button
              onClick={() => convertToOrder(selectedQuote.id)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Convert to Order
            </button>
          )}
          
          {selectedQuote?.status !== 'CO' && selectedQuote?.status !== 'EX' && (
            <div className="relative inline-block text-left">
              <select
                className="px-4 py-2 border rounded-lg"
                value={selectedQuote?.status}
                onChange={(e) => updateQuoteStatus(selectedQuote!.id, e.target.value)}
              >
                <option value="DR">Draft</option>
                <option value="SE">Sent</option>
                <option value="AC">Accepted</option>
                <option value="RE">Rejected</option>
                <option value="EX">Expired</option>
              </select>
            </div>
          )}
        </div>
      </div>
      
      {selectedQuote && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Quote Header */}
          <div className="p-6 border-b">
            <div className="flex justify-between">
              <div>
                <h2 className="text-2xl font-bold">{selectedQuote.quote_number}</h2>
                <div className="mt-1">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(selectedQuote.status)}`}>
                    {selectedQuote.status_display}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Created: {formatDate(selectedQuote.date_created)}</div>
                <div className="text-sm text-gray-500">Valid Until: {formatDate(selectedQuote.valid_until)}</div>
              </div>
            </div>
          </div>
          
          {/* Customer Information */}
          <div className="p-6 border-b">
            <h3 className="text-lg font-medium mb-4">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{selectedQuote.customer_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{selectedQuote.customer_email}</p>
              </div>
              {selectedQuote.customer_company && (
                <div>
                  <p className="text-sm text-gray-500">Company</p>
                  <p className="font-medium">{selectedQuote.customer_company}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Quote Items */}
          <div className="p-6 border-b">
            <h3 className="text-lg font-medium mb-4">Quote Items</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Discount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedQuote.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.product_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(item.discount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Quote Summary */}
          <div className="p-6 border-b">
            <div className="flex justify-end">
              <div className="w-full md:w-1/3">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(selectedQuote.subtotal)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium">{formatCurrency(selectedQuote.discount)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">{formatCurrency(selectedQuote.tax)}</span>
                </div>
                <div className="flex justify-between py-2 text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(selectedQuote.total)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Notes */}
          {selectedQuote.notes && (
            <div className="p-6">
              <h3 className="text-lg font-medium mb-2">Notes</h3>
              <p className="text-gray-600 whitespace-pre-line">{selectedQuote.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuoteManagement; 