import React, { useState, useEffect } from 'react';
import { inventoryService, StockMovement, StockMovementData } from '../../services/inventory.service';
import { PlusIcon } from '@heroicons/react/24/outline';
import { productService } from '../../services/product.service';
import { Product } from '../../types/product.types';

const StockManagement: React.FC = () => {
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<StockMovementData>({
    product: 0,
    movement_type: 'PU', // Default to Purchase
    quantity: 1,
    reference_number: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching stock movements and products...');
      
      const [movementsData, productsData] = await Promise.all([
        inventoryService.getStockMovements(),
        productService.getProducts()
      ]);
      
      console.log('Stock movements data received:', movementsData);
      console.log('Products data received:', productsData);
      
      // Ensure stockMovements is always an array
      if (Array.isArray(movementsData)) {
        setStockMovements(movementsData);
      } else {
        console.error('Stock movements data is not an array:', movementsData);
        setStockMovements([]);
        setError('Received invalid stock movement data format from server.');
      }
      
      setProducts(productsData.products || []);
      setError(null);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load stock data. Please try again.');
      setStockMovements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle numeric values
    if (name === 'product') {
      setFormData({ ...formData, [name]: parseInt(value) });
    } else if (name === 'quantity') {
      setFormData({ ...formData, [name]: parseInt(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await inventoryService.addStockMovement(formData);
      // Reset form
      setFormData({
        product: 0,
        movement_type: 'PU',
        quantity: 1,
        reference_number: '',
        notes: ''
      });
      setShowForm(false);
      // Reload stock movements
      await loadData();
    } catch (err) {
      console.error('Error adding stock movement:', err);
      setError('Failed to add stock movement. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getMovementTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'PU': 'Purchase',
      'SA': 'Sale',
      'RE': 'Return',
      'AD': 'Adjustment',
      'DA': 'Damaged'
    };
    return types[type] || type;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Stock Management</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add Stock Movement
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {showForm && (
          <div className="mt-6 bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Add Stock Movement</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="product" className="block text-sm font-medium text-gray-700">
                    Product
                  </label>
                  <div className="mt-1">
                    <select
                      id="product"
                      name="product"
                      value={formData.product}
                      onChange={handleInputChange}
                      required
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="">Select a product</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="movement_type" className="block text-sm font-medium text-gray-700">
                    Movement Type
                  </label>
                  <div className="mt-1">
                    <select
                      id="movement_type"
                      name="movement_type"
                      value={formData.movement_type}
                      onChange={handleInputChange}
                      required
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="PU">Purchase</option>
                      <option value="SA">Sale</option>
                      <option value="RE">Return</option>
                      <option value="AD">Adjustment</option>
                      <option value="DA">Damaged</option>
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                    Quantity
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      min={1}
                      name="quantity"
                      id="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      required
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Use negative numbers for outgoing stock
                  </p>
                </div>

                <div className="sm:col-span-4">
                  <label htmlFor="reference_number" className="block text-sm font-medium text-gray-700">
                    Reference Number
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="reference_number"
                      id="reference_number"
                      value={formData.reference_number}
                      onChange={handleInputChange}
                      placeholder="Order number, invoice number, etc."
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Notes
                  </label>
                  <div className="mt-1">
                    <textarea
                      name="notes"
                      id="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
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
              <p className="text-gray-500">Loading stock data...</p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Movement Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performed By
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stockMovements.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        No stock movements found. Add your first movement to get started.
                      </td>
                    </tr>
                  ) : (
                    Array.isArray(stockMovements) ? stockMovements.map((movement) => (
                      <tr key={movement.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {movement.product_details.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {movement.movement_type_display}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`${movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {movement.reference_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(movement.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {movement.performed_by_username}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                          Error: Invalid stock movement data format. Please refresh the page.
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockManagement; 