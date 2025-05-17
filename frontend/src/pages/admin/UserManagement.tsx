import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../types';
import { apiService } from '../../services/api';
import AdminLayout from '../../components/AdminLayout';

// Extend the base User type with additional properties
interface ExtendedUser extends User {
  last_active?: string;
  username: string;
  isAuthenticated: boolean;
  date_joined: string;
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
  const [filterRole, setFilterRole] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

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
        
        // Use mock data when API fails
        setUsers([
          { 
            id: 1, 
            firstName: 'John', 
            lastName: 'Doe', 
            email: 'john@example.com', 
            role: 'AD', 
            is_active: true, 
            last_active: '2023-07-15T08:30:00',
            username: 'johndoe',
            isAuthenticated: true,
            date_joined: '2023-01-15T08:30:00'
          },
          { 
            id: 2, 
            firstName: 'Jane', 
            lastName: 'Smith', 
            email: 'jane@example.com', 
            role: 'CO', 
            is_active: true, 
            last_active: '2023-07-14T14:20:00',
            username: 'janesmith',
            isAuthenticated: true,
            date_joined: '2023-02-10T10:15:00'
          },
          { 
            id: 3, 
            firstName: 'Mike', 
            lastName: 'Johnson', 
            email: 'mike@example.com', 
            role: 'WM', 
            is_active: true, 
            last_active: '2023-07-14T11:15:00',
            username: 'mikej',
            isAuthenticated: true,
            date_joined: '2023-03-05T14:30:00'
          },
          { 
            id: 4, 
            firstName: 'Sarah', 
            lastName: 'Williams', 
            email: 'sarah@example.com', 
            role: 'DA', 
            is_active: false, 
            last_active: '2023-07-10T09:45:00',
            username: 'sarahw',
            isAuthenticated: false,
            date_joined: '2023-04-20T09:00:00'
          },
          { 
            id: 5, 
            firstName: 'David', 
            lastName: 'Brown', 
            email: 'david@example.com', 
            role: 'BM', 
            is_active: true, 
            last_active: '2023-07-13T16:30:00',
            username: 'davidb',
            isAuthenticated: true,
            date_joined: '2023-05-15T11:45:00'
          },
        ]);
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

  const getFirstName = (user: ExtendedUser): string => {
    return user.firstName || user.first_name || '';
  };

  const getLastName = (user: ExtendedUser): string => {
    return user.lastName || user.last_name || '';
  };

  const getRoleBadgeClass = (role: string): string => {
    switch (role) {
      case 'AD': return 'admin-badge admin-badge-primary';
      case 'CO': return 'admin-badge admin-badge-success';
      case 'WM': return 'admin-badge admin-badge-warning';
      case 'DA': return 'admin-badge admin-badge-info';
      case 'BM': return 'admin-badge admin-badge-warning';
      case 'CL': return 'admin-badge';
      default: return 'admin-badge';
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Never';
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Filter users based on role and search term
  const filteredUsers = users.filter(user => {
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const fullName = `${getFirstName(user)} ${getLastName(user)}`.toLowerCase();
    const matchesSearch = searchTerm === '' || 
      fullName.includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesRole && matchesSearch;
  });

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1 className="admin-page-title">User Management</h1>
        <button
          className="admin-button-primary"
          onClick={handleAddUser}
        >
          Add User
        </button>
      </div>
      
      {/* Filters and Search */}
      <div className="admin-filters">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="flex-1 mb-3 sm:mb-0">
            <div className="admin-search">
              <input
                type="text"
                placeholder="Search users..."
                className="admin-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="admin-search-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="w-full sm:w-auto">
            <select 
              className="admin-select"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="AD">Administrators</option>
              <option value="CO">Commercial</option>
              <option value="WM">Warehouse Managers</option>
              <option value="DA">Delivery Agents</option>
              <option value="BM">Billing Managers</option>
              <option value="CL">Clients</option>
            </select>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          <p>{error}</p>
        </div>
      ) : (
      <div className="mt-4">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th className="d-none d-md-table-cell">Joined</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="d-flex align-items-center justify-content-center w-10 h-10 rounded-full bg-brown-100 text-brown-800 font-medium mr-3">
                          {getFirstName(user).charAt(0)}{getLastName(user).charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">
                            {getFirstName(user)} {getLastName(user)}
                          </div>
                          {user.username && (
                            <div className="text-sm text-gray-500 d-none d-sm-block">
                              @{user.username}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={getRoleBadgeClass(user.role)}>
                        {getRoleDisplay(user.role)}
                      </span>
                    </td>
                    <td>
                      <span className={user.is_active ? "admin-badge admin-badge-success" : "admin-badge admin-badge-danger"}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="d-none d-md-table-cell">
                      {user.date_joined 
                        ? new Date(user.date_joined).toLocaleDateString() 
                        : 'Unknown'}
                    </td>
                    <td className="text-right">
                      <div className="admin-table-actions">
                        <button 
                          onClick={() => handleEditUser(user.id)}
                          className="admin-button-secondary-sm"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="admin-button-danger-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Modal for adding/editing user */}
      {showModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto bg-black bg-opacity-50">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="admin-modal">
              <div className="admin-modal-header">
                <h3 className="admin-modal-title">
                  {isEditing ? 'Edit User' : 'Add New User'}
                </h3>
              </div>
              <div className="admin-modal-content">
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="admin-form-label">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        id="firstName"
                        required
                        className="admin-form-control"
                        value={formData.firstName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="admin-form-label">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        id="lastName"
                        required
                        className="admin-form-control"
                        value={formData.lastName}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="admin-form-label">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      required
                      className="admin-form-control"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="admin-form-label">
                      {isEditing ? 'New Password (leave blank to keep current)' : 'Password'}
                    </label>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      required={!isEditing}
                      className="admin-form-control"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="role" className="admin-form-label">
                      Role
                    </label>
                    <select
                      id="role"
                      name="role"
                      required
                      className="admin-form-control"
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
                  <div className="d-flex align-items-center">
                    <input
                      id="is_active"
                      name="is_active"
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="h-4 w-4"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm">
                      Active
                    </label>
                  </div>
                </form>
              </div>
              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn-primary"
                  onClick={handleSubmit}
                >
                  {isEditing ? 'Update User' : 'Create User'}
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={closeModal}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default UserManagement; 