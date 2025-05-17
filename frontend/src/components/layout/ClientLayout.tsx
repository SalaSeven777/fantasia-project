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
import AccountNav from './AccountNav';
import '../../styles/wood-client-theme.css'; // Make sure wood client theme is imported

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
      {/* Account Navigation Bar */}
      <AccountNav />

      {/* Main Header - Wood Styled */}
      <header className="wood-header z-30 border-b border-wood-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center">
                <div className="wood-logo-icon w-10 h-10 flex items-center justify-center mr-2">
                  <span className="font-bold text-2xl">SF</span>
                </div>
                <span className="wood-logo-text text-xl font-bold">SME FANTASIA</span>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                id="menu-button"
                type="button"
                className="wood-menu-btn inline-flex items-center justify-center p-2 rounded-md"
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
              <nav className="wood-nav flex space-x-8">
                <Link
                  to="/"
                  className={`wood-nav-link text-sm font-medium ${isActive('/') 
                    ? 'active' 
                    : ''} py-2 transition-colors`}
                >
                  {t('navigation.home')}
                </Link>
                <Link
                  to="/presentation"
                  className={`wood-nav-link text-sm font-medium ${isActive('/presentation') 
                    ? 'active' 
                    : ''} py-2 transition-colors`}
                >
                  {t('presentation')}
                </Link>
                <Link
                  to="/about"
                  className={`wood-nav-link text-sm font-medium ${isActive('/about') 
                    ? 'active' 
                    : ''} py-2 transition-colors`}
                >
                  {t('navigation.about')}
                </Link>
                
                <div className="relative group">
                  <Link
                    to="/products"
                    className={`wood-nav-link text-sm font-medium flex items-center ${isActive('/products') 
                      ? 'active' 
                      : ''} py-2 transition-colors`}
                  >
                    {t('navigation.products')}
                    <ChevronDownIcon className="ml-1 h-4 w-4" />
                  </Link>
                  <div className="wood-dropdown absolute left-0 mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-3">
                      <Link to="/products/category/panels" className="wood-dropdown-item block px-6 py-1.5 text-sm">
                        {t('products.panels')}
                      </Link>
                      <Link to="/products/category/wood" className="wood-dropdown-item block px-6 py-1.5 text-sm">
                        {t('products.wood')}
                      </Link>
                      <Link to="/products/category/accessories" className="wood-dropdown-item block px-6 py-1.5 text-sm">
                        {t('products.accessories')}
                      </Link>
                    </div>
                  </div>
                </div>
              </nav>
            </div>

            {/* Right side icons */}
            <div className="flex items-center space-x-4">
              <Link to="/cart" className="wood-cart-icon relative p-2 transition-colors">
                <ShoppingCartIcon className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="wood-cart-count absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center">
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

      {/* Footer - Wood Styled */}
      <footer>
  
        <div className="wood-footer max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="wood-footer-heading text-lg font-semibold">About Us</h3>
              <p className="wood-footer-text">
                SME FANTASIA is your trusted partner for premium wood products and solutions. We offer high-quality materials crafted with expertise and care.
              </p>
              <div className="wood-footer-logo">
                <div className="wood-logo-icon w-8 h-8 flex items-center justify-center mr-2">
                  <span className="font-bold text-sm">SF</span>
                </div>
                <span className="font-semibold text-white">SME FANTASIA</span>
              </div>
            </div>
            <div>
              <h3 className="wood-footer-heading text-lg font-semibold">Quick Links</h3>
              <ul className="space-y-1">
                <li>
                  <Link to="/products" className="wood-footer-link">
                    Products
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="wood-footer-link">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="wood-footer-link">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/presentation" className="wood-footer-link">
                    Presentation
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="wood-footer-link">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="wood-footer-heading text-lg font-semibold">Contact Info</h3>
              <ul className="space-y-2">
                <li className="wood-footer-contact">
                  <PhoneIcon className="h-4 w-4 mr-2" />
                  +1 210-298-9663
                </li>
                <li className="wood-footer-contact">
                  <EnvelopeIcon className="h-4 w-4 mr-2" />
                  info@smefantasia.com
                </li>
                <li className="wood-footer-contact">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  123 Wood Lane, Forest Hills, CA
                </li>
              </ul>
            </div>
            <div>
              <h3 className="wood-footer-heading text-lg font-semibold">Follow Us</h3>
              <div className="flex flex-wrap gap-2 mb-5">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="wood-social-link"
                >
                  Facebook
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="wood-social-link"
                >
                  Instagram
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="wood-social-link"
                >
                  LinkedIn
                </a>
              </div>
              <div className="mt-4">
                <p className="wood-footer-text mb-2">Subscribe to our newsletter</p>
                <div className="flex">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="py-2 px-3 rounded-l w-full focus:outline-none"
                  />
                  <button className="wood-newsletter-btn py-2 px-3 text-white rounded-r">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t wood-footer-border text-center">
            <p className="wood-copyright">&copy; 2024 SME FANTASIA. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ClientLayout;