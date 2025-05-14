import { apiService } from './api';
//  import { Order, DeliveryStatus } from '../types';
import { Order} from '../types';

export interface Delivery {
  id: number;
  order_id: number;
  status: string;
  status_display: string;
  location: string;
  notes: string;
  updated_by: number;
  updated_by_username: string;
  created_at: string;
}

export interface DeliveryFilter {
  status?: string;
  agent_id?: number;
  date_from?: string;
  date_to?: string;
  order_id?: number;
}

export interface RouteInfo {
  id: number;
  name: string;
  start_location: string;
  end_location: string;
  stops: Array<{
    order_id: number;
    location: string;
    estimated_time: string;
  }>;
  total_distance: number;
  total_time: number;
  assigned_agent: number;
  status: 'planned' | 'in_progress' | 'completed';
  date: string;
}

export interface DeliverySummary {
  total_deliveries: number;
  completed: number;
  in_progress: number;
  pending: number;
  failed: number;
  on_time_percentage: number;
  average_delivery_time: number;
}

export interface DeliveryMetrics {
  daily_deliveries: Array<{
    date: string;
    count: number;
    completed: number;
  }>;
  performance_by_agent: Array<{
    agent_id: number;
    agent_name: string;
    delivered: number;
    on_time: number;
    late: number;
  }>;
  delivery_areas: Array<{
    area: string;
    count: number;
    percentage: number;
  }>;
}

class DeliveryService {
  async getDeliveryUpdates(orderId: number): Promise<Delivery[]> {
    return apiService.get<Delivery[]>(`/orders/${orderId}/delivery-updates/`);
  }

  async addDeliveryUpdate(
    orderId: number,
    status: string,
    location: string,
    notes?: string
  ): Promise<Delivery> {
    return apiService.post<Delivery>(`/orders/${orderId}/add_delivery_status/`, {
      status,
      location,
      notes,
    });
  }

  async getDeliveries(filters?: DeliveryFilter): Promise<Delivery[]> {
    return apiService.get<Delivery[]>('/delivery-status/', { params: filters });
  }

  async getRoutes(): Promise<RouteInfo[]> {
    try {
      console.log('Fetching delivery routes...');
      const response = await apiService.get<RouteInfo[]>('orders/routes/');
      console.log('Routes response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching routes:', error);
      throw error; // Re-throw to let component handle the error
    }
  }

  async getRoute(routeId: number): Promise<RouteInfo> {
    try {
      console.log(`Fetching route details for ID: ${routeId}`);
      const response = await apiService.get<RouteInfo>(`orders/routes/${routeId}/`);
      console.log('Route details response:', response);
      return response;
    } catch (error) {
      console.error(`Error fetching route ${routeId}:`, error);
      throw error;
    }
  }

  async createRoute(routeData: Partial<RouteInfo>): Promise<RouteInfo> {
    try {
      console.log('Creating new route with data:', routeData);
      const response = await apiService.post<RouteInfo>('orders/routes/', routeData);
      console.log('Create route response:', response);
      return response;
    } catch (error) {
      console.error('Error creating route:', error);
      throw error;
    }
  }

  async updateRouteStatus(routeId: number, status: string): Promise<RouteInfo> {
    try {
      console.log(`Updating route ${routeId} status to: ${status}`);
      const response = await apiService.patch<RouteInfo>(`orders/routes/${routeId}/`, { status });
      console.log('Update route status response:', response);
      return response;
    } catch (error) {
      console.error(`Error updating route ${routeId} status:`, error);
      throw error;
    }
  }

  async getDeliverySummary(): Promise<DeliverySummary> {
    try {
      console.log('Fetching delivery summary...');
      const response = await apiService.get<DeliverySummary>('orders/delivery-summary/');
      console.log('Delivery summary response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching delivery summary:', error);
      throw error;
    }
  }

  async getDeliveryMetrics(timeframe: 'day' | 'week' | 'month' = 'week'): Promise<DeliveryMetrics> {
    try {
      console.log(`Fetching delivery metrics for timeframe: ${timeframe}`);
      const response = await apiService.get<DeliveryMetrics>('orders/delivery-metrics/', { 
        params: { timeframe } 
      });
      console.log('Delivery metrics response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching delivery metrics:', error);
      throw error;
    }
  }

  async getConfirmedOrders(): Promise<Order[]> {
    try {
      console.log('Fetching confirmed orders (CO)');
      return apiService.get<Order[]>('orders/orders/', { 
        params: { status: 'CO' }
      });
    } catch (error) {
      console.error('Error fetching confirmed orders:', error);
      return [];
    }
  }

  async getPendingDeliveries(): Promise<Order[]> {
    try {
      console.log('Fetching pending deliveries (RD)');
      return apiService.get<Order[]>('orders/orders/', { 
        params: { status: 'RD' } // Ready for Delivery
      });
    } catch (error) {
      console.error('Error fetching pending deliveries:', error);
      return [];
    }
  }

  async getInProgressDeliveries(): Promise<Order[]> {
    try {
      console.log('Fetching in-progress deliveries (IT)');
      return apiService.get<Order[]>('orders/orders/', { 
        params: { status: 'IT' } // In Transit
      });
    } catch (error) {
      console.error('Error fetching in-progress deliveries:', error);
      return [];
    }
  }
}

export const deliveryService = new DeliveryService(); 