import React, { useState, useEffect } from 'react';
import { deliveryService, DeliverySummary } from '../../services/delivery.service';
import { Link } from 'react-router-dom';
import { orderService } from '../../services/order.service';
import { Order } from '../../types';
import { 
  CheckCircleIcon, 
  TruckIcon, 
  ClockIcon, 
  ExclamationCircleIcon,
  ChartBarIcon,
  ArrowPathIcon,
  MapPinIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';

// Define the backend status codes since they don't match our OrderStatus type
type BackendOrderStatus = 'PE' | 'CO' | 'PR' | 'RD' | 'IT' | 'DE' | 'CA';

// Define response type for mark_delivered endpoint
interface MarkDeliveredResponse {
  message?: string;
  order?: any;
  error?: string;
}

const DeliveryDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [summary, setSummary] = useState<DeliverySummary | null>(null);
  const [confirmedCount, setConfirmedCount] = useState<number>(0);
  const [readyForDeliveryCount, setReadyForDeliveryCount] = useState<number>(0);
  const [inTransitCount, setInTransitCount] = useState<number>(0);
  const [deliveredCount, setDeliveredCount] = useState<number>(0);
  const [myDeliveries, setMyDeliveries] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Handle status update
  const updateOrderStatus = async (orderId: number, newStatus: BackendOrderStatus) => {
    try {
      setUpdatingOrderId(orderId);
      
      if (newStatus === 'DE') {
        // Use the special endpoint for marking as delivered that generates an invoice
        try {
          const response = await apiService.post<MarkDeliveredResponse>(`/orders/orders/${orderId}/mark_delivered/`, {});
          console.log('Order marked as delivered with automatic invoice generation:', response);
          // Show notification about invoice creation (if you have a notification system)
          if (response && typeof response === 'object' && 'message' in response) {
            setSuccessMessage(response.message as string);
          }
        } catch (err) {
          console.error('Error using mark_delivered endpoint:', err);
          // Fall back to the regular update if special endpoint fails
          await apiService.patch(`/orders/orders/${orderId}/`, { status: newStatus });
        }
      } else {
        // For other statuses, use the regular update endpoint
        await apiService.patch(`/orders/orders/${orderId}/`, { status: newStatus });
      }
      
      // Refresh the data after updating
      loadDashboardData();
      
    } catch (err: any) {
      console.error('Error updating order status:', err);
      setError(`Failed to update order status: ${err.message || 'Unknown error'}`);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      console.log('Loading delivery agent dashboard data...');
      
      // Try multiple API paths to handle potential route differences
      const fetchOrders = async (status: BackendOrderStatus): Promise<Order[]> => {
        try {
          // Try first with the orders endpoint
          console.log(`Fetching orders with status ${status}`);
          const response = await apiService.get<{results: Order[]}>('/orders/orders/', { 
            params: { status }
          });
          
          if (response && typeof response === 'object') {
            // Check if the response has a 'results' property (paginated response)
            if ('results' in response && Array.isArray(response.results)) {
              return response.results;
            } 
            // If response is an array directly
            else if (Array.isArray(response)) {
              return response;
            }
          }
          return [];
        } catch (error) {
          console.error(`Error fetching ${status} orders:`, error);
          
          // Fallback to delivery service specific methods
          try {
            if (status === 'CO') return await deliveryService.getConfirmedOrders();
            if (status === 'RD') return await deliveryService.getPendingDeliveries();
            if (status === 'IT') return await deliveryService.getInProgressDeliveries();
            if (status === 'DE') return await orderService.getDeliveredOrders();
          } catch (e) {
            console.error('Fallback method also failed:', e);
          }
          
          return [];
        }
      };
      
      // Fetch orders for delivery agents - include orders confirmed by commercial team (CO)
      const [confirmedOrders, readyForDelivery, inTransit, delivered] = await Promise.all([
        fetchOrders('CO'), // Confirmed by commercial
        fetchOrders('RD'), // Ready for Delivery
        fetchOrders('IT'), // In Transit
        fetchOrders('DE')  // Delivered (recent)
      ]);
      
      console.log('API responses:', {
        confirmedOrders,
        readyForDelivery, 
        inTransit, 
        delivered
      });
      
      // Update counts
      setConfirmedCount(Array.isArray(confirmedOrders) ? confirmedOrders.length : 0);
      setReadyForDeliveryCount(Array.isArray(readyForDelivery) ? readyForDelivery.length : 0);
      setInTransitCount(Array.isArray(inTransit) ? inTransit.length : 0);
      setDeliveredCount(Array.isArray(delivered) ? delivered.length : 0);
      
      // Combine all orders relevant to delivery agents
      const allDeliveries = [
        ...(Array.isArray(confirmedOrders) ? confirmedOrders : []),
        ...(Array.isArray(readyForDelivery) ? readyForDelivery : []),
        ...(Array.isArray(inTransit) ? inTransit : []),
        ...(Array.isArray(delivered) ? delivered.slice(0, 5) : []) // Only show a few recent delivered orders
      ];
      
      if (allDeliveries.length > 0) {
        // Sort by priority (CO first, then RD, then IT, then DE) and then by date
        allDeliveries.sort((a, b) => {
          // First sort by status priority
          const statusPriority = (status: any) => {
            if (status === 'CO') return 0; // Confirmed - highest priority
            if (status === 'RD') return 1; // Ready for Delivery
            if (status === 'IT') return 2; // In Transit
            if (status === 'DE') return 3; // Delivered
            return 4;
          };
          
          const priorityA = statusPriority(a.status);
          const priorityB = statusPriority(b.status);
          
          if (priorityA !== priorityB) {
            return priorityA - priorityB;
          }
          
          // Then sort by date (newest first)
          return new Date(b.updated_at || b.created_at).getTime() - 
                 new Date(a.updated_at || a.created_at).getTime();
        });
        
        setMyDeliveries(allDeliveries);
      } else {
        setMyDeliveries([]);
      }
      
      // Try to get delivery summary if available
      try {
        const deliverySummary = await deliveryService.getDeliverySummary();
        if (deliverySummary && typeof deliverySummary === 'object') {
          setSummary(deliverySummary);
        }
      } catch (summaryError) {
        console.error('Failed to load summary data:', summaryError);
        // Not critical, continue without summary
      }
      
      setError(null);
    } catch (err) {
      console.error('Error in dashboard main try/catch:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Format date for display
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  // Format address for display
  const formatAddress = (address: any): string => {
    if (typeof address === 'string') return address;
    
    if (address && typeof address === 'object') {
      const parts = [
        address.street,
        address.city,
        address.state,
        address.postal_code,
        address.country
      ].filter(Boolean);
      
      return parts.join(', ');
    }
    
    return 'No address provided';
  };

  // Get status display name
  const getStatusDisplay = (status: string): string => {
    const statusMap: Record<string, string> = {
      'PE': 'Pending',
      'CO': 'Confirmed',
      'PR': 'In Production',
      'RD': 'Ready for Pickup',
      'IT': 'In Transit',
      'DE': 'Delivered',
      'CA': 'Cancelled'
    };
    
    return statusMap[status] || status || 'Unknown';
  };
  
  // Get status badge CSS class
  const getStatusBadgeClass = (status: string): string => {
    const baseClasses = "px-2 py-1 text-xs rounded-full font-medium";
    
    switch(status) {
      case 'CO': // Confirmed
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'RD': // Ready for Delivery
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case 'IT': // In Transit
        return `${baseClasses} bg-amber-100 text-amber-800`;
      case 'DE': // Delivered
        return `${baseClasses} bg-green-100 text-green-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  // Determine which action buttons to show based on order status
  const getActionButtons = (order: Order) => {
    const isUpdating = updatingOrderId === order.id;
    
    // Safely cast string status to BackendOrderStatus
    const status = order.status as unknown as BackendOrderStatus;
    
    switch(status) {
      case 'CO': // Confirmed by commercial - Show button to mark as Ready for Delivery
        return (
          <button
            onClick={() => updateOrderStatus(order.id, 'RD')}
            disabled={isUpdating}
            className="btn-sm bg-purple-600 hover:bg-purple-700 text-white rounded px-3 py-1"
          >
            {isUpdating ? 'Updating...' : 'Mark Ready'}
          </button>
        );
      case 'RD': // Ready for Delivery - Show button to mark as In Transit
        return (
          <button
            onClick={() => updateOrderStatus(order.id, 'IT')}
            disabled={isUpdating}
            className="btn-sm bg-amber-600 hover:bg-amber-700 text-white rounded px-3 py-1"
          >
            {isUpdating ? 'Updating...' : 'Start Delivery'}
          </button>
        );
      case 'IT': // In Transit - Show button to mark as Delivered
        return (
          <button
            onClick={() => updateOrderStatus(order.id, 'DE')}
            disabled={isUpdating}
            className="btn-sm bg-green-600 hover:bg-green-700 text-white rounded px-3 py-1"
          >
            {isUpdating ? 'Updating...' : 'Mark Delivered'}
          </button>
        );
      default:
        return null;
    }
  };
  
  // Get view details button
  const getViewDetailsButton = (orderId: number) => {
    return (
      <Link 
        to={`/delivery/orders/${orderId}`}
        className="btn-sm bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-1 inline-block"
      >
        View Details
      </Link>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Delivery Agent Dashboard</h1>
        <button
          onClick={loadDashboardData}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          <ArrowPathIcon className="h-5 w-5 mr-2" />
          Refresh
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 flex justify-between items-center">
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            {successMessage}
          </div>
          <button 
            onClick={() => setSuccessMessage(null)}
            className="text-green-700 hover:text-green-900 focus:outline-none"
          >
            &times;
          </button>
        </div>
      )}
      
      {/* Status Cards - Specific to delivery agent tasks */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {/* Confirmed Orders */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 cursor-pointer hover:bg-blue-100 transition-colors duration-200">
          <div className="flex items-start">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <ShoppingBagIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-900">Confirmed</h3>
              <p className="text-2xl font-bold text-blue-700">
                {isLoading ? '...' : confirmedCount}
              </p>
              <p className="text-sm text-blue-600 mt-1">Orders confirmed by commercial</p>
            </div>
          </div>
        </div>
        
        {/* Ready for Delivery */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 cursor-pointer hover:bg-purple-100 transition-colors duration-200">
          <div className="flex items-start">
            <div className="bg-purple-100 p-3 rounded-full mr-4">
              <MapPinIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-purple-900">Ready for Pickup</h3>
              <p className="text-2xl font-bold text-purple-700">
                {isLoading ? '...' : readyForDeliveryCount}
              </p>
              <p className="text-sm text-purple-600 mt-1">Orders waiting to be picked up</p>
            </div>
          </div>
        </div>
        
        {/* In Transit */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 cursor-pointer hover:bg-amber-100 transition-colors duration-200">
          <div className="flex items-start">
            <div className="bg-amber-100 p-3 rounded-full mr-4">
              <TruckIcon className="h-8 w-8 text-amber-600" />
            </div>
            <div>
              <h3 className="font-medium text-amber-900">In Transit</h3>
              <p className="text-2xl font-bold text-amber-700">
                {isLoading ? '...' : inTransitCount}
              </p>
              <p className="text-sm text-amber-600 mt-1">Orders currently being delivered</p>
            </div>
          </div>
        </div>
        
        {/* Delivered Today */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 cursor-pointer hover:bg-green-100 transition-colors duration-200">
          <div className="flex items-start">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-green-900">Delivered</h3>
              <p className="text-2xl font-bold text-green-700">
                {isLoading ? '...' : deliveredCount}
              </p>
              <p className="text-sm text-green-600 mt-1">Completed deliveries</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* My Deliveries Section */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Order Management</h2>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading deliveries...</p>
          </div>
        ) : myDeliveries.length === 0 ? (
          <div className="p-8 text-center">
            <ExclamationCircleIcon className="h-12 w-12 text-gray-400 mx-auto" />
            <p className="mt-4 text-gray-600">No orders available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
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
                {myDeliveries.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      <Link to={`/delivery/orders/${order.id}`}>
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.client_username || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {formatAddress(order.shipping_address)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadgeClass(order.status as unknown as string)}>
                        {order.status_display || getStatusDisplay(order.status as unknown as string)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                      {getActionButtons(order)}
                      {getViewDetailsButton(order.id)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Quick Tips for Delivery Agents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Delivery Map */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex items-center">
            <MapPinIcon className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold">Delivery Map</h2>
          </div>
          <div className="p-4 h-80">
            <div className="bg-gray-100 rounded-lg h-full w-full flex items-center justify-center">
              <div className="text-center p-4">
                <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <p className="text-gray-600">Interactive map will show your current deliveries</p>
                <a 
                  href="https://maps.google.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                >
                  Open in Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Delivery History */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex items-center">
            <ClockIcon className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold">Recent Delivery History</h2>
          </div>
          <div className="p-4">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading history...</p>
              </div>
            ) : myDeliveries.filter(order => (order.status as unknown as string) === 'DE').length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No delivery history available</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {myDeliveries
                  .filter(order => (order.status as unknown as string) === 'DE')
                  .slice(0, 5)
                  .map((order) => (
                    <li key={order.id} className="py-3">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">Order #{order.order_number}</p>
                          <p className="text-xs text-gray-500">
                            Delivered on {formatDate(order.updated_at)}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </div>
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <Link 
              to="/delivery/history" 
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View full delivery history →
            </Link>
          </div>
        </div>
      </div>
      
      {/* Helpful Links and Resources */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center">
          <svg className="h-6 w-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-semibold">Resources</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              <h3 className="font-medium text-gray-900 mb-2">Delivery Guidelines</h3>
              <p className="text-sm text-gray-700 mb-3">Learn about best practices for smooth deliveries.</p>
              <a href="#" className="text-blue-600 hover:text-blue-800 text-sm font-medium">Read guidelines →</a>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              <h3 className="font-medium text-gray-900 mb-2">Support Center</h3>
              <p className="text-sm text-gray-700 mb-3">Get help with delivery issues or customer interactions.</p>
              <a href="#" className="text-blue-600 hover:text-blue-800 text-sm font-medium">Contact support →</a>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              <h3 className="font-medium text-gray-900 mb-2">Training Videos</h3>
              <p className="text-sm text-gray-700 mb-3">Watch tutorials about app usage and delivery procedures.</p>
              <a href="#" className="text-blue-600 hover:text-blue-800 text-sm font-medium">View videos →</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard; 