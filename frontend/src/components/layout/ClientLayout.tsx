import React, { useState, useEffect, ReactNode } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { 
  ArrowRightOnRectangleIcon as LogoutIcon,
  UserCircleIcon,
  ShoppingCartIcon,
  Bars3Icon as MenuIcon,
  XMarkIcon,
  EnvelopeIcon,
  PhoneIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { cartService } from '../../services/cart.service';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../LanguageSelector';

interface ClientLayoutProps {
  children?: ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const { t } = useTranslation();

  // Update cart count
  useEffect(() => {
    const updateCartCount = () => {
      const count = cartService.getItemCount();
      setCartCount(count);
    };
    
    // Update on mount
    updateCartCount();
    
    // Set interval to update periodically
    const intervalId = setInterval(updateCartCount, 2000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setShowSearch(false);
  }, [location.pathname]);
  
  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const mobileMenu = document.getElementById('mobile-menu');
      const menuButton = document.getElementById('menu-button');
      
      if (mobileMenuOpen && mobileMenu && !mobileMenu.contains(target) && !menuButton?.contains(target)) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Top Info Bar */}
      <div className="bg-neutral-900 py-2.5 px-4 text-white hidden sm:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-xs flex items-center space-x-6 text-neutral-300">
            <span className="flex items-center">
              <PhoneIcon className="h-3.5 w-3.5 mr-1.5" /> +212 645 746 459
            </span>
            <span className="flex items-center">
              <EnvelopeIcon className="h-3.5 w-3.5 mr-1.5" /> salah@smefantasia.com
            </span>
          </div>
          <div className="flex items-center space-x-4 text-xs">
            <LanguageSelector iconOnly={true} className="mr-4" />
            <div className="flex items-center space-x-6">
              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="hover:text-primary-300 transition-colors">
                    <UserCircleIcon className="h-3.5 w-3.5 inline mr-1.5" />
                    {t('navigation.profile')}
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="hover:text-primary-300 transition-colors"
                  >
                    <LogoutIcon className="h-3.5 w-3.5 inline mr-1.5" />
                    {t('navigation.signOut')}
                  </button>
                </>
              ) : (
                <Link to="/login" className="hover:text-primary-300 transition-colors">
                  <UserCircleIcon className="h-3.5 w-3.5 inline mr-1.5" />
                  {t('navigation.signIn')}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white z-30 border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center">
                <div className="w-10 h-10 flex items-center justify-center mr-2">
                  <span className="text-primary-600 font-bold text-2xl">SF</span>
                </div>
                <span className="text-xl font-bold text-neutral-900">SME FANTASIA</span>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                id="menu-button"
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-neutral-600 hover:bg-neutral-100 focus:outline-none"
                onClick={toggleMobileMenu}
                aria-expanded={mobileMenuOpen}
              >
                <span className="sr-only">{mobileMenuOpen ? 'Close main menu' : 'Open main menu'}</span>
                {mobileMenuOpen ? (
                  <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:flex-1 md:justify-center">
              <nav className="flex space-x-8">
                <Link
                  to="/"
                  className={`text-sm font-medium ${isActive('/') 
                    ? 'text-primary-600' 
                    : 'text-neutral-800 hover:text-primary-600'} py-2 transition-colors`}
                >
                  {t('navigation.home')}
                </Link>
                <Link
                  to="/presentation"
                  className={`text-sm font-medium ${isActive('/presentation') 
                    ? 'text-primary-600' 
                    : 'text-neutral-800 hover:text-primary-600 '} py-2 transition-colors`}
                >
                  {t('presentation')}
                </Link>
                <Link
                  to="/about"
                  className={`text-sm font-medium ${isActive('/about') 
                    ? 'text-primary-600' 
                    : 'text-neutral-800 hover:text-primary-600'} py-2 transition-colors`}
                >
                  {t('navigation.about')}
                </Link>
                
                <div className="relative group">
                  <Link
                    to="/products"
                    className={`text-sm font-medium flex items-center ${isActive('/products') 
                      ? 'text-primary-600' 
                      : 'text-neutral-800 hover:text-primary-600'} py-2 transition-colors`}
                  >
                    {t('navigation.products')}
                    <ChevronDownIcon className="ml-1 h-4 w-4" />
                  </Link>
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-lg border border-neutral-100">
                    <div className="py-3">
                      <Link to="/products/category/panels" className="block px-6 py-1.5 text-sm text-neutral-700 hover:text-primary-600">{t('products.panels')}</Link>
                      <Link to="/products/category/wood" className="block px-6 py-1.5 text-sm text-neutral-700 hover:text-primary-600">{t('products.wood')}</Link>
                      <Link to="/products/category/accessories" className="block px-6 py-1.5 text-sm text-neutral-700 hover:text-primary-600">{t('products.accessories')}</Link>
                    </div>
                  </div>
                </div>
              </nav>
            </div>

            {/* Right side icons */}
            <div className="flex items-center space-x-4">
              <Link to="/cart" className="relative p-2 text-neutral-600 hover:text-primary-600 transition-colors">
                <ShoppingCartIcon className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children || <Outlet />}
      </main>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">About Us</h3>
              <p className="text-neutral-400 text-sm">
                SME FANTASIA is your trusted partner for premium wood products and solutions.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/products" className="text-neutral-400 hover:text-white text-sm transition-colors">
                    Products
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-neutral-400 hover:text-white text-sm transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-neutral-400 hover:text-white text-sm transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/presentation" className="text-neutral-400 hover:text-white text-sm transition-colors">
                    Presentation
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
              <ul className="space-y-2 text-neutral-400 text-sm">
                <li className="flex items-center">
                  <PhoneIcon className="h-4 w-4 mr-2" />
                  +1 210-298-9663
                </li>
                <li className="flex items-center">
                  <EnvelopeIcon className="h-4 w-4 mr-2" />
                  info@smefantasia.com
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  Facebook
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  Instagram
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-neutral-800 text-center text-neutral-400 text-sm">
            <p>&copy; 2024 SME FANTASIA. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ClientLayout;