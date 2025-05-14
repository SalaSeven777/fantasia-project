import { apiService } from './api';
import { Order, OrderStatus } from '../types';

export interface CreateOrderData {
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
  shipping_address: string;
  delivery_notes?: string;
  delivery_date?: string;
}

export interface UpdateOrderData {
  status?: OrderStatus;
  shipping_address?: string;
  delivery_notes?: string;
  delivery_date?: string;
}

export interface OrderFilters {
  status?: OrderStatus;
  start_date?: string;
  end_date?: string;
  min_amount?: number;
  max_amount?: number;
}

export interface DeliveryStatusUpdate {
  order: number;
  status: string;
  location: string;
  notes?: string;
}

class OrderService {
  async getOrders(filters?: OrderFilters): Promise<Order[]> {
    try {
      // Check if user is authenticated before making API call
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return [];
      }
      
      // Try with different URL variations to ensure compatibility
      let response;
      const endpoints = [
        'api/orders/orders/',      // Correct path according to Django URLs
        '/api/orders/orders/',     // With leading slash
        'orders/orders/',          // Path without api prefix
        '/orders/orders/',         // With leading slash but no api prefix
        'api/commercial/orders/'   // Commercial-specific endpoint as fallback
      ];
      
      for (const endpoint of endpoints) {
        try {
          response = await apiService.get<any>(endpoint, { params: filters });
          break; // Exit the loop if successful
        } catch (error: any) {
          // Continue to the next endpoint
          if (endpoints.indexOf(endpoint) === endpoints.length - 1) {
            console.error('All API endpoint attempts failed');
            throw error; // Re-throw the last error if we've tried all endpoints
          }
        }
      }
      
      // If we don't have a response by now, there's an issue
      if (!response) {
        return [];
      }
      
      // Map status codes to display values
      const mapStatusToDisplay = (statusCode: string): string => {
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
        return statusMap[statusCode] || statusCode;
      };
      
      // Process and enhance orders with status_display
      const processOrders = (orders: any[]): Order[] => {
        return orders.map(order => {
          // Ensure we have all required fields with sensible defaults
          const processedOrder = {
            ...order,
            id: order.id,
            order_number: order.order_number || `Order #${order.id}`,
            status: order.status || 'pending',
            status_display: order.status_display || mapStatusToDisplay(order.status || 'pending'),
            total_amount: order.total_amount || order.total || 0,
            items: Array.isArray(order.items) ? order.items : []
          };
          return processedOrder;
        });
      };
      
      // Handle different response formats
      
      // Check if the response is an array
      if (Array.isArray(response)) {
        return processOrders(response);
      }
      
      // Handle paginated response
      if (response && response.results && Array.isArray(response.results)) {
        return processOrders(response.results);
      }
      
      // Handle nested response (e.g., if the API returns {data: [...orders]})
      if (response && response.data && Array.isArray(response.data)) {
        return processOrders(response.data);
      }
      
      // Handle orders property (e.g., if the API returns {orders: [...orders]})
      if (response && response.orders && Array.isArray(response.orders)) {
        return processOrders(response.orders);
      }
      
      // Handle single order response
      if (response && response.id) {
        return processOrders([response]);
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }

  async getOrderById(id: number): Promise<Order> {
    return apiService.get<Order>(`/orders/orders/${id}/`);
  }

  async createOrder(data: CreateOrderData): Promise<Order> {
    try {
      console.log('[OrderService] Creating order with data:', JSON.stringify(data));
      const response = await apiService.post<Order>('/orders/orders/', data);
      console.log('[OrderService] Order created successfully:', response);
      return response;
    } catch (error: any) {
      console.error('[OrderService] Error creating order:', error);
      
      // Log detailed error information
      if (error.response) {
        console.error('[OrderService] Response status:', error.response.status);
        console.error('[OrderService] Response data:', error.response.data);
      }
      
      throw error; // Re-throw for the component to handle
    }
  }

  async updateOrder(id: number, data: UpdateOrderData): Promise<Order> {
    return apiService.patch<Order>(`/orders/orders/${id}/`, data);
  }

  async cancelOrder(id: number): Promise<Order> {
    return apiService.post<Order>(`/orders/orders/${id}/cancel/`, {});
  }

  async getMyOrders(filters?: OrderFilters): Promise<Order[]> {
    try {
      const response = await apiService.get<any>('/orders/orders/my-orders/', { params: filters });
      // Check if the response is an array
      if (Array.isArray(response)) {
        return response;
      }
      // Handle paginated response
      if (response && response.results && Array.isArray(response.results)) {
        return response.results;
      }
      console.error('Unexpected orders response format:', response);
      return [];
    } catch (error) {
      console.error('Error fetching my orders:', error);
      return [];
    }
  }

  async addDeliveryUpdate(orderId: number, deliveryData: Partial<DeliveryStatusUpdate>): Promise<any> {
    return apiService.post(`/orders/orders/${orderId}/add_delivery_status/`, {
      order: orderId,
      ...deliveryData
    });
  }

  async getOrderDeliveryUpdates(orderId: number): Promise<any[]> {
    try {
      const response = await apiService.get<any>(`/orders/orders/${orderId}/delivery-updates/`);
      // Check if the response is an array
      if (Array.isArray(response)) {
        return response;
      }
      // Handle paginated response
      if (response && response.results && Array.isArray(response.results)) {
        return response.results;
      }
      console.error('Unexpected delivery updates response format:', response);
      return [];
    } catch (error) {
      console.error('Error fetching delivery updates:', error);
      return [];
    }
  }

  async getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
    return this.getOrders({ status });
  }

  async getPendingDeliveries(): Promise<Order[]> {
    // Call the API with the correct status code for "Ready for Delivery"
    return apiService.get<Order[]>('/orders/orders/', { 
      params: { status: 'RD' } // Ready for Delivery
    });
  }

  async getInTransitDeliveries(): Promise<Order[]> {
    return apiService.get<Order[]>('/orders/orders/', { 
      params: { status: 'IT' } // In Transit
    });
  }

  async getDeliveredOrders(): Promise<Order[]> {
    return apiService.get<Order[]>('/orders/orders/', { 
      params: { status: 'DE' } // Delivered
    });
  }
}

export const orderService = new OrderService(); 