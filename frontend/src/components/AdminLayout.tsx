import React from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTachometerAlt,
  faUsers,
  faCog,
  faChartLine,
  faClipboardList,
  faHistory
} from '@fortawesome/free-solid-svg-icons';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="admin-layout">
      <Navbar bg="dark" variant="dark" expand="lg" className="admin-navbar">
        <Container fluid>
          <Navbar.Brand as={Link} to="/admin">Admin Panel</Navbar.Brand>
          <Navbar.Toggle aria-controls="admin-navbar-nav" />
          <Navbar.Collapse id="admin-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link 
                as={Link} 
                to="/admin/dashboard"
                className={isActive('/admin/dashboard') ? 'active' : ''}
              >
                <FontAwesomeIcon icon={faTachometerAlt} className="me-2" />
                Dashboard
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/admin/users"
                className={isActive('/admin/users') ? 'active' : ''}
              >
                <FontAwesomeIcon icon={faUsers} className="me-2" />
                Users
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/admin/config"
                className={isActive('/admin/config') ? 'active' : ''}
              >
                <FontAwesomeIcon icon={faCog} className="me-2" />
                System Config
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/admin/monitoring"
                className={isActive('/admin/monitoring') ? 'active' : ''}
              >
                <FontAwesomeIcon icon={faChartLine} className="me-2" />
                Monitoring
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/admin/reports"
                className={isActive('/admin/reports') ? 'active' : ''}
              >
                <FontAwesomeIcon icon={faClipboardList} className="me-2" />
                Reports
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/admin/audit-logs"
                className={isActive('/admin/audit-logs') ? 'active' : ''}
              >
                <FontAwesomeIcon icon={faHistory} className="me-2" />
                Audit Logs
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container fluid className="admin-content py-4">
        {children}
      </Container>
    </div>
  );
};

export default AdminLayout; 