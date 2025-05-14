import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { login, checkAuth } from '../../store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../../components/LanguageSelector';

const Login: React.FC = () => {
  // i18n hook
  const { t } = useTranslation();
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  
  // Redux hooks
  const dispatch = useAppDispatch();
  const { loading, error: authError, isAuthenticated } = useAppSelector((state) => state.auth);
  
  // Router hooks
  const navigate = useNavigate();
  const location = useLocation();

  // Check authentication on mount
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate form
    if (!email || !password) {
      setError('Please provide both email and password');
      return;
    }

    try {
      // Dispatch login action
      await dispatch(login({ email, password })).unwrap();
      
      // If remember me is checked, could set a longer expiry for tokens
      // (would require backend changes)
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="space-y-6">
      {/* Language selector at the top right */}
      <div className="flex justify-end mb-2">
        <LanguageSelector />
      </div>
      
      <div>
        <h2 className="text-2xl font-semibold text-primary-900">
          {t('login.title')}
        </h2>
      </div>
      
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-primary-900 mb-1">
              {t('login.emailLabel')}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none relative block w-full px-4 py-3 bg-neutral-100 border border-neutral-200 rounded-md placeholder-neutral-500 text-primary-900 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition duration-150 ease-in-out sm:text-sm"
              placeholder={t('login.emailLabel')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-primary-900">
                {t('login.passwordLabel')}
              </label>
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-4 py-3 bg-neutral-100 border border-neutral-200 rounded-md placeholder-neutral-500 text-primary-900 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition duration-150 ease-in-out sm:text-sm pr-10"
                placeholder={t('login.passwordLabel')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-primary-600 focus:outline-none"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 accent-primary-500 border-neutral-300 rounded focus:ring-primary-500"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-primary-700">
              {t('login.rememberMe')}
            </label>
          </div>

          <div className="text-sm">
            <Link to="/forgot-password" className="font-medium text-primary-500 hover:text-primary-600">
              {t('login.forgotPassword')}
            </Link>
          </div>
        </div>

        {(error || authError) && (
          <div className="text-error text-sm">
            {error || authError}
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition duration-150 ease-in-out disabled:opacity-50"
          >
            {loading ? t('login.signingIn') : t('login.signIn')}
          </button>
        </div>
        
        <div className="relative mt-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-neutral-500">
              {t('login.orSignInWith')}
            </span>
          </div>
        </div>
        
        <div>
          <button
            type="button"
            className="w-full flex justify-center items-center py-3 px-4 border border-neutral-300 rounded-md shadow-sm text-sm font-medium text-primary-900 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition duration-150 ease-in-out"
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {t('login.signInWithGoogle')}
          </button>
        </div>
      </form>
      
      <div className="text-center text-sm">
        <span className="text-neutral-500">{t('login.noAccount')}</span>{' '}
        <Link to="/register" className="font-medium text-primary-500 hover:text-primary-600">
          {t('login.signUp')}
        </Link>
      </div>
    </div>
  );
};

export default Login; 