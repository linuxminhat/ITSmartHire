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
  BellIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon
} from '@heroicons/react/24/outline';
import { Menu } from '@headlessui/react';


const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role?.name;
  const [blogsOpen, setBlogsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Only use HR notification hook if the user is HR
  const hrNotifications = role === 'HR'
    ? useHRNotification()
    : { unreadCount: 0 };

  const { unreadCount } = hrNotifications;

  const basePath = role === 'ADMIN' ? '/admin' : role === 'HR' ? '/hr' : '/';

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center py-2.5 px-4 rounded-lg text-gray-300 transition duration-200 hover:bg-gray-700 hover:text-white ${isActive ? 'bg-gray-700 text-white' : ''}`;

  // Thêm hàm xử lý phím tab
  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      setIsCollapsed(!isCollapsed);
    }
  };

  // Thêm effect để lắng nghe sự kiện phím
  React.useEffect(() => {
    document.addEventListener('keydown', handleTabKey);
    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isCollapsed]);

  return (
    <aside
      className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'w-16' : 'w-64'
        } flex-shrink-0 bg-gray-800`}
      aria-label="Sidebar"
    >
      <div className="h-full flex flex-col">
        {/* Logo section */}
        <div className={`p-4 border-b border-gray-700 ${isCollapsed ? 'flex justify-center' : ''
          }`}>
          <Link to="/" className="flex items-center">
            {isCollapsed ? (
              <span className="text-xl font-bold text-white">IT</span>
            ) : (
              <span className="text-xl font-semibold text-white">IT Smart Hire</span>
            )}
          </Link>
        </div>

        {/* Navigation section */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-2 font-medium">
            {/* Bảng điều khiển */}
            <li>
              <NavLink to={basePath} className={navLinkClasses} end>
                <div className="flex items-center">
                  <HomeIcon className="h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-white" />
                  {!isCollapsed && <span className="ml-3">Bảng điều khiển</span>}
                </div>
              </NavLink>
            </li>

            {role === 'ADMIN' && (
              <>
                <li>
                  <NavLink to={`${basePath}/users`} className={navLinkClasses}>
                    <div className="flex items-center">
                      <UsersIcon className="h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-white" />
                      {!isCollapsed && <span className="ml-3">Quản lý Người dùng</span>}
                    </div>
                  </NavLink>
                </li>
                <li>
                  <NavLink to={`${basePath}/roles`} className={navLinkClasses}>
                    <div className="flex items-center">
                      <TagIcon className="h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-white" />
                      {!isCollapsed && <span className="ml-3">Quản lý Vai trò</span>}
                    </div>
                  </NavLink>
                </li>
                <li>
                  <NavLink to={`${basePath}/skills`} className={navLinkClasses}>
                    <div className="flex items-center">
                      <AcademicCapIcon className="h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-white" />
                      {!isCollapsed && <span className="ml-3">Quản lý Kỹ năng</span>}
                    </div>
                  </NavLink>
                </li>
                <li>
                  <NavLink to={`${basePath}/categories`} className={navLinkClasses}>
                    <div className="flex items-center">
                      <RectangleGroupIcon className="h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-white" />
                      {!isCollapsed && <span className="ml-3">Quản lý Danh mục</span>}
                    </div>
                  </NavLink>
                </li>
                {/* Dropdown Quản lý Bài viết */}
                <li>
                  <button
                    onClick={() => setBlogsOpen(o => !o)}
                    className="group w-full flex items-center py-2.5 px-4 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition duration-200"
                  >
                    <div className="flex items-center flex-1">
                      <NewspaperIcon className="h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-white" />
                      {!isCollapsed && <span className="ml-3">Quản lý Bài viết</span>}
                    </div>
                    {!isCollapsed && (
                      <ChevronDownIcon
                        className={`h-5 w-5 transition-transform ${blogsOpen ? 'rotate-180' : 'rotate-0'}`}
                      />
                    )}
                  </button>

                  {blogsOpen && !isCollapsed && (
                    <ul className="mt-1 space-y-1 pl-8">
                      <li>
                        <NavLink
                          to={`${basePath}/blogs`}
                          end
                          className={navLinkClasses}
                        >
                          <div className="flex items-center">
                            <span>Danh sách bài viết</span>
                          </div>
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to={`${basePath}/blogs/new`}
                          end
                          className={navLinkClasses}
                        >
                          <div className="flex items-center">
                            <span>Thêm bài viết mới</span>
                          </div>
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
                        <div className="flex items-center relative">
                          <BellIcon className="h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-white" />
                          {!isCollapsed && <span className="ml-3">Quản lý thông báo</span>}
                          {unreadCount > 0 && (
                            <span className="absolute -top-2 left-3 flex h-5 w-5">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                                {unreadCount > 9 ? '9+' : unreadCount}
                              </span>
                            </span>
                          )}
                        </div>
                      </NavLink>
                    </li>
                    <li>
                      <button
                        onClick={() => setBlogsOpen(o => !o)}
                        className="group w-full flex items-center py-2.5 px-4 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition duration-200"
                      >
                        <div className="flex items-center flex-1">
                          <NewspaperIcon className="h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-white" />
                          {!isCollapsed && <span className="ml-3">Quản lý Bài viết</span>}
                        </div>
                        {!isCollapsed && (
                          <ChevronDownIcon
                            className={`h-5 w-5 transition-transform ${blogsOpen ? 'rotate-180' : 'rotate-0'}`}
                          />
                        )}
                      </button>

                      {blogsOpen && !isCollapsed && (
                        <ul className="mt-1 space-y-1 pl-8">
                          <li>
                            <NavLink
                              to={`${basePath}/blogs`}
                              end
                              className={navLinkClasses}
                            >
                              <div className="flex items-center">
                                <span>Danh sách bài viết</span>
                              </div>
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to={`${basePath}/blogs/new`}
                              end
                              className={navLinkClasses}
                            >
                              <div className="flex items-center">
                                <span>Thêm bài viết mới</span>
                              </div>
                            </NavLink>
                          </li>
                        </ul>
                      )}
                    </li>
                  </>
                )}
                <li>
                  <NavLink to={`${basePath}/companies`} className={navLinkClasses}>
                    <div className="flex items-center">
                      <BuildingOffice2Icon className="h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-white" />
                      {!isCollapsed && <span className="ml-3">Quản lý Công ty</span>}
                    </div>
                  </NavLink>
                </li>
                <li>
                  <NavLink to={`${basePath}/jobs`} className={navLinkClasses}>
                    <div className="flex items-center">
                      <BriefcaseIcon className="h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-white" />
                      {!isCollapsed && <span className="ml-3">Quản lý Việc làm</span>}
                    </div>
                  </NavLink>
                </li>
                <li>
                  <NavLink to={`${basePath}/interviews`} className={navLinkClasses}>
                    <div className="flex items-center">
                      <BriefcaseIcon className="h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-white" />
                      {!isCollapsed && <span className="ml-3">Quản lý lịch phỏng vấn</span>}
                    </div>
                  </NavLink>
                </li>
                <li>
                  <div className="py-2">
                    <Menu as="div" className="relative">
                      <Menu.Button className="flex items-center w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 rounded-lg">
                        <DocumentTextIcon className="h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-white" />
                        {!isCollapsed && (
                          <>
                            <span className="ml-3">Công cụ trích xuất hồ sơ</span>
                            <ChevronDownIcon className="w-4 h-4 ml-auto" />
                          </>
                        )}
                      </Menu.Button>
                      {!isCollapsed && (
                        <Menu.Items className="absolute left-0 mt-1 w-full bg-gray-700 rounded-lg shadow-lg py-1">
                          <Menu.Item>
                            {({ active }) => (
                              <NavLink
                                to={`${basePath}/parsing-resumes`}
                                className={`${active ? 'bg-gray-600' : ''
                                  } block px-4 py-2 text-sm text-gray-300`}
                              >
                                Trích xuất CV
                              </NavLink>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <NavLink
                                to={`${basePath}/saved-records`}
                                className={`${active ? 'bg-gray-600' : ''
                                  } block px-4 py-2 text-sm text-gray-300`}
                              >
                                Danh sách đã lưu
                              </NavLink>
                            )}
                          </Menu.Item>
                        </Menu.Items>
                      )}
                    </Menu>
                  </div>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Toggle button section */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center p-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
          >
            {isCollapsed ? (
              <ChevronDoubleRightIcon className="h-5 w-5" />
            ) : (
              <ChevronDoubleLeftIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;