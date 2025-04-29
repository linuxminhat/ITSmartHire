import React from 'react';
import { Link } from 'react-router-dom';

const UserFooter: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-gray-400 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">IT Smart Hire</h3>
            <p className="text-sm">
              Kết nối nhà tuyển dụng và ứng viên tiềm năng trong lĩnh vực Công nghệ thông tin.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/jobs" className="hover:text-white">Tìm việc làm</Link></li>
              <li><Link to="/companies" className="hover:text-white">Danh sách công ty</Link></li>
              <li><Link to="/about" className="hover:text-white">Về chúng tôi</Link></li> 
              <li><Link to="/contact" className="hover:text-white">Liên hệ</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Liên hệ</h3>
            <ul className="space-y-2 text-sm">
              <li>Địa chỉ: 123 Đường ABC, Quận XYZ, Thành phố HCM</li>
              <li>Email: contact@itsmarthire.vn</li>
              <li>Điện thoại: 0123 456 789</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm">
          &copy; {new Date().getFullYear()} IT Smart Hire. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default UserFooter; 