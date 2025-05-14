import React, { useState } from 'react';
import { Card, Row, Col, Form, Button, Table, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faUser,
  faEdit,
  faTrash,
  faPlus,
  faKey,
  faDownload,
  faFilter
} from '@fortawesome/free-solid-svg-icons';
import AdminLayout from '../../components/AdminLayout';

interface AuditLog {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
}

const AuditLogs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  const auditLogs: AuditLog[] = [
    {
      id: 1,
      timestamp: '2024-03-05 14:08:23',
      user: 'admin@example.com',
      action: 'CREATE',
      resource: 'Product',
      details: 'Created new product: Wooden Table',
      ipAddress: '192.168.1.100'
    },
    {
      id: 2,
      timestamp: '2024-03-05 14:05:17',
      user: 'john.doe@example.com',
      action: 'UPDATE',
      resource: 'Order',
      details: 'Updated order status to Shipped',
      ipAddress: '192.168.1.101'
    },
    {
      id: 3,
      timestamp: '2024-03-05 14:02:45',
      user: 'admin@example.com',
      action: 'DELETE',
      resource: 'User',
      details: 'Deleted user account',
      ipAddress: '192.168.1.100'
    },
    {
      id: 4,
      timestamp: '2024-03-05 13:58:12',
      user: 'jane.smith@example.com',
      action: 'LOGIN',
      resource: 'Auth',
      details: 'Successful login',
      ipAddress: '192.168.1.102'
    }
  ];

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'success';
      case 'UPDATE':
        return 'info';
      case 'DELETE':
        return 'danger';
      case 'LOGIN':
        return 'primary';
      default:
        return 'secondary';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE':
        return faPlus;
      case 'UPDATE':
        return faEdit;
      case 'DELETE':
        return faTrash;
      case 'LOGIN':
        return faKey;
      default:
        return faEdit;
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterAction === 'all' || log.action === filterAction;

    return matchesSearch && matchesFilter;
  });

  return (
    <AdminLayout>
      <div className="admin-header">
        <h1 className="admin-title">Audit Logs</h1>
        <Button className="admin-btn admin-btn-primary">
          <FontAwesomeIcon icon={faDownload} className="me-2" />
          Export Logs
        </Button>
      </div>

      <Card className="admin-card mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3 mb-md-0">
                <div className="input-group">
                  <span className="input-group-text">
                    <FontAwesomeIcon icon={faSearch} />
                  </span>
                  <Form.Control
                    type="text"
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </Form.Group>
            </Col>
            <Col md={6}>
              <div className="d-flex align-items-center">
                <FontAwesomeIcon icon={faFilter} className="me-2" />
                <Form.Select
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value)}
                >
                  <option value="all">All Actions</option>
                  <option value="CREATE">Create</option>
                  <option value="UPDATE">Update</option>
                  <option value="DELETE">Delete</option>
                  <option value="LOGIN">Login</option>
                </Form.Select>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="admin-card">
        <Card.Body>
          <Table className="admin-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Resource</th>
                <th>Details</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td>{log.timestamp}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      <FontAwesomeIcon icon={faUser} className="me-2" />
                      {log.user}
                    </div>
                  </td>
                  <td>
                    <Badge bg={getActionBadgeVariant(log.action)} className="d-flex align-items-center" style={{ width: 'fit-content' }}>
                      <FontAwesomeIcon icon={getActionIcon(log.action)} className="me-1" />
                      {log.action}
                    </Badge>
                  </td>
                  <td>{log.resource}</td>
                  <td>{log.details}</td>
                  <td>{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </AdminLayout>
  );
};

export default AuditLogs; 