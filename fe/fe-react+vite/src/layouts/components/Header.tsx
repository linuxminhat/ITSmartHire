import React, { Fragment, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { useAuthActions } from '@/contexts/AuthActionContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  UserCircleIcon, 
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const Header: React.FC = () => {
  const { handleLogout } = useAuthActions();
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Chào buổi sáng');
    else if (hour < 18) setGreeting('Chào buổi chiều');
    else setGreeting('Chào buổi tối');
  }, []);

  const isHR = user?.role?.name === 'HR';
  const basePath = user?.role?.name === 'ADMIN' ? '/admin' : user?.role?.name === 'HR' ? '/hr' : '/';

  return (
    <header className="bg-white shadow-sm py-3 px-6 flex justify-between items-center">
      <div>
        <h2 className="text-lg font-semibold text-gray-700">{greeting}, {user?.name || 'Admin'}</h2>
        <p className="text-sm text-gray-500">Chúc bạn một ngày làm việc hiệu quả</p>
      </div>

      <div className="flex items-center">
        {/* User Menu */}
        <Menu as="div" className="relative ml-3">
          <Menu.Button className="flex rounded-full bg-white focus:outline-none">
            <span className="sr-only">Open user menu</span>
            <div className="h-8 w-8 rounded-full bg-slate-200 text-gray-600 flex items-center justify-center hover:bg-slate-300">
              <UserCircleIcon className="h-6 w-6" />
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
            <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <Menu.Item>
                {({ active }) => (
                  <Link
                    to={`${basePath}/profile`}
                    className={`${active ? 'bg-gray-100' : ''} flex items-center px-4 py-2 text-sm text-gray-700`}
                  >
                    <UserCircleIcon className="h-5 w-5 mr-2 text-gray-500" />
                    Hồ sơ của tôi
                  </Link>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <Link
                    to="#"
                    className={`${active ? 'bg-gray-100' : ''} flex items-center px-4 py-2 text-sm text-gray-700`}
                  >
                    <Cog6ToothIcon className="h-5 w-5 mr-2 text-gray-500" />
                    Cài đặt
                  </Link>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={handleLogout}
                    className={`${active ? 'bg-gray-100' : ''} flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2 text-gray-500" />
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