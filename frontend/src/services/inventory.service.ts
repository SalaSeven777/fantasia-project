import { apiService } from './api';
//import { PaginatedResponse } from '../types';

// Types based on backend models
export interface Supplier {
  id: number;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: number;
  product: number;
  product_details: {
    id: number;
    name: string;
    description: string;
    price: number;
    image_url?: string;
  };
  movement_type: string;
  movement_type_display: string;
  quantity: number;
  reference_number: string;
  notes: string;
  performed_by: number;
  performed_by_username: string;
  created_at: string;
}

export interface PurchaseOrder {
  id: number;
  supplier: number;
  supplier_details: Supplier;
  order_number: string;
  status: string;
  status_display: string;
  expected_delivery_date: string;
  notes: string;
  created_by: number;
  created_by_username: string;
  created_at: string;
  updated_at: string;
  items: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id: number;
  purchase_order: number;
  product: number;
  product_details: {
    id: number;
    name: string;
    description: string;
    price: number;
    image_url?: string;
  };
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface CreatePurchaseOrderData {
  supplier: number;
  expected_delivery_date: string;
  notes?: string;
  items: Array<{
    product: number;
    quantity: number;
    unit_price: number;
  }>;
}

export interface StockMovementData {
  product: number;
  movement_type: string;
  quantity: number;
  reference_number?: string;
  notes?: string;
}

class InventoryService {
  // Suppliers
  async getSuppliers(active_only: boolean = true): Promise<Supplier[]> {
    try {
      const response = await apiService.get<any>('/inventory/suppliers/', { 
        params: { is_active: active_only } 
      });
      
      // Check for different response formats and ensure we always return an array
      if (Array.isArray(response)) {
        return response;
      } else if (response && typeof response === 'object') {
        // Handle paginated response format
        if (response.results && Array.isArray(response.results)) {
          return response.results;
        }
        // Handle other possible object responses with data property
        if (response.data && Array.isArray(response.data)) {
          return response.data;
        }
      }
      
      console.error('Unexpected suppliers response format:', response);
      return [];
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      return [];
    }
  }

  async getSupplier(id: number): Promise<Supplier> {
    return apiService.get<Supplier>(`/inventory/suppliers/${id}/`);
  }

  async createSupplier(supplierData: Partial<Supplier>): Promise<Supplier> {
    return apiService.post<Supplier>('/inventory/suppliers/', supplierData);
  }

  async updateSupplier(id: number, supplierData: Partial<Supplier>): Promise<Supplier> {
    return apiService.patch<Supplier>(`/inventory/suppliers/${id}/`, supplierData);
  }

  // Stock Movements
  async getStockMovements(productId?: number, movementType?: string): Promise<StockMovement[]> {
    const params: Record<string, any> = {};
    if (productId) params.product = productId;
    if (movementType) params.movement_type = movementType;
    
    try {
      const response = await apiService.get<any>('/inventory/stock-movements/', { params });
      
      // Check for different response formats and ensure we always return an array
      if (Array.isArray(response)) {
        return response;
      } else if (response && typeof response === 'object') {
        // Handle paginated response format
        if (response.results && Array.isArray(response.results)) {
          return response.results;
        }
        // Handle other possible object responses with data property
        if (response.data && Array.isArray(response.data)) {
          return response.data;
        }
      }
      
      // Log the unexpected response format
      console.error('Unexpected stock movements response format:', response);
      return [];
    } catch (error) {
      console.error('Error fetching stock movements:', error);
      return [];
    }
  }

  async addStockMovement(movementData: StockMovementData): Promise<StockMovement> {
    return apiService.post<StockMovement>('/inventory/stock-movements/', movementData);
  }

  // Purchase Orders
  async getPurchaseOrders(supplierId?: number, status?: string): Promise<PurchaseOrder[]> {
    const params: Record<string, any> = {};
    if (supplierId) params.supplier = supplierId;
    if (status) params.status = status;
    
    return apiService.get<PurchaseOrder[]>('/inventory/purchase-orders/', { params });
  }

  async getPurchaseOrder(id: number): Promise<PurchaseOrder> {
    return apiService.get<PurchaseOrder>(`/inventory/purchase-orders/${id}/`);
  }

  async createPurchaseOrder(orderData: CreatePurchaseOrderData): Promise<PurchaseOrder> {
    return apiService.post<PurchaseOrder>('/inventory/purchase-orders/', orderData);
  }

  async updatePurchaseOrderStatus(id: number, status: string): Promise<PurchaseOrder> {
    return apiService.post<PurchaseOrder>(`/inventory/purchase-orders/${id}/update_status/`, { status });
  }

  async addPurchaseOrderItem(
    purchaseOrderId: number, 
    product: number,
    quantity: number,
    unit_price: number
  ): Promise<PurchaseOrderItem> {
    return apiService.post<PurchaseOrderItem>(`/inventory/purchase-orders/${purchaseOrderId}/add_item/`, {
      product,
      quantity,
      unit_price
    });
  }
}

export const inventoryService = new InventoryService();
export default inventoryService; 