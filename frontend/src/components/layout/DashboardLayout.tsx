import React, { useState, ReactNode, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../LanguageSelector';
import '../../styles/wood-client-theme.css';
import {
  Bars3Icon as MenuIcon,
  ArrowRightOnRectangleIcon as LogoutIcon,
  UserCircleIcon,
  HomeIcon,
  UsersIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ClockIcon,
  DocumentTextIcon,
  XMarkIcon,
  BellIcon,
  MagnifyingGlassIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactElement;
}

interface DashboardLayoutProps {
  children?: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { t } = useTranslation();

  // Close sidebar when route changes (on mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);
  
  // Close sidebar when clicking outside (on mobile)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const sidebar = document.getElementById('sidebar');
      const menuButton = document.getElementById('menu-toggle');
      
      if (sidebarOpen && sidebar && !sidebar.contains(target) && !menuButton?.contains(target)) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarOpen]);

  // Handle window resize to close sidebar on large screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [sidebarOpen]);

  const navigation: Record<string, NavItem[]> = {
    commercial: [
      { name: t('dashboard.dashboard'), path: '/commercial', icon: <HomeIcon className="w-5 h-5" /> },
      { name: t('dashboard.orders'), path: '/commercial/orders', icon: <DocumentTextIcon className="w-5 h-5" /> },
      { name: t('dashboard.customers'), path: '/commercial/customers', icon: <UsersIcon className="w-5 h-5" /> },
      { name: t('dashboard.quotes'), path: '/commercial/quotes', icon: <DocumentTextIcon className="w-5 h-5" /> },
    ],
    delivery: [
      { name: t('dashboard.dashboard'), path: '/delivery', icon: <HomeIcon className="w-5 h-5" /> },
      { name: t('dashboard.deliveries'), path: '/delivery/management', icon: <DocumentTextIcon className="w-5 h-5" /> },
      { name: t('dashboard.routePlanning'), path: '/delivery/routes', icon: <ChartBarIcon className="w-5 h-5" /> },
      { name: t('dashboard.metrics'), path: '/delivery/metrics', icon: <ChartBarIcon className="w-5 h-5" /> },
    ],
    warehouse: [
      { name: t('dashboard.dashboard'), path: '/warehouse', icon: <HomeIcon className="w-5 h-5" /> },
      { name: t('dashboard.products'), path: '/warehouse/products', icon: <DocumentTextIcon className="w-5 h-5" /> },
      { name: t('dashboard.stockManagement'), path: '/warehouse/stock', icon: <DocumentTextIcon className="w-5 h-5" /> },
      { name: t('dashboard.inventoryReports'), path: '/warehouse/reports', icon: <ChartBarIcon className="w-5 h-5" /> },
      { name: t('dashboard.supplyChain'), path: '/warehouse/supply-chain', icon: <ChartBarIcon className="w-5 h-5" /> },
    ],
    billing: [
      { name: t('dashboard.dashboard'), path: '/billing', icon: <HomeIcon className="w-5 h-5" /> },
      { name: t('dashboard.invoices'), path: '/billing/invoices', icon: <DocumentTextIcon className="w-5 h-5" /> },
      { name: t('dashboard.payments'), path: '/billing/payments', icon: <DocumentTextIcon className="w-5 h-5" /> },
      { name: t('dashboard.financialReports'), path: '/billing/reports', icon: <ChartBarIcon className="w-5 h-5" /> },
    ],
    admin: [
      { name: t('dashboard.dashboard'), path: '/admin', icon: <HomeIcon className="w-5 h-5" /> },
      { name: t('dashboard.userManagement'), path: '/admin/users', icon: <UsersIcon className="w-5 h-5" /> },
      { name: t('dashboard.systemConfig'), path: '/admin/config', icon: <Cog6ToothIcon className="w-5 h-5" /> },
      { name: t('dashboard.monitoring'), path: '/admin/monitoring', icon: <ChartBarIcon className="w-5 h-5" /> },
      { name: t('dashboard.reports'), path: '/admin/reports', icon: <DocumentTextIcon className="w-5 h-5" /> },
      { name: t('dashboard.auditLogs'), path: '/admin/audit', icon: <ClockIcon className="w-5 h-5" /> },
    ],
  };

  // Get navigation items based on user role
  const getNavigationForRole = () => {
    if (!user?.role) return [];
    
    switch (user.role) {
      case 'CO':
        return navigation.commercial;
      case 'DA':
        return navigation.delivery;
      case 'WM':
        return navigation.warehouse;
      case 'BM':
        return navigation.billing;
      case 'AD':
        return navigation.admin;
      default:
        return [];
    }
  };

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-wood-neutral-50">
      {/* Sidebar - Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-wood-brown-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      
      {/* Sidebar */}
      <div 
        id="sidebar"
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-wood-brown-900 shadow-lg transition-transform duration-300 ease-in-out 
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0 lg:z-30 h-full lg:h-screen overflow-y-auto`}
      >
        <div className="flex items-center justify-between h-16 border-b border-wood-brown-800 px-6">
          <div className="flex items-center">
            <div className="wood-logo-icon w-8 h-8 flex items-center justify-center mr-2">
              <span className="font-bold text-sm">SF</span>
            </div>
            <span className="text-wood-brown-100 text-lg font-semibold">SME FANTASIA</span>
          </div>
          <button 
            className="lg:hidden p-2 rounded-full text-wood-brown-400 hover:bg-wood-brown-800"
            onClick={() => setSidebarOpen(false)}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex flex-col h-[calc(100%-4rem)] overflow-y-auto">
          {/* Profile card */}
          <div className="mb-5 p-4 bg-wood-brown-800 rounded-lg mx-4 mt-4">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-full bg-wood-brown-700 flex items-center justify-center mr-3 flex-shrink-0">
                <UserCircleIcon className="w-6 h-6 text-wood-brown-100" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-wood-brown-100 truncate">{user?.firstName} {user?.lastName}</div>
                <div className="text-xs text-wood-brown-400 truncate">{user?.email}</div>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-grow px-4">
            <div className="mb-2 text-xs font-semibold uppercase text-wood-brown-500 px-3">{t('navigation.navigation')}</div>
            <div className="space-y-1">
              {getNavigationForRole().map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
                    ${location.pathname === item.path
                      ? 'bg-wood-brown-800 text-wood-brown-100'
                      : 'text-wood-brown-400 hover:bg-wood-brown-800 hover:text-wood-brown-100'
                    }`}
                >
                  <span className={`mr-3 flex-shrink-0 ${location.pathname === item.path ? 'text-wood-brown-100' : 'text-wood-brown-400'}`}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.name}</span>
                  {location.pathname === item.path && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-wood-brown-500"></span>
                  )}
                </Link>
              ))}
            </div>
          </nav>
          
          {/* Logout button */}
          <div className="mt-auto pt-4 border-t border-wood-brown-800 px-4 pb-4">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-wood-brown-400 rounded-lg hover:bg-wood-brown-800 hover:text-wood-brown-100"
            >
              <LogoutIcon className="w-5 h-5 mr-3 text-wood-brown-500" />
              <span>{t('navigation.signOut')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-col flex-1 w-full h-screen">
        {/* Top header */}
        <header className="sticky top-0 z-20 h-16 flex items-center bg-wood-brown-900 border-b border-wood-brown-800 shadow-sm">
          <div className="px-4 lg:px-6 w-full flex justify-between items-center">
            {/* Left side */}
            <div className="flex items-center">
              <button
                id="menu-toggle"
                type="button"
                className="lg:hidden p-2 -ml-1 mr-3 rounded-full text-wood-brown-400 hover:bg-wood-brown-800"
                onClick={toggleSidebar}
                aria-expanded={sidebarOpen}
              >
                <span className="sr-only">{sidebarOpen ? 'Close sidebar' : 'Open sidebar'}</span>
                <MenuIcon className="h-6 w-6" aria-hidden="true" />
              </button>
              
              {/* Search bar */}
              <div className="hidden sm:flex items-center max-w-md px-3 py-1.5 bg-wood-brown-800 rounded-lg">
                <MagnifyingGlassIcon className="h-5 w-5 text-wood-brown-400" />
                <input
                  type="text"
                  placeholder={t('common.search')}
                  className="bg-transparent border-none focus:outline-none ml-2 text-sm w-full placeholder-wood-brown-500 text-wood-brown-200"
                />
              </div>
            </div>
            
            {/* Right side */}
            <div className="flex items-center space-x-2">
              <LanguageSelector iconOnly={true} />
              
              <button className="p-2 rounded-full text-wood-brown-400 hover:bg-wood-brown-800 relative">
                <BellIcon className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-wood-accent-500 rounded-full"></span>
              </button>
              
              <button
                type="button"
                onClick={handleLogout}
                className="p-2 rounded-full text-wood-brown-400 hover:bg-wood-brown-800"
                aria-label="Logout"
              >
                <LogoutIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 relative bg-wood-neutral-50 overflow-y-auto">
          <div className="w-full h-full">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 