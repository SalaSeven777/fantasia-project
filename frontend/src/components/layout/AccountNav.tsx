import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useTranslation } from 'react-i18next';
import { logout } from '../../store/slices/authSlice';
import { 
  ArrowRightOnRectangleIcon as LogoutIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

const AccountNav = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { t } = useTranslation();

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="wood-account-nav">
      <div className="wood-account-nav-content">
        <div className="flex text-white">
          <span className="text-sm font-medium mr-2">GB</span>
        </div>
        {isAuthenticated ? (
          <div className="flex items-center space-x-6">
            <Link to="/profile" className="wood-account-link text-sm">
              <UserCircleIcon className="h-4 w-4 mr-2" />
              My Account
            </Link>
            <button 
              onClick={handleLogout}
              className="wood-account-link text-sm"
            >
              <LogoutIcon className="h-4 w-4 mr-2" />
              Sign Out
            </button>
          </div>
        ) : (
          <Link to="/login" className="wood-account-link text-sm">
            <UserCircleIcon className="h-4 w-4 mr-2" />
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
};

export default AccountNav; 