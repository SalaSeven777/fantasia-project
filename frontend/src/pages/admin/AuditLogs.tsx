import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';

interface AuditLog {
  id: number;
  action: string;
  entity: string;
  entityId: string;
  user: string;
  userRole: string;
  timestamp: string;
  ipAddress: string;
  details: string;
}

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([
    {
      id: 1,
      action: 'CREATE',
      entity: 'USER',
      entityId: 'user-123',
      user: 'John Smith',
      userRole: 'Administrator',
      timestamp: '2023-08-15T14:25:36',
      ipAddress: '192.168.1.1',
      details: 'Created new user account for "Sarah Johnson"'
    },
    {
      id: 2,
      action: 'UPDATE',
      entity: 'PRODUCT',
      entityId: 'product-456',
      user: 'Maria Garcia',
      userRole: 'Product Manager',
      timestamp: '2023-08-15T13:42:19',
      ipAddress: '192.168.1.45',
      details: 'Updated product pricing for "Laminated Oak Panel 30x60"'
    },
    {
      id: 3,
      action: 'DELETE',
      entity: 'ORDER',
      entityId: 'order-789',
      user: 'John Smith',
      userRole: 'Administrator',
      timestamp: '2023-08-15T11:18:05',
      ipAddress: '192.168.1.1',
      details: 'Deleted duplicate order #WO-7892'
    },
    {
      id: 4,
      action: 'LOGIN',
      entity: 'SYSTEM',
      entityId: 'session-234',
      user: 'David Wilson',
      userRole: 'Sales Manager',
      timestamp: '2023-08-15T10:05:22',
      ipAddress: '192.168.1.87',
      details: 'User login successful'
    },
    {
      id: 5,
      action: 'EXPORT',
      entity: 'REPORT',
      entityId: 'report-567',
      user: 'Maria Garcia',
      userRole: 'Product Manager',
      timestamp: '2023-08-15T09:34:11',
      ipAddress: '192.168.1.45',
      details: 'Exported monthly sales report'
    },
    {
      id: 6,
      action: 'UPDATE',
      entity: 'INVENTORY',
      entityId: 'inventory-890',
      user: 'Alex Chen',
      userRole: 'Warehouse Manager',
      timestamp: '2023-08-15T08:22:59',
      ipAddress: '192.168.1.62',
      details: 'Updated inventory levels after manual count'
    },
    {
      id: 7,
      action: 'CREATE',
      entity: 'DISCOUNT',
      entityId: 'discount-123',
      user: 'David Wilson',
      userRole: 'Sales Manager',
      timestamp: '2023-08-14T16:45:33',
      ipAddress: '192.168.1.87',
      details: 'Created new summer sale promotion'
    },
    {
      id: 8,
      action: 'FAILED_LOGIN',
      entity: 'SYSTEM',
      entityId: 'session-345',
      user: 'Unknown',
      userRole: 'N/A',
      timestamp: '2023-08-14T15:12:07',
      ipAddress: '198.51.100.23',
      details: 'Failed login attempt for user johndoe@example.com'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('All');
  const [entityFilter, setEntityFilter] = useState('All');
  const [userFilter, setUserFilter] = useState('All');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const actions = ['All', ...Array.from(new Set(logs.map(log => log.action)))];
  const entities = ['All', ...Array.from(new Set(logs.map(log => log.entity)))];
  const users = ['All', ...Array.from(new Set(logs.map(log => log.user)))];

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === 'All' || log.action === actionFilter;
    const matchesEntity = entityFilter === 'All' || log.entity === entityFilter;
    const matchesUser = userFilter === 'All' || log.user === userFilter;
    
    return matchesSearch && matchesAction && matchesEntity && matchesUser;
  });

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  const getActionBadgeClass = (action: string): string => {
    switch (action) {
      case 'CREATE':
        return 'admin-badge admin-badge-success';
      case 'UPDATE':
        return 'admin-badge admin-badge-primary';
      case 'DELETE':
        return 'admin-badge admin-badge-danger';
      case 'LOGIN':
        return 'admin-badge admin-badge-info';
      case 'EXPORT':
        return 'admin-badge admin-badge-warning';
      case 'FAILED_LOGIN':
        return 'admin-badge admin-badge-danger';
      default:
        return 'admin-badge';
    }
  };

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setShowDetailsModal(true);
  };

  const closeModal = () => {
    setShowDetailsModal(false);
    setSelectedLog(null);
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Audit Logs</h1>
        <div className="d-flex flex-wrap gap-3">
          <button className="admin-button-primary">
            Export Logs
          </button>
          <button className="admin-button-secondary">
            Configure Retention
          </button>
        </div>
      </div>

      <div className="admin-filters">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-4">
          <div className="flex-1">
            <div className="admin-search">
              <input
                type="text"
                placeholder="Search audit logs..."
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
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="d-block fs-6 fw-medium text-secondary mb-1">Action</label>
            <select 
              className="admin-select"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            >
              {actions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="d-block fs-6 fw-medium text-secondary mb-1">Entity</label>
            <select 
              className="admin-select"
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
            >
              {entities.map(entity => (
                <option key={entity} value={entity}>{entity}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="d-block fs-6 fw-medium text-secondary mb-1">User</label>
            <select 
              className="admin-select"
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
            >
              {users.map(user => (
                <option key={user} value={user}>{user}</option>
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
                <th>Timestamp</th>
                <th className="d-none d-md-table-cell">User</th>
                <th>Action</th>
                <th className="d-none d-sm-table-cell">Entity</th>
                <th className="d-none d-md-table-cell">Details</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    No audit logs found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id}>
                    <td>{formatDate(log.timestamp)}</td>
                    <td className="d-none d-md-table-cell">
                      <div>
                        <div className="fw-medium">{log.user}</div>
                        <div className="fs-6 text-secondary">{log.userRole}</div>
                      </div>
                    </td>
                    <td>
                      <span className={getActionBadgeClass(log.action)}>
                        {log.action}
                      </span>
                    </td>
                    <td className="d-none d-sm-table-cell">
                      <div>
                        <div>{log.entity}</div>
                        <div className="fs-6 text-secondary">ID: {log.entityId}</div>
                      </div>
                    </td>
                    <td className="d-none d-md-table-cell max-w-xs text-truncate">{log.details}</td>
                    <td className="text-right">
                      <div className="admin-table-actions">
                        <button 
                          className="admin-button-secondary-sm"
                          onClick={() => handleViewDetails(log)}
                        >
                          View Details
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

      {/* Log Details Modal */}
      {showDetailsModal && selectedLog && (
        <div className="fixed z-50 inset-0 overflow-y-auto bg-black bg-opacity-50">
          <div className="d-flex align-items-center justify-content-center min-vh-100 p-4">
            <div className="admin-modal">
              <div className="admin-modal-header">
                <h3 className="admin-modal-title">
                  Audit Log Details
                </h3>
              </div>
              <div className="admin-modal-content">
                <div className="d-flex flex-column gap-4">
                  <div>
                    <h4 className="fs-6 fw-medium text-secondary mb-1">Action</h4>
                    <div className="fs-6">
                      <span className={getActionBadgeClass(selectedLog.action)}>
                        {selectedLog.action}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="fs-6 fw-medium text-secondary mb-1">Entity</h4>
                      <p className="fs-6">{selectedLog.entity}</p>
                    </div>
                    <div>
                      <h4 className="fs-6 fw-medium text-secondary mb-1">Entity ID</h4>
                      <p className="fs-6">{selectedLog.entityId}</p>
                    </div>
                    <div>
                      <h4 className="fs-6 fw-medium text-secondary mb-1">User</h4>
                      <p className="fs-6">{selectedLog.user}</p>
                    </div>
                    <div>
                      <h4 className="fs-6 fw-medium text-secondary mb-1">User Role</h4>
                      <p className="fs-6">{selectedLog.userRole}</p>
                    </div>
                    <div>
                      <h4 className="fs-6 fw-medium text-secondary mb-1">IP Address</h4>
                      <p className="fs-6">{selectedLog.ipAddress}</p>
                    </div>
                    <div>
                      <h4 className="fs-6 fw-medium text-secondary mb-1">Timestamp</h4>
                      <p className="fs-6">{formatDate(selectedLog.timestamp)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="fs-6 fw-medium text-secondary mb-1">Details</h4>
                    <p className="fs-6">{selectedLog.details}</p>
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={closeModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AuditLogs; 