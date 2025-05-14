import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout, showLanguagePrompt } from '../../store/slices/authSlice';
import authService from '../../services/auth.service';
import { apiService } from '../../services/api';
import { useTranslation } from 'react-i18next';
import { LanguageIcon } from '@heroicons/react/24/outline';

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
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">{t('profile.profile')}</h1>
          <p className="mt-2 text-gray-600">{t('profile.pleaseLoginToView')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">{t('profile.myProfile')}</h1>
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none"
          >
            {t('navigation.signOut')}
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : error ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-8">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {t('profile.accountInformation')}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {t('profile.personalDetails')}
            </p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">{t('profile.fullName')}</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {getFirstName(userData)} {getLastName(userData)}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">{t('common.email')}</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {userData?.email}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">{t('profile.role')}</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {userData?.role === 'CL' && t('profile.roles.client')}
                      {userData?.role === 'CO' && t('profile.roles.commercial')}
                      {userData?.role === 'DA' && t('profile.roles.deliveryAgent')}
                      {userData?.role === 'WM' && t('profile.roles.warehouseManager')}
                      {userData?.role === 'BM' && t('profile.roles.billingManager')}
                      {userData?.role === 'AD' && t('profile.roles.administrator')}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">{t('profile.joined')}</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {userData?.date_joined && new Date(userData.date_joined).toLocaleDateString()}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">{t('common.language')}</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex justify-between items-center">
                  <span>{getCurrentLanguageName()}</span>
                  <button 
                    onClick={handleChangeLanguage}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none"
                  >
                    <LanguageIcon className="h-4 w-4 mr-1.5" />
                    {t('profile.changeLanguage')}
                  </button>
                </dd>
              </div>
            </dl>
          </div>
        </div>
        
            {/* Recent Orders */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-8">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {t('profile.recentOrders')}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {t('profile.recentPurchases')}
                </p>
              </div>
              <div className="border-t border-gray-200">
                {recentOrders.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('profile.orderNumber')}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('profile.date')}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('profile.status')}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('profile.items')}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('profile.total')}
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('profile.actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentOrders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {order.order_number}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              order.status === 'completed' ? 'bg-green-100 text-green-800' :
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.items_count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${typeof order.total === 'string' ? parseFloat(order.total).toFixed(2) : order.total.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link to={`/orders/${order.id}`} className="text-indigo-600 hover:text-indigo-900">
                              {t('common.view')}
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="px-6 py-4 text-sm text-gray-500">
                    {t('profile.noOrders')}
                    <div className="mt-2">
                      <Link to="/products" className="text-indigo-600 hover:text-indigo-900">
                        {t('profile.startShopping')}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-8 flex justify-center">
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none"
          >
            {t('profile.logoutFromAccount')}
          </button>
        </div>
        </>
      )}
    </div>
  );
};

export default Profile; 