import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { orderService } from '../../services/order.service';
import { Link } from 'react-router-dom';

// Define component-specific interfaces
interface OrderClient {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  company_name?: string;
}

interface OrderItem {
  id: number;
  product: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

// Component-specific Order interface
interface Order {
  id: number;
  order_number: string;
  client?: OrderClient;
  client_username?: string;
  status: string;
  status_display: string;
  total_amount: number;
  shipping_address: string;
  delivery_notes?: string;
  delivery_date: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

// Interface for status update
interface StatusUpdate {
  status: string;
  notes?: string;
}

// Interface for paginated API response
interface ApiResponse {
  results: Order[];
  count: number;
  next: string | null;
  previous: string | null;
}

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  
  // New state for confirmation dialogs
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [statusUpdateNotes, setStatusUpdateNotes] = useState('');
  const [processingUpdate, setProcessingUpdate] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch orders from API
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please log in to view orders.');
        setLoading(false);
        return;
      }
      
      const orderData = await orderService.getOrders();
      
      if (Array.isArray(orderData)) {
        // Transform the orders to match the component's Order interface
        const transformedOrders: Order[] = orderData.map(order => {
          // Process client data
          let client: OrderClient | undefined;
          if (order.client) {
            client = {
              id: order.client.id,
              email: order.client.email || '',
              first_name: order.client.first_name || order.client.firstName || '',
              last_name: order.client.last_name || order.client.lastName || '',
              company_name: (order.client as any).company_name || undefined
            };
          }
          
          return {
            id: order.id,
            order_number: order.order_number || `Order #${order.id}`,
            client: client,
            client_username: order.client_username || '',
            status: order.status as string,
            status_display: order.status_display || mapStatusCode(order.status as string),
            total_amount: order.total_amount || order.total || 0,
            shipping_address: typeof order.shipping_address === 'string'
              ? order.shipping_address
              : typeof order.shipping_address === 'object' 
                ? JSON.stringify(order.shipping_address)
                : '',
            delivery_notes: order.delivery_notes || '',
            delivery_date: order.delivery_date || null,
            created_at: order.created_at || new Date().toISOString(),
            updated_at: order.updated_at || new Date().toISOString(),
            items: (order.items || []).map(item => ({
              id: item.id || 0,
              product: typeof item.product === 'number' ? item.product : item.product.id,
              product_name: (typeof item.product === 'object' ? item.product.title : '') || 
                item.product_name || `Product #${typeof item.product === 'number' ? item.product : item.product.id}`,
              quantity: item.quantity,
              unit_price: item.unit_price || item.price,
              total_price: item.total_price || (item.quantity * (item.unit_price || item.price))
            }))
          };
        });
        
        setOrders(transformedOrders);
        setFilteredOrders(transformedOrders);
      } else {
        // Fallback to empty array if response is invalid
        console.warn('Invalid order data format');
        setOrders([]);
        setFilteredOrders([]);
      }
      
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      
      // Handle unauthorized errors specifically
      if (err.status === 401 || (err.response && err.response.status === 401)) {
        setError('Your session has expired. Please log in again.');
        // Clear token if unauthorized
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      } else {
        setError('Failed to load orders. Please try again later.');
      }
      
      setLoading(false);
      // Initialize with empty arrays to prevent errors
      setOrders([]);
      setFilteredOrders([]);
    }
  };

  // Call fetchOrders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Function to manually refresh orders
  const refreshOrders = () => {
    fetchOrders();
  };

  // Apply filters
  useEffect(() => {
    let result = orders;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(order => 
        order.order_number.toLowerCase().includes(term) || 
        (order.client && order.client.first_name && order.client.last_name && 
          (order.client.first_name + ' ' + order.client.last_name).toLowerCase().includes(term)) ||
        (order.client && order.client.company_name && 
          order.client.company_name.toLowerCase().includes(term)) ||
        (order.client && order.client.email && 
          order.client.email.toLowerCase().includes(term))
      );
    }
    
    if (statusFilter) {
      result = result.filter(order => order.status === statusFilter);
    }
    
    setFilteredOrders(result);
  }, [orders, searchTerm, statusFilter]);

  // Format currency
  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch(status) {
      case 'PE': return 'bg-yellow-100 text-yellow-800';
      case 'CO': return 'bg-blue-100 text-blue-800';
      case 'PR': return 'bg-indigo-100 text-indigo-800';
      case 'RD': return 'bg-purple-100 text-purple-800';
      case 'IT': return 'bg-cyan-100 text-cyan-800';
      case 'DE': return 'bg-green-100 text-green-800';
      case 'CA': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // View order details
  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setViewMode('detail');
  };

  // Back to list
  const backToList = () => {
    setViewMode('list');
    setSelectedOrder(null);
    setSuccessMessage(null);
  };

  // Open confirm dialog
  const openConfirmDialog = () => {
    if (!selectedOrder) return;
    setStatusUpdateNotes('');
    setShowConfirmDialog(true);
  };

  // Open reject dialog
  const openRejectDialog = () => {
    if (!selectedOrder) return;
    setStatusUpdateNotes('');
    setShowRejectDialog(true);
  };

  // Close dialogs
  const closeDialogs = () => {
    setShowConfirmDialog(false);
    setShowRejectDialog(false);
    setStatusUpdateNotes('');
    setProcessingUpdate(false);
  };

  // Update order status
  const updateOrderStatus = async (data: StatusUpdate) => {
    if (!selectedOrder) return;
    
    setProcessingUpdate(true);
    
    try {
      // Format the data as expected by the backend API
      const updateData = {
        status: data.status,
        // Include other required fields to avoid validation errors
        shipping_address: selectedOrder.shipping_address,
        delivery_notes: data.notes || selectedOrder.delivery_notes || ''
      };
      
      console.log('Sending update to backend:', updateData);
      
      // Call API to update the status
      await apiService.patch(`orders/orders/${selectedOrder.id}/`, updateData);
      
      // Update local state
      const updatedOrders = orders.map(order => {
        if (order.id === selectedOrder.id) {
          const statusMap: Record<string, string> = {
            'PE': 'Pending',
            'CO': 'Confirmed',
            'PR': 'In Production',
            'RD': 'Ready for Delivery',
            'IT': 'In Transit',
            'DE': 'Delivered',
            'CA': 'Cancelled'
          };
          
          return {
            ...order,
            status: data.status,
            status_display: statusMap[data.status] || data.status
          };
        }
        return order;
      });
      
      setOrders(updatedOrders);
      
      // Update the selected order
      const updatedOrder = updatedOrders.find(o => o.id === selectedOrder.id);
      if (updatedOrder) {
        setSelectedOrder(updatedOrder);
      }
      
      // Show success message
      setSuccessMessage(data.status === 'CO' 
        ? 'Order has been successfully confirmed!' 
        : 'Order has been rejected.');
      
      // Close dialogs
      closeDialogs();
    } catch (err: any) {
      console.error('Error updating order status:', err);
      // Show more detailed error information
      let errorMessage = 'Failed to update order status. Please try again.';
      if (err.response && err.response.data) {
        const errorDetails = typeof err.response.data === 'string' 
          ? err.response.data 
          : JSON.stringify(err.response.data);
        errorMessage = `Failed to update order: ${errorDetails}`;
      }
      setError(errorMessage);
      setProcessingUpdate(false);
    }
  };

  // Confirm the order
  const confirmOrder = () => {
    updateOrderStatus({
      status: 'CO',
      notes: statusUpdateNotes || 'Order confirmed by commercial department'
    });
  };

  // Reject the order
  const rejectOrder = () => {
    updateOrderStatus({
      status: 'CA',
      notes: statusUpdateNotes || 'Order rejected by commercial department'
    });
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

  // Order list view
  if (viewMode === 'list') {
  return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Order Management</h1>
        
        {/* Controls */}
        <div className="mb-4 flex flex-col md:flex-row justify-between items-center gap-2">
          <button
            onClick={refreshOrders}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Refresh Orders
          </button>
          
          <div className="text-sm text-gray-500">
            {orders.length} order{orders.length !== 1 ? 's' : ''} found
          </div>
        </div>
        
        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search orders..."
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
            <option value="PE">Pending</option>
            <option value="CO">Confirmed</option>
            <option value="PR">In Production</option>
            <option value="RD">Ready for Delivery</option>
            <option value="IT">In Transit</option>
            <option value="DE">Delivered</option>
            <option value="CA">Cancelled</option>
          </select>
        </div>
        
        {/* No Orders Message */}
        {orders.length === 0 && !loading && !error && (
          <div className="p-6 bg-yellow-50 rounded-lg mb-6">
            <h2 className="text-xl font-semibold text-yellow-700 mb-2">No Orders Found</h2>
            <p className="text-yellow-600 mb-4">
              There are no orders to display. Please check back later or create new orders.
            </p>
            <button 
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
              onClick={refreshOrders}
            >
              Refresh
            </button>
          </div>
        )}
        
        {/* Order Table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ORDER #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CUSTOMER
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DATE
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  AMOUNT
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  STATUS
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length > 0 ? (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.client_username || 
                       (order.client ? 
                        `${order.client.first_name} ${order.client.last_name}` : 
                        'Unknown')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(order.status)}`}>
                        {order.status_display || mapStatusCode(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => viewOrderDetails(order)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Order detail view
  if (viewMode === 'detail' && selectedOrder) {
    return (
      <div className="p-6">
        <div className="flex justify-between mb-6">
          <button
            onClick={backToList}
            className="flex items-center text-indigo-600 hover:text-indigo-900"
          >
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Orders
          </button>
          
          {/* Action buttons for pending orders */}
          {selectedOrder.status === 'PE' && (
            <div className="flex items-center space-x-2">
              <button
                onClick={openConfirmDialog}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                Confirm Order
              </button>
              <button
                onClick={openRejectDialog}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Reject Order
              </button>
            </div>
          )}
          
          {/* Status display for non-pending orders */}
          {selectedOrder.status !== 'PE' && (
            <div className="flex items-center">
              <span className="mr-2 text-sm text-gray-600">Status:</span>
              <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusBadgeColor(selectedOrder.status)}`}>
                {selectedOrder.status_display || mapStatusCode(selectedOrder.status)}
              </span>
            </div>
          )}
        </div>
        
        {/* Success message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{successMessage}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">
              Order {selectedOrder.order_number}
            </h2>
            <p className="text-sm text-gray-600">
              {formatDate(selectedOrder.created_at)}
            </p>
          </div>
          
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-1 md:col-span-2">
                <h3 className="text-md font-semibold mb-3">Customer Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">
                      {selectedOrder.client_username || 
                       (selectedOrder.client ? 
                        `${selectedOrder.client.first_name || ''} ${selectedOrder.client.last_name || ''}` : 
                        'Unknown')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{selectedOrder.client?.email || 'N/A'}</p>
                  </div>
                  {selectedOrder.client?.company_name && (
                    <div>
                      <p className="text-sm text-gray-500">Company</p>
                      <p className="font-medium">{selectedOrder.client.company_name}</p>
                    </div>
                  )}
                </div>
                
                <h3 className="text-md font-semibold mb-3">Shipping Information</h3>
                <div className="mb-6">
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="whitespace-pre-line">{selectedOrder.shipping_address}</p>
                </div>
                
                {selectedOrder.delivery_notes && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-500">Delivery Notes</p>
                    <p className="whitespace-pre-line">{selectedOrder.delivery_notes}</p>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-md font-semibold mb-3">Order Summary</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(selectedOrder.status)}`}>
                      {selectedOrder.status_display || mapStatusCode(selectedOrder.status)}
                    </span>
                  </div>
                  {selectedOrder.delivery_date && (
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Delivery Date</span>
                      <span>{formatDate(selectedOrder.delivery_date)}</span>
                    </div>
                  )}
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Total</span>
                    <span className="font-semibold">{formatCurrency(selectedOrder.total_amount)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <h3 className="text-md font-semibold mt-6 mb-3">Order Items</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          {item.product_name || `Product #${item.product}`}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          {formatCurrency(item.unit_price)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                          {formatCurrency(item.total_price)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-center text-sm text-gray-500">
                        No items found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Confirm Order Dialog */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border shadow-lg rounded-md bg-white w-full max-w-md">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Confirm Order</h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to confirm order {selectedOrder.order_number}? This will mark it as ready for production.
                  </p>
                  <div className="mt-4">
                    <textarea
                      className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
                      rows={4}
                      placeholder="Add notes about this confirmation (optional)"
                      value={statusUpdateNotes}
                      onChange={(e) => setStatusUpdateNotes(e.target.value)}
                    ></textarea>
                  </div>
                </div>
                <div className="flex justify-end px-4 py-3">
                  <button
                    onClick={closeDialogs}
                    className="bg-gray-200 px-4 py-2 rounded-md text-sm font-medium text-gray-800 mr-2"
                    disabled={processingUpdate}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmOrder}
                    className="bg-green-500 px-4 py-2 rounded-md text-sm font-medium text-white"
                    disabled={processingUpdate}
                  >
                    {processingUpdate ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing
                      </span>
                    ) : (
                      'Confirm Order'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Reject Order Dialog */}
        {showRejectDialog && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border shadow-lg rounded-md bg-white w-full max-w-md">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Reject Order</h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to reject order {selectedOrder.order_number}? This action cannot be undone.
                  </p>
                  <div className="mt-4">
                    <textarea
                      className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
                      rows={4}
                      placeholder="Please provide a reason for rejection (required)"
                      value={statusUpdateNotes}
                      onChange={(e) => setStatusUpdateNotes(e.target.value)}
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="flex justify-end px-4 py-3">
                  <button
                    onClick={closeDialogs}
                    className="bg-gray-200 px-4 py-2 rounded-md text-sm font-medium text-gray-800 mr-2"
                    disabled={processingUpdate}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={rejectOrder}
                    className="bg-red-500 px-4 py-2 rounded-md text-sm font-medium text-white"
                    disabled={processingUpdate || !statusUpdateNotes}
                  >
                    {processingUpdate ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing
                      </span>
                    ) : (
                      'Reject Order'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  return null;
};

const mapStatusCode = (code: string): string => {
  const statusMap: Record<string, string> = {
    'PE': 'Pending',
    'CO': 'Confirmed',
    'PR': 'In Production',
    'RD': 'Ready for Delivery',
    'IT': 'In Transit',
    'DE': 'Delivered',
    'CA': 'Cancelled',
    'pending': 'Pending',
    'processing': 'Processing',
    'shipped': 'Shipped',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled'
  };
  return statusMap[code] || code;
};

export default OrderManagement; 