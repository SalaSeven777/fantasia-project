import React from 'react';
import {
  ChartBarIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<any>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description, icon: Icon, trend }) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className="h-6 w-6 text-gray-400" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">{value}</div>
              {trend && (
                <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </div>
              )}
            </dd>
          </dl>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </div>
  </div>
);

const StatsOverview: React.FC = () => {
  const stats = [
    {
      title: 'Total Orders',
      value: '150',
      description: 'Last 30 days',
      icon: ShoppingCartIcon,
      trend: { value: 12, isPositive: true },
    },
    {
      title: 'Revenue',
      value: '$45,850',
      description: 'Last 30 days',
      icon: CurrencyDollarIcon,
      trend: { value: 8.2, isPositive: true },
    },
    {
      title: 'Active Users',
      value: '2,300',
      description: 'Total registered users',
      icon: UserGroupIcon,
    },
    {
      title: 'Conversion Rate',
      value: '3.2%',
      description: 'Last 30 days',
      icon: ChartBarIcon,
      trend: { value: 1.1, isPositive: false },
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
};

export default StatsOverview; 