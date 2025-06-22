import React, { Fragment, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { useAuthActions } from '@/contexts/AuthActionContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  SunIcon,
  MoonIcon,
  CloudIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const Header: React.FC = () => {
  const { handleLogout } = useAuthActions();
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [greetingEmoji, setGreetingEmoji] = useState('');
  const [greetingIcon, setGreetingIcon] = useState<React.ComponentType<any> | null>(null);
  const [inspirationalMessage, setInspirationalMessage] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    const dayOfWeek = new Date().getDay();
    
    // Set greeting based on time
    if (hour < 12) {
      setGreeting('Chào buổi sáng');
      setGreetingEmoji('🌅');
      setGreetingIcon(SunIcon);
    } else if (hour < 18) {
      setGreeting('Chào buổi chiều');
      setGreetingEmoji('☀️');
      setGreetingIcon(CloudIcon);
    } else {
      setGreeting('Chào buổi tối');
      setGreetingEmoji('🌆');
      setGreetingIcon(MoonIcon);
    }

    // Set inspirational message based on role and day
    const messages = {
      ADMIN: [
        'Hãy dẫn dắt đội ngũ đạt được những thành tựu tuyệt vời!',
        'Một ngày mới, những cơ hội mới để phát triển công ty!',
        'Quản lý hiệu quả là chìa khóa thành công!',
        'Hôm nay hãy tạo ra những quyết định sáng suốt!'
      ],
      HR: [
        'Hãy tìm kiếm những tài năng xuất sắc nhất!',
        'Mỗi ứng viên đều là một cơ hội để xây dựng đội ngũ mạnh mẽ!',
        'Hôm nay hãy kết nối với những tài năng tiềm năng!',
        'Xây dựng văn hóa công ty tích cực bắt đầu từ bạn!',
        'Chúc bạn một ngày tuyển dụng hiệu quả!'
      ]
    };

    const roleMessages = messages[user?.role?.name as keyof typeof messages] || messages.HR;
    const randomMessage = roleMessages[Math.floor(Math.random() * roleMessages.length)];
    setInspirationalMessage(randomMessage);

  }, [user?.role?.name]);

  const isHR = user?.role?.name === 'HR';
  const isAdmin = user?.role?.name === 'ADMIN';
  const basePath = user?.role?.name === 'ADMIN' ? '/admin' : user?.role?.name === 'HR' ? '/hr' : '/';

  const getRoleDisplayName = () => {
    if (isAdmin) return 'Admin';
    if (isHR) return user?.company?.name ? `HR công ty ${user.company.name}` : 'HR';
    return user?.name || 'User';
  };

  const IconComponent = greetingIcon;

  return (
    <header className="bg-white shadow-sm py-3 px-6 flex justify-between items-center">
      {/* Enhanced Greeting Card */}
      <div className="flex-1 mr-4">
        <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-xl p-4 border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center space-x-3">
            {/* Icon và Emoji */}
            <div className="flex items-center space-x-2">
              {IconComponent && (
                <IconComponent className="h-6 w-6 text-blue-500" />
              )}
              <span className="text-2xl">{greetingEmoji}</span>
            </div>
            
            {/* Main Greeting */}
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-gray-800">
                  {greeting}, {getRoleDisplayName()}
                </h2>
                {(isHR || isAdmin) && <SparklesIcon className="h-5 w-5 text-amber-500" />}
              </div>
              
              {/* Inspirational Message */}
              <p className="text-sm text-gray-600 mt-1 flex items-center">
                <span className="mr-2">💪</span>
                {inspirationalMessage}
              </p>
              
              {/* Role Badge */}
              {(isHR || isAdmin) && (
                <div className="mt-2 flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isAdmin 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {isAdmin ? '👑 Administrator' : '🏢 Human Resources'}
                  </span>
                  
                  {/* Weather-like status */}
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <span className="mr-1">🚀</span>
                    Sẵn sàng làm việc
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center">
        {/* User Menu */}
        <Menu as="div" className="relative ml-3">
          <Menu.Button className="flex rounded-full bg-white focus:outline-none hover:bg-gray-50 transition-colors duration-200">
            <span className="sr-only">Open user menu</span>
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg">
              {user?.name ? (
                <span className="text-sm font-semibold">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </span>
              ) : (
                <UserCircleIcon className="h-6 w-6" />
              )}
            </div>
          </Menu.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-lg bg-white py-2 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-100">
              {/* User Info Header */}
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  isAdmin 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  {user?.role?.name || 'User'}
                </span>
              </div>

              <Menu.Item>
                {({ active }) => (
                  <Link
                    to={`${basePath}/profile`}
                    className={`${active ? 'bg-blue-50 text-blue-700' : 'text-gray-700'} flex items-center px-4 py-3 text-sm transition-colors duration-150`}
                  >
                    <UserCircleIcon className="h-5 w-5 mr-3 text-gray-400" />
                    Hồ sơ của tôi
                  </Link>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <Link
                    to="#"
                    className={`${active ? 'bg-blue-50 text-blue-700' : 'text-gray-700'} flex items-center px-4 py-3 text-sm transition-colors duration-150`}
                  >
                    <Cog6ToothIcon className="h-5 w-5 mr-3 text-gray-400" />
                    Cài đặt
                  </Link>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={handleLogout}
                    className={`${active ? 'bg-red-50 text-red-700' : 'text-gray-700'} flex w-full items-center px-4 py-3 text-sm transition-colors duration-150`}
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3 text-gray-400" />
                    Đăng xuất
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </header>
  );
};

export default Header;