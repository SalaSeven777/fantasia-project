import React from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { getDefaultRouteForRole } from '../../utils/auth';
import { useTranslation } from 'react-i18next';

const AuthLayout: React.FC = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { t } = useTranslation();

  // If user is already authenticated, redirect to their default route
  if (isAuthenticated && user?.role) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-primary flex flex-col justify-center items-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex items-center justify-center mb-8">
          <div className="bg-white rounded-full shadow-lg p-2 h-16 w-16 flex items-center justify-center">
            <span className="text-2xl font-primary font-bold text-primary-dark-blue-900">SF</span>
          </div>
        </div>
        <h2 className="mt-3 text-center text-3xl font-primary font-bold text-white">
          {t('login.welcomeToSMEFantasia', 'Welcome to SME FANTASIA')}
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-300 max-w font-secondary">
          {t('login.tagline', 'Premium products and services for your business needs')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md w-full px-4 sm:px-0">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-neutral-200">
          <Outlet />
        </div>
      </div>

      <div className="mt-12 text-center w-full px-4">
        <div className="space-x-4 text-white text-sm flex flex-wrap justify-center gap-2">
          <Link to="/privacy-policy" className="text-neutral-300 hover:text-white transition-colors">
            {t('footer.privacyPolicy', 'Privacy Policy')}
          </Link>
          <span className="text-neutral-500 hidden sm:inline">|</span>
          <Link to="/terms-of-service" className="text-neutral-300 hover:text-white transition-colors">
            {t('footer.termsOfService', 'Terms of Service')}
          </Link>
          <span className="text-neutral-500 hidden sm:inline">|</span>
          <Link to="/contact" className="text-neutral-300 hover:text-white transition-colors">
            {t('footer.contactUs', 'Contact Us')}
          </Link>
        </div>
        <p className="mt-3 text-neutral-400 text-xs">
          {t('footer.copyright', '© 2024 SME FANTASIA. All rights reserved.')}
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;