import React, { useState, ReactNode, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../LanguageSelector';
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
    <div className="flex h-screen bg-surface-light overflow-hidden">
      {/* Sidebar - Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-neutral-800/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      
      {/* Sidebar */}
      <div 
        id="sidebar"
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface-main shadow-card transition-transform duration-300 ease-in-out 
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0 lg:flex lg:flex-col overflow-y-auto`}
      >
        <div className="flex items-center justify-between h-16 border-b border-neutral-200 px-6">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded bg-primary-500 flex items-center justify-center mr-2">
              <span className="text-white font-bold text-lg">SF</span>
            </div>
            <span className="text-neutral-900 text-lg font-semibold">SME FANTASIA</span>
          </div>
          <button 
            className="lg:hidden p-2 rounded-full text-neutral-500 hover:bg-neutral-100"
            onClick={() => setSidebarOpen(false)}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex flex-col flex-grow p-4">
          {/* Profile card */}
          <div className="mb-5 p-4 bg-neutral-50 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                <UserCircleIcon className="w-6 h-6 text-primary-700" />
              </div>
              <div>
                <div className="text-sm font-semibold text-neutral-900">{user?.firstName} {user?.lastName}</div>
                <div className="text-xs text-neutral-500">{user?.email}</div>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-grow">
            <div className="mb-2 text-xs font-semibold uppercase text-neutral-500 px-3">{t('navigation.navigation')}</div>
            {getNavigationForRole().map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center px-3 py-2 mb-1 text-sm font-medium rounded-lg transition-all duration-200
                  ${location.pathname === item.path
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
              >
                <span className={`mr-3 flex-shrink-0 ${location.pathname === item.path ? 'text-primary-700' : 'text-neutral-500'}`}>
                  {item.icon}
                </span>
                <span className="truncate">{item.name}</span>
                {location.pathname === item.path && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                )}
              </Link>
            ))}
          </nav>
          
          {/* Logout button */}
          <div className="mt-auto pt-4 border-t border-neutral-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-neutral-700 rounded-lg hover:bg-neutral-50"
            >
              <LogoutIcon className="w-5 h-5 mr-3 text-neutral-500" />
              <span>{t('navigation.signOut')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        {/* Top header */}
        <header className="relative z-10 h-16 flex items-center bg-surface-main border-b border-neutral-200 shadow-sm">
          <div className="px-4 lg:px-6 w-full flex justify-between items-center">
            {/* Left side */}
            <div className="flex items-center">
              <button
                id="menu-toggle"
                type="button"
                className="lg:hidden p-2 -ml-1 mr-3 rounded-full text-neutral-500 hover:bg-neutral-100"
                onClick={toggleSidebar}
                aria-expanded={sidebarOpen}
              >
                <span className="sr-only">{sidebarOpen ? 'Close sidebar' : 'Open sidebar'}</span>
                <MenuIcon className="h-6 w-6" aria-hidden="true" />
              </button>
              
              {/* Search bar */}
              <div className="hidden sm:flex items-center max-w-md px-3 py-1.5 bg-neutral-100 rounded-lg">
                <MagnifyingGlassIcon className="h-5 w-5 text-neutral-400" />
                <input
                  type="text"
                  placeholder={t('common.search')}
                  className="bg-transparent border-none focus:outline-none ml-2 text-sm w-full placeholder-neutral-500"
                />
              </div>
            </div>
            
            {/* Right side */}
            <div className="flex items-center space-x-2">
              <LanguageSelector iconOnly={true} />
              
              <button className="p-2 rounded-full text-neutral-500 hover:bg-neutral-100 relative">
                <BellIcon className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-accent-error rounded-full"></span>
              </button>
              
              <button
                type="button"
                onClick={handleLogout}
                className="p-2 rounded-full text-neutral-500 hover:bg-neutral-100"
                aria-label="Logout"
              >
                <LogoutIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6 bg-surface-light">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 