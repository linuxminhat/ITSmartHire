import React, { useState, useEffect, Fragment } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthActions } from '@/contexts/AuthActionContext';
import { callFetchAllSkills } from '@/services/skill.service';
import { callFetchAllCategories } from '@/services/category.service';
import { ISkill, ICategory } from '@/types/backend';
import { createPortal } from 'react-dom';
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  Squares2X2Icon,
  DocumentArrowUpIcon,
  IdentificationIcon,
  BriefcaseIcon,
  EnvelopeOpenIcon,
  EnvelopeIcon,
  Cog6ToothIcon,
  BuildingOffice2Icon,
  TagIcon,
  RectangleStackIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import NotificationIcon from '@/components/user/notifications/NotificationIcon';
import { Transition } from '@headlessui/react';

const UserHeader: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { handleLogout } = useAuthActions();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isJobMenuOpen, setIsJobMenuOpen] = useState(false);
  const [skills, setSkills] = useState<ISkill[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoadingSkills, setIsLoadingSkills] = useState<boolean>(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const closeTimer = React.useRef<number | null>(null);
  const [isBlogMenuOpen, setIsBlogMenuOpen] = useState(false);
  const blogCloseTimer = React.useRef<number | null>(null);
  const openBlogMenu = () => {
    if (blogCloseTimer.current) clearTimeout(blogCloseTimer.current);
    setIsBlogMenuOpen(true);
  };

  const closeBlogMenu = () => {
    blogCloseTimer.current = window.setTimeout(() => {
      setIsBlogMenuOpen(false);
    }, 200);
  };
  const BLOG_TAGS = [
    'Sự nghiệp IT',
    'Ứng tuyển và thăng tiến',
    'Chuyên môn IT',
    'Chuyện IT',
    'Quảng bá công ty'
  ];
  const openMenu = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
    }
    setIsJobMenuOpen(true)
  }

  const closeMenu = () => {
    closeTimer.current = window.setTimeout(() => {
      setIsJobMenuOpen(false)
    }, 200)
  }
  useEffect(() => {
    const fetchData = async () => {
      // Fetch Skills
      setIsLoadingSkills(true);
      try {
        const skillRes: any = await callFetchAllSkills();
        console.log("Raw Skill Response:", skillRes);
        const skillsArray = skillRes?.data?.result;

        if (skillsArray && Array.isArray(skillsArray)) {
          setSkills(skillsArray);
        } else {
          console.error("Skills array could not be extracted. Check Raw Skill Response log.");
          setSkills([]);
        }
      } catch (error) {
        console.error("Failed to fetch skills:", error);
        setSkills([]);
      } finally {
        setIsLoadingSkills(false);
      }

      // Fetch Categories
      setIsLoadingCategories(true);
      try {
        const categoryRes: any = await callFetchAllCategories();
        console.log("Raw Category Response:", categoryRes);
        const categoriesArray = categoryRes?.data?.result;

        if (categoriesArray && Array.isArray(categoriesArray)) {
          setCategories(categoriesArray);
        } else {
          console.error("Categories array could not be extracted. Check Raw Category Response log.");
          setCategories([]);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchData();
  }, []);

  const role = user?.role?.name;
  const profilePath = role === 'ADMIN' ? '/admin/profile' : role === 'HR' ? '/hr/profile' : '/profile';
  const isStandardUser = role !== 'ADMIN' && role !== 'HR';

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-indigo-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`;

  const mobileNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-indigo-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`;

  const userMenuItemClass = "flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100";
  const userMenuIconClass = "h-5 w-5 mr-3 text-gray-500";

  const jobMenuItemClass = "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100";
  const jobSubMenuItemClass = "block px-2 py-1.5 text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-md truncate";

  const updateMenuPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY,
        right: window.innerWidth - rect.right
      });
    }
  };

  useEffect(() => {
    if (isUserMenuOpen) {
      updateMenuPosition();
      window.addEventListener('scroll', updateMenuPosition);
      window.addEventListener('resize', updateMenuPosition);
    }
    return () => {
      window.removeEventListener('scroll', updateMenuPosition);
      window.removeEventListener('resize', updateMenuPosition);
    };
  }, [isUserMenuOpen]);

  const renderUserMenu = () => {
    if (!isUserMenuOpen) return null;

    return createPortal(
      <div
        className="fixed z-[9999] shadow-lg"
        style={{
          top: `${menuPosition.top}px`,
          right: `${menuPosition.right}px`,
          maxHeight: 'calc(100vh - ${menuPosition.top}px)',
          overflowY: 'auto'
        }}
      >
        <div
          className="w-56 rounded-md bg-white py-1 ring-1 ring-black ring-opacity-5 focus:outline-none"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="user-menu-button"
          onMouseLeave={() => setIsUserMenuOpen(false)}
        >
          {isStandardUser && (
            <>
              <Link to="/dashboard" className={userMenuItemClass} role="menuitem" onClick={() => setIsUserMenuOpen(false)}>
                <Squares2X2Icon className={userMenuIconClass} /> Tổng quan
              </Link>
              <Link to="/resumes/attached" className={userMenuItemClass} role="menuitem" onClick={() => setIsUserMenuOpen(false)}>
                <DocumentArrowUpIcon className={userMenuIconClass} /> Hồ sơ đính kèm
              </Link>
              <Link to="/profile" className={userMenuItemClass} role="menuitem" onClick={() => setIsUserMenuOpen(false)}>
                <IdentificationIcon className={userMenuIconClass} /> Hồ sơ
              </Link>
              <Link to="/jobs/applied" className={userMenuItemClass} role="menuitem" onClick={() => setIsUserMenuOpen(false)}>
                <BriefcaseIcon className={userMenuIconClass} /> Việc làm của tôi
              </Link>
              <Link to="/notifications" className={userMenuItemClass} role="menuitem" onClick={() => setIsUserMenuOpen(false)}>
                <div className="flex items-center">
                  <BellIcon className={userMenuIconClass} />
                  <span className="flex-grow">Thông báo</span>
                  <NotificationIcon showBadgeOnly={true} showIconOnly={false} />
                </div>
              </Link>
            </>
          )}
          {!isStandardUser && (
            <Link
              to={profilePath}
              className={userMenuItemClass}
              role="menuitem"
              onClick={() => setIsUserMenuOpen(false)}
            >
              <UserCircleIcon className={userMenuIconClass} /> Hồ sơ người dùng
            </Link>
          )}
          {!isStandardUser && <div className="my-1 border-t border-gray-100"></div>}
          <button
            onClick={() => { handleLogout(); setIsUserMenuOpen(false); }}
            className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            role="menuitem"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3 text-red-500" />
            Đăng xuất
          </button>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <nav className="bg-gray-800 shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-white font-bold text-xl">
              IT Smart Hire
            </Link>
          </div>

          {/* Desktop Menu Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {/* Job Menu Dropdown */}
              <div
                className="relative"
                onMouseEnter={openMenu}
                onMouseLeave={closeMenu}
              >
                <button
                  type="button"
                  onMouseEnter={openMenu}
                  onClick={() => setIsJobMenuOpen(!isJobMenuOpen)}
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none"
                >
                  Việc làm IT
                  <ChevronDownIcon className={`h-4 w-4 ml-1 transition-transform ${isJobMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {isJobMenuOpen && (
                  <div
                    className="absolute left-0 mt-2 w-[32rem] origin-top-left rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-[9999] flex"
                    role="menu"
                    aria-orientation="vertical"
                    style={{ position: 'absolute' }}
                    onMouseEnter={openMenu}
                    onMouseLeave={closeMenu}
                  >
                    <div className="w-1/2 border-r border-gray-100">
                      <NavLink
                        to="/jobs"
                        className={({ isActive }) => `${jobMenuItemClass} ${isActive ? 'bg-gray-100 font-medium' : ''}`}
                        role="menuitem"
                        onClick={() => setIsJobMenuOpen(false)}
                      >
                        Tất cả việc làm
                      </NavLink>
                      <div className="mt-1 pt-1">
                        <span className="block px-4 pt-2 pb-1 text-xs text-gray-500 font-semibold uppercase flex items-center">
                          <RectangleStackIcon className="h-4 w-4 mr-1.5" /> Việc làm theo Danh mục
                        </span>
                        {isLoadingCategories ? (
                          <div className="px-4 py-2 text-sm text-gray-500">Đang tải...</div>
                        ) : categories.length > 0 ? (
                          <div className="max-h-[60vh] overflow-y-auto px-2 py-1">
                            {categories.map(category => (
                              <Link
                                key={category._id}
                                to={`/jobs/by-category/${category._id}`}
                                className={jobSubMenuItemClass}
                                title={category.name}
                                role="menuitem"
                                onClick={() => setIsJobMenuOpen(false)}
                              >
                                {category.name}
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <div className="px-4 py-2 text-sm text-gray-500">Không có danh mục.</div>
                        )}
                      </div>
                    </div>

                    <div className="w-1/2">
                      <div className="mt-1 pt-1">
                        <span className="block px-4 pt-2 pb-1 text-xs text-gray-500 font-semibold uppercase flex items-center">
                          <TagIcon className="h-4 w-4 mr-1.5" /> Việc làm theo Kỹ năng
                        </span>
                        {isLoadingSkills ? (
                          <div className="px-4 py-2 text-sm text-gray-500">Đang tải...</div>
                        ) : skills.length > 0 ? (
                          <div className="max-h-[60vh] overflow-y-auto px-2 py-1">
                            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                              {skills.map(skill => (
                                <Link
                                  key={skill._id}
                                  to={`/jobs/skill/${skill._id}`}
                                  className={jobSubMenuItemClass}
                                  title={skill.name}
                                  role="menuitem"
                                  onClick={() => setIsJobMenuOpen(false)}
                                >
                                  {skill.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="px-4 py-2 text-sm text-gray-500">Không có kỹ năng.</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <NavLink to="/companies" className={navLinkClasses}>Công ty</NavLink>
              <div
                className="relative"
                onMouseEnter={openBlogMenu}
                onMouseLeave={closeBlogMenu}
              >
                <button
                  type="button"
                  onClick={() => setIsBlogMenuOpen(!isBlogMenuOpen)}
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none"
                >
                  Blog về IT
                  <ChevronDownIcon
                    className={`h-4 w-4 ml-1 transition-transform ${isBlogMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isBlogMenuOpen && (
                  <div
                    className="absolute left-0 mt-2 w-48 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-[9999]"
                    role="menu"
                    aria-orientation="vertical"
                    onMouseEnter={openBlogMenu}
                    onMouseLeave={closeBlogMenu}
                  >
                    {BLOG_TAGS.map(tag => (
                      <Link
                        key={tag}
                        to={`/blog?tag=${encodeURIComponent(tag)}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <NavLink to="/mockinterview" className={navLinkClasses}>Phỏng vấn bằng AI</NavLink>
              <NavLink to="/mockinterview" className={navLinkClasses}>Viết CV bằng AI</NavLink>
            </div>
          </div>

          {/* Right side - Auth Buttons / User Menu */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {isAuthenticated && user ? (
                <div className="relative ml-3">
                  <button
                    ref={buttonRef}
                    type="button"
                    className="flex max-w-xs items-center rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                    id="user-menu-button"
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="true"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  >
                    <span className="sr-only">Open user menu</span>
                    <UserCircleIcon className="h-8 w-8 text-gray-400" />
                    <span className='text-white ml-2 mr-1 text-sm hidden sm:inline'>{user.name}</span>
                    <ChevronDownIcon className='h-4 w-4 text-gray-400' />
                  </button>
                  {renderUserMenu()}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                    Đăng nhập
                  </Link>
                  <Link to="/register" className="bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium">
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="-mr-2 flex md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden`} id="mobile-menu">
        <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
          {/* Mobile Job Links */}
          <NavLink to="/jobs" className={mobileNavLinkClasses} onClick={() => setIsMobileMenuOpen(false)}>Tất cả việc làm</NavLink>
          {/* TODO: Add Mobile Skill/Category Links Here */}
          <NavLink to="/companies" className={mobileNavLinkClasses} onClick={() => setIsMobileMenuOpen(false)}>Công ty</NavLink>
        </div>
        {/* Rest of mobile menu auth section */}
        <div className="border-t border-gray-700 pb-3 pt-4">
          {isAuthenticated && user ? (
            <>
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  <UserCircleIcon className="h-10 w-10 text-gray-400" />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium leading-none text-white">{user.name}</div>
                  <div className="text-sm font-medium leading-none text-gray-400">{user.email}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1 px-2">
                {isStandardUser && (
                  <>
                    <Link to="/dashboard" className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Tổng quan</Link>
                    <Link to="/resumes/attached" className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Hồ sơ đính kèm</Link>
                    <Link to="/profile" className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Hồ sơ ITviec</Link>
                    <Link to="/jobs/applied" className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Việc làm của tôi</Link>
                  </>
                )}
                {!isStandardUser && (
                  <Link
                    to={profilePath}
                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Hồ sơ
                  </Link>
                )}
                <button
                  onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                  className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-red-400 hover:bg-gray-700 hover:text-white"
                >
                  Đăng xuất
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-1 px-2">
              <Link
                to="/login"
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="block rounded-md px-3 py-2 text-base font-medium text-indigo-400 hover:bg-gray-700 hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default UserHeader;