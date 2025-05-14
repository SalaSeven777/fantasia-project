import { apiService } from './api';
import { Invoice, Payment, CreditNote, User, Order } from '../types';

export interface InvoiceFilter {
  status?: string;
  client?: number;
  order?: number;
  start_date?: string;
  end_date?: string;
}

export interface PaymentFilter {
  invoice?: number;
  payment_method?: string;
  start_date?: string;
  end_date?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

class BillingService {
  // Invoices
  async getInvoices(filters?: InvoiceFilter): Promise<Invoice[] | PaginatedResponse<Invoice>> {
    try {
      console.log('Fetching invoices with filters:', filters);
      const response = await apiService.get<Invoice[] | PaginatedResponse<Invoice>>('billing/invoices/', { params: filters });
      console.log('Raw invoices response:', response);

      // Handle different API response formats
      if (Array.isArray(response)) {
        return response;
      } else if (response && 'results' in response && Array.isArray(response.results)) {
        // Handle paginated response
        return response;
      } else if (response && typeof response === 'object') {
        // If it's an object but not paginated, it might be a single invoice
        // or it might have a different structure
        console.warn('Unexpected API response format for invoices:', response);
        return [];
      } else {
        console.warn('Empty or invalid response from invoices API');
        return [];
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      return []; // Return empty array on error instead of throwing
    }
  }

  async getInvoice(id: number): Promise<Invoice> {
    try {
      console.log(`Fetching invoice with ID: ${id}`);
      const response = await apiService.get<Invoice>(`billing/invoices/${id}/`);
      console.log('Invoice details:', response);
      return response;
    } catch (error) {
      console.error(`Error fetching invoice ${id}:`, error);
      throw error;
    }
  }

  async createInvoice(invoiceData: Partial<Invoice>): Promise<Invoice> {
    try {
      console.log('Creating invoice with data:', invoiceData);
      const response = await apiService.post<Invoice>('billing/invoices/', invoiceData);
      console.log('Create invoice response:', response);
      return response;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  async updateInvoice(id: number, invoiceData: Partial<Invoice>): Promise<Invoice> {
    try {
      console.log(`Updating invoice ${id} with data:`, invoiceData);
      const response = await apiService.patch<Invoice>(`billing/invoices/${id}/`, invoiceData);
      console.log('Update invoice response:', response);
      return response;
    } catch (error) {
      console.error(`Error updating invoice ${id}:`, error);
      throw error;
    }
  }

  // Payments
  async getPayments(filters?: PaymentFilter): Promise<Payment[]> {
    try {
      console.log('Fetching payments with filters:', filters);
      const response = await apiService.get<Payment[]>('billing/payments/', { params: filters });
      console.log('Payments response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  }

  async addPayment(invoiceId: number, paymentData: Partial<Payment>): Promise<Payment> {
    try {
      console.log(`Adding payment to invoice ${invoiceId} with data:`, paymentData);
      const response = await apiService.post<Payment>(`billing/invoices/${invoiceId}/add_payment/`, paymentData);
      console.log('Add payment response:', response);
      return response;
    } catch (error) {
      console.error(`Error adding payment to invoice ${invoiceId}:`, error);
      throw error;
    }
  }

  // Credit Notes
  async getCreditNotes(invoiceId?: number): Promise<CreditNote[]> {
    try {
      const params = invoiceId ? { invoice: invoiceId } : undefined;
      console.log('Fetching credit notes with params:', params);
      const response = await apiService.get<CreditNote[]>('billing/credit-notes/', { params });
      console.log('Credit notes response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching credit notes:', error);
      throw error;
    }
  }

  async addCreditNote(invoiceId: number, creditNoteData: Partial<CreditNote>): Promise<CreditNote> {
    try {
      console.log(`Adding credit note to invoice ${invoiceId} with data:`, creditNoteData);
      const response = await apiService.post<CreditNote>(`billing/invoices/${invoiceId}/add_credit_note/`, creditNoteData);
      console.log('Add credit note response:', response);
      return response;
    } catch (error) {
      console.error(`Error adding credit note to invoice ${invoiceId}:`, error);
      throw error;
    }
  }

  // Invoice Statistics
  async getInvoiceStats(): Promise<any> {
    try {
      console.log('Fetching invoice statistics');
      const response = await apiService.get<any>('billing/invoices/stats/');
      console.log('Invoice stats response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching invoice statistics:', error);
      throw error;
    }
  }

  // Add methods to fetch clients and orders for invoice creation
  async getClients(): Promise<User[]> {
    try {
      console.log('Fetching clients for invoice creation');
      
      // Based on the API structure, try these endpoints in order
      const possibleEndpoints = [
        'users/',
        'commercial/customers/',
        'billing/clients/', 
        'billing/customers/'
      ];
      
      let clientsData: User[] = [];
      
      // Try each endpoint until we find one that works
      for (const endpoint of possibleEndpoints) {
        try {
          console.log(`Attempting to fetch clients from /api/${endpoint}`);
          const response = await apiService.get<User[] | any>(endpoint);
          console.log(`Response from /api/${endpoint}:`, response);
          
          if (Array.isArray(response) && response.length > 0) {
            return response;
          } else if (response && 'results' in response && Array.isArray(response.results) && response.results.length > 0) {
            return response.results;
          } else if (response && typeof response === 'object') {
            // If response is an object, look for arrays of users/clients
            const possibleArrays = Object.values(response).filter(value => 
              Array.isArray(value) && value.length > 0 && value[0] && typeof value[0] === 'object' && 'id' in value[0]
            );
            
            if (possibleArrays.length > 0) {
              return possibleArrays[0] as User[];
            }
          }
        } catch (endpointError) {
          console.log(`Endpoint /api/${endpoint} failed:`, endpointError);
        }
      }
      
      console.warn('Could not find a working clients API endpoint');
      return [];
    } catch (error) {
      console.error('Error in main getClients function:', error);
      return [];
    }
  }

  async getOrders(): Promise<Order[]> {
    try {
      console.log('Fetching orders for invoice creation');
      const response = await apiService.get<Order[] | any>('orders/');
      console.log('Orders API response:', response);
      
      // Process the response to ensure we have properly formatted orders
      let orders: Order[] = [];
      
      if (Array.isArray(response)) {
        orders = response;
      } else if (response && 'results' in response && Array.isArray(response.results)) {
        orders = response.results;
      } else {
        console.warn('Unexpected API response format for orders:', response);
        return [];
      }
      
      // Ensure all orders have the required properties
      return orders.map(order => {
        // Add a default total_amount if it's missing
        if (typeof order.total_amount === 'undefined') {
          return {
            ...order,
            total_amount: order.total || 0
          };
        }
        return order;
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }
}

export const billingService = new BillingService(); 