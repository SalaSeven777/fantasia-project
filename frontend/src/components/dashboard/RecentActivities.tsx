import React from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';

interface Activity {
  id: number;
  type: 'order' | 'payment' | 'login' | 'update';
  description: string;
  timestamp: string;
  status?: 'success' | 'pending' | 'error';
}

const activities: Activity[] = [
  {
    id: 1,
    type: 'order',
    description: 'New order #12345 received',
    timestamp: '5 minutes ago',
    status: 'success',
  },
  {
    id: 2,
    type: 'payment',
    description: 'Payment processed for order #12342',
    timestamp: '2 hours ago',
    status: 'success',
  },
  {
    id: 3,
    type: 'login',
    description: 'User login from new device',
    timestamp: '3 hours ago',
    status: 'pending',
  },
  {
    id: 4,
    type: 'update',
    description: 'System update completed',
    timestamp: '1 day ago',
    status: 'success',
  },
];

const RecentActivities: React.FC = () => {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
          <ClockIcon className="h-5 w-5 mr-2 text-gray-500" />
          Recent Activities
        </h3>
      </div>
      <div className="divide-y divide-gray-200">
        {activities.map((activity) => (
          <div key={activity.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">{activity.description}</p>
              <div className="flex items-center">
                {activity.status && (
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${activity.status === 'success' ? 'bg-green-100 text-green-800' : 
                      activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'}`}>
                    {activity.status}
                  </span>
                )}
              </div>
            </div>
            <div className="mt-2 flex justify-between">
              <div className="sm:flex">
                <p className="flex items-center text-sm text-gray-500">
                  {activity.timestamp}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 py-4 sm:px-6 border-t border-gray-200">
        <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
          View all activities →
        </button>
      </div>
    </div>
  );
};

export default RecentActivities; 