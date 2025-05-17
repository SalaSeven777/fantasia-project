import React, { useState } from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTachometerAlt,
  faUsers,
  faCog,
  faChartLine,
  faClipboardList,
  faHistory,
  faBars,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import '../styles/admin-theme.css'; // Import admin theme

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="admin-layout">
      {/* Mobile sidebar overlay */}
      <div 
        className={`admin-mobile-overlay ${sidebarOpen ? 'show' : ''}`} 
        onClick={() => setSidebarOpen(false)}
      ></div>
      
      {/* Responsive navbar */}
      <Navbar expand="lg" className="admin-navbar">
        <Container fluid>
          <button 
            className="admin-mobile-menu-toggle d-lg-none me-2" 
            onClick={toggleSidebar}
            aria-label="Toggle menu"
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
          <Navbar.Brand as={Link} to="/admin" className="navbar-brand">Admin Panel</Navbar.Brand>
          <Navbar.Toggle aria-controls="admin-navbar-nav" />
          <Navbar.Collapse id="admin-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link 
                as={Link} 
                to="/admin/dashboard"
                className={`nav-link ${isActive('/admin/dashboard') ? 'active' : ''}`}
              >
                <FontAwesomeIcon icon={faTachometerAlt} className="me-2" />
                Dashboard
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/admin/users"
                className={`nav-link ${isActive('/admin/users') ? 'active' : ''}`}
              >
                <FontAwesomeIcon icon={faUsers} className="me-2" />
                Users
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/admin/config"
                className={`nav-link ${isActive('/admin/config') ? 'active' : ''}`}
              >
                <FontAwesomeIcon icon={faCog} className="me-2" />
                System Config
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/admin/monitoring"
                className={`nav-link ${isActive('/admin/monitoring') ? 'active' : ''}`}
              >
                <FontAwesomeIcon icon={faChartLine} className="me-2" />
                Monitoring
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/admin/reports"
                className={`nav-link ${isActive('/admin/reports') ? 'active' : ''}`}
              >
                <FontAwesomeIcon icon={faClipboardList} className="me-2" />
                Reports
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/admin/audit-logs"
                className={`nav-link ${isActive('/admin/audit-logs') ? 'active' : ''}`}
              >
                <FontAwesomeIcon icon={faHistory} className="me-2" />
                Audit Logs
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      
      {/* Mobile sidebar - only shown on small screens */}
      <div className={`admin-sidebar d-lg-none ${sidebarOpen ? 'show' : ''}`}>
        <div className="admin-sidebar-header d-flex align-items-center justify-content-between p-3">
          <div className="admin-sidebar-brand-logo">Admin</div>
          <button 
            className="admin-sidebar-toggle" 
            onClick={toggleSidebar}
            aria-label="Close menu"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <Nav className="admin-sidebar-nav flex-column">
          <Nav.Link 
            as={Link} 
            to="/admin/dashboard"
            className={`admin-sidebar-nav-link ${isActive('/admin/dashboard') ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <FontAwesomeIcon icon={faTachometerAlt} className="admin-sidebar-nav-icon" />
            <span className="admin-sidebar-nav-text">Dashboard</span>
          </Nav.Link>
          <Nav.Link 
            as={Link} 
            to="/admin/users"
            className={`admin-sidebar-nav-link ${isActive('/admin/users') ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <FontAwesomeIcon icon={faUsers} className="admin-sidebar-nav-icon" />
            <span className="admin-sidebar-nav-text">Users</span>
          </Nav.Link>
          <Nav.Link 
            as={Link} 
            to="/admin/config"
            className={`admin-sidebar-nav-link ${isActive('/admin/config') ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <FontAwesomeIcon icon={faCog} className="admin-sidebar-nav-icon" />
            <span className="admin-sidebar-nav-text">System Config</span>
          </Nav.Link>
          <Nav.Link 
            as={Link} 
            to="/admin/monitoring"
            className={`admin-sidebar-nav-link ${isActive('/admin/monitoring') ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <FontAwesomeIcon icon={faChartLine} className="admin-sidebar-nav-icon" />
            <span className="admin-sidebar-nav-text">Monitoring</span>
          </Nav.Link>
          <Nav.Link 
            as={Link} 
            to="/admin/reports"
            className={`admin-sidebar-nav-link ${isActive('/admin/reports') ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <FontAwesomeIcon icon={faClipboardList} className="admin-sidebar-nav-icon" />
            <span className="admin-sidebar-nav-text">Reports</span>
          </Nav.Link>
          <Nav.Link 
            as={Link} 
            to="/admin/audit-logs"
            className={`admin-sidebar-nav-link ${isActive('/admin/audit-logs') ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <FontAwesomeIcon icon={faHistory} className="admin-sidebar-nav-icon" />
            <span className="admin-sidebar-nav-text">Audit Logs</span>
          </Nav.Link>
        </Nav>
      </div>
      
      <div className="admin-content">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout; 