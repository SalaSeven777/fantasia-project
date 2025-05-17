import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';

interface Report {
  id: number;
  name: string;
  description: string;
  category: string;
  lastRun: string;
  frequency: string;
}

const Reports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([
    {
      id: 1,
      name: 'Monthly Sales Report',
      description: 'Summary of all sales for the previous month',
      category: 'Sales',
      lastRun: '2023-07-31T08:00:00',
      frequency: 'Monthly'
    },
    {
      id: 2,
      name: 'Inventory Status',
      description: 'Current inventory levels for all products',
      category: 'Inventory',
      lastRun: '2023-08-14T10:30:00',
      frequency: 'Weekly'
    },
    {
      id: 3,
      name: 'Customer Acquisition',
      description: 'New customer registrations and conversion rates',
      category: 'Marketing',
      lastRun: '2023-08-01T09:15:00',
      frequency: 'Monthly'
    },
    {
      id: 4,
      name: 'Order Fulfillment Time',
      description: 'Average time from order placement to shipment',
      category: 'Operations',
      lastRun: '2023-08-14T07:45:00',
      frequency: 'Weekly'
    },
    {
      id: 5,
      name: 'Product Performance',
      description: 'Sales performance by product category',
      category: 'Sales',
      lastRun: '2023-07-31T08:30:00',
      frequency: 'Monthly'
    }
  ]);

  const [filter, setFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [frequencyFilter, setFrequencyFilter] = useState('All');

  const categories = ['All', ...Array.from(new Set(reports.map(report => report.category)))];
  const frequencies = ['All', ...Array.from(new Set(reports.map(report => report.frequency)))];

  const filteredReports = reports.filter(report => {
    const matchesText = report.name.toLowerCase().includes(filter.toLowerCase()) || 
                      report.description.toLowerCase().includes(filter.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || report.category === categoryFilter;
    const matchesFrequency = frequencyFilter === 'All' || report.frequency === frequencyFilter;
    return matchesText && matchesCategory && matchesFrequency;
  });

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  const getCategoryBadgeClass = (category: string): string => {
    switch (category) {
      case 'Sales':
        return 'admin-badge admin-badge-primary';
      case 'Inventory':
        return 'admin-badge admin-badge-success';
      case 'Marketing':
        return 'admin-badge admin-badge-warning';
      case 'Operations':
        return 'admin-badge admin-badge-info';
      default:
        return 'admin-badge';
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Reports</h1>
        <button className="admin-button-primary">
          Create New Report
        </button>
      </div>

      <div className="admin-filters">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex-1 mb-3 md:mb-0">
            <div className="admin-search">
              <input
                type="text"
                placeholder="Search reports..."
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
          
          <div className="w-full md:w-auto mb-3 md:mb-0">
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
          
          <div className="w-full md:w-auto">
            <select 
              className="admin-select"
              value={frequencyFilter}
              onChange={(e) => setFrequencyFilter(e.target.value)}
            >
              {frequencies.map(frequency => (
                <option key={frequency} value={frequency}>{frequency}</option>
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
                <th>Report Name</th>
                <th className="d-none d-md-table-cell">Description</th>
                <th className="d-none d-sm-table-cell">Category</th>
                <th className="d-none d-sm-table-cell">Frequency</th>
                <th className="d-none d-md-table-cell">Last Run</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    No reports found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredReports.map(report => (
                  <tr key={report.id}>
                    <td className="font-medium">{report.name}</td>
                    <td className="d-none d-md-table-cell">{report.description}</td>
                    <td className="d-none d-sm-table-cell">
                      <span className={getCategoryBadgeClass(report.category)}>
                        {report.category}
                      </span>
                    </td>
                    <td className="d-none d-sm-table-cell">{report.frequency}</td>
                    <td className="d-none d-md-table-cell">{formatDate(report.lastRun)}</td>
                    <td className="text-right">
                      <div className="admin-table-actions">
                        <button className="admin-button-primary-sm">
                          Run Now
                        </button>
                        <button className="admin-button-secondary-sm">
                          Edit
                        </button>
                        <button className="admin-button-danger-sm">
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

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Recently Generated Reports</h2>
          </div>
          <div className="admin-card-body p-0">
            <ul className="list-unstyled m-0">
              {reports.slice(0, 3).map(report => (
                <li key={report.id} className="p-4 border-bottom">
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div>
                      <h3 className="fs-6 fw-medium">{report.name}</h3>
                      <p className="fs-6 text-secondary mt-1">Generated on {formatDate(report.lastRun)}</p>
                    </div>
                    <div>
                      <button className="text-primary fw-medium fs-6">
                        Download PDF
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Scheduled Reports</h2>
          </div>
          <div className="admin-card-body p-0">
            <ul className="list-unstyled m-0">
              {reports.slice(0, 3).map(report => (
                <li key={report.id} className="p-4 border-bottom">
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div>
                      <h3 className="fs-6 fw-medium">{report.name}</h3>
                      <p className="fs-6 text-secondary mt-1">Runs {report.frequency.toLowerCase()}</p>
                    </div>
                    <div>
                      <span className="fs-6 fw-medium text-secondary">
                        Next run: {new Date(new Date(report.lastRun).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Reports; 