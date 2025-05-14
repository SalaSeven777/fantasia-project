import React from 'react';

interface ErrorMessageProps {
  message: string;
  variant?: 'error' | 'warning' | 'info';
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  variant = 'error' 
}) => {
  const bgColorClass = {
    error: 'bg-red-50',
    warning: 'bg-yellow-50',
    info: 'bg-blue-50'
  };

  const textColorClass = {
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800'
  };

  const borderColorClass = {
    error: 'border-red-200',
    warning: 'border-yellow-200',
    info: 'border-blue-200'
  };

  return (
    <div className={`${bgColorClass[variant]} border ${borderColorClass[variant]} rounded-md p-4 my-4`}>
      <p className={`${textColorClass[variant]} font-medium`}>{message}</p>
    </div>
  );
};

export default ErrorMessage; 