import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout, showLanguagePrompt } from '../../store/slices/authSlice';
import authService from '../../services/auth.service';
import { apiService } from '../../services/api';
import { useTranslation } from 'react-i18next';
import { LanguageIcon } from '@heroicons/react/24/outline';
import '../../styles/wood-client-theme.css'; // Import the wood client theme

interface Order {
  id: number;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  items_count: number;
}

const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState(user);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const { t, i18n } = useTranslation();

  // Helper to get first name (handles both naming conventions)
  const getFirstName = (user: any): string => {
    return user?.first_name || user?.firstName || '';
  };

  // Helper to get last name (handles both naming conventions)
  const getLastName = (user: any): string => {
    return user?.last_name || user?.lastName || '';
  };

  const getCurrentLanguageName = () => {
    const languages: Record<string, string> = {
      en: 'English',
      fr: 'Français',
      ar: 'العربية'
    };
    return languages[i18n.language] || languages[i18n.language.split('-')[0]] || 'English';
  };

  const handleChangeLanguage = () => {
    dispatch(showLanguagePrompt());
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Fetch current user data
        const userData = await authService.fetchCurrentUser();
        setUserData(userData);
        
        // Fetch recent orders
        try {
          const orders = await apiService.get<Order[]>('orders/orders/?limit=5');
          setRecentOrders(orders);
        } catch (err) {
          console.error('Error fetching orders:', err);
          // Don't set an error, just leave orders empty
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user]);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="wood-client-container py-6">
        <div className="wood-page-header">
          <h1 className="wood-page-title">{t('profile.profile')}</h1>
        </div>
        <p className="mt-2 wood-text-secondary">{t('profile.pleaseLoginToView')}</p>
      </div>
    );
  }

  return (
    <div className="wood-client-container py-6">
      <div className="wood-page-header">
        <h1 className="wood-page-title">{t('profile.myProfile')}</h1>
        <button
          onClick={handleLogout}
          className="wood-btn wood-btn-sm wood-btn-danger wood-hover-lift"
        >
          {t('navigation.signOut')}
        </button>
      </div>
      
      {loading ? (
        <div className="wood-spinner">
          <div className="wood-spinner-icon"></div>
        </div>
      ) : error ? (
        <div className="wood-alert-error">
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div className="wood-card">
            <div className="wood-card-header">
              <h3 className="wood-card-title">{t('profile.accountInformation')}</h3>
              <p className="wood-card-subtitle">{t('profile.personalDetails')}</p>
            </div>
            
            <div className="wood-info-list">
              <div className="wood-info-item">
                <dt className="wood-info-label">{t('profile.fullName')}</dt>
                <dd className="wood-info-value">
                  {getFirstName(userData)} {getLastName(userData)}
                </dd>
              </div>
              
              <div className="wood-info-item">
                <dt className="wood-info-label">{t('common.email')}</dt>
                <dd className="wood-info-value">{userData?.email}</dd>
              </div>
              
              <div className="wood-info-item">
                <dt className="wood-info-label">{t('profile.role')}</dt>
                <dd className="wood-info-value">
                  {userData?.role === 'CL' && t('profile.roles.client')}
                  {userData?.role === 'CO' && t('profile.roles.commercial')}
                  {userData?.role === 'DA' && t('profile.roles.deliveryAgent')}
                  {userData?.role === 'WM' && t('profile.roles.warehouseManager')}
                  {userData?.role === 'BM' && t('profile.roles.billingManager')}
                  {userData?.role === 'AD' && t('profile.roles.administrator')}
                </dd>
              </div>
              
              <div className="wood-info-item">
                <dt className="wood-info-label">{t('profile.joined')}</dt>
                <dd className="wood-info-value">
                  {userData?.date_joined && new Date(userData.date_joined).toLocaleDateString()}
                </dd>
              </div>
              
              <div className="wood-info-item">
                <dt className="wood-info-label">{t('common.language')}</dt>
                <dd className="wood-info-value flex justify-between items-center">
                  <span>{getCurrentLanguageName()}</span>
                  <button 
                    onClick={handleChangeLanguage}
                    className="wood-btn wood-btn-sm wood-btn-outline wood-hover-lift flex items-center"
                  >
                    <LanguageIcon className="h-4 w-4 mr-1.5" />
                    {t('profile.changeLanguage')}
                  </button>
                </dd>
              </div>
            </div>
          </div>
          
          {/* Recent Orders */}
          <div className="wood-card mt-8">
            <div className="wood-card-header">
              <h3 className="wood-card-title">{t('profile.recentOrders')}</h3>
              <p className="wood-card-subtitle">{t('profile.recentPurchases')}</p>
            </div>
            
            {recentOrders.length > 0 ? (
              <table className="wood-table">
                <thead className="wood-table-header">
                  <tr>
                    <th>{t('orders.orderNumber')}</th>
                    <th>{t('orders.date')}</th>
                    <th>{t('orders.status')}</th>
                    <th>{t('orders.total')}</th>
                    <th>{t('orders.items')}</th>
                    <th>{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="wood-table-body">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="wood-table-row">
                      <td>#{order.order_number}</td>
                      <td>{new Date(order.created_at).toLocaleDateString()}</td>
                      <td>
                        <span className={`wood-badge ${
                          order.status === 'completed' ? 'wood-badge-success' : 
                          order.status === 'processing' ? 'wood-badge-warning' : 
                          order.status === 'pending' ? 'wood-badge-info' : 
                          'wood-badge-danger'
                        }`}>
                          {t(`orders.statuses.${order.status}`)}
                        </span>
                      </td>
                      <td>${order.total.toFixed(2)}</td>
                      <td>{order.items_count}</td>
                      <td>
                        <Link 
                          to={`/orders/${order.id}`}
                          className="wood-btn wood-btn-sm wood-btn-outline wood-hover-lift"
                        >
                          {t('common.view')}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="wood-empty-state">
                <p>{t('profile.noOrders')}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Profile; 