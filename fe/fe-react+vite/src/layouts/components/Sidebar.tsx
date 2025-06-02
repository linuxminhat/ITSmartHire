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
  ChevronDoubleRightIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { Menu } from '@headlessui/react';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role?.name;
  const [blogsOpen, setBlogsOpen] = useState(false);
  const [resumeToolsOpen, setResumeToolsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Only use HR notification hook if the user is HR
  const hrNotifications = role === 'HR'
    ? useHRNotification()
    : { unreadCount: 0 };

  const { unreadCount } = hrNotifications;

  const basePath = role === 'ADMIN' ? '/admin' : role === 'HR' ? '/hr' : '/';

  // Unified nav link classes với consistent styling
  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `group flex items-center w-full h-11 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
      isActive 
        ? 'bg-blue-600 text-white shadow-md' 
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`;

  // Classes cho sub-menu items
  const subNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `group flex items-center w-full h-10 px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
      isActive 
        ? 'bg-blue-600 text-white shadow-md' 
        : 'text-gray-400 hover:bg-gray-700 hover:text-white'
    }`;

  // Classes cho dropdown buttons
  const dropdownButtonClasses = `group flex items-center w-full h-11 px-4 py-2.5 text-sm font-medium text-gray-300 rounded-lg transition-all duration-200 hover:bg-gray-700 hover:text-white`;

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
      className={`transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-16' : 'w-64'
      } flex-shrink-0 bg-gray-800 border-r border-gray-700`}
      aria-label="Sidebar"
    >
      <div className="h-full flex flex-col">
        {/* Logo section */}
        <div className={`h-16 flex items-center border-b border-gray-700 px-4 ${
          isCollapsed ? 'justify-center' : ''
        }`}>
          <Link to="/" className="flex items-center">
            {isCollapsed ? (
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">IT</span>
              </div>
            ) : (
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">IT</span>
                </div>
                <span className="text-xl font-semibold text-white">Smart Hire</span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation section */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-3">
            <ul className="space-y-1">
              {/* Bảng điều khiển */}
              <li>
                <NavLink to={basePath} className={navLinkClasses} end>
                  <HomeIcon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span className="ml-3">Bảng điều khiển</span>}
                </NavLink>
              </li>

              {role === 'ADMIN' && (
                <>
                  {/* Admin specific items */}
                  <li className="pt-2">
                    <div className={`px-4 py-2 ${isCollapsed ? 'hidden' : 'block'}`}>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Quản lý hệ thống
                      </span>
                    </div>
                  </li>

                  <li>
                    <NavLink to={`${basePath}/users`} className={navLinkClasses}>
                      <UsersIcon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && <span className="ml-3">Quản lý Người dùng</span>}
                    </NavLink>
                  </li>

                  <li>
                    <NavLink to={`${basePath}/roles`} className={navLinkClasses}>
                      <TagIcon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && <span className="ml-3">Quản lý Vai trò</span>}
                    </NavLink>
                  </li>

                  <li>
                    <NavLink to={`${basePath}/skills`} className={navLinkClasses}>
                      <AcademicCapIcon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && <span className="ml-3">Quản lý Kỹ năng</span>}
                    </NavLink>
                  </li>

                  <li>
                    <NavLink to={`${basePath}/categories`} className={navLinkClasses}>
                      <RectangleGroupIcon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && <span className="ml-3">Quản lý Danh mục</span>}
                    </NavLink>
                  </li>

                  {/* Blogs dropdown for Admin */}
                  <li>
                    <button
                      onClick={() => setBlogsOpen(!blogsOpen)}
                      className={dropdownButtonClasses}
                    >
                      <NewspaperIcon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && (
                        <>
                          <span className="ml-3 flex-1 text-left">Quản lý Bài viết</span>
                          <ChevronDownIcon
                            className={`w-4 h-4 transition-transform duration-200 ${
                              blogsOpen ? 'rotate-180' : 'rotate-0'
                            }`}
                          />
                        </>
                      )}
                    </button>

                    {blogsOpen && !isCollapsed && (
                      <ul className="mt-1 ml-8 space-y-1">
                        <li>
                          <NavLink to={`${basePath}/blogs`} end className={subNavLinkClasses}>
                            <span className="ml-2">Danh sách bài viết</span>
                          </NavLink>
                        </li>
                        <li>
                          <NavLink to={`${basePath}/blogs/new`} end className={subNavLinkClasses}>
                            <span className="ml-2">Thêm bài viết mới</span>
                          </NavLink>
                        </li>
                      </ul>
                    )}
                  </li>
                </>
              )}

              {(role === 'ADMIN' || role === 'HR') && (
                <>
                  {/* Shared section */}
                  <li className="pt-4">
                    <div className={`px-4 py-2 ${isCollapsed ? 'hidden' : 'block'}`}>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Quản lý tuyển dụng
                      </span>
                    </div>
                  </li>

                  {role === 'HR' && (
                    <>
                      <li>
                        <NavLink to={`${basePath}/notifications`} className={navLinkClasses}>
                          <div className="relative">
                            <BellIcon className="w-5 h-5 flex-shrink-0" />
                            {unreadCount > 0 && (
                              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                <span className="text-xs text-white font-medium">
                                  {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                              </span>
                            )}
                          </div>
                          {!isCollapsed && <span className="ml-3">Quản lý thông báo</span>}
                        </NavLink>
                      </li>

                      {/* Blogs dropdown for HR */}
                      <li>
                        <button
                          onClick={() => setBlogsOpen(!blogsOpen)}
                          className={dropdownButtonClasses}
                        >
                          <NewspaperIcon className="w-5 h-5 flex-shrink-0" />
                          {!isCollapsed && (
                            <>
                              <span className="ml-3 flex-1 text-left">Quản lý Bài viết</span>
                              <ChevronDownIcon
                                className={`w-4 h-4 transition-transform duration-200 ${
                                  blogsOpen ? 'rotate-180' : 'rotate-0'
                                }`}
                              />
                            </>
                          )}
                        </button>

                        {blogsOpen && !isCollapsed && (
                          <ul className="mt-1 ml-8 space-y-1">
                            <li>
                              <NavLink to={`${basePath}/blogs`} end className={subNavLinkClasses}>
                                <span className="ml-2">Danh sách bài viết</span>
                              </NavLink>
                            </li>
                            <li>
                              <NavLink to={`${basePath}/blogs/new`} end className={subNavLinkClasses}>
                                <span className="ml-2">Thêm bài viết mới</span>
                              </NavLink>
                            </li>
                          </ul>
                        )}
                      </li>
                    </>
                  )}

                  <li>
                    <NavLink to={`${basePath}/companies`} className={navLinkClasses}>
                      <BuildingOffice2Icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && <span className="ml-3">Quản lý Công ty</span>}
                    </NavLink>
                  </li>

                  <li>
                    <NavLink to={`${basePath}/jobs`} className={navLinkClasses}>
                      <BriefcaseIcon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && <span className="ml-3">Quản lý Việc làm</span>}
                    </NavLink>
                  </li>

                  <li>
                    <NavLink to={`${basePath}/interviews`} className={navLinkClasses}>
                      <CalendarDaysIcon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && <span className="ml-3">Quản lý lịch phỏng vấn</span>}
                    </NavLink>
                  </li>

                  {/* Resume Tools Section */}
                  <li className="pt-4">
                    <div className={`px-4 py-2 ${isCollapsed ? 'hidden' : 'block'}`}>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Công cụ AI
                      </span>
                    </div>
                  </li>

                  <li>
                    <button
                      onClick={() => setResumeToolsOpen(!resumeToolsOpen)}
                      className={dropdownButtonClasses}
                    >
                      <DocumentTextIcon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && (
                        <>
                          <span className="ml-3 flex-1 text-left">Công cụ trích xuất hồ sơ</span>
                          <ChevronDownIcon
                            className={`w-4 h-4 transition-transform duration-200 ${
                              resumeToolsOpen ? 'rotate-180' : 'rotate-0'
                            }`}
                          />
                        </>
                      )}
                    </button>

                    {resumeToolsOpen && !isCollapsed && (
                      <ul className="mt-1 ml-8 space-y-1">
                        <li>
                          <NavLink to={`${basePath}/parsing-resumes`} className={subNavLinkClasses}>
                            <span className="ml-2">Trích xuất CV</span>
                          </NavLink>
                        </li>
                        <li>
                          <NavLink to={`${basePath}/saved-records`} className={subNavLinkClasses}>
                            <span className="ml-2">Danh sách đã lưu</span>
                          </NavLink>
                        </li>
                      </ul>
                    )}
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>

        {/* Toggle button section */}
        <div className="border-t border-gray-700 p-3">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
            title={isCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
          >
            {isCollapsed ? (
              <ChevronDoubleRightIcon className="w-5 h-5" />
            ) : (
              <ChevronDoubleLeftIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;