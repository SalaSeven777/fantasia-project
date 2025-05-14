import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Badge, ProgressBar } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faServer,
  faDatabase,
  faUsers,
  faExchangeAlt,
  faMemory,
  faMicrochip,
  faHdd,
  faNetworkWired
} from '@fortawesome/free-solid-svg-icons';
import AdminLayout from '../../components/AdminLayout';

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLoad: number;
  activeUsers: number;
  requestsPerMinute: number;
  errorRate: number;
  databaseConnections: number;
}

interface ServiceStatus {
  name: string;
  status: 'Operational' | 'Warning' | 'Critical' | 'Maintenance';
  uptime: string;
  lastIncident: string;
}

const GlobalMonitoring: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpuUsage: 45,
    memoryUsage: 62,
    diskUsage: 78,
    networkLoad: 34,
    activeUsers: 128,
    requestsPerMinute: 256,
    errorRate: 0.5,
    databaseConnections: 24
  });

  const [services] = useState<ServiceStatus[]>([
    {
      name: 'Web Server',
      status: 'Operational',
      uptime: '99.9%',
      lastIncident: '2024-02-28'
    },
    {
      name: 'Database',
      status: 'Operational',
      uptime: '99.8%',
      lastIncident: '2024-02-25'
    },
    {
      name: 'Cache Server',
      status: 'Warning',
      uptime: '98.5%',
      lastIncident: '2024-03-01'
    },
    {
      name: 'Message Queue',
      status: 'Operational',
      uptime: '99.7%',
      lastIncident: '2024-02-20'
    }
  ]);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        cpuUsage: Math.min(100, Math.max(0, prev.cpuUsage + (Math.random() * 10 - 5))),
        memoryUsage: Math.min(100, Math.max(0, prev.memoryUsage + (Math.random() * 8 - 4))),
        networkLoad: Math.min(100, Math.max(0, prev.networkLoad + (Math.random() * 12 - 6))),
        activeUsers: Math.max(0, prev.activeUsers + Math.floor(Math.random() * 10 - 5)),
        requestsPerMinute: Math.max(0, prev.requestsPerMinute + Math.floor(Math.random() * 20 - 10))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'Operational':
        return 'success';
      case 'Warning':
        return 'warning';
      case 'Critical':
        return 'danger';
      case 'Maintenance':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const getProgressVariant = (value: number) => {
    if (value < 60) return 'success';
    if (value < 80) return 'warning';
    return 'danger';
  };

  return (
    <AdminLayout>
      <div className="admin-header">
        <h1 className="admin-title">System Monitoring</h1>
      </div>

      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="admin-stats-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="admin-stats-title">CPU Usage</div>
                  <div className="admin-stats-value">{metrics.cpuUsage.toFixed(1)}%</div>
                </div>
                <FontAwesomeIcon icon={faMicrochip} size="2x" />
              </div>
              <ProgressBar 
                variant={getProgressVariant(metrics.cpuUsage)}
                now={metrics.cpuUsage}
                className="mt-2"
              />
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="admin-stats-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="admin-stats-title">Memory Usage</div>
                  <div className="admin-stats-value">{metrics.memoryUsage.toFixed(1)}%</div>
                </div>
                <FontAwesomeIcon icon={faMemory} size="2x" />
              </div>
              <ProgressBar 
                variant={getProgressVariant(metrics.memoryUsage)}
                now={metrics.memoryUsage}
                className="mt-2"
              />
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="admin-stats-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="admin-stats-title">Active Users</div>
                  <div className="admin-stats-value">{metrics.activeUsers}</div>
                </div>
                <FontAwesomeIcon icon={faUsers} size="2x" />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="admin-stats-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="admin-stats-title">Requests/min</div>
                  <div className="admin-stats-value">{metrics.requestsPerMinute}</div>
                </div>
                <FontAwesomeIcon icon={faExchangeAlt} size="2x" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col md={8}>
          <Card className="admin-card">
            <Card.Header className="admin-card-header">
              <Card.Title className="admin-card-title">Service Status</Card.Title>
            </Card.Header>
            <Card.Body>
              <Table className="admin-table">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Status</th>
                    <th>Uptime</th>
                    <th>Last Incident</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service, index) => (
                    <tr key={index}>
                      <td>
                        <div className="d-flex align-items-center">
                          <FontAwesomeIcon 
                            icon={service.name.includes('Database') ? faDatabase : faServer}
                            className="me-2"
                          />
                          {service.name}
                        </div>
                      </td>
                      <td>
                        <Badge bg={getStatusColor(service.status)}>
                          {service.status}
                        </Badge>
                      </td>
                      <td>{service.uptime}</td>
                      <td>{service.lastIncident}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="admin-card">
            <Card.Header className="admin-card-header">
              <Card.Title className="admin-card-title">System Health</Card.Title>
            </Card.Header>
            <Card.Body>
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span>Disk Usage</span>
                  <span>{metrics.diskUsage}%</span>
                </div>
                <ProgressBar 
                  variant={getProgressVariant(metrics.diskUsage)}
                  now={metrics.diskUsage}
                />
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span>Network Load</span>
                  <span>{metrics.networkLoad}%</span>
                </div>
                <ProgressBar 
                  variant={getProgressVariant(metrics.networkLoad)}
                  now={metrics.networkLoad}
                />
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span>Error Rate</span>
                  <span>{metrics.errorRate}%</span>
                </div>
                <ProgressBar 
                  variant={metrics.errorRate > 1 ? 'danger' : 'success'}
                  now={metrics.errorRate * 20}
                />
              </div>

              <div>
                <div className="d-flex justify-content-between mb-2">
                  <span>DB Connections</span>
                  <span>{metrics.databaseConnections}</span>
                </div>
                <ProgressBar 
                  variant={metrics.databaseConnections > 50 ? 'warning' : 'success'}
                  now={(metrics.databaseConnections / 100) * 100}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </AdminLayout>
  );
};

export default GlobalMonitoring; 