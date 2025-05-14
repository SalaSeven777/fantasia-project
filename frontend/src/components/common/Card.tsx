import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string | ReactNode;
  footer?: string | ReactNode;
  noPadding?: boolean;
  fullHeight?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  title, 
  footer,
  noPadding = false,
  fullHeight = false
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden border border-neutral-200 dashboard-card ${fullHeight ? 'h-full' : ''} ${className}`}>
      {title && (
        <div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50">
          {typeof title === 'string' ? (
            <h3 className="text-lg font-medium text-primary-dark-blue-900">{title}</h3>
          ) : (
            title
          )}
        </div>
      )}
      
      <div className={noPadding ? '' : 'p-4'}>
        {children}
      </div>
      
      {footer && (
        <div className="px-4 py-3 border-t border-neutral-200 bg-neutral-50">
          {typeof footer === 'string' ? (
            <p className="text-sm text-neutral-500">{footer}</p>
          ) : (
            footer
          )}
        </div>
      )}
    </div>
  );
};

export default Card; 