import React, { useState } from 'react';
import { Card, Row, Col, Form, Button, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFileExport,
  faDownload,
  faChartBar,
  faChartLine,
  faChartPie,
  faTable
} from '@fortawesome/free-solid-svg-icons';
import AdminLayout from '../../components/AdminLayout';

interface ReportConfig {
  type: string;
  dateRange: string;
  format: string;
  includeCharts: boolean;
}

const ReportingHub: React.FC = () => {
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    type: 'sales',
    dateRange: 'last30',
    format: 'pdf',
    includeCharts: true
  });

  const recentReports = [
    {
      name: 'Monthly Sales Report',
      generated: '2024-03-01',
      type: 'Sales',
      format: 'PDF',
      size: '2.4 MB'
    },
    {
      name: 'Inventory Status',
      generated: '2024-03-01',
      type: 'Inventory',
      format: 'Excel',
      size: '1.8 MB'
    },
    {
      name: 'User Activity Log',
      generated: '2024-02-29',
      type: 'Activity',
      format: 'CSV',
      size: '3.2 MB'
    },
    {
      name: 'Financial Summary',
      generated: '2024-02-28',
      type: 'Financial',
      format: 'PDF',
      size: '1.5 MB'
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setReportConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically call your backend API to generate the report
    console.log('Generating report with config:', reportConfig);
  };

  return (
    <AdminLayout>
      <div className="admin-header">
        <h1 className="admin-title">Reporting Hub</h1>
      </div>

      <Row className="g-4">
        <Col md={4}>
          <Card className="admin-card">
            <Card.Header className="admin-card-header">
              <Card.Title className="admin-card-title">Generate Report</Card.Title>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleGenerateReport}>
                <Form.Group className="mb-3">
                  <Form.Label>Report Type</Form.Label>
                  <Form.Select
                    name="type"
                    value={reportConfig.type}
                    onChange={handleInputChange}
                  >
                    <option value="sales">Sales Report</option>
                    <option value="inventory">Inventory Report</option>
                    <option value="users">User Activity Report</option>
                    <option value="financial">Financial Report</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Date Range</Form.Label>
                  <Form.Select
                    name="dateRange"
                    value={reportConfig.dateRange}
                    onChange={handleInputChange}
                  >
                    <option value="today">Today</option>
                    <option value="last7">Last 7 Days</option>
                    <option value="last30">Last 30 Days</option>
                    <option value="thisMonth">This Month</option>
                    <option value="lastMonth">Last Month</option>
                    <option value="custom">Custom Range</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Format</Form.Label>
                  <Form.Select
                    name="format"
                    value={reportConfig.format}
                    onChange={handleInputChange}
                  >
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="csv">CSV</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    name="includeCharts"
                    checked={reportConfig.includeCharts}
                    onChange={handleInputChange}
                    label="Include Charts"
                  />
                </Form.Group>

                <Button 
                  type="submit" 
                  className="admin-btn admin-btn-primary w-100"
                >
                  <FontAwesomeIcon icon={faFileExport} className="me-2" />
                  Generate Report
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <Card className="admin-card">
            <Card.Header className="admin-card-header">
              <Card.Title className="admin-card-title">Recent Reports</Card.Title>
            </Card.Header>
            <Card.Body>
              <Table className="admin-table">
                <thead>
                  <tr>
                    <th>Report Name</th>
                    <th>Generated</th>
                    <th>Type</th>
                    <th>Format</th>
                    <th>Size</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReports.map((report, index) => (
                    <tr key={index}>
                      <td>
                        <div className="d-flex align-items-center">
                          <FontAwesomeIcon 
                            icon={
                              report.type === 'Sales' ? faChartLine :
                              report.type === 'Inventory' ? faChartBar :
                              report.type === 'Activity' ? faTable :
                              faChartPie
                            }
                            className="me-2"
                          />
                          {report.name}
                        </div>
                      </td>
                      <td>{report.generated}</td>
                      <td>{report.type}</td>
                      <td>{report.format}</td>
                      <td>{report.size}</td>
                      <td>
                        <Button 
                          variant="link" 
                          className="text-primary p-0 me-2"
                        >
                          <FontAwesomeIcon icon={faDownload} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          <Card className="admin-card mt-4">
            <Card.Header className="admin-card-header">
              <Card.Title className="admin-card-title">Scheduled Reports</Card.Title>
            </Card.Header>
            <Card.Body>
              <div className="text-center py-4">
                <p className="text-muted mb-0">No scheduled reports configured</p>
                <Button 
                  variant="link" 
                  className="text-primary"
                >
                  Configure Scheduled Reports
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </AdminLayout>
  );
};

export default ReportingHub; 