import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';

interface SystemMetric {
  id: number;
  name: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  timestamp: string;
}

interface ServerStatus {
  id: number;
  name: string;
  status: 'online' | 'offline' | 'maintenance';
  uptime: string;
  lastChecked: string;
}

const Monitoring: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetric[]>([
    {
      id: 1,
      name: 'CPU Usage',
      value: 42,
      unit: '%',
      status: 'normal',
      timestamp: '2023-08-15T12:30:45'
    },
    {
      id: 2,
      name: 'Memory Usage',
      value: 68,
      unit: '%',
      status: 'warning',
      timestamp: '2023-08-15T12:30:45'
    },
    {
      id: 3,
      name: 'Disk Usage',
      value: 78,
      unit: '%',
      status: 'warning',
      timestamp: '2023-08-15T12:30:45'
    },
    {
      id: 4,
      name: 'Network Throughput',
      value: 25.4,
      unit: 'MB/s',
      status: 'normal',
      timestamp: '2023-08-15T12:30:45'
    },
    {
      id: 5,
      name: 'Database Connections',
      value: 120,
      unit: '',
      status: 'normal',
      timestamp: '2023-08-15T12:30:45'
    }
  ]);

  const [servers, setServers] = useState<ServerStatus[]>([
    {
      id: 1,
      name: 'Web Server 1',
      status: 'online',
      uptime: '45 days, 7 hours',
      lastChecked: '2023-08-15T12:30:45'
    },
    {
      id: 2,
      name: 'Web Server 2',
      status: 'online',
      uptime: '32 days, 14 hours',
      lastChecked: '2023-08-15T12:30:45'
    },
    {
      id: 3,
      name: 'Database Server',
      status: 'online',
      uptime: '28 days, 9 hours',
      lastChecked: '2023-08-15T12:30:45'
    },
    {
      id: 4,
      name: 'Cache Server',
      status: 'offline',
      uptime: '0 days, 0 hours',
      lastChecked: '2023-08-15T12:30:45'
    },
    {
      id: 5,
      name: 'File Server',
      status: 'maintenance',
      uptime: '5 days, 3 hours',
      lastChecked: '2023-08-15T12:30:45'
    }
  ]);

  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case 'normal':
      case 'online':
        return 'admin-badge admin-badge-success';
      case 'warning':
      case 'maintenance':
        return 'admin-badge admin-badge-warning';
      case 'critical':
      case 'offline':
        return 'admin-badge admin-badge-danger';
      default:
        return 'admin-badge';
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1 className="admin-page-title">System Monitoring</h1>
        <div className="d-flex flex-wrap gap-3">
          <button className="admin-button-primary">
            Refresh Data
          </button>
          <button className="admin-button-secondary">
            Configure Alerts
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">System Health</h2>
          </div>
          <div className="admin-card-body">
            <div className="d-flex align-items-center justify-content-center">
              <div className="position-relative" style={{ height: '128px', width: '128px' }}>
                <svg className="h-full w-full" viewBox="0 0 100 100">
                  <circle
                    className="text-gray-200"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                  />
                  <circle
                    className="text-green-500"
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 45}
                    strokeDashoffset={2 * Math.PI * 45 * (1 - 0.85)}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                  />
                </svg>
                <div className="position-absolute inset-0 d-flex align-items-center justify-content-center">
                  <span className="fs-3 fw-bold">85%</span>
                </div>
              </div>
            </div>
            <div className="text-center mt-4">
              <p className="fs-6 text-secondary">Last updated: {formatDate(new Date().toISOString())}</p>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Active Users</h2>
          </div>
          <div className="admin-card-body">
            <div className="text-center">
              <div className="fs-1 fw-bold mb-2">243</div>
              <div className="fs-6 text-secondary">Current users online</div>
            </div>
            <div className="mt-4">
              <div className="d-flex justify-content-between fs-6 mb-1">
                <span>Daily Active Users</span>
                <span className="fw-medium">1,245</span>
              </div>
              <div className="d-flex justify-content-between fs-6">
                <span>Monthly Active Users</span>
                <span className="fw-medium">24,567</span>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Alerts</h2>
          </div>
          <div className="admin-card-body">
            <div className="d-flex flex-column gap-3">
              <div className="d-flex align-items-center rounded p-3 bg-warning bg-opacity-10 fs-6">
                <div className="flex-shrink-0 text-warning">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ms-3 flex-1">
                  <div className="fw-medium text-warning">Memory usage is high (68%)</div>
                </div>
              </div>
              <div className="d-flex align-items-center rounded p-3 bg-danger bg-opacity-10 fs-6">
                <div className="flex-shrink-0 text-danger">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ms-3 flex-1">
                  <div className="fw-medium text-danger">Cache Server is offline</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">System Metrics</h2>
          </div>
          <div className="overflow-hidden">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Value</th>
                  <th>Status</th>
                  <th className="d-none d-md-table-cell">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map(metric => (
                  <tr key={metric.id}>
                    <td>{metric.name}</td>
                    <td>{metric.value} {metric.unit}</td>
                    <td>
                      <span className={getStatusBadgeClass(metric.status)}>
                        {metric.status.charAt(0).toUpperCase() + metric.status.slice(1)}
                      </span>
                    </td>
                    <td className="d-none d-md-table-cell">{formatDate(metric.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Server Status</h2>
          </div>
          <div className="overflow-hidden">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Server</th>
                  <th>Status</th>
                  <th className="d-none d-sm-table-cell">Uptime</th>
                  <th className="d-none d-md-table-cell">Last Check</th>
                </tr>
              </thead>
              <tbody>
                {servers.map(server => (
                  <tr key={server.id}>
                    <td>{server.name}</td>
                    <td>
                      <span className={getStatusBadgeClass(server.status)}>
                        {server.status.charAt(0).toUpperCase() + server.status.slice(1)}
                      </span>
                    </td>
                    <td className="d-none d-sm-table-cell">{server.uptime}</td>
                    <td className="d-none d-md-table-cell">{formatDate(server.lastChecked)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Monitoring; 