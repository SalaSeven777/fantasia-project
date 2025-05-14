import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { Link } from 'react-router-dom';

interface Customer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone_number: string;
  company_name: string;
  address: string;
  is_active: boolean;
  date_joined: string;
}

interface ApiResponse {
  results: Customer[];
  count: number;
  next: string | null;
  previous: string | null;
}

const CustomerManagement: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Customer>>({});

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        // Customers are stored in the users endpoint with a filter for role
        const response = await apiService.get<ApiResponse>('users/?role=CL');
        
        // Check if response is an object with results property (paginated response)
        if (response && typeof response === 'object') {
          const customerData = response.results ? response.results : 
                              (Array.isArray(response) ? response : []);
          setCustomers(customerData);
          setFilteredCustomers(customerData);
        } else {
          // Fallback to empty array if response is invalid
          setCustomers([]);
          setFilteredCustomers([]);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching customers:', err);
        setError('Failed to load customers. Please try again later.');
        setLoading(false);
        // Initialize with empty arrays to prevent errors
        setCustomers([]);
        setFilteredCustomers([]);
      }
    };

    fetchCustomers();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredCustomers(customers);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = customers.filter(
      customer => 
        customer.email.toLowerCase().includes(term) || 
        `${customer.first_name} ${customer.last_name}`.toLowerCase().includes(term) ||
        (customer.company_name && customer.company_name.toLowerCase().includes(term))
    );
    
    setFilteredCustomers(filtered);
  }, [customers, searchTerm]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const viewCustomerDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditForm(customer);
    setViewMode('detail');
    setIsEditMode(false);
  };

  const backToList = () => {
    setViewMode('list');
    setSelectedCustomer(null);
  };

  const handleEditToggle = () => {
    setIsEditMode(!isEditMode);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveCustomer = async () => {
    if (!selectedCustomer || !editForm) return;

    try {
      // In a real app, this would update the customer via API
      // await apiService.patch(`commercial/customers/${selectedCustomer.id}`, editForm);
      
      // Update local state for demo
      const updatedCustomers = customers.map(customer => 
        customer.id === selectedCustomer.id ? { ...customer, ...editForm } : customer
      );
      
      setCustomers(updatedCustomers);
      setSelectedCustomer({ ...selectedCustomer, ...editForm } as Customer);
      setIsEditMode(false);
      
      // Show success notification (would use a toast in a real app)
      alert('Customer information updated successfully');
    } catch (err) {
      console.error('Error updating customer:', err);
      alert('Failed to update customer. Please try again.');
    }
  };

  const handleDeleteCustomer = async (customerId: number) => {
    if (!window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      return;
    }

    try {
      // In a real app, this would delete the customer via API
      // await apiService.delete(`commercial/customers/${customerId}`);
      
      // Update local state for demo
      const updatedCustomers = customers.filter(customer => customer.id !== customerId);
      setCustomers(updatedCustomers);
      
      if (selectedCustomer && selectedCustomer.id === customerId) {
        setSelectedCustomer(null);
        setViewMode('list');
      }
      
      // Show success notification (would use a toast in a real app)
      alert('Customer deleted successfully');
    } catch (err) {
      console.error('Error deleting customer:', err);
      alert('Failed to delete customer. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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

  if (viewMode === 'list') {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Customer Management</h1>
        
        <div className="mb-6">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search customers..."
              className="px-4 py-2 border rounded-lg w-full"
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
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer Since
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      No customers found
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-blue-600 cursor-pointer"
                             onClick={() => viewCustomerDetails(customer)}>
                          {customer.first_name} {customer.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.company_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.phone_number || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(customer.date_joined)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => viewCustomerDetails(customer)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View
                        </button>
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
          Back to Customers
        </button>
      </div>
      
      {selectedCustomer && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold">
              {selectedCustomer.first_name} {selectedCustomer.last_name}
            </h2>
            {selectedCustomer.company_name && (
              <p className="text-gray-500">{selectedCustomer.company_name}</p>
            )}
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedCustomer.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{selectedCustomer.phone_number || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium whitespace-pre-line">{selectedCustomer.address || '-'}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Account Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Customer Since</p>
                  <p className="font-medium">{formatDate(selectedCustomer.date_joined)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      selectedCustomer.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedCustomer.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6 border-t bg-gray-50">
            <div className="flex gap-2 justify-end">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => {
                  // This would ideally navigate to a quotes page filtered for this customer
                  alert('Navigate to create quote for this customer');
                }}
              >
                Create Quote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement; 