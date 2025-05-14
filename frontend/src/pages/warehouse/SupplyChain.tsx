import React, { useState, useEffect } from 'react';
import { inventoryService, Supplier } from '../../services/inventory.service';
import { PlusIcon, PencilIcon } from '@heroicons/react/24/outline';

const SupplyChain: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Supplier>>({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    is_active: true
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      console.log('Fetching suppliers...');
      const data = await inventoryService.getSuppliers(false); // Get all suppliers, including inactive
      
      console.log('Suppliers data received:', data);
      
      // Ensure suppliers is always an array
      if (Array.isArray(data)) {
      setSuppliers(data);
      } else {
        console.error('Suppliers data is not an array:', data);
        setSuppliers([]);
        setError('Received invalid supplier data format from server.');
      }
      
      setError(null);
    } catch (err) {
      console.error('Error loading suppliers:', err);
      setError('Failed to load suppliers. Please try again.');
      setSuppliers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await inventoryService.createSupplier(formData);
      // Reset form
      setFormData({
        name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        is_active: true
      });
      setShowForm(false);
      // Reload suppliers
      await loadSuppliers();
    } catch (err) {
      console.error('Error creating supplier:', err);
      setError('Failed to create supplier. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Supply Chain</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add Supplier
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {showForm && (
          <div className="mt-6 bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Supplier</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Company Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="contact_person" className="block text-sm font-medium text-gray-700">
                    Contact Person
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="contact_person"
                      id="contact_person"
                      value={formData.contact_person}
                      onChange={handleInputChange}
                      required
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="phone"
                      id="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <div className="mt-1">
                    <textarea
                      name="address"
                      id="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="is_active"
                        name="is_active"
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={handleInputChange}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="is_active" className="font-medium text-gray-700">
                        Active
                      </label>
                      <p className="text-gray-500">Mark this supplier as active</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="mt-6">
          {loading && !showForm ? (
            <div className="text-center">
              <p className="text-gray-500">Loading suppliers...</p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {suppliers.length === 0 ? (
                  <li className="px-6 py-4 text-center text-gray-500">
                    No suppliers found. Add your first supplier to get started.
                  </li>
                ) : (
                  Array.isArray(suppliers) ? suppliers.map((supplier) => (
                    <li key={supplier.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center">
                            <h3 className="text-lg font-medium text-gray-900">
                              {supplier.name}
                              {!supplier.is_active && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  Inactive
                                </span>
                              )}
                            </h3>
                          </div>
                          <div className="mt-1 text-sm text-gray-500">
                            <p>Contact: {supplier.contact_person}</p>
                            <p>Email: {supplier.email}</p>
                            <p>Phone: {supplier.phone}</p>
                            <p className="mt-1">Address: {supplier.address}</p>
                          </div>
                        </div>
                        <button
                          className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-gray-100 hover:bg-gray-200 focus:outline-none"
                        >
                          <PencilIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
                          <span className="sr-only">Edit</span>
                        </button>
                      </div>
                    </li>
                  )) : (
                    <li className="px-6 py-4 text-center text-gray-500">
                      Error: Invalid supplier data format. Please refresh the page.
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplyChain; 