import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';

interface ConfigItem {
  id: number;
  key: string;
  value: string;
  description: string;
  category: string;
}

const SystemConfig: React.FC = () => {
  const [configs, setConfigs] = useState<ConfigItem[]>([
    { 
      id: 1, 
      key: 'SMTP_HOST', 
      value: 'smtp.fantasia.com', 
      description: 'SMTP server for outgoing emails', 
      category: 'Email' 
    },
    { 
      id: 2, 
      key: 'SMTP_PORT', 
      value: '587', 
      description: 'SMTP port for email server', 
      category: 'Email' 
    },
    { 
      id: 3, 
      key: 'ORDER_PREFIX', 
      value: 'FB-', 
      description: 'Prefix for order numbers', 
      category: 'Orders' 
    },
    { 
      id: 4, 
      key: 'MAX_PRODUCTS_PER_PAGE', 
      value: '24', 
      description: 'Maximum products displayed per page', 
      category: 'Products' 
    },
    { 
      id: 5, 
      key: 'DEFAULT_CURRENCY', 
      value: 'USD', 
      description: 'Default currency for prices', 
      category: 'Pricing' 
    }
  ]);
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [filter, setFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  const categories = ['All', ...Array.from(new Set(configs.map(config => config.category)))];
  
  const filteredConfigs = configs.filter(config => {
    const matchesText = config.key.toLowerCase().includes(filter.toLowerCase()) || 
                      config.description.toLowerCase().includes(filter.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || config.category === categoryFilter;
    return matchesText && matchesCategory;
  });
  
  const handleEdit = (id: number) => {
    const config = configs.find(c => c.id === id);
    if (config) {
      setEditingId(id);
      setEditValue(config.value);
    }
  };
  
  const handleSave = (id: number) => {
    setConfigs(configs.map(config => 
      config.id === id ? {...config, value: editValue} : config
    ));
    setEditingId(null);
  };
  
  const handleCancel = () => {
    setEditingId(null);
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1 className="admin-page-title">System Configuration</h1>
        <button className="admin-button-primary">
          Add New Config
        </button>
      </div>
      
      <div className="admin-filters">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex-1 mb-3 md:mb-0">
            <div className="admin-search">
              <input
                type="text"
                placeholder="Search configurations..."
                className="admin-search-input"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
              <div className="admin-search-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-auto">
            <select 
              className="admin-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Key</th>
                <th>Value</th>
                <th className="d-none d-md-table-cell">Description</th>
                <th className="d-none d-sm-table-cell">Category</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredConfigs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    No configurations found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredConfigs.map(config => (
                  <tr key={config.id}>
                    <td className="font-medium">{config.key}</td>
                    <td>
                      {editingId === config.id ? (
                        <input 
                          type="text" 
                          className="admin-form-control"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                        />
                      ) : (
                        config.value
                      )}
                    </td>
                    <td className="d-none d-md-table-cell">{config.description}</td>
                    <td className="d-none d-sm-table-cell">
                      <span className="admin-badge admin-badge-primary">
                        {config.category}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="admin-table-actions">
                        {editingId === config.id ? (
                          <>
                            <button 
                              onClick={() => handleSave(config.id)} 
                              className="admin-button-secondary-sm"
                            >
                              Save
                            </button>
                            <button 
                              onClick={handleCancel} 
                              className="admin-button-danger-sm"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => handleEdit(config.id)} 
                              className="admin-button-secondary-sm"
                            >
                              Edit
                            </button>
                            <button className="admin-button-danger-sm">
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SystemConfig; 