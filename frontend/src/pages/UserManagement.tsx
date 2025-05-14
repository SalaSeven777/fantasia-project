import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { User, UserRole } from '../types';
import { userService } from '../services/user.service';
import { apiService } from '../services/api';
import { toast } from 'react-toastify';

interface ExtendedUser extends User {
  lastActive: string;
}

interface UserFormData {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
}

const initialFormData: UserFormData = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'CL'
};

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserFormData>(initialFormData);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getUsers();
      console.log('User response:', response);
      
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
      
      setUsers(userData.map((user: User) => ({
        ...user,
        lastActive: new Date().toISOString() // This should come from the backend in a real app
      })));
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users');
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

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
      role: user.role
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await userService.deleteUser(userId);
      setUsers(users.filter(user => user.id !== userId));
      toast.success('User deleted successfully');
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
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
          role: formData.role
        };
        
        // Only include password if it was provided
        if (formData.password) {
          Object.assign(updateData, { password: formData.password });
        }
        
        await userService.updateUser(formData.id, updateData);
        toast.success('User updated successfully');
      } else {
        // Create new user
        const newUser = {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          password: formData.password,
          role: formData.role
        };
        
        // Using post method directly as we don't have a specific createUser method
        await apiService.post('/users/', newUser);
        toast.success('User created successfully');
      }
      
      // Reset form and close modal
      setShowModal(false);
      setFormData(initialFormData);
      
      // Refresh the users list
      await fetchUsers();
    } catch (err) {
      console.error('Error saving user:', err);
      toast.error(isEditing ? 'Failed to update user' : 'Failed to create user');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData(initialFormData);
  };

  const getRoleDisplay = (role: UserRole) => {
    switch (role) {
      case 'AD':
        return 'Admin';
      case 'CO':
        return 'Commercial';
      case 'DA':
        return 'Delivery Agent';
      case 'WM':
        return 'Warehouse Manager';
      case 'BM':
        return 'Billing Manager';
      case 'CL':
        return 'Client';
      default:
        return role;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'AD':
        return 'bg-purple-100 text-purple-800';
      case 'CO':
        return 'bg-blue-100 text-blue-800';
      case 'DA':
        return 'bg-green-100 text-green-800';
      case 'WM':
        return 'bg-yellow-100 text-yellow-800';
      case 'BM':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  // Helper to get initials
  const getInitials = (user: ExtendedUser): string => {
    const first = getFirstName(user);
    const last = getLastName(user);
    return `${first ? first[0] : ''}${last ? last[0] : ''}`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchUsers}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
          
          <div className="mt-4">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={handleAddUser}
            >
              Add User
            </button>
          </div>

          <div className="mt-8 flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Active
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-gray-500 font-medium">
                                    {getInitials(user)}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {getFirstName(user)} {getLastName(user)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role)}`}>
                              {getRoleDisplay(user.role)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.date_joined).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.lastActive).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleEditUser(user.id)}
                              className="text-indigo-600 hover:text-indigo-900 mr-4"
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
            </div>
          </div>
        </div>
      </div>

      {/* User Modal Form */}
      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {isEditing ? 'Edit User' : 'Add New User'}
                    </h3>
                    <div className="mt-2">
                      <div className="mt-4">
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          id="firstName"
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="mt-4">
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          id="lastName"
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="mt-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="mt-4">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                          Password {isEditing && '(leave empty to keep current)'}
                        </label>
                        <input
                          type="password"
                          name="password"
                          id="password"
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={formData.password}
                          onChange={handleInputChange}
                          required={!isEditing}
                        />
                      </div>

                      <div className="mt-4">
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                          Role
                        </label>
                        <select
                          id="role"
                          name="role"
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
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
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {isEditing ? 'Save Changes' : 'Create User'}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default UserManagement;