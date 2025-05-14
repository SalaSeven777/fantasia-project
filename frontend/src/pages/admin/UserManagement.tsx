import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../types';
import { apiService } from '../../services/api';

// Extend the base User type with additional properties
interface ExtendedUser extends User {
  last_active?: string;
}

interface UserFormData {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  is_active: boolean;
}

const initialFormData: UserFormData = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'CL',
  is_active: true
};

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserFormData>(initialFormData);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await apiService.get<any>('users/');
        console.log('Fetched users:', response);
        
        // Handle different response formats
        let userData = response;
        
        // Check if response is nested in a results property (pagination)
        if (response && typeof response === 'object' && 'results' in response) {
          userData = response.results;
        }
        
        // Check if response is not an array
        if (!Array.isArray(userData)) {
          console.error('Expected users array but got:', userData);
          throw new Error('Invalid response format from server');
        }
        
        setUsers(userData);
        setError(null);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleAddUser = () => {
    setFormData(initialFormData);
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEditUser = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    setFormData({
      id: user.id,
      firstName: getFirstName(user),
      lastName: getLastName(user),
      email: user.email,
      password: '', // Don't set password when editing
      role: user.role,
      is_active: user.is_active
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await apiService.delete(`users/${userId}/`);
      setUsers(users.filter(user => user.id !== userId));
      alert('User deleted successfully');
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Special handling for checkbox inputs
    if (name === 'is_active' && e.target instanceof HTMLInputElement && e.target.type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: e.target.checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing && formData.id) {
        // Update existing user
        const updateData = {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          role: formData.role,
          is_active: formData.is_active
        };
        
        // Only include password if it was provided
        if (formData.password) {
          Object.assign(updateData, { password: formData.password });
        }
        
        await apiService.patch(`users/${formData.id}/`, updateData);
        alert('User updated successfully');
      } else {
        // Create new user
        const newUser = {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          is_active: formData.is_active
        };
        
        await apiService.post('users/', newUser);
        alert('User created successfully');
      }
      
      // Reset form and close modal
      setShowModal(false);
      setFormData(initialFormData);
      
      // Refresh the users list
      const response = await apiService.get<any>('users/');
      let userData = response;
      
      if (response && typeof response === 'object' && 'results' in response) {
        userData = response.results;
      }
      
      if (Array.isArray(userData)) {
        setUsers(userData);
      }
    } catch (err) {
      console.error('Error saving user:', err);
      alert(isEditing ? 'Failed to update user' : 'Failed to create user');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData(initialFormData);
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'CL': return 'Client';
      case 'CO': return 'Commercial';
      case 'DA': return 'Delivery Agent';
      case 'WM': return 'Warehouse Manager';
      case 'BM': return 'Billing Manager';
      case 'AD': return 'Administrator';
      default: return role;
    }
  };

  // Helper to get first name (handles both naming conventions)
  const getFirstName = (user: ExtendedUser): string => {
    return user.first_name || user.firstName || '';
  };

  // Helper to get last name (handles both naming conventions)
  const getLastName = (user: ExtendedUser): string => {
    return user.last_name || user.lastName || '';
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-primary-dark-blue-900">User Management</h1>
          <button
            className="bg-primary-dark-blue-600 text-white px-4 py-2 rounded-md hover:bg-primary-dark-blue-700 responsive-button"
            onClick={handleAddUser}
          >
            Add User
          </button>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-dark-blue-600"></div>
          </div>
        ) : error ? (
          <div className="mt-6 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : (
        <div className="mt-6">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg table-container">
            <table className="min-w-full divide-y divide-gray-200 table-responsive user-table">
              <thead className="bg-primary-dark-blue-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary-dark-blue-900 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary-dark-blue-900 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary-dark-blue-900 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary-dark-blue-900 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary-dark-blue-900 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-primary-dark-blue-900 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-primary-dark-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-dark-blue-900">
                            {getFirstName(user).charAt(0)}{getLastName(user).charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {getFirstName(user)} {getLastName(user)}
                          </div>
                          {user.username && (
                            <div className="text-sm text-gray-500">
                              {user.username ? `@${user.username}` : 'No username'}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-dark-blue-100 text-primary-dark-blue-900">
                        {getRoleDisplay(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.date_joined 
                        ? new Date(user.date_joined).toLocaleDateString() 
                        : 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleEditUser(user.id)}
                        className="text-primary-dark-blue-600 hover:text-primary-dark-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </div>

      {/* Modal for adding/editing user */}
      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-primary-dark-blue-900">
                      {isEditing ? 'Edit User' : 'Add New User'}
                    </h3>
                    <div className="mt-4">
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                              First Name
                            </label>
                            <input
                              type="text"
                              name="firstName"
                              id="firstName"
                              required
                              className="mt-1 focus:ring-primary-dark-blue-500 focus:border-primary-dark-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              value={formData.firstName}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                              Last Name
                            </label>
                            <input
                              type="text"
                              name="lastName"
                              id="lastName"
                              required
                              className="mt-1 focus:ring-primary-dark-blue-500 focus:border-primary-dark-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              value={formData.lastName}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            id="email"
                            required
                            className="mt-1 focus:ring-primary-dark-blue-500 focus:border-primary-dark-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            value={formData.email}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div>
                          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            {isEditing ? 'Password (leave blank to keep current)' : 'Password'}
                          </label>
                          <input
                            type="password"
                            name="password"
                            id="password"
                            required={!isEditing}
                            className="mt-1 focus:ring-primary-dark-blue-500 focus:border-primary-dark-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            value={formData.password}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div>
                          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                            Role
                          </label>
                          <select
                            id="role"
                            name="role"
                            required
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-dark-blue-500 focus:border-primary-dark-blue-500 sm:text-sm rounded-md"
                            value={formData.role}
                            onChange={handleInputChange}
                          >
                            <option value="CL">Client</option>
                            <option value="CO">Commercial</option>
                            <option value="DA">Delivery Agent</option>
                            <option value="WM">Warehouse Manager</option>
                            <option value="BM">Billing Manager</option>
                            <option value="AD">Administrator</option>
                          </select>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="is_active"
                            name="is_active"
                            type="checkbox"
                            checked={formData.is_active}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-primary-dark-blue-600 focus:ring-primary-dark-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                            Active
                          </label>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-dark-blue-600 text-base font-medium text-white hover:bg-primary-dark-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleSubmit}
                >
                  {isEditing ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={closeModal}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement; 