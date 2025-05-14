import { UserRole } from '../types';

export const getDefaultRouteForRole = (role: UserRole): string => {
  switch (role) {
    case 'CL':
      return '/home';
    case 'CO':
      return '/commercial';
    case 'DA':
      return '/delivery';
    case 'WM':
      return '/warehouse';
    case 'BM':
      return '/billing';
    case 'AD':
      return '/admin';
    default:
      return '/login';
  }
};

export const getRoleName = (role: UserRole): string => {
  switch (role) {
    case 'CL':
      return 'Client';
    case 'CO':
      return 'Commercial';
    case 'DA':
      return 'Delivery Agent';
    case 'WM':
      return 'Warehouse Manager';
    case 'BM':
      return 'Billing Manager';
    case 'AD':
      return 'Administrator';
    default:
      return 'Unknown Role';
  }
}; 