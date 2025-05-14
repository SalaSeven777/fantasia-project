import React from 'react';
import { useAppSelector } from '../store/hooks';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatsOverview from '../components/dashboard/StatsOverview';
import RecentActivities from '../components/dashboard/RecentActivities';
import QuickActions from '../components/dashboard/QuickActions';

const Dashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <DashboardLayout>
          <div className="space-y-6">
            {/* Welcome Message */}
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                  Welcome back, {user?.firstName}!
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Here's what's happening with your business today.
                </p>
              </div>
            </div>

            {/* Stats Overview */}
            <StatsOverview />

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Recent Activities */}
              <div className="lg:col-span-1">
                <RecentActivities />
              </div>

              {/* Quick Actions */}
              <div className="lg:col-span-1">
                <QuickActions />
              </div>
            </div>
          </div>
        </DashboardLayout>
      </div>
    </div>
  );
};

export default Dashboard; 