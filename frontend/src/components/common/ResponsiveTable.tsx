import React, { ReactNode } from 'react';

interface ResponsiveTableProps {
  children: ReactNode;
  className?: string;
}

const ResponsiveTable: React.FC<ResponsiveTableProps> = ({ children, className = '' }) => {
  return (
    <div className="table-container overflow-x-auto w-full shadow-sm rounded-lg overflow-hidden">
      <table className={`table-responsive min-w-full divide-y divide-gray-200 ${className}`}>
        {children}
      </table>
    </div>
  );
};

interface TableHeadProps {
  children: ReactNode;
  className?: string;
}

const ResponsiveTableHead: React.FC<TableHeadProps> = ({ children, className = '' }) => {
  return (
    <thead className={`bg-primary-dark-blue-50 ${className}`}>
      {children}
    </thead>
  );
};

interface TableBodyProps {
  children: ReactNode;
  className?: string;
}

const ResponsiveTableBody: React.FC<TableBodyProps> = ({ children, className = '' }) => {
  return (
    <tbody className={`bg-white divide-y divide-gray-200 ${className}`}>
      {children}
    </tbody>
  );
};

interface TableHeaderCellProps {
  children: ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

const ResponsiveTableHeaderCell: React.FC<TableHeaderCellProps> = ({ 
  children, 
  className = '', 
  align = 'left' 
}) => {
  const alignmentClass = align === 'left' 
    ? 'text-left' 
    : align === 'center' 
      ? 'text-center' 
      : 'text-right';

  return (
    <th 
      className={`px-6 py-3 ${alignmentClass} text-xs font-medium text-primary-dark-blue-900 uppercase tracking-wider whitespace-nowrap ${className}`}
    >
      {children}
    </th>
  );
};

interface TableCellProps {
  children: ReactNode;
  className?: string;
  colSpan?: number;
  align?: 'left' | 'center' | 'right';
}

const ResponsiveTableCell: React.FC<TableCellProps> = ({ 
  children, 
  className = '', 
  colSpan,
  align = 'left' 
}) => {
  const alignmentClass = align === 'left' 
    ? 'text-left' 
    : align === 'center' 
      ? 'text-center' 
      : 'text-right';

  return (
    <td 
      className={`px-6 py-4 whitespace-nowrap ${alignmentClass} ${className}`}
      colSpan={colSpan}
    >
      {children}
    </td>
  );
};

interface TableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

const ResponsiveTableRow: React.FC<TableRowProps> = ({ 
  children, 
  className = '',
  onClick 
}) => {
  return (
    <tr 
      className={`${onClick ? 'cursor-pointer' : ''} hover:bg-gray-50 ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
};

export default ResponsiveTable;
export {
  ResponsiveTableHead,
  ResponsiveTableBody,
  ResponsiveTableHeaderCell,
  ResponsiveTableCell,
  ResponsiveTableRow
}; 