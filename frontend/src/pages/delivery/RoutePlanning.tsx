import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { deliveryService, RouteInfo } from '../../services/delivery.service';
import { 
  PlusIcon, 
  TruckIcon, 
  MapPinIcon, 
  CheckCircleIcon,
  ExclamationCircleIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const RoutePlanning: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [routes, setRoutes] = useState<RouteInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showNewRouteForm, setShowNewRouteForm] = useState(false);
  const [newRoute, setNewRoute] = useState({
    name: '',
    start_location: '',
    end_location: '',
    date: new Date().toISOString().split('T')[0],
    assigned_agent: 1, // Default agent ID
  });

  useEffect(() => {
    const loadRoutes = async () => {
      try {
        setIsLoading(true);
        const routesData = await deliveryService.getRoutes();
        setRoutes(routesData);
      } catch (err) {
        console.error('Error loading routes:', err);
        setError('Failed to load route data');
      } finally {
        setIsLoading(false);
      }
    };

    loadRoutes();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewRoute({
      ...newRoute,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const createdRoute = await deliveryService.createRoute(newRoute);
      setRoutes([...routes, createdRoute]);
      setShowNewRouteForm(false);
      setNewRoute({
        name: '',
        start_location: '',
        end_location: '',
        date: new Date().toISOString().split('T')[0],
        assigned_agent: 1,
      });
    } catch (err) {
      console.error('Error creating route:', err);
      setError('Failed to create new route');
    }
  };

  const getStatusBadge = (status: 'planned' | 'in_progress' | 'completed') => {
    switch (status) {
      case 'planned':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <CalendarIcon className="mr-1 h-4 w-4" />
            Planned
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <TruckIcon className="mr-1 h-4 w-4" />
            In Progress
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="mr-1 h-4 w-4" />
            Completed
          </span>
        );
    }
  };

  const updateRouteStatus = async (routeId: number, newStatus: string) => {
    try {
      await deliveryService.updateRouteStatus(routeId, newStatus);
      // Refresh routes after update
      const routesData = await deliveryService.getRoutes();
      setRoutes(routesData);
    } catch (err) {
      console.error('Error updating route status:', err);
      setError('Failed to update route status');
    }
  };

  if (isLoading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mt-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Route Planning</h1>
          <div className="mt-4 md:mt-0">
            <button
              onClick={() => setShowNewRouteForm(!showNewRouteForm)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              New Route
            </button>
          </div>
        </div>

        {/* New Route Form */}
        {showNewRouteForm && (
          <div className="mt-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Create New Route</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Plan a new delivery route by providing the necessary information.
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Route Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={newRoute.name}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        required
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                        Date
                      </label>
                      <input
                        type="date"
                        name="date"
                        id="date"
                        value={newRoute.date}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        required
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="start_location" className="block text-sm font-medium text-gray-700">
                        Start Location
                      </label>
                      <input
                        type="text"
                        name="start_location"
                        id="start_location"
                        value={newRoute.start_location}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        required
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="end_location" className="block text-sm font-medium text-gray-700">
                        End Location
                      </label>
                      <input
                        type="text"
                        name="end_location"
                        id="end_location"
                        value={newRoute.end_location}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        required
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="assigned_agent" className="block text-sm font-medium text-gray-700">
                        Assigned Driver
                      </label>
                      <select
                        id="assigned_agent"
                        name="assigned_agent"
                        value={newRoute.assigned_agent}
                        onChange={handleInputChange}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value={1}>John Driver</option>
                        <option value={2}>Jane Delivery</option>
                        <option value={3}>Sam Trucker</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-5 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowNewRouteForm(false)}
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Create
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Routes List */}
        <div className="mt-6">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {routes.length > 0 ? (
                routes.map((route) => (
                  <li key={route.id}>
                    <div className="block hover:bg-gray-50">
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 bg-indigo-500 rounded-md p-2">
                              <TruckIcon className="h-6 w-6 text-white" aria-hidden="true" />
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium text-indigo-600">{route.name}</p>
                              <div className="flex mt-1">
                                <div className="flex items-center text-sm text-gray-500 mr-4">
                                  <CalendarIcon className="flex-shrink-0 mr-1 h-4 w-4 text-gray-400" />
                                  <span>{new Date(route.date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                  <UserIcon className="flex-shrink-0 mr-1 h-4 w-4 text-gray-400" />
                                  <span>Agent ID: {route.assigned_agent}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            {getStatusBadge(route.status)}
                            <div className="ml-5 flex-shrink-0">
                              <Link
                                to={`/delivery/routes/${route.id}`}
                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                              >
                                View
                              </Link>
                              {route.status === 'planned' && (
                                <button
                                  onClick={() => updateRouteStatus(route.id, 'in_progress')}
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  Start Route
                                </button>
                              )}
                              {route.status === 'in_progress' && (
                                <button
                                  onClick={() => updateRouteStatus(route.id, 'completed')}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Complete
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <div className="flex items-center mr-6">
                              <MapPinIcon className="flex-shrink-0 mr-1 h-5 w-5 text-gray-400" />
                              <p>From: <span className="font-medium">{route.start_location}</span></p>
                            </div>
                            <div className="flex items-center">
                              <MapPinIcon className="flex-shrink-0 mr-1 h-5 w-5 text-gray-400" />
                              <p>To: <span className="font-medium">{route.end_location}</span></p>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <div className="flex items-center mr-6">
                              <p>Total Distance: <span className="font-medium">{route.total_distance || 0} km</span></p>
                            </div>
                            <div className="flex items-center mr-6">
                              <p>Stops: <span className="font-medium">{route.stops?.length || 0}</span></p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="px-4 py-6 text-center text-sm text-gray-500">
                  No routes found. Create a new route to get started.
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutePlanning; 