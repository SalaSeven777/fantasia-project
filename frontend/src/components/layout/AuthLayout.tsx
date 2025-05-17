import React from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { getDefaultRouteForRole } from '../../utils/auth';
import { useTranslation } from 'react-i18next';
import '../../styles/wood-client-theme.css';

const AuthLayout: React.FC = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { t } = useTranslation();

  // If user is already authenticated, redirect to their default route
  if (isAuthenticated && user?.role) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8"
         style={{
           backgroundImage: `
             
             linear-gradient(to bottom, rgba(105, 87, 66, 0.95), rgba(190, 117, 34, 0.95)),
             url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23a47b58' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
           `
         }}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex items-center justify-center mb-8">
          <div className="wood-logo-icon w-16 h-16 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">SF</span>
          </div>
        </div>
        <h2 className="mt-3 text-center text-3xl font-bold text-white font-['Playfair_Display',_serif]">
          {t('login.welcomeToSMEFantasia', 'Welcome to SME FANTASIA')}
        </h2>
        <p className="mt-2 text-center text-sm text-white  max-w">
          {t('login.tagline', 'Premium products and services for your business needs')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md w-full px-4 sm:px-0">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-wood-brown-300">
          <Outlet />
        </div>
      </div>

      <div className="mt-12 text-center w-full px-4">
        <div className="space-x-4 flex flex-wrap justify-center gap-2">
          <Link to="/privacy-policy" className="wood-footer-link transition-colors">
            {t('footer.privacyPolicy', 'Privacy Policy')}
          </Link>
          <span className="text-wood-brown-500 hidden sm:inline">|</span>
          <Link to="/terms-of-service" className="wood-footer-link transition-colors">
            {t('footer.termsOfService', 'Terms of Service')}
          </Link>
          <span className="text-wood-brown-400 hidden sm:inline">|</span>
          <Link to="/contact" className="wood-footer-link wood-footer-link-r transition-colors">
            {t('footer.contactUs', 'Contact Us')}
          </Link>
        </div>
        <p className="mt-3 text-wood-brown-400 text-xs wood-copyright">
          {t('footer.copyright', '© 2024 SME FANTASIA. All rights reserved.')}
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;