import React, { useState } from 'react';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faRedo } from '@fortawesome/free-solid-svg-icons';
import AdminLayout from '../../components/AdminLayout';

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  emailNotifications: boolean;
  defaultLanguage: string;
  timezone: string;
  itemsPerPage: number;
  backupFrequency: string;
  logRetention: number;
}

const SystemConfig: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: 'SME FANTASIA',
    siteDescription: 'Handcrafted Wood Products Management System',
    maintenanceMode: false,
    emailNotifications: true,
    defaultLanguage: 'en',
    timezone: 'UTC',
    itemsPerPage: 10,
    backupFrequency: 'daily',
    logRetention: 30
  });

  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically save to backend
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleReset = () => {
    // Reset to default values
    setSettings({
      siteName: 'SME FANTASIA',
      siteDescription: 'Handcrafted Wood Products Management System',
      maintenanceMode: false,
      emailNotifications: true,
      defaultLanguage: 'en',
      timezone: 'UTC',
      itemsPerPage: 10,
      backupFrequency: 'daily',
      logRetention: 30
    });
  };

  return (
    <AdminLayout>
      <div className="admin-header">
        <h1 className="admin-title">System Configuration</h1>
      </div>

      {showSuccess && (
        <Alert variant="success" className="mb-4">
          Settings saved successfully!
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Row className="g-4">
          <Col md={6}>
            <Card className="admin-card">
              <Card.Header className="admin-card-header">
                <Card.Title className="admin-card-title">General Settings</Card.Title>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Site Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="siteName"
                    value={settings.siteName}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Site Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="siteDescription"
                    value={settings.siteDescription}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    name="maintenanceMode"
                    checked={settings.maintenanceMode}
                    onChange={handleInputChange}
                    label="Maintenance Mode"
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="admin-card">
              <Card.Header className="admin-card-header">
                <Card.Title className="admin-card-title">System Settings</Card.Title>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Default Language</Form.Label>
                  <Form.Select
                    name="defaultLanguage"
                    value={settings.defaultLanguage}
                    onChange={handleInputChange}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Timezone</Form.Label>
                  <Form.Select
                    name="timezone"
                    value={settings.timezone}
                    onChange={handleInputChange}
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">EST</option>
                    <option value="PST">PST</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Items Per Page</Form.Label>
                  <Form.Control
                    type="number"
                    name="itemsPerPage"
                    value={settings.itemsPerPage}
                    onChange={handleInputChange}
                    min={5}
                    max={100}
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="admin-card">
              <Card.Header className="admin-card-header">
                <Card.Title className="admin-card-title">Backup & Maintenance</Card.Title>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Backup Frequency</Form.Label>
                  <Form.Select
                    name="backupFrequency"
                    value={settings.backupFrequency}
                    onChange={handleInputChange}
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Log Retention (days)</Form.Label>
                  <Form.Control
                    type="number"
                    name="logRetention"
                    value={settings.logRetention}
                    onChange={handleInputChange}
                    min={1}
                    max={365}
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="admin-card">
              <Card.Header className="admin-card-header">
                <Card.Title className="admin-card-title">Notifications</Card.Title>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    name="emailNotifications"
                    checked={settings.emailNotifications}
                    onChange={handleInputChange}
                    label="Email Notifications"
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <div className="d-flex justify-content-end gap-2 mt-4">
          <Button 
            variant="outline-secondary" 
            onClick={handleReset}
            className="admin-btn admin-btn-outline"
          >
            <FontAwesomeIcon icon={faRedo} className="me-2" />
            Reset to Defaults
          </Button>
          <Button 
            type="submit"
            className="admin-btn admin-btn-primary"
          >
            <FontAwesomeIcon icon={faSave} className="me-2" />
            Save Changes
          </Button>
        </div>
      </Form>
    </AdminLayout>
  );
};

export default SystemConfig; 