import React from 'react';
import {
  PlusCircleIcon,
  DocumentPlusIcon,
  UserPlusIcon,
  CogIcon,
} from '@heroicons/react/24/outline';

interface QuickActionProps {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  onClick: () => void;
}

const QuickAction: React.FC<QuickActionProps> = ({ icon: Icon, title, description, onClick }) => (
  <button
    onClick={onClick}
    className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
  >
    <div className="flex-shrink-0">
      <Icon className="h-6 w-6 text-gray-400" />
    </div>
    <div className="flex-1 min-w-0 text-left">
      <span className="absolute inset-0" aria-hidden="true" />
      <p className="text-sm font-medium text-gray-900">{title}</p>
      <p className="text-sm text-gray-500 truncate">{description}</p>
    </div>
  </button>
);

const QuickActions: React.FC = () => {
  const actions = [
    {
      icon: PlusCircleIcon,
      title: 'New Order',
      description: 'Create a new order',
      onClick: () => console.log('New order clicked'),
    },
    {
      icon: DocumentPlusIcon,
      title: 'Create Invoice',
      description: 'Generate new invoice',
      onClick: () => console.log('Create invoice clicked'),
    },
    {
      icon: UserPlusIcon,
      title: 'Add User',
      description: 'Add new user to system',
      onClick: () => console.log('Add user clicked'),
    },
    {
      icon: CogIcon,
      title: 'Settings',
      description: 'Manage preferences',
      onClick: () => console.log('Settings clicked'),
    },
  ];

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {actions.map((action) => (
          <QuickAction key={action.title} {...action} />
        ))}
      </div>
    </div>
  );
};

export default QuickActions; 