import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { billingService } from '../../services/billing.service';
import { Invoice, User, Order } from '../../types';
import { 
  DocumentTextIcon,
  ExclamationCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const NewInvoice: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [invoiceData, setInvoiceData] = useState<Partial<Invoice>>({
    client: 0,
    order: 0,
    status: 'DR', // Default to Draft
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default to 30 days from now
    subtotal: 0,
    tax_rate: 0,
    tax_amount: 0,
    total_amount: 0,
    notes: ''
  });

  // Fetch clients and orders for the dropdown
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch clients and orders from the API
        let clientsData: User[] = [];
        try {
          const clientsResponse = await billingService.getClients();
          console.log('Received client data:', clientsResponse);
          if (Array.isArray(clientsResponse)) {
            clientsData = clientsResponse;
            console.log('Successfully loaded', clientsData.length, 'clients');
          } else {
            console.error('Client data is not an array:', clientsResponse);
          }
        } catch (clientErr) {
          console.error('Error fetching clients:', clientErr);
          // No fallback mock data - only use real data from backend
        }
        
        let ordersData: Order[] = [];
        try {
          const ordersResponse = await billingService.getOrders();
          if (Array.isArray(ordersResponse)) {
            ordersData = ordersResponse;
          } else {
            console.error('Order data is not an array:', ordersResponse);
          }
        } catch (orderErr) {
          console.error('Error fetching orders:', orderErr);
        }
        
        setClients(clientsData);
        setOrders(ordersData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load required data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'subtotal' || name === 'tax_rate') {
      // Recalculate tax amount and total when subtotal or tax rate changes
      const subtotal = name === 'subtotal' ? parseFloat(value) : invoiceData.subtotal || 0;
      const taxRate = name === 'tax_rate' ? parseFloat(value) : invoiceData.tax_rate || 0;
      const taxAmount = subtotal * (taxRate / 100);
      const totalAmount = subtotal + taxAmount;
      
      setInvoiceData(prev => ({
        ...prev,
        [name]: parseFloat(value),
        tax_amount: taxAmount,
        total_amount: totalAmount
      }));
    } else if (name === 'client' || name === 'order') {
      setInvoiceData(prev => ({
        ...prev,
        [name]: parseInt(value, 10) || 0
      }));
    } else {
      setInvoiceData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Generate invoice number (this would normally be handled by the backend)
      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
      
      const newInvoice = {
        ...invoiceData,
        invoice_number: invoiceNumber
      };
      
      // Call the API to create the invoice
      const createdInvoice = await billingService.createInvoice(newInvoice);
      
      console.log('Invoice created successfully:', createdInvoice);
      
      // Redirect to invoice management page
      navigate('/billing/invoices');
      
    } catch (err) {
      console.error('Error creating invoice:', err);
      setError('Failed to create invoice. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Type-safe helper to get ID value
  const getIdValue = (value: number | User | Order | undefined): string => {
    if (typeof value === 'undefined') return '';
    if (typeof value === 'number') return value.toString();
    return value.id.toString();
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Create New Invoice</h1>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Back
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="mt-6 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
          </div>
        )}

        <div className="mt-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Invoice Information</h3>
              <p className="mt-1 text-sm text-gray-500">
                Create a new invoice by filling out the information below.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-6 gap-6">
                  {/* Client Selection */}
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="client" className="block text-sm font-medium text-gray-700">
                      Client
                    </label>
                    <select
                      id="client"
                      name="client"
                      value={getIdValue(invoiceData.client)}
                      onChange={handleInputChange}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    >
                      <option value="">Select a client</option>
                      {Array.isArray(clients) && clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.username || `Client #${client.id}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Order Selection */}
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="order" className="block text-sm font-medium text-gray-700">
                      Order (Optional)
                    </label>
                    <select
                      id="order"
                      name="order"
                      value={getIdValue(invoiceData.order)}
                      onChange={handleInputChange}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="">None</option>
                      {Array.isArray(orders) && orders.map((order) => (
                        <option key={order.id} value={order.id}>
                          Order #{order.id} - ${order.total_amount ? order.total_amount.toFixed(2) : '0.00'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Issue Date */}
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="issue_date" className="block text-sm font-medium text-gray-700">
                      Issue Date
                    </label>
                    <input
                      type="date"
                      name="issue_date"
                      id="issue_date"
                      value={invoiceData.issue_date || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>

                  {/* Due Date */}
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">
                      Due Date
                    </label>
                    <input
                      type="date"
                      name="due_date"
                      id="due_date"
                      value={invoiceData.due_date || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>

                  {/* Status */}
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={invoiceData.status || 'DR'}
                      onChange={handleInputChange}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    >
                      <option value="DR">Draft</option>
                      <option value="PE">Pending</option>
                      <option value="PA">Paid</option>
                      <option value="PP">Partially Paid</option>
                    </select>
                  </div>

                  {/* Subtotal */}
                  <div className="col-span-6 sm:col-span-2">
                    <label htmlFor="subtotal" className="block text-sm font-medium text-gray-700">
                      Subtotal
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        name="subtotal"
                        id="subtotal"
                        min="0"
                        step="0.01"
                        value={invoiceData.subtotal || ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full pl-7 py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                      />
                    </div>
                  </div>

                  {/* Tax Rate */}
                  <div className="col-span-6 sm:col-span-2">
                    <label htmlFor="tax_rate" className="block text-sm font-medium text-gray-700">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      name="tax_rate"
                      id="tax_rate"
                      min="0"
                      max="100"
                      step="0.01"
                      value={invoiceData.tax_rate || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>

                  {/* Total Amount (calculated) */}
                  <div className="col-span-6 sm:col-span-2">
                    <label htmlFor="total_amount" className="block text-sm font-medium text-gray-700">
                      Total Amount
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        name="total_amount"
                        id="total_amount"
                        value={invoiceData.total_amount?.toFixed(2) || '0.00'}
                        className="mt-1 block w-full pl-7 py-2 px-3 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        disabled
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="col-span-6">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                      Notes
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows={3}
                      value={invoiceData.notes || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => navigate('/billing/invoices')}
                    className="mr-3 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {isLoading ? 'Creating...' : 'Create Invoice'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewInvoice; 