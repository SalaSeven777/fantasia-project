import React, { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'text';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...rest
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'py-1 px-3 text-xs',
    md: 'py-2 px-4 text-sm',
    lg: 'py-2.5 px-5 text-base',
  };

  // Variant classes
  const variantClasses = {
    primary: 'bg-primary-dark-blue-600 text-white hover:bg-primary-dark-blue-700 focus:ring-primary-dark-blue-500',
    secondary: 'bg-accent-600 text-white hover:bg-accent-700 focus:ring-accent-500',
    outline: 'bg-transparent border border-primary-dark-blue-600 text-primary-dark-blue-600 hover:bg-primary-dark-blue-50 focus:ring-primary-dark-blue-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    text: 'bg-transparent text-primary-dark-blue-600 hover:text-primary-dark-blue-800 hover:bg-primary-dark-blue-50',
  };

  // Common classes for all buttons
  const commonClasses = `
    inline-flex items-center justify-center rounded-md
    font-medium focus:outline-none focus:ring-2 focus:ring-offset-2
    transition-colors duration-200 ease-in-out
    whitespace-nowrap responsive-button
    ${disabled || isLoading ? 'opacity-60 cursor-not-allowed' : ''}
    ${fullWidth ? 'w-full' : ''}
  `;

  return (
    <button
      disabled={disabled || isLoading}
      className={`
        ${commonClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      {...rest}
    >
      {isLoading && (
        <svg 
          className="animate-spin -ml-1 mr-2 h-4 w-4" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          ></circle>
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      
      {!isLoading && leftIcon && (
        <span className="mr-2 flex items-center">{leftIcon}</span>
      )}
      
      <span>{children}</span>
      
      {!isLoading && rightIcon && (
        <span className="ml-2 flex items-center">{rightIcon}</span>
      )}
    </button>
  );
};

export default Button; 