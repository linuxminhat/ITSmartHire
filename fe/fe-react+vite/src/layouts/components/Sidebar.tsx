// import React from 'react';
import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useHRNotification } from '@/contexts/HRNotificationContext';
import {
  HomeIcon,
  UsersIcon,
  BuildingOffice2Icon,
  BriefcaseIcon,
  DocumentTextIcon,
  TagIcon,
  AcademicCapIcon,
  RectangleGroupIcon,
  NewspaperIcon,
  ChevronDownIcon,
  BellIcon
} from '@heroicons/react/24/outline';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role?.name;
  const [blogsOpen, setBlogsOpen] = useState(false);

  // Only use HR notification hook if the user is HR
  const hrNotifications = role === 'HR'
    ? useHRNotification()
    : { unreadCount: 0 };

  const { unreadCount } = hrNotifications;

  const basePath = role === 'ADMIN' ? '/admin' : role === 'HR' ? '/hr' : '/';

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center py-2.5 px-4 rounded-lg text-gray-300 transition duration-200 hover:bg-gray-700 hover:text-white ${isActive ? 'bg-gray-700 text-white' : ''}`;

  return (
    <aside className="w-64 flex-shrink-0" aria-label="Sidebar">
      <div className="h-full overflow-y-auto bg-gray-800 px-3 py-4">
        <div className="mb-6 px-2 pt-1 pb-3 border-b border-gray-700">
          <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse">
            <span className="self-center text-xl font-semibold whitespace-nowrap text-white">IT Smart Hire</span>
          </Link>
        </div>

        <ul className="space-y-2 font-medium">
          {/* Bảng điều khiển */}
          <li>
            <NavLink to={basePath} className={navLinkClasses} end>
              <HomeIcon className="h-5 w-5 mr-3 flex-shrink-0 text-gray-400 group-hover:text-white" />
              <span className="flex-1 whitespace-nowrap">Bảng điều khiển</span>
            </NavLink>
          </li>

          {role === 'ADMIN' && (
            <>
              <li>
                <NavLink to={`${basePath}/users`} className={navLinkClasses}>
                  <UsersIcon className="h-5 w-5 mr-3 flex-shrink-0 text-gray-400 group-hover:text-white" />
                  <span className="flex-1 whitespace-nowrap">Quản lý Người dùng</span>
                </NavLink>
              </li>
              <li>
                <NavLink to={`${basePath}/roles`} className={navLinkClasses}>
                  <TagIcon className="h-5 w-5 mr-3 flex-shrink-0 text-gray-400 group-hover:text-white" />
                  <span className="flex-1 whitespace-nowrap">Quản lý Vai trò</span>
                </NavLink>
              </li>
              <li>
                <NavLink to={`${basePath}/skills`} className={navLinkClasses}>
                  <AcademicCapIcon className="h-5 w-5 mr-3 flex-shrink-0 text-gray-400 group-hover:text-white" />
                  <span className="flex-1 whitespace-nowrap">Quản lý Kỹ năng</span>
                </NavLink>
              </li>
              <li>
                <NavLink to={`${basePath}/categories`} className={navLinkClasses}>
                  <RectangleGroupIcon className="h-5 w-5 mr-3 flex-shrink-0 text-gray-400 group-hover:text-white" />
                  <span className="flex-1 whitespace-nowrap">Quản lý Danh mục</span>
                </NavLink>
              </li>
              {/* Dropdown Quản lý Bài viết */}
              <li>
                <button
                  onClick={() => setBlogsOpen(o => !o)}
                  className="group w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition duration-200"
                >
                  <div className="flex items-center">
                    <NewspaperIcon
                      className="h-5 w-5 mr-3 text-gray-400 group-hover:text-white"
                    />
                    <span className="flex-1 whitespace-nowrap">
                      Quản lý Bài viết
                    </span>
                  </div>
                  <ChevronDownIcon
                    className={` h-5 w-5 transition-transform  ${blogsOpen ? 'rotate-180' : 'rotate-0'} `}
                  />
                </button>

                {blogsOpen && (
                  <ul className="mt-1 space-y-1 pl-8">
                    <li>
                      <NavLink
                        to={`${basePath}/blogs`}
                        end
                        className={navLinkClasses}
                      >
                        Danh sách bài viết
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to={`${basePath}/blogs/new`}
                        end
                        className={navLinkClasses}
                      >
                        Thêm bài viết mới
                      </NavLink>
                    </li>
                  </ul>
                )}
              </li>
            </>
          )}

          {(role === 'ADMIN' || role === 'HR') && (
            <>
              {role === 'HR' && (
                <>
                  <li>
                    <NavLink to={`${basePath}/notifications`} className={navLinkClasses}>
                      <div className="relative">
                        <BellIcon className="h-5 w-5 mr-3 flex-shrink-0 text-gray-400 group-hover:text-white" />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-5 w-5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                              {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                          </span>
                        )}
                      </div>
                      <span className="flex-1 whitespace-nowrap">Quản lý thông báo</span>
                    </NavLink>
                  </li>
                  <li>
                    <button
                      onClick={() => setBlogsOpen(o => !o)}
                      className="group w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition duration-200"
                    >
                      <div className="flex items-center">
                        <NewspaperIcon
                          className="h-5 w-5 mr-3 text-gray-400 group-hover:text-white"
                        />
                        <span className="flex-1 whitespace-nowrap">
                          Quản lý Bài viết
                        </span>
                      </div>
                      <ChevronDownIcon
                        className={` h-5 w-5 transition-transform  ${blogsOpen ? 'rotate-180' : 'rotate-0'} `}
                      />
                    </button>

                    {blogsOpen && (
                      <ul className="mt-1 space-y-1 pl-8">
                        <li>
                          <NavLink
                            to={`${basePath}/blogs`}
                            end
                            className={navLinkClasses}
                          >
                            Danh sách bài viết
                          </NavLink>
                        </li>
                        <li>
                          <NavLink
                            to={`${basePath}/blogs/new`}
                            end
                            className={navLinkClasses}
                          >
                            Thêm bài viết mới
                          </NavLink>
                        </li>
                      </ul>
                    )}
                  </li>
                </>
              )}
              <li>
                <NavLink to={`${basePath}/companies`} className={navLinkClasses}>
                  <BuildingOffice2Icon className="h-5 w-5 mr-3 flex-shrink-0 text-gray-400 group-hover:text-white" />
                  <span className="flex-1 whitespace-nowrap">Quản lý Công ty</span>
                </NavLink>
              </li>
              <li>
                <NavLink to={`${basePath}/jobs`} className={navLinkClasses}>
                  <BriefcaseIcon className="h-5 w-5 mr-3 flex-shrink-0 text-gray-400 group-hover:text-white" />
                  <span className="flex-1 whitespace-nowrap">Quản lý Việc làm</span>
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;