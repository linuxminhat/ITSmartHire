import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/20/solid'; // Hoặc 24/solid

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ElementType;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex mb-5" aria-label="Breadcrumb">
      <ol role="list" className="flex items-center space-x-2 text-sm text-gray-500">
        <li>
          <Link to="/admin" className="hover:text-gray-700 flex items-center">
            <HomeIcon className="h-4 w-4 mr-1.5 flex-shrink-0" aria-hidden="true" />
            <span>Trang chủ</span>
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={item.label}>
            <div className="flex items-center">
              <ChevronRightIcon className="h-4 w-4 flex-shrink-0 text-gray-400" aria-hidden="true" />
              {item.href ? (
                <Link
                  to={item.href}
                  className="ml-2 hover:text-gray-700"
                  aria-current={index === items.length - 1 ? 'page' : undefined}
                >
                  {item.icon && <item.icon className="h-4 w-4 mr-1.5 flex-shrink-0 inline" aria-hidden="true" />}
                  {item.label}
                </Link>
              ) : (
                <span
                  className="ml-2 font-medium text-gray-700" // Trang hiện tại đậm hơn
                  aria-current="page"
                >
                   {item.icon && <item.icon className="h-4 w-4 mr-1.5 flex-shrink-0 inline" aria-hidden="true" />}
                  {item.label}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb; 